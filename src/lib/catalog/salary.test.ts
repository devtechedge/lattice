import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calcComp, estimateSalary } from "./salary.ts";

describe("calcComp", () => {
  it("applies cliff before vest in year one", () => {
    const r = calcComp({
      cash: 100_000,
      tokenAllocation: 40_000,
      impliedPrice: 1,
      vestingMonths: 24,
      cliffMonths: 6,
      equityPct: 0,
      companyMark: 0,
    });
    assert.equal(r.fullToken, 40_000);
    assert.equal(r.vestedMonthsYear1, 6);
    assert.equal(r.year1Token, 10_000);
    assert.equal(r.year1Total, 110_000);
  });

  it("pays no tokens in year one when cliff is 12 months or more", () => {
    const r = calcComp({
      cash: 90_000,
      tokenAllocation: 20_000,
      impliedPrice: 2,
      vestingMonths: 36,
      cliffMonths: 12,
      equityPct: 0.5,
      companyMark: 10_000_000,
    });
    assert.equal(r.vestedMonthsYear1, 0);
    assert.equal(r.year1Token, 0);
    assert.equal(r.year1Total, 90_000);
    assert.equal(r.fullToken, 40_000);
    assert.equal(r.equityValue, 50_000);
    assert.equal(r.fullyDiluted, 180_000);
  });
});

describe("estimateSalary", () => {
  it("returns a min-avg-max band", () => {
    const r = estimateSalary({ department: "engineering", seniority: "senior", remoteRegion: "eu" });
    assert.equal(typeof r.min, "number");
    assert.equal(typeof r.avg, "number");
    assert.equal(typeof r.max, "number");
    assert.ok(r.min < r.avg && r.avg < r.max);
  });
});
