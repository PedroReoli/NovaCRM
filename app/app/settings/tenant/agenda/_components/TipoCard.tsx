import * as React from "react";
import { useT } from "@/hooks/i18n/useT";
import { Button } from "@/components/ui/button";
import { CATEGORIAS, LOCAIS, rotuloDe, type TipoRow } from "./types";
import { EditarTipoForm } from "./EditarTipoForm";

interface TipoCardProps {
  tipo: TipoRow;
  podeEditar: boolean;
  isEditing: boolean;
  onToggleEdit: () => void;
  salvando: boolean;
  pessoas: Array<{ id: string; papel: string; nome: string }>;
  onDesativar: (tipo: TipoRow) => void;
  onReativar: (tipo: TipoRow) => void;
  onSalvarEdicao: (tipoId: string, dados: FormData) => Promise<boolean>;
}

export function TipoCard({
  tipo,
  podeEditar,
  isEditing,
  onToggleEdit,
  salvando,
  pessoas,
  onDesativar,
  onReativar,
  onSalvarEdicao,
}: TipoCardProps) {
  const t = useT();

  return (
    <li
      data-testid={`tipo-${tipo.id}`}
      className={`rounded-lg border border-border bg-surface p-3 ${tipo.is_active ? "" : "opacity-60"}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-text">{tipo.name}</span>
        <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-text-muted">
          {t(rotuloDe(CATEGORIAS, tipo.category))}
        </span>
        <span className="text-xs tabular-nums text-text-muted">{tipo.duration_minutes} min</span>
        <span className="text-xs text-text-muted">{t(rotuloDe(LOCAIS, tipo.location_kind))}</span>
        {!tipo.default_owner_user_id ? (
          podeEditar ? (
            <button
              type="button"
              data-testid={`sem-dono-${tipo.id}`}
              onClick={onToggleEdit}
              className="text-xs text-warning underline underline-offset-2"
            >
              {t("sem responsável — definir quem atende")}
            </button>
          ) : (
            <span data-testid={`sem-dono-${tipo.id}`} className="text-xs text-warning">
              {t("sem responsável — não aparece para marcar")}
            </span>
          )
        ) : null}
        {tipo.reminder_enabled ? (
          <span
            data-testid={`lembrete-ligado-${tipo.id}`}
            className="text-xs tabular-nums text-text-muted"
          >
            {t("avisa o cliente")}{" "}
            {[tipo.reminder_minutes_before, ...(tipo.reminder_extra_offsets_minutes ?? [])]
              .sort((a, b) => b - a)
              .join(", ")}{" "}
            min {t("antes")}
            {tipo.reminder_body || Object.keys(tipo.reminder_bodies ?? {}).length > 0
              ? ` · ${t("texto próprio")}`
              : ""}
          </span>
        ) : null}
        {!tipo.is_active ? (
          <span className="text-xs text-text-subtle">{t("desativado")}</span>
        ) : null}
        {podeEditar ? (
          <span className="ml-auto flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              data-testid={`editar-${tipo.id}`}
              onClick={onToggleEdit}
            >
              {isEditing ? t("Fechar") : t("Editar")}
            </Button>
            {tipo.is_active ? (
              <Button
                variant="ghost"
                size="sm"
                data-testid={`desativar-${tipo.id}`}
                disabled={salvando}
                onClick={() => onDesativar(tipo)}
              >
                Desativar
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                data-testid={`reativar-${tipo.id}`}
                disabled={salvando}
                onClick={() => onReativar(tipo)}
              >
                Reativar
              </Button>
            )}
          </span>
        ) : null}
      </div>

      {isEditing && (
        <EditarTipoForm
          tipo={tipo}
          pessoas={pessoas}
          salvando={salvando}
          onSubmit={onSalvarEdicao}
        />
      )}
    </li>
  );
}
