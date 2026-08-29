import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, ShieldCheck } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div style={{ minHeight: '100vh', minHeight: '100dvh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-main)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <header className="glass-header" style={{ position: 'sticky', top: 0, zIndex: 50, marginBottom: 0, padding: '16px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link to="/" className="btn btn-outline" style={{ padding: '8px 14px', fontSize: 13, gap: 6, textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Voltar ao Início
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShieldCheck size={22} style={{ color: 'var(--accent-color)' }} />
            <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Política de Privacidade</h1>
          </div>
        </div>
        <Link to="/manual" className="btn btn-outline" style={{ padding: '8px 14px', fontSize: 13, gap: 6, textDecoration: 'none' }}>
          <BookOpen size={16} /> Manual do Sistema
        </Link>
      </header>

      {/* Content */}
      <div style={{ maxWidth: 860, margin: '0 auto', width: '100%', padding: '40px 24px 80px 24px' }}>
        <div className="glass-panel" style={{ padding: 40, borderRadius: 'var(--radius-lg)' }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, color: 'var(--text-main)' }}>Política de Privacidade</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 32 }}>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

          <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 24, marginBottom: 12, color: 'var(--accent-color)' }}>1. Introdução & Arquitetura Serverless</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 14 }}>
            O <strong>FormGen Studio</strong> foi construído sob uma filosofia estrita de respeito total à privacidade ("Zero Database"). Esta política explica de forma transparente como suas informações são tratadas ao utilizar nossa plataforma.
          </p>

          <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 28, marginBottom: 12, color: 'var(--accent-color)' }}>2. Integração com o Google Drive (Escopo drive.file)</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 14 }}>
            Para salvar e editar seus formulários, nosso aplicativo utiliza autenticação Google OAuth 2.0. Solicitamos exclusivamente o escopo restrito <code>https://www.googleapis.com/auth/drive.file</code>.
          </p>
          <ul style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7, paddingLeft: 20, marginTop: 8 }}>
            <li><strong>Acesso Estritamente Restrito:</strong> Nossa aplicação <strong>não tem permissão nem capacidade técnica</strong> para visualizar, ler ou modificar quaisquer outros arquivos do seu Google Drive pessoal que não tenham sido gerados pelo próprio FormGen Studio.</li>
            <li><strong>Propriedade dos Arquivos:</strong> Os arquivos dos formulários (<code>.json</code>) ficam salvos na sua própria pasta do Drive ("FormGen Agenc-ia"). Você mantém a propriedade total e irrestrita sobre eles.</li>
            <li><strong>Ciclo de Vida da Sessão:</strong> Os tokens de acesso temporários são armazenados exclusivamente na memória e no LocalStorage do seu navegador. Quando expirados, a plataforma solicita autorização direta do Google, sem transmitir suas chaves de segurança para bancos de dados intermediários.</li>
          </ul>

          <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 28, marginBottom: 12, color: 'var(--accent-color)' }}>3. Não-Armazenamento de Dados de Submissão</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 14 }}>
            Quando um usuário ou cliente final responde ao seu formulário público, <strong>nenhuma resposta é gravada em bancos de dados proprietários da nossa plataforma</strong>. Os dados preenchidos são encaminhados diretamente e de forma segura ao destino que você especificou (como seu Webhook do n8n, Make, Zapier ou Google Sheets).
          </p>

          <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 28, marginBottom: 12, color: 'var(--accent-color)' }}>4. Informações de Perfil do Usuário</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 14 }}>
            Para identificar a conta conectada e permitir fácil conferência no painel do Dashboard, exibimos seu nome, e-mail e foto de perfil obtidos via Google OAuth. Esses dados são mantidos apenas localmente na sessão do seu navegador (LocalStorage) e nunca são comercializados ou cedidos a terceiros.
          </p>

          <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 28, marginBottom: 12, color: 'var(--accent-color)' }}>5. Revogação de Acesso</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 14 }}>
            Você pode revogar as permissões concedidas ao FormGen Studio a qualquer momento através do painel de segurança da sua Conta Google (<a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)' }}>myaccount.google.com/permissions</a>).
          </p>

          <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--border-builder)', display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <Link to="/terms" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Consulte também os Termos de Serviço</Link>
            <Link to="/manual" style={{ color: 'var(--accent-color)', textDecoration: 'none' }}>Acessar Manual do Sistema →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
