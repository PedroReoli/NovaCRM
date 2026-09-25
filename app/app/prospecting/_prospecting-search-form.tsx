import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useT } from "@/hooks/i18n/useT";
import { randomId } from "@/lib/random-id";

interface ProspectingSearchFormProps {
  configured?: boolean;
  busy: boolean;
  settings: boolean;
  setSettings: (s: boolean | ((prev: boolean) => boolean)) => void;
  onPerform: (body: unknown, message: string) => Promise<boolean>;
  onSearchSuccess: () => void;
}

export function ProspectingSearchForm({
  configured,
  busy,
  settings,
  setSettings,
  onPerform,
  onSearchSuccess,
}: ProspectingSearchFormProps) {
  const t = useT();
  const searchAttempt = useRef<{ fingerprint: string; id: string } | null>(null);

  const [key, setKey] = useState("");
  const [niche, setNiche] = useState("");
  const [location, setLocation] = useState("");
  const [limit, setLimit] = useState(20);
  const [budget, setBudget] = useState(1);
  const [enrich, setEnrich] = useState(true);

  return (
    <>
      {(settings || configured === false) && (
        <Card className="p-5">
          <form
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
            onSubmit={async (e) => {
              e.preventDefault();
              if (
                await onPerform({ action: "configure", api_key: key }, t("Chave de busca salva."))
              ) {
                setKey("");
                setSettings(false);
              }
            }}
          >
            <div className="flex-1">
              <Label htmlFor="prospecting-key">{t("Chave da Apify")}</Label>
              <Input
                id="prospecting-key"
                type="password"
                autoComplete="off"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                required
                minLength={10}
                className="mt-2"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                {t("A chave fica cifrada no servidor. Cada busca tem seu próprio limite de gasto.")}
              </p>
            </div>
            <Button disabled={busy || !key} type="submit">
              {t("Salvar chave")}
            </Button>
          </form>
        </Card>
      )}

      <Card className="p-5">
        <h2 className="text-lg font-semibold">{t("1. Encontrar empresas")}</h2>
        <form
          className="mt-4 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const fingerprint = JSON.stringify([niche, location, limit, budget, enrich]);
            if (searchAttempt.current?.fingerprint !== fingerprint) {
              searchAttempt.current = { fingerprint, id: randomId() };
            }
            const success = await onPerform(
              {
                action: "search",
                request_id: searchAttempt.current.id,
                search: {
                  name: `${niche} · ${location}`.slice(0, 120),
                  niche,
                  location,
                  limit,
                  budget_usd: budget,
                  enrich,
                },
              },
              t("Solicitação registrada. Acompanhe o estado da busca nesta tela."),
            );
            if (success) {
              searchAttempt.current = null;
              onSearchSuccess();
            }
          }}
        >
          <div>
            <Label htmlFor="prospecting-niche">{t("Público ou segmento")}</Label>
            <Input
              id="prospecting-niche"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder={t("Ex.: clínicas de estética")}
              minLength={2}
              maxLength={120}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="prospecting-location">{t("Cidade ou região")}</Label>
            <Input
              id="prospecting-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={t("Ex.: São Paulo, SP")}
              minLength={2}
              maxLength={160}
              required
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="prospecting-limit">{t("Até quantas empresas")}</Label>
              <Input
                id="prospecting-limit"
                type="number"
                min={1}
                max={100}
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="prospecting-budget">{t("Teto da busca (US$)")}</Label>
              <Input
                id="prospecting-budget"
                type="number"
                min={0.5}
                max={10}
                step={0.5}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                required
                className="mt-1"
              />
            </div>
          </div>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={enrich}
              onChange={(e) => setEnrich(e.target.checked)}
              className="mt-1"
            />
            {t("Enriquecer com e-mails comerciais e redes encontradas no site")}
          </label>
          <p className="text-xs text-muted-foreground">
            {t(
              "A pesquisa usa seu saldo da Apify. A quantidade encontrada pode ser menor que o limite. Nenhuma abordagem começa nesta etapa.",
            )}
          </p>
          <Button className="w-full" type="submit" disabled={busy || !configured}>
            {busy ? t("Aguarde…") : t("Buscar empresas")}
          </Button>
        </form>
      </Card>
    </>
  );
}
