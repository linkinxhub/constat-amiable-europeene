declare namespace Cloudflare {
  interface Env {
    BILLING_TEST_ENABLED?: string;
    STRIPE_TEST_RESTRICTED_KEY?: string;
    STRIPE_TEST_WEBHOOK_SECRET?: string;
    AI_SETTINGS_ENCRYPTION_KEY?: string;
    SUPER_ADMIN_SETUP_HASH?: string;
    SUPER_ADMIN_SETUP_EXPIRES?: string;
    OPENAI_API_KEY?: string;
    OPENAI_SKETCH_MODEL?: string;
    DB?: D1Database;
    BUCKET?: R2Bucket;
  }
}
