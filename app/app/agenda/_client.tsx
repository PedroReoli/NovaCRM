"use client";

import { useRouter } from "next/navigation";
import { format, startOfMonth } from "date-fns";
import * as React from "react";

import { EntradaDaAgenda } from "@/components/agenda/EntradaDaAgenda";
import { useLocaleDeData } from "@/hooks/i18n/useLocaleDeData";
import { useT } from "@/hooks/i18n/useT";
import type { Agendamento, HorarioLivre, VisaoDaAgenda } from "@/components/agenda/tipos";
import { ancoraLocalDoDia } from "@/lib/agenda/semana-semente";
import { janelaDoMesVisivel } from "@/lib/agenda/janela-do-mes-visivel";
import { useVinculoDaMarcacao } from "@/lib/agenda/vinculo-da-marcacao";
import { useAgendamentos } from "@/hooks/agenda/useAgendamentos";
import { useHorariosLivres } from "@/hooks/agenda/useHorariosLivres";
import { useMarcarAgendamento } from "@/hooks/agenda/useMarcarAgendamento";
import {
  useCancelarAgendamento,
  useRegistrarDesfecho,
  useRemarcarAgendamento,
} from "@/hooks/agenda/useRemarcarAgendamento";
import { usePessoasDaAgenda } from "@/hooks/agenda/usePessoasDaAgenda";

import { AvisoDaConexaoGoogle } from "./_components/AvisoDaConexaoGoogle";
import { CartaoDaConexaoGoogle } from "./_components/CartaoDaConexaoGoogle";
import { AgendaHeader } from "./_components/AgendaHeader";
import { SheetMarcacao } from "./_components/SheetMarcacao";
import { ModalCancelarAgendamento } from "./_components/ModalCancelarAgendamento";
import { AgendaSubNav, type AbaAgenda } from "./_components/AgendaSubNav";
import { AgendaHistorySection } from "./_components/AgendaHistorySection";
import { AgendaGridSection } from "./_components/AgendaGridSection";
import { addDays, endOfMonth, startOfDay, startOfWeek } from "date-fns";
import styles from "./agenda.module.css";

