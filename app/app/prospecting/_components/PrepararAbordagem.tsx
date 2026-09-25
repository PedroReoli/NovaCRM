"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useT } from "@/hooks/i18n/useT";
import type { CampaignConfig } from "@/lib/prospecting/schema";
import type { ProspectingAgentSetupInput } from "@/lib/prospecting/agent-setup-schema";
import { ProspectingAgentBuilder, type CreatedProspectingAgent } from "../_create-agent";
import type { Campaign, Candidate, State } from "../_types";
import { selectClass } from "../_types";
import styles from "./PrepararAbordagem.module.css";

interface PrepararAbordagemProps {
  campaign: Campaign;
  candidates: Candidate[];
  data?: State;
  config: CampaignConfig;
  setConfig: (update: CampaignConfig | ((previous: CampaignConfig) => CampaignConfig)) => void;
  update: <K extends keyof CampaignConfig>(field: K, value: CampaignConfig[K]) => void;
  manual: boolean;
  setManualCampaigns: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  agents: { id: string; name: string }[];
  selectCreatedAgent: (
    campaignId: string,
    result: CreatedProspectingAgent,
    setup: Omit<
      ProspectingAgentSetupInput,
      "request_id" | "campaign_id" | "enable_router_continuity"
    >,
  ) => Promise<void>;
  perform: (body: unknown, message: string) => Promise<boolean>;
  busy: boolean;
}

