import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCustomDialog } from '../context/CustomDialogContext';
import { 
  Crown, CheckCircle2, ArrowLeft, Sparkles, ExternalLink, 
  HelpCircle, Zap, ShieldCheck, Database, Layout, Code, MessageCircle
} from 'lucide-react';

export default function Pricing() {
  const navigate = useNavigate();
  const { showAlert } = useCustomDialog();
  const [subscription, setSubscription] = useState(null);
  const [asaasUrl, setAsaasUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get stored subscription if available
    try {
      const stored = localStorage.getItem('user_subscription');
      if (stored) {
        setSubscription(JSON.parse(stored));
      }
    } catch (e) {}

    // 2. Fetch fresh config (Asaas URL) and subscription
    const userEmail = localStorage.getItem('user_email');
    const endpoint = userEmail 
      ? `/api/subscription?action=get_or_create&email=${encodeURIComponent(userEmail)}`
      : '/api/subscription?action=get_config';

    fetch(endpoint)
      .then(res => res.json())
      .then(data => {
        if (data) {
          if (data.plan) setSubscription(data);
          if (data.asaasPaymentUrl) setAsaasUrl(data.asaasPaymentUrl);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleCheckout = () => {
    if (asaasUrl) {
      window.open(asaasUrl, '_blank', 'noopener,noreferrer');
    } else {
      showAlert({
        title: 'Pagamento em Ativação',
        message: 'O link de pagamento do Asaas está sendo configurado pelo administrador. Fale com nosso suporte no WhatsApp para liberação imediata!',
        type: 'info'
      });
    }
  };

  const isCurrentFree = !subscription || (!subscription.isOwner && subscription.plan === 'free');
  const isCurrentPremium = subscription && (subscription.isOwner || subscription.plan === 'premium');

  return (
    <div style={{ minHeight: '100vh', minHeight: '100dvh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-main)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <header className="glass-header" style={{ position: 'sticky', top: 0, zIndex: 50, marginBottom: 0, padding: '16px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => navigate('/')} className="btn btn-outline" style={{ padding: '8px 14px', fontSize: 13, gap: 6 }}>
            <ArrowLeft size={16} /> Voltar ao Início
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Crown size={22} style={{ color: '#f59e0b' }} />
            <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Planos & Assinaturas</h1>
          </div>
        </div>

        <Link to="/manual" className="btn btn-outline" style={{ padding: '8px 14px', fontSize: 13, gap: 6, textDecoration: 'none' }}>
          Manual do Sistema
        </Link>
      </header>

      {/* Hero Section */}
      <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%', padding: '48px 24px 80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 20, background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.25)', color: '#f59e0b', fontSize: 13, fontWeight: 700, marginBottom: 16 }}>
            <Sparkles size={14} /> POTENCIALIZE SUAS AUTOMAÇÕES
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 12 }}>
            Escolha o Plano Ideal para seu Negócio
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, maxWidth: 620, margin: '0 auto', lineHeight: 1.6 }}>
            Crie formulários ilimitados de alta conversão salvos com total privacidade diretamente no seu próprio Google Drive e integrados ao n8n, Make e Zapier.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32, alignItems: 'stretch' }}>
          
          {/* Card Plano Free */}
          <div className="glass-panel" style={{
            padding: 40,
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            border: isCurrentFree ? '1px solid rgba(255,255,255,0.15)' : '1px solid var(--border-builder)',
            background: 'rgba(255,255,255,0.02)'
          }}>
            {isCurrentFree && (
              <div style={{
                position: 'absolute',
                top: 20,
                right: 20,
                padding: '4px 12px',
                borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.08)',
                color: 'var(--text-secondary)',
                fontSize: 11,
                fontWeight: 700,
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                SEU PLANO ATUAL
              </div>
            )}

            <div style={{ marginBottom: 24 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Plano Básico
              </span>
              <h3 style={{ fontSize: 26, fontWeight: 800, marginTop: 4, color: 'var(--text-main)' }}>Free</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                Perfeito para testar a ferramenta e criar seu primeiro formulário inteligente.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 28 }}>
              <span style={{ fontSize: 44, fontWeight: 900, color: 'var(--text-main)' }}>R$ 0</span>
              <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>/mês (sem custo)</span>
            </div>

            <div style={{ borderTop: '1px solid var(--border-builder)', paddingTop: 24, marginBottom: 36, flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 16 }}>
                Recursos Inclusos:
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                  <CheckCircle2 size={18} style={{ color: 'var(--accent-color)', flexShrink: 0 }} />
                  <span><strong>1 Formulário ativo</strong> no Google Drive</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                  <CheckCircle2 size={18} style={{ color: 'var(--accent-color)', flexShrink: 0 }} />
                  <span><strong>Respostas ilimitadas</strong> via Webhook</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                  <CheckCircle2 size={18} style={{ color: 'var(--accent-color)', flexShrink: 0 }} />
                  <span>Arquitetura Zero-DB (Salvo no seu Drive)</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                  <CheckCircle2 size={18} style={{ color: 'var(--accent-color)', flexShrink: 0 }} />
                  <span>Modo Passo a Passo (Typeform-style)</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                  <CheckCircle2 size={18} style={{ color: 'var(--accent-color)', flexShrink: 0 }} />
                  <span>Integrações com n8n, Make e Zapier</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text-muted)' }}>
                  <span style={{ width: 18, textAlign: 'center', fontWeight: 'bold' }}>✕</span>
                  <span style={{ textDecoration: 'line-through' }}>Criação ilimitada de formulários</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text-muted)' }}>
                  <span style={{ width: 18, textAlign: 'center', fontWeight: 'bold' }}>✕</span>
                  <span style={{ textDecoration: 'line-through' }}>Suporte prioritário via WhatsApp</span>
                </li>
              </ul>
            </div>

            <button 
              className="btn btn-outline" 
              disabled={isCurrentFree}
              onClick={() => navigate('/')}
              style={{ width: '100%', padding: '14px', fontSize: 14 }}
            >
              {isCurrentFree ? 'Plano Ativo' : 'Começar Grátis'}
            </button>
          </div>

          {/* Card Plano Premium (Destaque) */}
          <div className="glass-panel" style={{
            padding: 40,
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.08) 0%, rgba(15, 23, 42, 0.4) 100%)',
            border: '2px solid rgba(245, 158, 11, 0.5)',
            boxShadow: '0 20px 50px rgba(245, 158, 11, 0.15)'
          }}>
            {/* Popular Badge */}
            <div style={{
              position: 'absolute',
              top: -14,
              right: 24,
              padding: '6px 14px',
              borderRadius: 20,
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#fff',
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.05em',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)'
            }}>
              ⭐ MAIS POPULAR / ACESSO TOTAL
            </div>

            <div style={{ marginBottom: 24 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Crown size={16} /> Plano Completo
              </span>
              <h3 style={{ fontSize: 28, fontWeight: 900, marginTop: 4, color: 'var(--text-main)' }}>Premium</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                Para profissionais, agências e empresas que precisam de múltiplos formulários e automações contínuas.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 28 }}>
              <span style={{ fontSize: 44, fontWeight: 900, color: '#f59e0b' }}>R$ 19,90</span>
              <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>/mês</span>
            </div>

            <div style={{ borderTop: '1px solid rgba(245, 158, 11, 0.2)', paddingTop: 24, marginBottom: 36, flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', marginBottom: 16 }}>
                Tudo do Free e Mais:
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text-main)' }}>
                  <CheckCircle2 size={18} style={{ color: '#10b981', flexShrink: 0 }} />
                  <span><strong>Formulários ILIMITADOS</strong> no Google Drive</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                  <CheckCircle2 size={18} style={{ color: '#10b981', flexShrink: 0 }} />
                  <span><strong>Respostas e Leads ILIMITADOS</strong></span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                  <CheckCircle2 size={18} style={{ color: '#10b981', flexShrink: 0 }} />
                  <span><strong>Modo Passo a Passo & Multi-Step</strong> Ilimitado</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                  <CheckCircle2 size={18} style={{ color: '#10b981', flexShrink: 0 }} />
                  <span><strong>Personalização Visual Completa</strong> (Google Fonts, Cores, Logos)</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                  <CheckCircle2 size={18} style={{ color: '#10b981', flexShrink: 0 }} />
                  <span><strong>Opção Exclusiva ✨ ("Nenhum")</strong> em seleções</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                  <CheckCircle2 size={18} style={{ color: '#10b981', flexShrink: 0 }} />
                  <span><strong>Embed em Sites (iFrame)</strong> & Links de Campanha</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                  <CheckCircle2 size={18} style={{ color: '#10b981', flexShrink: 0 }} />
                  <span><strong>Captura Dinâmica de Parâmetros</strong> (<code>?phone=...</code>)</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#f59e0b', fontWeight: 600 }}>
                  <CheckCircle2 size={18} style={{ color: '#f59e0b', flexShrink: 0 }} />
                  <span><strong>Suporte Prioritário Direto no WhatsApp</strong></span>
                </li>
              </ul>
            </div>

            <button 
              onClick={handleCheckout}
              disabled={isCurrentPremium}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '16px',
                fontSize: 15,
                fontWeight: 800,
                background: isCurrentPremium ? 'rgba(16, 185, 129, 0.2)' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                borderColor: isCurrentPremium ? '#10b981' : '#f59e0b',
                color: isCurrentPremium ? '#10b981' : '#fff',
                boxShadow: isCurrentPremium ? 'none' : '0 8px 24px rgba(245, 158, 11, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              {isCurrentPremium ? (
                <>Plano Premium Ativo ✨</>
              ) : (
                <>
                  <Crown size={18} /> Assinar Premium (R$ 19,90/mês) <ExternalLink size={14} />
                </>
              )}
            </button>

            {!isCurrentPremium && (
              <span style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>
                Pagamento 100% seguro processado via Asaas • Cancele quando quiser
              </span>
            )}
          </div>

        </div>

        {/* FAQ Section */}
        <div style={{ marginTop: 64, maxWidth: 840, margin: '64px auto 0 auto' }}>
          <h3 style={{ fontSize: 22, fontWeight: 700, textAlign: 'center', marginBottom: 32 }}>Perguntas Frequentes</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="glass-panel" style={{ padding: 20, borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, color: 'var(--text-main)' }}>Posso cancelar minha assinatura a qualquer momento?</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>Sim. Não há contratos de fidelidade. Você pode solicitar o cancelamento a qualquer instante sem multas.</div>
            </div>

            <div className="glass-panel" style={{ padding: 20, borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, color: 'var(--text-main)' }}>O que acontece com meus formulários se eu cancelar?</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>Como seus formulários ficam salvos diretamente no seu Google Drive pessoal (pasta "FormGen Agenc-ia"), os arquivos permanecem integralmente sob sua propriedade e nunca são deletados.</div>
            </div>

            <div className="glass-panel" style={{ padding: 20, borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, color: 'var(--text-main)' }}>Como é feito o pagamento?</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>Utilizamos o Asaas, uma das maiores e mais seguras instituições de pagamentos do Brasil, aceitando Pix, Cartão de Crédito e Boleto.</div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
