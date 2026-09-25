"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useT } from "@/hooks/i18n/useT";
import styles from "./ExamplesInput.module.css";

interface ExamplesInputProps {
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}

export function ExamplesInput({ value, onChange, disabled }: ExamplesInputProps) {
  const t = useT();
  const [draft, setDraft] = React.useState("");

  function add(ex: string) {
    const trimmed = ex.trim();
    if (!trimmed || value.includes(trimmed) || value.length >= 10) return;
    onChange([...value, trimmed]);
    setDraft("");
  }

  function remove(ex: string) {
    onChange(value.filter((x) => x !== ex));
  }

  return (
    <div className={styles.container}>
      <Label>{t("Frases de exemplo (opcional)")}</Label>
      <div className={styles.tagsWrapper}>
        {value.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => !disabled && remove(ex)}
            className={styles.tagButton}
            disabled={disabled}
            aria-label={`${t("Remover exemplo")} ${ex}`}
          >
            {ex}
            <span className={styles.removeIcon}>×</span>
          </button>
        ))}
        {value.length === 0 ? (
          <span className="text-xs text-muted-foreground">{t("Sem frases de exemplo.")}</span>
        ) : null}
      </div>
      {!disabled && (
        <div className={styles.inputRow}>
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add(draft);
              }
            }}
            placeholder={t("Ex.: quanto custa? (Enter)")}
            disabled={value.length >= 10}
            maxLength={200}
          />
          <button
            type="button"
            className={styles.addButton}
            onClick={() => add(draft)}
            disabled={draft.trim() === ""}
          >
            {t("Adicionar")}
          </button>
        </div>
      )}
    </div>
  );
}
