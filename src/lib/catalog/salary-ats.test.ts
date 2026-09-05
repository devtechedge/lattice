import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  dollarsToCents,
  formatPay,
  parseSalaryFromText,
  payFromMetaValue,
} from "./salary-ats.ts";

describe("dollarsToCents", () => {
  it("rejects hourly crumbs and accepts dollars / k shorthand", () => {
    assert.equal(dollarsToCents(34), null);
    assert.equal(dollarsToCents(180), null);
    assert.equal(dollarsToCents(250), 250_000 * 100);
    assert.equal(dollarsToCents(160000), 160_000 * 100);
    assert.equal(dollarsToCents(0), null);
  });
});

describe("payFromMetaValue", () => {
  it("reads Greenhouse-style min/max objects as posted", () => {
    const g = payFromMetaValue({ min_value: 160000, max_value: 220000, unit: "USD" });
    assert.equal(g.source, "posted");
    assert.equal(g.minCents, 160_000 * 100);
    assert.equal(g.maxCents, 220_000 * 100);
  });
});

describe("parseSalaryFromText", () => {
  it("infers a band next to pay wording and rejects market-cap noise", () => {
    const g = parseSalaryFromText("Estimated annual salary of $160,000 – $220,000 USD.");
    assert.equal(g.source, "inferred");
    assert.equal(g.minCents, 160_000 * 100);
    assert.equal(g.maxCents, 220_000 * 100);
    const noise = parseSalaryFromText("The protocol sits at a $124 trillion valuation with no salary listed.");
    assert.equal(noise.source, "none");
  });
});

describe("formatPay", () => {
  it("marks inferred, uses ISO for non-USD, and em dash when empty", () => {
    assert.equal(formatPay(160_000 * 100, 220_000 * 100, "USD", "posted"), "$160k–$220k");
    assert.equal(formatPay(160_000 * 100, 220_000 * 100, "USD", "inferred"), "~$160k–$220k");
    assert.equal(formatPay(2_480_000 * 100, 3_100_000 * 100, "COP", "posted"), "COP 2480k–3100k");
    assert.equal(formatPay(null, null), "—");
  });
});
