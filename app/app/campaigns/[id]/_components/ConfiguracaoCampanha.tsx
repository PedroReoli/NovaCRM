"use client";

import { Card } from "@/components/ui/card";
import { type CampanhaDetalhada } from "@/hooks/campanhas/useCampanhas";
import { useAgentesPublicados, useFunis } from "@/hooks/campanhas/useDestinoDaCampanha";
import { channelLabel, useChannelSessions } from "@/hooks/channels/useChannelSessions";
import { useT } from "@/hooks/i18n/useT";
import styles from "./ConfiguracaoCampanha.module.css";

interface ConfiguracaoCampanhaProps {
  campanha: CampanhaDetalhada;
}

/**
 * O que acontece com quem responde: em qual funil o card nasce e quem atende.
 */
export function DestinoDaCampanha({ campanha }: ConfiguracaoCampanhaProps) {
  const t = useT();
  const funis = useFunis();
  const agentes = useAgentesPublicados();
  if (!campanha.pipeline_id && !campanha.agent_id) return null;

  const funil = (funis.data ?? []).find((f) => f.id === campanha.pipeline_id);
  const agente = (agentes.data ?? []).find((a) => a.id === campanha.agent_id);

  return (
    <Card className={styles.card}>
      <h2 className={styles.titulo}>{t("Quem responder")}</h2>
      {campanha.pipeline_id && (
        <p className={styles.infoLinha}>
          {t("Vira card no funil")}: <strong>{funil?.name ?? t("funil removido")}</strong>
        </p>
      )}
      {campanha.agent_id && (
        <p className={styles.infoLinha}>
          {t("Quem atende a resposta")}: <strong>{agente?.name ?? t("agente indisponível")}</strong>
        </p>
      )}
    </Card>
  );
}

/**
 * Por quais números a campanha fala.
 */
export function NumerosDaCampanha({ campanha }: ConfiguracaoCampanhaProps) {
  const t = useT();
  const canais = useChannelSessions();
  const extras = campanha.channel_session_ids ?? [];
  if (extras.length === 0) return null;

  const nome = (id: string) => {
    const c = (canais.data ?? []).find((x) => x.id === id);
    return c ? channelLabel(c, t) : id.slice(0, 8);
  };

  return (
    <Card className={styles.card}>
      <h2 className={styles.titulo}>{t("Números desta campanha")}</h2>
      <p className={styles.descricao}>
        {t(
          "A cada envio, a campanha usa o número com mais folga no teto do dia — e o número que a pessoa já conhece, quando ela já conversou com algum deles.",
        )}
      </p>
      <ul className={styles.listaCanais}>
        {[campanha.channel_session_id, ...extras].map((id) => (
          <li key={id} className={styles.itemCanal}>
            {nome(id)}
          </li>
        ))}
      </ul>
    </Card>
  );
}
