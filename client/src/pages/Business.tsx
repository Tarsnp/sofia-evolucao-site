/* LABORYA Editorial System — página comercial Sofia para SMBs: promessa concreta, prova operacional, supervisão e conversão sem testemunhos inventados. */
import { FormEvent, useState } from "react";
import { ArrowRight, Check, ChevronDown, Clock3, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

const heroImage = "/manus-storage/sofia-hero_cb2fd749.jpg";
const mark = "/manus-storage/laborya-mark_4f93bd3f.svg";

const useCases = [
  { label: "Salões & estética", title: "Menos pedidos esquecidos.", text: "Responde sobre serviços, consulta disponibilidade, confirma marcações e mantém o follow-up em movimento.", icon: MessageCircle },
  { label: "Clínicas", title: "Mais organização no primeiro contacto.", text: "Faz a triagem administrativa permitida, recolhe contexto e encaminha assuntos sensíveis para uma pessoa.", icon: ShieldCheck },
  { label: "Ginásios & academias", title: "Interesse não fica parado.", text: "Explica planos, responde horários, recupera interessados e prepara o próximo passo para a equipa.", icon: Clock3 },
];

const workSteps = [
  ["01", "Recebe", "A mensagem chega pelo canal que o negócio já utiliza."],
  ["02", "Compreende", "A Sofia identifica intenção, cliente e contexto."],
  ["03", "Executa", "Consulta ferramentas e realiza a tarefa permitida."],
  ["04", "Verifica", "Confirma que o resultado aconteceu de verdade."],
  ["05", "Escala", "Quando necessário, chama a pessoa certa."],
];

export default function Business() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    toast.success("Pedido recebido", { description: "Vamos identificar um primeiro fluxo adequado para o seu negócio." });
  }

  return (
    <main className="business-page">
      <header className="business-header">
        <Link href="/" className="business-brand" aria-label="Voltar à evolução da Sofia">
          <img src={mark} alt="" />
          <span>LABORYA</span>
        </Link>
        <nav className="business-nav" aria-label="Navegação comercial">
          <a href="#como-funciona">Como funciona</a>
          <a href="#casos">Casos de uso</a>
          <a href="#piloto">O piloto</a>
        </nav>
        <a className="business-nav-cta" href="#avaliar">Avaliar o meu negócio <ArrowRight size={14} /></a>
      </header>

      <section className="business-hero">
        <div className="business-hero-bg" style={{ backgroundImage: `url(${heroImage})` }} />
        <div className="business-hero-shade" />
        <div className="business-hero-copy">
          <p className="business-kicker"><span /> SOFIA · DIGITAL WORKER DA LABORYA</p>
          <h1>Enquanto a sua equipa trabalha, <em>quem responde ao resto?</em></h1>
          <p className="business-lede">A Sofia assume tarefas de atendimento e operação com contexto, ferramentas e supervisão — para o seu negócio continuar a avançar mesmo quando a equipa está ocupada.</p>
          <div className="business-actions">
            <a className="business-button business-button-gold" href="#avaliar">Avaliar o meu negócio <ArrowRight size={16} /></a>
            <a className="business-button business-button-quiet" href="#como-funciona">Ver como funciona <ChevronDown size={16} /></a>
          </div>
          <div className="business-proofline"><span>Não é um chatbot genérico.</span><span>É trabalho digital com estado, regras e resultado.</span></div>
        </div>
        <div className="business-hero-stamp"><span>01</span><strong>Escolha uma tarefa.<br />Comece com controlo.</strong></div>
      </section>

      <section className="business-paper business-problem">
        <div className="business-shell business-two-col">
          <div><p className="business-index">/ 01 — O CUSTO INVISÍVEL</p><h2>O seu negócio não precisa de <em>mais uma caixa de entrada.</em></h2></div>
          <div className="business-copy"><p>Precisa que os pedidos avancem. Mensagens sem resposta, marcações por confirmar e follow-ups esquecidos transformam pequenas tarefas em trabalho acumulado.</p><p>A Sofia foi criada para assumir uma parte concreta desse trabalho — sem obrigar a sua equipa a reaprender o negócio.</p><span className="business-note">A proposta começa pequena para poder ser medida.</span></div>
        </div>
      </section>

      <section id="como-funciona" className="business-dark business-work-section">
        <div className="business-shell"><div className="business-section-intro"><div><p className="business-index">/ 02 — DA MENSAGEM À EXECUÇÃO</p><h2>O trabalho não termina quando a Sofia <em>responde.</em></h2></div><p>A Sofia transforma um pedido num fluxo de trabalho: compreende, decide, utiliza ferramentas, executa, verifica e reporta.</p></div>
          <div className="business-workflow">{workSteps.map(([n, title, text]) => <div className="business-workstep" key={n}><div className="business-worknode">{n}</div><h3>{title}</h3><p>{text}</p></div>)}</div>
          <div className="business-quote"><Sparkles size={18} /><span>O resultado que importa</span><strong>Uma tarefa concluída e verificada — não apenas uma conversa iniciada.</strong></div>
        </div>
      </section>

      <section id="casos" className="business-paper business-cases">
        <div className="business-shell"><div className="business-section-intro"><div><p className="business-index">/ 03 — FEITA PARA NEGÓCIOS LOCAIS</p><h2>Comece pelo trabalho que mais <em>interrompe.</em></h2></div><p>Os fluxos mudam conforme o negócio. A fundação é a mesma: contexto, regras, ferramentas e supervisão.</p></div>
          <div className="business-case-grid">{useCases.map(({ label, title, text, icon: Icon }) => <article className="business-case" key={label}><div className="business-case-icon"><Icon size={20} /></div><p className="business-case-label">{label}</p><h3>{title}</h3><p>{text}</p><a href="#avaliar">Explorar este fluxo <ArrowRight size={14} /></a></article>)}</div>
        </div>
      </section>

      <section id="piloto" className="business-dark business-pilot-section">
        <div className="business-shell business-pilot-grid"><div><p className="business-index">/ 04 — O PRIMEIRO PASSO</p><h2>Não entregue o negócio inteiro à IA. <em>Escolha uma tarefa.</em></h2><p className="business-pilot-copy">O piloto começa com um fluxo específico, regras claras e um critério de sucesso combinado. A Sofia executa sob supervisão; a equipa decide quando expandir.</p><a className="business-text-link" href="#avaliar">Conhecer o formato do piloto <ArrowRight size={15} /></a></div><div className="business-pilot-card"><div><span>01</span><strong>Mapear</strong><p>Escolher o pedido repetitivo.</p></div><div><span>02</span><strong>Configurar</strong><p>Definir regras e ferramentas.</p></div><div><span>03</span><strong>Verificar</strong><p>Acompanhar cada resultado.</p></div><div><span>04</span><strong>Decidir</strong><p>Expandir apenas se fizer sentido.</p></div></div></div>
      </section>

      <section className="business-paper business-trust"><div className="business-shell business-trust-grid"><div><p className="business-index">/ 05 — AUTONOMIA COM LIMITES</p><h2>A Sofia trabalha dentro das <em>regras do seu negócio.</em></h2></div><div className="business-trust-list"><div><Check size={17} /><p><strong>Permissões claras.</strong> A Sofia só utiliza as ferramentas e ações que foram autorizadas.</p></div><div><Check size={17} /><p><strong>Escalamento humano.</strong> Quando não deve decidir sozinha, encaminha para a pessoa certa.</p></div><div><Check size={17} /><p><strong>Histórico verificável.</strong> Cada trabalho tem estado, resultado e contexto auditável.</p></div></div></div></section>

      <section id="avaliar" className="business-cta"><div className="business-cta-inner"><img src={mark} alt="" /><p className="business-index">/ 06 — AVALIAR O SEU NEGÓCIO</p><h2>Qual tarefa está a <em>esperar por uma dona?</em></h2><p>Conte-nos onde a sua equipa perde mais tempo. Identificaremos um primeiro fluxo que a Sofia pode assumir com segurança.</p>{submitted ? <div className="business-success"><Check size={20} /><strong>Pedido recebido. O próximo passo é identificar o fluxo mais adequado.</strong></div> : <form className="business-form" onSubmit={handleSubmit}><input required name="business" placeholder="Nome do negócio" aria-label="Nome do negócio" /><select required name="type" defaultValue="" aria-label="Tipo de negócio"><option value="" disabled>Tipo de negócio</option><option>Salão ou estética</option><option>Clínica</option><option>Ginásio ou academia</option><option>Consultoria</option><option>Outro negócio de serviços</option></select><input required name="task" placeholder="Tarefa que mais se repete" aria-label="Tarefa que mais se repete" /><button className="business-button business-button-gold" type="submit">Avaliar o meu negócio <ArrowRight size={16} /></button></form>}</div></section>

      <footer className="business-footer"><Link href="/"><span>Ver a evolução da Sofia</span></Link><span>SOFIA / DIGITAL WORKER DA LABORYA</span><a href="https://www.uselaborya.com/" target="_blank" rel="noreferrer">LABORYA <ArrowRight size={13} /></a></footer>
    </main>
  );
}
