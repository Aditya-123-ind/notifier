/* ==========================================================================
   EduNotify Database Layer (localStorage-backed state)
   ========================================================================== */

const AcademicDB = (() => {
  // Pre-seed static configurations
  const BRANCHES = [
    { id: "cse", name: "Computer Science & Engineering", code: "CSE" },
    { id: "me", name: "Mechanical Engineering", code: "ME" },
    { id: "ce", name: "Civil Engineering", code: "CE" },
    { id: "ece", name: "Electronics & Communication Engineering", code: "ECE" },
    { id: "eee", name: "Electrical & Electronics Engineering", code: "EEE" },
    { id: "ise", name: "Information Science & Engineering", code: "ISE" }
  ];

  const DEPARTMENTS = [
    { id: "dept_cse", name: "Department of Computing", branch_id: "cse" },
    { id: "dept_me", name: "Department of Design & Mechanics", branch_id: "me" },
    { id: "dept_ce", name: "Department of Infrastructure", branch_id: "ce" },
    { id: "dept_ece", name: "Department of Signal Processing", branch_id: "ece" },
    { id: "dept_eee", name: "Department of Power Electronics", branch_id: "eee" },
    { id: "dept_ise", name: "Department of Information Systems", branch_id: "ise" }
  ];

  const ROLES = {
    ADMIN: "admin",
    PRINCIPAL: "principal",
    TEACHER: "teacher",
    STUDENT: "student"
  };

  const CATEGORIES = {
    EXAMS: "exams",
    ATTENDANCE: "attendance",
    CIRCULARS: "circulars",
    EVENTS: "events",
    PLACEMENT: "placement",
    HOLIDAYS: "holidays",
    URGENT: "urgent"
  };

  // Helper for reading and writing to localStorage
  const _get = (key) => JSON.parse(localStorage.getItem(key));
  const _set = (key, data) => localStorage.setItem(key, JSON.stringify(data));

  // Initialize DB if not initialized
  const init = () => {
    // 1. Roles & Branches (Static, read-only in local context)
    _set("college_branches", BRANCHES);
    _set("college_departments", DEPARTMENTS);

    // 2. Users Database
    if (!_get("college_users")) {
      const defaultUsers = [
        {
          id: "usr_admin",
          name: "Abhishek Sharma",
          email: "admin@college.edu",
          passwordHash: "admin123", // Simplified for local demo
          role: ROLES.ADMIN,
          branchId: null,
          semester: null,
          status: "active",
          createdAt: "2026-01-10T09:00:00.000Z"
        },
        {
          id: "usr_principal",
          name: "Dr. Sarah Jenkins",
          email: "principal@college.edu",
          passwordHash: "principal123",
          role: ROLES.PRINCIPAL,
          branchId: null,
          semester: null,
          status: "active",
          createdAt: "2026-01-11T10:00:00.000Z"
        },
        {
          id: "usr_teacher_cse",
          name: "Prof. Rajesh Kumar",
          email: "teacher.cse@college.edu",
          passwordHash: "teacher123",
          role: ROLES.TEACHER,
          branchId: "cse",
          employeeId: "EMP-CSE-092",
          status: "active",
          createdAt: "2026-02-15T11:30:00.000Z"
        },
        {
          id: "usr_teacher_me",
          name: "Dr. Alan Mercer",
          email: "teacher.mech@college.edu",
          passwordHash: "teacher123",
          role: ROLES.TEACHER,
          branchId: "me",
          employeeId: "EMP-MECH-048",
          status: "pending", // Pending approval to show Admin flow
          createdAt: "2026-05-24T14:22:00.000Z"
        },
        {
          id: "usr_student_cse",
          name: "Karan Johar",
          email: "student.cse@college.edu",
          passwordHash: "student123",
          role: ROLES.STUDENT,
          branchId: "cse",
          semester: "6",
          rollNumber: "USN-2023-CSE041",
          status: "active",
          createdAt: "2026-03-01T08:45:00.000Z"
        },
        {
          id: "usr_student_ece",
          name: "Neha Sharma",
          email: "student.ece@college.edu",
          passwordHash: "student123",
          role: ROLES.STUDENT,
          branchId: "ece",
          semester: "4",
          rollNumber: "USN-2024-ECE112",
          status: "active",
          createdAt: "2026-03-05T09:12:00.000Z"
        }
      ];
      _set("college_users", defaultUsers);
    }

    // 3. Notifications Database
    if (!_get("college_notifications")) {
      const defaultNotifications = [
        {
          id: "notif_001",
          title: "Urgent: College Closure due to Weather Advisory",
          description: "<h3>Weather Warning Alert</h3><p>Dear Staff and Students,</p><p>As per the directive issued by the local district administration, all classes and examinations scheduled for tomorrow are hereby suspended due to the heavy rainfall advisory. The college administration block will remain closed.</p><p>Staff are advised to work from home, and students should check their portal for further academic rescheduling details.</p>",
          senderId: "usr_principal",
          senderName: "Dr. Sarah Jenkins",
          senderRole: ROLES.PRINCIPAL,
          recipientGroup: "all", // all, staff, students, branch
          targetBranchId: null,
          targetSemester: null,
          targetClass: null,
          category: CATEGORIES.URGENT,
          priority: "urgent",
          isPinned: true,
          scheduledFor: null,
          createdAt: "2026-05-25T08:00:00.000Z",
          attachment: {
            fileName: "Weather_Advisory_Closure.pdf",
            fileSize: "420 KB",
            fileData: "data:application/pdf;base64,JVBERi0xLjQKJ..." // Base64 mock
          }
        },
        {
          id: "notif_002",
          title: "Upcoming Campus Placement Drive: TechCorp Solutions",
          description: "<p>TechCorp Solutions is conducting a campus recruitment drive for the <b>Software Development Engineer (SDE)</b> profile. Eligible branches are Computer Science (CSE) and Information Science (ISE) students of Semester 6 & 8.</p><h3>Eligibility Criteria:</h3><ul><li>CGPA: 7.5 and above</li><li>No active backlogs</li></ul><p>Please register using the link on or before May 28, 2026.</p>",
          senderId: "usr_principal",
          senderName: "Dr. Sarah Jenkins",
          senderRole: ROLES.PRINCIPAL,
          recipientGroup: "branch",
          targetBranchId: "cse",
          targetSemester: null,
          targetClass: null,
          category: CATEGORIES.PLACEMENT,
          priority: "high",
          isPinned: false,
          scheduledFor: null,
          createdAt: "2026-05-24T10:15:00.000Z",
          attachment: null
        },
        {
          id: "notif_003",
          title: "Submission of Lab Records - CSE Semester 6",
          description: "<p>This is to remind all Semester 6 CSE students that they must submit their completed <b>Computer Networks Lab</b> and <b>Database Systems Lab</b> records to their respective lab instructors on or before June 2, 2026.</p><p>Late submissions will attract a deduction of internal marks. Ensure records are neat, signed, and indexed properly.</p>",
          senderId: "usr_teacher_cse",
          senderName: "Prof. Rajesh Kumar",
          senderRole: ROLES.TEACHER,
          recipientGroup: "branch",
          targetBranchId: "cse",
          targetSemester: "6",
          targetClass: "CSE-A & CSE-B",
          category: CATEGORIES.EXAMS,
          priority: "medium",
          isPinned: false,
          scheduledFor: null,
          createdAt: "2026-05-23T14:30:00.000Z",
          attachment: {
            fileName: "CN_Lab_Index_Rubrics.pdf",
            fileSize: "280 KB",
            fileData: "data:application/pdf;base64,JVBERi0xLjQKJ..."
          }
        },
        {
          id: "notif_004",
          title: "Attendance Defaulters List - May Month",
          description: "<p>Please find attached the consolidated attendance defaulters list for the month of May. Students with attendance below 75% are cautioned that they will not be eligible to write the final end-semester examinations unless an official medical certificate is approved.</p><p>Contact your branch head immediately if there are discrepancies.</p>",
          senderId: "usr_teacher_cse",
          senderName: "Prof. Rajesh Kumar",
          senderRole: ROLES.TEACHER,
          recipientGroup: "branch",
          targetBranchId: "cse",
          targetSemester: "6",
          targetClass: null,
          category: CATEGORIES.ATTENDANCE,
          priority: "high",
          isPinned: false,
          scheduledFor: null,
          createdAt: "2026-05-22T09:00:00.000Z",
          attachment: {
            fileName: "Attendance_Defaulters_CSE_6.pdf",
            fileSize: "1.1 MB",
            fileData: "data:application/pdf;base64,JVBERi0xLjQKJ..."
          }
        },
        {
          id: "notif_005",
          title: "Official Staff Meeting Notice: Academic Audit Committee",
          description: "<p>All academic staff members are requested to attend the Staff Council Meeting scheduled for May 26, 2026, at 3:00 PM in the Principal's Board Room.</p><h3>Agenda:</h3><ol><li>End Semester Exam Preparedness</li><li>NBA Accreditation Audit checklist review</li><li>Research publication progress updates</li></ol><p>Attendance is compulsory.</p>",
          senderId: "usr_principal",
          senderName: "Dr. Sarah Jenkins",
          senderRole: ROLES.PRINCIPAL,
          recipientGroup: "staff",
          targetBranchId: null,
          targetSemester: null,
          targetClass: null,
          category: CATEGORIES.CIRCULARS,
          priority: "medium",
          isPinned: false,
          scheduledFor: null,
          createdAt: "2026-05-25T11:00:00.000Z",
          attachment: null
        }
      ];
      _set("college_notifications", defaultNotifications);
    }

    // 4. Notification Read Status Database
    if (!_get("college_read_status")) {
      const defaultReadStatus = [
        { notificationId: "notif_001", userId: "usr_student_cse", readAt: "2026-05-25T08:15:00.000Z" },
        { notificationId: "notif_003", userId: "usr_student_cse", readAt: "2026-05-24T12:00:00.000Z" }
      ];
      _set("college_read_status", defaultReadStatus);
    }

    // 5. Notification Feedback Database
    if (!_get("college_feedback")) {
      const defaultFeedback = [
        {
          id: "feed_001",
          notificationId: "notif_003",
          studentId: "usr_student_cse",
          studentName: "Karan Johar",
          comment: "Prof. Rajesh, can we submit the CN lab records online on the git repository or do we need physical printouts?",
          createdAt: "2026-05-23T16:00:00.000Z"
        }
      ];
      _set("college_feedback", defaultFeedback);
    }
  };

  // Run init immediately on loading script
  init();

  return {
    // Branches & Departments
    getBranches: () => _get("college_branches"),
    getBranchById: (id) => _get("college_branches").find(b => b.id === id),
    getDepartments: () => _get("college_departments"),

    // Users CRUD
    getUsers: () => _get("college_users"),
    getUserById: (id) => _get("college_users").find(u => u.id === id),
    getUserByEmail: (email) => _get("college_users").find(u => u.email.toLowerCase() === email.toLowerCase()),
    
    createUser: (user) => {
      const users = _get("college_users");
      user.id = "usr_" + Date.now();
      user.createdAt = new Date().toISOString();
      users.push(user);
      _set("college_users", users);
      return user;
    },
    
    updateUser: (id, updatedFields) => {
      const users = _get("college_users");
      const index = users.findIndex(u => u.id === id);
      if (index !== -1) {
        users[index] = { ...users[index], ...updatedFields };
        _set("college_users", users);
        return users[index];
      }
      return null;
    },
    
    deleteUser: (id) => {
      const users = _get("college_users");
      const filtered = users.filter(u => u.id !== id);
      _set("college_users", filtered);
      return true;
    },

    // Notifications CRUD
    getNotifications: () => _get("college_notifications"),
    getNotificationById: (id) => _get("college_notifications").find(n => n.id === id),
    
    createNotification: (notif) => {
      const notifs = _get("college_notifications");
      notif.id = "notif_" + Date.now();
      notif.createdAt = new Date().toISOString();
      notifs.push(notif);
      _set("college_notifications", notifs);
      return notif;
    },
    
    updateNotification: (id, updatedFields) => {
      const notifs = _get("college_notifications");
      const index = notifs.findIndex(n => n.id === id);
      if (index !== -1) {
        notifs[index] = { ...notifs[index], ...updatedFields };
        _set("college_notifications", notifs);
        return notifs[index];
      }
      return null;
    },
    
    deleteNotification: (id) => {
      const notifs = _get("college_notifications");
      const filtered = notifs.filter(n => n.id !== id);
      _set("college_notifications", filtered);
      
      // Clean read status and feedbacks for this notification
      const readStatus = _get("college_read_status");
      const cleanRead = readStatus.filter(r => r.notificationId !== id);
      _set("college_read_status", cleanRead);

      const feedback = _get("college_feedback");
      const cleanFeedback = feedback.filter(f => f.notificationId !== id);
      _set("college_feedback", cleanFeedback);
      return true;
    },

    // Read status management
    getReadStatus: () => _get("college_read_status"),
    markAsRead: (notificationId, userId) => {
      const records = _get("college_read_status");
      const exists = records.find(r => r.notificationId === notificationId && r.userId === userId);
      if (!exists) {
        records.push({
          notificationId,
          userId,
          readAt: new Date().toISOString()
        });
        _set("college_read_status", records);
      }
      return true;
    },
    markAllAsRead: (userId, notificationIds) => {
      const records = _get("college_read_status");
      notificationIds.forEach(id => {
        const exists = records.find(r => r.notificationId === id && r.userId === userId);
        if (!exists) {
          records.push({
            notificationId: id,
            userId,
            readAt: new Date().toISOString()
          });
        }
      });
      _set("college_read_status", records);
      return true;
    },

    // Feedback queries
    getFeedbackForNotification: (notificationId) => {
      return _get("college_feedback").filter(f => f.notificationId === notificationId);
    },
    
    addFeedback: (notificationId, studentId, studentName, comment) => {
      const feedbacks = _get("college_feedback");
      const newFeed = {
        id: "feed_" + Date.now(),
        notificationId,
        studentId,
        studentName,
        comment,
        createdAt: new Date().toISOString()
      };
      feedbacks.push(newFeed);
      _set("college_feedback", feedbacks);
      return newFeed;
    }
  };
})();
