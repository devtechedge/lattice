import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { BOARDS, BOARD_BY_ID, COMPANY_IDS } from "./boards.ts";
import {
  applyUrlOf,
  departmentOf,
  htmlToMarkdown,
  mapAshbyJob,
  mapGreenhouseJob,
  mapLeverJob,
  parseLiveSlug,
  parseLocation,
  seniorityOf,
} from "./greenhouse.ts";

const coinbase = BOARD_BY_ID.get("coinbase")!;
const binance = BOARD_BY_ID.get("binance")!;
const phantom = BOARD_BY_ID.get("phantom")!;

describe("boards", () => {
  it("registers twenty unique alphanumeric company ids", () => {
    assert.equal(BOARDS.length, 20);
    assert.equal(new Set(COMPANY_IDS).size, 20);
    for (const id of COMPANY_IDS) assert.match(id, /^[a-z0-9]+$/);
  });
});

describe("parseLiveSlug", () => {
  it("picks the longest company id prefix", () => {
    assert.deepEqual(parseLiveSlug("cryptocom-15de5e6e-afa1-4bed-a2d0-1d4ed0df191b", COMPANY_IDS), {
      companyId: "cryptocom",
      jobId: "15de5e6e-afa1-4bed-a2d0-1d4ed0df191b",
    });
    assert.deepEqual(parseLiveSlug("ethereumfoundation-abcd", COMPANY_IDS), {
      companyId: "ethereumfoundation",
      jobId: "abcd",
    });
    assert.deepEqual(parseLiveSlug("coinbase-7684298", COMPANY_IDS), { companyId: "coinbase", jobId: "7684298" });
    assert.equal(parseLiveSlug("unknown-12345", COMPANY_IDS), undefined);
  });
});

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
    assert.equal(parseLocation("Remote - USA").locationMode, "remote");
    assert.equal(parseLocation("Remote - USA").remoteRegion, "us");
    assert.equal(parseLocation("Remote - UK").remoteRegion, "eu");
    assert.equal(parseLocation("Remote - India").remoteRegion, "apac");
    assert.equal(parseLocation("Remote - Brazil").remoteRegion, "latam");
    assert.equal(parseLocation("Hybrid - London, UK").locationMode, "hybrid");
    assert.deepEqual(parseLocation("Hybrid - London, UK").locations, ["London, UK"]);
    assert.equal(parseLocation("Hyderabad, India").locationMode, "on-site");
    assert.equal(parseLocation("Anywhere").locationMode, "remote");
  });
});

