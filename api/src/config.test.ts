import test from "node:test";
import assert from "node:assert/strict";
import dotenv from "dotenv";

import { GEMINI_EMBEDDING_MODEL, GEMINI_EMBEDDING_DIMENSION } from "./config.js";

test("Gemini embedding model matches the supported API model", () => {
  assert.equal(GEMINI_EMBEDDING_MODEL, "gemini-embedding-001");
  assert.equal(GEMINI_EMBEDDING_DIMENSION, 3072);
});

test("dotenv overrides blank shell values with the .env file", () => {
  const previous = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "";

  dotenv.config({ override: true });

  try {
    assert.match(process.env.GEMINI_API_KEY ?? "", /^AQ\./);
  } finally {
    if (previous === undefined) {
      delete process.env.GEMINI_API_KEY;
    } else {
      process.env.GEMINI_API_KEY = previous;
    }
  }
});
