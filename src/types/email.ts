export interface EmailDeliveryLog {
  id: string;
  tenant_id: string;
  recipient_email: string;
  recipient_user_id?: string | null;
  recipient_name?: string | null;
  subject: string;
  template_id?: string | null;
  template_type?: string | null;
  template_name?: string | null;
  delivery_status: string | null;
  sent_at?: string | null;
  delivered_at?: string | null;
  opened_at?: string | null;
  clicked_at?: string | null;
  error_message?: string | null;
  created_at: string;
}
