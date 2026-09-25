"use client";

import { useT } from "@/hooks/i18n/useT";
import type { Forma } from "../_types";
import styles from "./EscolhaForma.module.css";

interface EscolhaProps {
  valor: Forma;
  atual: Forma | null;
  titulo: string;
  corpo: string;
  onEscolher: (v: Forma) => void;
}

function Escolha({ valor, atual, titulo, corpo, onEscolher }: EscolhaProps) {
  const marcada = atual === valor;
  return (
    <label
      data-testid={`forma-${valor}`}
      data-marcada={marcada ? "sim" : "nao"}
      className={styles.cardOpcao}
    >
      <input
        type="radio"
        name="forma-de-conectar"
        value={valor}
        checked={marcada}
        onChange={() => onEscolher(valor)}
        className={styles.radio}
        aria-label={titulo}
      />
      <span className={styles.conteudoOpcao}>
        <span className={styles.tituloOpcao}>{titulo}</span>
        <span className={styles.corpoOpcao}>{corpo}</span>
      </span>
    </label>
  );
}

interface EscolhaFormaProps {
  forma: Forma | null;
  onEscolher: (forma: Forma) => void;
}

export function EscolhaForma({ forma, onEscolher }: EscolhaFormaProps) {
  const t = useT();

  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legenda}>{t("Como você já usa esse número?")}</legend>
      <p className={styles.ajuda}>
        {t(
          "Existe mais de um jeito de ter WhatsApp para empresa, e cada um conecta de um jeito. Se você nunca ouviu falar dos outros dois, é o primeiro.",
        )}
      </p>
      <div className={styles.gradeOpcoes}>
        <Escolha
          valor="qr"
          atual={forma}
          titulo={t("Uso o WhatsApp no celular")}
          corpo={t(
            "Conecte com QR Code ou digite um código de pareamento no WhatsApp do celular.",
          )}
          onEscolher={onEscolher}
        />
        <Escolha
          valor="oficial"
          atual={forma}
          titulo={t("Tenho conta oficial na Meta")}
          corpo={t("Você cadastrou o número na Meta e tem as credenciais em mãos. Não usa o celular para conectar.")}
          onEscolher={onEscolher}
        />
        <Escolha
          valor="parceiro"
          atual={forma}
          titulo={t("Contrato de um provedor parceiro")}
          corpo={t("Uma empresa parceira cuida do seu WhatsApp e te deu uma chave de acesso.")}
          onEscolher={onEscolher}
        />
      </div>
    </fieldset>
  );
}
