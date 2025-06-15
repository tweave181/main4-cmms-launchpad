export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      assets: {
        Row: {
          asset_tag: string | null
          category: string | null
          created_at: string
          created_by: string | null
          department_id: string | null
          description: string | null
          id: string
          location: string | null
          manufacturer: string | null
          model: string | null
          name: string
          notes: string | null
          priority: Database["public"]["Enums"]["asset_priority"]
          purchase_cost: number | null
          purchase_date: string | null
          serial_number: string | null
          status: Database["public"]["Enums"]["asset_status"]
          tenant_id: string
          updated_at: string
          updated_by: string | null
          warranty_expiry: string | null
        }
        Insert: {
          asset_tag?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          description?: string | null
          id?: string
          location?: string | null
          manufacturer?: string | null
          model?: string | null
          name: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["asset_priority"]
          purchase_cost?: number | null
          purchase_date?: string | null
          serial_number?: string | null
          status?: Database["public"]["Enums"]["asset_status"]
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
          warranty_expiry?: string | null
        }
        Update: {
          asset_tag?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          description?: string | null
          id?: string
          location?: string | null
          manufacturer?: string | null
          model?: string | null
          name?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["asset_priority"]
          purchase_cost?: number | null
          purchase_date?: string | null
          serial_number?: string | null
          status?: Database["public"]["Enums"]["asset_status"]
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
          warranty_expiry?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assets_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_parts: {
        Row: {
          category: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          linked_asset_type: string | null
          name: string
          quantity_in_stock: number
          reorder_threshold: number
          sku: string
          storage_locations: string[] | null
          tenant_id: string
          unit_of_measure: Database["public"]["Enums"]["part_unit"]
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          linked_asset_type?: string | null
          name: string
          quantity_in_stock?: number
          reorder_threshold?: number
          sku: string
          storage_locations?: string[] | null
          tenant_id: string
          unit_of_measure?: Database["public"]["Enums"]["part_unit"]
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          linked_asset_type?: string | null
          name?: string
          quantity_in_stock?: number
          reorder_threshold?: number
          sku?: string
          storage_locations?: string[] | null
          tenant_id?: string
          unit_of_measure?: Database["public"]["Enums"]["part_unit"]
          updated_at?: string
        }
        Relationships: []
      }
      part_asset_associations: {
        Row: {
          asset_id: string
          created_at: string
          id: string
          part_id: string
        }
        Insert: {
          asset_id: string
          created_at?: string
          id?: string
          part_id: string
        }
        Update: {
          asset_id?: string
          created_at?: string
          id?: string
          part_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "part_asset_associations_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "part_asset_associations_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "inventory_parts"
            referencedColumns: ["id"]
          },
        ]
      }
      part_work_order_usage: {
        Row: {
          created_at: string
          id: string
          part_id: string
          quantity_used: number
          work_order_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          part_id: string
          quantity_used: number
          work_order_id: string
        }
        Update: {
          created_at?: string
          id?: string
          part_id?: string
          quantity_used?: number
          work_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "part_work_order_usage_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "inventory_parts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "part_work_order_usage_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      pm_schedule_assets: {
        Row: {
          asset_id: string
          created_at: string
          id: string
          pm_schedule_id: string
        }
        Insert: {
          asset_id: string
          created_at?: string
          id?: string
          pm_schedule_id: string
        }
        Update: {
          asset_id?: string
          created_at?: string
          id?: string
          pm_schedule_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pm_schedule_assets_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pm_schedule_assets_pm_schedule_id_fkey"
            columns: ["pm_schedule_id"]
            isOneToOne: false
            referencedRelation: "preventive_maintenance_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      pm_schedule_checklist_items: {
        Row: {
          created_at: string
          id: string
          item_text: string
          item_type: string
          pm_schedule_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_text: string
          item_type?: string
          pm_schedule_id: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          item_text?: string
          item_type?: string
          pm_schedule_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pm_schedule_checklist_items_pm_schedule_id_fkey"
            columns: ["pm_schedule_id"]
            isOneToOne: false
            referencedRelation: "preventive_maintenance_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      preventive_maintenance_schedules: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string | null
          description: string | null
          frequency_type: string
          frequency_unit: string | null
          frequency_value: number
          id: string
          instructions: string | null
          is_active: boolean
          last_completed_date: string | null
          name: string
          next_due_date: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          frequency_type: string
          frequency_unit?: string | null
          frequency_value?: number
          id?: string
          instructions?: string | null
          is_active?: boolean
          last_completed_date?: string | null
          name: string
          next_due_date: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          frequency_type?: string
          frequency_unit?: string | null
          frequency_value?: number
          id?: string
          instructions?: string | null
          is_active?: boolean
          last_completed_date?: string | null
          name?: string
          next_due_date?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "preventive_maintenance_schedules_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "preventive_maintenance_schedules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "preventive_maintenance_schedules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_transactions: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          part_id: string
          quantity_after: number
          quantity_change: number
          reference_id: string | null
          reference_type: string | null
          transaction_type: Database["public"]["Enums"]["stock_transaction_type"]
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          part_id: string
          quantity_after: number
          quantity_change: number
          reference_id?: string | null
          reference_type?: string | null
          transaction_type: Database["public"]["Enums"]["stock_transaction_type"]
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          part_id?: string
          quantity_after?: number
          quantity_change?: number
          reference_id?: string | null
          reference_type?: string | null
          transaction_type?: Database["public"]["Enums"]["stock_transaction_type"]
        }
        Relationships: [
          {
            foreignKeyName: "stock_transactions_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "inventory_parts"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          role: Database["public"]["Enums"]["user_role"]
          tenant_id: string
          token: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          role: Database["public"]["Enums"]["user_role"]
          tenant_id: string
          token: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["user_role"]
          tenant_id?: string
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_invitations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          last_login: string | null
          name: string
          role: Database["public"]["Enums"]["user_role"]
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          last_login?: string | null
          name?: string
          role?: Database["public"]["Enums"]["user_role"]
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          last_login?: string | null
          name?: string
          role?: Database["public"]["Enums"]["user_role"]
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      work_order_comments: {
        Row: {
          comment: string
          comment_type: string
          created_at: string
          id: string
          user_id: string
          work_order_id: string
        }
        Insert: {
          comment: string
          comment_type?: string
          created_at?: string
          id?: string
          user_id: string
          work_order_id: string
        }
        Update: {
          comment?: string
          comment_type?: string
          created_at?: string
          id?: string
          user_id?: string
          work_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_order_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_order_comments_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      work_orders: {
        Row: {
          actual_cost: number | null
          actual_hours: number | null
          asset_id: string | null
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          estimated_cost: number | null
          estimated_hours: number | null
          id: string
          priority: string
          status: string
          tenant_id: string
          title: string
          updated_at: string
          work_type: string
        }
        Insert: {
          actual_cost?: number | null
          actual_hours?: number | null
          asset_id?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          estimated_cost?: number | null
          estimated_hours?: number | null
          id?: string
          priority?: string
          status?: string
          tenant_id: string
          title: string
          updated_at?: string
          work_type?: string
        }
        Update: {
          actual_cost?: number | null
          actual_hours?: number | null
          asset_id?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          estimated_cost?: number | null
          estimated_hours?: number | null
          id?: string
          priority?: string
          status?: string
          tenant_id?: string
          title?: string
          updated_at?: string
          work_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_orders_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invitation: {
        Args: { invitation_token: string }
        Returns: string
      }
      create_tenant_and_admin: {
        Args: {
          tenant_name: string
          tenant_slug: string
          user_id: string
          user_email: string
          first_name?: string
          last_name?: string
        }
        Returns: string
      }
      fix_missing_profiles: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_current_user_tenant_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_in_tenant: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      asset_priority: "low" | "medium" | "high" | "critical"
      asset_status: "active" | "inactive" | "maintenance" | "disposed"
      part_unit:
        | "pieces"
        | "kg"
        | "lbs"
        | "liters"
        | "gallons"
        | "meters"
        | "feet"
        | "hours"
      stock_transaction_type: "usage" | "restock" | "adjustment" | "initial"
      user_role: "admin" | "manager" | "technician" | "contractor"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      asset_priority: ["low", "medium", "high", "critical"],
      asset_status: ["active", "inactive", "maintenance", "disposed"],
      part_unit: [
        "pieces",
        "kg",
        "lbs",
        "liters",
        "gallons",
        "meters",
        "feet",
        "hours",
      ],
      stock_transaction_type: ["usage", "restock", "adjustment", "initial"],
      user_role: ["admin", "manager", "technician", "contractor"],
    },
  },
} as const
