# NovaCRM — Sistema Operacional de Vendas com IA & WhatsApp (WAHA)

> **Autor & Engenheiro**: [Pedro Lucas Reis](https://pedroreis.vercel.app/)  
> **Perfil**: Full Stack Software Engineer | AI Engineering & Architecture  
> **Organização**: Reoli  
> **Licença**: MIT  

---

## ⚡ Visão Geral

O **NovaCRM** é uma plataforma moderna de CRM e orquestração de vendas desenhada especificamente para empresas que vendem e se relacionam através do WhatsApp. Com agentes de Inteligência Artificial nativos integrados ao protocolo **MCP (Model Context Protocol)** e ao motor de mensageria **WAHA**, o sistema oferece:

* **Atendimento Automatizado Inteligente**: Agentes autônomos que realizam triagem, respondem dúvidas contextuais e qualificam leads.
* **Handoff Fluido (IA ↔ Humano)**: Transição natural para operadores humanos quando detectada complexidade ou solicitação direta do cliente.
* **Pipeline Comercial & Kanban**: Visão ágil de negócios com drag-and-drop, métricas de conversão e gestão de contatos unificada.
* **Multi-tenancy & LGPD by-design**: Isolamento absoluto por organização via Row Level Security (RLS) no PostgreSQL.

---

## 🛠️ Stack Tecnológica

- **Frontend & Backend**: Next.js 16 (App Router), React 19, TypeScript
- **Estilização**: Tailwind CSS v4, Radix UI Primitives, Lucide / Phosphor Icons
- **Banco de Dados**: PostgreSQL com Supabase (Row Level Security & Realtime)
- **Inteligência Artificial**: Vercel AI SDK (OpenAI, Google Gemini, Anthropic) + Model Context Protocol (MCP)
- **Mensageria**: WAHA (WhatsApp HTTP API) com webhooks e filas assíncronas
- **Background Jobs**: Node.js Workers e agendadores de cadência
- **Infraestrutura**: Docker Compose, Traefik / Caddy com SSL automático

---

## 🚀 Como Executar

### 1. Pré-requisitos
- Node.js >= 22
- pnpm >= 9
- Docker e Docker Compose

### 2. Instalação de Dependências
```bash
pnpm install
```

### 3. Configuração de Ambiente
```bash
cp .env.example .env.local
```

### 4. Executando em Desenvolvimento
```bash
pnpm dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 🔒 Governança & Engenharia Reoli
Desenvolvido sob rigorosas práticas de arquitetura e governança ReoliCode, mantendo separação clara de responsabilidades, contratos de tipagem estritos e segurança por padrão.
