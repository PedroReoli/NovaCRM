"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useContactList } from "@/hooks/contacts/useContactList";
import { useT } from "@/hooks/i18n/useT";
import { rotuloDoContato } from "@/lib/contacts/rotulo-do-contato";
import styles from "./TesteDaCampanha.module.css";

interface TesteDaCampanhaProps {
  onCancelar: () => void;
  onEnviar: (contactId: string) => void;
  enviando: boolean;
}

/**
 * Para quem vai o teste da campanha.
 *
 * Busca sobre os contatos que a organização já tem, garantindo que
 * o teste passe pela mesma cadeia do envio real.
 */
export function TesteDaCampanha({ onCancelar, onEnviar, enviando }: TesteDaCampanhaProps) {
  const t = useT();
  const [busca, setBusca] = useState("");
  const contatos = useContactList({ search: busca || undefined, limit: 10 });
  const encontrados = contatos.data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <Card className={styles.card}>
      <h2 className={styles.titulo}>{t("Enviar teste")}</h2>
      <p className={styles.subtitulo}>
        {t(
          "Sai pelo mesmo número e com o mesmo texto do envio real — inclusive o horário da saudação. Não entra nos números da campanha.",
        )}
      </p>
      <Input
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder={t("Busque o contato pelo nome ou telefone")}
        aria-label={t("Contato do teste")}
      />
      <div className={styles.listaContatos}>
        {encontrados.slice(0, 8).map((c) => (
          <div key={c.id} className={styles.itemContato}>
            <span className={styles.nomeContato}>{rotuloDoContato(c, t)}</span>
            <Button size="sm" variant="outline" disabled={enviando} onClick={() => onEnviar(c.id)}>
              {t("Enviar para este")}
            </Button>
          </div>
        ))}
        {encontrados.length === 0 && (
          <p className="py-2 text-sm text-muted-foreground">{t("Nenhum contato encontrado.")}</p>
        )}
      </div>
      <div className={styles.rodape}>
        <Button variant="outline" size="sm" onClick={onCancelar}>
          {t("Fechar")}
        </Button>
      </div>
    </Card>
  );
}
