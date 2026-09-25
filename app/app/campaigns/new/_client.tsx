"use client";
/**
 * Criar campanha (PRD §8).
 *
 * ═══ Por que SEÇÕES e não um wizard de cinco passos ═══
 *
 * O PRD recomenda o wizard; a ordem das perguntas aqui é a mesma dele
 * (Informações → Público → Mensagem → Entrega), mas numa página só.
 */
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { useCriarCampanha, usePreviaDaAudiencia } from "@/hooks/campanhas/useCampanhas";
import { useChannelSessions } from "@/hooks/channels/useChannelSessions";
import { useT } from "@/hooks/i18n/useT";
import {
  useAgentesPublicados,
  useEtapas,
  useFunis,
} from "@/hooks/campanhas/useDestinoDaCampanha";

import { listar } from "./_types";
import { SecaoInformacoes } from "./_components/SecaoInformacoes";
import { SecaoPublico } from "./_components/SecaoPublico";
import { SecaoMensagem } from "./_components/SecaoMensagem";
import { SecaoAtendimento } from "./_components/SecaoAtendimento";
import { SecaoRitmo } from "./_components/SecaoRitmo";
import styles from "./new-campaign.module.css";

export function NovaCampanha() {
  const t = useT();
  const router = useRouter();
  const canais = useChannelSessions();
  const criar = useCriarCampanha();
  const previa = usePreviaDaAudiencia();

  const [nome, setNome] = useState("");
  const [canal, setCanal] = useState("");
  const [baseLegal, setBaseLegal] = useState<"consent" | "legitimate_interest">("consent");
  const [liaRef, setLiaRef] = useState("");
  const [comAlgumaTag, setComAlgumaTag] = useState("");
  const [semTags, setSemTags] = useState("");
  const [semInteracao, setSemInteracao] = useState("");
  const [limite, setLimite] = useState("100");
  const [texto, setTexto] = useState("");
  const [intervalo, setIntervalo] = useState("");
  const [janelaInicio, setJanelaInicio] = useState("");
  const [janelaFim, setJanelaFim] = useState("");
  const [tetoDiario, setTetoDiario] = useState("");
  const [tetoHorario, setTetoHorario] = useState("");
  const [extras, setExtras] = useState<string[]>([]);
  const [funil, setFunil] = useState("");
  const [etapa, setEtapa] = useState("");
  const [agente, setAgente] = useState("");
  const [funilDoPublico, setFunilDoPublico] = useState("");
  const [etapaDoPublico, setEtapaDoPublico] = useState("");

  const funis = useFunis();
  const etapas = useEtapas(funil || null);
  const etapasDoPublico = useEtapas(funilDoPublico || null);
  const agentes = useAgentesPublicados();

  const filtro = useMemo(
    () => ({
      com_alguma_tag: listar(comAlgumaTag),
      sem_tags: listar(semTags),
      sem_interacao_ha_dias: semInteracao ? Number(semInteracao) : null,
      funis: funilDoPublico ? [funilDoPublico] : [],
      etapas: etapaDoPublico ? [etapaDoPublico] : [],
      limite: Number(limite) || 100,
    }),
    [comAlgumaTag, semTags, semInteracao, funilDoPublico, etapaDoPublico, limite],
  );

  const temCriterio =
    filtro.com_alguma_tag.length > 0 ||
    filtro.sem_tags.length > 0 ||
    filtro.funis.length > 0 ||
    filtro.etapas.length > 0 ||
    filtro.sem_interacao_ha_dias !== null;

  const podeSalvar =
    nome.trim() !== "" &&
    canal !== "" &&
    texto.trim() !== "" &&
    temCriterio &&
    (baseLegal !== "legitimate_interest" || liaRef.trim() !== "");

  async function salvar() {
    const criada = await criar.mutateAsync({
      name: nome.trim(),
      channel_session_id: canal,
      message_body: texto.trim(),
      base_legal: baseLegal,
      lia_ref: liaRef.trim() || null,
      audience_filter: filtro,
      intervalo_segundos: intervalo ? Number(intervalo) : null,
      janela_inicio_hora: janelaInicio ? Number(janelaInicio) : null,
      janela_fim_hora: janelaFim ? Number(janelaFim) : null,
      teto_diario: tetoDiario ? Number(tetoDiario) : null,
      teto_horario: tetoHorario ? Number(tetoHorario) : null,
      channel_session_ids: extras,
      pipeline_id: funil || null,
      stage_id: etapa || null,
      agent_id: agente || null,
    });
    router.push(`/app/campaigns/${criada.id}`);
  }

  return (
    <div className={styles.container}>
      <header className={styles.cabecalho}>
        <h1 className={styles.titulo}>{t("Nova campanha")}</h1>
        <p className={styles.subtitulo}>
          {t("Isto cria um rascunho. Nada é enviado antes de você preparar a lista e iniciar.")}
        </p>
      </header>

      <SecaoInformacoes
        nome={nome}
        setNome={setNome}
        canal={canal}
        setCanal={setCanal}
        canais={canais.data ?? []}
        extras={extras}
        setExtras={setExtras}
        baseLegal={baseLegal}
        setBaseLegal={setBaseLegal}
        liaRef={liaRef}
        setLiaRef={setLiaRef}
      />

      <SecaoPublico
        comAlgumaTag={comAlgumaTag}
        setComAlgumaTag={setComAlgumaTag}
        semTags={semTags}
        setSemTags={setSemTags}
        semInteracao={semInteracao}
        setSemInteracao={setSemInteracao}
        funilDoPublico={funilDoPublico}
        setFunilDoPublico={setFunilDoPublico}
        etapaDoPublico={etapaDoPublico}
        setEtapaDoPublico={setEtapaDoPublico}
        limite={limite}
        setLimite={setLimite}
        funis={funis.data ?? []}
        etapasDoPublico={etapasDoPublico.data ?? []}
        temCriterio={temCriterio}
        onVerQuantasPessoas={() =>
          previa.mutate({ audience_filter: filtro, message_body: texto })
        }
        isPreviaPending={previa.isPending}
        previaData={previa.data}
      />

      <SecaoMensagem texto={texto} setTexto={setTexto} />

      <SecaoAtendimento
        funil={funil}
        setFunil={setFunil}
        etapa={etapa}
        setEtapa={setEtapa}
        agente={agente}
        setAgente={setAgente}
        funis={funis.data ?? []}
        etapas={etapas.data ?? []}
        agentes={agentes.data ?? []}
      />

      <SecaoRitmo
        intervalo={intervalo}
        setIntervalo={setIntervalo}
        tetoDiario={tetoDiario}
        setTetoDiario={setTetoDiario}
        tetoHorario={tetoHorario}
        setTetoHorario={setTetoHorario}
        janelaInicio={janelaInicio}
        setJanelaInicio={setJanelaInicio}
        janelaFim={janelaFim}
        setJanelaFim={setJanelaFim}
      />

      <div className={styles.rodapeAcoes}>
        <Button variant="outline" onClick={() => router.push("/app/campaigns")}>
          {t("Cancelar")}
        </Button>
        <Button disabled={!podeSalvar || criar.isPending} onClick={() => void salvar()}>
          {criar.isPending ? t("Salvando…") : t("Salvar rascunho")}
        </Button>
      </div>
    </div>
  );
}
