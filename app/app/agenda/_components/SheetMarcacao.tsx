"use client";

import * as React from "react";
import { startOfDay } from "date-fns";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { VinculoDaMarcacao } from "@/components/agenda/VinculoDaMarcacao";
import { EnderecoDaMarcacao } from "@/components/agenda/EnderecoDaMarcacao";
import { PainelDeMarcacao } from "@/components/agenda/PainelDeMarcacao";
import { ancoraAoFecharPainel } from "@/lib/agenda/ancora-depois-de-marcar";
import { ancoraLocalDoDia } from "@/lib/agenda/semana-semente";
import { resolverResponsavelDoPainel } from "@/lib/agenda/responsavel-do-painel";
import { rotuloDoLocal } from "@/lib/agenda/locais";
import { useT } from "@/hooks/i18n/useT";
import { cn } from "@/lib/utils";
import type { Agendamento, HorarioLivre } from "@/components/agenda/tipos";
import type { VinculoDaMarcacao as VinculoDaMarcacaoTipo } from "@/lib/agenda/vinculo-da-marcacao";

export interface TipoAgendamentoItem {
  id: string;
  nome: string;
  duracaoMin: number;
  donoId: string | null;
  localKind: string | null;
  localDetalhes: string | null;
}

export interface SheetMarcacaoProps {
  marcando: boolean;
  setMarcando: (aberto: boolean) => void;
  remarcandoId: string | null;
  setRemarcandoId: (id: string | null) => void;
  horarioEscolhido: HorarioLivre | null;
  setHorarioEscolhido: (h: HorarioLivre | null) => void;
  emailConvidado: string;
  setEmailConvidado: (email: string) => void;
  enderecoEditado: string | null;
  setEnderecoEditado: (endereco: string | null) => void;
  observacao: string;
  setObservacao: (obs: string) => void;
  reiniciarVinculo: () => void;
  marcadoEm: string | null;
  setMarcadoEm: (instante: string | null) => void;
  setAncora: React.Dispatch<React.SetStateAction<Date>>;
  contactId: string;
  conversationId: string;
  escolherVinculo: (v: VinculoDaMarcacaoTipo) => void;
  tiposIniciais: TipoAgendamentoItem[];
  tipo: TipoAgendamentoItem | null;
  setTipoId: (id: string) => void;
  emailConvidadoInvalido: boolean;
  emailConvidadoLimpo: string;
  endereco: string;
  hojeNaOrganizacao: string;
  pessoas: any[];
  usuarioId: string;
  horarios?: any;
  horariosPorDia: Record<string, Array<{ instante: string; rotulo: string }>>;
  horariosFalharam: boolean;
  onMesVisivel: (mes: Date) => void;
  podeMarcar: boolean;
  agendamentos: Agendamento[];
  remarcar: {
    mutateAsync: (args: {
      id: string;
      revision?: number;
      starts_at: string;
      guest_email?: string;
    }) => Promise<any>;
  };
  marcar: {
    mutateAsync: (args: {
      event_type_id: string;
      contact_id?: string;
      conversation_id?: string;
      starts_at: string;
      guest_email?: string;
      location_details?: string;
      description?: string;
    }) => Promise<any>;
  };
}

