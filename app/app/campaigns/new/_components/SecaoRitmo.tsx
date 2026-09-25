"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useT } from "@/hooks/i18n/useT";
import styles from "./SecaoRitmo.module.css";

interface SecaoRitmoProps {
  intervalo: string;
  setIntervalo: (v: string) => void;
  tetoDiario: string;
  setTetoDiario: (v: string) => void;
  tetoHorario: string;
  setTetoHorario: (v: string) => void;
  janelaInicio: string;
  setJanelaInicio: (v: string) => void;
  janelaFim: string;
  setJanelaFim: (v: string) => void;
}

export function SecaoRitmo({
  intervalo,
  setIntervalo,
  tetoDiario,
  setTetoDiario,
  tetoHorario,
  setTetoHorario,
  janelaInicio,
  setJanelaInicio,
  janelaFim,
  setJanelaFim,
}: SecaoRitmoProps) {
  const t = useT();

  return (
    <Card className={styles.card}>
      <h2 className={styles.titulo}>{t("Ritmo desta campanha")}</h2>
      <p className={styles.subtitulo}>
        {t(
          "Em branco, vale o ritmo do número (Conexões › Proteção de envio). O que você puser aqui só pode deixar mais devagar.",
        )}
      </p>
      <div className={styles.gradeCampos}>
        <div className={styles.campo}>
          <Label htmlFor="intervalo">{t("Intervalo mínimo entre mensagens (segundos)")}</Label>
          <Input
            id="intervalo"
            type="number"
            min={1}
            value={intervalo}
            onChange={(e) => setIntervalo(e.target.value)}
          />
        </div>
        <div className={styles.campo}>
          <Label htmlFor="teto">{t("Máximo por dia")}</Label>
          <Input
            id="teto"
            type="number"
            min={1}
            value={tetoDiario}
            onChange={(e) => setTetoDiario(e.target.value)}
          />
        </div>
        <div className={styles.campo}>
          <Label htmlFor="teto-hora">{t("Máximo por hora")}</Label>
          <Input
            id="teto-hora"
            type="number"
            min={1}
            value={tetoHorario}
            onChange={(e) => setTetoHorario(e.target.value)}
          />
        </div>
        <div className={styles.campo}>
          <Label htmlFor="janela-inicio">{t("Enviar só a partir das (hora)")}</Label>
          <Input
            id="janela-inicio"
            type="number"
            min={0}
            max={23}
            value={janelaInicio}
            onChange={(e) => setJanelaInicio(e.target.value)}
          />
        </div>
        <div className={styles.campo}>
          <Label htmlFor="janela-fim">{t("Parar de enviar às (hora)")}</Label>
          <Input
            id="janela-fim"
            type="number"
            min={1}
            max={24}
            value={janelaFim}
            onChange={(e) => setJanelaFim(e.target.value)}
          />
        </div>
      </div>
    </Card>
  );
}