describe("applyUrlOf", () => {
  it("keeps first-party and ATS https apply links and drops others", () => {
    assert.equal(
      applyUrlOf("https://www.coinbase.com/careers/positions/8053751?gh_jid=8053751", coinbase.applyHosts)?.startsWith("https://www.coinbase.com/"),
      true,
    );
    assert.equal(applyUrlOf("https://jobs.lever.co/binance/abc")?.startsWith("https://jobs.lever.co/"), true);
    assert.equal(applyUrlOf("https://jobs.ashbyhq.com/phantom/abc")?.startsWith("https://jobs.ashbyhq.com/"), true);
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
});

describe("mapGreenhouseJob", () => {
  it("builds a Lattice role without inventing pay", () => {
    const role = mapGreenhouseJob(
      {
        id: 7684298,
        title: "Staff Software Engineer, Solana Staking Protocol",
        absolute_url: "https://www.coinbase.com/careers/positions/7684298?gh_jid=7684298",
        first_published: "2026-08-01T12:00:00-04:00",
        location: { name: "Remote - USA" },
        metadata: [{ name: "Careersite Department (for job postings)", value: "Engineering" }],
      },
      coinbase,
    );
    assert.equal(role.slug, "coinbase-7684298");
    assert.equal(role.companyId, "coinbase");
    assert.equal(role.source, "ats");
    assert.equal(role.department, "engineering");
    assert.equal(role.seniority, "staff");
    assert.equal(role.salaryMin, undefined);
    assert.equal(role.applyUrl?.includes("coinbase.com"), true);
    assert.equal(parseLiveSlug(role.slug, COMPANY_IDS)?.jobId, "7684298");
    assert.ok(role.tags.includes("solana"));
  });

  it("reads posted pay from metadata and infers from HTML", () => {
    const posted = mapGreenhouseJob(
      {
        id: 1,
        title: "Staff Engineer",
        absolute_url: "https://www.coinbase.com/careers/positions/1",
        location: { name: "Remote - USA" },
        metadata: [
          { name: "Pay Transparency Range", value: { min_value: 180000, max_value: 240000, unit: "USD" } },
        ],
      },
      coinbase,
    );
    assert.equal(posted.salarySource, "posted");
    assert.equal(posted.salaryMin, 180000);
    assert.equal(posted.salaryMax, 240000);

    const inferred = mapGreenhouseJob(
      {
        id: 2,
        title: "Staff Engineer",
        absolute_url: "https://www.coinbase.com/careers/positions/2",
        location: { name: "Remote - USA" },
        content: "<p>Estimated annual salary of $160,000 – $220,000.</p>",
      },
      coinbase,
    );
    assert.equal(inferred.salarySource, "inferred");
    assert.equal(inferred.salaryMin, 160000);
    assert.equal(inferred.salaryMax, 220000);
  });
});

describe("mapLeverJob", () => {
  it("maps a Binance posting without inventing pay", () => {
    const role = mapLeverJob(
      {
        id: "15de5e6e-afa1-4bed-a2d0-1d4ed0df191b",
        text: "Backend Engineer (Java) - KYC Tech",
        hostedUrl: "https://jobs.lever.co/binance/15de5e6e-afa1-4bed-a2d0-1d4ed0df191b",
        createdAt: Date.parse("2026-09-01T00:00:00Z"),
        categories: { location: "Asia", department: "Engineering", commitment: "Full-time: Remote" },
        workplaceType: "remote",
        description: "<p>Ship KYC systems.</p>",
      },
      binance,
    );
    assert.equal(role.companyId, "binance");
    assert.equal(role.source, "ats");
    assert.equal(role.salaryMin, undefined);
    assert.equal(role.department, "engineering");
    assert.equal(parseLiveSlug(role.slug, COMPANY_IDS)?.jobId, "15de5e6e-afa1-4bed-a2d0-1d4ed0df191b");
  });
});

describe("mapAshbyJob", () => {
  it("maps a Phantom posting without inventing pay", () => {
    const role = mapAshbyJob(
      {
        id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
        title: "Software Engineer, Wallet",
        jobUrl: "https://jobs.ashbyhq.com/phantom/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
        department: "Engineering",
        location: "Remote",
        isRemote: true,
        publishedAt: "2026-08-15T00:00:00.000Z",
        descriptionHtml: "<p>Ship the wallet.</p>",
        isListed: true,
      },
      phantom,
    );
    assert.ok(role);
    assert.equal(role.companyId, "phantom");
    assert.equal(role.source, "ats");
    assert.equal(role.salaryMin, undefined);
    assert.equal(role.department, "engineering");
    assert.equal(role.locationMode, "remote");
  });

  it("reads Ashby compensation as posted pay", () => {
    const role = mapAshbyJob(
      {
        id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
        title: "Software Engineer, Wallet",
        jobUrl: "https://jobs.ashbyhq.com/phantom/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
        department: "Engineering",
        location: "Remote",
        isRemote: true,
        isListed: true,
        compensation: {
          summaryComponents: [{ compensationType: "Salary", currencyCode: "USD", minValue: 170000, maxValue: 210000 }],
        },
      },
      phantom,
    );
    assert.ok(role);
    assert.equal(role.salarySource, "posted");
    assert.equal(role.salaryMin, 170000);
    assert.equal(role.salaryMax, 210000);
  });
});
