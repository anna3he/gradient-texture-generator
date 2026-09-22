import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { draftHex, normalizeHex } from "./color";

describe("hex input", () => {
  it("does not expand 3-digit hex while typing", () => {
    assert.equal(normalizeHex("#FF5", { short: false }), null);
    assert.equal(normalizeHex("#FF5733", { short: false }), "#ff5733");
  });

  it("keeps a 6-digit draft from being padded by a leading hash", () => {
    let draft = "#f4a261";
    for (const char of "FF5733") {
      draft = draftHex(char);
    }
    // Simulates select-all then type without hash
    draft = "";
    for (const char of "FF5733") {
      draft = draftHex(draft + char);
    }
    assert.equal(draft, "#FF5733");
    assert.equal(normalizeHex(draft, { short: false }), "#ff5733");
  });

  it("expands short hex only when allowed", () => {
    assert.equal(normalizeHex("#f80"), "#ff8800");
  });
});
