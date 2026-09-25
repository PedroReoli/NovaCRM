"use client";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useT } from "@/hooks/i18n/useT";
import styles from "./SecaoAtendimento.module.css";

interface FunilItem {
  id: string;
  name: string;
}

interface EtapaItem {
  id: string;
  name: string;
  is_won?: boolean;
  is_lost?: boolean;
}

interface AgenteItem {
  id: string;
  name: string;
}

interface SecaoAtendimentoProps {
  funil: string;
  setFunil: (v: string) => void;
  etapa: string;
  setEtapa: (v: string) => void;
  agente: string;
  setAgente: (v: string) => void;
  funis: FunilItem[];
  etapas: EtapaItem[];
  agentes: AgenteItem[];
}

export function SecaoAtendimento({
  funil,
  setFunil,
  etapa,
  setEtapa,
  agente,
  setAgente,
  funis,
  etapas,
  agentes,
}: SecaoAtendimentoProps) {
  const t = useT();

  return (
    <Card className={styles.card}>
      <h2 className={styles.titulo}>{t("Quem responder")}</h2>
      <p className={styles.subtitulo}>
        {t("Em branco, tudo segue como hoje: o card nasce no funil do número e quem atende é o agente publicado nele.")}
      </p>
      <div className={styles.gradeCampos}>
        <div className={styles.campo}>
          <Label htmlFor="funil">{t("Vira card no funil")}</Label>
          <select
            id="funil"
            className={styles.seletor}
            value={funil}
            onChange={(e) => {
              setFunil(e.target.value);
              setEtapa("");
            }}
          >
            <option value="">{t("Funil do número (padrão)")}</option>
            {funis.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.campo}>
          <Label htmlFor="etapa">{t("Na etapa")}</Label>
          <select
            id="etapa"
            className={styles.seletor}
            value={etapa}
            onChange={(e) => setEtapa(e.target.value)}
            disabled={!funil}
          >
            <option value="">{t("Primeira etapa do funil")}</option>
            {etapas
              .filter((e) => !e.is_won && !e.is_lost)
              .map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
          </select>
        </div>
      </div>
      <div className={styles.campo}>
        <Label htmlFor="agente">{t("Quem atende a resposta")}</Label>
        <select
          id="agente"
          className={styles.seletor}
          value={agente}
          onChange={(e) => setAgente(e.target.value)}
        >
          <option value="">{t("Agente publicado no número (padrão)")}</option>
          {agentes.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        <p className={styles.subtitulo}>
          {t("Vale só para conversas que nascem desta campanha: quem já falava com você continua com quem o atendia. Quem aborda precisa saber dizer de onde veio o contato — essa resposta tem de estar no material do agente escolhido.")}
        </p>
      </div>
    </Card>
  );
}
