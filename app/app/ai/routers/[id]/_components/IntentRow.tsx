"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Trash } from "@/lib/ui/icons";
import { useT } from "@/hooks/i18n/useT";
import type { AgentLite, DraftMember } from "../_types";
import { ExamplesInput } from "./ExamplesInput";
import styles from "./IntentRow.module.css";

interface IntentRowProps {
  member: DraftMember;
  agents: AgentLite[];
  disabled: boolean;
  error: string | null;
  duplicate: boolean;
  onChange: (patch: Partial<DraftMember>) => void;
  onRemove: () => void;
}

export function IntentRow({
  member,
  agents,
  disabled,
  error,
  duplicate,
  onChange,
  onRemove,
}: IntentRowProps) {
  const t = useT();

  return (
    <div className={styles.container}>
      <div className={styles.topRow}>
        <div className={styles.inputCol}>
          <Label>{t("Nome da intenção")}</Label>
          <Input
            value={member.intent_name}
            onChange={(e) => onChange({ intent_name: e.target.value })}
            placeholder={t("Ex.: quer comprar")}
            disabled={disabled}
            maxLength={120}
            aria-invalid={duplicate}
          />
        </div>
        <div className={styles.inputCol}>
          <Label>{t("Agente que atende")}</Label>
          <Select
            value={member.agent_id || undefined}
            onValueChange={(v) => onChange({ agent_id: v })}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("Selecione o agente")} />
            </SelectTrigger>
            <SelectContent>
              {agents.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {!disabled && (
          <Button
            variant="ghost"
            size="icon"
            className={styles.removeButton}
            onClick={onRemove}
            aria-label={t("Remover intenção")}
          >
            <Trash />
          </Button>
        )}
      </div>

      <div className="space-y-1">
        <Label>{t("Quando escolher esta intenção")}</Label>
        <Textarea
          value={member.intent_description}
          onChange={(e) => onChange({ intent_description: e.target.value })}
          placeholder={t(
            "Escreva como explicaria para um atendente novo: em que situação o cliente cai aqui.",
          )}
          disabled={disabled}
          rows={2}
          maxLength={2000}
        />
      </div>

      <ExamplesInput
        value={member.examples}
        onChange={(examples) => onChange({ examples })}
        disabled={disabled}
      />

      {duplicate ? (
        <p className="text-xs text-destructive">{t("Já existe outra intenção com este nome.")}</p>
      ) : error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
