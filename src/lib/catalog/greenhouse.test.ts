import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  applyUrlOf,
  departmentOf,
  htmlToMarkdown,
  mapGreenhouseJob,
  parseCoinbaseSlug,
  parseLocation,
  seniorityOf,
} from "./greenhouse.ts";

describe("departmentOf", () => {
  it("maps Coinbase careersite departments", () => {
    assert.equal(departmentOf("Engineering"), "engineering");
    assert.equal(departmentOf("Finance & Accounting"), "finance");
    assert.equal(departmentOf("Legal & Compliance"), "legal");
    assert.equal(departmentOf("Design & User Research"), "design");
    assert.equal(departmentOf("Customer Experience"), "operations");
    assert.equal(departmentOf("Institutional Sales, Trading, and Prime Services"), "sales");
    assert.equal(departmentOf("Security & Privacy"), "engineering");
    assert.equal(departmentOf("IT"), "operations");
    assert.equal(departmentOf("Data Science"), "research");
  });
});

describe("seniorityOf", () => {
  it("reads seniority from the title, manager before associate", () => {
    assert.equal(seniorityOf("Staff Software Engineer, Solana Staking Protocol"), "staff");
    assert.equal(seniorityOf("Senior Software Engineer, Stablecoins"), "senior");
    assert.equal(seniorityOf("Associate Manager, Premium & Wealth"), "lead");
    assert.equal(seniorityOf("Director, Premium & Wealth"), "director");
    assert.equal(seniorityOf("Engineering Intern"), "intern");
  });
});

describe("parseLocation", () => {
  it("classifies remote, hybrid, and on-site Coinbase offices", () => {
    assert.deepEqual(parseLocation("Remote - USA").locationMode, "remote");
    assert.equal(parseLocation("Remote - USA").remoteRegion, "us");
    assert.equal(parseLocation("Remote - UK").remoteRegion, "eu");
    assert.equal(parseLocation("Remote - India").remoteRegion, "apac");
    assert.equal(parseLocation("Remote - Brazil").remoteRegion, "latam");
    assert.equal(parseLocation("Hybrid - London, UK").locationMode, "hybrid");
    assert.deepEqual(parseLocation("Hybrid - London, UK").locations, ["London, UK"]);
    assert.equal(parseLocation("Hyderabad, India").locationMode, "on-site");
  });
});

describe("applyUrlOf", () => {
  it("keeps Coinbase https apply links and drops others", () => {
    assert.equal(
      applyUrlOf("https://www.coinbase.com/careers/positions/8053751?gh_jid=8053751")?.startsWith("https://www.coinbase.com/"),
      true,
    );
    assert.equal(applyUrlOf("https://evil.example/jobs"), undefined);
    assert.equal(applyUrlOf("javascript:alert(1)"), undefined);
    assert.equal(applyUrlOf("https://boards-api.greenhouse.io/v1/boards/coinbase/jobs/1"), undefined);
  });
});

describe("htmlToMarkdown", () => {
  it("strips tags, keeps headings and https links", () => {
    const md = htmlToMarkdown(
      `<h2>What you will do</h2><p>Ship the <a href="https://www.coinbase.com">product</a>.</p><script>alert(1)</script>`,
    );
    assert.match(md, /## What you will do/);
    assert.match(md, /\[product\]\(https:\/\/www\.coinbase\.com\/?\)/);
    assert.doesNotMatch(md, /script|alert/);
  });

  it("decodes Greenhouse entity-encoded HTML", () => {
    const md = htmlToMarkdown('&lt;h2&gt;What you will do&lt;/h2&gt;&lt;p&gt;Ship the &lt;a href=&quot;https://www.coinbase.com&quot;&gt;product&lt;/a&gt;.&lt;/p&gt;&lt;script&gt;alert(1)&lt;/script&gt;');
    assert.match(md, /## What you will do/);
    assert.match(md, /\[product\]\(https:\/\/www\.coinbase\.com\/?\)/);
    assert.doesNotMatch(md, /script|alert/);
    assert.doesNotMatch(md, /&lt;|&gt;/);
  });
});

describe("mapGreenhouseJob", () => {
  it("builds a Lattice role without inventing pay", () => {
    const role = mapGreenhouseJob({
      id: 7684298,
      title: "Staff Software Engineer, Solana Staking Protocol",
      absolute_url: "https://www.coinbase.com/careers/positions/7684298?gh_jid=7684298",
      first_published: "2026-08-01T12:00:00-04:00",
      location: { name: "Remote - USA" },
      metadata: [{ name: "Careersite Department (for job postings)", value: "Engineering" }],
    });
    assert.equal(role.slug, "coinbase-7684298");
    assert.equal(role.companyId, "coinbase");
    assert.equal(role.source, "ats");
    assert.equal(role.department, "engineering");
    assert.equal(role.seniority, "staff");
    assert.equal(role.salaryMin, undefined);
    assert.equal(role.applyUrl?.includes("coinbase.com"), true);
    assert.equal(parseCoinbaseSlug(role.slug), "7684298");
    assert.ok(role.tags.includes("solana"));
  });
});
