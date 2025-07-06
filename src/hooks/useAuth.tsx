
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

  // Simple wallet authentication using profiles table directly
  const authenticateWithWallet = async () => {
    if (!address) {
      console.error('No wallet address available');
      return;
    }

    try {
      console.log('Starting wallet authentication for:', address);
      setLoading(true);
      
      // Create a mock user object using wallet address
      const mockUser = {
        id: address.toLowerCase(),
        wallet_address: address
      };
      
      const mockSession = {
        user: mockUser,
        access_token: 'wallet_auth_token'
      };

      setUser(mockUser);
      setSession(mockSession);
      
      console.log('Wallet auth successful for:', address);
      
      // Load/create profile
      await refreshProfile();
    } catch (error) {
      console.error('Error in wallet authentication:', error);
      setLoading(false);
    }
  };

  // Auto-authenticate when wallet connects
  useEffect(() => {
    if (isConnected && address && !user) {
      console.log('Wallet connected, authenticating...', address);
      authenticateWithWallet();
    } else if (!isConnected) {
      console.log('Wallet disconnected, clearing auth state');
      setUser(null);
      setSession(null);
      setProfile(null);
      setLoading(false);
    }
  }, [isConnected, address]);

  const refreshProfile = async () => {
    if (!address) {
      console.log('No wallet address to refresh profile for');
      setLoading(false);
      return;
    }
    
    console.log('Refreshing profile for wallet:', address);
    
    try {
      // Try to find existing profile by wallet address
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
            id: address.toLowerCase(),
            base_balance: 1500.0,
            wallet_address: address
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating profile:', insertError);
        } else {
          profileData = newProfile;
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
    } finally {
      setLoading(false);
    }
  };

  const setUsername = async (username: string) => {
    if (!address) return { error: { message: "No wallet connected" } };
    
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .maybeSingle();
    
    if (existing) return { error: { message: "Username already taken" } };

    const { error } = await supabase
      .from('profiles')
      .update({ username })
      .eq('wallet_address', address);
    
    await refreshProfile();
    return { error };
  };

  const signOut = async () => {
    console.log('Signing out user');
    setUser(null);
    setSession(null);
    setProfile(null);
    setLoading(false);
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
