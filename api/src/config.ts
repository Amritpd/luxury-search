export const GEMINI_EMBEDDING_MODEL = "gemini-embedding-001";
export const GEMINI_EMBEDDING_DIMENSION = 3072;
// Env-overridable: Google retires chat models regularly, and the next
// 404 on a model name should be a config change, not a code change.
export const GEMINI_CHAT_MODEL =
  process.env.GEMINI_CHAT_MODEL ?? "gemini-3.8-flash";
