import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { companyInitials, hostFromUrl } from "./logo.ts";

describe("company logos", () => {
  it("makes initials", () => {
    assert.equal(companyInitials("Uniswap Labs"), "UL");
    assert.equal(companyInitials("Binance"), "BI");
    assert.equal(companyInitials("Ripple"), "RI");
  });

  it("parses public https hosts", () => {
    assert.equal(hostFromUrl("https://www.coinbase.com/careers"), "coinbase.com");
    assert.equal(hostFromUrl("http://coinbase.com"), null);
    assert.equal(hostFromUrl("https://127.0.0.1"), null);
  });
});
