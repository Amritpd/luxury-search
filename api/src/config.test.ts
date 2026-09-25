import test from "node:test";
import assert from "node:assert/strict";

import { GEMINI_EMBEDDING_MODEL, GEMINI_EMBEDDING_DIMENSION } from "./config.js";

test("Gemini embedding model matches the supported API model", () => {
  assert.equal(GEMINI_EMBEDDING_MODEL, "gemini-embedding-001");
  assert.equal(GEMINI_EMBEDDING_DIMENSION, 3072);
});
