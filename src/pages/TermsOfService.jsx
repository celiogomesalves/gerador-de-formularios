import React from 'react';

export default function TermsOfService() {
  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif', lineHeight: '1.6', color: '#333' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '20px', color: '#0f172a' }}>Termos de Serviço</h1>
      <p style={{ color: '#64748b' }}>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
      
      <h2 style={{ marginTop: '32px', color: '#0f172a' }}>1. Aceitação dos Termos</h2>
      <p>Ao acessar e usar o FormGen Studio, você concorda em cumprir e ficar vinculado aos seguintes termos e condições de uso. Se você não concordar com alguma parte destes termos, você não deve usar nosso serviço.</p>
      
      <h2 style={{ marginTop: '32px', color: '#0f172a' }}>2. Descrição do Serviço</h2>
      <p>O FormGen Studio é uma plataforma baseada na web ("Serviço") que permite aos usuários projetar, criar e publicar formulários online. O Serviço opera sob uma arquitetura "Zero Database", utilizando a conta do Google Drive do próprio usuário para armazenamento de configurações de formulários (arquivos <code>.json</code>).</p>
      
      <h2 style={{ marginTop: '32px', color: '#0f172a' }}>3. Uso da Conta do Google e Permissões</h2>
      <p>Para usar a funcionalidade principal do Serviço, você deve conectar sua conta do Google e conceder permissões para gerenciar arquivos no seu Google Drive (escopo <code>drive.file</code>). Você reconhece e concorda que:</p>
      <ul>
        <li>O Serviço criará arquivos no seu Google Drive para salvar seus formulários.</li>
        <li>O Serviço definirá permissões públicas de leitura nesses arquivos específicos para que os formulários possam ser acessados por terceiros.</li>
        <li>Você é o único proprietário dos dados salvos no seu Drive e é responsável pelo conteúdo dos formulários que criar.</li>
      </ul>
      
      <h2 style={{ marginTop: '32px', color: '#0f172a' }}>4. Conduta do Usuário</h2>
      <p>Você concorda em não utilizar o Serviço para criar formulários que coletem informações ilegais, solicitem senhas em texto puro, ou promovam spam, phishing ou qualquer outra atividade maliciosa. Reservamo-nos o direito de restringir o acesso à plataforma em caso de abuso.</p>
      
      <h2 style={{ marginTop: '32px', color: '#0f172a' }}>5. Isenção de Garantias e Limitação de Responsabilidade</h2>
      <p>O Serviço é fornecido "no estado em que se encontra", sem qualquer garantia de qualquer tipo. Nós não nos responsabilizamos por perdas de dados no seu Google Drive, falhas na integração com webhooks de terceiros ou lucros cessantes. Sendo um aplicativo serverless, a disponibilidade pública dos seus formulários depende da disponibilidade da API do Google Drive.</p>
      
      <h2 style={{ marginTop: '32px', color: '#0f172a' }}>6. Modificações do Serviço e dos Termos</h2>
      <p>Nós nos reservamos o direito de modificar ou descontinuar, temporária ou permanentemente, o Serviço (ou qualquer parte dele) com ou sem aviso prévio. Também podemos atualizar estes Termos de Serviço periodicamente.</p>
      
      <h2 style={{ marginTop: '32px', color: '#0f172a' }}>7. Contato</h2>
      <p>Se você tiver dúvidas sobre estes Termos, entre em contato através das informações fornecidas no domínio principal da plataforma.</p>
    </div>
  );
}
