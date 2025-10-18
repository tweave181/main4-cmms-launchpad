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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      address_audit_log: {
        Row: {
          action: string
          change_summary: string
          changed_by: string
          id: string
          record_id: string
          tenant_id: string
          timestamp: string
        }
        Insert: {
          action: string
          change_summary: string
          changed_by: string
          id?: string
          record_id: string
          tenant_id: string
          timestamp?: string
        }
        Update: {
          action?: string
          change_summary?: string
          changed_by?: string
          id?: string
          record_id?: string
          tenant_id?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "address_audit_log_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "address_audit_log_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "address_audit_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      address_contacts: {
        Row: {
          address_id: string
          created_at: string
          department: string | null
          email: string | null
          extension: string | null
          general_notes: string | null
          id: string
          is_primary: boolean
          job_title: string | null
          mobile: string | null
          name: string
          telephone: string | null
          tenant_id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          address_id: string
          created_at?: string
          department?: string | null
          email?: string | null
          extension?: string | null
          general_notes?: string | null
          id?: string
          is_primary?: boolean
          job_title?: string | null
          mobile?: string | null
          name: string
          telephone?: string | null
          tenant_id: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          address_id?: string
          created_at?: string
          department?: string | null
          email?: string | null
          extension?: string | null
          general_notes?: string | null
          id?: string
          is_primary?: boolean
          job_title?: string | null
          mobile?: string | null
          name?: string
          telephone?: string | null
          tenant_id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_address_contacts_address_id"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
        ]
      }
      addresses: {
        Row: {
          address_line_1: string
          address_line_2: string | null
          address_line_3: string | null
          company_id: string | null
          contact_name: string | null
          county_or_state: string | null
          created_at: string
          email: string | null
          id: string
          is_contact: boolean | null
          is_contractor: boolean | null
          is_manufacturer: boolean | null
          is_other: boolean | null
          is_supplier: boolean | null
          notes: string | null
          phone: string | null
          postcode: string | null
          tenant_id: string
          town_or_city: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address_line_1: string
          address_line_2?: string | null
          address_line_3?: string | null
          company_id?: string | null
          contact_name?: string | null
          county_or_state?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_contact?: boolean | null
          is_contractor?: boolean | null
          is_manufacturer?: boolean | null
          is_other?: boolean | null
          is_supplier?: boolean | null
          notes?: string | null
          phone?: string | null
          postcode?: string | null
          tenant_id: string
          town_or_city?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address_line_1?: string
          address_line_2?: string | null
          address_line_3?: string | null
          company_id?: string | null
          contact_name?: string | null
          county_or_state?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_contact?: boolean | null
          is_contractor?: boolean | null
          is_manufacturer?: boolean | null
          is_other?: boolean | null
          is_supplier?: boolean | null
          notes?: string | null
          phone?: string | null
          postcode?: string | null
          tenant_id?: string
          town_or_city?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "addresses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "addresses_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_addresses_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_details"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_tag_prefix_audit_log: {
        Row: {
          action: string
          change_summary: string
          changed_by: string
          id: string
          prefix_id: string
          tenant_id: string
          timestamp: string
        }
        Insert: {
          action: string
          change_summary: string
          changed_by: string
          id?: string
          prefix_id: string
          tenant_id: string
          timestamp?: string
        }
        Update: {
          action?: string
          change_summary?: string
          changed_by?: string
          id?: string
          prefix_id?: string
          tenant_id?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "asset_tag_prefix_audit_log_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_tag_prefix_audit_log_prefix_id_fkey"
            columns: ["prefix_id"]
            isOneToOne: false
            referencedRelation: "asset_tag_prefixes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_tag_prefix_audit_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_tag_prefixes: {
        Row: {
          category_id: string | null
          created_at: string
          description: string
          id: string
          number_code: string
          prefix_letter: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description: string
          id?: string
          number_code: string
          prefix_letter: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string
          id?: string
          number_code?: string
          prefix_letter?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "asset_tag_prefixes_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_tag_prefixes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      assets: {
        Row: {
          asset_level: number | null
          asset_tag: string | null
          asset_type: string | null
          category: string | null
          created_at: string
          created_by: string | null
          department_id: string | null
          description: string | null
          id: string
          id_service_contracts: string | null
          location: string | null
          location_id: string | null
          manufacturer: string | null
          manufacturer_company_id: string | null
          model: string | null
          name: string
          notes: string | null
          parent_asset_id: string | null
          priority: Database["public"]["Enums"]["asset_priority"]
          purchase_cost: number | null
          purchase_date: string | null
          serial_number: string | null
          service_contract_id: string | null
          status: Database["public"]["Enums"]["asset_status"]
          tenant_id: string
          updated_at: string
          updated_by: string | null
          warranty_expiry: string | null
        }
        Insert: {
          asset_level?: number | null
          asset_tag?: string | null
          asset_type?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          description?: string | null
          id?: string
          id_service_contracts?: string | null
          location?: string | null
          location_id?: string | null
          manufacturer?: string | null
          manufacturer_company_id?: string | null
          model?: string | null
          name: string
          notes?: string | null
          parent_asset_id?: string | null
          priority?: Database["public"]["Enums"]["asset_priority"]
          purchase_cost?: number | null
          purchase_date?: string | null
          serial_number?: string | null
          service_contract_id?: string | null
          status?: Database["public"]["Enums"]["asset_status"]
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
          warranty_expiry?: string | null
        }
        Update: {
          asset_level?: number | null
          asset_tag?: string | null
          asset_type?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          description?: string | null
          id?: string
          id_service_contracts?: string | null
          location?: string | null
          location_id?: string | null
          manufacturer?: string | null
          manufacturer_company_id?: string | null
          model?: string | null
          name?: string
          notes?: string | null
          parent_asset_id?: string | null
          priority?: Database["public"]["Enums"]["asset_priority"]
          purchase_cost?: number | null
          purchase_date?: string | null
          serial_number?: string | null
          service_contract_id?: string | null
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
            foreignKeyName: "assets_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_manufacturer_company_id_fkey"
            columns: ["manufacturer_company_id"]
            isOneToOne: false
            referencedRelation: "company_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_parent_asset_id_fkey"
            columns: ["parent_asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_service_contract_id_fkey"
            columns: ["service_contract_id"]
            isOneToOne: false
            referencedRelation: "service_contracts"
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
      audit_logs: {
        Row: {
          action: string
          changes: Json | null
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          ip: unknown | null
          tenant_id: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          changes?: Json | null
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          ip?: unknown | null
          tenant_id?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          changes?: Json | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          ip?: unknown | null
          tenant_id?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      categories: {
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
        Relationships: []
      }
      comment_status_options: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          sort_order: number
          status_color: string
          status_name: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          sort_order?: number
          status_color?: string
          status_name: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          sort_order?: number
          status_color?: string
          status_name?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      company_details: {
        Row: {
          company_description: string | null
          company_name: string
          company_website: string | null
          contact_name: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          phone: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          company_description?: string | null
          company_name: string
          company_website?: string | null
          contact_name?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          phone?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          company_description?: string | null
          company_name?: string
          company_website?: string | null
          contact_name?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          phone?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_details_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_details_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_asset_associations: {
        Row: {
          asset_id: string
          contract_id: string
          created_at: string
          id: string
        }
        Insert: {
          asset_id: string
          contract_id: string
          created_at?: string
          id?: string
        }
        Update: {
          asset_id?: string
          contract_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_asset_associations_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_asset_associations_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "service_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_lines: {
        Row: {
          contract_id: string
          cost_per_line: number | null
          created_at: string
          frequency: string | null
          id: string
          line_description: string
          sla: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          contract_id: string
          cost_per_line?: number | null
          created_at?: string
          frequency?: string | null
          id?: string
          line_description: string
          sla?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          contract_id?: string
          cost_per_line?: number | null
          created_at?: string
          frequency?: string | null
          id?: string
          line_description?: string
          sla?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_lines_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "service_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_lines_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_reminders: {
        Row: {
          contract_id: string
          created_at: string
          delivered: boolean
          id: string
          reminder_date: string
        }
        Insert: {
          contract_id: string
          created_at?: string
          delivered?: boolean
          id?: string
          reminder_date: string
        }
        Update: {
          contract_id?: string
          created_at?: string
          delivered?: boolean
          id?: string
          reminder_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_reminders_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "service_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_reminders_log: {
        Row: {
          contract_id: string
          created_at: string
          delivered_at: string
          delivery_method: string
          delivery_status: string | null
          email_delivery_log_id: string | null
          id: string
          reminder_date: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          contract_id: string
          created_at?: string
          delivered_at?: string
          delivery_method: string
          delivery_status?: string | null
          email_delivery_log_id?: string | null
          id?: string
          reminder_date?: string
          tenant_id: string
          user_id: string
        }
        Update: {
          contract_id?: string
          created_at?: string
          delivered_at?: string
          delivery_method?: string
          delivery_status?: string | null
          email_delivery_log_id?: string | null
          id?: string
          reminder_date?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_reminders_log_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "service_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_reminders_log_email_delivery_log_id_fkey"
            columns: ["email_delivery_log_id"]
            isOneToOne: false
            referencedRelation: "email_delivery_log"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_reminders_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_reminders_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      department_audit_log: {
        Row: {
          action: string
          change_summary: string
          changed_by: string
          id: string
          record_id: string
          tenant_id: string
          timestamp: string
        }
        Insert: {
          action: string
          change_summary: string
          changed_by: string
          id?: string
          record_id: string
          tenant_id: string
          timestamp?: string
        }
        Update: {
          action?: string
          change_summary?: string
          changed_by?: string
          id?: string
          record_id?: string
          tenant_id?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "department_audit_log_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "department_audit_log_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "department_audit_log_tenant_id_fkey"
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
      email_delivery_log: {
        Row: {
          clicked_at: string | null
          created_at: string | null
          delivered_at: string | null
          delivery_status: string | null
          error_message: string | null
          id: string
          opened_at: string | null
          provider_response: Json | null
          recipient_email: string
          recipient_user_id: string | null
          sent_at: string | null
          subject: string
          template_id: string | null
          tenant_id: string | null
        }
        Insert: {
          clicked_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          delivery_status?: string | null
          error_message?: string | null
          id?: string
          opened_at?: string | null
          provider_response?: Json | null
          recipient_email: string
          recipient_user_id?: string | null
          sent_at?: string | null
          subject: string
          template_id?: string | null
          tenant_id?: string | null
        }
        Update: {
          clicked_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          delivery_status?: string | null
          error_message?: string | null
          id?: string
          opened_at?: string | null
          provider_response?: Json | null
          recipient_email?: string
          recipient_user_id?: string | null
          sent_at?: string | null
          subject?: string
          template_id?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_delivery_log_recipient_user_id_fkey"
            columns: ["recipient_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_delivery_log_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_delivery_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          body_html: string
          body_text: string | null
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          subject: string
          template_name: string
          template_type: string
          tenant_id: string | null
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          body_html: string
          body_text?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          subject: string
          template_name: string
          template_type: string
          tenant_id?: string | null
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          body_html?: string
          body_text?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          subject?: string
          template_name?: string
          template_type?: string
          tenant_id?: string | null
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_templates_tenant_id_fkey"
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
          inventory_type: Database["public"]["Enums"]["inventory_type"]
          linked_asset_type: string | null
          name: string
          quantity_in_stock: number
          reorder_threshold: number
          sku: string
          spare_parts_category_id: string | null
          storage_locations: string[] | null
          supplier_id: string | null
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
          inventory_type?: Database["public"]["Enums"]["inventory_type"]
          linked_asset_type?: string | null
          name: string
          quantity_in_stock?: number
          reorder_threshold?: number
          sku: string
          spare_parts_category_id?: string | null
          storage_locations?: string[] | null
          supplier_id?: string | null
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
          inventory_type?: Database["public"]["Enums"]["inventory_type"]
          linked_asset_type?: string | null
          name?: string
          quantity_in_stock?: number
          reorder_threshold?: number
          sku?: string
          spare_parts_category_id?: string | null
          storage_locations?: string[] | null
          supplier_id?: string | null
          tenant_id?: string
          unit_of_measure?: Database["public"]["Enums"]["part_unit"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_inventory_parts_supplier"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_parts_spare_parts_category_id_fkey"
            columns: ["spare_parts_category_id"]
            isOneToOne: false
            referencedRelation: "spare_parts_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      job_title_audit_log: {
        Row: {
          action: string
          change_summary: string
          changed_by: string
          id: string
          record_id: string
          tenant_id: string
          timestamp: string
        }
        Insert: {
          action: string
          change_summary: string
          changed_by: string
          id?: string
          record_id: string
          tenant_id: string
          timestamp?: string
        }
        Update: {
          action?: string
          change_summary?: string
          changed_by?: string
          id?: string
          record_id?: string
          tenant_id?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_title_audit_log_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_title_audit_log_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "job_titles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_title_audit_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      job_titles: {
        Row: {
          created_at: string
          id: string
          tenant_id: string
          title_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          tenant_id: string
          title_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          tenant_id?: string
          title_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_titles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      location_levels: {
        Row: {
          code: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      locations: {
        Row: {
          created_at: string
          description: string | null
          id: string
          location_code: string
          location_level: string | null
          location_level_id: string | null
          name: string
          parent_location_id: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          location_code: string
          location_level?: string | null
          location_level_id?: string | null
          name: string
          parent_location_id?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          location_code?: string
          location_level?: string | null
          location_level_id?: string | null
          name?: string
          parent_location_id?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_locations_location_level_id"
            columns: ["location_level_id"]
            isOneToOne: false
            referencedRelation: "location_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "locations_parent_location_id_fkey"
            columns: ["parent_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "locations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_jobs: {
        Row: {
          asset_id: string | null
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string
          id: string
          instructions: string | null
          name: string
          pm_schedule_id: string | null
          priority: string
          status: string
          tenant_id: string
          updated_at: string
          work_order_id: string | null
        }
        Insert: {
          asset_id?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date: string
          id?: string
          instructions?: string | null
          name: string
          pm_schedule_id?: string | null
          priority?: string
          status?: string
          tenant_id: string
          updated_at?: string
          work_order_id?: string | null
        }
        Update: {
          asset_id?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string
          id?: string
          instructions?: string | null
          name?: string
          pm_schedule_id?: string | null
          priority?: string
          status?: string
          tenant_id?: string
          updated_at?: string
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_maintenance_jobs_tenant"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_jobs_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_jobs_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_jobs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_jobs_pm_schedule_id_fkey"
            columns: ["pm_schedule_id"]
            isOneToOne: false
            referencedRelation: "preventive_maintenance_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_jobs_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          contract_reminder_days: number[] | null
          contract_reminders_enabled: boolean | null
          created_at: string | null
          email_frequency: string | null
          id: string
          maintenance_notifications_enabled: boolean | null
          security_alerts_enabled: boolean | null
          setting_type: string
          system_notifications_enabled: boolean | null
          tenant_id: string | null
          toast_duration: number | null
          toast_notifications_enabled: boolean | null
          toast_position: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          contract_reminder_days?: number[] | null
          contract_reminders_enabled?: boolean | null
          created_at?: string | null
          email_frequency?: string | null
          id?: string
          maintenance_notifications_enabled?: boolean | null
          security_alerts_enabled?: boolean | null
          setting_type: string
          system_notifications_enabled?: boolean | null
          tenant_id?: string | null
          toast_duration?: number | null
          toast_notifications_enabled?: boolean | null
          toast_position?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          contract_reminder_days?: number[] | null
          contract_reminders_enabled?: boolean | null
          created_at?: string | null
          email_frequency?: string | null
          id?: string
          maintenance_notifications_enabled?: boolean | null
          security_alerts_enabled?: boolean | null
          setting_type?: string
          system_notifications_enabled?: boolean | null
          tenant_id?: string | null
          toast_duration?: number | null
          toast_notifications_enabled?: boolean | null
          toast_position?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      part_asset_associations: {
        Row: {
          asset_id: string
          created_at: string
          id: string
          part_id: string
          quantity_required: number
        }
        Insert: {
          asset_id: string
          created_at?: string
          id?: string
          part_id: string
          quantity_required?: number
        }
        Update: {
          asset_id?: string
          created_at?: string
          id?: string
          part_id?: string
          quantity_required?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_part_asset_associations_asset_id"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_part_asset_associations_part_id"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "inventory_parts"
            referencedColumns: ["id"]
          },
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
      permissions: {
        Row: {
          action: string
          created_at: string
          description: string | null
          id: string
          resource: string
        }
        Insert: {
          action: string
          created_at?: string
          description?: string | null
          id?: string
          resource: string
        }
        Update: {
          action?: string
          created_at?: string
          description?: string | null
          id?: string
          resource?: string
        }
        Relationships: []
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
      program_settings: {
        Row: {
          country: string | null
          created_at: string
          currency: string | null
          date_format: string | null
          default_fiscal_year_start: string | null
          email_from_address: string | null
          email_from_name: string | null
          email_provider: string | null
          email_signature: string | null
          id: string
          language: string | null
          logo_url: string | null
          organization_name: string | null
          smtp_host: string | null
          smtp_port: number | null
          smtp_secure: boolean | null
          smtp_username: string | null
          system_contact_email: string | null
          tenant_id: string
          timezone: string | null
          updated_at: string
        }
        Insert: {
          country?: string | null
          created_at?: string
          currency?: string | null
          date_format?: string | null
          default_fiscal_year_start?: string | null
          email_from_address?: string | null
          email_from_name?: string | null
          email_provider?: string | null
          email_signature?: string | null
          id?: string
          language?: string | null
          logo_url?: string | null
          organization_name?: string | null
          smtp_host?: string | null
          smtp_port?: number | null
          smtp_secure?: boolean | null
          smtp_username?: string | null
          system_contact_email?: string | null
          tenant_id: string
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          country?: string | null
          created_at?: string
          currency?: string | null
          date_format?: string | null
          default_fiscal_year_start?: string | null
          email_from_address?: string | null
          email_from_name?: string | null
          email_provider?: string | null
          email_signature?: string | null
          id?: string
          language?: string | null
          logo_url?: string | null
          organization_name?: string | null
          smtp_host?: string | null
          smtp_port?: number | null
          smtp_secure?: boolean | null
          smtp_username?: string | null
          system_contact_email?: string | null
          tenant_id?: string
          timezone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          permission_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          permission_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          permission_id?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      service_contracts: {
        Row: {
          address_id: string | null
          contract_cost: number | null
          contract_title: string
          created_at: string
          description: string | null
          email_reminder_enabled: boolean
          end_date: string
          id: string
          reminder_days_before: number | null
          start_date: string
          status: Database["public"]["Enums"]["contract_status"]
          tenant_id: string
          updated_at: string
          vendor_company_id: string | null
          vendor_name: string
          visit_count: number | null
        }
        Insert: {
          address_id?: string | null
          contract_cost?: number | null
          contract_title: string
          created_at?: string
          description?: string | null
          email_reminder_enabled?: boolean
          end_date: string
          id?: string
          reminder_days_before?: number | null
          start_date: string
          status?: Database["public"]["Enums"]["contract_status"]
          tenant_id: string
          updated_at?: string
          vendor_company_id?: string | null
          vendor_name: string
          visit_count?: number | null
        }
        Update: {
          address_id?: string | null
          contract_cost?: number | null
          contract_title?: string
          created_at?: string
          description?: string | null
          email_reminder_enabled?: boolean
          end_date?: string
          id?: string
          reminder_days_before?: number | null
          start_date?: string
          status?: Database["public"]["Enums"]["contract_status"]
          tenant_id?: string
          updated_at?: string
          vendor_company_id?: string | null
          vendor_name?: string
          visit_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "service_contracts_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_contracts_vendor_company_id_fkey"
            columns: ["vendor_company_id"]
            isOneToOne: false
            referencedRelation: "company_details"
            referencedColumns: ["id"]
          },
        ]
      }
      spare_parts_categories: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "spare_parts_categories_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
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
      user_permission_overrides: {
        Row: {
          created_at: string
          created_by: string | null
          granted: boolean
          id: string
          permission_id: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          granted?: boolean
          id?: string
          permission_id: string
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          granted?: boolean
          id?: string
          permission_id?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_permission_overrides_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          department_id: string | null
          email: string
          employment_status:
            | Database["public"]["Enums"]["employment_status"]
            | null
          id: string
          job_title_id: string | null
          last_login: string | null
          name: string
          phone_number: string | null
          role: Database["public"]["Enums"]["user_role"]
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department_id?: string | null
          email: string
          employment_status?:
            | Database["public"]["Enums"]["employment_status"]
            | null
          id: string
          job_title_id?: string | null
          last_login?: string | null
          name?: string
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department_id?: string | null
          email?: string
          employment_status?:
            | Database["public"]["Enums"]["employment_status"]
            | null
          id?: string
          job_title_id?: string | null
          last_login?: string | null
          name?: string
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_job_title_id_fkey"
            columns: ["job_title_id"]
            isOneToOne: false
            referencedRelation: "job_titles"
            referencedColumns: ["id"]
          },
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
          comment_status: Database["public"]["Enums"]["comment_status"] | null
          comment_status_name: string | null
          comment_time_closed: string | null
          comment_time_created: string | null
          comment_time_worked: string | null
          comment_type: string
          created_at: string
          id: string
          user_id: string
          work_order_id: string
        }
        Insert: {
          comment: string
          comment_status?: Database["public"]["Enums"]["comment_status"] | null
          comment_status_name?: string | null
          comment_time_closed?: string | null
          comment_time_created?: string | null
          comment_time_worked?: string | null
          comment_type?: string
          created_at?: string
          id?: string
          user_id: string
          work_order_id: string
        }
        Update: {
          comment?: string
          comment_status?: Database["public"]["Enums"]["comment_status"] | null
          comment_status_name?: string | null
          comment_time_closed?: string | null
          comment_time_created?: string | null
          comment_time_worked?: string | null
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
          assigned_to_contractor: boolean | null
          completed_at: string | null
          contractor_company_id: string | null
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
          work_order_number: string
          work_type: string
        }
        Insert: {
          actual_cost?: number | null
          actual_hours?: number | null
          asset_id?: string | null
          assigned_to?: string | null
          assigned_to_contractor?: boolean | null
          completed_at?: string | null
          contractor_company_id?: string | null
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
          work_order_number: string
          work_type?: string
        }
        Update: {
          actual_cost?: number | null
          actual_hours?: number | null
          asset_id?: string | null
          assigned_to?: string | null
          assigned_to_contractor?: boolean | null
          completed_at?: string | null
          contractor_company_id?: string | null
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
          work_order_number?: string
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
            foreignKeyName: "work_orders_contractor_company_id_fkey"
            columns: ["contractor_company_id"]
            isOneToOne: false
            referencedRelation: "company_details"
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
      asset_hierarchy: {
        Row: {
          asset_level: number | null
          asset_type: string | null
          depth: number | null
          full_path: string | null
          id: string | null
          name: string | null
          parent_asset_id: string | null
          path: string[] | null
          tenant_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      accept_invitation: {
        Args: { invitation_token: string }
        Returns: string
      }
      check_contract_reminders: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_tenant_and_admin: {
        Args: {
          first_name?: string
          last_name?: string
          tenant_name: string
          tenant_slug: string
          user_email: string
          user_id: string
        }
        Returns: string
      }
      ensure_unique_location_code: {
        Args: { p_existing_code?: string; p_name: string; p_tenant_id: string }
        Returns: string
      }
      fix_missing_profiles: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_location_code: {
        Args: { location_name: string }
        Returns: string
      }
      generate_maintenance_jobs_from_pm_schedules: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_work_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_tenant_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      insert_default_location_levels: {
        Args: { p_tenant_id: string }
        Returns: undefined
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
      is_system_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      trigger_contract_reminder_emails: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      user_has_any_permission: {
        Args: { _permissions: Json; _user_id: string }
        Returns: boolean
      }
      user_has_permission: {
        Args: { _action: string; _resource: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "system_admin"
        | "admin"
        | "manager"
        | "technician"
        | "contractor"
      asset_priority: "low" | "medium" | "high" | "critical"
      asset_status: "active" | "inactive" | "maintenance" | "disposed"
      comment_status: "open" | "closed"
      contract_status: "Active" | "Expired" | "Terminated" | "Pending Review"
      employment_status: "Full Time" | "Part Time" | "Bank Staff" | "Contractor"
      inventory_type:
        | "spare_parts"
        | "consumables"
        | "tools"
        | "supplies"
        | "materials"
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
      app_role: [
        "system_admin",
        "admin",
        "manager",
        "technician",
        "contractor",
      ],
      asset_priority: ["low", "medium", "high", "critical"],
      asset_status: ["active", "inactive", "maintenance", "disposed"],
      comment_status: ["open", "closed"],
      contract_status: ["Active", "Expired", "Terminated", "Pending Review"],
      employment_status: ["Full Time", "Part Time", "Bank Staff", "Contractor"],
      inventory_type: [
        "spare_parts",
        "consumables",
        "tools",
        "supplies",
        "materials",
      ],
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
