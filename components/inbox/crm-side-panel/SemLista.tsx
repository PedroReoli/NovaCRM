"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { useT } from "@/hooks/i18n/useT";

export interface SemListaProps {
  vazio: string;
  erro: boolean;
  onTentarDeNovo: () => void;
}

export function SemLista({ vazio, erro, onTentarDeNovo }: SemListaProps) {
  const t = useT();
  if (!erro) return <p className="mt-2 text-xs text-muted-foreground">{t(vazio)}</p>;
  return (
    <div className="mt-2 space-y-1">
      <p className="text-xs text-error-fg">{t("Não consegui ler estes dados.")}</p>
      <Button size="sm" variant="outline" onClick={onTentarDeNovo}>
        {t("Tentar de novo")}
      </Button>
    </div>
  );
}
