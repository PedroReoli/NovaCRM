"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Info } from "@/lib/ui/icons";
import { useT } from "@/hooks/i18n/useT";
import type { RouterTestResult } from "@/hooks/ai/useRouters";
import styles from "./TestPanel.module.css";

interface TestPanelProps {
  isActive: boolean;
  canTest: boolean;
  message: string;
  onMessageChange: (v: string) => void;
  onTest: () => void;
  result: RouterTestResult | undefined;
  pending: boolean;
}

export function TestPanel({
  isActive,
  canTest,
  message,
  onMessageChange,
  onTest,
  result,
  pending,
}: TestPanelProps) {
  const t = useT();
  const confianca = result?.confidence ?? null;
  const abaixoDoMinimo =
    confianca !== null && result !== undefined && confianca < result.min_confidence;

  return (
    <Card className="space-y-3 p-4">
      <CardHeader className="p-0">
        <CardTitle className="text-sm">{t("Testar classificação")}</CardTitle>
        <CardDescription>
          {t(
            "Escreva uma frase como um cliente escreveria e veja qual intenção e qual agente o roteador escolheria — sem afetar nenhuma conversa real.",
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 p-0">
        {!isActive && (
          <div className={styles.warningAlert}>
            <Info className={styles.warningIcon} aria-hidden />
            <p>{t("Ative o roteador para poder testar a classificação.")}</p>
          </div>
        )}
        <Textarea
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder={t("Ex.: oi, quero saber o preço do plano premium")}
          rows={2}
          maxLength={4000}
          disabled={!canTest || !isActive}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={onTest}
          disabled={!canTest || !isActive || pending || !message.trim()}
        >
          {pending ? t("Testando…") : t("Testar classificação")}
          {!pending && <ArrowRight />}
        </Button>
        {result && (
          <div className={styles.resultBox}>
            <p>
              {t("Intenção")}: <span className="font-medium">{result.intent_name ?? t("nenhuma casou")}</span>
              {confianca !== null && (
                <span className="ml-2 text-xs text-muted-foreground">
                  {t("confiança")} {(confianca * 100).toFixed(0)}%
                </span>
              )}
            </p>
            {abaixoDoMinimo && confianca !== null && (
              <p className="text-xs text-amber-600">
                {t("Confiança")} {(confianca * 100).toFixed(0)}% — {t("abaixo do mínimo de")}{" "}
                {(result.min_confidence * 100).toFixed(0)}%, {t("cairia no atendimento padrão em produção.")}
              </p>
            )}
            <p>
              {t("Agente que atenderia")}:{" "}
              <span className="font-medium">{result.agent_name ?? t("nenhum (sem fallback)")}</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
