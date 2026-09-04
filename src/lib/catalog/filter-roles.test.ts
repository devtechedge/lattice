import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { applyRoleFilters, matches, parseList, parseRoleSearch, searchRecord, toSearch } from "./filter-roles.ts";
import type { Company, Role } from "./types.ts";

const company: Company = {
  id: "c1",
  slug: "c1",
  name: "Helix Labs",
  website: "https://helix.example",
  twitter: "",
  github: "",
  discord: "",
  scenes: ["defi"],
  chains: ["ethereum"],
  size: "11-50",
  type: "protocol",
  hq: "Lisbon",
  remotePolicy: "remote-first",
  verified: true,
  foundedYear: 2022,
  about: "",
  benefits: ["remote-first"],
  hue: 140,
};

function role(partial: Partial<Role> = {}): Role {
  return {
    id: "r1",
    slug: "r1",
    companyId: "c1",
    title: "Solidity engineer",
    department: "engineering",
    seniority: "senior",
    type: "full-time",
    locationMode: "remote",
    locations: ["Lisbon"],
    remoteRegion: "eu",
    chains: ["ethereum", "base"],
    scenes: ["defi"],
    tags: ["solidity", "pay-in-crypto"],
    descriptionMarkdown: "Build vaults on Ethereum.",
    responsibilities: [],
    requirements: [],
    salaryMin: 120000,
    salaryMax: 180000,
    salaryCurrency: "USD",
    salaryPeriod: "year",
    benefits: ["remote-first", "visa-sponsorship"],
    featured: false,
    publishedAt: "2026-09-01T00:00:00Z",
    screeningQuestions: [],
    status: "open",
    source: "catalog",
    ...partial,
  };
}

describe("parseList", () => {
  it("splits comma strings and JSON arrays", () => {
    assert.deepEqual(parseList("solana,ethereum"), ["solana", "ethereum"]);
    assert.deepEqual(parseList('["solana","base"]'), ["solana", "base"]);
    assert.deepEqual(parseList(["solana", ""]), ["solana"]);
    assert.equal(parseList(""), undefined);
  });
});

describe("parseRoleSearch / toSearch", () => {
  it("round-trips URL search as strings, not arrays", () => {
    const f = parseRoleSearch({ chain: "solana", seniority: "senior", payInCrypto: "1", sort: "newest" });
    assert.deepEqual(f.chain, ["solana"]);
    assert.deepEqual(f.seniority, ["senior"]);
    assert.equal(f.payInCrypto, true);
    const rec = searchRecord({ chain: "solana", seniority: "senior", payInCrypto: "1" });
    assert.equal(rec.chain, "solana");
    assert.equal(rec.seniority, "senior");
    assert.equal(rec.payInCrypto, "1");
    assert.equal(rec.sort, undefined);
  });

  it("ignores unknown sort and empty lists", () => {
    const f = parseRoleSearch({ sort: "nope", view: "cards" });
    assert.equal(f.sort, "newest");
    assert.equal(f.view, "cards");
    assert.equal(toSearch({ sort: "newest" }).sort, undefined);
  });
});

describe("matches", () => {
  const r = role();

  it("filters chain, seniority, and pay-in-crypto", () => {
    assert.equal(matches(r, { chain: ["solana"] }, company), false);
    assert.equal(matches(r, { chain: ["ethereum"] }, company), true);
    assert.equal(matches(r, { seniority: ["junior"] }, company), false);
    assert.equal(matches(r, { seniority: ["senior"] }, company), true);
    assert.equal(matches(r, { payInCrypto: true }, company), true);
    assert.equal(matches(role({ tags: ["solidity"], benefits: ["remote-first"] }), { payInCrypto: true }, company), false);
  });

  it("filters salary, visa, featured, and query", () => {
    assert.equal(matches(r, { salaryMin: 200000 }, company), false);
    assert.equal(matches(r, { salaryMin: 100000 }, company), true);
    assert.equal(matches(r, { visa: true }, company), true);
    assert.equal(matches(role({ benefits: ["remote-first"] }), { visa: true }, company), false);
    assert.equal(matches(r, { featured: true }, company), false);
    assert.equal(matches(role({ featured: true }), { featured: true }, company), true);
    assert.equal(matches(r, { q: "vaults" }, company), true);
    assert.equal(matches(r, { q: "zk-prover" }, company), false);
  });
});

describe("applyRoleFilters", () => {
  it("sorts salary descending", () => {
    const a = role({ id: "a", salaryMax: 90_000 });
    const b = role({ id: "b", salaryMax: 200_000 });
    const out = applyRoleFilters([a, b], { sort: "salary-desc" });
    assert.deepEqual(out.map((r) => r.id), ["b", "a"]);
  });
});
