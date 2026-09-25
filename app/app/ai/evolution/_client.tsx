"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EvolutionGaps } from "@/components/ai/EvolutionGaps";
import { EvolutionTimeline } from "@/components/ai/EvolutionTimeline";
import { useEvolution } from "@/hooks/ai/useEvolution";
import type { EvolutionPayload } from "@/lib/ai/evolution/aggregate";
import { useT } from "@/hooks/i18n/useT";

import { EvolutionEmpty } from "./_components/EvolutionEmpty";
import { EvolutionStatCard } from "./_components/EvolutionStatCard";
import { EvolutionChart } from "./_components/EvolutionChart";
import { EvolutionRanking } from "./_components/EvolutionRanking";
import styles from "./evolution.module.css";

const usd = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "USD" });

const DESCRICAO_RESULTADO =
  "O que aconteceu com os seus negócios neste período. Para saber se melhorou, mude as datas acima e compare com o mês anterior.";

const SIGNIFICA_GANHOS =
  "Clientes que o agente marcou como fechados. Negócio que a sua equipe fechou na mão, movendo o cartão no quadro, não entra aqui.";
const SIGNIFICA_PERDIDOS =
  "Clientes que o agente marcou como perdidos — contraponto necessário, porque ganhos sem perdidos ao lado enganam. Também não conta o que a sua equipe marcou na mão.";
const SIGNIFICA_MUDANCAS =
  "Quantas vezes o agente registrou que um cliente mudou de passo no atendimento — o sinal de que a conversa andou, e não só aconteceu. Inclui as mudanças para fechado e para perdido, então não leia como só progresso. Cartão movido à mão no quadro não entra aqui.";
const SIGNIFICA_AJUDA =
  "Conversas que o agente passou para um atendente humano, a cada 100 mensagens recebidas. Leia como estimativa: no geral o mesmo caso conta uma vez só, mesmo que o cliente peça ajuda várias vezes, mas em parte dos atendimentos ele pode contar mais de uma.";

export function taxaDeAjuda(rate: number, t: (texto: string) => string = (texto) => texto): string {
  if (rate <= 0) return "0";
  const porCem = rate * 100;
  if (porCem < 0.1) return t("menos de 0,1 a cada 100");
  return `${porCem.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} ${t("a cada 100")}`;
}

const DESCRICAO_RESULTADO_SEM_ATIVIDADE =
  "Não houve atendimento neste período, então os zeros abaixo querem dizer \"nada aconteceu\", e não \"foi mal\". Mude as datas acima para um período com movimento.";

export function descricaoResultado(
  outcome: EvolutionPayload["outcome"],
  t: (texto: string) => string = (texto) => texto,
): string {
  return t(outcome.messages_received > 0 ? DESCRICAO_RESULTADO : DESCRICAO_RESULTADO_SEM_ATIVIDADE);
}

function num(n: number): string {
  return n.toLocaleString("pt-BR");
}

function Bloco({
  titulo,
  descricao,
  children,
  testId,
}: {
  titulo: string;
  descricao: string;
  children: React.ReactNode;
  testId: string;
}) {
  return (
    <section className={styles.sectionBlock} data-testid={testId}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{titulo}</h2>
        <p className={styles.sectionDescription}>{descricao}</p>
      </div>
      {children}
    </section>
  );
}

