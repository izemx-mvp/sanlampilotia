import { describe, expect, it } from "vitest";
import { TODAY, addDays, nextClaimId, payStatus } from "@/lib/data";

describe("payment status", () => {
  it("is Payé when fully paid", () => expect(payStatus({ amount: 8000, paid: 8000, due: addDays(TODAY, -3) })).toBe("Payé"));
  it("is Partiellement payé when 5000 of 8000 paid", () => expect(payStatus({ amount: 8000, paid: 5000, due: addDays(TODAY, -3) })).toBe("Partiellement payé"));
  it("is En retard when unpaid past due", () => expect(payStatus({ amount: 4200, paid: 0, due: addDays(TODAY, -5) })).toBe("En retard"));
  it("is Non payé when unpaid before due", () => expect(payStatus({ amount: 4200, paid: 0, due: addDays(TODAY, 4) })).toBe("Non payé"));
});

describe("claim number", () => {
  it("follows SIN-2026-00128 format", () => expect(nextClaimId([{ id: "SIN-2026-00127" }])).toBe("SIN-2026-00128"));
});
