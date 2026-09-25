"use client";

import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useT } from "@/hooks/i18n/useT";
import { VARIAVEIS_DA_CAMPANHA, DESCRICAO_DA_VARIAVEL } from "@/lib/campanhas/renderizador";
import styles from "./SecaoMensagem.module.css";

interface SecaoMensagemProps {
  texto: string;
  setTexto: React.Dispatch<React.SetStateAction<string>>;
}

export function SecaoMensagem({ texto, setTexto }: SecaoMensagemProps) {
  const t = useT();

  return (
    <Card className={styles.card}>
      <h2 className={styles.titulo}>{t("Mensagem")}</h2>
      <Textarea
        rows={6}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder={t("Escreva como você falaria com uma pessoa só.")}
        aria-label={t("Texto da mensagem")}
      />
      <div className={styles.ajudaVariaveis}>
        <p>{t("Você pode usar:")}</p>
        <ul className={styles.listaVariaveis}>
          {VARIAVEIS_DA_CAMPANHA.map((v) => (
            <li key={v}>
              <button
                type="button"
                className={styles.btnVariavel}
                onClick={() => setTexto((atual) => `${atual}{{${v}}}`)}
              >
                {`{{${v}}}`}
              </button>{" "}
              — {t(DESCRICAO_DA_VARIAVEL[v])}
            </li>
          ))}
        </ul>
        <p>
          {t(
            "Quem não tiver o dado que a mensagem usa fica de fora, com o motivo na lista — mensagem com buraco não sai.",
          )}
        </p>
      </div>
    </Card>
  );
}
