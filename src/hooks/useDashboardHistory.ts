'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useDashboardHistory(user: any) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('food_analyses')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        const mappedData = (data || []).map((item: any) => ({
          ...item,
          img: item.image_url || null
        }));
        setHistory(mappedData);
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  return { history, loading };
}
