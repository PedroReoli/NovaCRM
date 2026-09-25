"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { useT } from "@/hooks/i18n/useT";
import type { Forma } from "../_types";
import styles from "./Fechamento.module.css";

interface FechamentoProps {
  formas: Forma[];
  onFinalizar: (corpo: Record<string, unknown>) => void;
  onCancelar: () => void;
  pendente: boolean;
  temContato: boolean;
}

export function Fechamento({
  formas,
  onFinalizar,
  onCancelar,
  pendente,
  temContato,
}: FechamentoProps) {
  const t = useT();
  const [formaId, setFormaId] = React.useState("");
  const [pontos, setPontos] = React.useState("");
  const escolhida = formas.find((f) => f.id === formaId);

  const pontosNumero = Number(pontos);
  const pontosValidos = pontos === "" || (Number.isInteger(pontosNumero) && pontosNumero >= 0);

  return (
    <div className={styles.container}>
      <label className={styles.label}>
        {t("Forma de pagamento")}
        <select
          value={formaId}
          data-testid="forma-de-pagamento"
          onChange={(e) => setFormaId(e.target.value)}
          className={styles.select}
        >
          <option value="">{t("Escolha")}</option>
          {formas.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </label>

      {temContato ? (
        <label className={styles.label}>
          {t("Pontos de fidelidade")}
          <input
            value={pontos}
            inputMode="numeric"
            placeholder="0"
            data-testid="pontos-de-fidelidade"
            onChange={(e) => setPontos(e.target.value)}
            className={styles.pointsInput}
          />
        </label>
      ) : null}

      <Button
        onClick={() =>
          onFinalizar({
            payment_method_id: formaId,
            loyalty_points: temContato && pontos !== "" ? pontosNumero : 0,
          })
        }
        disabled={!formaId || pendente || !pontosValidos}
        data-testid="finalizar-comanda"
      >
        {t("Finalizar")}
      </Button>

      <Button variant="ghost" onClick={onCancelar} data-testid="cancelar-comanda">
        {t("Cancelar comanda")}
      </Button>

      {escolhida && !escolhida.account_id ? (
        <p className={styles.warningNotice} data-testid="aviso-forma-sem-conta">
          {t(
            "Esta forma de pagamento ainda não tem conta de destino. Defina em Configurações › Financeiro.",
          )}
        </p>
      ) : null}
    </div>
  );
}
