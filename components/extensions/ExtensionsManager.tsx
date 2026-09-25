"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useT } from "@/hooks/i18n/useT";
import { ArrowsClockwise, PuzzlePiece, Warning } from "@/lib/ui/icons";
import { CatalogAdmission, ExtensionLoadingState } from "./ExtensionCatalog";
import { ExtensionOperations } from "./ExtensionOperations";
import { PendingReceiptsCard } from "./PendingReceiptsCard";
import { ExtensionsTabsView } from "./ExtensionsTabsView";
import { useExtensionsManager } from "./useExtensionsManager";

export function ExtensionsManager({
  organizationId,
  actorId,
  supportMode = false,
}: {
  organizationId: string;
  actorId: string;
  supportMode?: boolean;
}) {
  const t = useT();

  const {
    data,
    loadError,
    loading,
    storageStatus,
    pending,
    uncertainReceiptId,
    configFeedback,
    setConfigFeedback,
    emVoo,
    ocupado,
    query,
    setQuery,
    category,
    setCategory,
    catalogFile,
    catalogError,
    mutationsReady,
    mutationBlockedReason,
    carregar,
    selectCatalogFile,
    admitCatalog,
    install,
    changeInstallation,
    configure,
    verifyOperation,
    verifyLocalReceipt,
    cancelOperation,
    preparando,
    installed,
    catalogEntries,
    filteredInstalled,
    filteredCatalog,
  } = useExtensionsManager({ organizationId, actorId, supportMode });

  return (
    <main
      className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 sm:p-6"
      data-testid="extensions-manager"
    >
      <header className="relative overflow-hidden rounded-xl border border-border bg-surface p-5 shadow-xs sm:p-7">
        <div
          aria-hidden
          className="absolute -top-16 -right-12 h-40 w-40 rounded-full bg-accent-soft/70 blur-2xl"
        />
        <div className="relative flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-accent-200 bg-accent-soft text-accent">
            <PuzzlePiece size={24} weight="duotone" aria-hidden />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{t("Extensões")}</h1>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {t(
                "Adicione guias ao CRM sem entregar dados ou executar código de terceiros. Antes de abrir Tarefas, o acesso e a ativação são conferidos novamente.",
              )}
            </p>
          </div>
        </div>
      </header>

      {loadError ? (
        <Card
          className="border-warning/40 bg-warning-bg p-4"
          role="alert"
          data-testid={data ? "extensions-stale" : "extensions-unavailable"}
        >
          <div className="flex items-start gap-3">
            <Warning size={20} weight="duotone" aria-hidden className="mt-0.5 text-warning-fg" />
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-semibold">
                {data
                  ? t("O estado exibido está desatualizado")
                  : t("Não foi possível confirmar o estado atual")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{loadError}</p>
              <Button className="mt-3" variant="outline" size="sm" onClick={() => void carregar()}>
                <ArrowsClockwise aria-hidden />
                {t("Tentar novamente")}
              </Button>
            </div>
          </div>
        </Card>
      ) : null}

      {storageStatus === "failed" ? (
        <Card className="border-error/40 bg-error-bg p-4" role="alert">
          <h2 className="text-sm font-semibold text-error-fg">
            {t("Os pedidos estão bloqueados neste navegador")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{mutationBlockedReason}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {t(
              "Libere o armazenamento do site e recarregue a página para continuar com segurança.",
            )}
          </p>
        </Card>
      ) : null}

      <PendingReceiptsCard
        pending={pending}
        uncertainReceiptId={uncertainReceiptId}
        ocupado={ocupado}
        onVerify={verifyLocalReceipt}
      />

      {loading && !data && !loadError ? <ExtensionLoadingState /> : null}

      {data ? (
        <>
          {data.can_install ? (
            <CatalogAdmission
              file={catalogFile}
              onFile={selectCatalogFile}
              onSubmit={() => void admitCatalog()}
              busy={emVoo.some((alvo) => alvo.startsWith("catalog:"))}
              disabled={!mutationsReady}
              error={catalogError}
              blockedReason={mutationBlockedReason}
            />
          ) : null}

          <ExtensionsTabsView
            data={data}
            query={query}
            category={category}
            setQuery={setQuery}
            setCategory={setCategory}
            filteredInstalled={filteredInstalled}
            filteredCatalog={filteredCatalog}
            installed={installed}
            catalogEntries={catalogEntries}
            mutationsReady={mutationsReady}
            mutationBlockedReason={mutationBlockedReason}
            supportMode={supportMode}
            emVoo={emVoo}
            ocupado={ocupado}
            configFeedback={configFeedback}
            setConfigFeedback={setConfigFeedback}
            configure={configure}
            changeInstallation={changeInstallation}
            preparando={preparando}
            install={install}
          />

          {data.operations.length > 0 ? (
            <ExtensionOperations
              actorId={actorId}
              installBusy={(operation) =>
                Boolean(
                  operation.catalog_id &&
                    operation.publisher &&
                    operation.name &&
                    emVoo.some((alvo) =>
                      alvo.startsWith(
                        `install:${operation.catalog_id}:${operation.publisher}:${operation.name}:`,
                      ),
                    ),
                )
              }
              operations={data.operations}
              ocupado={ocupado}
              actionsDisabled={!mutationsReady}
              onVerify={verifyOperation}
              onCancel={cancelOperation}
            />
          ) : null}
        </>
      ) : null}
    </main>
  );
}
