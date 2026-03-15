/// <reference types="vite/client" />

declare namespace NodeJS {
  interface ProcessEnv {
    GEMINI_API_KEY: string;
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
  }
}

declare var process: {
  env: {
    GEMINI_API_KEY: string;
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
    [key: string]: string;
  };
};
