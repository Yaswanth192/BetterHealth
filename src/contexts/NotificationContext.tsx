import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface NotificationCounts {
  pendingAppointments: number;
  unreadMessages: number;
}

interface NotificationContextType {
  counts: NotificationCounts;
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
  counts: { pendingAppointments: 0, unreadMessages: 0 },
  refresh: async () => {},
});

export function useNotifications() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { clinicId } = useAuth();
  const [counts, setCounts] = useState<NotificationCounts>({
    pendingAppointments: 0,
    unreadMessages: 0,
  });

  const refresh = useCallback(async () => {
    if (!clinicId) return;
    const [apptRes, msgRes] = await Promise.all([
      supabase
        .from('appointments')
        .select('id', { count: 'exact', head: true })
        .eq('clinic_id', clinicId)
        .eq('status', 'pending'),
      supabase
        .from('contact_messages')
        .select('id', { count: 'exact', head: true })
        .eq('clinic_id', clinicId)
        .eq('is_read', false),
    ]);
    setCounts({
      pendingAppointments: apptRes.count ?? 0,
      unreadMessages: msgRes.count ?? 0,
    });
  }, [clinicId]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  return (
    <NotificationContext.Provider value={{ counts, refresh }}>
      {children}
    </NotificationContext.Provider>
  );
}
