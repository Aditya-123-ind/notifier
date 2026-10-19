-- ==========================================================================
-- EduNotify Database Seed Script (PostgreSQL)
-- ==========================================================================

-- Seed Roles
INSERT INTO roles (id, name) VALUES
(1, 'admin'),
(2, 'principal'),
(3, 'teacher'),
(4, 'student')
ON CONFLICT (id) DO NOTHING;

-- Seed Branches
INSERT INTO branches (id, name, code) VALUES
('cse', 'Computer Science & Engineering', 'CSE'),
('me', 'Mechanical Engineering', 'ME'),
('ce', 'Civil Engineering', 'CE'),
('ece', 'Electronics & Communication Engineering', 'ECE'),
('eee', 'Electrical & Electronics Engineering', 'EEE'),
('ise', 'Information Science & Engineering', 'ISE')
ON CONFLICT (id) DO NOTHING;

-- Seed Departments
INSERT INTO departments (id, name, branch_id) VALUES
('dept_cse', 'Department of Computing', 'cse'),
('dept_me', 'Department of Design & Mechanics', 'me'),
('dept_ce', 'Department of Infrastructure', 'ce'),
('dept_ece', 'Department of Signal Processing', 'ece'),
('dept_eee', 'Department of Power Electronics', 'eee'),
('dept_ise', 'Department of Information Systems', 'ise')
ON CONFLICT (id) DO NOTHING;

-- Seed Sample Users (Password hashes are placeholders for bcrypted passwords)
INSERT INTO users (id, name, email, password_hash, role_id, branch_id, semester, roll_number, employee_id, status) VALUES
(1, 'Abhishek Sharma', 'admin@college.edu', '$2b$10$wK1mB77m/Z1oP9VfI7nE0OyZ2Uo9d7Tz.Xn6Yt5gR2r8Hl2l3a4b.', 1, NULL, NULL, NULL, NULL, 'active'),
(2, 'Dr. Sarah Jenkins', 'principal@college.edu', '$2b$10$wK1mB77m/Z1oP9VfI7nE0OyZ2Uo9d7Tz.Xn6Yt5gR2r8Hl2l3a4b.', 2, NULL, NULL, NULL, NULL, 'active'),
(3, 'Prof. Rajesh Kumar', 'teacher.cse@college.edu', '$2b$10$wK1mB77m/Z1oP9VfI7nE0OyZ2Uo9d7Tz.Xn6Yt5gR2r8Hl2l3a4b.', 3, 'cse', NULL, NULL, 'EMP-CSE-092', 'active'),
(4, 'Karan Johar', 'student.cse@college.edu', '$2b$10$wK1mB77m/Z1oP9VfI7nE0OyZ2Uo9d7Tz.Xn6Yt5gR2r8Hl2l3a4b.', 4, 'cse', '6', 'USN-2023-CSE041', NULL, 'active')
ON CONFLICT (id) DO NOTHING;

-- Seed Sample Notifications
INSERT INTO notifications (id, title, description, sender_id, recipient_group, target_branch_id, target_semester, target_class, category, priority, is_pinned) VALUES
(1, 'Urgent: College Closure due to Weather Advisory', '<p>Dear Staff and Students, as per district administration directives, all classes tomorrow are suspended due to heavy rain warnings.</p>', 2, 'all', NULL, NULL, NULL, 'urgent', 'urgent', TRUE),
(2, 'Upcoming Campus Placement Drive: TechCorp Solutions', '<p>TechCorp is recruiting SDE interns. Semesters 6 & 8 CSE/ISE branches with CGPA > 7.5 are eligible.</p>', 2, 'branch', 'cse', NULL, NULL, 'placement', 'high', FALSE),
(3, 'Submission of Lab Records - CSE Semester 6', '<p>Submit your Computer Networks Lab records before June 2, 2026.</p>', 3, 'branch', 'cse', '6', 'CSE-A & CSE-B', 'exams', 'medium', FALSE)
ON CONFLICT (id) DO NOTHING;
