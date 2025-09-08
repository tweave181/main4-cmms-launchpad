
import { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  tenant_id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'technician' | 'contractor';
  created_at: string;
  updated_at: string;
  last_login: string | null;
}

export interface Tenant {
  id: string;
  name: string;
  created_at: string;
}

export interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  tenant: Tenant | null;
  loading: boolean;
  ready: boolean;
  signUp: (email: string, password: string, name: string, tenantName: string, tenantSlug: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}
