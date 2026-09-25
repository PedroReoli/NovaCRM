"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { useT } from "@/hooks/i18n/useT";
import styles from "./Estorno.module.css";

interface EstornoProps {
  onEstornar: (motivo: string) => void;
  pendente: boolean;
}

export function Estorno({ onEstornar, pendente }: EstornoProps) {
  const t = useT();
  const [motivo, setMotivo] = React.useState("");

  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        if (motivo.trim().length < 3) return;
        onEstornar(motivo.trim());
        setMotivo("");
      }}
    >
      <label className={styles.label}>
        {t("Motivo do estorno")}
        <input
          value={motivo}
          data-testid="motivo-do-estorno"
          onChange={(e) => setMotivo(e.target.value)}
          className={styles.input}
        />
      </label>
      <Button
        type="submit"
        variant="destructive"
        disabled={motivo.trim().length < 3 || pendente}
        data-testid="estornar-comanda"
      >
        {t("Estornar")}
      </Button>
    </form>
  );
}
