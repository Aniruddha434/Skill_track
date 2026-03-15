/// <reference types="vite/client" />

declare namespace NodeJS {
  interface ProcessEnv {
    GEMINI_API_KEY: string;
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
    SITE_URL: string;
  }
}

declare var process: {
  env: {
    GEMINI_API_KEY: string;
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
    SITE_URL: string;
    [key: string]: string;
  };
};
