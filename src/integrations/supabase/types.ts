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
      address_audit_log: {
        Row: {
          action: string
          address_id: string | null
          change_summary: string | null
          changed_by: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
          tenant_id: string | null
          timestamp: string
        }
        Insert: {
          action: string
          address_id?: string | null
          change_summary?: string | null
          changed_by?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          tenant_id?: string | null
          timestamp?: string
        }
        Update: {
          action?: string
          address_id?: string | null
          change_summary?: string | null
          changed_by?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          tenant_id?: string | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "address_audit_log_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "address_audit_log_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
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
          email: string | null
          id: string
          is_primary: boolean | null
          job_title: string | null
          mobile: string | null
          name: string
          notes: string | null
          phone: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          address_id: string
          created_at?: string
          email?: string | null
          id?: string
          is_primary?: boolean | null
          job_title?: string | null
          mobile?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          address_id?: string
          created_at?: string
          email?: string | null
          id?: string
          is_primary?: boolean | null
          job_title?: string | null
          mobile?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "address_contacts_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "address_contacts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
        ]
      }
      asset_tag_prefix_audit_log: {
        Row: {
          action: string
          created_at: string
          id: string
          new_values: Json | null
          old_values: Json | null
          performed_by: string | null
          prefix_id: string | null
          tenant_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          performed_by?: string | null
          prefix_id?: string | null
          tenant_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          performed_by?: string | null
          prefix_id?: string | null
          tenant_id?: string | null
        }
        Relationships: [
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
          description: string | null
          id: string
          number_code: string
          prefix_letter: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          number_code: string
          prefix_letter: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
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
          asset_level: number
          asset_tag: string | null
          asset_type: string
          barcode_printed_at: string | null
          category: string | null
          created_at: string
          created_by: string | null
          department_id: string | null
          description: string | null
          id: string
          location_id: string | null
          manufacturer: string | null
          manufacturer_company_id: string | null
          model: string | null
          name: string
          notes: string | null
          parent_asset_id: string | null
          priority: string
          purchase_cost: number | null
          purchase_date: string | null
          serial_number: string | null
          service_contract_id: string | null
          status: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
          warranty_expiry: string | null
        }
        Insert: {
          asset_level?: number
          asset_tag?: string | null
          asset_type?: string
          barcode_printed_at?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          description?: string | null
          id?: string
          location_id?: string | null
          manufacturer?: string | null
          manufacturer_company_id?: string | null
          model?: string | null
          name: string
          notes?: string | null
          parent_asset_id?: string | null
          priority?: string
          purchase_cost?: number | null
          purchase_date?: string | null
          serial_number?: string | null
          service_contract_id?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
          warranty_expiry?: string | null
        }
        Update: {
          asset_level?: number
          asset_tag?: string | null
          asset_type?: string
          barcode_printed_at?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          description?: string | null
          id?: string
          location_id?: string | null
          manufacturer?: string | null
          manufacturer_company_id?: string | null
          model?: string | null
          name?: string
          notes?: string | null
          parent_asset_id?: string | null
          priority?: string
          purchase_cost?: number | null
          purchase_date?: string | null
          serial_number?: string | null
          service_contract_id?: string | null
          status?: string
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
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      business_types: {
        Row: {
          category: string | null
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
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
        Relationships: [
          {
            foreignKeyName: "categories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_item_templates: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          image_name: string | null
          image_url: string | null
          is_active: boolean | null
          item_text: string
          item_type: string
          safety_critical: boolean | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image_name?: string | null
          image_url?: string | null
          is_active?: boolean | null
          item_text: string
          item_type?: string
          safety_critical?: boolean | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image_name?: string | null
          image_url?: string | null
          is_active?: boolean | null
          item_text?: string
          item_type?: string
          safety_critical?: boolean | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_item_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_record_lines: {
        Row: {
          checklist_line_id: string
          checklist_record_id: string
          created_at: string
          id: string
          sort_order: number | null
        }
        Insert: {
          checklist_line_id: string
          checklist_record_id: string
          created_at?: string
          id?: string
          sort_order?: number | null
        }
        Update: {
          checklist_line_id?: string
          checklist_record_id?: string
          created_at?: string
          id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "checklist_record_lines_checklist_line_id_fkey"
            columns: ["checklist_line_id"]
            isOneToOne: false
            referencedRelation: "checklist_item_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_record_lines_checklist_record_id_fkey"
            columns: ["checklist_record_id"]
            isOneToOne: false
            referencedRelation: "checklist_records"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_records: {
        Row: {
          asset_type: string | null
          created_at: string
          created_by: string | null
          description: string | null
          frequency_type: string | null
          id: string
          is_active: boolean | null
          name: string
          tenant_id: string
          updated_at: string
          work_timing: string | null
          working_days: Json | null
        }
        Insert: {
          asset_type?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          frequency_type?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          tenant_id: string
          updated_at?: string
          work_timing?: string | null
          working_days?: Json | null
        }
        Update: {
          asset_type?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          frequency_type?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          tenant_id?: string
          updated_at?: string
          work_timing?: string | null
          working_days?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "checklist_records_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_status_options: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          sort_order: number | null
          status_color: string
          status_name: string
          tenant_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          status_color?: string
          status_name: string
          tenant_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          status_color?: string
          status_name?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comment_status_options_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      company_details: {
        Row: {
          company_name: string
          company_type: string | null
          created_at: string
          email: string | null
          id: string
          is_contractor: boolean | null
          is_manufacturer: boolean | null
          is_supplier: boolean | null
          notes: string | null
          phone: string | null
          tenant_id: string
          updated_at: string
          website: string | null
        }
        Insert: {
          company_name: string
          company_type?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_contractor?: boolean | null
          is_manufacturer?: boolean | null
          is_supplier?: boolean | null
          notes?: string | null
          phone?: string | null
          tenant_id: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          company_name?: string
          company_type?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_contractor?: boolean | null
          is_manufacturer?: boolean | null
          is_supplier?: boolean | null
          notes?: string | null
          phone?: string | null
          tenant_id?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: [
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
            foreignKeyName: "contract_asset_associations_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "service_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_caa_asset"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_lines: {
        Row: {
          contract_id: string
          cost_per_line: number | null
          created_at: string
          description: string
          frequency: string | null
          id: string
          line_description: string | null
          quantity: number | null
          sla: string | null
          total_cost: number | null
          unit_cost: number | null
          updated_at: string
        }
        Insert: {
          contract_id: string
          cost_per_line?: number | null
          created_at?: string
          description: string
          frequency?: string | null
          id?: string
          line_description?: string | null
          quantity?: number | null
          sla?: string | null
          total_cost?: number | null
          unit_cost?: number | null
          updated_at?: string
        }
        Update: {
          contract_id?: string
          cost_per_line?: number | null
          created_at?: string
          description?: string
          frequency?: string | null
          id?: string
          line_description?: string | null
          quantity?: number | null
          sla?: string | null
          total_cost?: number | null
          unit_cost?: number | null
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
        ]
      }
      contract_reminders: {
        Row: {
          contract_id: string
          created_at: string
          id: string
          is_sent: boolean | null
          reminder_date: string
          reminder_type: string | null
        }
        Insert: {
          contract_id: string
          created_at?: string
          id?: string
          is_sent?: boolean | null
          reminder_date: string
          reminder_type?: string | null
        }
        Update: {
          contract_id?: string
          created_at?: string
          id?: string
          is_sent?: boolean | null
          reminder_date?: string
          reminder_type?: string | null
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
          contract_id: string | null
          created_at: string
          id: string
          reminder_type: string | null
          sent_at: string | null
          tenant_id: string | null
        }
        Insert: {
          contract_id?: string | null
          created_at?: string
          id?: string
          reminder_type?: string | null
          sent_at?: string | null
          tenant_id?: string | null
        }
        Update: {
          contract_id?: string | null
          created_at?: string
          id?: string
          reminder_type?: string | null
          sent_at?: string | null
          tenant_id?: string | null
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
            foreignKeyName: "contract_reminders_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          department_id: string | null
          email: string | null
          id: string
          is_active: boolean | null
          job_title_id: string | null
          name: string
          password_hash: string | null
          phone: string | null
          phone_extension: string | null
          reports_to: string | null
          tenant_id: string
          updated_at: string
          work_area_id: string | null
        }
        Insert: {
          created_at?: string
          department_id?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          job_title_id?: string | null
          name: string
          password_hash?: string | null
          phone?: string | null
          phone_extension?: string | null
          reports_to?: string | null
          tenant_id: string
          updated_at?: string
          work_area_id?: string | null
        }
        Update: {
          created_at?: string
          department_id?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          job_title_id?: string | null
          name?: string
          password_hash?: string | null
          phone?: string | null
          phone_extension?: string | null
          reports_to?: string | null
          tenant_id?: string
          updated_at?: string
          work_area_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_job_title_id_fkey"
            columns: ["job_title_id"]
            isOneToOne: false
            referencedRelation: "job_titles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_reports_to_fkey"
            columns: ["reports_to"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_work_area_id_fkey"
            columns: ["work_area_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      department_audit_log: {
        Row: {
          action: string
          change_summary: string | null
          changed_by: string | null
          department_id: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
          tenant_id: string | null
          timestamp: string
        }
        Insert: {
          action: string
          change_summary?: string | null
          changed_by?: string | null
          department_id?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          tenant_id?: string | null
          timestamp?: string
        }
        Update: {
          action?: string
          change_summary?: string | null
          changed_by?: string | null
          department_id?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          tenant_id?: string | null
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
            foreignKeyName: "department_audit_log_department_id_fkey"
            columns: ["department_id"]
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
          created_at: string
          error_message: string | null
          id: string
          recipient_email: string | null
          sent_at: string | null
          status: string | null
          subject: string | null
          template_id: string | null
          tenant_id: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          recipient_email?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          template_id?: string | null
          tenant_id?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          recipient_email?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          template_id?: string | null
          tenant_id?: string | null
        }
        Relationships: [
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
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          subject: string
          template_name: string
          template_type: string
          tenant_id: string
          updated_at: string
          variables: string[] | null
        }
        Insert: {
          body_html: string
          body_text?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          subject: string
          template_name: string
          template_type: string
          tenant_id: string
          updated_at?: string
          variables?: string[] | null
        }
        Update: {
          body_html?: string
          body_text?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          subject?: string
          template_name?: string
          template_type?: string
          tenant_id?: string
          updated_at?: string
          variables?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      frequency_types: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "frequency_types_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_parts: {
        Row: {
          barcode_printed_at: string | null
          category: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          inventory_type: string
          linked_asset_type: string | null
          name: string
          quantity_in_stock: number
          reorder_threshold: number
          sku: string
          spare_parts_category_id: string | null
          storage_locations: string[] | null
          supplier_id: string | null
          tenant_id: string
          unit_cost: number | null
          unit_of_measure: string
          updated_at: string
        }
        Insert: {
          barcode_printed_at?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          inventory_type?: string
          linked_asset_type?: string | null
          name: string
          quantity_in_stock?: number
          reorder_threshold?: number
          sku: string
          spare_parts_category_id?: string | null
          storage_locations?: string[] | null
          supplier_id?: string | null
          tenant_id: string
          unit_cost?: number | null
          unit_of_measure?: string
          updated_at?: string
        }
        Update: {
          barcode_printed_at?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          inventory_type?: string
          linked_asset_type?: string | null
          name?: string
          quantity_in_stock?: number
          reorder_threshold?: number
          sku?: string
          spare_parts_category_id?: string | null
          storage_locations?: string[] | null
          supplier_id?: string | null
          tenant_id?: string
          unit_cost?: number | null
          unit_of_measure?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_parts_spare_parts_category_id_fkey"
            columns: ["spare_parts_category_id"]
            isOneToOne: false
            referencedRelation: "spare_parts_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_parts_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_parts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      job_title_audit_log: {
        Row: {
          action: string
          change_summary: string | null
          changed_by: string | null
          id: string
          job_title_id: string | null
          new_values: Json | null
          old_values: Json | null
          tenant_id: string | null
          timestamp: string
        }
        Insert: {
          action: string
          change_summary?: string | null
          changed_by?: string | null
          id?: string
          job_title_id?: string | null
          new_values?: Json | null
          old_values?: Json | null
          tenant_id?: string | null
          timestamp?: string
        }
        Update: {
          action?: string
          change_summary?: string | null
          changed_by?: string | null
          id?: string
          job_title_id?: string | null
          new_values?: Json | null
          old_values?: Json | null
          tenant_id?: string | null
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
            foreignKeyName: "job_title_audit_log_job_title_id_fkey"
            columns: ["job_title_id"]
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
          description: string | null
          id: string
          tenant_id: string
          title_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          tenant_id: string
          title_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
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
          is_active: boolean | null
          name: string
          sort_order: number | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "location_levels_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          created_at: string
          department_id: string | null
          description: string | null
          id: string
          location_code: string | null
          location_level_id: string | null
          name: string
          parent_location_id: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department_id?: string | null
          description?: string | null
          id?: string
          location_code?: string | null
          location_level_id?: string | null
          name: string
          parent_location_id?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department_id?: string | null
          description?: string | null
          id?: string
          location_code?: string | null
          location_level_id?: string | null
          name?: string
          parent_location_id?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "locations_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "locations_location_level_id_fkey"
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
            foreignKeyName: "maintenance_jobs_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
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
            foreignKeyName: "maintenance_jobs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
          created_at: string
          email_frequency: string | null
          id: string
          low_stock_alert_days: number[] | null
          low_stock_alerts_enabled: boolean | null
          maintenance_notifications_enabled: boolean | null
          security_alerts_enabled: boolean | null
          setting_type: string
          system_notifications_enabled: boolean | null
          tenant_id: string
          toast_duration: number | null
          toast_notifications_enabled: boolean | null
          toast_position: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          contract_reminder_days?: number[] | null
          contract_reminders_enabled?: boolean | null
          created_at?: string
          email_frequency?: string | null
          id?: string
          low_stock_alert_days?: number[] | null
          low_stock_alerts_enabled?: boolean | null
          maintenance_notifications_enabled?: boolean | null
          security_alerts_enabled?: boolean | null
          setting_type?: string
          system_notifications_enabled?: boolean | null
          tenant_id: string
          toast_duration?: number | null
          toast_notifications_enabled?: boolean | null
          toast_position?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          contract_reminder_days?: number[] | null
          contract_reminders_enabled?: boolean | null
          created_at?: string
          email_frequency?: string | null
          id?: string
          low_stock_alert_days?: number[] | null
          low_stock_alerts_enabled?: boolean | null
          maintenance_notifications_enabled?: boolean | null
          security_alerts_enabled?: boolean | null
          setting_type?: string
          system_notifications_enabled?: boolean | null
          tenant_id?: string
          toast_duration?: number | null
          toast_notifications_enabled?: boolean | null
          toast_position?: string | null
          updated_at?: string
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
        ]
      }
      part_asset_associations: {
        Row: {
          asset_id: string
          created_at: string
          id: string
          part_id: string
          quantity_required: number | null
        }
        Insert: {
          asset_id: string
          created_at?: string
          id?: string
          part_id: string
          quantity_required?: number | null
        }
        Update: {
          asset_id?: string
          created_at?: string
          id?: string
          part_id?: string
          quantity_required?: number | null
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
          created_by: string | null
          id: string
          part_id: string
          quantity_used: number
          work_order_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          part_id: string
          quantity_used?: number
          work_order_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
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
          description: string | null
          id: string
          resource: string
        }
        Insert: {
          action: string
          description?: string | null
          id?: string
          resource: string
        }
        Update: {
          action?: string
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
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_text: string
          item_type?: string
          pm_schedule_id: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          item_text?: string
          item_type?: string
          pm_schedule_id?: string
          sort_order?: number | null
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
      pm_schedule_template_items: {
        Row: {
          created_at: string
          id: string
          pm_schedule_id: string
          sort_order: number | null
          template_item_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          pm_schedule_id: string
          sort_order?: number | null
          template_item_id: string
        }
        Update: {
          created_at?: string
          id?: string
          pm_schedule_id?: string
          sort_order?: number | null
          template_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pm_schedule_template_items_pm_schedule_id_fkey"
            columns: ["pm_schedule_id"]
            isOneToOne: false
            referencedRelation: "preventive_maintenance_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pm_schedule_template_items_template_item_id_fkey"
            columns: ["template_item_id"]
            isOneToOne: false
            referencedRelation: "checklist_item_templates"
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
          is_active: boolean | null
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
          frequency_type?: string
          frequency_unit?: string | null
          frequency_value?: number
          id?: string
          instructions?: string | null
          is_active?: boolean | null
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
          is_active?: boolean | null
          last_completed_date?: string | null
          name?: string
          next_due_date?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
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
          main_contact_department_id: string | null
          main_contact_email: string | null
          main_contact_first_name: string | null
          main_contact_job_title: string | null
          main_contact_mobile: string | null
          main_contact_phone: string | null
          main_contact_surname: string | null
          organization_name: string | null
          setup_wizard_dismissed: boolean | null
          site_address_line_1: string | null
          site_address_line_2: string | null
          site_address_line_3: string | null
          site_county_or_state: string | null
          site_postcode: string | null
          site_town_or_city: string | null
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
          main_contact_department_id?: string | null
          main_contact_email?: string | null
          main_contact_first_name?: string | null
          main_contact_job_title?: string | null
          main_contact_mobile?: string | null
          main_contact_phone?: string | null
          main_contact_surname?: string | null
          organization_name?: string | null
          setup_wizard_dismissed?: boolean | null
          site_address_line_1?: string | null
          site_address_line_2?: string | null
          site_address_line_3?: string | null
          site_county_or_state?: string | null
          site_postcode?: string | null
          site_town_or_city?: string | null
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
          main_contact_department_id?: string | null
          main_contact_email?: string | null
          main_contact_first_name?: string | null
          main_contact_job_title?: string | null
          main_contact_mobile?: string | null
          main_contact_phone?: string | null
          main_contact_surname?: string | null
          organization_name?: string | null
          setup_wizard_dismissed?: boolean | null
          site_address_line_1?: string | null
          site_address_line_2?: string | null
          site_address_line_3?: string | null
          site_county_or_state?: string | null
          site_postcode?: string | null
          site_town_or_city?: string | null
          smtp_host?: string | null
          smtp_port?: number | null
          smtp_secure?: boolean | null
          smtp_username?: string | null
          system_contact_email?: string | null
          tenant_id?: string
          timezone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_settings_main_contact_department_id_fkey"
            columns: ["main_contact_department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          id: string
          permission_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          id?: string
          permission_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
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
          auto_renew: boolean | null
          contract_cost: number | null
          contract_number: string | null
          contract_title: string
          contract_type: string | null
          created_at: string
          created_by: string | null
          description: string | null
          email_reminder_enabled: boolean | null
          end_date: string
          id: string
          notes: string | null
          payment_terms: string | null
          reminder_days_before: number[] | null
          renewal_notice_days: number | null
          start_date: string
          status: string
          tenant_id: string
          updated_at: string
          vendor_company_id: string | null
          vendor_name: string
          visit_count: number | null
        }
        Insert: {
          address_id?: string | null
          auto_renew?: boolean | null
          contract_cost?: number | null
          contract_number?: string | null
          contract_title: string
          contract_type?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          email_reminder_enabled?: boolean | null
          end_date: string
          id?: string
          notes?: string | null
          payment_terms?: string | null
          reminder_days_before?: number[] | null
          renewal_notice_days?: number | null
          start_date: string
          status?: string
          tenant_id: string
          updated_at?: string
          vendor_company_id?: string | null
          vendor_name: string
          visit_count?: number | null
        }
        Update: {
          address_id?: string | null
          auto_renew?: boolean | null
          contract_cost?: number | null
          contract_number?: string | null
          contract_title?: string
          contract_type?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          email_reminder_enabled?: boolean | null
          end_date?: string
          id?: string
          notes?: string | null
          payment_terms?: string | null
          reminder_days_before?: number[] | null
          renewal_notice_days?: number | null
          start_date?: string
          status?: string
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
            foreignKeyName: "service_contracts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
          is_active: boolean | null
          name: string
          sku_code: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sku_code?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sku_code?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "spare_parts_categories_tenant_id_fkey"
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
          business_type: string | null
          created_at: string
          id: string
          is_test_site: boolean | null
          name: string
          slug: string | null
          updated_at: string
        }
        Insert: {
          business_type?: string | null
          created_at?: string
          id?: string
          is_test_site?: boolean | null
          name: string
          slug?: string | null
          updated_at?: string
        }
        Update: {
          business_type?: string | null
          created_at?: string
          id?: string
          is_test_site?: boolean | null
          name?: string
          slug?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      time_records: {
        Row: {
          asset_id: string | null
          created_at: string
          created_by: string | null
          description: string
          end_time: string | null
          hours_worked: number
          id: string
          maintenance_job_id: string | null
          pm_schedule_id: string | null
          start_time: string | null
          tenant_id: string
          updated_at: string
          user_id: string
          work_date: string
          work_order_id: string | null
          work_type: string | null
        }
        Insert: {
          asset_id?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          end_time?: string | null
          hours_worked: number
          id?: string
          maintenance_job_id?: string | null
          pm_schedule_id?: string | null
          start_time?: string | null
          tenant_id: string
          updated_at?: string
          user_id: string
          work_date: string
          work_order_id?: string | null
          work_type?: string | null
        }
        Update: {
          asset_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          end_time?: string | null
          hours_worked?: number
          id?: string
          maintenance_job_id?: string | null
          pm_schedule_id?: string | null
          start_time?: string | null
          tenant_id?: string
          updated_at?: string
          user_id?: string
          work_date?: string
          work_order_id?: string | null
          work_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_records_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_records_maintenance_job_id_fkey"
            columns: ["maintenance_job_id"]
            isOneToOne: false
            referencedRelation: "maintenance_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_records_pm_schedule_id_fkey"
            columns: ["pm_schedule_id"]
            isOneToOne: false
            referencedRelation: "preventive_maintenance_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_records_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_records_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string | null
          id: string
          invitation_code: string
          invited_by: string | null
          name: string
          role: Database["public"]["Enums"]["user_role"]
          status: string
          tenant_id: string
          token: string | null
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string | null
          id?: string
          invitation_code?: string
          invited_by?: string | null
          name: string
          role?: Database["public"]["Enums"]["user_role"]
          status?: string
          tenant_id: string
          token?: string | null
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string | null
          id?: string
          invitation_code?: string
          invited_by?: string | null
          name?: string
          role?: Database["public"]["Enums"]["user_role"]
          status?: string
          tenant_id?: string
          token?: string | null
          updated_at?: string
        }
        Relationships: [
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
          granted: boolean
          id: string
          permission_id: string
          user_id: string
        }
        Insert: {
          granted?: boolean
          id?: string
          permission_id: string
          user_id: string
        }
        Update: {
          granted?: boolean
          id?: string
          permission_id?: string
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
      users: {
        Row: {
          available_for_time_tracking: boolean | null
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
          status: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          available_for_time_tracking?: boolean | null
          created_at?: string
          department_id?: string | null
          email: string
          employment_status?:
            | Database["public"]["Enums"]["employment_status"]
            | null
          id: string
          job_title_id?: string | null
          last_login?: string | null
          name: string
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          available_for_time_tracking?: boolean | null
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
          status?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_users_department"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_users_job_title"
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
          comment_type: string | null
          created_at: string
          id: string
          status_id: string | null
          user_id: string | null
          work_order_id: string
        }
        Insert: {
          comment: string
          comment_type?: string | null
          created_at?: string
          id?: string
          status_id?: string | null
          user_id?: string | null
          work_order_id: string
        }
        Update: {
          comment?: string
          comment_type?: string | null
          created_at?: string
          id?: string
          status_id?: string | null
          user_id?: string | null
          work_order_id?: string
        }
        Relationships: [
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
          work_order_number?: string
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
            foreignKeyName: "work_orders_contractor_company_id_fkey"
            columns: ["contractor_company_id"]
            isOneToOne: false
            referencedRelation: "company_details"
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
      work_request_categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          tenant_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          tenant_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_request_categories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      work_requests: {
        Row: {
          category: string
          created_at: string
          customer_id: string | null
          description: string
          id: string
          location_description: string | null
          location_id: string | null
          priority: string
          rejection_reason: string | null
          request_number: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submitted_by: string | null
          tenant_id: string
          title: string
          updated_at: string
          work_order_id: string | null
        }
        Insert: {
          category: string
          created_at?: string
          customer_id?: string | null
          description: string
          id?: string
          location_description?: string | null
          location_id?: string | null
          priority?: string
          rejection_reason?: string | null
          request_number?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_by?: string | null
          tenant_id: string
          title: string
          updated_at?: string
          work_order_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          customer_id?: string | null
          description?: string
          id?: string
          location_description?: string | null
          location_id?: string | null
          priority?: string
          rejection_reason?: string | null
          request_number?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_by?: string | null
          tenant_id?: string
          title?: string
          updated_at?: string
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_work_requests_customer"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_requests_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_requests_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_requests_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      asset_hierarchy: {
        Row: {
          asset_level: number | null
          asset_tag: string | null
          asset_type: string | null
          depth: number | null
          id: string | null
          name: string | null
          parent_asset_id: string | null
          tenant_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      assign_system_admin_role: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      consume_tenant_invitation: {
        Args: { p_code: string; p_user_id: string }
        Returns: undefined
      }
      get_current_user_tenant_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_current_user_admin: { Args: never; Returns: boolean }
      remove_system_admin_role: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      user_has_permission: {
        Args: { _action: string; _resource: string; _user_id: string }
        Returns: boolean
      }
      validate_tenant_invitation: { Args: { p_code: string }; Returns: Json }
    }
    Enums: {
      app_role:
        | "admin"
        | "manager"
        | "technician"
        | "contractor"
        | "system_admin"
      contract_status: "Active" | "Expired" | "Pending" | "Cancelled"
      employment_status: "Full Time" | "Part Time" | "Bank Staff" | "Contractor"
      stock_transaction_type:
        | "received"
        | "issued"
        | "adjusted"
        | "returned"
        | "scrapped"
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
        "admin",
        "manager",
        "technician",
        "contractor",
        "system_admin",
      ],
      contract_status: ["Active", "Expired", "Pending", "Cancelled"],
      employment_status: ["Full Time", "Part Time", "Bank Staff", "Contractor"],
      stock_transaction_type: [
        "received",
        "issued",
        "adjusted",
        "returned",
        "scrapped",
      ],
      user_role: ["admin", "manager", "technician", "contractor"],
    },
  },
} as const
