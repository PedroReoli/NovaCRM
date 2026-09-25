"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { showApiError } from "@/components/feedback/ApiErrorToast";
import { useT } from "@/hooks/i18n/useT";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api/client";
import { formatCents } from "@/lib/money";
import { precoParaCentavos, type Produto } from "@/lib/schemas/produtos";

import { FotosDoProduto } from "./_components/FotosDoProduto";
import { FormProduto, type RascunhoProduto } from "./_components/FormProduto";
import { ResumoImportacao, type ResumoDaImportacao } from "./_components/ResumoImportacao";
import styles from "./products.module.css";

interface Textos {
  titulo: string;
  subtitulo: string;
  vazio: string;
  vazioDica: string;
}

const VAZIO: RascunhoProduto = {
  codigo: "",
  nome: "",
  marca: "",
  categoria: "",
  preco: "",
  custo: "",
  quantidade: "0",
  controla_estoque: true,
};

function doRascunho(
  r: RascunhoProduto,
  t: (s: string) => string,
): Record<string, unknown> | { erro: string } {
  const preco_cents = precoParaCentavos(r.preco);
  if (preco_cents === null) return { erro: t("Preço inválido. Escreva assim: 5.499,00") };
  const custo_cents = r.custo.trim() === "" ? null : precoParaCentavos(r.custo);
  if (r.custo.trim() !== "" && custo_cents === null) return { erro: t("Custo inválido.") };

  return {
    codigo: r.codigo.trim(),
    nome: r.nome.trim(),
    ...(r.marca.trim() ? { marca: r.marca.trim() } : {}),
    ...(r.categoria.trim() ? { categoria: r.categoria.trim() } : {}),
    preco_cents,
    custo_cents,
    controla_estoque: r.controla_estoque,
    quantidade: Number(r.quantidade) || 0,
  };
}

