"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  type CampanhaDetalhada,
  type Destinatario,
} from "@/hooks/campanhas/useCampanhas";
import { useT } from "@/hooks/i18n/useT";
import { rotuloDoContato } from "@/lib/contacts/rotulo-do-contato";
import { ROTULO_DO_DESTINATARIO, rotuloDoMotivo } from "../_types";
import styles from "./DestinatariosLista.module.css";

interface DestinatariosListaProps {
  campanha: CampanhaDetalhada;
  linhas: Destinatario[];
  filtroDeStatus: string;
  setFiltroDeStatus: (status: string) => void;
  hasNextPage?: boolean;
  isFetchingNextPage: boolean;
  onFetchNextPage: () => void;
}

export function DestinatariosLista({
  campanha,
  linhas,
  filtroDeStatus,
  setFiltroDeStatus,
  hasNextPage,
  isFetchingNextPage,
  onFetchNextPage,
}: DestinatariosListaProps) {
  const t = useT();

  return (
    <Card className={styles.card}>
      <div className={styles.cabecalho}>
        <h2 className={styles.titulo}>{t("Quem está na lista")}</h2>
        <select
          className={styles.seletor}
          value={filtroDeStatus}
          onChange={(e) => setFiltroDeStatus(e.target.value)}
          aria-label={t("Filtrar destinatários")}
        >
          <option value="">{t("Todos")}</option>
          <option value="pending">{t("Ainda não enviadas")}</option>
          <option value="sent">{t("Enviadas")}</option>
          <option value="delivered">{t("Entregues")}</option>
          <option value="read">{t("Lidas")}</option>
          <option value="replied">{t("Responderam")}</option>
          <option value="skipped">{t("Fora da lista")}</option>
          <option value="failed">{t("Falharam")}</option>
        </select>
      </div>

      {campanha.snapshot_total === 0 ? (
        <p className={styles.vazio}>
          {t("A lista ainda não foi montada. Use Preparar para ver quem entra.")}
        </p>
      ) : (
        <div className={styles.lista}>
          {linhas.map((d) => (
            <div key={d.id} className={styles.item}>
              <span className={styles.nome}>
                {rotuloDoContato(d.contacts, t)}
              </span>
              <span className={styles.status}>
                {d.eligibility_status === "excluded"
                  ? t(d.legenda_da_exclusao ?? rotuloDoMotivo(d.exclusion_reason))
                  : t(ROTULO_DO_DESTINATARIO[d.status] ?? d.status)}
              </span>
            </div>
          ))}
          {hasNextPage && (
            <div className={styles.rodape}>
              <Button
                variant="outline"
                size="sm"
                onClick={onFetchNextPage}
                disabled={isFetchingNextPage}
              >
                {t("Carregar mais")}
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
