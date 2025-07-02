
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAccount } from 'wagmi';

interface AuthContextType {
  user: any;
  session: any;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setUsername: (username: string) => Promise<{ error: any }>;
  authenticateWithWallet: () => Promise<void>;
}

interface UserProfile {
  id: string;
  wallet_address: string | null;
  base_balance: number;
  username: string | null;
  created_at: string;
  updated_at: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { address, isConnected } = useAccount();

  // Authenticate with wallet when wallet connects
  const authenticateWithWallet = async () => {
    if (!address) return;

    try {
      // Sign in with wallet address as email (creating a unique identifier)
      const walletEmail = `${address.toLowerCase()}@wallet.local`;
      
      // Try to sign in first
      let { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: walletEmail,
        password: address.toLowerCase(), // Use address as password
      });

      // If sign in fails, try to sign up
      if (signInError) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: walletEmail,
          password: address.toLowerCase(),
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              wallet_address: address
            }
          }
        });

        if (signUpError) {
          console.error('Error signing up with wallet:', signUpError);
          return;
        }

        console.log('Wallet authenticated via signup:', signUpData);
      } else {
        console.log('Wallet authenticated via signin:', signInData);
      }
    } catch (error) {
      console.error('Error authenticating with wallet:', error);
    }
  };

  // Auto-authenticate when wallet connects
  useEffect(() => {
    if (isConnected && address && !user) {
      console.log('Wallet connected, authenticating...', address);
      authenticateWithWallet();
    }
  }, [isConnected, address, user]);

  useEffect(() => {
    console.log('AuthProvider: Setting up auth state listener');
    
    // Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (session?.user) {
          setTimeout(() => {
            refreshProfile();
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Existing session:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        refreshProfile();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (!user) {
      console.log('No user to refresh profile for');
      return;
    }
    console.log('Refreshing profile for user:', user.id);
    
    try {
      let { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (!profileData && !profileError) {
        console.log('No profile found, creating new profile for user:', user.id);
        
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            base_balance: 1500.0,
            wallet_address: address || null
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating profile:', insertError);
          if (insertError.code === '23505') {
            const { data: retryProfile, error: retryError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .maybeSingle();
            
            if (retryProfile && !retryError) {
              profileData = retryProfile;
            }
          }
        } else {
          profileData = newProfile;
        }
      }

      // Update wallet address if it's changed
      if (profileData && address && profileData.wallet_address !== address) {
        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .update({ wallet_address: address })
          .eq('id', user.id)
          .select()
          .single();

        if (!updateError && updatedProfile) {
          profileData = updatedProfile;
        }
      }

      if (profileData) {
        const validProfile = {
          ...profileData,
          base_balance: profileData.base_balance ? Number(profileData.base_balance) : 1500.0
        };
        setProfile(validProfile);
        console.log('Profile set successfully:', validProfile);
      }
    } catch (error) {
      console.error('Error in refreshProfile:', error);
    }
  };

  const setUsername = async (username: string) => {
    if (!user) return { error: { message: "No user" } };
    
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .maybeSingle();
    
    if (existing) return { error: { message: "Username already taken" } };

    const { error } = await supabase
      .from('profiles')
      .update({ username })
      .eq('id', user.id);
    
    await refreshProfile();
    return { error };
  };

  const signOut = async () => {
    console.log('Signing out user');
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      signOut,
      refreshProfile,
      setUsername,
      authenticateWithWallet,
    }}>
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
