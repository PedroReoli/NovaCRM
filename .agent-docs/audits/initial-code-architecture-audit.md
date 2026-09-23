# Relatório de Auditoria de Arquitetura & Segurança — NovaCRM

> **Data**: 23/09/2026  
> **Auditor**: ReoliCode Architecture & Security Skill  
> **Status**: Audit First (Levantamento Inicial & Backlog de Refatoração)  

---

## 1. Visão Executiva

A codebase do **NovaCRM** possui uma base rica e madura, integrando Next.js 16 (App Router), Supabase (PostgreSQL + RLS), Vercel AI SDK, MCP e WAHA. 
A higienização de marcas legadas foi executada com 100% de sucesso, substituindo terminologias e referências por metadados de **Pedro Lucas Reis / NovaCRM**.

A auditoria identificou padrões de alto valor, bem como oportunidades críticas de refatoração para garantir sustentabilidade, performance e manutenibilidade a longo prazo.

---

## 2. Pontos Críticos Mapeados (Hotspots de Complexidade)

### 🔴 God Files & Alta Complexidade Ciclomática
1. **`lib/agent-engine/agent/inbound-turn.ts` (~220 KB)**:
   * *Diagnóstico*: Concentra regras de turnos de entrada, validação de canal, verificação de guardrails, chamada a LLM e fallback manual em um único fluxo massivo.
   * *Recomendação*: Decompor em um pipeline modular de middlewares (`InboundTurnPipeline`: Validador -> ContextBuilder -> LLMCaller -> GuardrailEvaluator -> ResponseDispatcher).

2. **`app/app/agenda/_client.tsx` (~57 KB)**:
   * *Diagnóstico*: God Component misturando renderização do calendário, manipulação de estado complexo, chamadas de API e modais de agendamento.
   * *Recomendação*: Extrair hooks dedicados (`useAgendaState`, `useAgendaMutations`) e quebrar componentes visuais menores (`CalendarGrid`, `AppointmentModal`, `AgendaHeader`).

3. **`lib/waha/ingest.ts` (~49 KB)**:
   * *Diagnóstico*: Parser extenso de payloads de mensagens, mídias e status do WAHA.
   * *Recomendação*: Separar parsers por tipo de evento (`MessageParser`, `AckParser`, `MediaParser`, `SessionParser`).

---

## 3. Auditoria de Segurança & LGPD (OWASP Top 10)

* **Multi-Tenancy & RLS**:
  - Políticas de RLS estão ativas nas migrations do Supabase (`supabase/migrations/`).
  - *Checklist Reoli*: Garantir que nenhuma query no backend utilize `service_role` de forma indiscriminada sem filtrar explicitamente pelo `organization_id` do usuário autenticado.
* **Sanitização de Webhooks**:
  - Validar assinaturas HMAC / secret tokens nos endpoints `/api/webhooks/waha/*` para prevenir falsificação de requisições externas.
* **Tratamento de Dados Pessoais (LGPD)**:
  - O módulo `lib/lgpd/export-collector.ts` já implementa coleta para exportação e direito de esquecimento, alinhado com as diretrizes de privacidade.

---

## 4. Plano de Ação Recomendado para Próximas Sprints

| Prioridade | Ação | Módulo | Impacto |
| :--- | :--- | :--- | :--- |
| **Alta** | Decompor `inbound-turn.ts` em pipeline modular | `lib/agent-engine/` | Manutenibilidade e testabilidade da IA |
| **Alta** | Refatorar God Component da Agenda (`_client.tsx`) | `app/app/agenda/` | Performance de render e legibilidade |
| **Média** | Modularizar parsers de webhook do WAHA | `lib/waha/` | Resiliência contra mudanças de API |
| **Média** | Implementar testes de carga na fila de mensagens | `workers/` | Estabilidade em picos de mensagens |
