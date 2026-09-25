"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { showApiError } from "@/components/feedback/ApiErrorToast";
import { Button } from "@/components/ui/button";
import { useT } from "@/hooks/i18n/useT";
import { apiClient } from "@/lib/api/client";
import { formatCents } from "@/lib/money";

import { AtendimentosSemComanda, type Pendente } from "./_pendentes";
import type { Comanda, Forma, Tipo } from "./_types";
import { FormularioDeItem } from "./_components/FormularioDeItem";
import { Fechamento } from "./_components/Fechamento";
import { Estorno } from "./_components/Estorno";
import styles from "./comandas.module.css";

const ROTULO_DO_STATUS: Record<Comanda["status"], string> = {
  open: "Aberta",
  finalized: "Finalizada",
  cancelled: "Cancelada",
};

export function Comandas({
  podeLancar,
  podeEstornar,
}: {
  podeLancar: boolean;
  podeEstornar: boolean;
}) {
  const t = useT();
  const qc = useQueryClient();
  const [abertaId, setAbertaId] = useState<string | null>(null);

  const lista = useQuery({
    queryKey: ["comandas"],
    queryFn: async () =>
      (await apiClient.get<{ data: Comanda[] }>("/api/v1/financeiro/comandas")).data,
  });

  const detalhe = useQuery({
    queryKey: ["comandas", abertaId],
    enabled: Boolean(abertaId),
    queryFn: async () =>
      (await apiClient.get<{ data: Comanda }>(`/api/v1/financeiro/comandas/${abertaId}`)).data,
  });

  const formas = useQuery({
    queryKey: ["financeiro", "catalogo", "formas_de_pagamento"],
    queryFn: async () =>
      (await apiClient.get<{ data: Forma[] }>("/api/v1/financeiro/catalogo/formas_de_pagamento"))
        .data,
  });

  const tipos = useQuery({
    queryKey: ["agenda", "tipos"],
    queryFn: async () => (await apiClient.get<{ data: Tipo[] }>("/api/v1/agenda/tipos")).data,
  });

  const recarregar = () => {
    void qc.invalidateQueries({ queryKey: ["comandas"] });
    void qc.invalidateQueries({ queryKey: ["comandas", "pendentes"] });
    void qc.invalidateQueries({ queryKey: ["fidelidade"] });
  };

  const abrir = useMutation({
    mutationFn: () => apiClient.post<{ data: Comanda }>("/api/v1/financeiro/comandas", {}),
    onSuccess: (r) => {
      setAbertaId(r.data.id);
      recarregar();
    },
    onError: showApiError,
  });

  const incluirItem = useMutation({
    mutationFn: (corpo: Record<string, unknown>) =>
      apiClient.post(`/api/v1/financeiro/comandas/${abertaId}/itens`, corpo),
    onSuccess: recarregar,
    onError: showApiError,
  });

  const removerItem = useMutation({
    mutationFn: (itemId: string) =>
      apiClient.delete(`/api/v1/financeiro/comandas/${abertaId}/itens/${itemId}`),
    onSuccess: recarregar,
    onError: showApiError,
  });

  const alterar = useMutation({
    mutationFn: (corpo: Record<string, unknown>) =>
      apiClient.patch(`/api/v1/financeiro/comandas/${abertaId}`, corpo),
    onSuccess: recarregar,
    onError: showApiError,
  });

  const finalizar = useMutation({
    mutationFn: (corpo: Record<string, unknown>) =>
      apiClient.post(`/api/v1/financeiro/comandas/${abertaId}/finalizar`, corpo),
    onSuccess: recarregar,
    onError: showApiError,
  });

  const estornar = useMutation({
    mutationFn: (corpo: Record<string, unknown>) =>
      apiClient.post(`/api/v1/financeiro/comandas/${abertaId}/estornar`, corpo),
    onSuccess: recarregar,
    onError: showApiError,
  });

  const pendentes = useQuery({
    queryKey: ["comandas", "pendentes"],
    enabled: podeLancar,
    queryFn: async () =>
      (await apiClient.get<{ data: Pendente[] }>("/api/v1/financeiro/comandas/pendentes")).data,
  });

  const faturarLote = useMutation({
    mutationFn: (corpo: { appointment_ids: string[]; payment_method_id: string }) =>
      apiClient.post("/api/v1/financeiro/comandas/faturar-lote", corpo),
    onSuccess: recarregar,
    onError: showApiError,
  });

  const comanda = detalhe.data ?? null;
  const moeda = comanda?.currency ?? "BRL";

  const fidelidade = useQuery({
    queryKey: ["fidelidade", comanda?.contact_id],
    enabled: Boolean(comanda?.contact_id),
    queryFn: async () =>
      (
        await apiClient.get<{ data: { saldo: number } }>(
          `/api/v1/financeiro/fidelidade?contact_id=${comanda?.contact_id}`,
        )
      ).data,
  });

  return (
    <div className={styles.container}>
      <section className={styles.leftSidebar}>
        {podeLancar ? (
          <Button onClick={() => abrir.mutate()} disabled={abrir.isPending}>
            {t("Nova comanda")}
          </Button>
        ) : null}

        <ul className={styles.comandaList} data-testid="lista-de-comandas">
          {(lista.data ?? []).map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => setAbertaId(c.id)}
                data-testid={`comanda-${c.number}`}
                className={`${styles.comandaButton} ${
                  abertaId === c.id ? styles.comandaButtonActive : ""
                }`}
              >
                <span>
                  <span className="font-medium">#{c.number}</span>{" "}
                  <span className="text-xs text-muted-foreground">{t(ROTULO_DO_STATUS[c.status])}</span>
                </span>
                <span className="tabular-nums">{formatCents(c.total_cents, c.currency)}</span>
              </button>
            </li>
          ))}
          {lista.data?.length === 0 ? (
            <li className="p-2 text-sm text-muted-foreground">{t("Nenhuma comanda ainda.")}</li>
          ) : null}
        </ul>

        <AtendimentosSemComanda
          pendentes={pendentes.data ?? []}
          formas={formas.data ?? []}
          podeLancar={podeLancar}
          pendenteDeEnvio={faturarLote.isPending}
          onFaturar={(corpo) => faturarLote.mutate(corpo)}
        />
      </section>

      <section className={styles.rightPanel}>
        {!comanda ? (
          <p className={styles.emptySelection}>{t("Escolha uma comanda à esquerda.")}</p>
        ) : (
          <div className={styles.detailWrapper}>
            <header className={styles.detailHeader}>
              <h2 className={styles.detailTitle}>
                {t("Comanda")} #{comanda.number}
              </h2>
              <span className={styles.statusInfo}>
                {comanda.contact_id && fidelidade.data ? (
                  <span className="mr-2" data-testid="saldo-de-fidelidade">
                    {fidelidade.data.saldo} {t("ponto(s)")}
                  </span>
                ) : null}
                {t(ROTULO_DO_STATUS[comanda.status])}
                {comanda.reversed_at ? ` · ${t("estornada")}` : ""}
              </span>
            </header>

            <table className={styles.table}>
              <tbody>
                {(comanda.sale_items ?? []).map((i) => (
                  <tr key={i.id} className={styles.tableRow}>
                    <td className="py-1">
                      {i.description}
                      {i.quantity > 1 ? ` ×${i.quantity}` : ""}
                      {i.commission_percent > 0 ? (
                        <span className={styles.commissionBadge}>
                          {t("comissão")} {i.commission_percent}%
                        </span>
                      ) : null}
                    </td>
                    <td className="py-1 text-right tabular-nums">
                      {formatCents(i.total_cents, moeda)}
                    </td>
                    <td className="w-8 text-right">
                      {comanda.status === "open" && podeLancar ? (
                        <button
                          type="button"
                          aria-label={t("Remover item")}
                          onClick={() => removerItem.mutate(i.id)}
                          className={styles.removeButton}
                        >
                          ×
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="pt-2 font-medium">{t("Total")}</td>
                  <td
                    className="pt-2 text-right font-medium tabular-nums"
                    data-testid="total-da-comanda"
                  >
                    {formatCents(comanda.total_cents, moeda)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>

            {comanda.status === "open" && podeLancar ? (
              <FormularioDeItem
                tipos={tipos.data ?? []}
                onIncluir={(corpo) => incluirItem.mutate(corpo)}
                pendente={incluirItem.isPending}
              />
            ) : null}

            {comanda.status === "open" && podeLancar ? (
              <Fechamento
                formas={formas.data ?? []}
                onFinalizar={(corpo) => finalizar.mutate(corpo)}
                onCancelar={() => alterar.mutate({ cancel: true })}
                pendente={finalizar.isPending}
                temContato={Boolean(comanda.contact_id)}
              />
            ) : null}

            {comanda.status === "finalized" && !comanda.reversed_at && podeEstornar ? (
              <Estorno
                onEstornar={(reason) => estornar.mutate({ reason })}
                pendente={estornar.isPending}
              />
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
