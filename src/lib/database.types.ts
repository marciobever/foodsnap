export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      app_settings: {
        Row: {
          key: string
          value: string
          created_at: string
          updated_at: string
        }
        Insert: {
          key: string
          value: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          key?: string
          value?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          id: string
          code: string
          discount_percent: number
          max_uses: number | null
          uses_count: number | null
          is_active: boolean | null
          valid_until: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          code: string
          discount_percent: number
          max_uses?: number | null
          uses_count?: number | null
          is_active?: boolean | null
          valid_until?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          code?: string
          discount_percent?: number
          max_uses?: number | null
          uses_count?: number | null
          is_active?: boolean | null
          valid_until?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      food_analyses: {
        Row: {
          id: string
          user_id: string
          source: string
          image_url: string | null
          ai_raw_response: string
          ai_structured: Json
          total_calories: number | null
          total_protein: number | null
          total_carbs: number | null
          total_fat: number | null
          total_fiber: number | null
          total_sodium_mg: number | null
          nutrition_score: number | null
          confidence_level: string | null
          used_free_quota: boolean | null
          created_at: string | null
          source_message_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          source?: string
          image_url?: string | null
          ai_raw_response: string
          ai_structured: Json
          total_calories?: number | null
          total_protein?: number | null
          total_carbs?: number | null
          total_fat?: number | null
          total_fiber?: number | null
          total_sodium_mg?: number | null
          nutrition_score?: number | null
          confidence_level?: string | null
          used_free_quota?: boolean | null
          created_at?: string | null
          source_message_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          source?: string
          image_url?: string | null
          ai_raw_response?: string
          ai_structured?: Json
          total_calories?: number | null
          total_protein?: number | null
          total_carbs?: number | null
          total_fat?: number | null
          total_fiber?: number | null
          total_sodium_mg?: number | null
          nutrition_score?: number | null
          confidence_level?: string | null
          used_free_quota?: boolean | null
          created_at?: string | null
          source_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "food_analyses_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users" // implied, usually auth.users but referenced as generic
            referencedColumns: ["id"]
          }
        ]
      }
      food_analysis_items: {
        Row: {
          id: string
          analysis_id: string
          user_id: string
          name: string | null
          portion: string | null
          calories: number | null
          protein: number | null
          carbs: number | null
          fat: number | null
          fiber: number | null
          sugar: number | null
          sodium_mg: number | null
          flags: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          analysis_id: string
          user_id: string
          name?: string | null
          portion?: string | null
          calories?: number | null
          protein?: number | null
          carbs?: number | null
          fat?: number | null
          fiber?: number | null
          sugar?: number | null
          sodium_mg?: number | null
          flags?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          analysis_id?: string
          user_id?: string
          name?: string | null
          portion?: string | null
          calories?: number | null
          protein?: number | null
          carbs?: number | null
          fat?: number | null
          fiber?: number | null
          sugar?: number | null
          sodium_mg?: number | null
          flags?: Json | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "food_analysis_items_analysis_id_fkey"
            columns: ["analysis_id"]
            referencedRelation: "food_analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_analysis_items_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      payments: {
        Row: {
          id: string
          user_id: string | null
          amount_cents: number
          currency: string | null
          status: string | null
          plan_type: string | null
          stripe_payment_id: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          amount_cents: number
          currency?: string | null
          status?: string | null
          plan_type?: string | null
          stripe_payment_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          amount_cents?: number
          currency?: string | null
          status?: string | null
          plan_type?: string | null
          stripe_payment_id?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      pro_assessments: {
        Row: {
          id: string
          professional_id: string
          student_id: string
          date: string | null
          weight: number | null
          height: number | null
          age: number | null
          bf_percent: number | null
          muscle_percent: number | null
          bmi: number | null
          measurements: Json | null
          methodology: Json | null
          photos: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          professional_id: string
          student_id: string
          date?: string | null
          weight?: number | null
          height?: number | null
          age?: number | null
          bf_percent?: number | null
          muscle_percent?: number | null
          bmi?: number | null
          measurements?: Json | null
          methodology?: Json | null
          photos?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          professional_id?: string
          student_id?: string
          date?: string | null
          weight?: number | null
          height?: number | null
          age?: number | null
          bf_percent?: number | null
          muscle_percent?: number | null
          bmi?: number | null
          measurements?: Json | null
          methodology?: Json | null
          photos?: string[] | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pro_assessments_professional_id_fkey"
            columns: ["professional_id"]
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pro_assessments_student_id_fkey"
            columns: ["student_id"]
            referencedRelation: "pro_students"
            referencedColumns: ["id"]
          }
        ]
      }
      pro_assignments: {
        Row: {
          id: string
          professional_id: string
          student_id: string
          workout_id: string
          start_date: string | null
          end_date: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          professional_id: string
          student_id: string
          workout_id: string
          start_date?: string | null
          end_date?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          professional_id?: string
          student_id?: string
          workout_id?: string
          start_date?: string | null
          end_date?: string | null
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pro_assignments_professional_id_fkey"
            columns: ["professional_id"]
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pro_assignments_student_id_fkey"
            columns: ["student_id"]
            referencedRelation: "pro_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pro_assignments_workout_id_fkey"
            columns: ["workout_id"]
            referencedRelation: "pro_workouts"
            referencedColumns: ["id"]
          }
        ]
      }
      pro_students: {
        Row: {
          id: string
          professional_id: string
          name: string
          email: string | null
          phone: string | null
          status: 'active' | 'inactive' | 'pending' | null
          linked_user_id: string | null
          goals: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          professional_id: string
          name: string
          email?: string | null
          phone?: string | null
          status?: 'active' | 'inactive' | 'pending' | null
          linked_user_id?: string | null
          goals?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          professional_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          status?: 'active' | 'inactive' | 'pending' | null
          linked_user_id?: string | null
          goals?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pro_students_professional_id_fkey"
            columns: ["professional_id"]
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pro_students_linked_user_id_fkey"
            columns: ["linked_user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      pro_workouts: {
        Row: {
          id: string
          professional_id: string
          title: string
          description: string | null
          difficulty: 'beginner' | 'intermediate' | 'advanced' | null
          exercises: Json | null
          tags: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          professional_id: string
          title: string
          description?: string | null
          difficulty?: 'beginner' | 'intermediate' | 'advanced' | null
          exercises?: Json | null
          tags?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          professional_id?: string
          title?: string
          description?: string | null
          difficulty?: 'beginner' | 'intermediate' | 'advanced' | null
          exercises?: Json | null
          tags?: string[] | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pro_workouts_professional_id_fkey"
            columns: ["professional_id"]
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          }
        ]
      }
      professionals: {
        Row: {
          id: string
          business_name: string | null
          cref_crn: string | null
          bio: string | null
          specialties: string[] | null
          logo_url: string | null
          primary_color: string | null
          contacts: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          business_name?: string | null
          cref_crn?: string | null
          bio?: string | null
          specialties?: string[] | null
          logo_url?: string | null
          primary_color?: string | null
          contacts?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_name?: string | null
          cref_crn?: string | null
          bio?: string | null
          specialties?: string[] | null
          logo_url?: string | null
          primary_color?: string | null
          contacts?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "professionals_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          phone: string | null
          created_at: string | null
          updated_at: string | null
          public_id: string | null
          phone_e164: string | null
          is_admin: boolean | null
          is_professional: boolean | null
          avatar_url: string | null
          current_streak?: number
          longest_streak?: number
          last_scan_date?: string | null
        }
        Insert: {
          id: string
          full_name: string
          email: string
          phone?: string | null
          created_at?: string | null
          updated_at?: string | null
          public_id?: string | null
          phone_e164?: string | null
          is_admin?: boolean | null
          is_professional?: boolean | null
          avatar_url?: string | null
          current_streak?: number
          longest_streak?: number
          last_scan_date?: string | null
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          phone?: string | null
          created_at?: string | null
          updated_at?: string | null
          public_id?: string | null
          phone_e164?: string | null
          is_admin?: boolean | null
          is_professional?: boolean | null
          avatar_url?: string | null
          current_streak?: number
          longest_streak?: number
          last_scan_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      stripe_customers: {
        Row: {
          user_id: string
          stripe_customer_id: string
          email: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          stripe_customer_id: string
          email?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          stripe_customer_id?: string
          email?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stripe_customers_pkey" // It's actually a PK but often a FK too
            columns: ["user_id"]
            referencedRelation: "users" // implicit
            referencedColumns: ["id"]
          }
        ]
      }
      stripe_events: {
        Row: {
          id: string
          type: string | null
          created_at: string
        }
        Insert: {
          id: string
          type?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          type?: string | null
          created_at?: string
        }
        Relationships: []
      }
      user_entitlements: {
        Row: {
          user_id: string
          entitlement_code: string
          is_trial: boolean
          is_active: boolean
          valid_until: string | null
          usage: Json
          created_at: string
          updated_at: string
          plan_type: string | null
        }
        Insert: {
          user_id: string
          entitlement_code: string
          is_trial?: boolean
          is_active?: boolean
          valid_until?: string | null
          usage?: Json
          created_at?: string
          updated_at?: string
          plan_type?: string | null
        }
        Update: {
          user_id?: string
          entitlement_code?: string
          is_trial?: boolean
          is_active?: boolean
          valid_until?: string | null
          usage?: Json
          created_at?: string
          updated_at?: string
          plan_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_entitlements_pkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      user_access_summary: {
        Row: {
          user_id: string | null
          free_used: number | null
          free_remaining: number | null
          plan_active: boolean | null
          plan_code: string | null
          plan_started_at: string | null
          plan_valid_until: string | null
          can_use_paid: boolean | null
        }
      }
    }
  }
}
