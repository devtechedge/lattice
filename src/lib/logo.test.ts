import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { companyInitials, companyLogoFallbackSrc, companyLogoSrc, hostFromUrl } from "./logo.ts";

describe("company logos", () => {
  it("builds a favicon URL from the company website", () => {
    const src = companyLogoSrc({ website: "https://www.binance.com" });
    assert.equal(
      src,
      "https://www.google.com/s2/favicons?domain=binance.com&sz=128",
    );
  });

  it("prefers an explicit https logo", () => {
    const src = companyLogoSrc({
      logoUrl: "https://binance.com/favicon.ico",
      website: "https://www.binance.com",
    });
    assert.equal(src, "https://binance.com/favicon.ico");
  });

  it("rejects private hosts and javascript", () => {
    assert.equal(hostFromUrl("http://binance.com"), null);
    assert.equal(companyLogoSrc({ website: "https://127.0.0.1" }), null);
    assert.equal(companyLogoSrc({ logoUrl: "javascript:alert(1)" }), null);
  });

  it("makes initials", () => {
    assert.equal(companyInitials("Uniswap Labs"), "UL");
    assert.equal(companyInitials("Binance"), "BI");
  });

  it("builds a duckduckgo fallback icon URL", () => {
    assert.equal(
      companyLogoFallbackSrc("https://www.coinbase.com"),
      "https://icons.duckduckgo.com/ip3/coinbase.com.ico",
    );
  });
});
