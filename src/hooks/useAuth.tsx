
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

  useEffect(() => {
    console.log('AuthProvider: Setting up auth state listener');
    
    // Auth by wallet connect triggers Supabase session
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
    // eslint-disable-next-line
  }, [address]);

  useEffect(() => {
    if (user && address) {
      console.log('Updating wallet address for user:', user.id);
      // Upsert wallet address if not present
      setTimeout(() => {
        supabase
          .from('profiles')
          .upsert({ id: user.id, wallet_address: address }, { onConflict: 'id' });
      }, 0);
    }
    // eslint-disable-next-line
  }, [user, address]);

  const refreshProfile = async () => {
    if (!user) {
      console.log('No user to refresh profile for');
      return;
    }
    console.log('Refreshing profile for user:', user.id);
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching profile:', error);
    } else {
      console.log('Profile refreshed:', data);
    }
    setProfile(data);
    setLoading(false);
  };

  const setUsername = async (username: string) => {
    if (!user) return { error: { message: "No user" } };
    // Ensure username uniqueness
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
