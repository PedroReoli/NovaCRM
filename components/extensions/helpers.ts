import type { CatalogEntry } from "@/lib/extensions/manifest";
import type { ExtensionListView } from "@/lib/extensions/view";
import type { CatalogIdentityState } from "./ExtensionCatalog";
import type { PendingReceipt } from "./receipt-storage";

export const CATALOG_MAX_BYTES = 512 * 1024;
export const EXPECTED_ORGANIZATION_HEADER = "X-Expected-Organization-Id";

/** Onde uma entrada do catálogo está em relação ao que já foi instalado (ver `CatalogIdentityState`). */
export function catalogIdentity(
  data: ExtensionListView,
  catalogId: string,
  entry: CatalogEntry,
): CatalogIdentityState {
  const sameIdentity = (item: { publisher: string; name: string }) =>
    item.publisher === entry.publisher && item.name === entry.name;
  const active = data.installations.filter((item) => !item.removed_at && sameIdentity(item));
  const here = active.find((item) => item.catalog_id === catalogId);
  if (here) {
    return {
      kind: "installed",
      version: here.version,
      installationRevision: here.installation_revision,
      activeOrganizations: here.active_organizations,
    };
  }
  const removed = data.removed_installations.find(
    (item) => item.catalog_id === catalogId && sameIdentity(item),
  );
  if (removed) {
    return {
      kind: "removed",
      revision: removed.revision,
      removedAt: removed.removed_at,
      awaitingReactivation: removed.awaiting_reactivation,
    };
  }
  const elsewhere = active[0];
  return elsewhere
    ? { kind: "other_origin", origin: elsewhere.origin, version: elsewhere.version }
    : { kind: "absent" };
}

/** O tipo do pedido pendente: o rótulo sozinho é igual para atualizar, desfazer e remover. */
export function tituloDoPedido(kind: PendingReceipt["kind"], t: (texto: string) => string): string {
  switch (kind) {
    case "catalog_admission":
      return t("Admissão de catálogo");
    case "install":
      return t("Instalação");
    case "update":
      return t("Atualização ou troca de versão");
    case "revert":
      return t("Desfazer a última troca");
    case "removal":
      return t("Remoção da instalação");
    case "configure":
      return t("Configuração");
    case "module_install":
      return t("Instalação de módulo");
  }
}
