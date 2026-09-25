import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { normalizarIdioma } from "@/lib/i18n/idiomas";
import { traduzir } from "@/lib/i18n/dicionario";
import styles from "../error-page.module.css";

export default async function ForbiddenPage() {
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
        <div className={styles.codeBadge}>403 FORBIDDEN</div>
        <h1 className={styles.title}>{traduzir("403 — Sem permissão", idioma)}</h1>
        <p className={styles.description}>
          {traduzir("Você não tem acesso a essa área.", idioma)}
        </p>
        <div className={styles.actions}>
          <Button asChild variant="outline">
            <Link href="/">{traduzir("Voltar", idioma)}</Link>
          </Button>
          <Button asChild>
            <Link href="/app/inbox">{traduzir("Voltar pra Inbox", idioma)}</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
