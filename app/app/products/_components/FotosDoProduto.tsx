"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { showApiError } from "@/components/feedback/ApiErrorToast";
import { apiClient } from "@/lib/api/client";
import { MAXIMO_DE_FOTOS } from "@/lib/catalogo/fotos";
import type { Produto } from "@/lib/schemas/produtos";
import { useT } from "@/hooks/i18n/useT";
import styles from "./FotosDoProduto.module.css";

interface FotosDoProdutoProps {
  produto: Produto;
  urls: Record<string, string>;
}

export function FotosDoProduto({ produto, urls }: FotosDoProdutoProps) {
  const t = useT();
  const router = useRouter();
  const [ocupado, setOcupado] = React.useState(false);
  const entradaRef = React.useRef<HTMLInputElement>(null);
  const fotos = produto.fotos ?? [];

  async function subir(arquivo: File) {
    setOcupado(true);
    try {
      const form = new FormData();
      form.append("file", arquivo);
      const res = await fetch(`/api/v1/products/${produto.id}/fotos`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as {
          error?: { message?: string };
        } | null;
        toast.error(json?.error?.message ?? t("Não consegui enviar a foto."));
        return;
      }
      toast.success(t("Foto adicionada"));
      router.refresh();
    } catch {
      toast.error(t("Não consegui enviar a foto."));
    } finally {
      setOcupado(false);
      if (entradaRef.current) entradaRef.current.value = "";
    }
  }

  async function gravarOrdem(nova: string[], aviso: string) {
    setOcupado(true);
    try {
      await apiClient.put(`/api/v1/products/${produto.id}/fotos`, { fotos: nova });
      toast.success(aviso);
      router.refresh();
    } catch (e) {
      showApiError(e);
    } finally {
      setOcupado(false);
    }
  }

  function mover(i: number, delta: -1 | 1) {
    const nova = [...fotos];
    [nova[i], nova[i + delta]] = [nova[i + delta]!, nova[i]!];
    void gravarOrdem(nova, t("Ordem das fotos salva"));
  }

  return (
    <div className={styles.container} data-testid={`fotos-${produto.codigo}`}>
      <p className={styles.description}>
        {t(
          "A primeira foto é a capa. O atendente de IA manda as fotos nesta ordem quando apresenta o produto.",
        )}
      </p>
      <ul className={styles.photoList}>
        {fotos.map((caminho, i) => (
          <li key={caminho} className={styles.photoItem} data-testid="foto-do-produto">
            {urls[caminho] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={urls[caminho]}
                alt={`${produto.nome} — ${t("foto")} ${i + 1}`}
                className={styles.image}
              />
            ) : (
              <div className={styles.placeholder}>
                {t("Sem prévia")}
              </div>
            )}
            <div className={styles.photoActions}>
              <Button
                variant="ghost"
                size="sm"
                disabled={ocupado || i === 0}
                onClick={() => mover(i, -1)}
                aria-label={t("Mover a foto para a esquerda")}
              >
                ←
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={ocupado}
                onClick={() =>
                  void gravarOrdem(
                    fotos.filter((c) => c !== caminho),
                    t("Foto removida"),
                  )
                }
                aria-label={t("Remover a foto")}
                data-testid="remover-foto"
              >
                ✕
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={ocupado || i === fotos.length - 1}
                onClick={() => mover(i, 1)}
                aria-label={t("Mover a foto para a direita")}
              >
                →
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <input
        ref={entradaRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        data-testid="arquivo-foto"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void subir(f);
        }}
      />
      <div className={styles.bottomBar}>
        <Button
          variant="outline"
          size="sm"
          disabled={ocupado || fotos.length >= MAXIMO_DE_FOTOS}
          onClick={() => entradaRef.current?.click()}
          data-testid="adicionar-foto"
        >
          {t(ocupado ? "Salvando…" : "Adicionar foto")}
        </Button>
        <span className="text-xs text-muted-foreground">
          {t("JPG ou PNG, até 5 MB. No máximo 5 fotos.")}
        </span>
      </div>
    </div>
  );
}
