"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Archive, ArrowBendUpLeft, CaretDown, CaretUp, Trash } from "@/lib/ui/icons";
import type { FunilDaLista } from "../_types";
import styles from "./GavetaDeArquivados.module.css";

const ID_DA_LISTA_DE_ARQUIVADOS = "funis-arquivados";

interface GavetaDeArquivadosProps {
  arquivados: FunilDaLista[];
  podeGerenciar: boolean;
  ocupado: boolean;
  onDesarquivar: (id: string) => void;
  onExcluir: (id: string) => void;
  erro: { id: string | null; texto: string } | null;
  setErro: (erro: { id: string | null; texto: string } | null) => void;
  excluindo: { id: string; erro: string | null } | null;
  setExcluindo: (excluindo: { id: string; erro: string | null } | null) => void;
  t: (texto: string) => string;
}

export function GavetaDeArquivados({
  arquivados,
  podeGerenciar,
  ocupado,
  onDesarquivar,
  onExcluir,
  erro,
  setErro,
  excluindo,
  setExcluindo,
  t,
}: GavetaDeArquivadosProps) {
  const [arquivoAberto, setArquivoAberto] = React.useState(false);

  if (!podeGerenciar || arquivados.length === 0) {
    return null;
  }

  return (
    <div className={styles.container} data-testid="arquivados">
      <Button
        variant="ghost"
        size="sm"
        className={styles.toggleButton}
        onClick={() => setArquivoAberto((aberto) => !aberto)}
        aria-expanded={arquivoAberto}
        aria-controls={ID_DA_LISTA_DE_ARQUIVADOS}
        data-testid="arquivados-abrir"
      >
        <Archive size={16} className="mr-2" aria-hidden />
        {t("Funis arquivados")} ({arquivados.length})
        {arquivoAberto ? (
          <CaretUp size={16} className="ml-2" aria-hidden />
        ) : (
          <CaretDown size={16} className="ml-2" aria-hidden />
        )}
      </Button>

      {arquivoAberto && (
        <>
          <p className={styles.explanation} data-testid="arquivados-explicacao">
            {t(
              "Funil arquivado não aparece na lista nem recebe negócio novo. Traga de volta para usar outra vez, ou exclua de vez para liberar o nome.",
            )}
          </p>
          <ul id={ID_DA_LISTA_DE_ARQUIVADOS} className={styles.list}>
            {arquivados.map((funil) => {
              const excluindoAqui = excluindo?.id === funil.id ? excluindo : null;

              return (
                <li
                  key={funil.id}
                  className={styles.item}
                  data-testid={`arquivado-${funil.id}`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                      {funil.name}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">/{funil.slug}</span>
                    <div className="flex shrink-0 flex-wrap gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDesarquivar(funil.id)}
                        disabled={ocupado}
                        data-testid={`desarquivar-${funil.id}`}
                      >
                        <ArrowBendUpLeft size={16} className="mr-1" aria-hidden />{" "}
                        {t("Tirar do arquivo")}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setErro(null);
                          setExcluindo({ id: funil.id, erro: null });
                        }}
                        disabled={ocupado}
                        data-testid={`excluir-arquivado-${funil.id}`}
                      >
                        <Trash size={16} className="mr-1" aria-hidden /> {t("Excluir de vez")}
                      </Button>
                    </div>
                  </div>

                  {erro?.id === funil.id && (
                    <p
                      className="text-sm leading-relaxed text-destructive"
                      data-testid={`erro-arquivado-${funil.id}`}
                    >
                      {erro.texto}
                    </p>
                  )}

                  <AlertDialog
                    open={excluindoAqui !== null}
                    onOpenChange={(aberto) => {
                      if (!aberto) setExcluindo(null);
                    }}
                  >
                    <AlertDialogContent
                      className="sm:max-w-md"
                      data-testid={`excluir-painel-${funil.id}`}
                    >
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {t("Excluir de vez")} «{funil.name}»?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {t(
                            "Isso não tem volta: o funil e as etapas dele somem. Se ele já recebeu negócio, a exclusão é recusada e ele continua arquivado.",
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      {excluindoAqui?.erro && (
                        <p
                          className="text-sm leading-relaxed"
                          data-testid={`excluir-erro-${funil.id}`}
                        >
                          {excluindoAqui?.erro}
                        </p>
                      )}

                      <AlertDialogFooter>
                        <AlertDialogCancel
                          disabled={ocupado}
                          data-testid={`excluir-cancelar-${funil.id}`}
                        >
                          {t("Cancelar")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                          className={buttonVariants({ variant: "destructive" })}
                          disabled={ocupado}
                          data-testid={`excluir-confirmar-${funil.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            onExcluir(funil.id);
                          }}
                        >
                          {t("Excluir de vez")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
