"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiClient } from "@/lib/api/client";
import { useT } from "@/hooks/i18n/useT";
import type { CampaignConfig } from "@/lib/prospecting/schema";
import type { CreatedProspectingAgent } from "./_create-agent";
import type { ProspectingAgentSetupInput } from "@/lib/prospecting/agent-setup-schema";
import type { State } from "./_types";
import { emptyConfig } from "./_types";
import { CampaignsList } from "./_campaigns-list";
import { CampaignOverviewCard } from "./_campaign-overview-card";
import { ProspectingCandidatesTable } from "./_prospecting-candidates-table";
import { ProspectingSearchForm } from "./_prospecting-search-form";
import { PrepararAbordagem } from "./_components/PrepararAbordagem";
import styles from "./prospecting.module.css";

export function ProspectingClient() {
  const t = useT();
  const query = useQuery({
    queryKey: ["prospecting"],
    queryFn: async () => (await apiClient.get<{ data: State }>("/api/v1/prospecting")).data,
    refetchInterval: 10000,
  });
  const data = query.data;

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [settings, setSettings] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [campaignDrafts, setCampaignDrafts] = useState<Record<string, CampaignConfig>>({});
  const [manualCampaigns, setManualCampaigns] = useState<Record<string, boolean>>({});
  const [createdAgents, setCreatedAgents] = useState<{ id: string; name: string }[]>([]);

  const campaign = data?.campaigns.find((c) => c.id === selected) ?? data?.campaigns[0];
  const config = campaign?.config ?? (campaign && campaignDrafts[campaign.id]) ?? emptyConfig;
  const manual = !!campaign && (manualCampaigns[campaign.id] || !!campaign.config);
  const agents = [
    ...new Map(
      [...(data?.agents ?? []), ...createdAgents].map((agent) => [agent.id, agent]),
    ).values(),
  ];

  function setConfig(updateFn: CampaignConfig | ((previous: CampaignConfig) => CampaignConfig)) {
    if (!campaign || campaign.config) return;
    setCampaignDrafts((drafts) => ({
      ...drafts,
      [campaign.id]:
        typeof updateFn === "function" ? updateFn(drafts[campaign.id] ?? emptyConfig) : updateFn,
    }));
  }

  async function selectCreatedAgent(
    campaignId: string,
    result: CreatedProspectingAgent,
    setup: Omit<
      ProspectingAgentSetupInput,
      "request_id" | "campaign_id" | "enable_router_continuity"
    >,
  ) {
    setCreatedAgents((current) => [
      ...current.filter((agent) => agent.id !== result.agent.id),
      result.agent,
    ]);
    setCampaignDrafts((drafts) => ({
      ...drafts,
      [campaignId]: {
        ...(drafts[campaignId] ?? emptyConfig),
        agent_id: result.agent.id,
        channel_session_id: setup.channel_session_id,
        pipeline_id: setup.pipeline_id,
        stage_id: setup.stage_id,
        qualified_stage_id: setup.qualified_stage_id,
        instruction: setup.instruction,
        qualification: setup.qualification,
      },
    }));
    setManualCampaigns((current) => ({ ...current, [campaignId]: false }));
    await query.refetch();
    setNotice(
      `${t("Agente publicado e selecionado.")} ${result.model_label}. ${t("Revise o ritmo e inicie a campanha quando estiver pronto.")}`,
    );
  }

  const candidates = data?.candidates.filter((c) => c.campaign_id === campaign?.id) ?? [];

  async function perform(body: unknown, message: string) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await apiClient.post("/api/v1/prospecting", body);
      await query.refetch();
      setNotice(message);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : t("Não foi possível concluir a operação."));
      return false;
    } finally {
      setBusy(false);
    }
  }

  const update = <K extends keyof CampaignConfig>(field: K, value: CampaignConfig[K]) =>
    setConfig((c) => ({ ...c, [field]: value }));

  return (
    <main className={styles.container}>
      <header className={styles.cabecalho}>
        <div>
          <p className={styles.kicker}>CRM</p>
          <h1 className={styles.titulo}>{t("Prospecção")}</h1>
          <p className={styles.subtitulo}>
            {t("Encontre empresas, aborde aos poucos e acompanhe quem avança na conversa.")}
          </p>
        </div>
        <Button variant="outline" onClick={() => setSettings((s) => !s)}>
          {t("Configurar busca")}
        </Button>
      </header>

      {(error || query.error) && (
        <div role="alert" className={styles.alertaErro}>
          {error ??
            (query.error instanceof Error
              ? query.error.message
              : t("Falha ao carregar a prospecção."))}
        </div>
      )}

      {notice && (
        <div role="status" className={styles.notificacaoStatus}>
          {notice}
        </div>
      )}

      {!data && !query.error && <p role="status" className={styles.carregando}>{t("Carregando campanhas…")}</p>}

      <div className={styles.layoutGrade}>
        <aside className={styles.painelLateral}>
          <ProspectingSearchForm
            configured={data?.configured}
            busy={busy}
            settings={settings}
            setSettings={setSettings}
            onPerform={perform}
            onSearchSuccess={() => {
              setSelected(null);
            }}
          />
          <CampaignsList
            campaigns={data?.campaigns}
            selectedId={campaign?.id ?? null}
            onSelect={(id) => {
              setSelected(id);
              setNotice(null);
            }}
          />
        </aside>

        <div className={styles.painelConteudo}>
          {!campaign && (
            <Card className={styles.cardVazio}>
              <h2 className={styles.tituloVazio}>{t("Sua próxima conversa começa aqui")}</h2>
              <p className={styles.descricaoVazio}>
                {t(
                  "Escolha um segmento e uma região. Depois da pesquisa, defina como a IA deve abordar e o que precisa confirmar para qualificar.",
                )}
              </p>
            </Card>
          )}

          {campaign && (
            <>
              <CampaignOverviewCard
                campaign={campaign}
                candidates={candidates}
                busy={busy}
                onPerform={perform}
              />

              <PrepararAbordagem
                campaign={campaign}
                candidates={candidates}
                data={data}
                config={config}
                setConfig={setConfig}
                update={update}
                manual={manual}
                setManualCampaigns={setManualCampaigns}
                agents={agents}
                selectCreatedAgent={selectCreatedAgent}
                perform={perform}
                busy={busy}
              />

              <ProspectingCandidatesTable candidates={candidates} />
            </>
          )}
        </div>
      </div>
    </main>
  );
}
