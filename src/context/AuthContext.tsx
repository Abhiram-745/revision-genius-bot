import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface BanInfo {
  isBanned: boolean;
  reason: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  emailVerified: boolean;
  banInfo: BanInfo | null;
  signup: (email: string, password: string, fullName?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  sendVerificationCode: (email: string) => Promise<void>;
  verifyEmailCode: (email: string, code: string) => Promise<boolean>;
  checkBanStatus: (emailOrUserId: string, isUserId?: boolean) => Promise<BanInfo>;
  clearBanInfo: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [banInfo, setBanInfo] = useState<BanInfo | null>(null);

  const checkBanStatus = useCallback(async (emailOrUserId: string, isUserId: boolean = false): Promise<BanInfo> => {
    try {
      let query;
      if (isUserId) {
        query = supabase
          .from('banned_users')
          .select('reason')
          .eq('user_id', emailOrUserId)
          .maybeSingle();
      } else {
        query = supabase
          .from('banned_users')
          .select('reason')
          .eq('email', emailOrUserId.toLowerCase())
          .maybeSingle();
      }
      
      const { data: banRecord, error } = await query;
      
      if (error) {
        console.error('Error checking ban status:', error);
        return { isBanned: false, reason: null };
      }
      
      if (banRecord) {
        return { isBanned: true, reason: banRecord.reason };
      }
      
      return { isBanned: false, reason: null };
    } catch (err) {
      console.error('Error checking ban status:', err);
      return { isBanned: false, reason: null };
    }
  }, []);

  const clearBanInfo = useCallback(() => {
    setBanInfo(null);
  }, []);

  const checkEmailVerified = useCallback(async (email: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('check-email-verified', {
        body: { email }
      });
      
      if (error) {
        console.error('Error checking email verification:', error);
        return false;
      }
      
      const verified = data?.verified === true;
      setEmailVerified(verified);
      return verified;
    } catch (err) {
      console.error('Error checking email verification:', err);
      return false;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setSession(null);
        setUser(null);
        setLoading(false);
        return;
      }

      // Check if user is banned (by user_id first, then by email)
      let banStatus = await checkBanStatus(session.user.id, true);
      if (!banStatus.isBanned && session.user.email) {
        banStatus = await checkBanStatus(session.user.email);
      }
      
      if (banStatus.isBanned) {
        setBanInfo(banStatus);
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(session.user);
      setSession(session);
      await checkEmailVerified(session.user.email || '');
      setError(null);
    } catch (err) {
      setSession(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [checkEmailVerified, checkBanStatus]);

  // Grant premium for OAuth users (Google, etc.) who signed up during offer period
  const grantOAuthPremium = async (userId: string) => {
    const offerEndDate = new Date('2025-01-27T23:59:59Z');
    const now = new Date();
    
    if (now >= offerEndDate) return;
    
    // Check if user already has premium grant
    const { data: existingGrant } = await supabase
      .from('premium_grants')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (existingGrant) return; // Already has premium
    
    // Grant 1 year of free premium
    const premiumExpiry = new Date();
    premiumExpiry.setFullYear(premiumExpiry.getFullYear() + 1);
    
    await supabase.from('premium_grants').insert({
      user_id: userId,
      grant_type: 'early_signup_offer',
      starts_at: new Date().toISOString(),
      expires_at: premiumExpiry.toISOString()
    });
    
    console.log('Premium granted to OAuth user:', userId);
  };

  useEffect(() => {
    refreshUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Only synchronous state updates in callback to prevent deadlock
      if (session) {
        setUser(session.user);
        setSession(session);
        // Defer async Supabase calls with setTimeout to prevent deadlock
        setTimeout(async () => {
          // Check ban status for OAuth logins
          let banStatus = await checkBanStatus(session.user.id, true);
          if (!banStatus.isBanned && session.user.email) {
            banStatus = await checkBanStatus(session.user.email);
          }
          
          if (banStatus.isBanned) {
            setBanInfo(banStatus);
            await supabase.auth.signOut();
            setSession(null);
            setUser(null);
            return;
          }
          
          // Grant premium for OAuth signups (event === 'SIGNED_IN' for first-time OAuth)
          if (event === 'SIGNED_IN' && session.user.app_metadata?.provider !== 'email') {
            await grantOAuthPremium(session.user.id);
          }
          
          checkEmailVerified(session.user.email || '');
        }, 0);
      } else {
        setUser(null);
        setSession(null);
        setEmailVerified(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [refreshUser, checkEmailVerified, checkBanStatus]);

  const sendVerificationCode = async (email: string) => {
    const { data, error } = await supabase.functions.invoke('send-verification-code', {
      body: { email }
    });

    if (error) {
      throw new Error(error.message || 'Failed to send verification code');
    }
    
    if (data?.error) {
      throw new Error(data.error);
    }
  };

  const verifyEmailCode = async (email: string, code: string) => {
    const { data, error } = await supabase.functions.invoke('verify-code', {
      body: { email, code }
    });

    if (error) {
      throw new Error(error.message || 'Failed to verify code');
    }
    
    if (data?.error) {
      throw new Error(data.error);
    }
    
    if (data?.valid === true) {
      setEmailVerified(true);
    }
    
    return data?.valid === true;
  };

  const signup = async (email: string, password: string, fullName?: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) throw error;
      
      if (data.user) {
        // Create profile with full name
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: fullName || null
        });

        // Check if within free premium offer period (before Jan 27, 2025)
        const offerEndDate = new Date('2025-01-27T23:59:59Z');
        const now = new Date();
        
        if (now < offerEndDate) {
          // Grant 1 year of free premium for early signups
          const premiumExpiry = new Date();
          premiumExpiry.setFullYear(premiumExpiry.getFullYear() + 1);
          
          await supabase.from('premium_grants').insert({
            user_id: data.user.id,
            grant_type: 'early_signup_offer',
            starts_at: new Date().toISOString(),
            expires_at: premiumExpiry.toISOString()
          });
        }

        setUser(data.user);
        setSession(data.session);
        // Note: verification code is sent explicitly from Auth.tsx after signup
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      // Check ban status BEFORE attempting login
      const banStatus = await checkBanStatus(email);
      if (banStatus.isBanned) {
        setBanInfo(banStatus);
        throw new Error('ACCOUNT_BANNED');
      }

      // Login directly - email verification is only required during signup
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      setSession(data.session);
      setUser(data.user);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setEmailVerified(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        error,
        isAuthenticated: !!user,
        emailVerified,
        banInfo,
        signup,
        login,
        logout,
        refreshUser,
        sendVerificationCode,
        verifyEmailCode,
        checkBanStatus,
        clearBanInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