export function SheetMarcacao({
  marcando,
  setMarcando,
  remarcandoId,
  setRemarcandoId,
  horarioEscolhido,
  setHorarioEscolhido,
  emailConvidado,
  setEmailConvidado,
  enderecoEditado,
  setEnderecoEditado,
  observacao,
  setObservacao,
  reiniciarVinculo,
  marcadoEm,
  setMarcadoEm,
  setAncora,
  contactId,
  conversationId,
  escolherVinculo,
  tiposIniciais,
  tipo,
  setTipoId,
  emailConvidadoInvalido,
  emailConvidadoLimpo,
  endereco,
  hojeNaOrganizacao,
  pessoas,
  usuarioId,
  horarios,
  horariosPorDia,
  horariosFalharam,
  onMesVisivel,
  podeMarcar,
  agendamentos,
  remarcar,
  marcar,
}: SheetMarcacaoProps) {
  const t = useT();

  return (
    <Sheet
      open={marcando}
      onOpenChange={(aberto) => {
        setMarcando(aberto);
        if (!aberto) {
          setRemarcandoId(null);
          setHorarioEscolhido(null);
          setEmailConvidado("");
          setEnderecoEditado(null);
          setObservacao("");
          reiniciarVinculo();
          const destino = ancoraAoFecharPainel(marcadoEm, startOfDay);
          if (destino) setAncora(destino);
          setMarcadoEm(null);
        }
      }}
    >
      <SheetContent
        side="right"
        className="flex w-full flex-col overflow-x-hidden overflow-y-auto sm:max-w-3xl lg:max-w-[1040px] lg:px-3"
      >
        <SheetHeader>
          <SheetTitle>
            {remarcandoId ? t("Remarcar agendamento") : t("Novo agendamento")}
          </SheetTitle>
        </SheetHeader>
        <div className="grid shrink-0 gap-3 rounded-lg border p-3 lg:grid-cols-2">
          {!remarcandoId ? (
            <div className="lg:col-span-2">
              <VinculoDaMarcacao
                contactId={contactId}
                conversationId={conversationId}
                onChange={(contact, conversation) => escolherVinculo({ contact, conversation })}
              />
            </div>
          ) : null}
          {tiposIniciais.length > 1 && (
            <div className="lg:col-span-2" data-testid="tipos-de-agendamento">
              <p className="mb-2 text-sm font-medium">{t("Tipo de agendamento")}</p>
              <div className="flex flex-wrap gap-1.5">
                {tiposIniciais.map((opcao) => (
                  <button
                    key={opcao.id}
                    type="button"
                    data-testid={`tipo-${opcao.id}`}
                    aria-pressed={opcao.id === tipo?.id}
                    onClick={() => {
                      setTipoId(opcao.id);
                      setEnderecoEditado(null);
                    }}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs transition-colors duration-fast",
                      opcao.id === tipo?.id
                        ? "border-transparent bg-accent text-accent-foreground"
                        : "border-border text-text-muted hover:border-border-strong hover:text-text",
                    )}
                  >
                    {opcao.nome}
                    <span className="ml-1 tabular-nums opacity-70">{opcao.duracaoMin}min</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium" htmlFor="email-do-convidado">
              {t("E-mail do convidado")}{" "}
              <span className="font-normal opacity-70">({t("opcional")})</span>
            </label>
            <input
              id="email-do-convidado"
              data-testid="email-do-convidado"
              type="email"
              inputMode="email"
              autoComplete="off"
              value={emailConvidado}
              onChange={(e) => setEmailConvidado(e.target.value)}
              className={cn(
                "mt-1 w-full rounded-md border bg-surface p-2 outline-hidden",
                emailConvidadoInvalido
                  ? "border-danger focus:border-danger"
                  : "border-border focus:border-border-strong",
              )}
              placeholder={t("cliente@empresa.com")}
              aria-invalid={emailConvidadoInvalido || undefined}
              aria-describedby="ajuda-do-convidado"
            />
            <p id="ajuda-do-convidado" className="mt-1 text-xs text-text-muted">
              {emailConvidadoInvalido
                ? t("Endereço inválido — confira antes de marcar.")
                : t(
                    "O cliente com e-mail na ficha já recebe o convite. Preencha só se quiser chamar mais alguém.",
                  )}
            </p>
          </div>
          {!remarcandoId ? (
            <>
              <EnderecoDaMarcacao value={endereco} onChange={setEnderecoEditado} />
              <div>
                <label className="block text-sm font-medium" htmlFor="observacao-do-compromisso">
                  {t("Observação")}{" "}
                  <span className="font-normal opacity-70">({t("opcional")})</span>
                </label>
                <textarea
                  id="observacao-do-compromisso"
                  data-testid="observacao-do-compromisso"
                  rows={1}
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  className="mt-1 w-full resize-none rounded-md border bg-surface p-2 outline-hidden"
                  placeholder={t("O que a equipe precisa lembrar neste horário")}
                  aria-describedby="ajuda-da-observacao"
                />
                <p id="ajuda-da-observacao" className="mt-1 text-xs text-text-muted">
                  {t("Aparece na descrição do compromisso.")}
                </p>
              </div>
            </>
          ) : null}
        </div>
        {tipo && (
          <div className="mt-4 shrink-0">
            <PainelDeMarcacao
              ancora={ancoraLocalDoDia(hojeNaOrganizacao)}
              agora={new Date()}
              responsavel={resolverResponsavelDoPainel({ pessoas, donoId: tipo.donoId, usuarioId })}
              tipo={tipo.nome}
              duracaoMin={tipo.duracaoMin}
              local={rotuloDoLocal(tipo.localKind, endereco.trim() || tipo.localDetalhes)}
              fuso={horarios?.fuso_da_regra}
              horariosPorDia={horariosPorDia}
              publicouHorarios={horarios?.publicou_horarios ?? true}
              erroAoCarregar={horariosFalharam}
              fusoSuposto={horarios?.fuso_suposto ?? false}
              fontesDefasadas={horarios?.fontes_defasadas}
              googleCoberturaParcial={horarios?.google_cobertura_parcial}
              onMesVisivel={onMesVisivel}
              horarioInicial={horarioEscolhido ?? undefined}
              permiteEncaixe={podeMarcar}
              onConfirmar={(instante) => {
                if (emailConvidadoInvalido) {
                  return Promise.reject(new Error(t("e-mail do convidado inválido")));
                }
                const convidado = emailConvidadoLimpo || undefined;
                if (remarcandoId) {
                  return remarcar
                    .mutateAsync({
                      id: remarcandoId,
                      revision: agendamentos.find((a) => a.id === remarcandoId)?.revision,
                      starts_at: instante,
                      guest_email: convidado,
                    })
                    .then((r) => {
                      setRemarcandoId(null);
                      setMarcando(false);
                      setEmailConvidado("");
                      setEnderecoEditado(null);
                      setObservacao("");
                      return r;
                    });
                }
                return marcar
                  .mutateAsync({
                    event_type_id: tipo.id,
                    contact_id: contactId || undefined,
                    conversation_id: conversationId || undefined,
                    starts_at: instante,
                    guest_email: convidado,
                    location_details: endereco.trim(),
                    description: observacao.trim() || undefined,
                  })
                  .then((r) => {
                    setEmailConvidado("");
                    setEnderecoEditado(null);
                    setObservacao("");
                    setMarcadoEm(instante);
                    return r;
                  });
              }}
              onVerNaAgenda={(instante) => {
                setAncora(startOfDay(new Date(instante)));
                setMarcando(false);
                setRemarcandoId(null);
              }}
            />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
