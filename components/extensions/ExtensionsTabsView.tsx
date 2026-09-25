"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useT } from "@/hooks/i18n/useT";
import type { CatalogEntry, ExtensionConfiguration } from "@/lib/extensions/manifest";
import type { ExtensionListView, InstalledExtensionView } from "@/lib/extensions/view";
import {
  CatalogExtensionCard,
  ExtensionEmptyList,
  ExtensionFilterBar,
  type CategoryFilter,
} from "./ExtensionCatalog";
import { InstalledExtensionCard } from "./InstalledExtensionCard";
import { catalogIdentity } from "./helpers";

export interface ExtensionsTabsViewProps {
  data: ExtensionListView;
  query: string;
  category: CategoryFilter;
  setQuery: (q: string) => void;
  setCategory: (c: CategoryFilter) => void;
  filteredInstalled: InstalledExtensionView[];
  filteredCatalog: Array<{ catalog: any; entry: CatalogEntry }>;
  installed: InstalledExtensionView[];
  catalogEntries: Array<{ catalog: any; entry: CatalogEntry }>;
  mutationsReady: boolean;
  mutationBlockedReason?: string;
  supportMode?: boolean;
  emVoo: string[];
  ocupado: (alvo: string) => boolean;
  configFeedback: Record<string, string>;
  setConfigFeedback: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  configure: (
    extension: InstalledExtensionView,
    enabled: boolean,
    configuration?: ExtensionConfiguration,
  ) => Promise<{ message: string; view?: InstalledExtensionView }>;
  changeInstallation: (extension: InstalledExtensionView, action: "revert" | "remove") => Promise<void>;
  preparando: (catalogId: string, publisher: string, name: string) => boolean;
  install: (catalogId: string, entry: CatalogEntry, expectedRevision: number | null) => Promise<void>;
}

export function ExtensionsTabsView({
  data,
  query,
  category,
  setQuery,
  setCategory,
  filteredInstalled,
  filteredCatalog,
  installed,
  catalogEntries,
  mutationsReady,
  mutationBlockedReason,
  supportMode = false,
  emVoo,
  ocupado,
  configFeedback,
  setConfigFeedback,
  configure,
  changeInstallation,
  preparando,
  install,
}: ExtensionsTabsViewProps) {
  const t = useT();

  return (
    <Tabs defaultValue="installed" className="space-y-5">
      <TabsList aria-label={t("Seções de extensões")}>
        <TabsTrigger value="installed">{t("Instaladas")}</TabsTrigger>
        <TabsTrigger value="catalog">{t("Catálogo")}</TabsTrigger>
      </TabsList>

      <ExtensionFilterBar
        query={query}
        category={category}
        onQueryChange={setQuery}
        onCategoryChange={setCategory}
      />

      <TabsContent value="installed" className="space-y-3">
        {filteredInstalled.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {filteredInstalled.map((extension) => (
              <InstalledExtensionCard
                key={`${extension.id}:${extension.revision}:${extension.installation_revision}`}
                extension={extension}
                canManage={data.can_manage}
                actionsDisabled={!mutationsReady}
                manageBlockedReason={data.can_manage ? mutationBlockedReason : undefined}
                supportMode={supportMode}
                busy={emVoo.some((alvo) => alvo.startsWith(`configure:${extension.id}:`))}
                feedback={configFeedback[extension.id] ?? null}
                onConfigure={async (alvo, enabled, configuration) => {
                  setConfigFeedback(({ [alvo.id]: _, ...resto }) => resto);
                  const { message } = await configure(alvo, enabled, configuration);
                  setConfigFeedback((atual) => ({ ...atual, [alvo.id]: message }));
                }}
                canInstall={data.can_install}
                platformBusyAction={
                  ocupado(`revert:${extension.id}:${extension.installation_revision}`)
                    ? "revert"
                    : ocupado(`removal:${extension.id}:${extension.installation_revision}`)
                      ? "remove"
                      : null
                }
                preparationInProgress={preparando(
                  extension.catalog_id,
                  extension.publisher,
                  extension.name,
                )}
                platformBlockedReason={data.can_install ? mutationBlockedReason : undefined}
                onRevert={(alvo) => changeInstallation(alvo, "revert")}
                onRemove={(alvo) => changeInstallation(alvo, "remove")}
              />
            ))}
          </div>
        ) : installed.length === 0 ? (
          <ExtensionEmptyList
            title={t("Nenhuma extensão instalada")}
            description={t(
              "Quando a plataforma instalar um pacote revisado, ele aparecerá aqui para a organização decidir se ativa.",
            )}
          />
        ) : (
          <ExtensionEmptyList
            title={t("Nenhuma extensão corresponde à busca")}
            description={t("Limpe a busca ou escolha outra categoria.")}
          />
        )}
      </TabsContent>

      <TabsContent value="catalog" className="space-y-3">
        {filteredCatalog.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {filteredCatalog.map(({ catalog, entry }) => {
              const identity = catalogIdentity(data, catalog.id, entry);
              const expected =
                identity.kind === "installed"
                  ? identity.installationRevision
                  : identity.kind === "removed"
                    ? identity.revision
                    : null;
              const target = `install:${catalog.id}:${entry.publisher}:${entry.name}:${entry.version}:${expected ?? "none"}`;
              return (
                <CatalogExtensionCard
                  key={`${catalog.id}:${entry.publisher}:${entry.name}:${entry.version}:${identity.kind}:${expected ?? "none"}`}
                  entry={entry}
                  origin={catalog.origin}
                  canInstall={data.can_install}
                  actionsDisabled={!mutationsReady}
                  blockedReason={data.can_install ? mutationBlockedReason : undefined}
                  identity={identity}
                  busy={ocupado(target)}
                  preparationInProgress={
                    !emVoo.includes(target) && preparando(catalog.id, entry.publisher, entry.name)
                  }
                  onInstall={(expectedRevision) =>
                    void install(catalog.id, entry, expectedRevision)
                  }
                />
              );
            })}
          </div>
        ) : catalogEntries.length === 0 ? (
          <ExtensionEmptyList
            title={t("Nenhum catálogo revisado disponível")}
            description={
              data.can_install
                ? t("Adicione acima um arquivo obtido de uma fonte em que você já confia.")
                : t("Peça ao responsável pela instalação para admitir um catálogo revisado.")
            }
          />
        ) : (
          <ExtensionEmptyList
            title={t("Nenhuma extensão corresponde à busca")}
            description={t("Limpe a busca ou escolha outra categoria.")}
          />
        )}
      </TabsContent>
    </Tabs>
  );
}
