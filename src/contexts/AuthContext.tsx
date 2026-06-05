import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { ClinicAdmin, AdminRole } from '../types';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  adminRecord: ClinicAdmin | null;
  role: AdminRole | null;
  clinicId: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [adminRecord, setAdminRecord] = useState<ClinicAdmin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("SESSION:", session);
      setSession(session);
      
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchAdminRecord(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchAdminRecord(session.user.id);
        } else {
          setAdminRecord(null);
          setLoading(false);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);


  async function fetchAdminRecord(userId: string) {
    const { data } = await supabase
      .from('clinic_admins')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    //console.log("USER ID:", userId);
    

    setAdminRecord(data);
    //console.log("ADMIN RECORD:", data);
    setLoading(false);
  }


  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  const value: AuthContextValue = {
    session,
    user,
    adminRecord,
    role: adminRecord?.role ?? null,
    clinicId: adminRecord?.clinic_id ?? null,
    loading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
