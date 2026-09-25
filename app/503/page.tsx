import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IDIOMA_PADRAO } from "@/lib/i18n/idiomas";
import { traduzir } from "@/lib/i18n/dicionario";
import styles from "../error-page.module.css";

const idioma = IDIOMA_PADRAO;

export default function ServiceUnavailablePage() {
  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <div className={styles.codeBadge}>503 MAINTENANCE</div>
        <h1 className={styles.title}>{traduzir("503 — Em manutenção", idioma)}</h1>
        <p className={styles.description}>
          {traduzir("Voltamos em alguns minutos.", idioma)}
        </p>
        <div className={styles.actions}>
          <Button asChild>
            <Link href="/">{traduzir("Voltar", idioma)}</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
