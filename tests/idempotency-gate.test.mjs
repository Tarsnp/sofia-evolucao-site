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

console.log(JSON.stringify({ ok: true, fresh, verified }, null, 2));
