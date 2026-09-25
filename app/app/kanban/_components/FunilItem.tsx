"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Archive,
  CaretDown,
  CaretUp,
  Check,
  PencilSimple,
} from "@/lib/ui/icons";
import type { FunilDaLista } from "../_types";
import styles from "./FunilItem.module.css";

interface FunilItemProps {
  funil: FunilDaLista;
  index: number;
  totalFunis: number;
  podeGerenciar: boolean;
  clientesLigado: boolean;
  ocupado: boolean;
  renomeandoAqui: { id: string; nome: string } | null;
  arquivandoAqui: { id: string; erro: string | null } | null;
  erroDaLinha: string | null;
  onSubir: () => void;
  onDescer: () => void;
  onStartRename: (nome: string) => void;
  onSaveRename: (nome: string) => void;
  onCancelRename: () => void;
  onUpdateRenameValue: (nome: string) => void;
  onTornarPadrao: () => void;
  onToggleClientes: () => void;
  onStartArquivar: () => void;
  onCancelArquivar: () => void;
  onConfirmArquivar: (definitivo: boolean) => void;
  t: (texto: string) => string;
}

export function FunilItem({
  funil,
  index,
  totalFunis,
  podeGerenciar,
  clientesLigado,
  ocupado,
  renomeandoAqui,
  arquivandoAqui,
  erroDaLinha,
  onSubir,
  onDescer,
  onStartRename,
  onSaveRename,
  onCancelRename,
  onUpdateRenameValue,
  onTornarPadrao,
  onToggleClientes,
  onStartArquivar,
  onCancelArquivar,
  onConfirmArquivar,
  t,
}: FunilItemProps) {
  return (
    <li className={styles.item} data-testid={`funil-${funil.id}`}>
      <div className={styles.row}>
        {podeGerenciar && (
          <div className="flex shrink-0 flex-wrap gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label={`${t("Subir")} «${funil.name}» ${t("na lista")}`}
              data-testid={`subir-${funil.id}`}
              disabled={ocupado || index === 0}
              onClick={onSubir}
            >
              <CaretUp size={16} aria-hidden />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`${t("Descer")} «${funil.name}» ${t("na lista")}`}
              data-testid={`descer-${funil.id}`}
              disabled={ocupado || index === totalFunis - 1}
              onClick={onDescer}
            >
              <CaretDown size={16} aria-hidden />
            </Button>
          </div>
        )}

        <div className="min-w-0 flex-1">
          {renomeandoAqui ? (
            <div className="flex gap-2">
              <Input
                autoFocus
                value={renomeandoAqui.nome}
                onChange={(e) => onUpdateRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSaveRename(renomeandoAqui.nome);
                  if (e.key === "Escape") onCancelRename();
                }}
                aria-label={`${t("Novo nome de")} «${funil.name}»`}
                data-testid={`nome-${funil.id}`}
                disabled={ocupado}
              />
              <Button
                size="sm"
                onClick={() => onSaveRename(renomeandoAqui.nome)}
                disabled={ocupado || !renomeandoAqui.nome.trim()}
                data-testid={`salvar-nome-${funil.id}`}
              >
                {t("Salvar")}
              </Button>
              <Button variant="ghost" size="sm" onClick={onCancelRename} disabled={ocupado}>
                {t("Cancelar")}
              </Button>
            </div>
          ) : (
            <Link
              href={`/app/pipelines/${funil.id}`}
              className={styles.nameLink}
              data-testid={`abrir-${funil.id}`}
            >
              <span className={styles.nameRow}>
                <span className={styles.nameText}>{funil.name}</span>
                {funil.is_default && (
                  <Badge variant="secondary" className="text-[10px]">
                    {t("Padrão")}
                  </Badge>
                )}
                {clientesLigado && funil.is_client_pipeline && (
                  <Badge variant="secondary" className="text-[10px]">
                    {t("Clientes")}
                  </Badge>
                )}
              </span>
              {funil.description && (
                <span className="text-xs text-muted-foreground">{funil.description}</span>
              )}
            </Link>
          )}
        </div>

        <span className={styles.slugText}>/{funil.slug}</span>

        {podeGerenciar && !renomeandoAqui && (
          <div className={styles.actionsGroup}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onStartRename(funil.name)}
              disabled={ocupado}
              data-testid={`renomear-${funil.id}`}
            >
              <PencilSimple size={16} className="mr-1" aria-hidden /> {t("Renomear")}
            </Button>
            {!funil.is_default && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onTornarPadrao}
                disabled={ocupado}
                data-testid={`padrao-${funil.id}`}
              >
                <Check size={16} className="mr-1" aria-hidden /> {t("Tornar padrão")}
              </Button>
            )}
            {clientesLigado && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleClientes}
                disabled={ocupado}
                data-testid={`clientes-${funil.id}`}
              >
                <Check size={16} className="mr-1" aria-hidden />{" "}
                {funil.is_client_pipeline
                  ? t("Deixar de ser funil de clientes")
                  : t("Funil de clientes")}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onStartArquivar}
              disabled={ocupado}
              data-testid={`arquivar-${funil.id}`}
            >
              <Archive size={16} className="mr-1" aria-hidden /> {t("Arquivar")}
            </Button>
          </div>
        )}
      </div>

      {erroDaLinha && (
        <p className="text-sm leading-relaxed text-destructive" data-testid={`erro-${funil.id}`}>
          {erroDaLinha}
        </p>
      )}

      {arquivandoAqui && (
        <Card className="space-y-3 p-4" data-testid={`arquivar-painel-${funil.id}`}>
          {arquivandoAqui.erro ? (
            <p className="text-sm leading-relaxed" data-testid={`arquivar-erro-${funil.id}`}>
              {arquivandoAqui.erro}
            </p>
          ) : (
            <p className="text-sm leading-relaxed">
              {t("Arquivar")} «{funil.name}»?{" "}
              {t(
                "Ele sai desta lista e para de receber negócio novo. O histórico continua guardado, e nada é apagado.",
              )}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => onConfirmArquivar(false)}
              disabled={ocupado}
              data-testid={`arquivar-confirmar-${funil.id}`}
            >
              {t("Arquivar")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onConfirmArquivar(true)}
              disabled={ocupado}
              data-testid={`excluir-${funil.id}`}
            >
              {t("Excluir de vez")}
            </Button>
            <Button variant="ghost" size="sm" onClick={onCancelArquivar} disabled={ocupado}>
              {t("Cancelar")}
            </Button>
          </div>
        </Card>
      )}
    </li>
  );
}
