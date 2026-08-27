import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif', lineHeight: '1.6', color: '#333' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '20px', color: '#0f172a' }}>Política de Privacidade</h1>
      <p style={{ color: '#64748b' }}>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
      
      <h2 style={{ marginTop: '32px', color: '#0f172a' }}>1. Introdução</h2>
      <p>O FormGen Studio (referido como "nós", "nosso" ou "plataforma") leva sua privacidade a sério. Esta Política de Privacidade explica como coletamos, usamos e protegemos suas informações ao utilizar nosso aplicativo de criação de formulários (o "Serviço").</p>
      
      <h2 style={{ marginTop: '32px', color: '#0f172a' }}>2. Integração com o Google Drive</h2>
      <p>Nosso aplicativo utiliza o Google OAuth para autenticação e integração com o seu Google Drive. Para o funcionamento correto do nosso serviço (arquitetura "Zero Database"), solicitamos permissão específica para <strong>ver, editar, criar e excluir apenas os arquivos específicos do Google Drive que você usa com este aplicativo</strong> (escopo <code>https://www.googleapis.com/auth/drive.file</code>).</p>
      <p>Nós não temos acesso, não lemos e não modificamos nenhum outro arquivo pessoal do seu Google Drive que não tenha sido criado por meio da nossa plataforma.</p>
      
      <h2 style={{ marginTop: '32px', color: '#0f172a' }}>3. Como armazenamos seus dados</h2>
      <p>O FormGen Studio possui uma arquitetura <strong>100% Serverless para os formulários</strong>. Isso significa que:</p>
      <ul>
        <li>Não armazenamos a estrutura dos seus formulários em nossos servidores de banco de dados.</li>
        <li>Toda a estrutura, design e configurações dos seus formulários são salvos exclusivamente como arquivos <code>.json</code> no seu próprio Google Drive pessoal, em uma pasta chamada "FormGen Agenc-ia".</li>
        <li>Para que os formulários possam ser acessados publicamente por seus respondentes, nosso sistema altera automaticamente as permissões de leitura apenas dos arquivos de configuração gerados para "Qualquer pessoa com o link".</li>
      </ul>
      
      <h2 style={{ marginTop: '32px', color: '#0f172a' }}>4. Dados de Submissão dos Respondentes</h2>
      <p>Os dados enviados pelas pessoas que preenchem seus formulários não são salvos em nossos servidores. As submissões são enviadas diretamente para a integração configurada por você no painel (ex: Webhook, Google Sheets via Apps Script, etc).</p>
      
      <h2 style={{ marginTop: '32px', color: '#0f172a' }}>5. Compartilhamento de Informações</h2>
      <p>Nós não vendemos, alugamos ou compartilhamos suas informações pessoais (incluindo seu endereço de e-mail e arquivos do Drive) com terceiros.</p>
      
      <h2 style={{ marginTop: '32px', color: '#0f172a' }}>6. Seus Direitos e Revogação</h2>
      <p>Como os dados dos formulários residem no seu Google Drive, você tem total controle sobre eles. Você pode excluí-los a qualquer momento pelo nosso painel ou diretamente pelo Google Drive. Você também pode revogar o acesso do nosso aplicativo à sua conta Google a qualquer momento nas configurações de segurança da sua Conta Google.</p>
      
      <h2 style={{ marginTop: '32px', color: '#0f172a' }}>7. Contato</h2>
      <p>Se você tiver alguma dúvida sobre esta Política de Privacidade, entre em contato com o desenvolvedor através do nosso domínio principal.</p>
    </div>
  );
}
