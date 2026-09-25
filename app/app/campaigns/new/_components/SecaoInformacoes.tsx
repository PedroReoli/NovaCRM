"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { channelLabel, type ChannelSession } from "@/hooks/channels/useChannelSessions";
import { useT } from "@/hooks/i18n/useT";
import styles from "./SecaoInformacoes.module.css";

interface SecaoInformacoesProps {
  nome: string;
  setNome: (v: string) => void;
  canal: string;
  setCanal: (v: string) => void;
  canais: ChannelSession[];
  extras: string[];
  setExtras: React.Dispatch<React.SetStateAction<string[]>>;
  baseLegal: "consent" | "legitimate_interest";
  setBaseLegal: (v: "consent" | "legitimate_interest") => void;
  liaRef: string;
  setLiaRef: (v: string) => void;
}

export function SecaoInformacoes({
  nome,
  setNome,
  canal,
  setCanal,
  canais,
  extras,
  setExtras,
  baseLegal,
  setBaseLegal,
  liaRef,
  setLiaRef,
}: SecaoInformacoesProps) {
  const t = useT();

  return (
    <Card className={styles.card}>
      <h2 className={styles.titulo}>{t("Informações")}</h2>
      <div className={styles.campo}>
        <Label htmlFor="nome">{t("Nome da campanha")}</Label>
        <Input
          id="nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder={t("Ex.: Reativação de clientes parados")}
        />
      </div>

      <div className={styles.campo}>
        <Label htmlFor="canal">{t("Enviar pelo número")}</Label>
        <select
          id="canal"
          className={styles.seletor}
          value={canal}
          onChange={(e) => setCanal(e.target.value)}
        >
          <option value="">{t("Escolha um número")}</option>
          {canais.map((c) => (
            <option key={c.id} value={c.id}>
              {channelLabel(c, t)}
            </option>
          ))}
        </select>
        {canais.length === 0 && (
          <p className={styles.aviso}>
            {t("Nenhum número conectado. Conecte um em Conexões antes de criar a campanha.")}
          </p>
        )}
      </div>

      {canais.length > 1 && (
        <fieldset className={styles.grupoFieldSet}>
          <legend className={styles.legenda}>{t("Falar também por estes números")}</legend>
          <p className={styles.textoAjuda}>
            {t(
              "A campanha reveza entre os números marcados, escolhendo a cada envio o que tem mais folga no teto do dia. Quem já conversa com você por um deles recebe por esse mesmo, para não chegar de um número desconhecido.",
            )}
          </p>
          {canais
            .filter((c) => c.id !== canal)
            .map((c) => (
              <label key={c.id} className={styles.opcaoLinha}>
                <input
                  type="checkbox"
                  checked={extras.includes(c.id)}
                  onChange={(e) =>
                    setExtras((atual) =>
                      e.target.checked ? [...atual, c.id] : atual.filter((id) => id !== c.id),
                    )
                  }
                />
                {channelLabel(c, t)}
              </label>
            ))}
          {extras.length > 0 && (
            <p className={styles.textoAjuda}>
              {t(
                "Atenção: o intervalo e os tetos da CAMPANHA somam todos os números. Para o rodízio aumentar o volume, deixe o ritmo da campanha em branco e cada número usa o dele.",
              )}
            </p>
          )}
        </fieldset>
      )}

      <fieldset className={styles.grupoFieldSet}>
        <legend className={styles.legenda}>{t("Base legal do envio")}</legend>
        <p className={styles.textoAjuda}>
          {t(
            "Quem recebe pode perguntar por que recebeu, e a resposta precisa existir antes do envio.",
          )}
        </p>
        <label className={styles.opcaoLinha}>
          <input
            type="radio"
            name="base-legal"
            value="consent"
            checked={baseLegal === "consent"}
            onChange={() => setBaseLegal("consent")}
          />
          {t("Consentimento — estas pessoas pediram para receber")}
        </label>
        <label className={styles.opcaoLinha}>
          <input
            type="radio"
            name="base-legal"
            value="legitimate_interest"
            checked={baseLegal === "legitimate_interest"}
            onChange={() => setBaseLegal("legitimate_interest")}
          />
          {t("Interesse legítimo — com avaliação (LIA) registrada")}
        </label>
        {baseLegal === "legitimate_interest" && (
          <div className={styles.campo}>
            <Label htmlFor="lia">{t("Referência da avaliação (LIA)")}</Label>
            <Input
              id="lia"
              value={liaRef}
              onChange={(e) => setLiaRef(e.target.value)}
              placeholder={t("Ex.: LIA-2026-01")}
            />
          </div>
        )}
      </fieldset>
    </Card>
  );
}
