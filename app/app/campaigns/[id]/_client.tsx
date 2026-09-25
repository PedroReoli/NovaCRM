"use client";
/**
 * A campanha por dentro (PRD §25): resumo, mensagem, público, destinatários e as
 * ações que cabem NO ESTADO ATUAL.
 *
 * ═══ Por que os botões somem em vez de desabilitar ═══
 *
 * "Iniciar" numa campanha concluída não é uma ação bloqueada, é uma ação que não
 * existe. Botão cinza convida a clicar e depois explica; a máquina de estados já
 * sabe o que cabe, e a tela mostra só isso (PRD §34: evitar ações impossíveis).
 *
 * ═══ Por que o número de "quem ficou de fora" tem destaque ═══
 *
 * É a pergunta que o operador faz primeiro quando 500 viram 80. Sem o motivo ao
 * lado do número, ele conclui que o sistema comeu a lista.
 */
import Link from "next/link";
import { useState } from "react";

import { EstadoDaCampanha } from "@/components/campanhas/EstadoDaCampanha";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAcaoDeCampanha,
  useCampanha,
  useDestinatarios,
  useMetricasDaCampanha,
  type AcaoDeCampanha,
} from "@/hooks/campanhas/useCampanhas";
import { useT } from "@/hooks/i18n/useT";
import { ArrowBendUpLeft } from "@/lib/ui/icons";

import { ROTULO_DA_ACAO } from "./_types";
import { TesteDaCampanha } from "./_components/TesteDaCampanha";
import { RitmoDaCampanha } from "./_components/RitmoDaCampanha";
import { DestinoDaCampanha, NumerosDaCampanha } from "./_components/ConfiguracaoCampanha";
import { DestinatariosLista } from "./_components/DestinatariosLista";
import styles from "./campaign-detail.module.css";

