import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useT } from "@/hooks/i18n/useT";
import { safePublicLink } from "@/lib/prospecting/schema";
import type { Candidate } from "./_types";
import { labels } from "./_types";

interface ProspectingCandidatesTableProps {
  candidates: Candidate[];
}

export function ProspectingCandidatesTable({ candidates }: ProspectingCandidatesTableProps) {
  const t = useT();

  if (candidates.length === 0) return null;

  return (
    <Card className="overflow-hidden">
      <div className="border-b p-5">
        <h2 className="text-lg font-semibold">{t("3. Acompanhar resultados")}</h2>
        <p className="text-sm text-muted-foreground">
          {t(
            "Encontrado é diferente de qualificado. A qualificação depende do que for confirmado na conversa.",
          )}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted/30 text-xs text-muted-foreground">
            <tr>
              <th className="p-4">{t("Empresa")}</th>
              <th className="p-4">{t("Informações")}</th>
              <th className="p-4">{t("Progresso")}</th>
              <th className="p-4">{t("Conversa")}</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((c) => (
              <tr key={c.id} className="border-b last:border-0">
                <td className="p-4 align-top">
                  <p className="font-medium">{c.data.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{c.data.category}</p>
                  <p className="mt-1 text-xs">{c.data.phone ?? t("Sem telefone")}</p>
                </td>
                <td className="max-w-64 p-4 align-top">
                  <p className="text-xs text-muted-foreground">{c.data.address}</p>
                  {safePublicLink(c.data.website) && (
                    <a
                      className="mt-1 block underline"
                      href={safePublicLink(c.data.website)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t("Site da empresa")}
                    </a>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {c.data.rating ?? "—"} ★ · {c.data.reviews ?? 0} {t("avaliações")}
                  </p>
                  {c.data.emails.map((email) => (
                    <p key={email} className="mt-1 text-xs break-all">
                      {email}
                    </p>
                  ))}
                </td>
                <td className="max-w-64 p-4 align-top">
                  <Badge variant="outline">{t(labels[c.progress] ?? c.progress)}</Badge>
                  {c.error && <p className="mt-2 text-xs text-muted-foreground">{c.error}</p>}
                  {c.message_status && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t("Mensagem:")} {c.message_status}
                    </p>
                  )}
                </td>
                <td className="p-4 align-top">
                  {c.conversation_id && (
                    <Link className="underline" href={`/app/inbox?id=${c.conversation_id}`}>
                      {t("Abrir no Inbox")}
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