export function ProdutosClient({
  inicial,
  urlsDasFotos,
  podeEditar,
  textos,
}: {
  inicial: Produto[];
  urlsDasFotos: Record<string, string>;
  podeEditar: boolean;
  textos: Textos;
}) {
  const t = useT();
  const router = useRouter();
  const [busca, setBusca] = React.useState("");
  const [criando, setCriando] = React.useState(false);
  const [rascunho, setRascunho] = React.useState<RascunhoProduto>(VAZIO);
  const [salvando, setSalvando] = React.useState(false);
  const [importando, setImportando] = React.useState(false);
  const [resumo, setResumo] = React.useState<ResumoDaImportacao | null>(null);
  const arquivoRef = React.useRef<HTMLInputElement>(null);
  const [fotosAbertas, setFotosAbertas] = React.useState<string | null>(null);

  const filtrados = React.useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (q === "") return inicial;
    return inicial.filter((p) =>
      [p.nome, p.codigo, p.marca ?? "", p.categoria ?? ""].join(" ").toLowerCase().includes(q),
    );
  }, [inicial, busca]);

  async function salvar() {
    const corpo = doRascunho(rascunho, t);
    if ("erro" in corpo) {
      toast.error(corpo.erro as string);
      return;
    }
    setSalvando(true);
    try {
      await apiClient.post("/api/v1/products", corpo);
      toast.success(t("Produto cadastrado"));
      setRascunho(VAZIO);
      setCriando(false);
      router.refresh();
    } catch (e) {
      showApiError(e);
    } finally {
      setSalvando(false);
    }
  }

  async function importar(arquivo: File) {
    setImportando(true);
    setResumo(null);
    try {
      const form = new FormData();
      form.append("file", arquivo);
      const res = await fetch("/api/v1/products/import", { method: "POST", body: form });
      const json = (await res.json()) as
        | { data: ResumoDaImportacao }
        | { error?: { message?: string } };
      if (!res.ok || !("data" in json)) {
        const msg = "error" in json ? json.error?.message : undefined;
        toast.error(msg ?? t("Não consegui ler essa planilha."));
        return;
      }
      setResumo(json.data);
      router.refresh();
    } catch {
      toast.error(t("Não consegui enviar o arquivo."));
    } finally {
      setImportando(false);
      if (arquivoRef.current) arquivoRef.current.value = "";
    }
  }

  async function alternarAtivo(p: Produto) {
    try {
      await apiClient.patch(`/api/v1/products/${p.id}`, { ativo: !p.ativo });
      toast.success(t(p.ativo ? "Produto desativado" : "Produto reativado"));
      router.refresh();
    } catch (e) {
      showApiError(e);
    }
  }

  return (
    <div className={styles.container} data-testid="tela-produtos">
      <header className={styles.header}>
        <h1 className={styles.title}>{textos.titulo}</h1>
        <p className={styles.subtitle}>{textos.subtitulo}</p>
      </header>

      <div className={styles.filterBar}>
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder={t("Buscar por nome, código ou marca")}
          className={styles.searchInput}
          data-testid="busca-produto"
        />
        {podeEditar ? (
          <>
            <Button onClick={() => setCriando((v) => !v)} data-testid="novo-produto">
              {t(criando ? "Cancelar" : "Novo produto")}
            </Button>
            <input
              ref={arquivoRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              data-testid="arquivo-planilha"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void importar(f);
              }}
            />
            <Button
              variant="outline"
              disabled={importando}
              onClick={() => arquivoRef.current?.click()}
              data-testid="importar-planilha"
            >
              {t(importando ? "Importando…" : "Importar planilha")}
            </Button>
          </>
        ) : null}
      </div>

      {podeEditar ? (
        <a
          href="/api/v1/products/import"
          download="modelo-catalogo.csv"
          className={styles.downloadLink}
          data-testid="modelo-planilha"
        >
          {t("Baixar planilha modelo")}
        </a>
      ) : null}

      {resumo ? (
        <ResumoImportacao resumo={resumo} onClose={() => setResumo(null)} />
      ) : null}

      {criando && podeEditar ? (
        <FormProduto
          rascunho={rascunho}
          onChangeRascunho={setRascunho}
          onSalvar={salvar}
          salvando={salvando}
        />
      ) : null}

      {filtrados.length === 0 ? (
        <div className={styles.emptyState} data-testid="produtos-vazio">
          <p className="font-medium">{textos.vazio}</p>
          <p className="mt-1 text-sm text-muted-foreground">{textos.vazioDica}</p>
        </div>
      ) : (
        <ul className={styles.productList} data-testid="lista-produtos">
          {filtrados.map((p) => {
            const capa = p.fotos?.[0] ? urlsDasFotos[p.fotos[0]] : undefined;
            return (
              <li key={p.id} className={styles.productItem} data-testid={`produto-${p.codigo}`}>
                <div className={styles.itemRow}>
                  {capa ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={capa} alt="" className={styles.thumbnail} />
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate font-medium ${
                        p.ativo ? "" : "text-muted-foreground line-through"
                      }`}
                    >
                      {p.nome}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {p.codigo}
                      {p.marca ? ` · ${p.marca}` : ""}
                      {p.controla_estoque
                        ? ` · ${p.quantidade} ${t("em estoque")}`
                        : ` · ${t("sem controle de estoque")}`}
                    </p>
                  </div>
                  <span className={styles.productPrice}>
                    {formatCents(p.preco_cents, p.moeda)}
                  </span>
                  {podeEditar ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFotosAbertas((v) => (v === p.id ? null : p.id))}
                        aria-expanded={fotosAbertas === p.id}
                        data-testid={`abrir-fotos-${p.codigo}`}
                      >
                        {t("Fotos")} ({p.fotos?.length ?? 0})
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void alternarAtivo(p)}
                        data-testid={`alternar-${p.codigo}`}
                      >
                        {t(p.ativo ? "Desativar" : "Reativar")}
                      </Button>
                    </>
                  ) : null}
                </div>
                {podeEditar && fotosAbertas === p.id ? (
                  <FotosDoProduto produto={p} urls={urlsDasFotos} />
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
