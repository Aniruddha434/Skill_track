import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import type { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  isConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Detect if the current URL contains Supabase auth callback tokens
 * (from email verification redirect). These can appear in the hash or query string.
 * Returns true if tokens were found and handled.
 */
const handleEmailVerificationRedirect = async (): Promise<boolean> => {
  const hash = window.location.hash;
  const search = window.location.search;
  const fullFragment = hash + search;

  // Check if URL contains Supabase auth tokens (access_token or type=signup/recovery/magiclink)
  const hasAuthTokens =
    fullFragment.includes('access_token=') ||
    fullFragment.includes('type=signup') ||
    fullFragment.includes('type=recovery') ||
    fullFragment.includes('type=magiclink');

  if (!hasAuthTokens) return false;

  // Extract tokens from wherever they are (hash fragment or query params)
  // Supabase may put them in the hash: #access_token=...&refresh_token=...&type=signup
  // Or after redirect they may end up in query: ?access_token=...#/dashboard
  let tokenString = '';
  if (hash.includes('access_token=')) {
    // Tokens are in the hash — extract the part after # (strip any route prefix)
    tokenString = hash.substring(1); // remove leading #
  } else if (search.includes('access_token=')) {
    tokenString = search.substring(1); // remove leading ?
  }

  if (tokenString) {
    const params = new URLSearchParams(tokenString);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (accessToken && refreshToken) {
      // Exchange the tokens for a proper session
      await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    }
  }

  // Clean up the URL and navigate to dashboard
  // Use replaceState so the token URL doesn't stay in browser history
  const cleanUrl = window.location.origin + window.location.pathname + '#/dashboard';
  window.history.replaceState(null, '', cleanUrl);

  return true;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // Handle email verification redirect (tokens in URL)
    const init = async () => {
      const wasRedirect = await handleEmailVerificationRedirect();

      // Get session (will pick up the session we just set if it was a redirect)
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // If this was an email verification redirect, force a hash navigation to /dashboard
      if (wasRedirect && session) {
        window.location.hash = '#/dashboard';
      }
    };

    init().catch(() => setLoading(false));

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase is not configured. Please add SUPABASE_URL and SUPABASE_ANON_KEY to your .env.local file.' };
    }
    // Redirect to /#/dashboard after email verification
    // Use SITE_URL env var for production (Vercel), fallback to current origin for dev
    const siteBase = process.env.SITE_URL || `${window.location.origin}${window.location.pathname}`;
    const redirectTo = `${siteBase.replace(/\/$/, '')}/#/dashboard`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: redirectTo,
      },
    });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase is not configured. Please add SUPABASE_URL and SUPABASE_ANON_KEY to your .env.local file.' };
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut, isConfigured: isSupabaseConfigured }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
