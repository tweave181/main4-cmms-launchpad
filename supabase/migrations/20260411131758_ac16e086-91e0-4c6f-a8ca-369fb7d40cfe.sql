
-- TENANTS references
DO $$ BEGIN ALTER TABLE public.users ADD CONSTRAINT users_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.departments ADD CONSTRAINT departments_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.locations ADD CONSTRAINT locations_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.categories ADD CONSTRAINT categories_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.assets ADD CONSTRAINT assets_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.company_details ADD CONSTRAINT company_details_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.addresses ADD CONSTRAINT addresses_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.service_contracts ADD CONSTRAINT service_contracts_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.work_orders ADD CONSTRAINT work_orders_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.inventory_parts ADD CONSTRAINT inventory_parts_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.maintenance_jobs ADD CONSTRAINT maintenance_jobs_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.preventive_maintenance_schedules ADD CONSTRAINT preventive_maintenance_schedules_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.checklist_records ADD CONSTRAINT checklist_records_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.checklist_item_templates ADD CONSTRAINT checklist_item_templates_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.email_templates ADD CONSTRAINT email_templates_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.job_titles ADD CONSTRAINT job_titles_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.location_levels ADD CONSTRAINT location_levels_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.customers ADD CONSTRAINT customers_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.notification_settings ADD CONSTRAINT notification_settings_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.asset_tag_prefixes ADD CONSTRAINT asset_tag_prefixes_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.program_settings ADD CONSTRAINT program_settings_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.address_contacts ADD CONSTRAINT address_contacts_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.frequency_types ADD CONSTRAINT frequency_types_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.comment_status_options ADD CONSTRAINT comment_status_options_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.contract_reminders_log ADD CONSTRAINT contract_reminders_log_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.email_delivery_log ADD CONSTRAINT email_delivery_log_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.address_audit_log ADD CONSTRAINT address_audit_log_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.department_audit_log ADD CONSTRAINT department_audit_log_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.job_title_audit_log ADD CONSTRAINT job_title_audit_log_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.work_requests ADD CONSTRAINT work_requests_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ASSETS references
DO $$ BEGIN ALTER TABLE public.assets ADD CONSTRAINT assets_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.assets ADD CONSTRAINT assets_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.assets ADD CONSTRAINT assets_manufacturer_company_id_fkey FOREIGN KEY (manufacturer_company_id) REFERENCES public.company_details(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.assets ADD CONSTRAINT assets_parent_asset_id_fkey FOREIGN KEY (parent_asset_id) REFERENCES public.assets(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.assets ADD CONSTRAINT assets_service_contract_id_fkey FOREIGN KEY (service_contract_id) REFERENCES public.service_contracts(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ASSET TAG PREFIXES
DO $$ BEGIN ALTER TABLE public.asset_tag_prefixes ADD CONSTRAINT asset_tag_prefixes_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.asset_tag_prefix_audit_log ADD CONSTRAINT asset_tag_prefix_audit_log_prefix_id_fkey FOREIGN KEY (prefix_id) REFERENCES public.asset_tag_prefixes(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- WORK ORDERS → USERS
DO $$ BEGIN ALTER TABLE public.work_orders ADD CONSTRAINT work_orders_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.work_orders ADD CONSTRAINT work_orders_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.work_orders ADD CONSTRAINT work_orders_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.assets(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- WORK ORDER COMMENTS → USERS
DO $$ BEGIN ALTER TABLE public.work_order_comments ADD CONSTRAINT work_order_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.work_order_comments ADD CONSTRAINT work_order_comments_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- PM SCHEDULES → USERS
DO $$ BEGIN ALTER TABLE public.preventive_maintenance_schedules ADD CONSTRAINT preventive_maintenance_schedules_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.preventive_maintenance_schedules ADD CONSTRAINT preventive_maintenance_schedules_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- MAINTENANCE JOBS
DO $$ BEGIN ALTER TABLE public.maintenance_jobs ADD CONSTRAINT maintenance_jobs_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.assets(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.maintenance_jobs ADD CONSTRAINT maintenance_jobs_pm_schedule_id_fkey FOREIGN KEY (pm_schedule_id) REFERENCES public.preventive_maintenance_schedules(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.maintenance_jobs ADD CONSTRAINT maintenance_jobs_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- LOCATIONS
DO $$ BEGIN ALTER TABLE public.locations ADD CONSTRAINT locations_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.locations ADD CONSTRAINT locations_location_level_id_fkey FOREIGN KEY (location_level_id) REFERENCES public.location_levels(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.locations ADD CONSTRAINT locations_parent_location_id_fkey FOREIGN KEY (parent_location_id) REFERENCES public.locations(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ADDRESSES
DO $$ BEGIN ALTER TABLE public.addresses ADD CONSTRAINT addresses_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.company_details(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.address_contacts ADD CONSTRAINT address_contacts_address_id_fkey FOREIGN KEY (address_id) REFERENCES public.addresses(id) ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CONTRACTS
DO $$ BEGIN ALTER TABLE public.contract_lines ADD CONSTRAINT contract_lines_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES public.service_contracts(id) ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.contract_reminders ADD CONSTRAINT contract_reminders_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES public.service_contracts(id) ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.contract_reminders_log ADD CONSTRAINT contract_reminders_log_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES public.service_contracts(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.contract_asset_associations ADD CONSTRAINT contract_asset_associations_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES public.service_contracts(id) ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.contract_asset_associations ADD CONSTRAINT fk_caa_asset FOREIGN KEY (asset_id) REFERENCES public.assets(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- INVENTORY
DO $$ BEGIN ALTER TABLE public.inventory_parts ADD CONSTRAINT inventory_parts_spare_parts_category_id_fkey FOREIGN KEY (spare_parts_category_id) REFERENCES public.spare_parts_categories(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.inventory_parts ADD CONSTRAINT inventory_parts_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.addresses(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.part_asset_associations ADD CONSTRAINT part_asset_associations_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.assets(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.part_asset_associations ADD CONSTRAINT part_asset_associations_part_id_fkey FOREIGN KEY (part_id) REFERENCES public.inventory_parts(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.part_work_order_usage ADD CONSTRAINT part_work_order_usage_part_id_fkey FOREIGN KEY (part_id) REFERENCES public.inventory_parts(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.part_work_order_usage ADD CONSTRAINT part_work_order_usage_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CHECKLIST
DO $$ BEGIN ALTER TABLE public.checklist_record_lines ADD CONSTRAINT checklist_record_lines_checklist_line_id_fkey FOREIGN KEY (checklist_line_id) REFERENCES public.checklist_item_templates(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.checklist_record_lines ADD CONSTRAINT checklist_record_lines_checklist_record_id_fkey FOREIGN KEY (checklist_record_id) REFERENCES public.checklist_records(id) ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- PM SCHEDULE ITEMS
DO $$ BEGIN ALTER TABLE public.pm_schedule_assets ADD CONSTRAINT pm_schedule_assets_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.assets(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.pm_schedule_assets ADD CONSTRAINT pm_schedule_assets_pm_schedule_id_fkey FOREIGN KEY (pm_schedule_id) REFERENCES public.preventive_maintenance_schedules(id) ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.pm_schedule_checklist_items ADD CONSTRAINT pm_schedule_checklist_items_pm_schedule_id_fkey FOREIGN KEY (pm_schedule_id) REFERENCES public.preventive_maintenance_schedules(id) ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.pm_schedule_template_items ADD CONSTRAINT pm_schedule_template_items_pm_schedule_id_fkey FOREIGN KEY (pm_schedule_id) REFERENCES public.preventive_maintenance_schedules(id) ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.pm_schedule_template_items ADD CONSTRAINT pm_schedule_template_items_template_item_id_fkey FOREIGN KEY (template_item_id) REFERENCES public.checklist_item_templates(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CUSTOMERS
DO $$ BEGIN ALTER TABLE public.customers ADD CONSTRAINT customers_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.customers ADD CONSTRAINT customers_job_title_id_fkey FOREIGN KEY (job_title_id) REFERENCES public.job_titles(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.customers ADD CONSTRAINT customers_reports_to_fkey FOREIGN KEY (reports_to) REFERENCES public.customers(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.customers ADD CONSTRAINT customers_work_area_id_fkey FOREIGN KEY (work_area_id) REFERENCES public.locations(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- AUDIT LOGS
DO $$ BEGIN ALTER TABLE public.address_audit_log ADD CONSTRAINT address_audit_log_address_id_fkey FOREIGN KEY (address_id) REFERENCES public.addresses(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.address_audit_log ADD CONSTRAINT address_audit_log_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.users(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.department_audit_log ADD CONSTRAINT department_audit_log_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.users(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.department_audit_log ADD CONSTRAINT department_audit_log_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.job_title_audit_log ADD CONSTRAINT job_title_audit_log_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.users(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.job_title_audit_log ADD CONSTRAINT job_title_audit_log_job_title_id_fkey FOREIGN KEY (job_title_id) REFERENCES public.job_titles(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- EMAIL
DO $$ BEGIN ALTER TABLE public.email_delivery_log ADD CONSTRAINT email_delivery_log_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.email_templates(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ROLE PERMISSIONS
DO $$ BEGIN ALTER TABLE public.role_permissions ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- USER PERMISSION OVERRIDES
DO $$ BEGIN ALTER TABLE public.user_permission_overrides ADD CONSTRAINT user_permission_overrides_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.user_permission_overrides ADD CONSTRAINT user_permission_overrides_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- USER ROLES
DO $$ BEGIN ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- USER INVITATIONS
DO $$ BEGIN ALTER TABLE public.user_invitations ADD CONSTRAINT user_invitations_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- WORK REQUESTS
DO $$ BEGIN ALTER TABLE public.work_requests ADD CONSTRAINT work_requests_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES public.users(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.work_requests ADD CONSTRAINT work_requests_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.work_requests ADD CONSTRAINT work_requests_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.work_requests ADD CONSTRAINT work_requests_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.work_requests ADD CONSTRAINT work_requests_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
