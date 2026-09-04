import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { safeHref, safeHttpsUrl } from "./sanitize.ts";

describe("safeHref", () => {
  it("keeps https and http URLs", () => {
    assert.equal(safeHref("https://example.com/jobs"), "https://example.com/jobs");
    assert.equal(safeHref("http://example.com"), "http://example.com/");
  });

  it("keeps same-origin paths", () => {
    assert.equal(safeHref("/roles/foo"), "/roles/foo");
    assert.equal(safeHref("/roles?chain=solana"), "/roles?chain=solana");
  });

  it("drops javascript, data, and protocol-relative URLs", () => {
    assert.equal(safeHref("javascript:alert(1)"), null);
    assert.equal(safeHref("JAVASCRIPT:alert(1)"), null);
    assert.equal(safeHref("data:text/html,hi"), null);
    assert.equal(safeHref("//evil.example/x"), null);
    assert.equal(safeHref("/foo:bar"), null);
  });

  it("drops empty and junk", () => {
    assert.equal(safeHref(""), null);
    assert.equal(safeHref("   "), null);
    assert.equal(safeHref("not a url"), null);
  });
});

describe("safeHttpsUrl", () => {
  it("requires https", () => {
    assert.equal(safeHttpsUrl("https://labs.example/apply"), "https://labs.example/apply");
    assert.equal(safeHttpsUrl("http://labs.example/apply"), null);
    assert.equal(safeHttpsUrl("/relative"), null);
  });
});
