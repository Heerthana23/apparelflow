export type ComponentStatus = "GREEN" | "YELLOW" | "RED";

export type VerificationComponent = {
  expectedQty: number;
  actualQty: number;
  status: ComponentStatus;
};

export function canApproveBatch(
  components: VerificationComponent[]
): boolean {
  if (components.length === 0) {
    return false;
  }

  return components.every(
    (component) =>
      component.status !== "RED" &&
      component.actualQty >= component.expectedQty
  );
}

export function validateRejectionReason(
  rejectionNote: string | undefined
): boolean {
  return Boolean(rejectionNote?.trim());
}

export function isAllowedVerifierRole(role: string): boolean {
  return role === "CUTTING_VERIFIER";
}

export function isSewingQueueEligible(status: string): boolean {
  return status === "VERIFIED";
}