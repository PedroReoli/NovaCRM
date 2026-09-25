"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useT } from "@/hooks/i18n/useT";
import type { PreviaDaAudiencia } from "@/hooks/campanhas/useCampanhas";
import styles from "./SecaoPublico.module.css";

interface FunilItem {
  id: string;
  name: string;
}

interface EtapaItem {
  id: string;
  name: string;
}

interface SecaoPublicoProps {
  comAlgumaTag: string;
  setComAlgumaTag: (v: string) => void;
  semTags: string;
  setSemTags: (v: string) => void;
  semInteracao: string;
  setSemInteracao: (v: string) => void;
  funilDoPublico: string;
  setFunilDoPublico: (v: string) => void;
  etapaDoPublico: string;
  setEtapaDoPublico: (v: string) => void;
  limite: string;
  setLimite: (v: string) => void;
  funis: FunilItem[];
  etapasDoPublico: EtapaItem[];
  temCriterio: boolean;
  onVerQuantasPessoas: () => void;
  isPreviaPending: boolean;
  previaData?: PreviaDaAudiencia;
}

export function SecaoPublico({
  comAlgumaTag,
  setComAlgumaTag,
  semTags,
  setSemTags,
  semInteracao,
  setSemInteracao,
  funilDoPublico,
  setFunilDoPublico,
  etapaDoPublico,
  setEtapaDoPublico,
  limite,
  setLimite,
  funis,
  etapasDoPublico,
  temCriterio,
  onVerQuantasPessoas,
  isPreviaPending,
  previaData,
}: SecaoPublicoProps) {
  const t = useT();

  return (
    <Card className={styles.card}>
      <h2 className={styles.titulo}>{t("Público")}</h2>
      <p className={styles.subtitulo}>
        {t("Escolha pelo menos um critério — uma lista sem recorte ninguém confere antes de apertar.")}
      </p>
      <div className={styles.gradeCampos}>
        <div className={styles.campo}>
          <Label htmlFor="com-tags">{t("Com alguma destas etiquetas")}</Label>
          <Input
            id="com-tags"
            value={comAlgumaTag}
            onChange={(e) => setComAlgumaTag(e.target.value)}
            placeholder={t("separe por vírgula")}
          />
        </div>
        <div className={styles.campo}>
          <Label htmlFor="sem-tags">{t("Sem nenhuma destas etiquetas")}</Label>
          <Input
            id="sem-tags"
            value={semTags}
            onChange={(e) => setSemTags(e.target.value)}
            placeholder={t("separe por vírgula")}
          />
        </div>
        <div className={styles.campo}>
          <Label htmlFor="silencio">{t("Sem falar com a gente há (dias)")}</Label>
          <Input
            id="silencio"
            type="number"
            min={1}
            value={semInteracao}
            onChange={(e) => setSemInteracao(e.target.value)}
          />
        </div>
        <div className={styles.campo}>
          <Label htmlFor="pub-funil">{t("Com negócio no funil")}</Label>
          <select
            id="pub-funil"
            className={styles.seletor}
            value={funilDoPublico}
            onChange={(e) => {
              setFunilDoPublico(e.target.value);
              setEtapaDoPublico("");
            }}
          >
            <option value="">{t("Qualquer um")}</option>
            {funis.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.campo}>
          <Label htmlFor="pub-etapa">{t("Na etapa")}</Label>
          <select
            id="pub-etapa"
            className={styles.seletor}
            value={etapaDoPublico}
            onChange={(e) => setEtapaDoPublico(e.target.value)}
            disabled={!funilDoPublico}
          >
            <option value="">{t("Qualquer etapa")}</option>
            {etapasDoPublico.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.campo}>
          <Label htmlFor="limite">{t("Máximo de contatos nesta campanha")}</Label>
          <Input
            id="limite"
            type="number"
            min={1}
            max={5000}
            value={limite}
            onChange={(e) => setLimite(e.target.value)}
          />
        </div>
      </div>
      <div className={styles.acoesPrevia}>
        <Button
          type="button"
          variant="outline"
          disabled={!temCriterio || isPreviaPending}
          onClick={onVerQuantasPessoas}
        >
          {isPreviaPending ? t("Contando…") : t("Ver quantas pessoas")}
        </Button>
        {previaData && (
          <p className={styles.textoPrevia}>
            <strong>{previaData.elegiveis}</strong> {t("podem receber")}
            {previaData.excluidos > 0
              ? ` · ${previaData.excluidos} ${t("ficam de fora")}`
              : ""}
          </p>
        )}
      </div>
      {previaData && previaData.excluidos > 0 && (
        <ul className={styles.listaMotivos}>
          {Object.entries(previaData.motivos).map(([motivo, quantos]) => (
            <li key={motivo}>
              {quantos} — {t(previaData.legenda[motivo] ?? motivo)}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
