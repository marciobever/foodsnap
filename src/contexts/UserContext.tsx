'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types';

interface UserContextType {
    user: User | null;
    loading: boolean;
    isAdminView: boolean;
    isProfessionalView: boolean;
    toggleAdminView: () => void;
    setIsProfessionalView: (isPro: boolean) => void;
    logout: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdminView, setIsAdminView] = useState(false);
    const [isProfessionalView, setIsProfessionalView] = useState(false);

    const fetchUserProfile = async (userId: string, email?: string) => {
        try {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle();

            if (error) throw error;

            if (!profile || !profile.phone) {
                console.warn("UserContext: Perfil sem telefone. Checkout wizard irá capturar.");
            }

            // Fetch Entitlements
            const { data: entitlement } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('user_id', userId)
                .maybeSingle();

            let plan: 'free' | 'pro' = 'free';
            if (entitlement?.status === 'active') {
                plan = 'pro';
            }

            const userData: User = {
                id: userId,
                name: profile?.full_name || 'Usuário',
                email: email || profile?.email || '',
                phone: profile?.phone || '',
                public_id: profile?.public_id || '',
                is_admin: profile?.is_admin || false,
                coach_personality: profile?.coach_personality || 'gordon_ramsay',
                plan: plan,
                plan_valid_until: entitlement?.valid_until
            };

            setUser(userData);

            // Auto-switch view logic
            if (profile?.is_professional) {
                setIsProfessionalView(true);
            }

        } catch (error) {
            console.error('UserContext: Erro ao carregar perfil', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let mounted = true;
        let isFetching = false; // Prevent concurrent deadlocks

        const handleSession = async (session: any) => {
            if (isFetching) return;
            isFetching = true;

            if (session?.user) {
                // Promise.race to guarantee we escape infinite loading if Supabase POST/GET hangs
                const timeout = new Promise<void>((_, reject) => setTimeout(() => reject(new Error("DB Timeout")), 8000));
                try {
                    await Promise.race([
                        fetchUserProfile(session.user.id, session.user.email),
                        timeout
                    ]);
                } catch (e) {
                    console.error("UserContext HandleSession Error:", e);
                    if (mounted) setLoading(false);
                } finally {
                    isFetching = false;
                }
            } else {
                setUser(null);
                if (mounted) setLoading(false);
                isFetching = false;
            }
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log(`UserContext Auth Event: ${event}`);
            if (!mounted) return;

            if (event === 'INITIAL_SESSION') {
                await handleSession(session);
            } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                await handleSession(session);
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setIsAdminView(false);
                setIsProfessionalView(false);
                if (mounted) setLoading(false);
                isFetching = false;
            }
        });

        // Fallback for when "INITIAL_SESSION" gets completely skipped by Supabase JS on load
        supabase.auth.getSession().then(({ data: { session }, error }) => {
            if (error) {
                console.error("UserContext: Falha na sessão inicial", error);
                if (mounted) setLoading(false);
            } else if (session) {
                // If there's a session but events haven't fired or were skipped, gently process it
                handleSession(session);
            } else {
                if (mounted) setLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        window.location.href = '/';
    };

    const toggleAdminView = () => {
        if (user?.is_admin) setIsAdminView(prev => !prev);
    };

    const refreshProfile = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            await fetchUserProfile(session.user.id, session.user.email);
        }
    };

    return (
        <UserContext.Provider value={{
            user,
            loading,
            isAdminView,
            isProfessionalView,
            toggleAdminView,
            setIsProfessionalView,
            logout,
            refreshProfile
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
