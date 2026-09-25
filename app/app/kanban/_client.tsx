"use client";

import { useState } from "react";
import Link from "next/link";

import { useActiveOrg } from "@/hooks/auth/AuthProvider";
import { useT } from "@/hooks/i18n/useT";

import { ImportarLeads } from "./_components/ImportarLeads";
import { GavetaDeArquivados } from "./_components/GavetaDeArquivados";
import { FunilItem } from "./_components/FunilItem";
import { EmptyPipeline } from "@/components/empty";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api/types";
import { Plus } from "@/lib/ui/icons";
import { useArquivarFunil, useCriarFunil, useEditarFunil } from "@/hooks/pipelines/usePipelines";
import type { FunilDaLista } from "./_types";
import styles from "./kanban.module.css";

export type { FunilDaLista };

export function vizinhoAoMover(
  funis: FunilDaLista[],
  i: number,
  direcao: "subir" | "descer",
): string | null {
  if (direcao === "subir") return funis[i - 2]?.id ?? null;
  return funis[i + 1]?.id ?? null;
}

function textoDoErro(e: unknown, t: (texto: string) => string): string {
  if (e instanceof ApiError) return t(e.message);
  if (e instanceof Error && e.message) return e.message;
  return t("Não consegui completar essa ação. Tente de novo.");
}

