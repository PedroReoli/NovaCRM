"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useT } from "@/hooks/i18n/useT";
import { useIdioma } from "@/lib/i18n/IdiomaProvider";
import { randomId } from "@/lib/random-id";
import { ehTrocaParaVersaoMenor } from "@/lib/extensions/versao";
import type { CatalogEntry, ExtensionConfiguration } from "@/lib/extensions/manifest";
import type {
  ExtensionListView,
  ExtensionOperationView,
  InstalledExtensionView,
} from "@/lib/extensions/view";
import { requestExtensionApi, type ExtensionApiResult } from "./api-client";
import {
  type CategoryFilter,
  matchesExtensionFilter,
} from "./ExtensionCatalog";
import {
  compatibleKinds,
  expectedOperation,
  operationMatchesOrganization,
  parseExtensionOperationView,
} from "./operation-receipt";
import {
  findPendingReceipt,
  isReceiptStorageKey,
  persistPendingReceipt,
  readPendingReceipts,
  removePendingReceipt,
  type PendingReceipt,
} from "./receipt-storage";
import { CATALOG_MAX_BYTES, EXPECTED_ORGANIZATION_HEADER } from "./helpers";

export interface UseExtensionsManagerOptions {
  organizationId: string;
  actorId: string;
  supportMode?: boolean;
}

