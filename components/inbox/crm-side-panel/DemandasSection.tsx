"use client";

import * as React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api/client";
import { useT } from "@/hooks/i18n/useT";
import { cn } from "@/lib/utils";
import { SemLista } from "./SemLista";
import type { DemandaRow, DesfechoDraft } from "./types";
import { ESTADO_LEGIVEL, horasDesde } from "./types";

export interface DemandasSectionProps {
  sectionsLoading: boolean;
  demandas: DemandaRow[] | null;
  conversationCurrentDemandaId?: string | null;
  readonly: boolean;
  desfechoDraft: DesfechoDraft | null;
  conversationId: string;
  contactId: string | null;
  setDesfechoDraft: React.Dispatch<React.SetStateAction<DesfechoDraft | null>>;
  recarregar: () => void;
  erro: boolean;
  onTentarDeNovo: () => void;
}

export function DemandasSection({
  sectionsLoading,
  demandas,
  conversationCurrentDemandaId,
  readonly,
  desfechoDraft,
  conversationId,
  contactId,
  setDesfechoDraft,
  recarregar,
  erro,
  onTentarDeNovo,
}: DemandasSectionProps) {
  const t = useT();

  return (
    <section data-testid="inbox-demandas">
      <h3 className="text-xs font-semibold text-text">{t("Demandas abertas")}</h3>
      {sectionsLoading ? (
        <Skeleton className="mt-2 h-14 w-full" />
      ) : demandas && demandas.length > 0 ? (
        <ul className="mt-2 space-y-1.5">
          {demandas.map((d) => {
            const semPasso = !d.proximo_passo;
            return (
              <li
                key={d.id}
                data-testid={semPasso ? "demanda-sem-proximo-passo" : "demanda-com-proximo-passo"}
                className={cn(
                  "rounded-md border p-2 text-xs",
                  semPasso ? "border-warning-border bg-warning-bg/40" : "border-border",
                )}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate font-medium">
                    {t(ESTADO_LEGIVEL[d.estado] ?? d.estado)}
                  </span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {t("há")} {horasDesde(d.aberta_em)}h
                  </span>
                </div>
                <div className={cn("mt-0.5", semPasso ? "font-medium" : "text-muted-foreground")}>
                  {d.proximo_passo ?? t("Sem próximo passo definido")}
                </div>
                {d.id === conversationCurrentDemandaId && (
                  <Badge variant="outline">{t("Demanda vigente neste canal")}</Badge>
                )}
                {!readonly && (
                  <EncerrarDemanda
                    draft={
                      desfechoDraft?.conversationId === conversationId &&
                      desfechoDraft.contactId === contactId &&
                      desfechoDraft.demandaId === d.id
                        ? desfechoDraft
                        : null
                    }
                    onAbrir={() => {
                      if (contactId) {
                        setDesfechoDraft({
                          conversationId,
                          contactId,
                          demandaId: d.id,
                          revision: d.revision,
                          desfecho: "resolvida",
                          salvando: false,
                        });
                      }
                    }}
                    onAlterar={(patch) =>
                      setDesfechoDraft((current) =>
                        current?.conversationId === conversationId &&
                        current.contactId === contactId &&
                        current.demandaId === d.id
                          ? { ...current, ...patch }
                          : current,
                      )
                    }
                    onFechar={() =>
                      setDesfechoDraft((current) =>
                        current?.conversationId === conversationId &&
                        current.contactId === contactId &&
                        current.demandaId === d.id
                          ? null
                          : current,
                      )
                    }
                    onPronto={recarregar}
                  />
                )}
                {semPasso && !readonly ? (
                  <MarcarProximoPasso demandaId={d.id} onPronto={recarregar} />
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : (
        <SemLista
          vazio="Nenhuma demanda aberta."
          erro={erro}
          onTentarDeNovo={onTentarDeNovo}
        />
      )}
    </section>
  );
}

export function EncerrarDemanda({
  draft,
  onAbrir,
  onAlterar,
  onFechar,
  onPronto,
}: {
  draft: DesfechoDraft | null;
  onAbrir: () => void;
  onAlterar: (patch: Partial<Pick<DesfechoDraft, "desfecho" | "salvando">>) => void;
  onFechar: () => void;
  onPronto: () => void;
}) {
  const t = useT();
  if (!draft) {
    return (
      <Button size="sm" variant="ghost" onClick={onAbrir}>
        {t("Encerrar demanda")}
      </Button>
    );
  }
  return (
    <form
      className="mt-2 space-y-2"
      onSubmit={async (event) => {
        event.preventDefault();
        onAlterar({ salvando: true });
        try {
          await apiClient.patch(`/api/v1/demandas/${draft.demandaId}`, {
            action: "encerrar",
            desfecho: draft.desfecho,
            expected_revision: draft.revision,
          });
          toast.success(t("Desfecho registrado."));
          onFechar();
          onPronto();
        } catch {
          toast.error(
            t(
              "Não foi possível encerrar. Cancele esta edição e abra novamente para revisar o desfecho.",
            ),
          );
          onPronto();
        } finally {
          onAlterar({ salvando: false });
        }
      }}
    >
      <label className="block">
        {t("Desfecho")}
        <select
          aria-label={t("Desfecho da demanda")}
          className="mt-1 w-full rounded-md border bg-background p-2"
          value={draft.desfecho}
          onChange={(e) => onAlterar({ desfecho: e.target.value })}
        >
          <option value="resolvida">{t("Resolvida")}</option>
          <option value="convertida">{t("Convertida")}</option>
          <option value="nao_procede">{t("Não procede")}</option>
          <option value="encerrada_pelo_cliente">{t("Encerrada pelo cliente")}</option>
          <option value="perdida">{t("Perdida")}</option>
          <option value="expirada_sem_resposta">{t("Expirada sem resposta")}</option>
        </select>
      </label>
      <p>
        {t(
          "Registra o resultado desta demanda. As conversas dos outros canais permanecem disponíveis.",
        )}
      </p>
      <Button size="sm" disabled={draft.salvando} type="submit">
        {t("Confirmar desfecho")}
      </Button>
      <Button size="sm" variant="ghost" type="button" disabled={draft.salvando} onClick={onFechar}>
        {t("Cancelar")}
      </Button>
    </form>
  );
}

export function MarcarProximoPasso({
  demandaId,
  onPronto,
}: {
  demandaId: string;
  onPronto: () => void;
}) {
  const t = useT();
  const [aberto, setAberto] = useState(false);
  const [texto, setTexto] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    const passo = texto.trim();
    if (passo.length < 3) return;
    setSalvando(true);
    try {
      await apiClient.patch(`/api/v1/demandas/${demandaId}`, { proximo_passo: passo });
      setAberto(false);
      setTexto("");
      onPronto();
    } catch {
      toast.error(t("Não consegui salvar o próximo passo. Tente de novo."));
    } finally {
      setSalvando(false);
    }
  }

  if (!aberto) {
    return (
      <Button
        size="sm"
        variant="outline"
        className="mt-1.5 h-7 text-xs"
        data-testid="marcar-proximo-passo"
        onClick={() => setAberto(true)}
      >
        {t("Marcar próximo passo")}
      </Button>
    );
  }

  return (
    <div className="mt-1.5 space-y-1.5">
      <input
        autoFocus
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") void salvar();
          if (e.key === "Escape") setAberto(false);
        }}
        maxLength={500}
        placeholder={t("O que acontece a seguir?")}
        aria-label={t("Próximo passo desta demanda")}
        data-testid="campo-proximo-passo"
        className="w-full rounded-md border border-input bg-background px-2 py-1 text-xs focus:outline-hidden focus:ring-1 focus:ring-ring"
      />
      <div className="flex gap-1.5">
        <Button
          size="sm"
          className="h-7 text-xs"
          disabled={salvando || texto.trim().length < 3}
          data-testid="salvar-proximo-passo"
          onClick={() => void salvar()}
        >
          {salvando ? t("Salvando…") : t("Salvar")}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-xs"
          onClick={() => setAberto(false)}
        >
          {t("Cancelar")}
        </Button>
      </div>
    </div>
  );
}
