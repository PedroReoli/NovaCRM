import { LogotipoDoProduto } from "@/components/branding/MarcaDoProduto";
import { marcaEhADoProduto } from "@/lib/branding";
import { marcaDaSaida } from "@/lib/branding/saida";
import { createClient } from "@/lib/supabase/server";
import { IdiomaProvider } from "@/lib/i18n/IdiomaProvider";
import styles from "./auth.module.css";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const marca = await marcaDaSaida(null);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const locale = (user?.user_metadata?.locale as string | undefined) ?? null;

  return (
    <IdiomaProvider locale={locale}>
      <div className={styles.authWrapper}>
        <div className={styles.authCard}>
          {marca.logoUrl ? (
            <div className={styles.logoArea}>
              <div className="rounded-md dark:bg-white dark:px-3 dark:py-2 dark:shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  data-testid="logo-da-fachada"
                  src={marca.logoUrl}
                  alt={marca.nome}
                  className="h-10 w-auto max-w-[12rem] object-contain"
                />
              </div>
            </div>
          ) : marcaEhADoProduto({ name: marca.nome, logoUrl: null }) ? (
            <div className={styles.logoArea}>
              <LogotipoDoProduto nome={marca.nome} className="h-12 w-auto" />
            </div>
          ) : null}
          {children}
        </div>
      </div>
    </IdiomaProvider>
  );
}
