'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export const useCoachPlan = (userId: string) => {
    const [coachPlan, setCoachPlan] = useState<any>(null);
    const [coachHistory, setCoachHistory] = useState<any[]>([]);
    const [loadingCoachPlan, setLoadingCoachPlan] = useState(false);

    const fetchCoachPlan = async () => {
        if (!userId) return;

        setLoadingCoachPlan(true);
        try {
            const { data, error } = await supabase
                .from('coach_analyses')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error fetching coach plan:", error);
                return;
            }
            console.log("Coach Plan Data:", data); // DEBUG


            if (data) {
                setCoachHistory(data);
                if (data.length > 0) {
                    // Set latest as default
                    const latest = data[0];
                    const structured = typeof latest.ai_structured === 'string'
                        ? JSON.parse(latest.ai_structured)
                        : latest.ai_structured;
                    setCoachPlan(structured);
                } else {
                    setCoachPlan(null);
                }
            }
        } catch (err) {
            console.error("Error fetching coach plan:", err);
        } finally {
            setLoadingCoachPlan(false);
        }
    };

    useEffect(() => {
        fetchCoachPlan();
    }, [userId]);

    return { coachPlan, setCoachPlan, coachHistory, loadingCoachPlan, refetchCoachPlan: fetchCoachPlan };
};
