
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

  // Authenticate with wallet using anonymous auth + wallet verification
  const authenticateWithWallet = async () => {
    if (!address) {
      console.error('No wallet address available');
      return;
    }

    try {
      console.log('Starting wallet authentication for:', address);
      
      // First, try anonymous sign in
      const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
      
      if (authError) {
        console.error('Anonymous auth error:', authError);
        return;
      }

      console.log('Anonymous auth successful:', authData.user?.id);
    } catch (error) {
      console.error('Error in wallet authentication:', error);
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
        
        if (session?.user && address) {
          // Use setTimeout to avoid callback deadlock
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
      if (session?.user && address) {
        refreshProfile();
      }
    });

    return () => subscription.unsubscribe();
  }, [address]);

  const refreshProfile = async () => {
    if (!user || !address) {
      console.log('No user or address to refresh profile for');
      return;
    }
    console.log('Refreshing profile for user:', user.id, 'wallet:', address);
    
    try {
      // First, try to find existing profile by wallet address
      let { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('wallet_address', address)
        .maybeSingle();

      if (!profileData && !profileError) {
        console.log('No profile found for wallet, creating new profile');
        
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            base_balance: 1500.0,
            wallet_address: address
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating profile:', insertError);
          // If profile already exists for this user ID, try to update it
          if (insertError.code === '23505') {
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
        } else {
          profileData = newProfile;
        }
      } else if (profileData && profileData.id !== user.id) {
        // Profile exists but with different user ID, update it
        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .update({ id: user.id })
          .eq('wallet_address', address)
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