export function DetalheDaCampanha({ id }: { id: string }) {
  const t = useT();
  const campanha = useCampanha(id);
  const metricas = useMetricasDaCampanha(id, campanha.data?.status);
  const [filtroDeStatus, setFiltroDeStatus] = useState("");
  const destinatarios = useDestinatarios(id, { status: filtroDeStatus || undefined });
  const acao = useAcaoDeCampanha(id);
  const [confirmando, setConfirmando] = useState<AcaoDeCampanha | null>(null);
  const [testando, setTestando] = useState(false);

  if (campanha.isLoading) {
    return (
      <div className="space-y-3 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }
  if (campanha.isError || !campanha.data) {
    return (
      <div className="p-6">
        <Card className="p-6 text-center">
          <p className="text-sm text-error-fg">{t("Não foi possível carregar a campanha.")}</p>
          <Button size="sm" variant="outline" className="mt-2" onClick={() => campanha.refetch()}>
            {t("Tentar novamente")}
          </Button>
        </Card>
      </div>
    );
  }

  const c = campanha.data;
  const m = metricas.data;
  const linhas = destinatarios.data?.pages.flatMap((p) => p.data) ?? [];

  // As ações que cabem NO ESTADO — a mesma tabela da máquina de estados do
  // servidor, que é quem recusa de verdade.
  const disponiveis: AcaoDeCampanha[] = [];
  if (c.status === "draft") disponiveis.push("preparar", "cancelar");
  if (c.status === "ready") disponiveis.push("testar", "iniciar", "cancelar");
  if (c.status === "running") disponiveis.push("pausar", "cancelar");
  if (c.status === "scheduled") disponiveis.push("pausar", "cancelar");
  if (c.status === "paused") disponiveis.push("retomar", "cancelar");
  disponiveis.push("duplicar");

  return (
    <div className={styles.container}>
      <div>
        <Link href="/app/campaigns" className={styles.navVoltar}>
          <ArrowBendUpLeft size={14} aria-hidden />
          {t("Campanhas")}
        </Link>
      </div>

      <header className={styles.cabecalho}>
        <div className={styles.tituloSecao}>
          <div className={styles.tituloLinha}>
            <h1 className={styles.titulo}>{c.name}</h1>
            <EstadoDaCampanha status={c.status} />
          </div>
          {c.failure_code && (
            <p className={styles.erroFalha}>
              {t("Último problema")}: {c.failure_code}
            </p>
          )}
        </div>
        <div className={styles.acoes}>
          {c.status === "draft" && (
            <Button variant="outline" asChild>
              <Link href={`/app/campaigns/${c.id}/edit`}>{t("Editar")}</Link>
            </Button>
          )}
          {disponiveis.map((a) => (
            <Button
              key={a}
              variant={a === "cancelar" ? "outline" : "default"}
              disabled={acao.isPending}
              onClick={() => {
                if (a === "iniciar" || a === "cancelar") setConfirmando(a);
                else if (a === "testar") setTestando(true);
                else acao.mutate({ acao: a });
              }}
            >
              {t(ROTULO_DA_ACAO[a])}
            </Button>
          ))}
        </div>
      </header>

      {confirmando && (
        <Card className={styles.cardConfirmacao}>
          <p className={styles.textoConfirmacao}>
            {confirmando === "iniciar"
              ? `${t("Começar a enviar para")} ${c.snapshot_eligible} ${c.snapshot_eligible === 1 ? t("pessoa?") : t("pessoas?")} ${t("O envio segue o ritmo do número e pode levar horas.")}`
              : t("Cancelar é definitivo: quem ainda não recebeu não recebe mais, e a campanha não volta a rodar.")}
          </p>
          <div className={styles.botoesConfirmacao}>
            <Button
              disabled={acao.isPending}
              onClick={() => {
                acao.mutate({ acao: confirmando });
                setConfirmando(null);
              }}
            >
              {t("Confirmar")}
            </Button>
            <Button variant="outline" onClick={() => setConfirmando(null)}>
              {t("Voltar")}
            </Button>
          </div>
        </Card>
      )}

      {testando && (
        <TesteDaCampanha
          onCancelar={() => setTestando(false)}
          onEnviar={(contactId) => {
            acao.mutate({ acao: "testar", corpo: { contact_id: contactId } });
            setTestando(false);
          }}
          enviando={acao.isPending}
        />
      )}

      <div className={styles.gradeMetricas}>
        <div className={styles.cardMetrica}>
          <p className={styles.metricaTitulo}>{t("Na lista")}</p>
          <p className={styles.metricaValor}>{c.snapshot_eligible}</p>
        </div>
        <div className={styles.cardMetrica}>
          <p className={styles.metricaTitulo}>{t("Enviadas")}</p>
          <p className={styles.metricaValor}>{m?.contagem.enviados ?? 0}</p>
        </div>
        <div className={styles.cardMetrica}>
          <p className={styles.metricaTitulo}>{t("Entregues")}</p>
          <p className={styles.metricaValor}>{m?.contagem.entregues ?? 0}</p>
        </div>
        <div className={styles.cardMetrica}>
          <p className={styles.metricaTitulo}>{t("Responderam")}</p>
          <p className={styles.metricaValor}>{m?.contagem.responderam ?? 0}</p>
        </div>
      </div>

      {m && (
        <Card className={styles.cardProgresso}>
          <div className={styles.progressoTopo}>
            <h2 className={styles.progressoTitulo}>{t("Progresso")}</h2>
            <span className={styles.progressoPorcentagem}>
              {Math.round(m.progresso * 100)}%
            </span>
          </div>
          <div className={styles.trilhoProgresso}>
            <div
              className={styles.barraProgresso}
              style={{ width: `${Math.round(m.progresso * 100)}%` }}
              role="progressbar"
              aria-valuenow={Math.round(m.progresso * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={t("Progresso do envio")}
            />
          </div>
          <p className={styles.progressoDetalhes}>
            {m.contagem.pendentes} {t("ainda não enviadas")} · {m.contagem.falharam} {t("falharam")} ·{" "}
            {m.contagem.optOut} {t("pediram para parar")}
          </p>
        </Card>
      )}

      <DestinoDaCampanha campanha={c} />

      <NumerosDaCampanha campanha={c} />

      <RitmoDaCampanha campanha={c} />

      <Card className={styles.cardMensagem}>
        <h2 className={styles.mensagemTitulo}>{t("Mensagem")}</h2>
        <p className={styles.mensagemCorpo}>{c.message_body}</p>
        <p className={styles.mensagemBaseLegal}>
          {t("Base legal")}: {c.base_legal === "consent" ? t("consentimento") : t("interesse legítimo")}
          {c.lia_ref ? ` (${c.lia_ref})` : ""}
        </p>
      </Card>

      <DestinatariosLista
        campanha={c}
        linhas={linhas}
        filtroDeStatus={filtroDeStatus}
        setFiltroDeStatus={setFiltroDeStatus}
        hasNextPage={destinatarios.hasNextPage}
        isFetchingNextPage={destinatarios.isFetchingNextPage}
        onFetchNextPage={() => destinatarios.fetchNextPage()}
      />
    </div>
  );
}
