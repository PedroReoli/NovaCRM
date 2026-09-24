# TODO — NovaCRM (Reoli OS)

> Sistema Operacional de Vendas & CRM Inteligente com IA Nativa e WhatsApp (WAHA).
> Mantido por: Pedro Lucas Reis (@PedroReoli)

---

## 🎯 Prioridades Imediatas (Sprint Ativa)

- [x] Clonar e isolar repositório de referência (`melgarafael/DeskcommCRM`) em pasta temporária (`_ref_deskcomm/`)
- [x] Configurar regras de `.gitignore` para proteção de pastas privadas e referências
- [x] Mapear arquitetura técnica, pontos fortes e oportunidades de evolução
- [x] Estruturar documentação dual (sprints públicas em `documentation/` e privadas em `.privado/`)
- [x] Executar substituição completa de marca e identidade visual (Rebranding Reoli: Pedro Lucas Reis)
- [x] Construir histórico orgânico de commits progressivos com datas retroativas (~60 dias)
- [x] Executar auditoria inicial de arquitetura e segurança com as skills Reoli (`.agent-docs/audits/`)
- [ ] Decompor God Files identificados (`inbound-turn.ts` e `app/app/agenda/_client.tsx`)
- [ ] Otimizar componentes frontend e consolidar Design System Reoli
- [ ] Validar tipagem TypeScript e pipelines de testes

---

## 📋 Módulos do Sistema

### 1. Core & Arquitetura
- [x] Next.js 16 + React 19 + TypeScript configurados
- [x] Multi-tenant por isolamento de schemas e RLS (Supabase/PostgreSQL)
- [x] Gestão de autenticação, roles e permissões granulares

### 2. Mensageria & Canais (WAHA)
- [x] Integração com WhatsApp via WAHA (WhatsApp HTTP API)
- [x] Recepção resiliente de webhooks com idempotência
- [x] Gerenciamento de múltiplas instâncias e QR Code de conexão
- [x] Filas de mensagens com retry automático e rate limit

### 3. Gestão Comercial (CRM)
- [x] Pipelines de vendas personalizáveis com Kanban drag-and-drop
- [x] Gestão unificada de contatos, empresas e negócios
- [x] Histórico completo de interações, anotações e atividades
- [x] Métricas de conversão e relatórios analíticos de vendas

### 4. Inteligência Artificial & Agentes Autônomos
- [x] Orquestração de LLMs via Vercel AI SDK (OpenAI, Google Gemini, Anthropic)
- [x] Conectores de ferramentas via Model Context Protocol (MCP)
- [x] Memória contextual de conversas e perfilamento de leads
- [x] Handoff híbrido: IA atende, qualifica e transfere para humano sob demanda

### 5. Workers & Automação
- [x] Worker dedicado para processamento assíncrono de eventos
- [x] Scheduler para follow-up ativo e cadências automáticas
- [x] Agente de voz e automações de triagem rápida

---

## 🔍 Auditorias e Conformidade Reoli
- [x] Auditoria de Segurança (`!reoli/rules/20-governance/security.md` & `.claude/skills/dev/security`)
- [x] Auditoria de Arquitetura de Código (`.claude/skills/dev/code-architecture-auditor`)
- [ ] Auditoria de Performance e Queries (`.claude/skills/performance`)
- [ ] Auditoria de Responsividade e UX Mobile (`!reoli/rules/20-governance/responsiveness.md`)