function Carregando() {
  return (
    <div className="flex flex-col gap-4" data-testid="evolution-carregando">
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="mt-2 h-8 w-16" />
            <Skeleton className="mt-3 h-3 w-full" />
          </Card>
        ))}
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export function EvolutionClient({ defaultRange }: { defaultRange: { from: string; to: string } }) {
  const t = useT();
  const [from, setFrom] = React.useState(defaultRange.from);
  const [to, setTo] = React.useState(defaultRange.to);
  const q = useEvolution({ from, to });

  return (
    <div className={styles.container}>
      <div className={styles.filterCard}>
        <div className="flex-1">
          <p className="text-sm font-medium">{t("Período analisado")}</p>
          <p className="text-xs text-muted-foreground">
            {t(
              "Todos os números desta página são só deste intervalo. Mude as datas para comparar um mês com o outro.",
            )}
          </p>
        </div>
        <div className="flex gap-3">
          <div className="space-y-1">
            <Label htmlFor="evolution-de" className="text-xs text-muted-foreground">
              {t("De")}
            </Label>
            <Input
              id="evolution-de"
              type="date"
              value={from}
              max={to}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="evolution-ate" className="text-xs text-muted-foreground">
              {t("Até")}
            </Label>
            <Input
              id="evolution-ate"
              type="date"
              value={to}
              min={from}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
        </div>
      </div>

      {q.error ? (
        <Card className="p-6 text-sm" data-testid="evolution-erro">
          {t(
            "Não conseguimos carregar os números agora. Recarregue a página em alguns instantes — se continuar assim, avise quem cuida da sua instalação.",
          )}
        </Card>
      ) : !q.data ? (
        <Carregando />
      ) : (
        <Conteudo payload={q.data} />
      )}
    </div>
  );
}

