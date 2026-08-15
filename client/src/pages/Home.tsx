import { useEffect, useState } from "react";
import { ArrowDown, ArrowUpRight, Check, ChevronRight, CircleDot, Menu, X, Zap } from "lucide-react";

const heroImage = "/manus-storage/sofia-hero_cb2fd749.jpg";
const architectureImage = "/manus-storage/sofia-architecture_a9f5d9c2.jpg";
const roadmapImage = "/manus-storage/sofia-roadmap_43d7f4e2.jpg";
const brandLockup = "/manus-storage/laborya-lockup-dark_632ac8e0.svg";
const brandMark = "/manus-storage/laborya-mark_4f93bd3f.svg";

const workLoop = [
  ["01", "Compreender", "Interpretar mensagem, evento, cliente e contexto."],
  ["02", "Decidir", "Escolher plano, ferramenta e nível de autonomia."],
  ["03", "Executar", "Usar Tools autorizadas através do n8n."],
  ["04", "Verificar", "Confirmar que a ação aconteceu realmente."],
  ["05", "Reportar", "Informar o cliente ou escalar a exceção."],
];

const layers = [
  ["01", "Work Item Engine", "Dar visibilidade", "Estado, prioridade, SLA, dependências e auditoria."],
  ["02", "Policy & Risk", "Dar limites", "Executar, condicionar, aprovar ou bloquear."],
  ["03", "Tool Runtime", "Dar controlo", "Contratos tipados, permissões e pós-condições."],
  ["04", "Verification Layer", "Dar confiança", "Confirmar o efeito no sistema externo."],
];

