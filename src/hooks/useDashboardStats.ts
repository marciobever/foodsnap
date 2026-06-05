'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface DailyMacro {
    date: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    score: number;
}

interface DashboardStats {
    totalCount: number;
    avgCals: number;
    currentStreak: number;
    longestStreak: number;
    chartData: DailyMacro[];
    freeFoodUsed?: number;
    freeCoachUsed?: number;
}

export const useDashboardStats = (userId: string) => {
    const [stats, setStats] = useState<DashboardStats>({
        totalCount: 0,
        avgCals: 0,
        currentStreak: 0,
        longestStreak: 0,
        chartData: [],
        freeFoodUsed: 0,
        freeCoachUsed: 0
    });
    const [loadingStats, setLoadingStats] = useState(false);

    const fetchStats = async () => {
        if (!userId) return;

        setLoadingStats(true);
        try {
            // 1. Get User Profile for Streak
            const { data: profile } = await supabase
                .from('profiles')
                .select('current_streak, longest_streak')
                .eq('id', userId)
                .maybeSingle();

            // 2. Get Total Count
            const { count, error: countError } = await supabase
                .from('food_analyses')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId);

            if (countError) throw countError;

            // 2.5 Get Free Quota Uses
            const { count: freeFoodUsed } = await supabase
                .from('food_analyses')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('used_free_quota', true);

            const { count: freeCoachUsed } = await supabase
                .from('coach_analyses')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('used_free_quota', true);

            // 3. Get Last 7 Days Data for Charts
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
            sevenDaysAgo.setHours(0, 0, 0, 0);

            const { data: calData, error: calError } = await supabase
                .from('food_analyses')
                .select('total_calories, total_protein, total_carbs, total_fat, nutrition_score, created_at')
                .eq('user_id', userId)
                .gte('created_at', sevenDaysAgo.toISOString())
                .order('created_at', { ascending: true });

            if (calError) throw calError;

            let calculatedAvg = 0;
            const dailyData: Record<string, { cals: number[], prot: number[], carbs: number[], fat: number[], score: number[] }> = {};

            // Initialize last 7 days
            for (let i = 0; i < 7; i++) {
                const d = new Date();
                d.setDate(d.getDate() - (6 - i));
                const dateStr = d.toLocaleDateString('pt-BR', { weekday: 'short' });
                dailyData[dateStr] = { cals: [], prot: [], carbs: [], fat: [], score: [] };
            }

            if (calData && calData.length > 0) {
                const totalSum = calData.reduce((acc, curr) => acc + (curr.total_calories || 0), 0);
                calculatedAvg = Math.round(totalSum / calData.length);

                calData.forEach(item => {
                    if (!item.created_at) return;
                    const d = new Date(item.created_at);
                    const k = d.toLocaleDateString('pt-BR', { weekday: 'short' });
                    if (dailyData[k]) {
                        dailyData[k].cals.push(item.total_calories || 0);
                        dailyData[k].prot.push(item.total_protein || 0);
                        dailyData[k].carbs.push(item.total_carbs || 0);
                        dailyData[k].fat.push(item.total_fat || 0);
                        dailyData[k].score.push(item.nutrition_score || 0);
                    }
                });
            }

            // Averages per day
            const chartData: DailyMacro[] = Object.keys(dailyData).map(k => {
                const d = dailyData[k];
                const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
                return {
                    date: k,
                    calories: avg(d.cals),
                    protein: avg(d.prot),
                    carbs: avg(d.carbs),
                    fat: avg(d.fat),
                    score: avg(d.score),
                };
            });

            setStats({
                totalCount: count || 0,
                avgCals: calculatedAvg,
                currentStreak: profile?.current_streak || 0,
                longestStreak: profile?.longest_streak || 0,
                chartData: chartData,
                freeFoodUsed: freeFoodUsed || 0,
                freeCoachUsed: freeCoachUsed || 0
            });

        } catch (err) {
            console.error("Error fetching stats:", err);
        } finally {
            setLoadingStats(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [userId]);

    return { stats, loadingStats, refetchStats: fetchStats };
};
