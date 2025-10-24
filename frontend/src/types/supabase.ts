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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'leave_request' | 'leave_approved' | 'leave_rejected' | 'leave_cancelled' | 'system' | 'reminder'
          title: string
          message: string
          data: Json | null
          read: boolean
          created_at: string
          read_at: string | null
          related_entity_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: 'leave_request' | 'leave_approved' | 'leave_rejected' | 'leave_cancelled' | 'system' | 'reminder'
          title: string
          message: string
          data?: Json | null
          read?: boolean
          created_at?: string
          read_at?: string | null
          related_entity_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'leave_request' | 'leave_approved' | 'leave_rejected' | 'leave_cancelled' | 'system' | 'reminder'
          title?: string
          message?: string
          data?: Json | null
          read?: boolean
          created_at?: string
          read_at?: string | null
          related_entity_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          user_id: string
          email_notifications: boolean
          in_app_notifications: boolean
          leave_request_notifications: boolean
          leave_approval_notifications: boolean
          system_update_notifications: boolean
          reminder_notifications: boolean
          updated_at: string
        }
        Insert: {
          user_id: string
          email_notifications?: boolean
          in_app_notifications?: boolean
          leave_request_notifications?: boolean
          leave_approval_notifications?: boolean
          system_update_notifications?: boolean
          reminder_notifications?: boolean
          updated_at?: string
        }
        Update: {
          user_id?: string
          email_notifications?: boolean
          in_app_notifications?: boolean
          leave_request_notifications?: boolean
          leave_approval_notifications?: boolean
          system_update_notifications?: boolean
          reminder_notifications?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          id: string
          title: string
          description: string | null
          start_date: string
          end_date: string
          event_type: 'leave' | 'holiday' | 'meeting' | 'personal'
          color: string | null
          location: string | null
          employee_id: string
          leave_request_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          start_date: string
          end_date: string
          event_type: 'leave' | 'holiday' | 'meeting' | 'personal'
          color?: string | null
          location?: string | null
          employee_id: string
          leave_request_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          start_date?: string
          end_date?: string
          event_type?: 'leave' | 'holiday' | 'meeting' | 'personal'
          color?: string | null
          location?: string | null
          employee_id?: string
          leave_request_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_leave_request_id_fkey"
            columns: ["leave_request_id"]
            isOneToOne: false
            referencedRelation: "leave_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          id: string
          title: string
          description: string | null
          employee_id: string
          category_id: string
          tags: Json | null
          is_confidential: boolean
          storage_path: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          employee_id: string
          category_id: string
          tags?: Json | null
          is_confidential?: boolean
          storage_path?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          employee_id?: string
          category_id?: string
          tags?: Json | null
          is_confidential?: boolean
          storage_path?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "document_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      document_categories: {
        Row: {
          id: string
          name: string
          is_active: boolean
        }
        Insert: {
          id?: string
          name: string
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          is_active?: boolean
        }
        Relationships: []
      }
      departments: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      company_documents: {
        Row: {
          created_at: string
          expiry_date: string | null
          id: string
          metadata: Json | null
          name: string
          storage_path: string
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          expiry_date?: string | null
          id?: string
          metadata?: Json | null
          name: string
          storage_path: string
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          expiry_date?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          storage_path?: string
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          created_at: string
          department: string | null
          email: string
          first_name: string | null
          id: string
          is_active: boolean
          last_name: string | null
          photo_url: string | null
          role: Database["public"]["Enums"]["user_role"]
          supabase_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          email: string
          first_name?: string | null
          id?: string
          is_active?: boolean
          last_name?: string | null
          photo_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          supabase_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string | null
          email?: string
          first_name?: string | null
          id?: string
          is_active?: boolean
          last_name?: string | null
          photo_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          supabase_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      leave_balances: {
        Row: {
          created_at: string
          employee_id: string
          id: string
          leave_type_id: string
          total_days: number
          updated_at: string
          used_days: number
          year: number
        }
        Insert: {
          created_at?: string
          employee_id: string
          id?: string
          leave_type_id: string
          total_days?: number
          updated_at?: string
          used_days?: number
          year: number
        }
        Update: {
          created_at?: string
          employee_id?: string
          id?: string
          leave_type_id?: string
          total_days?: number
          updated_at?: string
          used_days?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "leave_balances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_balances_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "leave_types"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_types: {
        Row: {
          created_at: string
          default_allocation_days: number
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_allocation_days?: number
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_allocation_days?: number
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      leaves: {
        Row: {
          approved_at: string | null
          approver_id: string | null
          created_at: string
          days_count: number
          end_date: string
          id: string
          leave_type_id: string
          reason: string | null
          requester_id: string
          start_date: string
          status: Database["public"]["Enums"]["leave_status"]
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approver_id?: string | null
          created_at?: string
          days_count: number
          end_date: string
          id?: string
          leave_type_id: string
          reason?: string | null
          requester_id: string
          start_date: string
          status?: Database["public"]["Enums"]["leave_status"]
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approver_id?: string | null
          created_at?: string
          days_count?: number
          end_date?: string
          id?: string
          leave_type_id?: string
          reason?: string | null
          requester_id?: string
          start_date?: string
          status?: Database["public"]["Enums"]["leave_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leaves_approver_id_fkey"
            columns: ["approver_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leaves_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "leave_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leaves_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_business_days: {
        Args: { end_date: string; start_date: string }
        Returns: number
      }
      check_overlapping_leaves: {
        Args: {
          p_employee_id: string
          p_end_date: string
          p_exclude_leave_id?: string
          p_start_date: string
        }
        Returns: boolean
      }
      get_available_leave_days: {
        Args: {
          p_employee_id: string
          p_leave_type_id: string
          p_year?: number
        }
        Returns: number
      }
      get_department_leave_calendar: {
        Args: { p_department: string; p_end_date: string; p_start_date: string }
        Returns: {
          employee_name: string
          end_date: string
          leave_type_name: string
          reason: string
          start_date: string
          status: Database["public"]["Enums"]["leave_status"]
        }[]
      }
      get_employee_id_by_supabase_uid: {
        Args: { user_uuid: string }
        Returns: string
      }
      get_employee_leave_summary: {
        Args: { p_employee_id: string; p_year?: number }
        Returns: {
          available_days: number
          leave_type_name: string
          total_days: number
          used_days: number
        }[]
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_manager_of_department: {
        Args: { department_name: string }
        Returns: boolean
      }
      log_audit_event: {
        Args: {
          p_action: string
          p_metadata?: Json
          p_new_values?: Json
          p_old_values?: Json
          p_record_id: string
          p_table_name: string
        }
        Returns: undefined
      }
    }
    Enums: {
      leave_status: "pending" | "approved" | "rejected" | "cancelled"
      user_role: "employee" | "manager" | "admin" | "hr"
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
    : never,
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
      leave_status: ["pending", "approved", "rejected", "cancelled"],
      user_role: ["employee", "manager", "admin", "hr"],
    },
  },
} as const