const tomorrow = [
  ["Manhã", "Mapear", "Fluxo atual, schema mínimo e estados do Work Item."],
  ["Meio do dia", "Definir", "Contratos, permissões, precondições e pós-condições."],
  ["Tarde", "Prototipar", "Marcação com confirmação, criação e verificação."],
  ["Encerramento", "Decidir", "Evidências, falhas e próximo piloto."],
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("visao");

  useEffect(() => {
    const elements = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      });
    }, { threshold: 0.12 });
    elements.forEach((el) => observer.observe(el));

    const sections = Array.from(document.querySelectorAll("section[id]"));
    const sectionObserver = new IntersectionObserver((entries) => {
      const visible = entries.find((entry) => entry.isIntersecting);
      if (visible?.target.id) setActive(visible.target.id);
    }, { rootMargin: "-30% 0px -55% 0px", threshold: 0 });
    sections.forEach((section) => sectionObserver.observe(section));

    return () => { observer.disconnect(); sectionObserver.disconnect(); };
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <main className="site-shell">
      <header className="site-header">
        <a className="brand" href="#visao" onClick={closeMenu} aria-label="LABORYA — Sofia, início">
          <img src={brandLockup} alt="LABORYA" className="brand-lockup" />
          <span className="brand-product">SOFIA / DIGITAL WORKER</span>
        </a>
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menu">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <nav className={menuOpen ? "main-nav is-open" : "main-nav"} aria-label="Navegação principal">
          {["visao", "work-loop", "arquitetura", "piloto", "amanha"].map((item) => (
            <a key={item} className={active === item ? "active" : ""} href={`#${item}`} onClick={closeMenu}>
              {item === "work-loop" ? "Work Loop" : item === "amanha" ? "Amanhã" : item.charAt(0).toUpperCase() + item.slice(1)}
            </a>
          ))}
          <a className="nav-cta" href="#piloto" onClick={closeMenu}>Ver o piloto <ArrowUpRight size={15} /></a>
        </nav>
      </header>

      <section id="visao" className="hero-section">
        <div className="hero-image" style={{ backgroundImage: `url(${heroImage})` }} />
        <div className="hero-grid" />
        <div className="hero-content reveal">
          <p className="eyebrow"><span className="pulse" /> SOFIA · DIGITAL WORKER DA LABORYA</p>
          <h1>Não recomeçamos.<br /><em>Adicionamos controlo.</em></h1>
          <p className="hero-lede">A Sofia já é o motor. Agora vamos torná-la uma Digital Worker capaz de transformar pedidos em trabalho executado, verificado e supervisionado.</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#piloto">Explorar o primeiro piloto <ArrowUpRight size={17} /></a>
            <a className="button button-ghost" href="#arquitetura">Ver a arquitetura <ChevronRight size={17} /></a>
          </div>
        </div>
        <div className="hero-note"><span>01</span><span>Preservar a base</span><span>→</span><span>Dar visibilidade</span></div>
        <a className="scroll-cue" href="#work-loop"><ArrowDown size={17} /> descer para explorar</a>
      </section>

      <section className="statement-section reveal">
        <div className="section-marker">/ 01 — MUDANÇA DE FOCO</div>
        <div className="statement-layout">
          <h2>De uma caixa de entrada inteligente para um <span>sistema operativo de trabalho.</span></h2>
          <div className="statement-copy"><p>O produto principal não é a conversa no WhatsApp. É o motor que transforma mensagens, eventos e sinais operacionais em trabalho concluído e verificado.</p><p className="mono-note">// A unidade central passa a ser o Work Item.</p></div>
        </div>
      </section>

      <section id="work-loop" className="section section-dark">
        <div className="section-inner">
          <div className="section-heading reveal"><div><div className="section-marker">/ 02 — MÉTODO</div><h2>O Work Loop dá<br /><span>confiabilidade</span> à autonomia.</h2></div><p>Uma Sofia autónoma não deve apenas responder. Deve conduzir o trabalho até um resultado confirmado.</p></div>
          <div className="loop-line reveal">
            {workLoop.map(([number, title, text], index) => <div className={`loop-step ${index === 3 ? "highlight" : ""}`} key={number}><div className="loop-node">{number}</div><div className="mono-label">{title.toUpperCase()}</div><h3>{title}</h3><p>{text}</p></div>)}
          </div>
          <div className="principle reveal"><Zap size={18} /><span>Princípio</span><strong>Executar não é o mesmo que concluir.</strong> Trabalho concluído significa ação executada e resultado verificado.</div>
        </div>
      </section>

      <section id="arquitetura" className="section architecture-section">
        <div className="section-inner">
          <div className="section-heading reveal"><div><div className="section-marker">/ 03 — ARQUITETURA</div><h2>Não trocamos o motor.<br /><span>Adicionamos camadas.</span></h2></div><p>O Kernel, o n8n, as Tools e o Postgres continuam a ser a fundação. A nova arquitetura torna explícito o estado, a política, a execução e a verificação.</p></div>
          <div className="architecture-layout reveal"><div className="architecture-visual" style={{ backgroundImage: `url(${architectureImage})` }}><div className="visual-caption"><span>01 / 04</span><span>camadas de controlo</span></div></div><div className="layer-list">{layers.map(([number, title, tag, text]) => <div className="layer-item" key={number}><span className="layer-number">{number}</span><div><div className="mono-label">{tag}</div><h3>{title}</h3><p>{text}</p></div><ArrowUpRight className="layer-arrow" size={19} /></div>)}</div></div>
        </div>
      </section>

      <section className="section workitem-section reveal"><div className="section-inner"><div className="section-marker">/ 04 — UNIDADE DE TRABALHO</div><div className="workitem-layout"><div><h2>Cada ação passa a ter <span>estado.</span></h2><p>O Work Item regista o objetivo, o contexto, a prioridade, as permissões, o plano, o resultado e a evidência. A Sofia sabe o que está a fazer e como provar que terminou.</p><a href="#piloto" className="text-link">Ver o fluxo em ação <ArrowUpRight size={16} /></a></div><div className="workitem-terminal"><div className="terminal-top"><span /><span /><span /><em>work_item / create</em></div><div className="terminal-body"><div><i>objective</i> <b>"marcar serviço"</b></div><div><i>status</i> <strong>"waiting_confirmation"</strong></div><div><i>permission</i> <b>"agenda.write"</b></div><div><i>verification</i> <strong>"required"</strong></div><div><i>idempotency</i> <b>"sofia_8f92..."</b></div><div className="terminal-cursor">▮</div></div></div></div></div></section>

      <section id="piloto" className="section section-dark pilot-section">
        <div className="section-inner"><div className="section-heading reveal"><div><div className="section-marker">/ 05 — PRIMEIRO PILOTO</div><h2>Pequeno.<br /><span>Comprovável.</span></h2></div><p>Um único fluxo crítico para provar o padrão: marcação com confirmação, criação do evento e verificação no Calendar.</p></div>
          <div className="pilot-flow reveal">{[["01", "Receber", "interpretar a intenção"], ["02", "Registar", "criar o Work Item"], ["03", "Consultar", "ver disponibilidade"], ["04", "Confirmar", "criar e reler Calendar"], ["05", "Fechar", "enviar evidência"]].map(([n, t, d]) => <div className="pilot-step" key={n}><div className="pilot-number">{n}</div><h3>{t}</h3><p>{d}</p></div>)}</div>
          <div className="pilot-tests reveal"><div><CircleDot size={18} /><span><b>Teste de confiança</b> repetir a mesma mensagem não cria uma segunda marcação.</span></div><div><CircleDot size={18} /><span><b>Teste de falha</b> timeout ou indisponibilidade gera estado observável.</span></div></div>
        </div>
      </section>

      <section id="amanha" className="section tomorrow-section"><div className="section-inner"><div className="section-heading reveal"><div><div className="section-marker">/ 06 — PLANO DE EXECUÇÃO</div><h2>Amanhã, <span>provamos.</span></h2></div><p>Um dia de trabalho para envolver um fluxo existente com controlo explícito — não para reescrever toda a Sofia.</p></div><div className="tomorrow-grid reveal">{tomorrow.map(([time, title, text], index) => <div className="tomorrow-item" key={time}><div className="tomorrow-top"><span>0{index + 1}</span><span>{time}</span></div><h3>{title}</h3><p>{text}</p></div>)}</div><div className="tomorrow-result reveal"><Check size={20} /><div><span>Resultado esperado</span><strong>Uma primeira unidade de trabalho criada, executada, verificada e auditável.</strong></div></div></div></section>

      <section className="roadmap-section reveal"><div className="roadmap-bg" style={{ backgroundImage: `url(${roadmapImage})` }} /><div className="roadmap-inner"><div className="section-marker">/ 07 — HORIZONTE</div><h2>A visão de longo prazo<br /><span>continua intacta.</span></h2><p>Da Sofia Controlada à Equipa Digital: cada fase acrescenta autonomia sobre uma fundação comprovada.</p><div className="roadmap-steps">{[["01", "Sofia Controlada"], ["02", "Sofia Proativa"], ["03", "Digital Twin"], ["04", "Equipa Digital"]].map(([n, t]) => <div key={n}><span>{n}</span><strong>{t}</strong></div>)}</div></div></section>

      <section className="closing-section"><div className="closing-inner"><img src={brandMark} alt="" /><div className="section-marker">LABORYA · AUTONOMOUS DIGITAL WORKERS FOR SMBs</div><h2>A Sofia já é o motor.<br /><span>Agora damos-lhe controlo.</span></h2><a className="button button-primary" href="#visao">Voltar ao início <ArrowUpRight size={17} /></a></div></section>

      <footer className="site-footer"><span>© 2026 LABORYA</span><span>SOFIA / EVOLUÇÃO INCREMENTAL</span><a href="/sofia-para-negocios">Sofia para negócios <ArrowUpRight size={13} /></a><a href="https://www.uselaborya.com/" target="_blank" rel="noreferrer">uselaborya.com <ArrowUpRight size={13} /></a></footer>
    </main>
  );
}
