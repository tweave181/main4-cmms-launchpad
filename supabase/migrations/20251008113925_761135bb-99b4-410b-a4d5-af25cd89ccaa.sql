-- Assign system_admin role to Tony Weaver
INSERT INTO public.user_roles (user_id, role, created_by)
VALUES ('f9c2415d-8de4-485c-b5ae-20fde9d7ed31', 'system_admin', 'f9c2415d-8de4-485c-b5ae-20fde9d7ed31')
ON CONFLICT (user_id, role) DO NOTHING;