export function FunisClient({
  funis: funisDoServidor,
  arquivados: arquivadosDoServidor,
  podeGerenciar,
  podeImportar,
}: {
  funis: FunilDaLista[];
  arquivados: FunilDaLista[];
  podeGerenciar: boolean;
  podeImportar: boolean;
}) {
  const t = useT();
  const clientesLigado = useActiveOrg()?.cliente_pela_agenda === true;

  const [funis, setFunis] = useState<FunilDaLista[]>(funisDoServidor);
  const [arquivados, setArquivados] = useState<FunilDaLista[]>(arquivadosDoServidor);
  const [ultimoDoServidor, setUltimoDoServidor] = useState<FunilDaLista[]>(funisDoServidor);

  if (funisDoServidor !== ultimoDoServidor) {
    setUltimoDoServidor(funisDoServidor);
    setFunis(funisDoServidor);
    setArquivados(arquivadosDoServidor);
  }

  const criar = useCriarFunil();
  const editar = useEditarFunil();
  const arquivar = useArquivarFunil();

  const [novo, setNovo] = useState<string | null>(null);
  const [renomeando, setRenomeando] = useState<{ id: string; nome: string } | null>(null);
  const [arquivando, setArquivando] = useState<{ id: string; erro: string | null } | null>(null);
  const [excluindo, setExcluindo] = useState<{ id: string; erro: string | null } | null>(null);
  const [erro, setErro] = useState<{ id: string | null; texto: string } | null>(null);

  const ocupado = criar.isPending || editar.isPending || arquivar.isPending;

  function aplicarResposta(r: { data: { pipelines: FunilDaLista[]; arquivados: FunilDaLista[] } }) {
    setFunis(r.data.pipelines);
    setArquivados(r.data.arquivados);
  }

  function criarFunil() {
    const nome = (novo ?? "").trim();
    if (!nome) return;
    setErro(null);
    criar.mutate(nome, {
      onSuccess: (r) => {
        aplicarResposta(r);
        setNovo(null);
      },
      onError: (e) => setErro({ id: null, texto: textoDoErro(e, t) }),
    });
  }

  function aplicar(id: string, patch: Parameters<typeof editar.mutate>[0]["patch"]) {
    setErro(null);
    editar.mutate(
      { id, patch },
      {
        onSuccess: (r) => {
          aplicarResposta(r);
          setRenomeando(null);
        },
        onError: (e) => setErro({ id, texto: textoDoErro(e, t) }),
      },
    );
  }

  function pedirArquivamento(id: string, definitivo: boolean) {
    setErro(null);
    arquivar.mutate(
      { id, definitivo },
      {
        onSuccess: (r) => {
          aplicarResposta(r);
          setArquivando(null);
        },
        onError: (e) => setArquivando({ id, erro: textoDoErro(e, t) }),
      },
    );
  }

  function excluirDoArquivo(id: string) {
    setErro(null);
    arquivar.mutate(
      { id, definitivo: true },
      {
        onSuccess: (r) => {
          aplicarResposta(r);
          setExcluindo(null);
        },
        onError: (e) => setExcluindo({ id, erro: textoDoErro(e, t) }),
      },
    );
  }

  const formularioDeCriacao = novo !== null && (
    <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center" data-testid="form-novo-funil">
      <Input
        autoFocus
        value={novo}
        onChange={(e) => setNovo(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") criarFunil();
          if (e.key === "Escape") setNovo(null);
        }}
        placeholder={t("Nome do funil — ex.: Consultas, Obras, Matrículas")}
        aria-label={t("Nome do novo funil")}
        data-testid="nome-do-novo-funil"
        disabled={ocupado}
      />
      <div className="flex gap-2">
        <Button onClick={criarFunil} disabled={ocupado || !novo.trim()} data-testid="confirmar-novo-funil">
          {t("Criar funil")}
        </Button>
        <Button variant="ghost" onClick={() => setNovo(null)} disabled={ocupado}>
          {t("Cancelar")}
        </Button>
      </div>
    </Card>
  );

  const gaveta = (
    <GavetaDeArquivados
      arquivados={arquivados}
      podeGerenciar={podeGerenciar}
      ocupado={ocupado}
      onDesarquivar={(id) => aplicar(id, { is_archived: false })}
      onExcluir={excluirDoArquivo}
      erro={erro}
      setErro={setErro}
      excluindo={excluindo}
      setExcluindo={setExcluindo}
      t={t}
    />
  );

  if (funis.length === 0) {
    return (
      <div className={styles.emptyStateContainer}>
        {formularioDeCriacao}
        {novo === null && (
          <EmptyPipeline
            primary={
              podeGerenciar
                ? { label: t("Criar meu primeiro funil"), onClick: () => setNovo("") }
                : undefined
            }
          />
        )}
        {erro && (
          <p className="text-sm text-destructive" data-testid="erro-geral">
            {erro.texto}
          </p>
        )}
        {gaveta}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {(podeGerenciar || podeImportar) && (
        <div className={styles.topActions}>
          {podeImportar ? <ImportarLeads funis={funis} /> : null}
          {podeGerenciar && novo === null ? (
            <Button
              onClick={() => setNovo("")}
              disabled={ocupado}
              data-testid="novo-funil"
              className="w-full sm:w-auto"
            >
              <Plus size={16} className="mr-2" aria-hidden /> {t("Novo funil")}
            </Button>
          ) : null}
        </div>
      )}

      {formularioDeCriacao}

      {erro?.id === null && (
        <p className="text-sm text-destructive" data-testid="erro-geral">
          {erro.texto}
        </p>
      )}

      <ul className={styles.pipelineList}>
        {funis.map((funil, i) => (
          <FunilItem
            key={funil.id}
            funil={funil}
            index={i}
            totalFunis={funis.length}
            podeGerenciar={podeGerenciar}
            clientesLigado={clientesLigado}
            ocupado={ocupado}
            renomeandoAqui={renomeando?.id === funil.id ? renomeando : null}
            arquivandoAqui={arquivando?.id === funil.id ? arquivando : null}
            erroDaLinha={erro?.id === funil.id ? erro.texto : null}
            onSubir={() => aplicar(funil.id, { depois_de: vizinhoAoMover(funis, i, "subir") })}
            onDescer={() => aplicar(funil.id, { depois_de: vizinhoAoMover(funis, i, "descer") })}
            onStartRename={(nome) => setRenomeando({ id: funil.id, nome })}
            onSaveRename={(nome) => aplicar(funil.id, { name: nome })}
            onCancelRename={() => setRenomeando(null)}
            onUpdateRenameValue={(nome) => setRenomeando({ id: funil.id, nome })}
            onTornarPadrao={() => aplicar(funil.id, { is_default: true })}
            onToggleClientes={() =>
              aplicar(funil.id, { is_client_pipeline: !funil.is_client_pipeline })
            }
            onStartArquivar={() => {
              setErro(null);
              setArquivando({ id: funil.id, erro: null });
            }}
            onCancelArquivar={() => setArquivando(null)}
            onConfirmArquivar={(definitivo) => pedirArquivamento(funil.id, definitivo)}
            t={t}
          />
        ))}
      </ul>

      {gaveta}

      {clientesLigado ? (
        <p className={styles.footerNote} data-testid="funis-rodape-clientes">
          {t(
            "Quem já tem atendimento marcado entra pelo funil de clientes. Sem um funil marcado, entra pelo padrão.",
          )}
        </p>
      ) : (
        <p className={styles.footerNote} data-testid="funis-rodape-clientes">
          {t(
            "Para separar quem já é cliente, ligue “Clientes pela agenda” em Configurações › Tipos de agendamento. Enquanto estiver desligado, todo contato novo entra pelo funil padrão.",
          )}{" "}
          <Link href="/app/settings/tenant/agenda" className="underline" data-testid="funis-rodape-ligar">
            {t("Abrir Tipos de agendamento")}
          </Link>
        </p>
      )}
    </div>
  );
}