export function PrepararAbordagem({
  campaign,
  candidates,
  data,
  config,
  setConfig,
  update,
  manual,
  setManualCampaigns,
  agents,
  selectCreatedAgent,
  perform,
  busy,
}: PrepararAbordagemProps) {
  const t = useT();
  const funil = config.pipeline_id;

  if (
    campaign.status !== "draft" ||
    campaign.search_status !== "succeeded" ||
    candidates.length === 0
  ) {
    return null;
  }

  return (
    <Card className={styles.card}>
      <h2 className={styles.titulo}>{t("2. Preparar a abordagem")}</h2>
      <p className={styles.subtitulo}>
        {t(
          "A IA usa o agente escolhido para abrir a conversa e atender as respostas. As proteções do canal continuam valendo.",
        )}
      </p>

      {!campaign.config && (
        <div className={styles.conteudoModo}>
          <div className={styles.botoesModo}>
            <Button
              type="button"
              variant={!manual ? "secondary" : "outline"}
              onClick={() =>
                setManualCampaigns((current) => ({
                  ...current,
                  [campaign.id]: false,
                }))
              }
            >
              {t("Configurar por conversa")}
            </Button>
            <Button
              type="button"
              variant={manual ? "secondary" : "outline"}
              onClick={() =>
                setManualCampaigns((current) => ({ ...current, [campaign.id]: true }))
              }
            >
              {t("Usar agente existente / configurar manualmente")}
            </Button>
          </div>

          {!manual && !config.agent_id && data && (
            <ProspectingAgentBuilder
              key={campaign.id}
              campaign={campaign}
              config={config}
              channels={data.channels}
              stages={data.stages}
              onCreated={selectCreatedAgent}
            />
          )}

          {!manual && config.agent_id && (
            <section
              aria-label={t("Agente selecionado")}
              className={styles.boxAgentePronto}
            >
              <p className={styles.nomeAgentePronto}>
                {agents.find((agent) => agent.id === config.agent_id)?.name ??
                  t("Agente selecionado")}
              </p>
              <p className={styles.instrucaoAgentePronto}>
                {config.instruction}
              </p>
              <div className={styles.linksAgentePronto}>
                <Link
                  className="underline"
                  href={`/app/ai/agents/${config.agent_id}`}
                >
                  {t("Configurações avançadas do agente")}
                </Link>
                <Link
                  className="underline"
                  href={`/app/ai/agents/${config.agent_id}#voice-assistant`}
                >
                  {t("Configurar assistente de voz")}
                </Link>
              </div>
              <p className={styles.notaApoio}>
                {t(
                  "Agente pronto. Escolha o ritmo abaixo e inicie quando estiver preparado.",
                )}
              </p>
            </section>
          )}
        </div>
      )}

      {(manual || config.agent_id) && (
        <form
          className={styles.formAbordagem}
          onSubmit={(e) => {
            e.preventDefault();
            void perform(
              { action: "start", id: campaign.id, config },
              t(
                "Campanha iniciada. A primeira abordagem será preparada após um minuto.",
              ),
            );
          }}
        >
          {campaign.config && (
            <p className={styles.avisoPreservado}>
              {t(
                "Esta campanha já começou a preparar contatos. Sua configuração foi preservada para retomar com segurança.",
              )}
            </p>
          )}
          <fieldset disabled={!!campaign.config} className={styles.fieldset}>
            {manual && (
              <div className="space-y-4">
                <div className={styles.gradeDupla}>
                  <div className={styles.campo}>
                    <Label htmlFor="prospecting-agent">{t("Agente de IA")}</Label>
                    <select
                      id="prospecting-agent"
                      className={`${selectClass} mt-1`}
                      value={config.agent_id}
                      onChange={(e) => update("agent_id", e.target.value)}
                      required
                    >
                      <option value="">{t("Escolha um agente publicado")}</option>
                      {agents.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                    {config.agent_id && (
                      <Link
                        className={styles.linkApoio}
                        href={`/app/ai/agents/${config.agent_id}`}
                      >
                        {t("Configurações avançadas do agente")}
                      </Link>
                    )}
                  </div>
                  <div className={styles.campo}>
                    <Label htmlFor="prospecting-channel">
                      {t("Conexão de saída")}
                    </Label>
                    <select
                      id="prospecting-channel"
                      className={`${selectClass} mt-1`}
                      value={config.channel_session_id}
                      onChange={(e) => update("channel_session_id", e.target.value)}
                      required
                    >
                      <option value="">{t("Escolha uma conexão ativa")}</option>
                      {data?.channels
                        .filter((c) => c.status === "WORKING")
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.display_name ?? c.phone_number ?? c.id}
                          </option>
                        ))}
                    </select>
                    <Link className={styles.linkApoio} href="/app/connections">
                      {t("Ver conexões e proteções de envio")}
                    </Link>
                  </div>
                </div>

                <div className={styles.campo}>
                  <Label htmlFor="prospecting-pipeline">{t("Funil")}</Label>
                  <select
                    id="prospecting-pipeline"
                    className={`${selectClass} mt-1`}
                    value={funil}
                    required
                    onChange={(e) => {
                      setConfig((c) => ({
                        ...c,
                        pipeline_id: e.target.value,
                        stage_id: "",
                        qualified_stage_id: "",
                      }));
                    }}
                  >
                    <option value="">{t("Escolha o funil")}</option>
                    {[
                      ...new Map(
                        data?.stages.map((s) => [s.pipeline_id, s.pipeline_name]),
                      ).entries(),
                    ].map(([id, name]) => (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.gradeDupla}>
                  {(
                    [
                      ["stage_id", "Etapa inicial"],
                      ["qualified_stage_id", "Etapa de qualificados"],
                    ] as const
                  ).map(([field, label]) => (
                    <div key={field} className={styles.campo}>
                      <Label htmlFor={`prospecting-${field}`}>{t(label)}</Label>
                      <select
                        id={`prospecting-${field}`}
                        className={`${selectClass} mt-1`}
                        required
                        value={config[field]}
                        onChange={(e) => update(field, e.target.value)}
                      >
                        <option value="">{t("Escolha a etapa")}</option>
                        {data?.stages
                          .filter((s) => s.pipeline_id === funil)
                          .map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  ))}
                </div>

                <div className={styles.campo}>
                  <Label htmlFor="prospecting-instruction">
                    {t("O que a IA deve oferecer e como iniciar")}
                  </Label>
                  <Textarea
                    id="prospecting-instruction"
                    value={config.instruction}
                    onChange={(e) => update("instruction", e.target.value)}
                    required
                    minLength={10}
                    maxLength={2000}
                    className="mt-1"
                    placeholder={t(
                      "Descreva sua oferta e o objetivo da primeira conversa.",
                    )}
                  />
                </div>

                <div className={styles.campo}>
                  <Label htmlFor="prospecting-qualification">
                    {t("Quando considerar o cliente qualificado")}
                  </Label>
                  <Textarea
                    id="prospecting-qualification"
                    value={config.qualification}
                    onChange={(e) => update("qualification", e.target.value)}
                    required
                    minLength={10}
                    maxLength={2000}
                    className="mt-1"
                    placeholder={t(
                      "Ex.: confirmou a necessidade, participa da decisão e deseja conversar sobre a solução.",
                    )}
                  />
                </div>
              </div>
            )}

            <div className={styles.gradeDupla}>
              <div className={styles.campo}>
                <Label htmlFor="prospecting-daily">{t("Máximo em 24 horas")}</Label>
                <Input
                  id="prospecting-daily"
                  type="number"
                  min={1}
                  max={50}
                  required
                  value={config.daily_limit}
                  onChange={(e) => update("daily_limit", Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div className={styles.campo}>
                <Label htmlFor="prospecting-spacing">
                  {t("Intervalo mínimo (minutos)")}
                </Label>
                <Input
                  id="prospecting-spacing"
                  type="number"
                  min={5}
                  max={1440}
                  required
                  value={config.interval_minutes}
                  onChange={(e) => update("interval_minutes", Number(e.target.value))}
                  className="mt-1"
                />
              </div>
            </div>

            <div className={styles.campo}>
              <Label htmlFor="prospecting-basis">
                {t("Referência da avaliação de legítimo interesse")}
              </Label>
              <Input
                id="prospecting-basis"
                value={config.legal_basis_ref}
                onChange={(e) => update("legal_basis_ref", e.target.value)}
                minLength={3}
                maxLength={500}
                required
                className="mt-1"
              />
              <p className={styles.notaApoio}>
                {t(
                  "Informe a referência real da avaliação que fundamenta esta prospecção. Isso não registra consentimento dos contatos.",
                )}
              </p>
            </div>
            <p className={styles.notaApoio}>
              {t(
                "Ao iniciar, os contatos novos com telefone entram no funil. Contatos já existentes são preservados. A fila faz uma primeira abordagem; respostas seguem no Inbox. Uma mensagem já em transmissão pode concluir após a pausa.",
              )}
            </p>
          </fieldset>
          <div>
            <Button
              type="submit"
              disabled={
                busy ||
                !agents.length ||
                !data?.channels.some((c) => c.status === "WORKING")
              }
            >
              {t("Iniciar abordagens com IA")}
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}
