"use client";

import { useRouter } from "next/navigation";

import { EntradaDaAgenda } from "@/components/agenda/EntradaDaAgenda";
import { useLocaleDeData } from "@/hooks/i18n/useLocaleDeData";
import { useT } from "@/hooks/i18n/useT";
import { addDays, endOfMonth, format, startOfDay, startOfMonth, startOfWeek } from "date-fns";
import * as React from "react";

import { AvisoDaConexaoGoogle } from "./_components/AvisoDaConexaoGoogle";
import { CartaoDaConexaoGoogle } from "./_components/CartaoDaConexaoGoogle";
import { AgendaHeader } from "./_components/AgendaHeader";
import { SheetMarcacao } from "./_components/SheetMarcacao";
import { ModalCancelarAgendamento } from "./_components/ModalCancelarAgendamento";

import { AgendaInterativa } from "@/components/agenda/AgendaInterativa";
import { HistoricoDaAgenda } from "@/components/agenda/HistoricoDaAgenda";
import type { Agendamento, HorarioLivre, VisaoDaAgenda } from "@/components/agenda/tipos";
import { EmptyAgenda } from "@/components/empty";
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

/**
 * A tela da Agenda.
 *
 * ⚠️ SEM DADO NENHUM até a frente 1 (API + motor) integrar. A tela cai no
 * estado vazio de propósito, e a razão é de SEGURANÇA PERCEBIDA, não de
 * pureza:
 *
 * dado falso PLAUSÍVEL numa tela real de produto multi-tenant é
 * indistinguível de VAZAMENTO. "Ana Prado", "Marina Alves", "Visita ao imóvel"
 * são nomes brasileiros críveis nos nichos que este produto atende — e o
 * relato que chega de quem vê isso não é "tem dado de teste na tela", é
 * "estou vendo paciente de outra clínica na minha agenda". O time então queima
 * horas caçando um furo de RLS que não existe. Achado do QAVivo, decisão 18.
 *
 * Repare na inversão, porque ela é o ponto: os MESMOS nomes são ACERTO na
 * vitrine (`/vitrine-agenda`), onde tornam o desenho julgável, e o pior
 * formato possível aqui. Mesmo dado, valor oposto conforme onde está pendurado.
 *
 * E o vazio é mais VERDADEIRO: numa instalação nova a agenda está vazia mesmo.
 * De quebra exercita o estado vazio, que é onde mora a primeira impressão.
 *
 * `data-fonte` declara isso no DOM para ser verificável de fora — e
 * `tests/unit/telas-sem-dado-de-mentira.test.ts` impede que alguém religue os
 * imports sem querer.
 */
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
  /**
   * A data de HOJE no fuso da ORGANIZAÇÃO, resolvida pelo servidor
   * (`yyyy-MM-dd`). É a mesma que gerou a semente de compromissos.
   */
  hojeNaOrganizacao: string;
  /** Id de quem está logado — a única fonte para o rótulo "Você". */
  usuarioId: string;
  googleConfigurado: boolean;
  contaConectada?: string | null;
  enderecoDeRetorno?: string;
  faltaNoGoogle: string[];
  /** Preenchido só para quem administra a instalação — ver `page.tsx`. */
  linkDeConfiguracaoDoGoogle?: string;
  /** Tipos ativos, resolvidos no servidor: não há rota que os liste ainda. */
  tiposIniciais: Array<{
    id: string;
    nome: string;
    duracaoMin: number;
    donoId: string | null;
    localKind: string | null;
    localDetalhes: string | null;
  }>;
  /** A semana corrente, resolvida no servidor: `GET /agendamentos` não existe. */
  agendamentosIniciais: Agendamento[];
  /**
   * Quem está logado pode MARCAR — o mesmo piso da rota (`requireRole("agent")`
   * em `app/api/v1/agenda/agendamentos/route.ts`).
   *
   * É a MESMA porta, com o MESMO piso, em todos os gestos de escrita desta tela:
   * o botão "Novo agendamento", o clique num bloco livre da grade, o encaixe
   * ("Outro horário") do painel e o "Marcar compromisso" que chega por
   * `?contato=`. Oferecer qualquer uma delas a quem só lê é oferecer um 403 —
   * com a recusa chegando DEPOIS do gesto, que é o defeito que este nome veio
   * fechar. Esconder aqui é cortesia: quem decide segue sendo a rota.
   */
  podeMarcar: boolean;
}) {
  const localeDaData = useLocaleDeData();
  const t = useT();
  const router = useRouter();
  const [marcando, setMarcando] = React.useState(false);
  // O compromisso criado NESTA abertura do painel. Serve para levar a grade até
  // ele quando o painel fechar por qualquer caminho — ver `ancoraAoFecharPainel`.
  const [marcadoEm, setMarcadoEm] = React.useState<string | null>(null);
  // QUEM SERÁ ATENDIDO. A regra inteira — e por que ela não é "limpar ao
  // fechar" — está em `lib/agenda/vinculo-da-marcacao.ts`. Em uma frase: o
  // painel abre com o vínculo que a ROTA carrega (`?contato=…&conversa=…`, o
  // link "Marcar compromisso" do Inbox), e o que a pessoa escolhe dentro dele
  // vive só enquanto ele está aberto.
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
      // Só abre sozinho quando a rota TROUXE um cliente: a chamada sem cliente
      // é a que avisa que a página deixou de ter contexto, e ela não é um
      // pedido para marcar nada.
      const trouxeCliente = registrarVinculoDaRota({ contact, conversation });
      // TERCEIRA PORTA da mesma escrita: o "Marcar compromisso" do Inbox chega
      // por aqui e abriria o painel. Para quem só lê, o vínculo até pode ser
      // registrado — é estado inerte, sem superfície — mas o painel NÃO abre:
      // abri-lo seria a mesma promessa que o botão e a grade fariam, com o 403
      // chegando no fim do gesto.
      if (podeMarcar && trouxeCliente) setMarcando(true);
    },
    [podeMarcar, registrarVinculoDaRota],
  );
  /** Abrir o painel do zero: o vínculo volta a ser o da rota, nunca o da vez anterior. */
  const abrirMarcacao = React.useCallback(() => {
    reiniciarVinculo();
    setMarcando(true);
  }, [reiniciarVinculo]);
  // O horário que veio de um CLIQUE NA GRADE. Preenchido, o painel abre já em
  // "confirmando" naquele instante; vazio, ele abre pedindo o dia, como sempre.
  const [horarioEscolhido, setHorarioEscolhido] = React.useState<HorarioLivre | null>(null);
  // REMARCAR reusa o painel de marcação: escolher horário novo é o MESMO gesto
  // de escolher o primeiro, e uma segunda tela para a mesma pergunta seria duas
  // coisas para manter em sincronia. Quando `remarcandoId` está preenchido, a
  // confirmação vira PATCH em vez de POST.
  const [remarcandoId, setRemarcandoId] = React.useState<string | null>(null);
  // CANCELAR pede motivo, e o motivo é obrigatório na rota. Não é burocracia: é
  // o que a equipe lê ao ver o horário vago.
  const [cancelandoId, setCancelandoId] = React.useState<string | null>(null);
  const [motivo, setMotivo] = React.useState("");
  // O CONVIDADO, opcional. O e-mail da ficha do cliente já vai no convite
  // do Google quando existe. Este campo é a outra pessoa (acompanhante).
  // Vazio = só o cliente (se tiver e-mail) ou só a agenda do atendente.
  const [emailConvidado, setEmailConvidado] = React.useState("");
  const emailConvidadoLimpo = emailConvidado.trim();
  // A MESMA pergunta que a rota faz, feita aqui só para não gastar um 422 com
  // uma letra faltando no domínio. A rota continua sendo a dona da recusa — esta
  // checagem é conveniência, não autoridade, e por isso é deliberadamente frouxa
  // (o e-mail de verdade se prova entregando, não com regex).
  const emailConvidadoInvalido =
    emailConvidadoLimpo.length > 0 && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailConvidadoLimpo);
  // `null` = ainda não mexeu: o campo mostra o local do TIPO. String (mesmo
  // vazia) = a pessoa editou, e o tipo novo não pode devolver o que ela apagou.
  const [enderecoEditado, setEnderecoEditado] = React.useState<string | null>(null);
  const [observacao, setObservacao] = React.useState("");
  const marcar = useMarcarAgendamento();
  const remarcar = useRemarcarAgendamento();
  const cancelar = useCancelarAgendamento();
  const desfecho = useRegistrarDesfecho();
  // ⚠️ ERA `tiposIniciais[0] ?? null` — uma constante, sem seletor em lugar
  // nenhum. `page.tsx` ordena os tipos por NOME, então a tela marcava sempre o
  // primeiro em ordem alfabética e não havia como marcar outro: numa org com
  // "Atendimento", "Consulta", "Reunião", só "Atendimento" era alcançável pela
  // tela. As categorias existiam no banco, no seed e na API — e a tela oferecia
  // uma. Achado escrevendo a spec de marcar, não lendo o código.
  const [tipoId, setTipoId] = React.useState<string | null>(() => tiposIniciais[0]?.id ?? null);
  const tipo = tiposIniciais.find((t) => t.id === tipoId) ?? tiposIniciais[0] ?? null;
  const endereco = enderecoEditado ?? tipo?.localDetalhes ?? "";
  const [visao, setVisao] = React.useState<VisaoDaAgenda>("semana");
  /**
   * No CELULAR a agenda abre no DIA, não na semana.
   *
   * Duas razões, e a segunda é consequência da primeira. A semana em 360px é
   * ilegível — por isso a grade esconde as outras colunas abaixo de `md`. Mas o
   * passo de navegação da semana é de SETE dias: quem visse um dia só e tocasse
   * em avançar pularia a semana inteira, sem alcançar os outros seis. Abrindo no
   * dia, o passo é 1 e cada toque anda um dia.
   *
   * Em `useEffect`, e não no estado inicial, porque `window` não existe no
   * servidor: decidir a visão na primeira renderização faria o HTML do servidor
   * discordar do cliente. Roda uma vez, na montagem, então não desfaz escolha
   * de quem trocou a visão depois.
   */
  React.useEffect(() => {
    // O aviso da regra é justo em geral; aqui trocar a visão É o ponto do efeito.
    // A largura só existe no cliente, e decidir antes divergiria da hidratação.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (window.matchMedia("(max-width: 767px)").matches) setVisao("dia");
  }, []);
  const [isolada, setIsolada] = React.useState<string | null>(null);
  /**
   * A ÂNCORA NASCE DO RELÓGIO DA ORGANIZAÇÃO, não do navegador.
   *
   * Era `useState(() => new Date())`. O servidor desenha a semana no fuso da
   * organização (decisão do dono em #1350) e o cliente recalculava no fuso do
   * NAVEGADOR: das 21h de sábado à meia-noite em São Paulo, com servidor em UTC,
   * os dois discordavam e a tela piscava a semana seguinte — e, para quem abre o
   * CRM fora do fuso da empresa, discordava sempre.
   *
   * O que atravessa a fronteira é a DATA (`hojeNaOrganizacao`), nunca o
   * instante: `domingo 00:00` em São Paulo é `sábado 22:00` em UTC-5, e
   * `startOfWeek` sobre esse instante, em hora local, cairia na semana anterior.
   * `ancoraLocalDoDia` transforma a data numa `Date` local ao meio-dia — a doze
   * horas de qualquer borda de horário de verão.
   */
  const [ancora, setAncora] = React.useState(() => ancoraLocalDoDia(hojeNaOrganizacao));

  // AS PESSOAS SÃO REAIS, e vêm da lista MÍNIMA da agenda — `/api/v1/agenda/pessoas`
  // (`ROTA_DA_LISTA_DE_PESSOAS`, `lib/agenda/lista-de-pessoas.ts`), papel mínimo
  // `agent` e só id/nome. Com a trilha de cor derivada do `user_id`.
  //
  // ⚠️ ESTA LINHA DIZIA `/api/v1/team`, E A FRASE MENTIA. Ela descrevia o estado
  // de antes do item 1 da issue 896, quando a agenda pedia a equipe à rota de
  // administração — que é `manager+` e devolve e-mail e último acesso — e o
  // Atendente levava 403 só por abrir a tela (virava aviso de falta de
  // permissão sobre uma grade que continuava lá). A rota mínima consertou isso;
  // a prosa ficou. Medido nesta rodada:
  //   grep -rn "api/v1/team" app/app/agenda/ | grep -v "\(//\|\*\)"  → vazio
  // É por isso que a frase foi reescrita em vez de apagada: quem lê o código
  // para entender o 403 do Atendente precisa saber que ele JÁ não existe, e um
  // comentário que afirma o contrário é o defeito de novo.
  const { data: pessoas = [] } = usePessoasDaAgenda();

  // A JANELA ACOMPANHA O MÊS QUE O PAINEL MOSTRA.
  //
  // ⚠️ Isto era `hoje + 30 dias`, fixo na abertura. O mês visível era estado
  // LOCAL do painel, a consulta não ia junto, e "Próximo mês" desligava assim
  // que acabavam os dias já pedidos — daqui a dois meses o calendário parava
  // e a ocupação do Google acusava período sem cobertura, mesmo com a janela
  // de agendamento do tipo (60 dias por padrão, até 365) ainda valendo.
  //
  // A estabilidade continua: a chave do React Query só muda quando o mês, o
  // tipo ou a abertura mudam — nunca a cada render. `new Date()` aqui corre
  // uma vez por essas mudanças, não no corpo.
  // Mesmo relógio da grade: o mini-calendário abre no mês da ORGANIZAÇÃO.
  const [mesDoPainel, setMesDoPainel] = React.useState(() =>
    startOfMonth(ancoraLocalDoDia(hojeNaOrganizacao)),
  );
  const onMesVisivel = React.useCallback((mes: Date) => {
    const proximo = startOfMonth(mes);
    setMesDoPainel((atual) => (atual.getTime() === proximo.getTime() ? atual : proximo));
  }, []);
  // Reabrir o painel ou trocar o tipo pede `agora` novo. O relógio não entra
  // na chave do React Query por milissegundo — só quando estes mudam.
  const agoraDaAbertura = React.useMemo(
    () => new Date(),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `new Date()` é o ponto: o valor só pode mudar quando a abertura ou o tipo mudam.
    [marcando, tipo?.id],
  );
  const janelaDeBusca = React.useMemo(() => {
    const { de, ate } = janelaDoMesVisivel(mesDoPainel, agoraDaAbertura);
    return { de: de.toISOString(), ate: ate.toISOString() };
  }, [mesDoPainel, agoraDaAbertura]);

  // Os horários vêm da rota real — a mesma que a IA usa, então tela e agente
  // oferecem exatamente os mesmos horários. Só consulta quando o painel abre.
  // `isError` junto, e não só `data`: sem ele a tela MENTE por default. O
  // `publicouHorarios={horarios?.publicou_horarios ?? true}` abaixo transforma
  // "a consulta falhou" em "publicou, só não tem vaga" — dias travados e aviso
  // nenhum, que é exatamente o que uma instalação fresca produz (a rota devolve
  // 422 porque ninguém está em `attendant_availability`).
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

  // OS AGENDAMENTOS SÃO REAIS, e agora TAMBÉM se atualizam sem recarregar.
  //
  // ⚠️ O comentário que estava aqui dizia que `GET /api/v1/agenda/agendamentos`
  // "ainda não existe (a rota tem POST, PATCH e DELETE)". Era verdade quando foi
  // escrito e VENCEU: `grep -n "^export async function" app/api/v1/agenda/agendamentos/route.ts`
  // devolve GET:95. A prosa descrevia um estado, o estado mudou, e a frase ficou
  // — junto com o `useAgendamentos`, que existia inteiro e não era montado por
  // ninguém (1 ocorrência no repo: a própria definição).
  //
  // A prop do RSC segue sendo a PRIMEIRA pintura (sem piscar, sem spinner) e o
  // hook assume dali: `useMarcarAgendamento` já invalida `["agenda"]`, então
  // marcar pela tela repinta a grade sozinho.
  // O recorte acompanha o que a grade DESENHA — mesma visão, mesma âncora.
  // Instante ISO, nunca o filtro `dia`: o cabeçalho do hook mede por que
  // (`dia=` corta em UTC e some com o compromisso das 22h no fuso de São Paulo).
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

  // A janela que o SERVIDOR pintou. Sem esta comparação, navegar para outra
  // semana mostraria os compromissos DESTA por um instante — o fallback estaria
  // respondendo a uma pergunta que ninguém fez. Cair para lista vazia é pior de
  // aparência e melhor de verdade: a grade fica vazia por um piscar, em vez de
  // mostrar compromisso no dia errado.
  // ⚠️ `useState` com inicializador, e NÃO `useRef(...).current`.
  //
  // A intenção é a mesma — congelar a janela da primeira pintura —, mas ler
  // `.current` durante o render é violação de regra do React, e o `pnpm lint`
  // reprova com "Cannot access refs during render". Foi o CI que me disse: eu
  // tinha rodado typecheck e vitest e NÃO tinha rodado lint. O `verify` cai nos
  // três, e eu só olhei dois.
  //
  // `useState(() => x)[0]` faz o mesmo congelamento sem tocar em ref no render.
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

  // A GRADE não mostra cancelado — ele fica só na aba "Cancelados" do
  // histórico, que lê `agendamentos` (cheio) e o separa sozinha em `separar()`.
  // Mesma fonte, dois recortes: a grade responde "o que está de pé", o
  // histórico responde "o que aconteceu", cancelado incluso.
  const agendamentosDaGrade = React.useMemo(
    () => agendamentos.filter((a) => a.situacao !== "cancelled"),
    [agendamentos],
  );

  /**
   * O que é ACIONÁVEL — o que a lista "Próximos" pode oferecer botão para fazer.
   *
   * Ocupação vinda do Google fica de fora: ela é bloco de terceiro, o id é de
   * `calendar_external_events`, e as rotas de remarcar/cancelar procuram em
   * `calendar_appointments`. Ver o comentário longo no `HistoricoDaAgenda`
   * abaixo, com o 404 medido.
   *
   * A GRADE recebe `agendamentosDaGrade` (tudo menos cancelado) — é lá que a ocupação
   * precisa aparecer, e é lá que ela já é desenhada inerte.
   */
  const agendamentosAcionaveis = React.useMemo(
    () => agendamentos.filter((a) => a.origem !== "google_sync"),
    [agendamentos],
  );

  const passo = visao === "mes" ? 30 : visao === "semana" ? 7 : 1;
  // O PADRÃO de formato também muda de idioma, não só o locale: em português
  // "d 'de' MMMM" tem a preposição escrita à mão dentro do padrão, e em
  // espanhol ela também é "de" — mas quem garante isso é a chave no dicionário,
  // não a coincidência. Passando o padrão por `t()`, um idioma que ordene a
  // data de outro jeito não precisa de código novo aqui.
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
      className="flex h-full flex-col gap-4 p-6"
    >
      {/*
        Em Suspense porque `useSearchParams` obriga: sem a fronteira, o Next
        reprova o build da rota. Fallback nulo porque a ausência do aviso é o
        estado normal — quem chega pela navegação não tem query nenhuma.
      */}
      <React.Suspense fallback={null}>
        <AvisoDaConexaoGoogle />
        <EntradaDaAgenda onContext={onContext} />
      </React.Suspense>

      <CartaoDaConexaoGoogle
        configurado={googleConfigurado}
        falta={faltaNoGoogle}
        linkDeConfiguracao={linkDeConfiguracaoDoGoogle}
        contaConectada={contaConectada}
        enderecoDeRetorno={enderecoDeRetorno}
      />

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

      {/*
        ⚠️ A LISTA DAQUI NÃO É A MESMA DA GRADE, e a diferença é uma linha.

        `GradeDaAgenda` conhece `origem` e desenha o bloco do Google inerte
        (`disabled`, sem arraste, rótulo "Ocupado"). `HistoricoDaAgenda` NÃO
        conhece origem: ela decide o botão por `disabled={!onRemarcar}`, que é
        uma prop do componente inteiro e não da linha. Passar a mesma lista aos
        dois faz a ocupação do Google chegar em "Próximos" com **Remarcar e
        Cancelar habilitados** — e cancelar responde 404, porque o id é de
        `calendar_external_events` e a rota procura em `calendar_appointments`.

        Medido pela tela em 2026-09-03, na triagem do PR #474:

          DELETE /api/v1/agenda/agendamentos
          → 404 {"error":{"code":"not_found","message":"Agendamento não encontrado."}}
          toast vermelho aos 1,5s, o painel continua aberto, a linha continua na
          lista, e `calendar_external_events.status` segue `confirmed`.

        É o "controle decorativo" que o comentário de `GradeDaAgenda` diz que
        esta base já pagou uma vez, replantado no componente irmão — e o #474 o
        tornou PERMANENTE: antes dele a linha só existia no primeiro frame da
        semana corrente (a semente do servidor) e sumia no primeiro refetch.

        Filtrar é o conserto certo, e não é escolha estética: bloco anônimo do
        Google não é um compromisso NOSSO. Não há o que remarcar, não há o que
        cancelar, e "Ocupado · 15:00–16:00" numa lista de próximos atendimentos
        não informa nada que a grade — que O DESENHA no horário — já não diga
        melhor. A ocupação continua inteira onde ela serve.
      */}
      <HistoricoDaAgenda
        agendamentos={agendamentosAcionaveis}
        pessoas={pessoas}
        agora={new Date()}
        className="max-h-[320px]"
        // ⚠️ ESTAS DUAS PROPS FALTAVAM, e a ausência tinha cara de permissão.
        // `HistoricoDaAgenda` usa `disabled={!onRemarcar}`; sem elas os botões
        // nasciam cinzas em toda linha, de toda organização — e o `title` dizia
        // "Disponível quando a agenda estiver conectada", que é falso: PATCH e
        // DELETE não tocam o Google. Só a IA conseguia remarcar ou cancelar.
        onRemarcar={(id) => {
          setRemarcandoId(id);
          setMarcando(true);
        }}
        onCancelar={(id) => {
          setMotivo("");
          setCancelandoId(id);
        }}
        // E ESTAS DUAS TAMBÉM FALTAVAM — o conserto acima alcançou 2 dos 4
        // botões do MESMO componente, e "Realizado"/"Faltou" ficaram cinzas,
        // com a mesma frase falsa, por mais tempo ainda. Conserto por instância
        // custa a segunda passada; a varredura custaria um `grep`.
        //
        // Sem cerimônia de confirmação, ao contrário de cancelar: registrar
        // desfecho não avisa ninguém e se desfaz voltando o status. Cancelar
        // exige motivo porque é o que a equipe lê ao ver o horário vago.
        // CONFIRMAR usa o mesmo `desfecho` que realizado/faltou: os três são o
        // mesmo PATCH com outro `status`. Criar um hook próprio duplicaria a
        // invalidação de cache e o tratamento de erro por nada.
        onConfirmar={(id) =>
          desfecho.mutate({
            id,
            revision: agendamentos.find((a) => a.id === id)?.revision,
            status: "confirmed",
          })
        }
        onRealizado={(id) =>
          desfecho.mutate({
            id,
            revision: agendamentos.find((a) => a.id === id)?.revision,
            status: "completed",
          })
        }
        onFaltou={(id) =>
          desfecho.mutate({
            id,
            revision: agendamentos.find((a) => a.id === id)?.revision,
            status: "no_show",
          })
        }
      />

      {/* ⚠️ O VAZIO NÃO ESCONDE MAIS A GRADE, e o achado veio do CI.
          Isto era um ternário: com zero agendamentos, `EmptyAgenda` entrava NO
          LUGAR de `GradeDaAgenda`. Numa instalação nova — que é o estado de
          primeira impressão — a pessoa abria a Agenda e não via calendário
          NENHUM: sem semana, sem horários, e com o alternador de visão ligado a
          nada, que é controle decorativo.

          A mensagem continua, porque ela é boa: diz de ONDE vem o próximo
          agendamento em vez de constatar a ausência. Ela virou aviso ACIMA da
          grade, e a grade fica.

          Achado porque a cerca nova das três visões passou aqui (banco com
          dados de execuções anteriores) e reprovou no CI, onde o banco nasce
          limpo. O mesmo formato do defeito que `agenda-tela-do-produto` já
          tinha pago: verde por banco sujo. */}
      {agendamentos.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface p-4">
          <EmptyAgenda />
        </div>
      ) : null}
      {/* A GRADE INTERATIVA — clicar num bloco livre marca ali, arrastar um card
          remarca. Toda a fiação (a consulta de horários da janela desenhada, a
          proposta de remarcação, o otimismo com volta atrás) mora em
          `AgendaInterativa`; aqui fica só o que esta tela já sabia. */}
      <AgendaInterativa
        visao={visao}
        ancora={ancora}
        agora={new Date()}
        pessoas={pessoas}
        agendamentos={agendamentosDaGrade}
        recorte={recorteDaGrade}
        tipos={tiposIniciais.map((t) => ({ id: t.id, nome: t.nome, duracaoMin: t.duracaoMin }))}
        tipo={tipo ? { id: tipo.id, duracaoMin: tipo.duracaoMin } : null}
        onEscolherTipo={setTipoId}
        // SEGUNDA PORTA: o clique num bloco livre da grade. Sem `onMarcarEm`, a
        // `AgendaInterativa` não monta a interação, e a grade volta a ser o que
        // ela é para quem só lê — uma leitura, sem bloco clicável.
        onMarcarEm={
          podeMarcar
            ? (instante) => {
                setHorarioEscolhido({ instante, rotulo: format(new Date(instante), "HH:mm") });
                setRemarcandoId(null);
                // `abrirMarcacao` e não `setMarcando(true)`: clicar num bloco
                // livre abre uma marcação NOVA, e ela nasce com o vínculo da rota.
                abrirMarcacao();
              }
            : undefined
        }
        /* Tocar num card abre o detalhe. A prop já atravessava `AgendaInterativa`
           e `GradeDaAgenda` e chegava `undefined` aqui: o toque não fazia nada, e
           o detalhe só abria por `?compromisso=`, que apenas o Histórico e o Radar
           linkavam. Reusa o MESMO parâmetro que `EntradaDaAgenda` já lê — e `push`,
           não `replace`, porque é o que o Histórico faz com `<Link>` e é o que faz
           o botão voltar do celular fechar o detalhe. */
        onAbrirAgendamento={(id) => router.push(`/app/agenda?compromisso=${id}`)}
        className="min-h-0 flex-1"
      />
    </div>
  );
}
