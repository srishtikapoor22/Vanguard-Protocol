import * as React from "react";
import AuditAccordion from "../../../../components/AuditAccordion";
import { AuditRecord } from "../../../../types/audit";

export default function AuditLogAccordion({
  audits,
  onRowClick,
}: {
  audits: (AuditRecord & { trust_baseline?: string })[];
  onRowClick?: (audit: AuditRecord) => void;
}) {
  return <AuditAccordion audits={audits} onRowClick={onRowClick} />;
}

