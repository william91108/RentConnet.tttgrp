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
      documents: {
        Row: {
          category: string
          created_at: string
          file_url: string
          house_id: string
          id: string
          name: string
          uploaded_by: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          file_url: string
          house_id: string
          id?: string
          name: string
          uploaded_by?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          file_url?: string
          house_id?: string
          id?: string
          name?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_house_id_fkey"
            columns: ["house_id"]
            isOneToOne: false
            referencedRelation: "houses"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_contacts: {
        Row: {
          created_at: string
          email: string | null
          house_id: string
          id: string
          is_after_hours: boolean | null
          name: string
          phone: string
          role: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          house_id: string
          id?: string
          is_after_hours?: boolean | null
          name: string
          phone?: string
          role?: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string
          email?: string | null
          house_id?: string
          id?: string
          is_after_hours?: boolean | null
          name?: string
          phone?: string
          role?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "emergency_contacts_house_id_fkey"
            columns: ["house_id"]
            isOneToOne: false
            referencedRelation: "houses"
            referencedColumns: ["id"]
          },
        ]
      }
      house_rules_acknowledgements: {
        Row: {
          acknowledged_at: string
          house_id: string
          id: string
          user_id: string
        }
        Insert: {
          acknowledged_at?: string
          house_id: string
          id?: string
          user_id: string
        }
        Update: {
          acknowledged_at?: string
          house_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "house_rules_acknowledgements_house_id_fkey"
            columns: ["house_id"]
            isOneToOne: false
            referencedRelation: "houses"
            referencedColumns: ["id"]
          },
        ]
      }
      houses: {
        Row: {
          address: string
          created_at: string
          description: string | null
          house_rules: string | null
          id: string
          name: string
          rent_includes: string | null
          updated_at: string
        }
        Insert: {
          address?: string
          created_at?: string
          description?: string | null
          house_rules?: string | null
          id?: string
          name: string
          rent_includes?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          created_at?: string
          description?: string | null
          house_rules?: string | null
          id?: string
          name?: string
          rent_includes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      issue_history: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          issue_id: string
          new_status: Database["public"]["Enums"]["issue_status"]
          notes: string | null
          old_status: Database["public"]["Enums"]["issue_status"] | null
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          issue_id: string
          new_status: Database["public"]["Enums"]["issue_status"]
          notes?: string | null
          old_status?: Database["public"]["Enums"]["issue_status"] | null
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          issue_id?: string
          new_status?: Database["public"]["Enums"]["issue_status"]
          notes?: string | null
          old_status?: Database["public"]["Enums"]["issue_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "issue_history_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
        ]
      }
      issues: {
        Row: {
          category: string
          created_at: string
          description: string
          house_id: string
          id: string
          location: string
          photo_urls: string[] | null
          priority: Database["public"]["Enums"]["issue_priority"]
          reported_by: string
          resolution_notes: string | null
          room_id: string | null
          status: Database["public"]["Enums"]["issue_status"]
          time_noticed: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string
          house_id: string
          id?: string
          location: string
          photo_urls?: string[] | null
          priority?: Database["public"]["Enums"]["issue_priority"]
          reported_by: string
          resolution_notes?: string | null
          room_id?: string | null
          status?: Database["public"]["Enums"]["issue_status"]
          time_noticed?: string | null
          title?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          house_id?: string
          id?: string
          location?: string
          photo_urls?: string[] | null
          priority?: Database["public"]["Enums"]["issue_priority"]
          reported_by?: string
          resolution_notes?: string | null
          room_id?: string | null
          status?: Database["public"]["Enums"]["issue_status"]
          time_noticed?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "issues_house_id_fkey"
            columns: ["house_id"]
            isOneToOne: false
            referencedRelation: "houses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      notice_acknowledgements: {
        Row: {
          acknowledged_at: string
          id: string
          notice_id: string
          user_id: string
        }
        Insert: {
          acknowledged_at?: string
          id?: string
          notice_id: string
          user_id: string
        }
        Update: {
          acknowledged_at?: string
          id?: string
          notice_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notice_acknowledgements_notice_id_fkey"
            columns: ["notice_id"]
            isOneToOne: false
            referencedRelation: "notices"
            referencedColumns: ["id"]
          },
        ]
      }
      notices: {
        Row: {
          content: string
          created_at: string
          created_by: string
          house_id: string | null
          id: string
          notice_type: Database["public"]["Enums"]["notice_type"]
          target_all_house: boolean
          target_user_id: string | null
          title: string
        }
        Insert: {
          content?: string
          created_at?: string
          created_by: string
          house_id?: string | null
          id?: string
          notice_type?: Database["public"]["Enums"]["notice_type"]
          target_all_house?: boolean
          target_user_id?: string | null
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          house_id?: string | null
          id?: string
          notice_type?: Database["public"]["Enums"]["notice_type"]
          target_all_house?: boolean
          target_user_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notices_house_id_fkey"
            columns: ["house_id"]
            isOneToOne: false
            referencedRelation: "houses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rooms: {
        Row: {
          area: number | null
          created_at: string
          house_id: string
          id: string
          name: string
          rent_amount: number | null
          rent_due_day: number | null
          tenant_id: string | null
          updated_at: string
          window_type: string
        }
        Insert: {
          area?: number | null
          created_at?: string
          house_id: string
          id?: string
          name: string
          rent_amount?: number | null
          rent_due_day?: number | null
          tenant_id?: string | null
          updated_at?: string
          window_type?: string
        }
        Update: {
          area?: number | null
          created_at?: string
          house_id?: string
          id?: string
          name?: string
          rent_amount?: number | null
          rent_due_day?: number | null
          tenant_id?: string | null
          updated_at?: string
          window_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_house_id_fkey"
            columns: ["house_id"]
            isOneToOne: false
            referencedRelation: "houses"
            referencedColumns: ["id"]
          },
        ]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_house_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "tenant"
      issue_priority: "emergency" | "urgent" | "normal"
      issue_status:
        | "submitted"
        | "acknowledged"
        | "in_progress"
        | "waiting_for_contractor"
        | "resolved"
      notice_type:
        | "rent_reminder"
        | "maintenance"
        | "inspection"
        | "policy_change"
        | "utility_shutdown"
        | "general"
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
      app_role: ["admin", "tenant"],
      issue_priority: ["emergency", "urgent", "normal"],
      issue_status: [
        "submitted",
        "acknowledged",
        "in_progress",
        "waiting_for_contractor",
        "resolved",
      ],
      notice_type: [
        "rent_reminder",
        "maintenance",
        "inspection",
        "policy_change",
        "utility_shutdown",
        "general",
      ],
    },
  },
} as const
