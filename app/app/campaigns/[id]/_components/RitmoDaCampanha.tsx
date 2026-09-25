"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEditarCampanha, type CampanhaDetalhada } from "@/hooks/campanhas/useCampanhas";
import { useT } from "@/hooks/i18n/useT";
import styles from "./RitmoDaCampanha.module.css";

interface RitmoDaCampanhaProps {
  campanha: CampanhaDetalhada;
}

/** `null` vira campo vazio — e campo vazio volta a ser `null`, que é "herda o número". */
function texto(valor: number | null): string {
  return valor === null || valor === undefined ? "" : String(valor);
}

function numero(valor: string): number | null {
  const limpo = valor.trim();
  if (limpo === "") return null;
  const n = Number(limpo);
  return Number.isFinite(n) ? n : null;
}

function CampoDeRitmo({
  id,
  rotulo,
  valor,
  onChange,
}: {
  id: string;
  rotulo: string;
  valor: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className={styles.campo}>
      <Label htmlFor={id}>{rotulo}</Label>
      <Input id={id} type="number" min={0} value={valor} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

/**
 * O ritmo, editável com a campanha EM PÉ.
 *
 * A API aceita mexer no ritmo em qualquer estado vivo (só conteúdo e público
 * ficam presos ao rascunho). Em branco herda o número.
 */
export function RitmoDaCampanha({ campanha }: RitmoDaCampanhaProps) {
  const t = useT();
  const editar = useEditarCampanha(campanha.id);
  const [intervalo, setIntervalo] = useState(texto(campanha.intervalo_segundos));
  const [tetoDia, setTetoDia] = useState(texto(campanha.teto_diario));
  const [tetoHora, setTetoHora] = useState(texto(campanha.teto_horario));
  const [inicio, setInicio] = useState(texto(campanha.janela_inicio_hora));
  const [fim, setFim] = useState(texto(campanha.janela_fim_hora));

  const encerrada = campanha.status === "completed" || campanha.status === "cancelled";
  if (encerrada) return null;

  return (
    <Card className={styles.card}>
      <div>
        <h2 className={styles.titulo}>{t("Ritmo desta campanha")}</h2>
        <p className={styles.subtitulo}>
          {t(
            "Em branco, vale o ritmo do número (Conexões › Proteção de envio). O que você puser aqui só pode deixar mais devagar.",
          )}
        </p>
      </div>
      <div className={styles.gradeCampos}>
        <CampoDeRitmo id="r-intervalo" rotulo={t("Intervalo mínimo entre mensagens (segundos)")} valor={intervalo} onChange={setIntervalo} />
        <CampoDeRitmo id="r-dia" rotulo={t("Máximo por dia")} valor={tetoDia} onChange={setTetoDia} />
        <CampoDeRitmo id="r-hora" rotulo={t("Máximo por hora")} valor={tetoHora} onChange={setTetoHora} />
        <div />
        <CampoDeRitmo id="r-inicio" rotulo={t("Enviar só a partir das (hora)")} valor={inicio} onChange={setInicio} />
        <CampoDeRitmo id="r-fim" rotulo={t("Parar de enviar às (hora)")} valor={fim} onChange={setFim} />
      </div>
      <div className={styles.rodape}>
        <Button
          size="sm"
          disabled={editar.isPending}
          onClick={() =>
            editar.mutate({
              intervalo_segundos: numero(intervalo),
              teto_diario: numero(tetoDia),
              teto_horario: numero(tetoHora),
              janela_inicio_hora: numero(inicio),
              janela_fim_hora: numero(fim),
            })
          }
        >
          {editar.isPending ? t("Salvando…") : t("Salvar ritmo")}
        </Button>
        {editar.isSuccess && !editar.isPending && (
          <span className={styles.sucesso}>{t("Ritmo salvo.")}</span>
        )}
      </div>
    </Card>
  );
}
