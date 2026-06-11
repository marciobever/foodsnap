'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export function useCoachHistory(user: any) {
  const [coachHistory, setCoachHistory] = useState<any[]>([]);
  const [loadingCoach, setLoadingCoach] = useState(true);

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    setLoadingCoach(true);
    try {
      const { data, error } = await supabase
        .from('coach_assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoachHistory(data || []);
    } catch (err) {
      console.error("Error fetching coach history:", err);
    } finally {
      setLoadingCoach(false);
    }
  }, [user]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { coachHistory, loadingCoach, refetchCoachHistory: fetchHistory };
}
