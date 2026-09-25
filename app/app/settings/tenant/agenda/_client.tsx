"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AgendasConectadas } from "@/components/agenda/AgendasConectadas";
import { PrazosDePresenca } from "@/components/agenda/PrazosDePresenca";
import { AgendaDosColegas } from "@/components/agenda/AgendaDosColegas";
import { ClientePelaAgenda } from "@/components/agenda/ClientePelaAgenda";
import { DiasBloqueados } from "@/components/agenda/DiasBloqueados";
import { showApiError } from "@/components/feedback/ApiErrorToast";
import { useT } from "@/hooks/i18n/useT";
import { apiClient } from "@/lib/api/client";
import { parseReaisToCents } from "@/lib/money";
import { empacotarLembretes, lerPassosDoFormulario } from "@/lib/agenda/lembretes";
import { type TipoRow, type Rascunho, VAZIO } from "./_components/types";
import { NovoTipoForm } from "./_components/NovoTipoForm";
import { TipoCard } from "./_components/TipoCard";

export type { TipoRow };

export function TiposDeAgendamentoClient({
  tiposIniciais,
  pessoas,
  podeEditar,
  usuarioAtualId,
  podeConfigurarGoogle,
  clientePelaAgendaLigado,
  podeLigarClientePelaAgenda,
  colegasPodemMexerNaAgendaLigado,
  podeMudarAgendaDosColegas,
}: {
  tiposIniciais: TipoRow[];
  pessoas: Array<{ id: string; papel: string; nome: string }>;
  podeEditar: boolean;
  usuarioAtualId: string;
  podeConfigurarGoogle: boolean;
  clientePelaAgendaLigado: boolean;
  podeLigarClientePelaAgenda: boolean;
  colegasPodemMexerNaAgendaLigado: boolean;
  podeMudarAgendaDosColegas: boolean;
}) {
  const t = useT();
  const router = useRouter();
  const [criando, setCriando] = React.useState(false);
  const [rascunho, setRascunho] = React.useState<Rascunho>(() => ({
    ...VAZIO,
    default_owner_user_id: usuarioAtualId,
  }));
  const [salvando, setSalvando] = React.useState(false);
  const [editandoId, setEditandoId] = React.useState<string | null>(null);

  async function comErro(acao: () => Promise<unknown>, mensagem: string) {
    setSalvando(true);
    try {
      await acao();
      toast.success(mensagem);
      router.refresh();
      return true;
    } catch (err) {
      showApiError(err);
      return false;
    } finally {
      setSalvando(false);
    }
  }

  const handleCriar = async (e: React.FormEvent) => {
    e.preventDefault();
    const feito = await comErro(
      () =>
        apiClient.post("/api/v1/agenda/tipos", {
          name: rascunho.name.trim(),
          category: rascunho.category,
          duration_minutes: Number(rascunho.duration_minutes),
          location_kind: rascunho.location_kind,
          ...(rascunho.default_owner_user_id
            ? { default_owner_user_id: rascunho.default_owner_user_id }
            : {}),
        }),
      t("Tipo de agendamento criado."),
    );
    if (feito) {
      setCriando(false);
      setRascunho(VAZIO);
    }
  };

  const handleSalvarEdicao = async (tipoId: string, dados: FormData) => {
    const tipo = tiposIniciais.find((item) => item.id === tipoId);
    if (!tipo) return false;

    const feito = await comErro(
      () =>
        apiClient.patch("/api/v1/agenda/tipos", {
          id: tipo.id,
          name: String(dados.get("name") ?? "").trim(),
          category: String(dados.get("category") ?? tipo.category),
          duration_minutes: Number(dados.get("duration_minutes") ?? tipo.duration_minutes),
          default_owner_user_id: String(dados.get("default_owner_user_id") ?? "") || null,
          default_price_cents: (() => {
            const bruto = String(dados.get("default_price_cents") ?? "").trim();
            if (bruto === "") return null;
            const cents = parseReaisToCents(bruto);
            return cents === null ? null : cents;
          })(),
          reminder_enabled: dados.get("reminder_enabled") === "on",
          ...(dados.get("reminder_enabled") === "on"
            ? (() => {
                const emp = empacotarLembretes(
                  lerPassosDoFormulario(String(dados.get("reminder_steps") ?? "")),
                );
                return {
                  reminder_minutes_before: emp.principal,
                  reminder_extra_offsets_minutes: emp.extras,
                  reminder_body: emp.corpoPrincipal,
                  reminder_bodies: emp.corposExtras,
                };
              })()
            : {}),
        }),
      "Tipo alterado.",
    );
    if (feito) setEditandoId(null);
    return feito;
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4" data-testid="tipos-de-agendamento-config">
      {podeConfigurarGoogle && <AgendasConectadas />}
      <PrazosDePresenca podeEditar={podeEditar} />
      <ClientePelaAgenda
        ligadoInicial={clientePelaAgendaLigado}
        podeLigar={podeLigarClientePelaAgenda}
      />
      <AgendaDosColegas
        ligadoInicial={colegasPodemMexerNaAgendaLigado}
        podeMudar={podeMudarAgendaDosColegas}
      />
      <DiasBloqueados podeEditar={podeEditar} />

      {podeEditar && (
        <div>
          <NovoTipoForm
            criando={criando}
            setCriando={setCriando}
            rascunho={rascunho}
            setRascunho={setRascunho}
            salvando={salvando}
            pessoas={pessoas}
            onCriar={handleCriar}
          />
        </div>
      )}

      <ul className="flex flex-col gap-2" data-testid="lista-de-tipos">
        {tiposIniciais.length === 0 && (
          <li
            data-testid="sem-tipos"
            className="rounded-lg border border-border bg-surface p-4 text-sm text-text-muted"
          >
            {t(
              "Nenhum tipo de agendamento ainda. Crie o primeiro para que a Agenda tenha o que oferecer.",
            )}
          </li>
        )}
        {tiposIniciais.map((tipo) => (
          <TipoCard
            key={tipo.id}
            tipo={tipo}
            podeEditar={podeEditar}
            isEditing={editandoId === tipo.id}
            onToggleEdit={() => setEditandoId(editandoId === tipo.id ? null : tipo.id)}
            salvando={salvando}
            pessoas={pessoas}
            onDesativar={(item) =>
              void comErro(
                () => apiClient.delete("/api/v1/agenda/tipos", { id: item.id }),
                "Tipo desativado.",
              )
            }
            onReativar={(item) =>
              void comErro(
                () => apiClient.post("/api/v1/agenda/tipos/reativar", { id: item.id }),
                "Tipo reativado.",
              )
            }
            onSalvarEdicao={handleSalvarEdicao}
          />
        ))}
      </ul>
    </div>
  );
}
