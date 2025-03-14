-- Add main roles
INSERT INTO admin_roles (name, description) VALUES
('super_admin', 'Full access to all system sections'),
('financial_admin', 'Financial and transaction management'),
('content_admin', 'Content and events management'),
('support', 'Support and ticket management');

-- Add main permissions
INSERT INTO admin_permissions (name, description, module) VALUES
-- System management permissions
('manage_system', 'System settings management', 'system'),
('manage_admins', 'Admin management', 'system'),
('view_logs', 'View system logs', 'system'),

-- Financial permissions
('manage_transactions', 'Transaction management', 'financial'),
('approve_withdrawals', 'Approve withdrawals', 'financial'),
('view_financial_reports', 'View financial reports', 'financial'),

-- Content permissions
('manage_events', 'Event management', 'content'),
('manage_reports', 'Report management', 'content'),
('manage_content', 'Site content management', 'content'),

-- Support permissions
('manage_tickets', 'Ticket management', 'support'),
('view_user_info', 'View user information', 'support'),
('manage_user_status', 'Manage user status', 'support');

-- Assign permissions to roles
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM admin_roles r
CROSS JOIN admin_permissions p
WHERE r.name = 'super_admin';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM admin_roles r
CROSS JOIN admin_permissions p
WHERE r.name = 'financial_admin'
AND p.module = 'financial';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM admin_roles r
CROSS JOIN admin_permissions p
WHERE r.name = 'content_admin'
AND p.module = 'content';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM admin_roles r
CROSS JOIN admin_permissions p
WHERE r.name = 'support'
AND p.module = 'support'; 