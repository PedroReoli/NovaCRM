import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { normalizarIdioma } from "@/lib/i18n/idiomas";
import { traduzir } from "@/lib/i18n/dicionario";
import styles from "../error-page.module.css";

export default async function InternalErrorPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const idioma = normalizarIdioma(
    (user?.user_metadata?.locale as string | undefined) ?? null,
  );

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <div className={styles.codeBadge}>500 INTERNAL ERROR</div>
        <h1 className={styles.title}>{traduzir("500 — Erro interno", idioma)}</h1>
        <p className={styles.description}>
          {traduzir(
            "Algo quebrou do nosso lado. Já registramos o ocorrido; tente de novo em instantes.",
            idioma,
          )}
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
