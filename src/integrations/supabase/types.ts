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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_fitness_plans: {
        Row: {
          activity_level: string
          age: number
          created_at: string
          current_weight: number
          duration_days: number
          gender: string
          goal: string
          height_cm: number
          id: string
          is_active: boolean
          plan_data: Json
          target_weight: number
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_level?: string
          age: number
          created_at?: string
          current_weight: number
          duration_days?: number
          gender: string
          goal: string
          height_cm: number
          id?: string
          is_active?: boolean
          plan_data: Json
          target_weight: number
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_level?: string
          age?: number
          created_at?: string
          current_weight?: number
          duration_days?: number
          gender?: string
          goal?: string
          height_cm?: number
          id?: string
          is_active?: boolean
          plan_data?: Json
          target_weight?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: string | null
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: string | null
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: string | null
        }
        Relationships: []
      }
      attendance: {
        Row: {
          checked_in_at: string
          checked_out_at: string | null
          id: string
          reason: string | null
          status: string
          user_id: string
        }
        Insert: {
          checked_in_at?: string
          checked_out_at?: string | null
          id?: string
          reason?: string | null
          status?: string
          user_id: string
        }
        Update: {
          checked_in_at?: string
          checked_out_at?: string | null
          id?: string
          reason?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      exercises: {
        Row: {
          body_part: string
          created_at: string
          created_by: string | null
          description: string | null
          description_hi: string | null
          difficulty: string | null
          gender_target: string | null
          how_to_use: string | null
          how_to_use_hi: string | null
          id: string
          image_urls: Json | null
          name: string
          name_hi: string | null
          reps: string | null
          sets: number | null
          thumbnail_url: string | null
          video_url: string | null
        }
        Insert: {
          body_part: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          description_hi?: string | null
          difficulty?: string | null
          gender_target?: string | null
          how_to_use?: string | null
          how_to_use_hi?: string | null
          id?: string
          image_urls?: Json | null
          name: string
          name_hi?: string | null
          reps?: string | null
          sets?: number | null
          thumbnail_url?: string | null
          video_url?: string | null
        }
        Update: {
          body_part?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          description_hi?: string | null
          difficulty?: string | null
          gender_target?: string | null
          how_to_use?: string | null
          how_to_use_hi?: string | null
          id?: string
          image_urls?: Json | null
          name?: string
          name_hi?: string | null
          reps?: string | null
          sets?: number | null
          thumbnail_url?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      fees: {
        Row: {
          amount: number
          approved_at: string | null
          created_at: string
          id: string
          month: string
          notes: string | null
          payment_date: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          approved_at?: string | null
          created_at?: string
          id?: string
          month: string
          notes?: string | null
          payment_date?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          approved_at?: string | null
          created_at?: string
          id?: string
          month?: string
          notes?: string | null
          payment_date?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      machines: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          description_hi: string | null
          how_to_use: string | null
          how_to_use_hi: string | null
          id: string
          image_url: string | null
          name: string
          name_hi: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          description_hi?: string | null
          how_to_use?: string | null
          how_to_use_hi?: string | null
          id?: string
          image_url?: string | null
          name: string
          name_hi?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          description_hi?: string | null
          how_to_use?: string | null
          how_to_use_hi?: string | null
          id?: string
          image_url?: string | null
          name?: string
          name_hi?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      manager_permissions: {
        Row: {
          created_at: string
          granted_by: string | null
          id: string
          permission: string
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          id?: string
          permission: string
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
          id?: string
          permission?: string
          user_id?: string
        }
        Relationships: []
      }
      member_posts: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          caption: string | null
          created_at: string
          id: string
          media_url: string | null
          progress_data: Json | null
          status: Database["public"]["Enums"]["post_status"]
          type: Database["public"]["Enums"]["post_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          caption?: string | null
          created_at?: string
          id?: string
          media_url?: string | null
          progress_data?: Json | null
          status?: Database["public"]["Enums"]["post_status"]
          type: Database["public"]["Enums"]["post_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          caption?: string | null
          created_at?: string
          id?: string
          media_url?: string | null
          progress_data?: Json | null
          status?: Database["public"]["Enums"]["post_status"]
          type?: Database["public"]["Enums"]["post_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          image_url: string | null
          in_stock: boolean
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          in_stock?: boolean
          name: string
          price?: number
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          in_stock?: boolean
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          created_at: string
          fitness_level: string | null
          gender: string | null
          height: string | null
          id: string
          member_id: string | null
          name: string
          phone: string | null
          photo_url: string | null
          updated_at: string
          user_id: string
          weight: number | null
        }
        Insert: {
          age?: number | null
          created_at?: string
          fitness_level?: string | null
          gender?: string | null
          height?: string | null
          id?: string
          member_id?: string | null
          name: string
          phone?: string | null
          photo_url?: string | null
          updated_at?: string
          user_id: string
          weight?: number | null
        }
        Update: {
          age?: number | null
          created_at?: string
          fitness_level?: string | null
          gender?: string | null
          height?: string | null
          id?: string
          member_id?: string | null
          name?: string
          phone?: string | null
          photo_url?: string | null
          updated_at?: string
          user_id?: string
          weight?: number | null
        }
        Relationships: []
      }
      salaries: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          id: string
          month: string
          notes: string | null
          paid_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          id?: string
          month: string
          notes?: string | null
          paid_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          id?: string
          month?: string
          notes?: string | null
          paid_at?: string
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
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      weight_logs: {
        Row: {
          calories_burned: number | null
          calories_consumed: number | null
          id: string
          logged_at: string
          notes: string | null
          user_id: string
          weight: number
        }
        Insert: {
          calories_burned?: number | null
          calories_consumed?: number | null
          id?: string
          logged_at?: string
          notes?: string | null
          user_id: string
          weight: number
        }
        Update: {
          calories_burned?: number | null
          calories_consumed?: number | null
          id?: string
          logged_at?: string
          notes?: string | null
          user_id?: string
          weight?: number
        }
        Relationships: []
      }
      workout_completions: {
        Row: {
          completed_at: string
          completed_on: string
          exercise_id: string
          id: string
          notes: string | null
          scheduled_day: number
          user_id: string
        }
        Insert: {
          completed_at?: string
          completed_on?: string
          exercise_id: string
          id?: string
          notes?: string | null
          scheduled_day: number
          user_id: string
        }
        Update: {
          completed_at?: string
          completed_on?: string
          exercise_id?: string
          id?: string
          notes?: string | null
          scheduled_day?: number
          user_id?: string
        }
        Relationships: []
      }
      workout_schedules: {
        Row: {
          created_at: string
          created_by: string | null
          day_of_week: number
          exercise_id: string
          id: string
          order_index: number
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          day_of_week: number
          exercise_id: string
          id?: string
          order_index?: number
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          day_of_week?: number
          exercise_id?: string
          id?: string
          order_index?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_schedules_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      complete_user_registration: {
        Args: { _user_id: string }
        Returns: string
      }
      get_email_by_member_id: { Args: { _member_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "member" | "manager" | "sub_user"
      post_status: "pending" | "approved" | "rejected"
      post_type: "photo" | "reel" | "progress"
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
      app_role: ["admin", "member", "manager", "sub_user"],
      post_status: ["pending", "approved", "rejected"],
      post_type: ["photo", "reel", "progress"],
    },
  },
} as const
