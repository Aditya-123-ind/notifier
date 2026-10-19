// Mock db connection reference (or replacement with pg Pool)
// const pool = require("../database/db");

// 1. Get notifications feed based on requesting user role
exports.getFeed = async (req, res) => {
  const { role, id: userId, branchId, semester } = req.user;
  const { category, branch, sem, search } = req.query;

  try {
    let query = `
      SELECT n.*, u.name as sender_name, r.name as sender_role,
             a.file_name, a.file_url,
             EXISTS(SELECT 1 FROM notification_read_status rs WHERE rs.notification_id = n.id AND rs.user_id = $1) as is_read
      FROM notifications n
      JOIN users u ON n.sender_id = u.id
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN attachments a ON a.notification_id = n.id
      WHERE (n.scheduled_for IS NULL OR n.scheduled_for <= NOW())
    `;
    const params = [userId];
    let paramCount = 1;

    // Apply role boundaries
    if (role === "student") {
      paramCount++;
      params.push(branchId, semester);
      query += `
        AND (
          n.sender_id = $1 OR
          n.recipient_group = 'all' OR
          n.recipient_group = 'students' OR
          (n.recipient_group = 'student' AND n.target_student_id = $1) OR
          (n.recipient_group = 'branch' AND n.target_branch_id = $${paramCount - 1} AND (n.target_semester IS NULL OR n.target_semester = $${paramCount}))
        )
      `;
    } else if (role === "teacher") {
      paramCount++;
      params.push(branchId);
      query += `
        AND (
          n.sender_id = $1 OR
          n.recipient_group = 'all' OR
          n.recipient_group = 'staff' OR
          (n.recipient_group = 'teacher' AND n.target_teacher_id = $1) OR
          (n.recipient_group = 'branch' AND n.target_branch_id = $${paramCount})
        )
      `;
    }

    // Apply active filters (Category, Target Branch, Target Sem, Search query)
    if (category) {
      paramCount++;
      params.push(category);
      query += ` AND n.category = $${paramCount}`;
    }
    if (branch && (role === "admin" || role === "principal")) {
      paramCount++;
      params.push(branch);
      query += ` AND n.target_branch_id = $${paramCount}`;
    }
    if (sem) {
      paramCount++;
      params.push(sem);
      query += ` AND n.target_semester = $${paramCount}`;
    }
    if (search) {
      paramCount++;
      params.push(`%${search}%`);
      query += ` AND (n.title ILIKE $${paramCount} OR n.description ILIKE $${paramCount})`;
    }

    // Order: Pinned first, then newest
    query += ` ORDER BY n.is_pinned DESC, n.created_at DESC`;

    // In a real project: const result = await pool.query(query, params);
    // res.status(200).json(result.rows);
    
    // For mockup stub purposes, return a response template
    res.status(200).json({ message: "Feed query compiled successfully", query, params });
  } catch (err) {
    res.status(500).json({ error: "Failed to query notifications feed: " + err.message });
  }
};

// 2. Create notification circular
exports.createNotification = async (req, res) => {
  const { title, description, recipientGroup, targetBranchId, targetSemester, targetClass, targetTeacherId, targetStudentId, category, priority, isPinned, scheduledFor } = req.body;
  const senderId = req.user.id;

  // Validation
  if (!title || !description || !recipientGroup || !category) {
    return res.status(400).json({ error: "Required fields title, content body, category, and recipient scope are missing." });
  }

  try {
    // In a real application, run SQL:
    // INSERT INTO notifications (title, description, sender_id, recipient_group, target_branch_id, target_semester, target_class, target_teacher_id, category, priority, is_pinned, scheduled_for)
    // VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *;
    
    res.status(201).json({
      message: "Notification circular published successfully.",
      data: { title, category, recipientGroup, senderId }
    });
  } catch (err) {
    res.status(500).json({ error: "Database execution failed: " + err.message });
  }
};

// 3. Mark notification as read
exports.markAsRead = async (req, res) => {
  const { notifId } = req.params;
  const userId = req.user.id;

  try {
    // INSERT INTO notification_read_status (notification_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING;
    res.status(200).json({ success: true, message: `Notification ${notifId} flagged read for user ${userId}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. Submit student feedback comments
exports.addFeedback = async (req, res) => {
  const { notifId } = req.params;
  const { comment } = req.body;
  const studentId = req.user.id;

  if (!comment) return res.status(400).json({ error: "Comment text body is blank." });

  try {
    // INSERT INTO feedback (notification_id, student_id, comment) VALUES ($1, $2, $3) RETURNING *;
    res.status(201).json({ success: true, message: "Feedback submitted successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
