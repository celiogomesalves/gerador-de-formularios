import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, ShieldCheck, Database, Sliders, Smartphone, Send, 
  HelpCircle, ArrowLeft, ExternalLink, Sparkles, Layers, Lock, 
  CheckCircle2, AlertTriangle, Code, Copy, Check, ChevronRight
} from 'lucide-react';

export default function Manual() {
  const [activeSection, setActiveSection] = useState('overview');
  const [copiedCode, setCopiedCode] = useState(false);

  const copySnippet = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const sections = [
    { id: 'overview', title: '1. Visão Geral & Arquitetura', icon: <Database size={18} /> },
    { id: 'security', title: '2. Acesso, Segurança & Sessão', icon: <ShieldCheck size={18} /> },
    { id: 'fields', title: '3. Criação & Tipos de Campos', icon: <Layers size={18} /> },
    { id: 'multistep', title: '4. Modo Passo a Passo (Multi-step)', icon: <Smartphone size={18} /> },
    { id: 'design', title: '5. Personalização & Identidade Visual', icon: <Sliders size={18} /> },
    { id: 'publish', title: '6. Publicação & Embed (iFrame)', icon: <Send size={18} /> },
    { id: 'integrations', title: '7. Integrações Webhook (n8n, Make)', icon: <Code size={18} /> },
    { id: 'troubleshooting', title: '8. Dúvidas Frequentes & Dicas', icon: <HelpCircle size={18} /> },
  ];

  return (
    <div style={{ minHeight: '100vh', minHeight: '100dvh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-main)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Header */}
      <header className="glass-header" style={{ position: 'sticky', top: 0, zIndex: 50, marginBottom: 0, padding: '16px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link to="/" className="btn btn-outline" style={{ padding: '8px 14px', fontSize: 13, gap: 6, textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Voltar ao Sistema
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #60a5fa, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={18} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>Manual do Usuário & Documentação</h1>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>FormGen Studio • Guia Completo da Plataforma</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link to="/privacy" style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none' }}>Privacidade</Link>
          <span style={{ color: 'var(--border-builder)' }}>•</span>
          <Link to="/terms" style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none' }}>Termos de Uso</Link>
        </div>
      </header>

      {/* Main Content Layout */}
      <div style={{ display: 'flex', flex: 1, maxWidth: 1400, margin: '0 auto', width: '100%', padding: '32px 24px', gap: 32 }}>
        
        {/* Navigation Sidebar (Desktop) */}
        <aside style={{ width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 6, position: 'sticky', top: 96, height: 'fit-content' }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 8, paddingLeft: 8 }}>
            Índice do Manual
          </div>
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => {
                setActiveSection(s.id);
                const el = document.getElementById(s.id);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: activeSection === s.id ? 'rgba(96, 165, 250, 0.12)' : 'transparent',
                border: activeSection === s.id ? '1px solid var(--accent-color)' : '1px solid transparent',
                color: activeSection === s.id ? 'var(--accent-color)' : 'var(--text-secondary)',
                fontSize: 13,
                fontWeight: activeSection === s.id ? 600 : 500,
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {s.icon}
              <span style={{ flex: 1 }}>{s.title}</span>
              <ChevronRight size={14} style={{ opacity: activeSection === s.id ? 1 : 0.4 }} />
            </button>
          ))}

          <div style={{ marginTop: 24, padding: 16, borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-builder)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: 'var(--accent-color)', fontWeight: 600, fontSize: 13 }}>
              <Sparkles size={16} /> Arquitetura Zero DB
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Seus formulários residem com total privacidade diretamente no seu Google Drive. Nenhum dado de configuração ou resposta é retido em servidores externos.
            </p>
          </div>
        </aside>

        {/* Content Body */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 48, maxWidth: 900 }}>
          
          {/* Section 1: Overview */}
          <section id="overview" className="glass-panel" style={{ padding: 32, borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ padding: 10, borderRadius: 10, background: 'rgba(96, 165, 250, 0.15)', color: 'var(--accent-color)' }}>
                <Database size={24} />
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>1. Visão Geral & Arquitetura "Zero Database"</h2>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 15, marginBottom: 16 }}>
              O <strong>FormGen Studio</strong> foi projetado com uma arquitetura moderna e 100% descentralizada (Serverless e Zero-Database). Ao contrário de ferramentas convencionais (como Typeform, Jotform ou Google Forms fechado), a plataforma não armazena formulários nem respostas em bancos de dados proprietários.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, marginTop: 20 }}>
              <div style={{ padding: 16, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-builder)' }}>
                <h4 style={{ color: 'var(--text-main)', fontSize: 14, fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={16} color="#10b981" /> Onde ficam os formulários?
                </h4>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                  Cada formulário é um arquivo <code>.json</code> salvo diretamente na sua conta pessoal do Google Drive, dentro da pasta <strong>"FormGen Agenc-ia"</strong>. Você é o único e legítimo dono do arquivo.
                </p>
              </div>

              <div style={{ padding: 16, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-builder)' }}>
                <h4 style={{ color: 'var(--text-main)', fontSize: 14, fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={16} color="#10b981" /> Onde ficam as respostas?
                </h4>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                  As respostas são enviadas diretamente para o seu destino configurado (Webhook do n8n, Make, Zapier ou Google Sheets) no instante do envio, sem passar por retenção em disco no nosso servidor.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: Security & Session */}
          <section id="security" className="glass-panel" style={{ padding: 32, borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ padding: 10, borderRadius: 10, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                <ShieldCheck size={24} />
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>2. Acesso, Segurança & Gestão de Sessão</h2>
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-main)', marginTop: 20, marginBottom: 8 }}>
              • Escopo Mínimo de Permissões (Google OAuth)
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 14 }}>
              O sistema solicita apenas o escopo restrito <code>https://www.googleapis.com/auth/drive.file</code>. Isso significa que a plataforma <strong>NÃO tem acesso a nenhum outro arquivo pessoal do seu Google Drive</strong> (fotos, planilhas, pastas pessoais). Ela só pode ler e gravar os arquivos que ela própria cria.
            </p>

            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-main)', marginTop: 24, marginBottom: 8 }}>
              • Validade do Token do Google e Reconexão Automática Não-Destrutiva
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 14 }}>
              O Google impõe que tokens temporários do OAuth expirem após <strong>60 minutos</strong>. O FormGen Studio gerencia essa renovação de forma inteligente e contínua em todo o sistema:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginTop: 12 }}>
              <div style={{ padding: 16, borderRadius: 10, background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent-color)', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
                  <Sparkles size={16} /> No Painel Principal (Dashboard)
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                  Caso sua sessão expire enquanto você gerencia seus formulários, o sistema não desloga você de surpresa. Uma janela elegante de <strong>Reconexão Rápida</strong> é exibida, permitindo restaurar o acesso com 1 clique e recarregar seus formulários imediatamente.
                </p>
              </div>

              <div style={{ padding: 16, borderRadius: 10, background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f59e0b', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
                  <AlertTriangle size={16} /> No Construtor de Formulários
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                  Se você estiver editando há mais de 1 hora, nenhuma alteração é perdida. Ao clicar em <strong>"Reconectar e Salvar"</strong>, a sessão é renovada e as novas alterações são gravadas instantaneamente no Drive.
                </p>
              </div>
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-main)', marginTop: 24, marginBottom: 8 }}>
              • Mensagens e Diálogos 100% Exclusivos do Sistema
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 14 }}>
              Eliminamos por completo as caixas de diálogo e balões cinzas nativos do navegador (<code>alert()</code>, <code>confirm()</code> e validações padrão de formulário). Toda interação, confirmação de exclusão ou aviso de campo obrigatório utiliza o <strong>Design System exclusivo do FormGen Studio</strong>, com estética moderna, animações suaves e ícones temáticos.
            </p>
          </section>

          {/* Section 3: Fields & Exclusive Options */}
          <section id="fields" className="glass-panel" style={{ padding: 32, borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ padding: 10, borderRadius: 10, background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
                <Layers size={24} />
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>3. Criação & Tipos de Campos</h2>
            </div>

            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 14, marginBottom: 20 }}>
              Você pode adicionar quantos campos desejar, reordená-los com facilidade (setas para cima/baixo) e definir se cada um é obrigatório ou opcional.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
              <div style={{ padding: 14, borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-builder)' }}>
                <strong style={{ color: 'var(--text-main)', fontSize: 14 }}>Texto & E-mail</strong>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, margin: 0 }}>Entradas simples de linha única com validação visual de formato de e-mail.</p>
              </div>

              <div style={{ padding: 14, borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-builder)' }}>
                <strong style={{ color: 'var(--text-main)', fontSize: 14 }}>Área de Texto (Textarea)</strong>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, margin: 0 }}>Ideal para comentários, descrições detalhadas e respostas longas.</p>
              </div>

              <div style={{ padding: 14, borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-builder)' }}>
                <strong style={{ color: 'var(--text-main)', fontSize: 14 }}>Seleção (Select Dropdown)</strong>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, margin: 0 }}>Menu suspenso para escolha de apenas 1 opção entre várias.</p>
              </div>

              <div style={{ padding: 14, borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-builder)' }}>
                <strong style={{ color: 'var(--text-main)', fontSize: 14 }}>Escolha Única (Radio Buttons)</strong>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, margin: 0 }}>Botões visíveis em lista para escolha de exatamente uma opção.</p>
              </div>

              <div style={{ padding: 14, borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-builder)' }}>
                <strong style={{ color: 'var(--text-main)', fontSize: 14 }}>Múltipla Escolha (Checkboxes)</strong>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, margin: 0 }}>Permite marcar várias caixas simultâneas com suporte a Opção Exclusiva.</p>
              </div>

              <div style={{ padding: 14, borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-builder)' }}>
                <strong style={{ color: 'var(--text-main)', fontSize: 14 }}>Checkbox Único (Termos)</strong>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, margin: 0 }}>Retorna valor booleano (true/false) para termos e consentimentos.</p>
              </div>
            </div>

            {/* Recurso Exclusivo */}
            <div style={{ marginTop: 24, padding: 20, borderRadius: 12, background: 'rgba(96, 165, 250, 0.06)', border: '1px solid rgba(96, 165, 250, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent-color)', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>
                <Sparkles size={18} /> Recurso Especial: Opção Exclusiva ✨ ("Nenhum / Não se aplica")
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 10px 0' }}>
                Em campos de <strong>Múltipla Escolha</strong>, você pode definir uma opção como <strong>Exclusiva</strong> clicando no ícone de estrela/brilho (<Sparkles size={13} style={{ display: 'inline', verticalAlign: 'middle', color: '#f59e0b' }} />).
              </p>
              <ul style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, paddingLeft: 18 }}>
                <li><strong>Exclusividade Única:</strong> O sistema permite selecionar apenas 1 opção como exclusiva por grupo de múltipla escolha.</li>
                <li><strong>Pré-seleção Automática (Padrão):</strong> A opção exclusiva já vem marcada por padrão no formulário público. Isso agiliza o preenchimento: o usuário que não tiver o que declarar simplesmente avança sem cliques extras.</li>
                <li><strong>Desmarcação Inteligente:</strong> Ao marcar qualquer outra opção do grupo, a opção exclusiva é desmarcada automaticamente. Da mesma forma, marcar a exclusiva desmarca todas as outras.</li>
                <li><strong>Validação de Obrigatoriedade:</strong> Se a pergunta for obrigatória, o sistema impede o envio ou o avanço de etapa caso o respondente desmarque todas as opções.</li>
              </ul>
            </div>
          </section>

          {/* Section 4: Multistep */}
          <section id="multistep" className="glass-panel" style={{ padding: 32, borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ padding: 10, borderRadius: 10, background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                <Smartphone size={24} />
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>4. Modo Passo a Passo (Typeform-Style)</h2>
            </div>

            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 14 }}>
              Na aba <strong>"Config."</strong> do Construtor, você pode habilitar o <strong>Modo Passo a Passo</strong>.
            </p>
            <ul style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.8, paddingLeft: 20, marginTop: 8 }}>
              <li><strong>Foco pergunta por pergunta:</strong> O respondente visualiza apenas 1 pergunta por vez, diminuindo a sobrecarga cognitiva e aumentando taxas de conversão.</li>
              <li><strong>Barra de Progresso Dinâmica:</strong> Mostra a porcentagem concluída e o passo atual (ex: <em>Passo 3 de 9 • 33%</em>).</li>
              <li><strong>Validação por Etapa:</strong> O botão "Próximo" só avança se o campo obrigatório daquela etapa estiver devidamente respondido.</li>
            </ul>
          </section>

          {/* Section 5: Design & Aesthetics */}
          <section id="design" className="glass-panel" style={{ padding: 32, borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ padding: 10, borderRadius: 10, background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899' }}>
                <Sliders size={24} />
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>5. Personalização & Identidade Visual</h2>
            </div>

            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 14, marginBottom: 16 }}>
              O FormGen Studio conta com ferramentas avançadas para deixar o formulário com a cara da sua marca ou empresa:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              <div style={{ padding: 16, borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-builder)' }}>
                <h4 style={{ color: 'var(--text-main)', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>🎨 Temas & Gradientes</h4>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                  6 presets prontos (Corporate, Emerald, Warm Sand, Minimal, Cosmic, Cyberpunk), gradiente livre com ângulo ou cores sólidas.
                </p>
              </div>

              <div style={{ padding: 16, borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-builder)' }}>
                <h4 style={{ color: 'var(--text-main)', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>🖼️ Logo da Empresa</h4>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                  Insira a URL direta do seu logotipo, ajuste o tamanho (pequeno, médio, grande) e o alinhamento (esquerda, centro, direita).
                </p>
              </div>

              <div style={{ padding: 16, borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-builder)' }}>
                <h4 style={{ color: 'var(--text-main)', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>🃏 Estilo do Card & Cores</h4>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                  Defina a cor de fundo do cartão do formulário (ex: branco, azul, escuro), cor dos títulos, cantos arredondados e sombras.
                </p>
              </div>

              <div style={{ padding: 16, borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-builder)' }}>
                <h4 style={{ color: 'var(--text-main)', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>🖋️ Fontes Selecionadas</h4>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                  Tipografia via Google Fonts: Inter, Plus Jakarta Sans, Outfit, Montserrat, Poppins, Playfair Display, Lora, Space Grotesk e Cinzel.
                </p>
              </div>
            </div>
          </section>

          {/* Section 6: Publishing & Embedding */}
          <section id="publish" className="glass-panel" style={{ padding: 32, borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ padding: 10, borderRadius: 10, background: 'rgba(14, 165, 233, 0.15)', color: '#0ea5e9' }}>
                <Send size={24} />
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>6. Publicação & Embed (iFrame)</h2>
            </div>

            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 14 }}>
              Na aba <strong>"Publicar"</strong>, você encontra duas formas principais de disponibilizar seu formulário:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 16 }}>
              <div style={{ padding: 18, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-builder)' }}>
                <h4 style={{ color: 'var(--text-main)', fontSize: 15, fontWeight: 600, marginBottom: 6 }}>1. Link Direto do Formulário (WhatsApp / Campanhas)</h4>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 12 }}>
                  Você pode enviar o link direto para seus clientes. O formulário é totalmente responsivo e funciona tanto em computadores quanto em celulares iOS e Android.
                </p>
                <div style={{ padding: 12, borderRadius: 8, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-builder)', fontSize: 13, color: 'var(--accent-color)', fontFamily: 'monospace' }}>
                  https://formularios.agenc-ia.net/f/TOKEN_DO_FORMULARIO?phone=5531999999999
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8, margin: 0 }}>
                  💡 <strong>Captura de Parâmetros de URL:</strong> Qualquer parâmetro que você adicionar na URL (como <code>?phone=...</code> ou <code>?origem=instagram</code>) é capturado automaticamente e enviado no Webhook dentro de <code>formQueryParameters</code>!
                </p>
              </div>

              <div style={{ padding: 18, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-builder)' }}>
                <h4 style={{ color: 'var(--text-main)', fontSize: 15, fontWeight: 600, marginBottom: 6 }}>2. Código iFrame (WordPress, Wix, Webflow, Landing Pages)</h4>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 8 }}>
                  Basta copiar o código iFrame disponibilizado com as opções de <strong>"Esconder Cabeçalho"</strong> ou <strong>"Fundo Transparente"</strong> para incorporar o formulário perfeitamente dentro de qualquer página web já existente.
                </p>
              </div>
            </div>
          </section>

          {/* Section 7: Integrations */}
          <section id="integrations" className="glass-panel" style={{ padding: 32, borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ padding: 10, borderRadius: 10, background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e' }}>
                <Code size={24} />
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>7. Integrações Webhook (n8n, Make, Zapier)</h2>
            </div>

            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 14 }}>
              Ao configurar um <strong>Webhook URL</strong> na aba "Config.", toda vez que o formulário for respondido, um evento HTTP <code>POST</code> com payload JSON limpo será disparado instantaneamente.
            </p>

            <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main)', marginTop: 16, marginBottom: 8 }}>
              • Estrutura do Payload JSON Enviado:
            </h4>

            <div style={{ position: 'relative', marginTop: 12 }}>
              <button
                onClick={() => copySnippet(`{
  "1. Perfil do condutor": "Motorista profissional",
  "2. Qual veículo você dirige com maior frequência?": "Táxi",
  "3. Medicamentos em uso": [
    "Antialérgicos",
    "Relaxantes musculares"
  ],
  "Aceito os termos de privacidade": true,
  "submittedAt": "2026-08-27T23:37:59.560Z",
  "formQueryParameters": {
    "phone": "553182964066",
    "origem": "whatsapp"
  }
}`)}
                className="btn btn-outline"
                style={{ position: 'absolute', top: 12, right: 12, padding: '6px 12px', fontSize: 12, gap: 4 }}
              >
                {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                {copiedCode ? 'Copiado!' : 'Copiar Exemplo'}
              </button>

              <pre style={{ background: 'var(--bg-sidebar)', padding: '24px 16px', borderRadius: 8, fontSize: 12, fontFamily: 'monospace', overflowX: 'auto', border: '1px solid var(--border-builder)', color: 'var(--accent-color)', lineHeight: 1.6 }}>
{`{
  "1. Perfil do condutor": "Motorista profissional",
  "2. Qual veículo você dirige com maior frequência?": "Táxi",
  "3. Medicamentos em uso": [
    "Antialérgicos",
    "Relaxantes musculares"
  ],
  "Aceito os termos de privacidade": true,
  "submittedAt": "2026-08-27T23:37:59.560Z",
  "formQueryParameters": {
    "phone": "553182964066",
    "origem": "whatsapp"
  }
}`}
              </pre>
            </div>

            <div style={{ marginTop: 24, padding: 18, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-builder)' }}>
              <h4 style={{ color: 'var(--text-main)', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                💡 Dica de Ouro para o n8n (Normalizador de Dados):
              </h4>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                No n8n, se você recebe entradas de formulários diferentes, adicione um nó <strong>Code</strong> logo após o Webhook com:
                <br />
                <code style={{ display: 'block', background: 'rgba(0,0,0,0.4)', padding: '8px 12px', borderRadius: 6, marginTop: 8, color: '#10b981' }}>
                  return &#123; json: $json.body ? $json.body : $json &#125;;
                </code>
                Dessa forma, todos os nós subsequentes do fluxo podem referenciar diretamente <code>$json.formQueryParameters.phone</code> de forma unificada!
              </p>
            </div>
          </section>

          {/* Section 8: Troubleshooting & FAQ */}
          <section id="troubleshooting" className="glass-panel" style={{ padding: 32, borderRadius: 'var(--radius-lg)', marginBottom: 60 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ padding: 10, borderRadius: 10, background: 'rgba(234, 179, 8, 0.15)', color: '#eab308' }}>
                <HelpCircle size={24} />
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>8. Dúvidas Frequentes & Dicas Rápidas</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
              <div style={{ padding: 16, borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-builder)' }}>
                <strong style={{ color: 'var(--text-main)', fontSize: 14 }}>Posso editar um formulário depois de publicado?</strong>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, margin: 0, lineHeight: 1.6 }}>
                  Sim! Todas as edições salvas no Construtor atualizam o mesmo arquivo no Google Drive. Seus respondentes que acessarem o link verão a versão atualizada imediatamente.
                </p>
              </div>

              <div style={{ padding: 16, borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-builder)' }}>
                <strong style={{ color: 'var(--text-main)', fontSize: 14 }}>O que acontece se eu excluir um formulário pelo Dashboard?</strong>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, margin: 0, lineHeight: 1.6 }}>
                  O arquivo <code>.json</code> correspondente será enviado para a lixeira do seu Google Drive. O link público deixará de responder.
                </p>
              </div>

              <div style={{ padding: 16, borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-builder)' }}>
                <strong style={{ color: 'var(--text-main)', fontSize: 14 }}>Preciso pagar alguma mensalidade de banco de dados?</strong>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, margin: 0, lineHeight: 1.6 }}>
                  Não! Como a infraestrutura utiliza a sua cota do próprio Google Drive, não há custos com servidores de banco de dados intermediários.
                </p>
              </div>
            </div>
          </section>

        </main>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-builder)', padding: '24px 32px', textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 'auto' }}>
        FormGen Studio • Documentação Oficial e Manual do Sistema • {new Date().getFullYear()}
      </footer>

    </div>
  );
}
