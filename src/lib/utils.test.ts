import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatCompactUsd, formatUsd, slugify } from "./utils.ts";

describe("formatUsd", () => {
  it("renders whole dollars", () => {
    assert.equal(formatUsd(145000), "$145,000");
  });
});

describe("formatCompactUsd", () => {
  it("uses k for thousands", () => {
    assert.equal(formatCompactUsd(145000), "$145k");
    assert.equal(formatCompactUsd(800), "$800");
  });
});

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    assert.equal(slugify("Solidity Engineer"), "solidity-engineer");
    assert.equal(slugify("  ZK / cryptography  "), "zk-cryptography");
  });
});