export function AgendaClient({
  fusoDeApresentacao,
  hojeNaOrganizacao,
  usuarioId,
  googleConfigurado,
  contaConectada,
  enderecoDeRetorno,
  faltaNoGoogle,
  linkDeConfiguracaoDoGoogle,
  tiposIniciais,
  agendamentosIniciais,
  podeMarcar,
}: {
  fusoDeApresentacao: string | null;
  hojeNaOrganizacao: string;
  usuarioId: string;
  googleConfigurado: boolean;
  contaConectada?: string | null;
  enderecoDeRetorno?: string;
  faltaNoGoogle: string[];
  linkDeConfiguracaoDoGoogle?: string;
  tiposIniciais: Array<{
    id: string;
    nome: string;
    duracaoMin: number;
    donoId: string | null;
    localKind: string | null;
    localDetalhes: string | null;
  }>;
  agendamentosIniciais: Agendamento[];
  podeMarcar: boolean;
}) {
  const localeDaData = useLocaleDeData();
  const t = useT();
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<AbaAgenda>("geral");
  const [marcando, setMarcando] = React.useState(false);
  const [marcadoEm, setMarcadoEm] = React.useState<string | null>(null);

  const {
    vinculo,
    registrarRota: registrarVinculoDaRota,
    reiniciar: reiniciarVinculo,
    escolher: escolherVinculo,
  } = useVinculoDaMarcacao();
  const contactId = vinculo.contact;
  const conversationId = vinculo.conversation;

  const onContext = React.useCallback(
    (contact: string, conversation: string) => {
      const trouxeCliente = registrarVinculoDaRota({ contact, conversation });
      if (podeMarcar && trouxeCliente) setMarcando(true);
    },
    [podeMarcar, registrarVinculoDaRota],
  );

  const abrirMarcacao = React.useCallback(() => {
    reiniciarVinculo();
    setMarcando(true);
  }, [reiniciarVinculo]);

  const [horarioEscolhido, setHorarioEscolhido] = React.useState<HorarioLivre | null>(null);
  const [remarcandoId, setRemarcandoId] = React.useState<string | null>(null);
  const [cancelandoId, setCancelandoId] = React.useState<string | null>(null);
  const [motivo, setMotivo] = React.useState("");
  const [emailConvidado, setEmailConvidado] = React.useState("");
  const emailConvidadoLimpo = emailConvidado.trim();
  const emailConvidadoInvalido =
    emailConvidadoLimpo.length > 0 && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailConvidadoLimpo);
  const [enderecoEditado, setEnderecoEditado] = React.useState<string | null>(null);
  const [observacao, setObservacao] = React.useState("");

  const marcar = useMarcarAgendamento();
  const remarcar = useRemarcarAgendamento();
  const cancelar = useCancelarAgendamento();
  const desfecho = useRegistrarDesfecho();

  const [tipoId, setTipoId] = React.useState<string | null>(() => tiposIniciais[0]?.id ?? null);
  const tipo = tiposIniciais.find((t) => t.id === tipoId) ?? tiposIniciais[0] ?? null;
  const endereco = enderecoEditado ?? tipo?.localDetalhes ?? "";
  const [visao, setVisao] = React.useState<VisaoDaAgenda>("semana");

  React.useEffect(() => {
    if (window.matchMedia("(max-width: 767px)").matches) setVisao("dia");
  }, []);

  const [isolada, setIsolada] = React.useState<string | null>(null);
  const [ancora, setAncora] = React.useState(() => ancoraLocalDoDia(hojeNaOrganizacao));
  const { data: pessoas = [] } = usePessoasDaAgenda();

  const [mesDoPainel, setMesDoPainel] = React.useState(() =>
    startOfMonth(ancoraLocalDoDia(hojeNaOrganizacao)),
  );
  const onMesVisivel = React.useCallback((mes: Date) => {
    const proximo = startOfMonth(mes);
    setMesDoPainel((atual) => (atual.getTime() === proximo.getTime() ? atual : proximo));
  }, []);

  const agoraDaAbertura = React.useMemo(
    () => new Date(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [marcando, tipo?.id],
  );
  const janelaDeBusca = React.useMemo(() => {
    const { de, ate } = janelaDoMesVisivel(mesDoPainel, agoraDaAbertura);
    return { de: de.toISOString(), ate: ate.toISOString() };
  }, [mesDoPainel, agoraDaAbertura]);

  const { data: horarios, isError: horariosFalharam } = useHorariosLivres(
    marcando && tipo
      ? { event_type_id: tipo.id, de: janelaDeBusca.de, ate: janelaDeBusca.ate }
      : null,
  );

  const horariosPorDia = React.useMemo(() => {
    const mapa: Record<string, Array<{ instante: string; rotulo: string }>> = {};
    for (const s of horarios?.slots ?? []) {
      const d = new Date(s.inicio);
      const chave = format(d, "yyyy-MM-dd");
      (mapa[chave] ??= []).push({ instante: s.inicio, rotulo: format(d, "HH:mm") });
    }
    return mapa;
  }, [horarios]);

  const recorteDaGrade = React.useMemo(() => {
    const inicio =
      visao === "mes"
        ? startOfMonth(ancora)
        : visao === "semana"
          ? startOfWeek(ancora, { weekStartsOn: 0 })
          : startOfDay(ancora);
    const fim =
      visao === "mes"
        ? addDays(endOfMonth(ancora), 1)
        : addDays(inicio, visao === "semana" ? 7 : 1);
    return { de: inicio.toISOString(), ate: fim.toISOString() };
  }, [visao, ancora]);

  const [recorteDoServidor] = React.useState(() => recorteDaGrade);
  const naJanelaDoServidor =
    recorteDaGrade.de === recorteDoServidor.de && recorteDaGrade.ate === recorteDoServidor.ate;

  const { data: agendamentosVivos } = useAgendamentos(recorteDaGrade);
  const todos: Agendamento[] =
    agendamentosVivos ?? (naJanelaDoServidor ? agendamentosIniciais : []);

  const agendamentos = React.useMemo(
    () => (isolada === null ? todos : todos.filter((a) => a.responsavelId === isolada)),
    [isolada, todos],
  );

  const agendamentosDaGrade = React.useMemo(
    () => agendamentos.filter((a) => a.situacao !== "cancelled"),
    [agendamentos],
  );

  const agendamentosAcionaveis = React.useMemo(
    () => agendamentos.filter((a) => a.origem !== "google_sync"),
    [agendamentos],
  );

  const passo = visao === "mes" ? 30 : visao === "semana" ? 7 : 1;
  const periodo =
    visao === "mes"
      ? format(ancora, t("MMMM 'de' yyyy"), { locale: localeDaData })
      : visao === "semana"
        ? `${format(startOfWeek(ancora, { weekStartsOn: 0 }), t("d 'de' MMM"), { locale: localeDaData })} — ${format(addDays(startOfWeek(ancora, { weekStartsOn: 0 }), 6), t("d 'de' MMM"), { locale: localeDaData })}`
        : format(ancora, t("EEEE, d 'de' MMMM"), { locale: localeDaData });

  return (
    <div
      data-testid="tela-agenda"
      data-fonte={agendamentosIniciais.length > 0 ? "api" : "api-sem-dado"}
      data-fuso={fusoDeApresentacao ?? "organizacao"}
      className={styles.agendaContainer}
    >
      <React.Suspense fallback={null}>
        <AvisoDaConexaoGoogle />
        <EntradaDaAgenda onContext={onContext} />
      </React.Suspense>

      <AgendaSubNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        totalCompromissos={agendamentosAcionaveis.length}
        googleConectado={Boolean(contaConectada)}
      />

      {/* Cartão de aviso rápido do Google só na visão geral se desconfigurado, ou na aba google */}
      {(activeTab === "geral" && (!googleConfigurado || faltaNoGoogle.length > 0)) ||
      activeTab === "google" ? (
        <CartaoDaConexaoGoogle
          configurado={googleConfigurado}
          falta={faltaNoGoogle}
          linkDeConfiguracao={linkDeConfiguracaoDoGoogle}
          contaConectada={contaConectada}
          enderecoDeRetorno={enderecoDeRetorno}
        />
      ) : null}

      {/* Header com filtros de período, visão e membros (ativo na visão geral e na grade) */}
      {activeTab === "geral" || activeTab === "grade" ? (
        <AgendaHeader
          hojeNaOrganizacao={hojeNaOrganizacao}
          podeMarcar={podeMarcar}
          tipo={tipo}
          abrirMarcacao={abrirMarcacao}
          passo={passo}
          periodo={periodo}
          setAncora={setAncora}
          pessoas={pessoas}
          isolada={isolada}
          setIsolada={setIsolada}
          visao={visao}
          setVisao={setVisao}
        />
      ) : null}

      <SheetMarcacao
        marcando={marcando}
        setMarcando={setMarcando}
        remarcandoId={remarcandoId}
        setRemarcandoId={setRemarcandoId}
        horarioEscolhido={horarioEscolhido}
        setHorarioEscolhido={setHorarioEscolhido}
        emailConvidado={emailConvidado}
        setEmailConvidado={setEmailConvidado}
        enderecoEditado={enderecoEditado}
        setEnderecoEditado={setEnderecoEditado}
        observacao={observacao}
        setObservacao={setObservacao}
        reiniciarVinculo={reiniciarVinculo}
        marcadoEm={marcadoEm}
        setMarcadoEm={setMarcadoEm}
        setAncora={setAncora}
        contactId={contactId}
        conversationId={conversationId}
        escolherVinculo={escolherVinculo}
        tiposIniciais={tiposIniciais}
        tipo={tipo}
        setTipoId={setTipoId}
        emailConvidadoInvalido={emailConvidadoInvalido}
        emailConvidadoLimpo={emailConvidadoLimpo}
        endereco={endereco}
        hojeNaOrganizacao={hojeNaOrganizacao}
        pessoas={pessoas}
        usuarioId={usuarioId}
        horarios={horarios}
        horariosPorDia={horariosPorDia}
        horariosFalharam={horariosFalharam}
        onMesVisivel={onMesVisivel}
        podeMarcar={podeMarcar}
        agendamentos={agendamentos}
        remarcar={remarcar}
        marcar={marcar}
      />

      <ModalCancelarAgendamento
        cancelandoId={cancelandoId}
        setCancelandoId={setCancelandoId}
        motivo={motivo}
        setMotivo={setMotivo}
        cancelar={cancelar}
        todos={todos}
        localeDaData={localeDaData}
      />

      {/* Histórico: visível compacto em 'geral' ou expandido em 'historico' */}
      {activeTab === "geral" || activeTab === "historico" ? (
        <AgendaHistorySection
          agendamentosAcionaveis={agendamentosAcionaveis}
          agendamentos={agendamentos}
          pessoas={pessoas}
          agora={new Date()}
          isExpanded={activeTab === "historico"}
          onRemarcar={(id) => {
            setRemarcandoId(id);
            setMarcando(true);
          }}
          onCancelar={(id) => {
            setMotivo("");
            setCancelandoId(id);
          }}
          onConfirmar={(id, revision) => desfecho.mutate({ id, revision, status: "confirmed" })}
          onRealizado={(id, revision) => desfecho.mutate({ id, revision, status: "completed" })}
          onFaltou={(id, revision) => desfecho.mutate({ id, revision, status: "no_show" })}
        />
      ) : null}

      {/* Grade interativa: visível em 'geral' e 'grade' */}
      {activeTab === "geral" || activeTab === "grade" ? (
        <AgendaGridSection
          visao={visao}
          ancora={ancora}
          agora={new Date()}
          pessoas={pessoas}
          agendamentosDaGrade={agendamentosDaGrade}
          recorteDaGrade={recorteDaGrade}
          tiposIniciais={tiposIniciais}
          tipo={tipo ? { id: tipo.id, duracaoMin: tipo.duracaoMin } : null}
          onEscolherTipo={setTipoId}
          totalAgendamentos={agendamentos.length}
          onMarcarEm={
            podeMarcar
              ? (instante) => {
                  setHorarioEscolhido({ instante, rotulo: format(new Date(instante), "HH:mm") });
                  setRemarcandoId(null);
                  abrirMarcacao();
                }
              : undefined
          }
          onAbrirAgendamento={(id) => router.push(`/app/agenda?compromisso=${id}`)}
        />
      ) : null}
    </div>
  );
}