export function useExtensionsManager({
  organizationId,
  actorId,
  supportMode = false,
}: UseExtensionsManagerOptions) {
  const t = useT();
  const locale = useIdioma();
  const router = useRouter();
  const [data, setData] = useState<ExtensionListView | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [snapshotFresh, setSnapshotFresh] = useState(false);
  const [storageStatus, setStorageStatus] = useState<"checking" | "ready" | "failed">("checking");
  const [pending, setPending] = useState<PendingReceipt[]>([]);
  const [uncertainReceiptId, setUncertainReceiptId] = useState<string | null>(null);
  const [configFeedback, setConfigFeedback] = useState<Record<string, string>>({});
  const revisoesVistas = useRef<Record<string, number>>({});
  const [emVoo, setEmVoo] = useState<string[]>([]);
  const ocupado = (alvo: string): boolean => emVoo.includes(alvo);

  const marcarEmVoo = useCallback((alvo: string): (() => void) => {
    setEmVoo((atual) => [...atual, alvo]);
    return () =>
      setEmVoo((atual) => {
        const indice = atual.indexOf(alvo);
        return indice < 0 ? atual : [...atual.slice(0, indice), ...atual.slice(indice + 1)];
      });
  }, []);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [catalogFile, setCatalogFile] = useState<File | null>(null);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const requestSequence = useRef(0);
  const activeRequest = useRef<AbortController | null>(null);

  const syncPendingFromStorage = useCallback((): boolean => {
    try {
      setPending(readPendingReceipts(window.localStorage, actorId, organizationId));
      setStorageStatus("ready");
      return true;
    } catch {
      setPending([]);
      setStorageStatus("failed");
      return false;
    }
  }, [actorId, organizationId]);

  const removeStoredReceipt = useCallback(
    (receiptId: string): boolean => {
      try {
        removePendingReceipt(window.localStorage, actorId, organizationId, receiptId);
        return syncPendingFromStorage();
      } catch {
        setStorageStatus("failed");
        return false;
      }
    },
    [actorId, organizationId, syncPendingFromStorage],
  );

  const esquecerMensagens = useCallback((installations: InstalledExtensionView[]) => {
    const anteriores = revisoesVistas.current;
    const agora = Object.fromEntries(
      installations.map((item) => [item.id, item.installation_revision] as const),
    );
    revisoesVistas.current = agora;
    setConfigFeedback((atual) => {
      const mantidas = Object.entries(atual).filter(([id]) => agora[id] === anteriores[id]);
      return mantidas.length === Object.keys(atual).length ? atual : Object.fromEntries(mantidas);
    });
  }, []);

  const invalidateContext = useCallback(
    (message: string) => {
      setConfigFeedback({});
      revisoesVistas.current = {};
      setData(null);
      setSnapshotFresh(false);
      setLoading(false);
      setLoadError(t(message));
      router.refresh();
    },
    [router, t],
  );

  const carregar = useCallback(
    async (quiet = false) => {
      const sequence = ++requestSequence.current;
      const requestedOrganization = organizationId;
      activeRequest.current?.abort();
      const controller = new AbortController();
      activeRequest.current = controller;
      setSnapshotFresh(false);
      if (!quiet) setLoading(true);

      const result = await requestExtensionApi<ExtensionListView>("/api/v1/extensions", {
        headers: { [EXPECTED_ORGANIZATION_HEADER]: requestedOrganization },
        signal: controller.signal,
      });
      if (sequence !== requestSequence.current || requestedOrganization !== organizationId) {
        return false;
      }

      if (!result.ok) {
        if (controller.signal.aborted) return false;
        if (result.error.code === "extension_context_changed") {
          invalidateContext(result.error.message);
          return false;
        }
        if (result.error.code !== "connection_failed" || !controller.signal.aborted) {
          setLoadError(t(result.error.message));
          setLoading(false);
        }
        return false;
      }
      if (result.data.organization_id !== requestedOrganization) {
        invalidateContext(
          "A organização ativa mudou em outra aba. Recarregue a página antes de continuar.",
        );
        return false;
      }
      const operations = result.data.operations.map(parseExtensionOperationView);
      if (
        operations.some(
          (operation) =>
            operation === null || !operationMatchesOrganization(operation, requestedOrganization),
        )
      ) {
        invalidateContext(
          "O servidor devolveu um recibo sem o contexto esperado. Recarregue a página antes de continuar.",
        );
        return false;
      }
      const validatedOperations = operations.filter(
        (operation): operation is ExtensionOperationView => operation !== null,
      );
      const validatedData = { ...result.data, operations: validatedOperations };

      esquecerMensagens(validatedData.installations);
      setData(validatedData);
      setLoadError(null);
      setLoading(false);
      setSnapshotFresh(true);

      const serverReceipts = new Set(validatedOperations.map((operation) => operation.id));
      if (serverReceipts.size > 0) {
        try {
          for (const receiptId of serverReceipts) {
            removePendingReceipt(window.localStorage, actorId, organizationId, receiptId);
          }
          syncPendingFromStorage();
        } catch {
          setStorageStatus("failed");
        }
      }
      return true;
    },
    [actorId, esquecerMensagens, invalidateContext, organizationId, syncPendingFromStorage, t],
  );

  useEffect(() => {
    const initialLoad = window.setTimeout(() => {
      syncPendingFromStorage();
      void carregar();
    }, 0);
    const syncOtherTab = (event: StorageEvent) => {
      if (event.key === null || isReceiptStorageKey(event.key, actorId, organizationId)) {
        syncPendingFromStorage();
        void carregar(true);
      }
    };
    window.addEventListener("storage", syncOtherTab);
    return () => {
      window.clearTimeout(initialLoad);
      window.removeEventListener("storage", syncOtherTab);
      activeRequest.current?.abort();
    };
  }, [actorId, carregar, organizationId, syncPendingFromStorage]);

  useEffect(() => {
    const refresh = () => void carregar(true);
    window.addEventListener("focus", refresh);
    window.addEventListener("online", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("online", refresh);
    };
  }, [carregar]);

  const hasPreparing = data?.operations.some((operation) => operation.status === "preparing");
  useEffect(() => {
    if (!hasPreparing) return;
    const interval = window.setInterval(() => void carregar(true), 3_000);
    return () => window.clearInterval(interval);
  }, [carregar, hasPreparing]);

  const runMutation = useCallback(
    async ({
      kind,
      label,
      targetKey,
      request,
    }: {
      kind: PendingReceipt["kind"];
      label: string;
      targetKey: string;
      request: (idempotencyKey: string) => Promise<ExtensionApiResult<unknown>>;
    }): Promise<ExtensionApiResult<ExtensionOperationView>> => {
      if (!snapshotFresh) {
        return {
          ok: false,
          status: 409,
          uncertain: false,
          error: {
            code: "extension_snapshot_stale",
            message: "Atualize o estado das extensões antes de enviar um novo pedido.",
          },
        };
      }
      if (storageStatus !== "ready") {
        return {
          ok: false,
          status: 0,
          uncertain: false,
          error: {
            code: "receipt_storage_unavailable",
            message:
              "Este navegador não conseguiu guardar o recibo. Libere o armazenamento deste site antes de enviar o pedido.",
          },
        };
      }

      let receipt: PendingReceipt;
      try {
        const current = findPendingReceipt(window.localStorage, actorId, organizationId, targetKey);
        receipt = current ?? {
          id: randomId(),
          kind,
          label,
          targetKey,
          createdAt: new Date().toISOString(),
        };
        persistPendingReceipt(window.localStorage, actorId, organizationId, receipt);
        syncPendingFromStorage();
      } catch {
        setStorageStatus("failed");
        return {
          ok: false,
          status: 0,
          uncertain: false,
          error: {
            code: "receipt_storage_unavailable",
            message:
              "Este navegador não conseguiu guardar o recibo. Libere o armazenamento deste site antes de enviar o pedido.",
          },
        };
      }

      const liberar = marcarEmVoo(targetKey);
      const result = await request(receipt.id);
      liberar();
      if (!result.ok && result.uncertain) {
        setUncertainReceiptId(receipt.id);
        return result;
      }

      if (!result.ok) {
        removeStoredReceipt(receipt.id);
        if (result.error.code === "extension_context_changed") {
          invalidateContext(result.error.message);
        }
        return result;
      }
      const confirmed = expectedOperation(result.data, {
        id: receipt.id,
        kinds: compatibleKinds(kind),
        organizationId,
      });
      if (!confirmed) {
        invalidateContext(
          "O servidor devolveu um recibo sem o contexto esperado. Recarregue a página antes de continuar.",
        );
        return {
          ok: false,
          status: 502,
          uncertain: true,
          error: {
            code: "extension_receipt_invalid",
            message:
              "O servidor devolveu um recibo sem o contexto esperado. Recarregue a página antes de continuar.",
          },
        };
      }
      if (confirmed.status !== "preparing") removeStoredReceipt(receipt.id);
      await carregar(true);
      return { ok: true, data: confirmed };
    },
    [
      actorId,
      carregar,
      invalidateContext,
      marcarEmVoo,
      organizationId,
      removeStoredReceipt,
      snapshotFresh,
      storageStatus,
      syncPendingFromStorage,
    ],
  );

  const selectCatalogFile = useCallback(
    (file: File | null) => {
      if (file && file.size > CATALOG_MAX_BYTES) {
        setCatalogFile(null);
        setCatalogError(t("O arquivo pode ter até 512 KiB. Escolha um arquivo menor."));
        return;
      }
      setCatalogFile(file);
      setCatalogError(null);
    },
    [t],
  );

  const admitCatalog = useCallback(async () => {
    if (!catalogFile) return;
    if (catalogFile.size > CATALOG_MAX_BYTES) {
      setCatalogError(t("O arquivo pode ter até 512 KiB. Escolha um arquivo menor."));
      return;
    }
    let bytes: ArrayBuffer;
    let digest: string;
    try {
      bytes = await catalogFile.arrayBuffer();
      const hash = await crypto.subtle.digest("SHA-256", bytes);
      digest = Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, "0")).join(
        "",
      );
    } catch {
      setCatalogError(
        t("Não foi possível ler este arquivo. Escolha o catálogo novamente e tente outra vez."),
      );
      return;
    }
    const result = await runMutation({
      kind: "catalog_admission",
      label: catalogFile.name,
      targetKey: `catalog:${digest}`,
      request: (idempotencyKey) =>
        requestExtensionApi("/api/v1/extensions/catalogs", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "Idempotency-Key": idempotencyKey,
          },
          body: bytes,
        }),
    });
    if (!result.ok) {
      if (!result.uncertain) toast.error(t(result.error.message));
      return;
    }
    setCatalogFile(null);
    setCatalogError(null);
    toast.success(t("Catálogo admitido e disponível para instalação."));
  }, [catalogFile, runMutation, t]);

  const staleInstallation = useCallback(
    async (error: { code: string; message: string }): Promise<boolean> => {
      if (error.code === "extension_version_changed") {
        toast.warning(
          t("A extensão mudou em outra sessão. Recarregamos o estado atual; revise antes de repetir."),
        );
      } else if (error.code === "extension_removed" || error.code === "extension_preparation_in_progress") {
        toast.warning(t(error.message));
      } else {
        return false;
      }
      await carregar(true);
      return true;
    },
    [carregar, t],
  );

  const install = useCallback(
    async (catalogId: string, entry: CatalogEntry, expectedInstallationRevision: number | null) => {
      const targetKey = `install:${catalogId}:${entry.publisher}:${entry.name}:${entry.version}:${expectedInstallationRevision ?? "none"}`;
      const reinstall =
        expectedInstallationRevision !== null &&
        (data?.removed_installations ?? []).some(
          (item) =>
            item.catalog_id === catalogId &&
            item.publisher === entry.publisher &&
            item.name === entry.name,
        );
      const result = await runMutation({
        kind: expectedInstallationRevision === null || reinstall ? "install" : "update",
        label: `${entry.publisher}/${entry.name}@${entry.version}`,
        targetKey,
        request: (idempotencyKey) =>
          requestExtensionApi("/api/v1/extensions/install", {
            method: "POST",
            headers: {
              "content-type": "application/json",
              "Idempotency-Key": idempotencyKey,
            },
            body: JSON.stringify({
              catalog_id: catalogId,
              publisher: entry.publisher,
              name: entry.name,
              version: entry.version,
              expected_installation_revision: expectedInstallationRevision,
            }),
          }),
      });
      if (!result.ok) {
        if (!(await staleInstallation(result.error)) && !result.uncertain) {
          toast.error(t(result.error.message));
        }
        return;
      }
      if (result.data.status === "failed") {
        toast.error(
          result.data.error_message
            ? t(result.data.error_message)
            : t("A instalação falhou. Veja o motivo no recibo e tente de novo."),
        );
        return;
      }
      if (result.data.status === "cancelled") {
        toast.info(
          result.data.error_message
            ? t(result.data.error_message)
            : result.data.kind === "update"
              ? t("O pedido foi cancelado antes de concluir. A versão instalada continua a mesma.")
              : t("O pedido foi cancelado antes de concluir. Nada foi instalado."),
        );
        return;
      }
      if (result.data.status === "preparing") {
        toast.success(t("Preparação iniciada. O recibo continuará visível até a conclusão."));
      } else if (result.data.kind === "update") {
        toast.success(
          ehTrocaParaVersaoMenor(result.data)
            ? t("Versão trocada. As organizações que a usavam continuam com ela ativa.")
            : t("Extensão atualizada. As organizações que a usavam continuam com ela ativa."),
        );
      } else if (reinstall) {
        toast.success(t("Extensão reinstalada. Cada organização precisa ativá-la de novo."));
      } else {
        toast.success(t("Extensão instalada. Agora um administrador da organização pode ativá-la."));
      }
    },
    [data?.removed_installations, runMutation, staleInstallation, t],
  );

  const changeInstallation = useCallback(
    async (extension: InstalledExtensionView, action: "revert" | "remove") => {
      const kind = action === "revert" ? "revert" : "removal";
      const result = await runMutation({
        kind,
        label: `${extension.publisher}/${extension.name}@${extension.version}`,
        targetKey: `${kind}:${extension.id}:${extension.installation_revision}`,
        request: (idempotencyKey) =>
          requestExtensionApi(
            `/api/v1/extensions/${encodeURIComponent(extension.id)}/${action}`,
            {
              method: "POST",
              headers: {
                "content-type": "application/json",
                "Idempotency-Key": idempotencyKey,
              },
              body: JSON.stringify({
                expected_installation_revision: extension.installation_revision,
              }),
            },
          ),
      });
      if (!result.ok) {
        if (!(await staleInstallation(result.error)) && !result.uncertain) {
          toast.error(t(result.error.message));
        }
        return;
      }
      toast.success(
        action === "revert"
          ? t("Troca desfeita: a versão {versao} voltou a valer em todas as organizações.").replace(
              "{versao}",
              result.data.to_version ?? result.data.version ?? "",
            )
          : t("Extensão removida de todas as organizações."),
      );
    },
    [runMutation, staleInstallation, t],
  );

  const configure = useCallback(
    async (
      extension: InstalledExtensionView,
      enabled: boolean,
      configuration?: ExtensionConfiguration,
    ): Promise<{ ok: boolean; message: string }> => {
      const payload = {
        expected_revision: extension.revision,
        enabled,
        configuration,
      };
      const targetKey = `configure:${extension.id}:${JSON.stringify(payload)}`;
      const result = await runMutation({
        kind: "configure",
        label: `${extension.publisher}/${extension.name}`,
        targetKey,
        request: (idempotencyKey) =>
          requestExtensionApi(
            `/api/v1/extensions/${encodeURIComponent(extension.id)}/configuration`,
            {
              method: "PUT",
              headers: {
                "content-type": "application/json",
                "Idempotency-Key": idempotencyKey,
                [EXPECTED_ORGANIZATION_HEADER]: organizationId,
              },
              body: JSON.stringify(payload),
            },
          ),
      });
      if (!result.ok) {
        if (result.error.code === "extension_context_changed") {
          return { ok: false, message: t(result.error.message) };
        }
        if (result.error.code === "extension_removed") {
          toast.warning(t(result.error.message));
          await carregar(true);
          return { ok: false, message: "" };
        }
        if (result.status === 409 && result.error.code === "extension_revision_conflict") {
          await carregar(true);
          return {
            ok: false,
            message: t(
              "Outra pessoa alterou esta extensão. Recarregamos o valor atual; revise antes de salvar novamente.",
            ),
          };
        }
        return { ok: false, message: t(result.error.message) };
      }
      return { ok: true, message: t("Configuração salva.") };
    },
    [carregar, organizationId, runMutation, t],
  );

  const verifyOperation = useCallback(
    async (operation: ExtensionOperationView) => {
      const liberar = marcarEmVoo(`operation:${operation.id}`);
      let result = await requestExtensionApi<unknown>(
        `/api/v1/extensions/operations/${encodeURIComponent(operation.id)}`,
        { headers: { [EXPECTED_ORGANIZATION_HEADER]: organizationId } },
      );
      const readReceipt = result.ok
        ? expectedOperation(result.data, {
            id: operation.id,
            kinds: compatibleKinds(operation.kind),
            organizationId,
          })
        : null;
      if (result.ok && !readReceipt) {
        liberar();
        invalidateContext(
          "O servidor devolveu um recibo sem o contexto esperado. Recarregue a página antes de continuar.",
        );
        return;
      }
      if (
        readReceipt?.status === "preparing" &&
        (readReceipt.kind === "install" || readReceipt.kind === "update") &&
        readReceipt.catalog_id &&
        readReceipt.publisher &&
        readReceipt.name &&
        readReceipt.version
      ) {
        result = await requestExtensionApi<unknown>("/api/v1/extensions/install", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "Idempotency-Key": readReceipt.id,
          },
          body: JSON.stringify({
            catalog_id: readReceipt.catalog_id,
            publisher: readReceipt.publisher,
            name: readReceipt.name,
            version: readReceipt.version,
            expected_installation_revision: readReceipt.from_revision,
          }),
        });
      }
      liberar();
      if (!result.ok) {
        if (result.error.code === "extension_context_changed") {
          invalidateContext(result.error.message);
          return;
        }
        if (result.uncertain) {
          setLoadError(
            t(
              "Não foi possível confirmar o resultado da verificação. Consulte o recibo antes de repetir a ação.",
            ),
          );
          await carregar(true);
        } else {
          toast.error(t(result.error.message));
        }
        return;
      }
      if (
        !expectedOperation(result.data, {
          id: operation.id,
          kinds: compatibleKinds(operation.kind),
          organizationId,
        })
      ) {
        invalidateContext(
          "O servidor devolveu um recibo sem o contexto esperado. Recarregue a página antes de continuar.",
        );
        return;
      }
      await carregar(true);
    },
    [carregar, invalidateContext, marcarEmVoo, organizationId, t],
  );

  const verifyLocalReceipt = useCallback(
    async (receipt: PendingReceipt) => {
      const liberar = marcarEmVoo(`receipt:${receipt.id}`);
      const result = await requestExtensionApi<unknown>(
        `/api/v1/extensions/operations/${encodeURIComponent(receipt.id)}`,
        { headers: { [EXPECTED_ORGANIZATION_HEADER]: organizationId } },
      );
      liberar();
      if (!result.ok) {
        if (result.error.code === "extension_context_changed") {
          invalidateContext(result.error.message);
        } else if (result.status === 404 && result.error.code === "extension_operation_not_found") {
          removeStoredReceipt(receipt.id);
          toast.info(
            t("O servidor não encontrou esse recibo. Você pode enviar o pedido novamente."),
          );
        } else {
          toast.error(t(result.error.message));
        }
        return;
      }
      if (
        !expectedOperation(result.data, {
          id: receipt.id,
          kinds: compatibleKinds(receipt.kind),
          organizationId,
        })
      ) {
        invalidateContext(
          "O servidor devolveu um recibo sem o contexto esperado. Recarregue a página antes de continuar.",
        );
        return;
      }
      removeStoredReceipt(receipt.id);
      await carregar(true);
    },
    [carregar, invalidateContext, marcarEmVoo, organizationId, removeStoredReceipt, t],
  );

  const cancelOperation = useCallback(
    async (operation: ExtensionOperationView) => {
      const liberar = marcarEmVoo(`cancel:${operation.id}`);
      const result = await requestExtensionApi<unknown>(
        `/api/v1/extensions/operations/${encodeURIComponent(operation.id)}/cancel`,
        {
          method: "POST",
          headers: {
            "Idempotency-Key": randomId(),
            [EXPECTED_ORGANIZATION_HEADER]: organizationId,
          },
        },
      );
      liberar();
      if (!result.ok) {
        if (result.error.code === "extension_context_changed") {
          invalidateContext(result.error.message);
        } else if (result.uncertain) {
          setLoadError(
            t(
              "Não foi possível confirmar o cancelamento. Verifique o recibo antes de repetir a ação.",
            ),
          );
          await carregar(true);
        } else {
          toast.error(t(result.error.message));
        }
        return;
      }
      const confirmed = expectedOperation(result.data, {
        id: operation.id,
        kinds: compatibleKinds(operation.kind),
        organizationId,
      });
      if (!confirmed) {
        invalidateContext(
          "O servidor devolveu um recibo sem o contexto esperado. Recarregue a página antes de continuar.",
        );
        return;
      }
      if (confirmed.status === "cancelled") {
        toast.success(
          confirmed.kind !== "update"
            ? t("Preparação cancelada. Este pedido não instalará a extensão.")
            : ehTrocaParaVersaoMenor(confirmed)
              ? t("Troca de versão cancelada. A versão instalada continua a mesma.")
              : t("Atualização cancelada. A versão instalada continua a mesma."),
        );
      } else if (confirmed.status === "completed") {
        toast.info(
          confirmed.kind !== "update"
            ? t("A instalação já havia sido concluída; o recibo foi atualizado.")
            : ehTrocaParaVersaoMenor(confirmed)
              ? t("A troca de versão já havia sido concluída; o recibo foi atualizado.")
              : t("A atualização já havia sido concluída; o recibo foi atualizado."),
        );
      } else if (confirmed.status === "failed") {
        toast.info(t("A preparação já havia falhado; o recibo foi atualizado."));
      }
      await carregar(true);
    },
    [carregar, invalidateContext, marcarEmVoo, organizationId, t],
  );

  const preparando = (catalogId: string, publisher: string, name: string): boolean =>
    emVoo.some((alvo) => alvo.startsWith(`install:${catalogId}:${publisher}:${name}:`)) ||
    (data?.operations ?? []).some(
      (operation) =>
        operation.status === "preparing" &&
        operation.catalog_id === catalogId &&
        operation.publisher === publisher &&
        operation.name === name,
    );

  const installed = data?.installations ?? [];
  const catalogEntries = useMemo(
    () =>
      (data?.catalogs ?? []).flatMap((catalog) =>
        catalog.entries.map((entry) => ({ catalog, entry })),
      ),
    [data?.catalogs],
  );

  const filteredInstalled = installed.filter((extension) =>
    matchesExtensionFilter(
      extension.display,
      [extension.publisher, extension.name],
      query,
      category,
      locale,
    ),
  );

  const filteredCatalog = catalogEntries.filter(({ entry }) =>
    matchesExtensionFilter(entry.display, [entry.publisher, entry.name], query, category, locale),
  );

  const mutationBlockedReason =
    storageStatus === "failed"
      ? t(
          "Este navegador não conseguiu guardar o recibo. Libere o armazenamento deste site antes de enviar o pedido.",
        )
      : !snapshotFresh
        ? t("Atualize o estado das extensões antes de enviar um novo pedido.")
        : storageStatus === "checking"
          ? t("Aguarde enquanto os recibos deste navegador são conferidos.")
          : undefined;

  const mutationsReady = mutationBlockedReason === undefined;

  return {
    data,
    loadError,
    loading,
    snapshotFresh,
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
    supportMode,
  };
}