function Conteudo({ payload }: { payload: NonNullable<ReturnType<typeof useEvolution>["data"]> }) {
  const t = useT();
  const { learned, activity, outcome, gaps } = payload;

  const soma = (s: Array<{ value: number }>) => s.reduce((a, p) => a + p.value, 0);
  const buscas = soma(activity.series.knowledge_searches);
  const decisoes = soma(activity.series.router_decisions);

  return (
    <>
      <Bloco
        testId="bloco-aprendeu"
        titulo={t("O que seu agente aprendeu")}
        descricao={t("Tudo o que entrou na cabeça dele neste período, e de onde veio.")}
      >
        <div className={styles.statsGrid3}>
          <EvolutionStatCard
            rotulo={t("Regras que você ensinou")}
            valor={num(learned.memory_entries)}
            significa={t(
              "Instruções publicadas na Memória da IA. Valem para toda conversa, de todos os agentes.",
            )}
          />
          <EvolutionStatCard
            rotulo={t("Melhorias que você aprovou")}
            valor={num(learned.proposals_applied)}
            significa={t(
              "Sugestões que o sistema tirou dos próprios atendimentos e que você revisou e aceitou.",
            )}
          />
          <EvolutionStatCard
            rotulo={t("Habilidades instaladas")}
            valor={num(learned.skills_installed)}
            significa={t(
              "Skills que o agente passou a carregar quando a conversa pede — por exemplo, fechar um agendamento.",
            )}
          />
        </div>
        <Card className="p-4">
          <h3 className="text-sm font-medium">{t("Linha do tempo do aprendizado")}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("Cada linha é uma coisa nova que o agente passou a saber, na ordem em que aconteceu.")}
          </p>
          <div className="mt-3">
            {learned.timeline.length === 0 ? (
              <EvolutionEmpty
                texto={t(
                  "Seu agente ainda não aprendeu nada neste período. Ele aprende de três jeitos: você publica uma regra na Memória da IA, aprova uma sugestão de melhoria na aba Propostas do agente, ou instala uma habilidade em Skills da IA.",
                )}
                acoes={[
                  { href: "/app/ai/memory", label: t("Publicar uma regra") },
                  { href: "/app/ai/agents", label: t("Ver sugestões de melhoria") },
                  { href: "/app/ai/skills", label: t("Instalar uma habilidade") },
                ]}
              />
            ) : (
              <EvolutionTimeline items={learned.timeline} />
            )}
          </div>
        </Card>
      </Bloco>

      <Bloco
        testId="bloco-fez"
        titulo={t("O que ele fez")}
        descricao={t("O trabalho do dia a dia: quantas vezes ele usou cada recurso que você deu a ele.")}
      >
        <div className="grid gap-3 lg:grid-cols-3">
          <EvolutionChart
            titulo={t("Habilidades usadas")}
            significa={t(
              "Quantas vezes o agente puxou uma habilidade especializada para dar conta da conversa.",
            )}
            dados={activity.series.skill_activations}
            cor="oklch(0.55 0.22 260)"
            vazio={
              <EvolutionEmpty
                texto={t(
                  "Nenhuma habilidade foi usada. Ou o agente ainda não tem nenhuma instalada, ou as conversas do período não pediram nenhuma.",
                )}
                acoes={[{ href: "/app/ai/skills", label: t("Ver habilidades disponíveis") }]}
              />
            }
          />
          <EvolutionChart
            titulo={t("Conversas encaminhadas")}
            significa={t(
              "Quantas vezes o sistema leu o que o cliente queria e escolheu qual atendimento devia responder.",
            )}
            dados={activity.series.router_decisions}
            cor="oklch(0.70 0.15 200)"
            vazio={
              <EvolutionEmpty
                texto={t(
                  "Nenhuma conversa foi encaminhada. Isso só acontece em números que têm um roteador configurado — sem ele, tudo cai no atendimento padrão.",
                )}
                acoes={[{ href: "/app/ai/routers", label: t("Configurar um roteador") }]}
              />
            }
          />
          <EvolutionChart
            titulo={t("Consultas aos seus materiais")}
            significa={t(
              "Quantas vezes o agente foi procurar a resposta no que você escreveu, em vez de improvisar.",
            )}
            dados={activity.series.knowledge_searches}
            cor="oklch(0.65 0.20 150)"
            vazio={
              <EvolutionEmpty
                texto={t(
                  "O agente não consultou seus materiais. Ou não há nada publicado na base de conhecimento, ou as conversas não chegaram a precisar.",
                )}
                acoes={[{ href: "/app/ai/knowledge/sources", label: t("Publicar material") }]}
              />
            }
          />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <EvolutionRanking
            titulo={t("Habilidades mais usadas")}
            significa={t("Onde o agente mais precisou de conhecimento especializado.")}
            contagem={activity.by_skill}
            vazio={
              <EvolutionEmpty
                texto={t("Nenhuma habilidade foi usada neste período, então não há o que ranquear.")}
                acoes={[{ href: "/app/ai/skills", label: t("Ver habilidades disponíveis") }]}
              />
            }
          />
          <EvolutionRanking
            titulo={t("Assuntos mais procurados")}
            significa={t(
              "O que os clientes mais quiseram, segundo o que o roteador entendeu de cada conversa.",
            )}
            contagem={activity.by_intent}
            vazio={
              <EvolutionEmpty
                texto={t(
                  "Nenhuma conversa foi classificada por assunto. Os assuntos são os que você cadastra no roteador do seu número.",
                )}
                acoes={[{ href: "/app/ai/routers", label: t("Cadastrar assuntos") }]}
              />
            }
          />
        </div>
      </Bloco>

      <Bloco
        testId="bloco-resultado"
        titulo={t("O que mudou no resultado")}
        descricao={descricaoResultado(outcome, t)}
      >
        <div className={styles.statsGridOutcome}>
          <EvolutionStatCard
            rotulo={t("Negócios fechados pelo agente")}
            valor={num(outcome.won)}
            significa={t(SIGNIFICA_GANHOS)}
          />
          <EvolutionStatCard
            rotulo={t("Negócios perdidos pelo agente")}
            valor={num(outcome.lost)}
            significa={t(SIGNIFICA_PERDIDOS)}
          />
          <EvolutionStatCard
            rotulo={t("Mudanças de passo no atendimento")}
            valor={num(outcome.stage_transitions)}
            significa={t(SIGNIFICA_MUDANCAS)}
          />
          <EvolutionStatCard
            rotulo={t("Casos que precisaram de uma pessoa")}
            valor={taxaDeAjuda(outcome.handoff_rate, t)}
            significa={t(SIGNIFICA_AJUDA)}
          />
          <EvolutionStatCard
            rotulo={t("Custo da IA no período")}
            valor={usd.format(outcome.cost_cents / 100)}
            significa={t("O que você pagou aos provedores de IA para tudo isto acontecer.")}
          />
        </div>
      </Bloco>

      <Bloco
        testId="bloco-travando"
        titulo={t("O que está travando")}
        descricao={t(
          "Cada linha aqui é uma coisa que está limitando seu agente, e o que fazer a respeito — às vezes você mesmo, às vezes quem cuida da sua instalação.",
        )}
      >
        <EvolutionGaps gaps={gaps} buscas={buscas} decisoes={decisoes} />
      </Bloco>
    </>
  );
}
