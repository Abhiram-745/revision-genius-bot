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
  const grantOAuthPremium = async (userId: string): Promise<boolean> => {
    const offerEndDate = new Date('2025-01-27T23:59:59Z');
    const now = new Date();
    
    if (now >= offerEndDate) return false;
    
    // Check if user already has premium grant
    const { data: existingGrant } = await supabase
      .from('premium_grants')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (existingGrant) return false; // Already has premium
    
    // Grant 2 months of free premium
    const premiumExpiry = new Date();
    premiumExpiry.setMonth(premiumExpiry.getMonth() + 2);
    
    const { error } = await supabase.from('premium_grants').insert({
      user_id: userId,
      grant_type: 'early_signup_offer',
      starts_at: new Date().toISOString(),
      expires_at: premiumExpiry.toISOString()
    });
    
    if (!error) {
      console.log('Premium granted to OAuth user:', userId);
      return true; // Premium was granted
    }
    return false;
  };

  // Process referral code after successful signup
  const processReferralCode = async (userId: string) => {
    const referralCode = localStorage.getItem('vistara_referral_code');
    if (!referralCode) return;

    try {
      // Look up the referral code
      const { data: codeData, error: codeError } = await supabase
        .from('referral_codes')
        .select('id, user_id')
        .eq('code', referralCode)
        .maybeSingle();

      if (codeError || !codeData) {
        console.log('Referral code not found:', referralCode);
        localStorage.removeItem('vistara_referral_code');
        return;
      }

      // Don't allow self-referral
      if (codeData.user_id === userId) {
        console.log('Cannot self-refer');
        localStorage.removeItem('vistara_referral_code');
        return;
      }

      // Check if this user has already used a referral code
      const { data: existingUse } = await supabase
        .from('referral_uses')
        .select('id')
        .eq('referred_user_id', userId)
        .maybeSingle();

      if (existingUse) {
        console.log('User already used a referral code');
        localStorage.removeItem('vistara_referral_code');
        return;
      }

      // Insert the referral use
      const { error: insertError } = await supabase
        .from('referral_uses')
        .insert({
          referral_code_id: codeData.id,
          referred_user_id: userId,
          is_valid: true
        });

      if (insertError) {
        console.error('Error inserting referral use:', insertError);
      } else {
        console.log('Referral recorded successfully for code:', referralCode);
        
        // Check and grant referral premium to the referrer
        await supabase.rpc('check_and_grant_referral_premium', { _user_id: codeData.user_id });
      }

      localStorage.removeItem('vistara_referral_code');
    } catch (err) {
      console.error('Error processing referral code:', err);
      localStorage.removeItem('vistara_referral_code');
    }
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
            // Also process referral for OAuth signups
            await processReferralCode(session.user.id);
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
        // Clear any previous wizard progress to ensure fresh start
        localStorage.removeItem('timetable-wizard-progress');
        
        // Create profile with full name
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: fullName || null
        });

        // ALWAYS grant 2 months of free premium for new signups during offer period
        const offerEndDate = new Date('2025-01-27T23:59:59Z');
        const now = new Date();
        
        if (now < offerEndDate) {
          // Check if user already has premium grant (shouldn't happen for new users)
          const { data: existingGrant } = await supabase
            .from('premium_grants')
            .select('id')
            .eq('user_id', data.user.id)
            .maybeSingle();
          
          if (!existingGrant) {
            const premiumExpiry = new Date();
            premiumExpiry.setMonth(premiumExpiry.getMonth() + 2);
            
            const { error: premiumError } = await supabase.from('premium_grants').insert({
              user_id: data.user.id,
              grant_type: 'early_signup_offer',
              starts_at: new Date().toISOString(),
              expires_at: premiumExpiry.toISOString()
            });
            
            if (premiumError) {
              console.error('Error granting premium:', premiumError);
            } else {
              console.log('Premium granted to new user:', data.user.id);
            }
          }
        }

        // Process referral code for email signups
        await processReferralCode(data.user.id);

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
