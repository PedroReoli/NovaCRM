"use client";

import { LeadEnrichment } from "./LeadEnrichment";
import type { ProspectEnrichment } from "@/lib/prospecting/schema";
import { useAuth } from "@/hooks/auth/AuthProvider";
import { useLocaleDeData } from "@/hooks/i18n/useLocaleDeData";

import type { Locale } from "date-fns";
import Link from "next/link";
import { useT } from "@/hooks/i18n/useT";
import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ChipDeEtiqueta } from "@/components/tags/ChipDeEtiqueta";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Tag, Receipt, Users, ArrowRight } from "@/lib/ui/icons";
import { apiClient } from "@/lib/api/client";
import { toast } from "sonner";
import type { ConversationWithContact } from "@/hooks/inbox/useConversationsRealtime";
import { activityLabel, actorLabel, actorShape } from "@/lib/leads/activity-vocabulary";
import { ConversationTagsEditor } from "./ConversationTagsEditor";
import { ContactTagsEditor } from "./ContactTagsEditor";
import { useDefaultPipeline } from "@/hooks/pipelines/useDefaultPipeline";
import { NewLeadDialog } from "@/components/kanban/NewLeadDialog";
import { CustomFieldsEditor, type CustomFieldDef } from "@/components/contacts/CustomFieldsEditor";
import { useEditLead } from "@/hooks/kanban/useUpdateLead";
import { cn } from "@/lib/utils";
import { rotuloDoContato } from "@/lib/contacts/rotulo-do-contato";
import { phoneForDisplay } from "@/lib/channels/phone-variants";

import {
  type LeadRow,
  type OrderRow,
  type ActivityRow,
  type DemandaRow,
  type DesfechoDraft,
  DESFECHO_LEGIVEL,
  formatMoney,
  shortDate,
} from "./crm-side-panel/types";
import { SemLista } from "./crm-side-panel/SemLista";
import { InboxLeadEditor } from "./crm-side-panel/InboxLeadEditor";
import { DemandasSection } from "./crm-side-panel/DemandasSection";

interface Props {
  conversation: ConversationWithContact | null;
}



