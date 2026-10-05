import { describe, expect, it } from "vitest";
import {
  canApproveBatch,
  validateRejectionReason,
  isAllowedVerifierRole,
  isSewingQueueEligible,
} from "@/lib/verification-rules";

describe("ApparelFlow verification rules", () => {
  it("allows approval when all components are GREEN and fully counted", () => {
    const components = [
      { expectedQty: 100, actualQty: 100, status: "GREEN" as const },
      { expectedQty: 100, actualQty: 100, status: "GREEN" as const },
      { expectedQty: 200, actualQty: 200, status: "GREEN" as const },
    ];

    expect(canApproveBatch(components)).toBe(true);
  });

  it("blocks approval when a component is RED", () => {
    const components = [
      { expectedQty: 100, actualQty: 100, status: "GREEN" as const },
      { expectedQty: 100, actualQty: 0, status: "RED" as const },
    ];

    expect(canApproveBatch(components)).toBe(false);
  });

  it("blocks approval when there is a shortage", () => {
    const components = [
      { expectedQty: 100, actualQty: 100, status: "GREEN" as const },
      { expectedQty: 200, actualQty: 150, status: "YELLOW" as const },
    ];

    expect(canApproveBatch(components)).toBe(false);
  });

  it("requires a rejection reason", () => {
    expect(validateRejectionReason("Shortage found")).toBe(true);
    expect(validateRejectionReason("")).toBe(false);
    expect(validateRejectionReason("   ")).toBe(false);
    expect(validateRejectionReason(undefined)).toBe(false);
  });

  it("allows only the Cutting Verifier to approve", () => {
    expect(isAllowedVerifierRole("CUTTING_VERIFIER")).toBe(true);
    expect(isAllowedVerifierRole("CUTTING_SUPERVISOR")).toBe(false);
    expect(isAllowedVerifierRole("SEWING_SUPERVISOR")).toBe(false);
  });

  it("allows only VERIFIED batches into the Sewing Queue", () => {
    expect(isSewingQueueEligible("VERIFIED")).toBe(true);
    expect(isSewingQueueEligible("PENDING_VERIFICATION")).toBe(false);
    expect(isSewingQueueEligible("REJECTED")).toBe(false);
    expect(isSewingQueueEligible("CUTTING_IN_PROGRESS")).toBe(false);
  });

  it("blocks approval when there are no components", () => {
    expect(canApproveBatch([])).toBe(false);
  });
});