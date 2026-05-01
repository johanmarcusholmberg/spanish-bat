export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          activity_date: string
          count: number
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          activity_date?: string
          count?: number
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          activity_date?: string
          count?: number
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_audit_log: {
        Row: {
          action_type: string
          admin_user_id: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json | null
        }
        Insert: {
          action_type: string
          admin_user_id: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          action_type?: string
          admin_user_id?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          admin_notes: string | null
          created_at: string
          email: string
          id: string
          message: string
          status: string
          subject: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          status?: string
          subject: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      flashcard_srs: {
        Row: {
          card_id: string
          ease: number
          id: string
          interval_days: number
          next_review: string
          updated_at: string
          user_id: string
        }
        Insert: {
          card_id: string
          ease?: number
          id?: string
          interval_days?: number
          next_review?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          card_id?: string
          ease?: number
          id?: string
          interval_days?: number
          next_review?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      grammar_progress: {
        Row: {
          attempts: number
          best_score: number
          completed: boolean
          id: string
          lesson_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attempts?: number
          best_score?: number
          completed?: boolean
          id?: string
          lesson_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attempts?: number
          best_score?: number
          completed?: boolean
          id?: string
          lesson_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_status: string
          created_at: string
          display_name: string | null
          id: string
          learning_from: string
          level: string
          onboarding_completed: boolean
          placement_test_completed: boolean
          placement_test_score: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_status?: string
          created_at?: string
          display_name?: string | null
          id?: string
          learning_from?: string
          level?: string
          onboarding_completed?: boolean
          placement_test_completed?: boolean
          placement_test_score?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_status?: string
          created_at?: string
          display_name?: string | null
          id?: string
          learning_from?: string
          level?: string
          onboarding_completed?: boolean
          placement_test_completed?: boolean
          placement_test_score?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_last_activity: {
        Row: {
          exercise_label: string
          exercise_path: string
          exercise_type: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          exercise_label: string
          exercise_path: string
          exercise_type: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          exercise_label?: string
          exercise_path?: string
          exercise_type?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          category: string
          completed: number
          id: string
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          completed?: number
          id?: string
          total?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          completed?: number
          id?: string
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_streaks: {
        Row: {
          current_streak: number
          id: string
          last_active_date: string | null
          longest_streak: number
          updated_at: string
          user_id: string
        }
        Insert: {
          current_streak?: number
          id?: string
          last_active_date?: string | null
          longest_streak?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          current_streak?: number
          id?: string
          last_active_date?: string | null
          longest_streak?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_vocabulary: {
        Row: {
          category: string | null
          context: string | null
          correct_count: number
          created_at: string
          ease_factor: number
          id: string
          incorrect_count: number
          interval_days: number
          item_type: string
          learned: boolean
          level: string | null
          next_review: string
          review_count: number
          review_state: string
          spanish: string
          topic_tags: string[] | null
          translation: string
          updated_at: string
          usage_example: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          context?: string | null
          correct_count?: number
          created_at?: string
          ease_factor?: number
          id?: string
          incorrect_count?: number
          interval_days?: number
          item_type?: string
          learned?: boolean
          level?: string | null
          next_review?: string
          review_count?: number
          review_state?: string
          spanish: string
          topic_tags?: string[] | null
          translation: string
          updated_at?: string
          usage_example?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          context?: string | null
          correct_count?: number
          created_at?: string
          ease_factor?: number
          id?: string
          incorrect_count?: number
          interval_days?: number
          item_type?: string
          learned?: boolean
          level?: string | null
          next_review?: string
          review_count?: number
          review_state?: string
          spanish?: string
          topic_tags?: string[] | null
          translation?: string
          updated_at?: string
          usage_example?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
