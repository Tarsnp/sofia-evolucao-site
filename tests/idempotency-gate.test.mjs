const classify = (row, input) => {
  const result = row?.result ?? {};
  const eventId = result.google_event_id ?? result.appointment_result?.google_event_id ?? null;
  const reuse = row?.status === 'verified' && Boolean(eventId);
  return {
    tenant_id: input.tenant_id,
    idempotency_key: input.idempotency_key,
    work_item_id: row?.work_item_id ?? null,
    idempotency_reuse: reuse,
    next_step: reuse ? 'reuse_verified_result' : 'create_and_verify_calendar_event',
  };
};

const input = { tenant_id: 'tenant-a', idempotency_key: 'appointment:abc-001' };
const fresh = classify({ work_item_id: 'wi-fresh', status: 'created', result: null }, input);
const verified = classify({ work_item_id: 'wi-verified', status: 'verified', result: { google_event_id: 'gcal-123' } }, input);

if (fresh.idempotency_reuse !== false || fresh.next_step !== 'create_and_verify_calendar_event') {
  throw new Error(`fresh path failed: ${JSON.stringify(fresh)}`);
}
if (verified.idempotency_reuse !== true || verified.next_step !== 'reuse_verified_result') {
  throw new Error(`reuse path failed: ${JSON.stringify(verified)}`);
}

// Simula a reserva atomica (claim) tal como o Postgres a garante via
// INSERT ... ON CONFLICT (tenant_id, idempotency_key) DO NOTHING RETURNING work_item_id.
// A tabela e um Map single-threaded, mas o ponto critico e nunca deixar duas
// "execucoes" decidirem com base num estado lido ANTES de qualquer escrita
// (que era exatamente o bug: SELECT simples seguido de decisao, sem reserva).
function makeStore() {
  const rows = new Map();
  let nextId = 1;
  return {
    // Equivalente a: INSERT ... ON CONFLICT (tenant_id, idempotency_key) DO NOTHING RETURNING *
    claim(tenantId, idempotencyKey) {
      const key = `${tenantId}::${idempotencyKey}`;
      if (rows.has(key)) return null; // ON CONFLICT DO NOTHING -> RETURNING vazio
      const row = { work_item_id: `wi-${nextId++}`, tenant_id: tenantId, idempotency_key: idempotencyKey, status: 'running', result: null };
      rows.set(key, row);
      return row; // RETURNING * -> esta execucao ganhou
    },
    // Equivalente a: UPDATE ... WHERE status IN ('failed','cancelled','expired') RETURNING *
    claimRetry(tenantId, idempotencyKey) {
      const key = `${tenantId}::${idempotencyKey}`;
      const row = rows.get(key);
      if (!row) return null;
      if (!['failed', 'cancelled', 'expired'].includes(row.status)) return null;
      row.status = 'running';
      return row;
    },
    read(tenantId, idempotencyKey) {
      return rows.get(`${tenantId}::${idempotencyKey}`) ?? null;
    },
    count(tenantId, idempotencyKey) {
      return rows.has(`${tenantId}::${idempotencyKey}`) ? 1 : 0;
    },
  };
}

// Simula N execucoes concorrentes que TODAS decidem simultaneamente antes de
// qualquer uma escrever (pior caso possivel da race condition original):
// todas avaliam "nao existe ainda" e so DEPOIS tentam reivindicar.
function runConcurrentClaims(store, tenantId, idempotencyKey, n) {
  // fase 1: todas "veem" o estado inicial ao mesmo tempo (sem reserva ainda)
  const sawNothing = Array.from({ length: n }, () => store.read(tenantId, idempotencyKey) === null);
  // fase 2: todas tentam reivindicar - so o Postgres (aqui, o Map + unique key) deixa uma ganhar
  const results = sawNothing.map(() => store.claim(tenantId, idempotencyKey));
  return results;
}

const raceStore = makeStore();
const raceTenant = 'tenant-race';
const raceKey = 'appointment:race-001';
const raceResults = runConcurrentClaims(raceStore, raceTenant, raceKey, 5);
const winners = raceResults.filter((r) => r !== null);
const losers = raceResults.filter((r) => r === null);

if (winners.length !== 1) {
  throw new Error(`race condition test failed: esperava exatamente 1 vencedor entre 5 tentativas simultaneas, obteve ${winners.length}`);
}
if (losers.length !== 4) {
  throw new Error(`race condition test failed: esperava 4 tentativas rejeitadas, obteve ${losers.length}`);
}
if (raceStore.count(raceTenant, raceKey) !== 1) {
  throw new Error(`race condition test failed: esperava exatamente 1 Work Item persistido, obteve ${raceStore.count(raceTenant, raceKey)}`);
}

// Confirma que, apos a reivindicacao vencedora, uma NOVA rajada de tentativas
// concorrentes (ex: retries do Kernel) continua a nao criar segundo Work Item,
// e que o estado 'running' cai no caminho "em processamento", nao em duplicacao.
const raceResultsSegunda = runConcurrentClaims(raceStore, raceTenant, raceKey, 3);
if (raceResultsSegunda.some((r) => r !== null)) {
  throw new Error('race condition test failed: uma segunda rajada apos o vencedor nao deveria conseguir reivindicar');
}
const estadoAposRace = raceStore.read(raceTenant, raceKey);
const classificacaoAposRace = classify(estadoAposRace, { tenant_id: raceTenant, idempotency_key: raceKey });
if (classificacaoAposRace.idempotency_reuse !== false) {
  throw new Error(`race condition test failed: status 'running' nao deveria classificar como reuse: ${JSON.stringify(classificacaoAposRace)}`);
}
// Um Work Item 'running' (nao verified) que perdeu a reivindicacao deve ficar
// marcado como "em processamento", nunca proceder para criar um segundo evento.
if (estadoAposRace.status !== 'running') {
  throw new Error(`race condition test failed: estado inesperado apos a reivindicacao vencedora: ${estadoAposRace.status}`);
}

// Retry apos falha: simula um Work Item que terminou 'failed' e confirma que
// a reivindicacao de retry (compare-and-swap) tambem so deixa UM vencedor.
const retryStore = makeStore();
const retryTenant = 'tenant-retry';
const retryKey = 'appointment:retry-001';
retryStore.claim(retryTenant, retryKey);
const rowParaFalhar = retryStore.read(retryTenant, retryKey);
rowParaFalhar.status = 'failed';

const retryAttempts = Array.from({ length: 4 }, () => retryStore.claimRetry(retryTenant, retryKey));
const retryWinners = retryAttempts.filter((r) => r !== null);
if (retryWinners.length !== 1) {
  throw new Error(`retry race test failed: esperava exatamente 1 vencedor do retry entre 4 tentativas, obteve ${retryWinners.length}`);
}
if (retryStore.read(retryTenant, retryKey).status !== 'running') {
  throw new Error('retry race test failed: apos o retry vencedor, o estado deveria ser running');
}

console.log(JSON.stringify({
  ok: true,
  fresh,
  verified,
  race: { winners: winners.length, losers: losers.length, rowsPersisted: raceStore.count(raceTenant, raceKey) },
  raceSegunda: { winners: raceResultsSegunda.filter((r) => r !== null).length },
  retryRace: { winners: retryWinners.length, estadoFinal: retryStore.read(retryTenant, retryKey).status },
}, null, 2));
