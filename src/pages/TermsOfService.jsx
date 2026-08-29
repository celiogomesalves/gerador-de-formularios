import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, FileText } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div style={{ minHeight: '100vh', minHeight: '100dvh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-main)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <header className="glass-header" style={{ position: 'sticky', top: 0, zIndex: 50, marginBottom: 0, padding: '16px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link to="/" className="btn btn-outline" style={{ padding: '8px 14px', fontSize: 13, gap: 6, textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Voltar ao Início
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileText size={22} style={{ color: 'var(--accent-color)' }} />
            <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Termos de Serviço</h1>
          </div>
        </div>
        <Link to="/manual" className="btn btn-outline" style={{ padding: '8px 14px', fontSize: 13, gap: 6, textDecoration: 'none' }}>
          <BookOpen size={16} /> Manual do Sistema
        </Link>
      </header>

      {/* Content */}
      <div style={{ maxWidth: 860, margin: '0 auto', width: '100%', padding: '40px 24px 80px 24px' }}>
        <div className="glass-panel" style={{ padding: 40, borderRadius: 'var(--radius-lg)' }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, color: 'var(--text-main)' }}>Termos de Serviço</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 32 }}>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

          <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 24, marginBottom: 12, color: 'var(--accent-color)' }}>1. Aceitação dos Termos</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 14 }}>
            Ao acessar ou utilizar o <strong>FormGen Studio</strong>, você concorda em cumprir e vincular-se a estes Termos de Serviço. Caso não concorde com qualquer uma das disposições, pedimos que interrompa o uso do serviço.
          </p>

          <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 28, marginBottom: 12, color: 'var(--accent-color)' }}>2. Descrição e Modelo Operacional</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 14 }}>
            O FormGen Studio é uma ferramenta de software baseada na web para criação, estilização, publicação e integração de formulários dinâmicos. A plataforma opera com integração direta ao Google Drive do usuário (arquitetura Zero Database), sem retenção de dados confidenciais ou respostas em servidores intermediários. Para assegurar a integridade e continuidade da edição sem perda de dados, o serviço implementa mecanismos de renovação segura de autorização (OAuth) e validação de preenchimento em tempo real com design exclusivo.
          </p>

          <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 28, marginBottom: 12, color: 'var(--accent-color)' }}>3. Responsabilidade pelo Conteúdo dos Formulários</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 14 }}>
            O usuário é integral e exclusivamente responsável pelo teor das perguntas criadas, pelas informações solicitadas aos respondentes e pelo uso dos dados recebidos através de Webhooks ou integrações.
          </p>
          <ul style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7, paddingLeft: 20, marginTop: 8 }}>
            <li>É expressamente proibido usar a plataforma para atividades ilícitas, esquemas de phishing, coleta não autorizada de senhas bancárias ou spam.</li>
          </ul>

          <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 28, marginBottom: 12, color: 'var(--accent-color)' }}>4. Disponibilidade & Serviços de Terceiros</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 14 }}>
            Por se tratar de uma solução serverless integrada ao Google Drive, o funcionamento e armazenamento das configurações dependem da disponibilidade dos servidores e das APIs da Google Inc. A plataforma emprega as melhores práticas para garantir alto desempenho, sem prestar garantias de infalibilidade de serviços externos.
          </p>

          <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 28, marginBottom: 12, color: 'var(--accent-color)' }}>5. Alterações dos Termos</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 14 }}>
            Reservamo-nos o direito de aprimorar ou atualizar estes Termos periodicamente para refletir novas funcionalidades e melhorias de segurança.
          </p>

          <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--border-builder)', display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <Link to="/privacy" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Consulte a Política de Privacidade</Link>
            <Link to="/manual" style={{ color: 'var(--accent-color)', textDecoration: 'none' }}>Acessar Manual do Sistema →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