export function CRMSidePanel({ conversation }: Props) {
  const { user } = useAuth();
  const readonly = user.support?.access_mode === "support_readonly";
  const localeDaData = useLocaleDeData();
  const t = useT();
  const contact = conversation?.contacts ?? null;
  const contactId = contact?.id ?? null;
  const [desfechoDraft, setDesfechoDraft] = useState<DesfechoDraft | null>(null);
  // A saída do filtro produz null enquanto o detalhe carrega. O rascunho não
  // some nessa lacuna; outra conversa/contato real o descarta, sem expô-lo.
  useEffect(() => {
    if (conversation && desfechoDraft && (conversation.id !== desfechoDraft.conversationId || contactId !== desfechoDraft.contactId)) setDesfechoDraft(null);
  }, [conversation, contactId, desfechoDraft]);


  const [enrichment, setEnrichment] = useState<(ProspectEnrichment & { collected_at: string }) | null>(null);
  const [enrichmentError, setEnrichmentError] = useState(false);
  const [leads, setLeads] = useState<LeadRow[] | null>(null);
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [activities, setActivities] = useState<ActivityRow[] | null>(null);
  const [demandas, setDemandas] = useState<DemandaRow[] | null>(null);
  const [fatos, setFatos] = useState<Array<{ id: string; headline: string; body: string }>>([]);
  const [historico, setHistorico] = useState<Array<{ id: string; desfecho: string; fechada_em: string }>>([]);
  const [summaryContactId, setSummaryContactId] = useState<string | null>(null);
  /**
   * O TERCEIRO ESTADO. Antes existiam dois — carregando e "tem N itens" — e a
   * falha era traduzida para lista vazia, virando "Sem leads.": uma afirmação
   * sobre o NEGÓCIO feita em cima de um erro de leitura. Distinguir "não tem"
   * de "não consegui ler" é a diferença entre informar e mentir.
   */
  const [erro, setErro] = useState(false);
  const [tentativa, setTentativa] = useState(0);

  const [tagEditorOpen, setTagEditorOpen] = useState(false);
  const [leadDialogOpen, setLeadDialogOpen] = useState(false);
  const [leadAtivoId, setLeadAtivoId] = useState<string | null>(null);
  const defaultPipeline = useDefaultPipeline(leadDialogOpen);

  useEffect(() => {
    if (leadDialogOpen && defaultPipeline.isError) {
      toast.error(t("Nenhum funil configurado nesta organização."));
      setLeadDialogOpen(false);
    }
  }, [leadDialogOpen, defaultPipeline.isError, t]);

  useEffect(() => {
    if (!contactId) {
      setLeads(null);
      setOrders(null);
      setActivities(null);
      setDemandas(null);
      setFatos([]); setHistorico([]);
      setLeadAtivoId(null);
      return;
    }
    let cancelled = false;

    setErro(false);

    // Pela ROTA, não pelo cliente de navegador: o cookie de sessão é httpOnly,
    // então o supabase-js do browser não vê a sessão e consultava como `anon`
    // (medido: role=anon com gerente logado). Ver o cabeçalho da rota.
    async function load() {
      try {
        const r = await apiClient.get<{
          data: {
            enrichment?: (ProspectEnrichment & { collected_at: string }) | null;
            enrichment_error?: boolean;
            leads: LeadRow[];
            orders: OrderRow[];
            activities: ActivityRow[];
            demandas: DemandaRow[];
            fatos?: Array<{ id: string; headline: string; body: string }>;
            historico?: Array<{ id: string; desfecho: string; fechada_em: string }>;
          };
        }>(`/api/v1/contacts/${contactId}/crm-summary`);
        if (cancelled) return;
        setSummaryContactId(contactId);
        setEnrichment(r.data.enrichment ?? null);
        setEnrichmentError(r.data.enrichment_error ?? false);
        setLeads(r.data.leads);
        setOrders(r.data.orders);
        setActivities(r.data.activities);
        // `?? []` e não `?? null`: aqui a leitura DEU CERTO. Cair em `null`
        // faria a lista vazia se disfarçar do terceiro estado e o painel
        // mostraria esqueleto para sempre num contato sem demanda aberta —
        // que é o caso saudável.
        setDemandas(r.data.demandas ?? []);
        setFatos(r.data.fatos ?? []); setHistorico(r.data.historico ?? []);
      } catch {
        if (cancelled) return;
        // Falha NÃO vira lista vazia. Os dados ficam `null` e o painel diz que
        // não conseguiu ler — nunca que não há.
        setErro(true);
        setLeads(null);
        setOrders(null);
        setActivities(null);
        setDemandas(null);
        setFatos([]); setHistorico([]);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
    // AS DUAS DEPS NOVAS SÃO O REFETCH DA TROCA DE COMANDO.
    //
    // Este painel não usa react-query: ele busca num `useEffect` e guarda em
    // `useState`, então `invalidateQueries` não o alcança — e os hooks de
    // claim/transfer/release/pausar invalidam só as chaves de conversa. Resultado
    // medido: as quatro atividades novas ("Assumiu a conversa" e irmãs) nasciam no
    // banco e a seção "Atividade" ao lado NUNCA as mostrava, porque `contactId` não
    // muda quando o dono muda e o painel fica montado o tempo todo.
    //
    // Depender do DADO que muda é mais honesto que um contador de invalidação:
    // `assigned_to_user_id` cobre assumir/transferir/liberar e `bot_silenced_until`
    // cobre pausar e devolver — que são exatamente os quatro gestos que geram linha.
  }, [contactId, contact?.is_anonymized, tentativa, conversation?.assigned_to_user_id, conversation?.bot_silenced_until, conversation?.service_revision, conversation?.current_demanda_id]);

  // Recarrega o resumo pelo MESMO caminho do "Tentar de novo": o efeito depende
  // de `tentativa`, então a demanda recém-marcada volta do servidor em vez de
  // ser apagada da lista no cliente. Sumir no otimismo esconderia uma escrita
  // que falhou depois — e escrita que parece ter dado certo é o defeito que
  // esta tela inteira combate.
  const recarregar = useCallback(() => setTentativa((n) => n + 1), []);

  const tags = contact?.tags ?? [];
  const displayName = rotuloDoContato(contact, t);

  // `erro` PRIMEIRO, e não é detalhe: as três listas voltam a `null` quando a
  // leitura falha, e este derivado lê `null` como "ainda não chegou". Sem esta
  // guarda o painel mostraria esqueleto para sempre e o estado de falha nunca
  // apareceria — o mesmo colapso de significados que criou o defeito original,
  // só que trocando "erro→vazio" por "erro→carregando".
  const sectionsLoading = useMemo(
    () =>
      !erro &&
      (summaryContactId !== contactId || (leads === null && orders === null && activities === null && demandas === null)),
    [erro, summaryContactId, contactId, leads, orders, activities, demandas],
  );

  if (!conversation) {
    return (
      <aside className="flex h-full items-center justify-center border-l border-border p-4 text-center text-xs text-muted-foreground">
        {t("Selecione uma conversa para ver detalhes do contato.")}
      </aside>
    );
  }

  return (
    <aside className="flex h-full flex-col gap-4 overflow-y-auto border-l border-border bg-background p-4">
      <section>
        <h3 className="text-xs font-semibold text-text">
          {t("Contato")}
        </h3>
        <Card className="mt-2 space-y-2 p-3 text-sm">
          <div className="font-medium">{displayName}</div>
          {contact?.phone_number && (
            <div className="text-xs text-muted-foreground">{phoneForDisplay(contact.phone_number)}</div>
          )}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map((t) => (
                <ChipDeEtiqueta key={t} tag={t} className="h-4 px-1.5 text-[10px]" />
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-2 pt-1">
            {contactId&&conversation?<Link className="underline" href={`/app/agenda?contato=${contactId}&conversa=${conversation.id}`}>{t("Marcar compromisso")}</Link>:null}
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs"
              disabled={readonly || !contactId}
              aria-pressed={tagEditorOpen}
              onClick={() => setTagEditorOpen((v) => !v)}
            >
              <Tag size={12} className="mr-1" weight="regular" aria-hidden /> {t("Tags do contato")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs"
              disabled={readonly || !contactId || (leadDialogOpen && defaultPipeline.isLoading)}
              onClick={() => setLeadDialogOpen(true)}
            >
              <Users size={12} className="mr-1" weight="regular" aria-hidden />
              {leadDialogOpen && defaultPipeline.isLoading ? t("Carregando…") : t("Novo Lead")}
            </Button>
            {contactId && (
              <Button asChild size="sm" variant="ghost" className="h-7 px-2 text-xs">
                <Link href={`/app/contacts/${contactId}`}>
                  {t("Ver contato")}
                  <ArrowRight size={12} className="ml-1" weight="regular" aria-hidden />
                </Link>
              </Button>
            )}
          </div>
          {tagEditorOpen && contactId && <ContactTagsEditor contactId={contactId} orgId={conversation.organization_id} tags={tags} />}
        </Card>
      </section>

      <LeadEnrichment
        data={summaryContactId === contactId && !erro && !contact?.is_anonymized ? enrichment : null}
        loading={sectionsLoading}
        error={erro || (summaryContactId === contactId && enrichmentError)}
        onRetry={recarregar}
      />

      {contactId && defaultPipeline.data && (
        <NewLeadDialog
          open={leadDialogOpen}
          onOpenChange={setLeadDialogOpen}
          pipelineId={defaultPipeline.data.pipeline.id}
          stages={defaultPipeline.data.stages}
          contactId={contactId}
          onCreated={() => {
            setLeadAtivoId(null);
            recarregar();
          }}
        />
      )}

      <Separator />

      {!readonly && <ConversationTagsEditor
        conversationId={conversation.id}
        orgId={conversation.organization_id}
        tags={conversation.tags ?? []}
      />}

      <Separator />

      {/* ANTES dos negócios de propósito (doutrina cap. 5): lead é o negócio,
          conversa é o canal, demanda é o que precisa acabar. Quem abre esta
          conversa está atendendo alguém que pediu alguma coisa — a primeira
          pergunta a responder é o que ainda está pendente, não quanto vale. */}
      <DemandasSection
        sectionsLoading={sectionsLoading}
        demandas={demandas}
        conversationCurrentDemandaId={conversation.current_demanda_id}
        readonly={readonly}
        desfechoDraft={desfechoDraft}
        conversationId={conversation.id}
        contactId={contactId}
        setDesfechoDraft={setDesfechoDraft}
        recarregar={recarregar}
        erro={erro}
        onTentarDeNovo={() => setTentativa((n) => n + 1)}
      />

      <Separator />

      <section data-testid="inbox-memoria">
        <h3 className="text-xs font-semibold">{t("Memória do contato")}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{t("Fatos duráveis registrados nas notas. Pendências pertencem à demanda vigente.")}</p>
        {!sectionsLoading && fatos.map((f) => <details key={f.id} className="mt-2 text-xs"><summary>{f.headline}</summary><p className="mt-1 whitespace-pre-wrap">{f.body}</p></details>)}
        {!sectionsLoading && fatos.length === 0 && <p className="mt-2 text-xs text-muted-foreground">{t("Nenhum fato durável registrado.")}</p>}
        {!sectionsLoading && historico.length > 0 && <div className="mt-3 text-xs"><h4>{t("Histórico encerrado — sem tarefas pendentes")}</h4>{historico.map((h) => <p key={h.id}>{t(DESFECHO_LEGIVEL[h.desfecho] ?? h.desfecho)}{h.fechada_em ? ` · ${shortDate(h.fechada_em, localeDaData)}` : ""}</p>)}</div>}
      </section>
      <Separator />

      <section data-testid="inbox-campos-lead">
        <h3 className="text-xs font-semibold text-text">
          {t("Leads recentes")}
        </h3>
        {sectionsLoading ? (
          <Skeleton className="mt-2 h-14 w-full" />
        ) : leads && leads.length > 0 ? (
          <fieldset disabled={readonly}><InboxLeadEditor
            leads={leads}
            selecionadoId={leadAtivoId}
            onSelecionar={setLeadAtivoId}
            onSalvo={recarregar}
          /></fieldset>
        ) : (
          <SemLista vazio="Sem leads." erro={erro} onTentarDeNovo={() => setTentativa((n) => n + 1)} />
        )}
      </section>

      <Separator />

      <section>
        <h3 className="text-xs font-semibold text-text">
          {t("Pedidos recentes")}
        </h3>
        {sectionsLoading ? (
          <Skeleton className="mt-2 h-14 w-full" />
        ) : orders && orders.length > 0 ? (
          <ul className="mt-2 space-y-1.5">
            {orders.map((o) => (
              <li
                key={o.id}
                className="flex items-center justify-between rounded-md border border-border p-2 text-xs"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1 truncate font-medium">
                    <Receipt size={11} weight="regular" aria-hidden />
                    {o.external_id ?? o.id.slice(0, 8)}
                  </div>
                  <div className="text-muted-foreground">
                    {o.status ?? "—"} · {formatMoney(o.total_cents, o.currency)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <SemLista vazio="Sem pedidos." erro={erro} onTentarDeNovo={() => setTentativa((n) => n + 1)} />
        )}
      </section>

      <Separator />

      <section>
        <h3 className="text-xs font-semibold text-text">
          {t("Atividade")}
        </h3>
        {sectionsLoading ? (
          <Skeleton className="mt-2 h-14 w-full" />
        ) : activities && activities.length > 0 ? (
          <ul className="mt-2 space-y-1.5">
            {activities.map((a) => (
              <li key={a.id} className="rounded-md border border-border p-2 text-xs">
                {/* Rótulo do vocabulário único (activity-vocabulary), nunca o
                    tipo cru: a tela e o banco divergiram justamente por manter
                    duas listas. Marcador por ator, forma e não cor (§5). */}
                <div className="flex items-center gap-1.5 font-medium">
                  <span
                    className={cn(
                      "h-2 w-2 shrink-0",
                      actorShape(a.actor_kind) === "filled" && "rounded-full bg-accent",
                      actorShape(a.actor_kind) === "ring" &&
                        "rounded-full border border-accent bg-surface",
                      actorShape(a.actor_kind) === "dashed" &&
                        "rounded-full border border-dashed border-border-strong",
                    )}
                    aria-hidden
                  />
                  {t(activityLabel(a.type))}
                </div>
                {a.reason && <div className="mt-0.5 truncate text-muted-foreground">{t(a.reason)}</div>}
                <div className="text-muted-foreground">
                  {a.performed_by_name ?? t(actorLabel(a.actor_kind))} · {shortDate(a.performed_at, localeDaData)}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <SemLista vazio="Sem atividade." erro={erro} onTentarDeNovo={() => setTentativa((n) => n + 1)} />
        )}
      </section>
    </aside>
  );
}
