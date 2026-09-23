# Documentação de Sprints — NovaCRM

> **Projeto**: NovaCRM  
> **Liderança Técnica**: Pedro Lucas Reis (Full Stack Software Engineer)  
> **Organização**: Reoli  
> **Status**: Em Evolução Contínua  

---

## 📌 Visão Geral do Produto

O **NovaCRM** é um sistema operacional de vendas moderno, desenhado para empresas que operam prioritariamente por canais de mensageria (WhatsApp) e demandam automação avançada com Inteligência Artificial generativa.

### Pilares Fundamentais:
* **Automação Humano-Centrada**: Agentes de IA que atendem, tiram dúvidas e qualificam leads, passando a vez de forma fluida para vendedores humanos.
* **Privacidade & Conformidade**: Multi-tenancy real com isolamento de dados por organização e conformidade total com a LGPD.
* **Infraestrutura Aberta & Extensível**: Integração nativa com WAHA, suporte a Docker, microsserviços de background e extensões via MCP (Model Context Protocol).

---

## 🚀 Histórico e Planejamento de Sprints

### Sprint 1 — Fundação, Arquitetura & Banco de Dados
* **Objetivo**: Estabelecer a base técnica resiliente e modelagem de dados multi-tenant.
* **Principais Entregas**:
  * Setup do ecossistema Next.js com TypeScript e Tailwind CSS.
  * Modelagem relacional no PostgreSQL com Row Level Security (RLS) no Supabase.
  * Estrutura de autenticação, roles e isolamento de tenants.
* **Resultado**: Base de código robusta, tipada e com segurança intrínseca.

### Sprint 2 — Conectividade WhatsApp (WAHA) & Webhooks
* **Objetivo**: Integrar o canal principal de mensageria com alta confiabilidade.
* **Principais Entregas**:
  * Integração com motor WAHA (WhatsApp HTTP API).
  * Painel de gerenciamento de sessões com pareamento via QR Code.
  * Pipeline de webhooks com filas de processamento assíncrono e retry.
* **Resultado**: Mensagens bidirecionais fluindo em tempo real com tolerância a falhas.

### Sprint 3 — Core Comercial: Leads, Contatos e Kanban
* **Objetivo**: Entregar a experiência visual de gerenciamento de vendas.
* **Principais Entregas**:
  * Quadro Kanban de negociações com drag-and-drop dinâmico.
  * Gestão de contatos, histórico de conversas e anotações internas.
  * Filtros avançados, busca textual rápida e segmentações por tags.
* **Resultado**: Fluxo comercial completo, intuitivo e com alto rendimento para o operador.

### Sprint 4 — Inteligência Artificial, Agentes & Protocolo MCP
* **Objetivo**: Habilitar automação inteligente de atendimento e vendas.
* **Principais Entregas**:
  * Motor de IA com suporte a múltiplos provedores (OpenAI, Gemini, Anthropic).
  * Integração de ferramentas externas e banco de dados via Model Context Protocol (MCP).
  * Mecanismo de Handoff inteligente com detecção de intenção para transição com operadores.
* **Resultado**: Redução drástica no tempo de resposta inicial a leads e qualificação automática 24/7.

### Sprint 5 — Workers, Follow-up Ativo & Refinamento Visual Reoli
* **Objetivo**: Escalar processos em background e consolidar a identidade visual Reoli.
* **Principais Entregas**:
  * Workers dedicados para cadências de follow-up e tarefas agendadas.
  * Aplicação do Design System Reoli (dark mode refinado, tipografia moderna e responsividade).
  * Auditorias de conformidade, segurança e documentação unificada.
* **Resultado**: Aplicação completa, com performance extrema e acabamento visual de alto padrão.
