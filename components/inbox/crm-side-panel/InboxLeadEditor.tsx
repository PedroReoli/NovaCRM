"use client";

import * as React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useT } from "@/hooks/i18n/useT";
import { cn } from "@/lib/utils";
import { CustomFieldsEditor, type CustomFieldDef } from "@/components/contacts/CustomFieldsEditor";
import { useEditLead } from "@/hooks/kanban/useUpdateLead";
import {
  type LeadRow,
  STATUS_DO_LEAD,
  ondeEstaOLead,
  formatMoney,
  CLASSES_DE_ONDE_ESTA,
} from "./types";

export interface InboxLeadEditorProps {
  leads: LeadRow[];
  selecionadoId: string | null;
  onSelecionar: (id: string) => void;
  onSalvo: () => void;
}

export function InboxLeadEditor({
  leads,
  selecionadoId,
  onSelecionar,
  onSalvo,
}: InboxLeadEditorProps) {
  const t = useT();
  const ativo = leads.find((l) => l.id === selecionadoId) ?? leads[0]!;
  const status = (l: LeadRow) => t(STATUS_DO_LEAD[l.status] ?? l.status);

  return (
    <div className="mt-2 space-y-2">
      {leads.length > 1 && (
        <ul className="space-y-1">
          {leads.map((l) => {
            const marcado = l.id === ativo.id;
            return (
              <li key={l.id}>
                <button
                  type="button"
                  data-testid={`inbox-lead-${l.id}`}
                  aria-pressed={marcado}
                  onClick={() => onSelecionar(l.id)}
                  className={cn(
                    "w-full rounded-md border p-2 text-left text-xs",
                    marcado ? "border-accent bg-accent/10" : "border-border",
                  )}
                >
                  <div className="truncate font-medium">{l.title}</div>
                  <div className={CLASSES_DE_ONDE_ESTA} title={ondeEstaOLead(l)}>
                    {ondeEstaOLead(l)}
                  </div>
                  <div className="text-muted-foreground">
                    {status(l)} · {formatMoney(l.value_cents, l.currency)}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {leads.length === 1 && (
        <div data-testid="inbox-lead-unico" className="text-xs text-muted-foreground">
          <p>
            {ativo.title} · {status(ativo)}
          </p>
          <p className={CLASSES_DE_ONDE_ESTA} title={ondeEstaOLead(ativo)}>
            {ondeEstaOLead(ativo)}
          </p>
        </div>
      )}
      <CamposDoFunil
        key={ativo.id}
        leadId={ativo.id}
        pipelineId={ativo.pipeline_id}
        fieldDefs={ativo.field_defs ?? []}
        valores={ativo.custom_fields ?? {}}
        onSalvo={onSalvo}
      />
    </div>
  );
}

export function CamposDoFunil({
  leadId,
  pipelineId,
  fieldDefs,
  valores,
  onSalvo,
}: {
  leadId: string;
  pipelineId: string;
  fieldDefs: CustomFieldDef[];
  valores: Record<string, unknown>;
  onSalvo: () => void;
}) {
  const t = useT();
  const edit = useEditLead(pipelineId);
  const [customFields, setCustomFields] = useState(valores);

  if (fieldDefs.length === 0) {
    return <p className="text-xs text-muted-foreground">{t("Este funil não tem campos extras.")}</p>;
  }

  async function salvar() {
    try {
      await edit.mutateAsync({ leadId, patch: { custom_fields: customFields } });
      toast.success(t("Campos atualizados"));
      onSalvo();
    } catch {
      // toast already shown
    }
  }

  return (
    <div className="space-y-3">
      <CustomFieldsEditor
        fields={fieldDefs}
        value={customFields}
        onChange={setCustomFields}
        mode="lead"
        className="gap-3 md:grid-cols-1"
      />
      <Button
        size="sm"
        className="h-7 w-full text-xs"
        disabled={edit.isPending}
        onClick={() => void salvar()}
      >
        {edit.isPending ? "Salvando…" : "Salvar"}
      </Button>
    </div>
  );
}
