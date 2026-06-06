export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    plan: 'free' | 'pro';
    public_id: string;
    avatar?: string;
    plan_valid_until?: string;
    plan_cancel_at_period_end?: boolean;
    is_admin?: boolean;
    is_professional?: boolean;
    coach_personality?: string;
}
