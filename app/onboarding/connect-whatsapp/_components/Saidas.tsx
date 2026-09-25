"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useT } from "@/hooks/i18n/useT";
import { skipWhatsapp, markWhatsappConfigured } from "@/app/actions/onboarding/skipWhatsapp";
import { isRedirectError, type Status } from "../_types";
import styles from "./Saidas.module.css";

/** Voltar à pergunta. Escolher errado não pode ser uma porta que tranca. */
export function VoltarParaEscolha({ onVoltar }: { onVoltar: () => void }) {
  const t = useT();
  return (
    <button
      type="button"
      data-testid="voltar-para-escolha"
      onClick={onVoltar}
      className={styles.voltarBtn}
    >
      ← {t("Escolher outra forma")}
    </button>
  );
}

interface SaidasProps {
  status: Status;
  sessionName: string;
}

/**
 * As duas saídas do passo, iguais nos três ramos.
 */
export function Saidas({ status, sessionName }: SaidasProps) {
  const t = useT();
  const [pending, startTransition] = useTransition();

  return (
    <div className={styles.saidasContainer}>
      <Button
        type="button"
        variant="outline"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            try {
              await skipWhatsapp();
            } catch (err) {
              if (isRedirectError(err)) throw err;
              toast.error(`${t("Falha ao pular:")} ${String(err)}`);
            }
          })
        }
      >
        {t("Pular por enquanto")}
      </Button>
      <Button
        type="button"
        disabled={pending || status === "WORKING"}
        onClick={() =>
          startTransition(async () => {
            try {
              await markWhatsappConfigured(
                sessionName,
                status === "WORKING" ? "WORKING" : "configured",
              );
            } catch (err) {
              if (isRedirectError(err)) throw err;
              toast.error(`${t("Falha ao marcar passo:")} ${String(err)}`);
            }
          })
        }
      >
        {t("Conectei em outro lugar")}
      </Button>
    </div>
  );
}
