/* ==========================================================================
   EduNotify Main Router, State and View Controller
   ========================================================================== */

const AcademicApp = (() => {
  let currentUser = null;
  let activePage = "dashboard";
  let activeFilters = {
    category: "",
    branch: "",
    semester: "",
    query: ""
  };
  
  // Real-time notification socket simulation data
  const SIMULATION_NOTIFICATIONS = [
    {
      title: "PLACEMENT: CodeCraft Hackathon Registrations Open",
      description: "<p>Exciting news! CodeCraft national level hackathon registrations are open. Grand prize of $5000 and direct internship opportunities at Google and DeepMind.</p><p>Register online by visiting the placements coordinator office.</p>",
      senderId: "usr_principal",
      senderName: "Dr. Sarah Jenkins",
      senderRole: "principal",
      recipientGroup: "students",
      targetBranchId: null,
      targetSemester: null,
      targetClass: null,
      category: "placement",
      priority: "high",
      isPinned: false
    },
    {
      title: "ATTENDANCE: Final Attendance Review for Sem 6",
      description: "<p>All Semester 6 students must verify their attendance logs with the respective class mentors before Friday. Unverified logs will be considered final.</p>",
      senderId: "usr_teacher_cse",
      senderName: "Prof. Rajesh Kumar",
      senderRole: "teacher",
      recipientGroup: "branch",
      targetBranchId: "cse",
      targetSemester: "6",
      targetClass: null,
      category: "attendance",
      priority: "medium",
      isPinned: false
    },
    {
      title: "URGENT: Server Maintenance Downtime",
      description: "<p>The college main student database portal will undergo scheduled maintenance this Sunday from 2:00 AM to 6:00 AM. Portal login will be temporarily unavailable.</p>",
      senderId: "usr_admin",
      senderName: "Abhishek Sharma",
      senderRole: "admin",
      recipientGroup: "all",
      targetBranchId: null,
      targetSemester: null,
      targetClass: null,
      category: "urgent",
      priority: "urgent",
      isPinned: false
    }
  ];

  const normalizeNotificationCategory = (category) => {
    return category === "placements" ? "placement" : category;
  };

  const titleCase = (value) => {
    return String(value || "")
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, char => char.toUpperCase());
  };

  const getCategoryLabel = (category) => {
    const labels = {
      academics: "Academics",
      events: "Events",
      placement: "Placements",
      placements: "Placements",
      achievements: "Achievements",
      circulars: "Circulars"
    };
    return labels[category] || titleCase(category);
  };

  const getSectionLabel = (section) => {
    const labels = {
      upcoming: "Upcoming Events",
      clubs: "Club Activities",
      webinars: "Webinars & Sessions",
      register: "Event Registrations",
      jobs: "Job Openings",
      timelines: "Company Timelines",
      resources: "Placement Resources",
      internships: "Internship Opportunities",
      timetable: "Timetable",
      materials: "Course Materials",
      calendar: "Academic Calendar",
      exams: "Exam Schedule",
      student: "Student Achievements",
      faculty: "Faculty Excellence",
      stories: "Success Stories",
      recognition: "Recognition Board",
      official: "Official Circulars",
      holidays: "Holiday Notices",
      admin: "Administrative Notices",
      urgent: "Urgent Circulars"
    };
    return labels[section] || titleCase(section);
  };

  const escapeHtml = (value) => {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const plainTextToHtml = (value) => {
    return `<p>${escapeHtml(value).replace(/\n/g, "<br>")}</p>`;
  };

  const publishCategoryUpdate = (category, section, data) => {
    if (!currentUser || currentUser.role !== "principal") return null;

    const trimmed = data.trim();
    if (!trimmed) return null;

    const created = AcademicDB.createNotification({
      title: `${getCategoryLabel(category)} Update: ${getSectionLabel(section)}`,
      description: plainTextToHtml(trimmed),
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      recipientGroup: "students",
      targetBranchId: null,
      targetSemester: null,
      targetClass: null,
      category: normalizeNotificationCategory(category),
      priority: section === "urgent" ? "urgent" : "medium",
      attachment: null,
      isPinned: false,
      scheduledFor: null
    });

    AcademicDB.markAsRead(created.id, currentUser.id);
    renderHeader();
    if (activePage === "feed") loadActivePage();
    return created;
  };

  // Initialize App on DOM Loaded
  const init = () => {
    currentUser = AcademicAuth.getCurrentUser();
    
    // Expose user role to window for use in components
    window.currentUserRole = currentUser ? currentUser.role : null;
    
    // Theme setup from storage
    const currentTheme = localStorage.getItem("college_theme") || "light";
    if (currentTheme === "dark") {
      document.body.classList.add("dark-theme");
      const toggleTxt = document.getElementById("theme-toggle-text");
      if (toggleTxt) toggleTxt.innerText = "Light Mode";
    }

    if (!currentUser) {
      // User is logged out, render authentication page
      AcademicAuth.renderAuthPage("login");
    } else {
      // User is logged in, mount dashboard
      document.getElementById("app-layout").classList.remove("hidden");
      document.getElementById("auth-container").classList.add("hidden");
      
      // Seed default active page by role
      if (currentUser.role === "admin") activePage = "admin_dash";
      else if (currentUser.role === "principal") activePage = "principal_dash";
      else if (currentUser.role === "teacher") activePage = "teacher_dash";
      else activePage = "student_dash";

      setupGlobalEventListeners();
      renderSidebar();
      renderHeader();
      loadActivePage();
      startRealTimeSimulation();
    }
  };

  // Wire up page shell listeners
  const setupGlobalEventListeners = () => {
    // Mobile Sidebar controls
    const sidebar = document.getElementById("app-sidebar");
    const openBtn = document.getElementById("sidebar-open-btn");
    const closeBtn = document.getElementById("sidebar-close-btn");

    if (openBtn) {
      openBtn.addEventListener("click", () => sidebar.classList.add("open"));
    }
    if (closeBtn) {
      closeBtn.addEventListener("click", () => sidebar.classList.remove("open"));
    }

    // Theme Toggle
    const themeBtn = document.getElementById("theme-toggle-btn");
    if (themeBtn) {
      themeBtn.addEventListener("click", toggleTheme);
    }

    // Logout
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", AcademicAuth.logout);
    }

    // Bell dropdown toggle
    const bellBtn = document.getElementById("bell-btn");
    const bellDropdown = document.getElementById("bell-dropdown");
    if (bellBtn) {
      bellBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        bellDropdown.classList.toggle("hidden");
      });
    }

    document.addEventListener("click", () => {
      if (bellDropdown) bellDropdown.classList.add("hidden");
    });

    // Mark all read in bell
    const markAllReadBtn = document.getElementById("bell-mark-all-read");
    if (markAllReadBtn) {
      markAllReadBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const unreadIds = getUnreadNotificationsForUser().map(n => n.id);
        AcademicDB.markAllAsRead(currentUser.id, unreadIds);
        renderHeader();
        if (activePage === "feed") loadActivePage(); // Reload feed UI to reflect changes
      });
    }

    // Detail Modal Closes
    document.getElementById("close-detail-modal").addEventListener("click", closeDetailModal);
    document.getElementById("modal-close-btn-bottom").addEventListener("click", closeDetailModal);

    // Rich Text Editor Commands
    document.querySelectorAll(".toolbar-btn[data-cmd]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const cmd = btn.getAttribute("data-cmd");
        if (cmd === "createLink") {
          const url = prompt("Enter the URL:");
          if (url) document.execCommand(cmd, false, url);
        } else if (cmd === "h3") {
          document.execCommand("formatBlock", false, "H3");
        } else {
          document.execCommand(cmd, false, null);
        }
        document.getElementById("form-description-editor").focus();
      });
    });

    document.getElementById("editor-clear").addEventListener("click", () => {
      document.getElementById("form-description-editor").innerHTML = "";
    });

    // Form Modal attachment setup
    const fileInput = document.getElementById("form-attachment");
    const selectedFileDiv = document.getElementById("file-upload-selected");
    const selectedFileName = document.getElementById("selected-file-name");
    const removeFileBtn = document.getElementById("remove-file-btn");

    let loadedFileMeta = null;

    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit.");
        fileInput.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        loadedFileMeta = {
          fileName: file.name,
          fileSize: (file.size / 1024).toFixed(0) + " KB",
          fileData: event.target.result // Base64 encoding
        };
        selectedFileName.innerText = `${file.name} (${loadedFileMeta.fileSize})`;
        selectedFileDiv.classList.remove("hidden");
      };
      
      // Load file as base64 data URI
      reader.readAsDataURL(file);
    });

    removeFileBtn.addEventListener("click", () => {
      loadedFileMeta = null;
      fileInput.value = "";
      selectedFileDiv.classList.add("hidden");
    });

    // Notification Creation Form submission
    const notifForm = document.getElementById("notification-submit-form");
    notifForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const notifId = document.getElementById("form-notif-id").value;
      const title = document.getElementById("form-title").value;
      const category = document.getElementById("form-category").value;
      const priority = document.getElementById("form-priority").value;
      const recipientGroup = document.getElementById("form-recipient-group").value;
      const description = document.getElementById("form-description-editor").innerHTML;

      if (!description.trim()) {
        alert("Please compose announcement content.");
        return;
      }

      const payload = {
        title,
        category: normalizeNotificationCategory(category),
        priority,
        recipientGroup,
        description,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderRole: currentUser.role,
        attachment: loadedFileMeta,
        isPinned: false
      };

      // Optional recipient details
      if (recipientGroup === "branch") {
        payload.targetBranchId = document.getElementById("form-target-branch").value;
        payload.targetSemester = document.getElementById("form-target-semester").value || null;
        payload.targetClass = document.getElementById("form-target-class").value || null;
      } else if (recipientGroup === "teacher") {
        payload.targetTeacherId = document.getElementById("form-target-teacher").value;
        payload.title = `[DIRECT] ${title}`; // Mark direct messages
      } else if (recipientGroup === "student") {
        payload.targetStudentId = document.getElementById("form-target-student").value;
        payload.title = `[DIRECT] ${title}`; // Mark direct messages
      } else if (recipientGroup === "student_group") {
        // Collect checked student IDs from group picker
        const checked = document.querySelectorAll("#student-group-list .student-picker-row input[type='checkbox']:checked");
        const ids = Array.from(checked).map(cb => cb.value);
        if (ids.length === 0) {
          alert("Please select at least one student for the group message.");
          return;
        }
        payload.targetStudentIds = ids;
        payload.title = `[GROUP] ${title}`;
      }

      // Schedule notices (Principal)
      if (currentUser.role === "principal") {
        const scheduleCheck = document.getElementById("form-schedule-check").checked;
        if (scheduleCheck) {
          payload.scheduledFor = document.getElementById("form-schedule-time").value || null;
        }
        payload.isPinned = document.getElementById("form-pin-check").checked;
      }

      // If Edit Mode
      if (notifId) {
        AcademicDB.updateNotification(notifId, payload);
        alert("Notification updated successfully!");
      } else {
        AcademicDB.createNotification(payload);
        alert("Notification published successfully!");
      }

      // Reset form and close modal
      notifForm.reset();
      document.getElementById("form-description-editor").innerHTML = "";
      selectedFileDiv.classList.add("hidden");
      loadedFileMeta = null;
      closeFormModal();
      
      // Redirect to notifications view
      changePage("feed");
    });

    document.getElementById("close-form-modal").addEventListener("click", closeFormModal);
    document.getElementById("cancel-form-btn").addEventListener("click", closeFormModal);

    // Urgent Ticker close hook
    const closeTickerBtn = document.getElementById("close-ticker-btn");
    if (closeTickerBtn) {
      closeTickerBtn.addEventListener("click", () => {
        document.getElementById("urgent-ticker-container").classList.add("hidden");
      });
    }

    window.addEventListener("storage", (event) => {
      if (!currentUser || !event.key) return;
      if (event.key === "college_notifications" || event.key.startsWith("category_")) {
        renderHeader();
        if (["feed", "student_dash", "teacher_dash", "principal_dash", "events", "placements", "academics", "achievements", "circulars"].includes(activePage)) {
          loadActivePage();
        }
      }
    });
  };

  // Toggle Dark Theme
  const toggleTheme = () => {
    const isDark = document.body.classList.toggle("dark-theme");
    localStorage.setItem("college_theme", isDark ? "dark" : "light");
    
    const toggleTxt = document.getElementById("theme-toggle-text");
    if (toggleTxt) toggleTxt.innerText = isDark ? "Light Mode" : "Dark Mode";
  };

  // Render Sidebar
  const renderSidebar = () => {
    const sidebar = document.getElementById("app-sidebar");
    sidebar.classList.remove("open"); // Close mobile drawer
    
    // Profile details
    document.getElementById("sidebar-username").innerText = currentUser.name;
    document.getElementById("sidebar-role").innerText = currentUser.role;
    
    const initials = currentUser.name.split(" ").map(n => n[0]).join("").toUpperCase();
    document.getElementById("sidebar-avatar").innerText = initials;

    AcademicUI.renderSidebarLinks(currentUser.role, activePage, changePage);
  };

  // Filter calculations for user feeds
  const getNotificationsForUser = () => {
    const allNotifs = AcademicDB.getNotifications();
    const now = new Date();

    // Filter out future scheduled notifications unless user is Principal/Admin or sender
    let filtered = allNotifs.filter(n => {
      if (n.scheduledFor && new Date(n.scheduledFor) > now) {
        return currentUser.role === "admin" || currentUser.role === "principal" || n.senderId === currentUser.id;
      }
      return true;
    });

    // Apply role-based access rules
    if (currentUser.role === "student") {
      filtered = filtered.filter(n => {
        if (n.senderId === currentUser.id) return true;
        if (n.recipientGroup === "all" || n.recipientGroup === "students") return true;
        if (n.recipientGroup === "student" && n.targetStudentId === currentUser.id) return true;
        if (n.recipientGroup === "student_group" && Array.isArray(n.targetStudentIds) && n.targetStudentIds.includes(currentUser.id)) return true;
        if (n.recipientGroup === "branch" && n.targetBranchId === currentUser.branchId) {
          if (!n.targetSemester || n.targetSemester === currentUser.semester) return true;
        }
        return false;
      });
    } else if (currentUser.role === "teacher") {
      filtered = filtered.filter(n => {
        if (n.senderId === currentUser.id) return true;
        if (n.recipientGroup === "all" || n.recipientGroup === "staff") return true;
        if (n.recipientGroup === "teacher" && n.targetTeacherId === currentUser.id) return true;
        if (n.recipientGroup === "branch" && n.targetBranchId === currentUser.branchId) return true;
        return false;
      });
    }

    // Sort: pinned first, then newest first
    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  };

  const getUnreadNotificationsForUser = () => {
    const userNotifs = getNotificationsForUser();
    const readRecords = AcademicDB.getReadStatus();
    return userNotifs.filter(n => !readRecords.some(r => r.notificationId === n.id && r.userId === currentUser.id));
  };

  // Render Header (title, avatar, alert bell drop list)
  const renderHeader = () => {
    const initials = currentUser.name.split(" ").map(n => n[0]).join("").toUpperCase();
    document.getElementById("header-user-avatar").innerText = initials;
    document.getElementById("header-user-role-label").innerText = currentUser.role;

    // Set page headers
    let titleText = "College Hub";
    if (activePage.endsWith("dash")) titleText = "Portal Dashboard";
    else if (activePage === "feed") titleText = "Notifications Feed";
    else if (activePage === "create_notification") titleText = "Compose Notice";
    else if (activePage === "admin_approvals" || activePage === "principal_approvals") titleText = "Pending Teacher Approvals";
    else if (activePage === "admin_users") titleText = "Manage System Users";
    else if (activePage === "principal_manage") titleText = "Announcements Directory";
    else if (activePage === "academics") titleText = "📚 Academics";
    else if (activePage === "events") titleText = "🎉 Events";
    else if (activePage === "placements") titleText = "💼 Placements";
    else if (activePage === "achievements") titleText = "🏆 Achievements";
    else if (activePage === "circulars") titleText = "📢 Circulars";
    
    document.getElementById("header-page-title").innerText = titleText;

    // Header Bell update
    const unread = getUnreadNotificationsForUser();
    const bellBadge = document.getElementById("bell-badge");
    const dropdownList = document.getElementById("bell-dropdown-list");

    if (unread.length > 0) {
      bellBadge.innerText = unread.length;
      bellBadge.classList.remove("hidden");
    } else {
      bellBadge.classList.add("hidden");
    }

    dropdownList.innerHTML = "";
    if (unread.length === 0) {
      dropdownList.innerHTML = `<div class="dropdown-empty">All caught up! No unread notifications.</div>`;
    } else {
      unread.slice(0, 5).forEach(n => {
        const item = document.createElement("div");
        item.className = "dropdown-item unread";
        item.innerHTML = `
          <div class="dropdown-item-dot ${n.priority === 'urgent' ? 'urgent' : ''}"></div>
          <div class="dropdown-item-content">
            <h5 class="dropdown-item-title">${n.title}</h5>
            <span class="dropdown-item-time">${AcademicUI.formatTime(n.createdAt)}</span>
          </div>
        `;
        item.addEventListener("click", () => {
          openNotificationDetail(n.id);
        });
        dropdownList.appendChild(item);
      });
    }
  };

  // Navigate view routing
  const changePage = (path) => {
    activePage = path;
    renderSidebar();
    renderHeader();
    loadActivePage();
  };

  // Main Dynamic View Engine Router
  const loadActivePage = () => {
    const pageContent = document.getElementById("page-content");
    pageContent.innerHTML = ""; // Clear mount target

    switch (activePage) {
      case "admin_dash":
        renderAdminDash(pageContent);
        break;
      case "admin_approvals":
      case "principal_approvals":
        renderAdminApprovals(pageContent);
        break;
      case "admin_users":
        renderAdminUsers(pageContent);
        break;
      case "principal_dash":
        renderPrincipalDash(pageContent);
        break;
      case "principal_manage":
        renderPrincipalManage(pageContent);
        break;
      case "teacher_dash":
        renderTeacherDash(pageContent);
        break;
      case "student_dash":
        renderStudentDash(pageContent);
        break;
      case "feed":
        renderFeed(pageContent);
        break;
      case "create_notification":
        renderCreateNotification(pageContent);
        break;
      case "academics":
        renderCategoryPage("academics", pageContent);
        break;
      case "academics_manage":
        pageContent.innerHTML = AcademicUI.renderAcademicsManager();
        renderHeader();
        setTimeout(() => {
          loadCategoryInfo('academics', 'timetable');
          loadCategoryInfo('academics', 'materials');
          loadCategoryInfo('academics', 'calendar');
          loadCategoryInfo('academics', 'exams');
        }, 50);
        break;
      case "events":
        renderCategoryPage("events", pageContent);
        break;
      case "events_manage":
        pageContent.innerHTML = AcademicUI.renderEventsManager();
        renderHeader();
        setTimeout(() => {
          loadCategoryInfo('events', 'upcoming');
          loadCategoryInfo('events', 'clubs');
          loadCategoryInfo('events', 'webinars');
          loadCategoryInfo('events', 'register');
        }, 50);
        break;
      case "placements":
        renderCategoryPage("placements", pageContent);
        break;
      case "placements_manage":
        pageContent.innerHTML = AcademicUI.renderPlacementsManager();
        renderHeader();
        setTimeout(() => {
          loadCategoryInfo('placements', 'jobs');
          loadCategoryInfo('placements', 'timelines');
          loadCategoryInfo('placements', 'resources');
          loadCategoryInfo('placements', 'internships');
        }, 50);
        break;
      case "achievements":
        renderCategoryPage("achievements", pageContent);
        break;
      case "achievements_manage":
        pageContent.innerHTML = AcademicUI.renderAchievementsManager();
        renderHeader();
        setTimeout(() => {
          loadCategoryInfo('achievements', 'student');
          loadCategoryInfo('achievements', 'faculty');
          loadCategoryInfo('achievements', 'stories');
          loadCategoryInfo('achievements', 'recognition');
        }, 50);
        break;
      case "circulars":
        renderCategoryPage("circulars", pageContent);
        break;
      case "circulars_manage":
        pageContent.innerHTML = AcademicUI.renderCircularsManager();
        renderHeader();
        setTimeout(() => {
          loadCategoryInfo('circulars', 'official');
          loadCategoryInfo('circulars', 'holidays');
          loadCategoryInfo('circulars', 'admin');
          loadCategoryInfo('circulars', 'urgent');
        }, 50);
        break;
      default:
        pageContent.innerHTML = `<h2>Page Not Found</h2>`;
    }
  };

  /* ==========================================
     VIEWS IMPLEMENTATION
     ========================================== */

  // 1. ADMIN DASHBOARD
  const renderAdminDash = (container) => {
    const users = AcademicDB.getUsers();
    const notifs = AcademicDB.getNotifications();
    const pendingTeachers = users.filter(u => u.role === "teacher" && u.status === "pending");

    container.innerHTML = `
      <div class="dashboard-grid">
        <div class="stat-card">
          <div class="stat-icon-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <div class="stat-info">
            <h3>${users.length}</h3>
            <p>Total Registered Users</p>
          </div>
        </div>
        <div class="stat-card" style="cursor:pointer;" onclick="AcademicApp.changePage('admin_approvals')">
          <div class="stat-icon-wrapper ${pendingTeachers.length > 0 ? 'red' : 'green'}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <div class="stat-info">
            <h3>${pendingTeachers.length}</h3>
            <p>Pending Approvals</p>
          </div>
        </div>
        <div class="stat-card" style="cursor:pointer;" onclick="AcademicApp.changePage('feed')">
          <div class="stat-icon-wrapper amber">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          </div>
          <div class="stat-info">
            <h3>${notifs.length}</h3>
            <p>Broadcast Alerts Active</p>
          </div>
        </div>
      </div>

      <div class="workspace-layout">
        <div class="section-card">
          <div class="section-card-header">
            <h3>College Notification Density (Branch-wise)</h3>
          </div>
          <div id="chart-branch-container" class="chart-container"></div>
        </div>
        
        <div class="section-card">
          <div class="section-card-header">
            <h3>Category Breakdown</h3>
          </div>
          <div id="chart-category-container" class="chart-container"></div>
        </div>
      </div>

      <div class="section-card" style="margin-top: 24px;">
        <div class="section-card-header">
          <h3>Quick Administration Controls</h3>
        </div>
        <div style="display:flex; gap:12px; flex-wrap:wrap;">
          <button class="btn btn-primary" onclick="AcademicApp.changePage('admin_users')">Manage Portal Users</button>
          <button class="btn btn-outline" onclick="AcademicApp.changePage('admin_approvals')">Approve Teacher Registrations</button>
          <button class="btn btn-outline" onclick="AcademicApp.changePage('feed')">Inspect Live Notification Feed</button>
        </div>
      </div>
    `;

    // Render local SVG Charts
    setTimeout(() => {
      AcademicCharts.renderBranchBarChart("chart-branch-container", notifs);
      AcademicCharts.renderCategoryPieChart("chart-category-container", notifs);
    }, 100);
  };

  // 2. ADMIN PENDING APPROVALS
  const renderAdminApprovals = (container) => {
    const users = AcademicDB.getUsers();
    const pending = users.filter(u => u.role === "teacher" && u.status === "pending");

    if (pending.length === 0) {
      container.innerHTML = `
        <div class="section-card">
          <div class="dropdown-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:48px; height:48px; margin-bottom:12px; color:var(--success);"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            <p>All teacher registration requests are reviewed and approved. Great job!</p>
          </div>
        </div>
      `;
      return;
    }

    let rowsHtml = "";
    pending.forEach(t => {
      const bObj = AcademicDB.getBranchById(t.branchId);
      rowsHtml += `
        <tr>
          <td class="font-semibold">${t.name}</td>
          <td>${t.email}</td>
          <td><span class="user-role-lbl">${bObj ? bObj.name : t.branchId.toUpperCase()}</span></td>
          <td><code>${t.employeeId}</code></td>
          <td>${AcademicUI.formatTime(t.createdAt)}</td>
          <td>
            <div class="action-btn-group">
              <button class="btn btn-primary btn-sm" onclick="AcademicApp.approveTeacher('${t.id}', true)">Approve</button>
              <button class="btn btn-danger btn-sm" onclick="AcademicApp.approveTeacher('${t.id}', false)">Reject</button>
            </div>
          </td>
        </tr>
      `;
    });

    container.innerHTML = `
      <div class="section-card">
        <div class="section-card-header">
          <h3>Teacher Registration Requests</h3>
        </div>
        <div class="custom-table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Teacher Name</th>
                <th>Email ID</th>
                <th>Assigned Branch</th>
                <th>Employee Code</th>
                <th>Submitted On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      </div>
    `;
  };

  // Approve/Reject teacher callbacks
  const approveTeacher = (userId, isApproved) => {
    if (isApproved) {
      AcademicDB.updateUser(userId, { status: "active" });
      alert("Teacher account approved successfully!");
    } else {
      AcademicDB.deleteUser(userId);
      alert("Teacher account rejected and entry deleted.");
    }
    loadActivePage();
    renderHeader();
  };

  // 3. ADMIN PORTAL USERS LIST
  const renderAdminUsers = (container) => {
    const users = AcademicDB.getUsers();
    
    let rowsHtml = "";
    users.forEach(u => {
      const bObj = AcademicDB.getBranchById(u.branchId);
      const branchDisplay = bObj ? bObj.code : "-";
      const semDisplay = u.semester ? `Semester ${u.semester}` : "-";
      const uniqueId = u.rollNumber || u.employeeId || "-";

      rowsHtml += `
        <tr>
          <td class="font-semibold">${u.name}</td>
          <td>${u.email}</td>
          <td><span class="user-role-lbl" style="background:${u.role === 'admin' ? '#f1f5f9' : u.role === 'principal' ? '#e0f2fe' : u.role === 'teacher' ? '#f3e8ff' : '#eff6ff'}; color:${u.role === 'admin' ? '#475569' : u.role === 'principal' ? '#0284c7' : u.role === 'teacher' ? '#a855f7' : 'var(--primary)'};">${u.role}</span></td>
          <td>${branchDisplay}</td>
          <td>${semDisplay}</td>
          <td><code>${uniqueId}</code></td>
          <td><span class="category-pill ${u.status === 'active' ? 'holidays' : 'urgent'}">${u.status}</span></td>
          <td>
            <button class="btn btn-danger btn-sm" onclick="AcademicApp.deleteUserPrompt('${u.id}')" ${u.id === currentUser.id ? 'disabled' : ''}>Delete</button>
          </td>
        </tr>
      `;
    });

    container.innerHTML = `
      <div class="section-card">
        <div class="section-card-header">
          <h3>Manage Portal Users</h3>
          <button class="btn btn-primary btn-sm" onclick="AcademicApp.openAddUserModal()">+ Add New User</button>
        </div>
        <div class="custom-table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email ID</th>
                <th>System Role</th>
                <th>Branch</th>
                <th>Academic Semester</th>
                <th>Registration ID</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      </div>
    `;
  };

  // Add user logic
  const openAddUserModal = () => {
    const name = prompt("Enter Full Name:");
    if (!name) return;
    const email = prompt("Enter Email ID:");
    if (!email) return;
    const role = prompt("Enter Role (admin, principal, teacher, student):");
    if (!role || !["admin", "principal", "teacher", "student"].includes(role.toLowerCase())) {
      alert("Invalid role entered.");
      return;
    }
    const pass = prompt("Create Password:");
    if (!pass) return;

    let branchId = null;
    let semester = null;
    let rollNumber = null;
    let employeeId = null;

    if (role.toLowerCase() === "student" || role.toLowerCase() === "teacher") {
      branchId = prompt("Enter Branch Code (cse, me, ce, ece, eee, ise):");
    }

    if (role.toLowerCase() === "student") {
      semester = prompt("Enter Current Semester (1-8):");
      rollNumber = prompt("Enter Roll Number / USN:");
    } else if (role.toLowerCase() === "teacher") {
      employeeId = prompt("Enter Employee Registration ID:");
    }

    const payload = {
      name,
      email: email.toLowerCase(),
      passwordHash: pass,
      role: role.toLowerCase(),
      branchId: branchId ? branchId.toLowerCase() : null,
      status: "active"
    };

    if (role.toLowerCase() === "student") {
      payload.semester = semester;
      payload.rollNumber = rollNumber;
    } else if (role.toLowerCase() === "teacher") {
      payload.employeeId = employeeId;
    }

    AcademicDB.createUser(payload);
    alert("New Portal User added successfully!");
    loadActivePage();
  };

  const deleteUserPrompt = (userId) => {
    if (confirm("Are you sure you want to delete this user from the system?")) {
      AcademicDB.deleteUser(userId);
      alert("User deleted successfully.");
      loadActivePage();
    }
  };

  // 4. PRINCIPAL DASHBOARD
  const renderPrincipalDash = (container) => {
    const allNotifs = AcademicDB.getNotifications();
    const principalNotifs = allNotifs.filter(n => n.senderId === currentUser.id);
    const now = new Date();
    const scheduled = principalNotifs.filter(n => n.scheduledFor && new Date(n.scheduledFor) > now);

    container.innerHTML = `
      <div class="dashboard-grid">
        <div class="stat-card" style="cursor:pointer;" onclick="AcademicApp.changePage('feed')">
          <div class="stat-icon-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          </div>
          <div class="stat-info">
            <h3>${allNotifs.length}</h3>
            <p>Active Notice Board</p>
          </div>
        </div>
        <div class="stat-card" style="cursor:pointer;" onclick="AcademicApp.changePage('principal_manage')">
          <div class="stat-icon-wrapper green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9M3 20h3M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/></svg>
          </div>
          <div class="stat-info">
            <h3>${principalNotifs.length}</h3>
            <p>Notices Posted by Me</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-wrapper amber">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <div class="stat-info">
            <h3>${scheduled.length}</h3>
            <p>Scheduled Circulars</p>
          </div>
        </div>
      </div>

      <div class="workspace-layout">
        <div class="section-card">
          <div class="section-card-header">
            <h3>Recent Announcements</h3>
            <button class="text-btn" onclick="AcademicApp.changePage('feed')">View all feed</button>
          </div>
          <div class="notification-feed" id="principal-recent-feed"></div>
        </div>

        <div class="section-card">
          <div class="section-card-header">
            <h3>Administrative Quick Links</h3>
          </div>
          <div style="display:flex; flex-direction:column; gap:12px;">
            <button class="btn btn-primary" onclick="AcademicApp.changePage('create_notification')">Compose New Notice</button>
            <button class="btn btn-outline" onclick="AcademicApp.changePage('principal_approvals')">Review Staff Registration Requests</button>
            <button class="btn btn-outline" onclick="AcademicApp.changePage('principal_manage')">Manage My Announcements</button>
            <button class="btn btn-outline" onclick="AcademicApp.changePage('feed')">Go to Notice Board</button>
          </div>
        </div>
      </div>
    `;

    // Render feed snippet
    const feed = getNotificationsForUser().slice(0, 3);
    const feedContainer = document.getElementById("principal-recent-feed");
    if (feed.length === 0) {
      feedContainer.innerHTML = `<div class="dropdown-empty">No announcements published yet.</div>`;
    } else {
      feed.forEach(n => {
        const card = AcademicUI.createNotificationCard(n, currentUser, handleCardAction, openNotificationDetail);
        feedContainer.appendChild(card);
      });
    }
  };

  // Manage notices posted by Principal (Principal Hub)
  const renderPrincipalManage = (container) => {
    const myNotifs = AcademicDB.getNotifications().filter(n => n.senderId === currentUser.id);

    if (myNotifs.length === 0) {
      container.innerHTML = `
        <div class="section-card">
          <div class="dropdown-empty">
            <p>You have not published any announcements yet.</p>
            <button class="btn btn-primary mt-2" onclick="AcademicApp.changePage('create_notification')">Publish First Notice</button>
          </div>
        </div>
      `;
      return;
    }

    let rowsHtml = "";
    myNotifs.forEach(n => {
      let aud = "Global";
      if (n.recipientGroup === "branch") {
        const b = AcademicDB.getBranchById(n.targetBranchId);
        aud = b ? b.code : n.targetBranchId.toUpperCase();
        if (n.targetSemester) aud += ` - Sem ${n.targetSemester}`;
      } else if (n.recipientGroup === "staff") {
        aud = "Staff";
      } else if (n.recipientGroup === "students") {
        aud = "Students";
      }

      rowsHtml += `
        <tr>
          <td class="font-semibold">${n.title}</td>
          <td><span class="category-pill ${n.category}">${n.category}</span></td>
          <td><span class="priority-badge ${n.priority}">${n.priority}</span></td>
          <td>${aud}</td>
          <td>${AcademicUI.formatTime(n.createdAt)}</td>
          <td>${n.isPinned ? 'Yes' : 'No'}</td>
          <td>
            <div class="action-btn-group">
              <button class="btn btn-outline btn-sm" onclick="AcademicApp.handleCardAction('edit', '${n.id}')">Edit</button>
              <button class="btn btn-danger btn-sm" onclick="AcademicApp.handleCardAction('delete', '${n.id}')">Delete</button>
            </div>
          </td>
        </tr>
      `;
    });

    container.innerHTML = `
      <div class="section-card">
        <div class="section-card-header">
          <h3>Published Notice Board History</h3>
          <button class="btn btn-primary btn-sm" onclick="AcademicApp.changePage('create_notification')">+ Publish Announcement</button>
        </div>
        <div class="custom-table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Target Scope</th>
                <th>Created On</th>
                <th>Pinned</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      </div>
    `;
  };

  // 5. TEACHER DASHBOARD
  const renderTeacherDash = (container) => {
    const myBranch = AcademicDB.getBranchById(currentUser.branchId);
    const branchName = myBranch ? myBranch.name : "";
    const allNotifs = AcademicDB.getNotifications();
    const branchNotifs = allNotifs.filter(n => n.targetBranchId === currentUser.branchId);
    const myNotifs = allNotifs.filter(n => n.senderId === currentUser.id);

    container.innerHTML = `
      <div class="dashboard-grid">
        <div class="stat-card">
          <div class="stat-icon-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>
          </div>
          <div class="stat-info">
            <h4 style="font-size:16px;">${myBranch ? myBranch.code : ""} Branch</h4>
            <p>${branchName}</p>
          </div>
        </div>
        <div class="stat-card" style="cursor:pointer;" onclick="AcademicApp.changePage('feed')">
          <div class="stat-icon-wrapper green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          </div>
          <div class="stat-info">
            <h3>${branchNotifs.length}</h3>
            <p>Active Branch Notices</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-wrapper amber">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9M3 20h3M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/></svg>
          </div>
          <div class="stat-info">
            <h3>${myNotifs.length}</h3>
            <p>Announcements Posted by Me</p>
          </div>
        </div>
      </div>

      <div class="workspace-layout">
        <div class="section-card">
          <div class="section-card-header">
            <h3>My Branch Notifications Activity</h3>
            <button class="text-btn" onclick="AcademicApp.changePage('feed')">View full feed</button>
          </div>
          <div class="notification-feed" id="teacher-recent-feed"></div>
        </div>

        <div class="section-card">
          <div class="section-card-header">
            <h3>Faculty Action Dashboard</h3>
          </div>
          <div style="display:flex; flex-direction:column; gap:12px;">
            <button class="btn btn-primary" onclick="AcademicApp.changePage('create_notification')">Post Academic Circular</button>
            <button class="btn btn-outline" onclick="AcademicApp.changePage('feed')">Inspect Branch Feed</button>
          </div>
        </div>
      </div>
    `;

    // Render feed
    const feed = getNotificationsForUser().slice(0, 3);
    const feedContainer = document.getElementById("teacher-recent-feed");
    if (feed.length === 0) {
      feedContainer.innerHTML = `<div class="dropdown-empty">No announcements found.</div>`;
    } else {
      feed.forEach(n => {
        const card = AcademicUI.createNotificationCard(n, currentUser, handleCardAction, openNotificationDetail);
        feedContainer.appendChild(card);
      });
    }
  };

  // 6. STUDENT DASHBOARD
  const renderStudentDash = (container) => {
    const studentBranch = AcademicDB.getBranchById(currentUser.branchId);
    const branchNotifs = AcademicDB.getNotifications().filter(n => n.targetBranchId === currentUser.branchId);
    const unread = getUnreadNotificationsForUser();

    container.innerHTML = `
      <div class="dashboard-grid">
        <div class="stat-card">
          <div class="stat-icon-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>
          </div>
          <div class="stat-info">
            <h4 style="font-size:16px;">${studentBranch ? studentBranch.code : ""} Branch</h4>
            <p>Semester ${currentUser.semester}</p>
          </div>
        </div>
        <div class="stat-card" style="cursor:pointer;" onclick="AcademicApp.changePage('feed')">
          <div class="stat-icon-wrapper red">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
          </div>
          <div class="stat-info">
            <h3>${unread.length}</h3>
            <p>New Alerts Unread</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-wrapper green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 8l4 4-4 4M8 12h8"/></svg>
          </div>
          <div class="stat-info">
            <h3>${branchNotifs.length}</h3>
            <p>Total Branch Notices</p>
          </div>
        </div>
      </div>

      <div class="workspace-layout">
        <!-- Main notices feed -->
        <div class="section-card">
          <div class="section-card-header">
            <h3>Notice Board Overview</h3>
            <button class="text-btn" onclick="AcademicApp.changePage('feed')">Search & Filter Feed</button>
          </div>
          <div class="notification-feed" id="student-recent-feed"></div>
        </div>

        <!-- Sidebar helper items for Student dashboard -->
        <div>
          <div class="section-card">
            <div class="section-card-header">
              <h3>Academic Schedule Info</h3>
            </div>
            <div style="font-size:13px; display:flex; flex-direction:column; gap:10px;">
              <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border); padding-bottom:6px;">
                <span>Semester Exams:</span>
                <span class="font-semibold text-primary">Pending datesheet</span>
              </div>
              <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border); padding-bottom:6px;">
                <span>Min Attendance:</span>
                <span class="font-semibold text-danger">75.0% Required</span>
              </div>
              <div style="display:flex; justify-content:space-between; padding-bottom:6px;">
                <span>Current Profile:</span>
                <span class="font-semibold">${currentUser.rollNumber}</span>
              </div>
            </div>
          </div>

          <div class="section-card">
            <div class="section-card-header">
              <h3>Quick Filter Feed</h3>
            </div>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              <button class="filter-pill" onclick="AcademicApp.applyQuickFilter('exams')">Exams</button>
              <button class="filter-pill" onclick="AcademicApp.applyQuickFilter('circulars')">Circulars</button>
              <button class="filter-pill" onclick="AcademicApp.applyQuickFilter('placement')">Placements</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Render feed
    const feed = getNotificationsForUser().slice(0, 4);
    const feedContainer = document.getElementById("student-recent-feed");
    if (feed.length === 0) {
      feedContainer.innerHTML = `<div class="dropdown-empty">All quiet on the notice board!</div>`;
    } else {
      feed.forEach(n => {
        const card = AcademicUI.createNotificationCard(n, currentUser, handleCardAction, openNotificationDetail);
        feedContainer.appendChild(card);
      });
    }
  };

  const applyQuickFilter = (cat) => {
    activeFilters.category = cat;
    changePage("feed");
  };

  // 7. COMPREHENSIVE PORTAL LIVE NOTICE BOARD (FEED VIEW)
  const renderFeed = (container) => {
    const list = getNotificationsForUser();

    // Compile filter results
    const filtered = list.filter(n => {
      if (activeFilters.category && normalizeNotificationCategory(n.category) !== activeFilters.category) return false;
      if (activeFilters.branch && n.targetBranchId !== activeFilters.branch) return false;
      if (activeFilters.semester && n.targetSemester !== activeFilters.semester) return false;
      if (activeFilters.query) {
        const q = activeFilters.query.toLowerCase();
        const matchesTitle = n.title.toLowerCase().includes(q);
        const matchesDesc = n.description.toLowerCase().includes(q);
        const matchesSender = n.senderName.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesSender) return false;
      }
      return true;
    });

    const categoryFilters = [
      { id: "", label: "All Categories" },
      { id: "circulars", label: "Circulars" },
      { id: "exams", label: "Exams" },
      { id: "attendance", label: "Attendance" },
      { id: "placement", label: "Placements" },
      { id: "events", label: "Events" },
      { id: "holidays", label: "Holidays" },
      { id: "urgent", label: "Urgent" }
    ];

    const categoryPillsHtml = categoryFilters.map(cf => `
      <button class="filter-pill ${activeFilters.category === cf.id ? 'active' : ''}" onclick="AcademicApp.setFeedFilter('category', '${cf.id}')">${cf.label}</button>
    `).join("");

    // Branch filters visible only to Principal/Admin (Teachers and students are auto-filtered to their branch, but Principal can filter view)
    let branchFilterHtml = "";
    if (currentUser.role === "admin" || currentUser.role === "principal") {
      const branches = AcademicDB.getBranches();
      const branchOptions = branches.map(b => `<option value="${b.id}" ${activeFilters.branch === b.id ? 'selected' : ''}>${b.name}</option>`).join("");
      
      branchFilterHtml = `
        <select class="form-select" style="padding: 6px 12px; font-size:13px;" onchange="AcademicApp.setFeedFilter('branch', this.value)">
          <option value="">All Branches</option>
          ${branchOptions}
        </select>
      `;
    }

    let searchVal = activeFilters.query ? `value="${activeFilters.query}"` : "";

    container.innerHTML = `
      <div class="section-card">
        <div class="feed-filters-bar">
          <div class="search-input-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" id="feed-search-input" class="form-input" placeholder="Search notifications by title, sender, content..." ${searchVal}>
          </div>
          ${branchFilterHtml}
          <!-- Sem Filter -->
          <select class="form-select" style="padding: 6px 12px; font-size:13px;" onchange="AcademicApp.setFeedFilter('semester', this.value)">
            <option value="">All Semesters</option>
            <option value="1" ${activeFilters.semester === '1' ? 'selected' : ''}>Semester 1</option>
            <option value="2" ${activeFilters.semester === '2' ? 'selected' : ''}>Semester 2</option>
            <option value="3" ${activeFilters.semester === '3' ? 'selected' : ''}>Semester 3</option>
            <option value="4" ${activeFilters.semester === '4' ? 'selected' : ''}>Semester 4</option>
            <option value="5" ${activeFilters.semester === '5' ? 'selected' : ''}>Semester 5</option>
            <option value="6" ${activeFilters.semester === '6' ? 'selected' : ''}>Semester 6</option>
            <option value="7" ${activeFilters.semester === '7' ? 'selected' : ''}>Semester 7</option>
            <option value="8" ${activeFilters.semester === '8' ? 'selected' : ''}>Semester 8</option>
          </select>
        </div>

        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom: 24px;">
          ${categoryPillsHtml}
        </div>

        <div class="notification-feed" id="live-feed-cards"></div>
      </div>
    `;

    // Render cards
    const cardContainer = document.getElementById("live-feed-cards");
    if (filtered.length === 0) {
      cardContainer.innerHTML = `
        <div class="dropdown-empty">
          <p>No circulars matching your current filter filters were found.</p>
        </div>
      `;
    } else {
      filtered.forEach(n => {
        const card = AcademicUI.createNotificationCard(n, currentUser, handleCardAction, openNotificationDetail);
        cardContainer.appendChild(card);
      });
    }

    // Bind Search Input typing trigger
    const searchInp = document.getElementById("feed-search-input");
    searchInp.addEventListener("input", (e) => {
      activeFilters.query = e.target.value;
      // Filter dynamically
      setTimeout(() => {
        // Double check query to prevent typing lag rendering errors
        if (activeFilters.query === searchInp.value) {
          loadActivePage();
        }
      }, 350);
    });
  };

  const setFeedFilter = (type, val) => {
    activeFilters[type] = val;
    loadActivePage();
  };

  // 8. NOTIFICATION PUBLISH VIEW
  const renderCreateNotification = (container) => {
    // We already have a modal layout in index.html to create notifications!
    // But since the user wants a full responsive dashboard experience, we will open the Create form modal when clicking this view path.
    // It's much cleaner to mount a placeholder card telling the user the publisher form is active, and trigger the modal immediately!
    
    container.innerHTML = `
      <div class="section-card">
        <div class="dropdown-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:48px; height:48px; color:var(--primary); margin-bottom:12px;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          <h3 style="margin-bottom:8px;">Compose Notification Publisher</h3>
          <p>The circular authoring editor has been opened in the popup screen overlay. Please complete and publish your notice.</p>
          <button class="btn btn-primary mt-2" onclick="AcademicApp.openNotifPublishOverlay()">Open Announcement Publisher</button>
        </div>
      </div>
    `;

    // Open notice overlay form
    openNotifPublishOverlay();
  };

  // Dynamic overlay form fields based on Role
  const openNotifPublishOverlay = (notifId = null, categoryOverride = null) => {
    const modal = document.getElementById("notification-form-modal");
    const scopeSel = document.getElementById("form-recipient-group");
    const targetBranchDiv = document.getElementById("group-target-branch");
    const targetSemDiv = document.getElementById("group-target-semester");
    const targetTeacherDiv = document.getElementById("group-target-teacher");
    const targetStudentDiv = document.getElementById("group-target-student");
    const targetClassDiv = document.getElementById("group-target-class");
    const groupSchedule = document.getElementById("group-schedule");
    const groupPin = document.getElementById("group-pin");
    const formCategory = document.getElementById("form-category");

    modal.classList.remove("hidden");

    // Pre-select category if passed from category page
    let selectedCategory = null;
    if (categoryOverride) {
      const categoryMap = {
        "academics": "academics",
        "events": "events",
        "placements": "placement",
        "achievements": "achievements",
        "circulars": "circulars"
      };
      if (categoryMap[categoryOverride]) {
        selectedCategory = categoryMap[categoryOverride];
        formCategory.value = selectedCategory;
      }
    }

    // Clear and populate scopes based on Role
    scopeSel.innerHTML = "";
    if (currentUser.role === "principal") {
      scopeSel.innerHTML = `
        <option value="all">All Students & Staff</option>
        <option value="staff">Staff Only</option>
        <option value="students">All Students</option>
        <option value="branch">Specific Branch</option>
        <option value="teacher">Individual Teacher</option>
        <option value="student">Individual Student</option>
        <option value="student_group">Group of Students (by Name / USN)</option>
      `;
      groupSchedule.classList.remove("hidden");
      groupPin.classList.remove("hidden");
    } else if (currentUser.role === "teacher") {
      // Teachers can only broadcast to students of their branch or direct message a student
      scopeSel.innerHTML = `
        <option value="branch">My Branch Students</option>
        <option value="student">Individual Student</option>
      `;
      // Auto assign branch properties
      targetBranchDiv.classList.add("hidden"); // Hidden because it's locked to teacher's branch
      targetSemDiv.classList.remove("hidden");
      targetClassDiv.classList.remove("hidden");

      groupSchedule.classList.add("hidden");
      groupPin.classList.add("hidden");
    }

    // Populate branches select
    const branchSel = document.getElementById("form-target-branch");
    branchSel.innerHTML = AcademicDB.getBranches().map(b => `<option value="${b.id}">${b.name}</option>`).join("");
    if (currentUser.role === "teacher") {
      branchSel.value = currentUser.branchId;
    }

    // Populate teachers list
    const teacherSel = document.getElementById("form-target-teacher");
    teacherSel.innerHTML = AcademicDB.getUsers()
      .filter(u => u.role === "teacher" && u.status === "active")
      .map(t => `<option value="${t.id}">${t.name} (${t.branchId.toUpperCase()})</option>`).join("");

    // Populate students list
    const studentSel = document.getElementById("form-target-student");
    let studentList = AcademicDB.getUsers().filter(u => u.role === "student" && u.status === "active");
    if (currentUser.role === "teacher") {
      studentList = studentList.filter(u => u.branchId === currentUser.branchId);
    }
    studentSel.innerHTML = studentList
      .map(s => `<option value="${s.id}">${s.name} (${s.branchId ? s.branchId.toUpperCase() : ''} - Sem ${s.semester})</option>`).join("");

    // Group student picker state
    let allStudentsForPicker = AcademicDB.getUsers().filter(u => u.role === "student" && u.status === "active");
    const selectedGroupIds = new Set();

    const renderStudentGroupPicker = (filterText = "", filterBranch = "") => {
      const list = document.getElementById("student-group-list");
      if (!list) return;
      const term = filterText.toLowerCase();
      const filtered = allStudentsForPicker.filter(s => {
        const matchesBranch = !filterBranch || s.branchId === filterBranch;
        const matchesText = !term ||
          s.name.toLowerCase().includes(term) ||
          (s.rollNumber && s.rollNumber.toLowerCase().includes(term));
        return matchesBranch && matchesText;
      });
      list.innerHTML = "";
      if (filtered.length === 0) return; // empty::after CSS handles this
      filtered.forEach(s => {
        const row = document.createElement("label");
        row.className = `student-picker-row${selectedGroupIds.has(s.id) ? ' selected' : ''}`;
        const branchCode = s.branchId ? s.branchId.toUpperCase() : '';
        row.innerHTML = `
          <input type="checkbox" value="${s.id}" ${selectedGroupIds.has(s.id) ? 'checked' : ''}>
          <span class="picker-name">${s.name}</span>
          <span class="picker-usn">${s.rollNumber || 'No USN'}</span>
          <span class="picker-meta">${branchCode} &bull; Sem ${s.semester}</span>
        `;
        const cb = row.querySelector('input');
        cb.addEventListener('change', () => {
          if (cb.checked) selectedGroupIds.add(s.id);
          else selectedGroupIds.delete(s.id);
          row.classList.toggle('selected', cb.checked);
          renderGroupTags();
        });
        list.appendChild(row);
      });
    };

    const renderGroupTags = () => {
      const tagsDiv = document.getElementById("student-group-selected-tags");
      const countEl = document.getElementById("student-group-count");
      if (!tagsDiv) return;
      tagsDiv.innerHTML = "";
      selectedGroupIds.forEach(id => {
        const s = AcademicDB.getUserById(id);
        if (!s) return;
        const tag = document.createElement("span");
        tag.className = "student-tag";
        tag.innerHTML = `${s.name} <button type="button" data-id="${s.id}">&times;</button>`;
        tag.querySelector('button').addEventListener('click', () => {
          selectedGroupIds.delete(s.id);
          // Uncheck if visible
          const cb = document.querySelector(`#student-group-list input[value="${s.id}"]`);
          if (cb) { cb.checked = false; cb.closest('.student-picker-row').classList.remove('selected'); }
          renderGroupTags();
        });
        tagsDiv.appendChild(tag);
      });
      if (countEl) countEl.textContent = `${selectedGroupIds.size} student${selectedGroupIds.size !== 1 ? 's' : ''} selected`;
    };

    // Populate branch filter in picker
    const branchFilterSel = document.getElementById("student-group-branch-filter");
    if (branchFilterSel && branchFilterSel.options.length === 1) {
      AcademicDB.getBranches().forEach(b => {
        const opt = document.createElement('option');
        opt.value = b.id; opt.textContent = b.code + ' - ' + b.name;
        branchFilterSel.appendChild(opt);
      });
    }

    // Search + branch filter live
    const searchInp = document.getElementById("student-group-search");
    if (searchInp) searchInp.addEventListener('input', () => renderStudentGroupPicker(searchInp.value, branchFilterSel ? branchFilterSel.value : ''));
    if (branchFilterSel) branchFilterSel.addEventListener('change', () => renderStudentGroupPicker(searchInp ? searchInp.value : '', branchFilterSel.value));

    // Clear all
    const clearBtn = document.getElementById("student-group-clear");
    if (clearBtn) clearBtn.addEventListener('click', () => {
      selectedGroupIds.clear();
      renderStudentGroupPicker(searchInp ? searchInp.value : '', branchFilterSel ? branchFilterSel.value : '');
      renderGroupTags();
    });

    // Wire scope visibility toggles
    const targetStudentGroupDiv = document.getElementById("group-target-student-group");
    const handleScopeChange = (scopeVal) => {
      targetBranchDiv.classList.add("hidden");
      targetSemDiv.classList.add("hidden");
      targetTeacherDiv.classList.add("hidden");
      targetStudentDiv.classList.add("hidden");
      if (targetStudentGroupDiv) targetStudentGroupDiv.classList.add("hidden");
      targetClassDiv.classList.add("hidden");

      if (scopeVal === "branch") {
        if (currentUser.role === "principal" || currentUser.role === "admin") {
          targetBranchDiv.classList.remove("hidden");
        }
        targetSemDiv.classList.remove("hidden");
        targetClassDiv.classList.remove("hidden");
      } else if (scopeVal === "teacher") {
        targetTeacherDiv.classList.remove("hidden");
      } else if (scopeVal === "student") {
        targetStudentDiv.classList.remove("hidden");
      } else if (scopeVal === "student_group") {
        if (targetStudentGroupDiv) {
          targetStudentGroupDiv.classList.remove("hidden");
          renderStudentGroupPicker();
          renderGroupTags();
        }
      }
    };

    scopeSel.addEventListener("change", (e) => handleScopeChange(e.target.value));

    // Handle Principal Schedule checkbox toggle
    const schedCheck = document.getElementById("form-schedule-check");
    const schedTime = document.getElementById("form-schedule-time");
    schedCheck.addEventListener("change", (e) => {
      if (e.target.checked) schedTime.classList.remove("hidden");
      else schedTime.classList.add("hidden");
    });

    // Preset data if editing
    if (notifId) {
      const notif = AcademicDB.getNotificationById(notifId);
      document.getElementById("form-modal-title").innerText = "Edit Notification";
      document.getElementById("form-notif-id").value = notif.id;
      document.getElementById("form-title").value = notif.title;
      document.getElementById("form-category").value = normalizeNotificationCategory(notif.category);
      document.getElementById("form-priority").value = notif.priority;
      scopeSel.value = notif.recipientGroup;
      
      handleScopeChange(notif.recipientGroup);
      
      if (notif.recipientGroup === "branch") {
        branchSel.value = notif.targetBranchId;
        document.getElementById("form-target-semester").value = notif.targetSemester || "";
        document.getElementById("form-target-class").value = notif.targetClass || "";
      } else if (notif.recipientGroup === "teacher") {
        teacherSel.value = notif.targetTeacherId || "";
      } else if (notif.recipientGroup === "student") {
        studentSel.value = notif.targetStudentId || "";
      }

      if (currentUser.role === "principal") {
        document.getElementById("form-pin-check").checked = notif.isPinned;
        if (notif.scheduledFor) {
          schedCheck.checked = true;
          schedTime.value = notif.scheduledFor.slice(0, 16);
          schedTime.classList.remove("hidden");
        }
      }

      document.getElementById("form-description-editor").innerHTML = notif.description;

      if (notif.attachment) {
        document.getElementById("file-upload-selected").classList.remove("hidden");
        document.getElementById("selected-file-name").innerText = `${notif.attachment.fileName} (${notif.attachment.fileSize})`;
      }
    } else {
      document.getElementById("form-modal-title").innerText = "Create Notification";
      document.getElementById("form-notif-id").value = "";
      document.getElementById("notification-submit-form").reset();
      if (selectedCategory) formCategory.value = selectedCategory;
      document.getElementById("form-description-editor").innerHTML = "";
      document.getElementById("file-upload-selected").classList.add("hidden");
      // Set default scopes
      handleScopeChange(scopeSel.value);
    }
  };

  // Close create overlays
  const closeFormModal = () => {
    document.getElementById("notification-form-modal").classList.add("hidden");
    // If on compose notices path, route back to dashboard on cancel/submit
    if (activePage === "create_notification") {
      if (currentUser.role === "admin") changePage("admin_dash");
      else if (currentUser.role === "principal") changePage("principal_dash");
      else if (currentUser.role === "teacher") changePage("teacher_dash");
    }
  };

  // Edit/Delete notifications hubs
  const handleCardAction = (action, notifId) => {
    if (action === "edit") {
      openNotifPublishOverlay(notifId);
    } else if (action === "delete") {
      if (confirm("Are you sure you want to delete this notification circular? This cannot be undone.")) {
        AcademicDB.deleteNotification(notifId);
        alert("Notification deleted successfully.");
        loadActivePage();
        renderHeader();
      }
    }
  };

  /* ==========================================
     DETAIL OVERLAY VIEW & FEEDBACK OPERATIONS
     ========================================== */

  // View circular details modal
  const openNotificationDetail = (id) => {
    const notif = AcademicDB.getNotificationById(id);
    if (!notif) return;

    // Mark as read in DB
    AcademicDB.markAsRead(notif.id, currentUser.id);
    renderHeader(); // Refresh unread badges

    // Populate modal DOM values
    const modal = document.getElementById("notification-detail-modal");
    modal.classList.remove("hidden");

    // Title groups
    const catPill = document.getElementById("modal-notif-category");
    catPill.className = `category-pill ${normalizeNotificationCategory(notif.category)}`;
    catPill.innerText = getCategoryLabel(notif.category);

    const priBadge = document.getElementById("modal-notif-priority");
    priBadge.className = `priority-badge ${notif.priority}`;
    priBadge.innerText = notif.priority;

    document.getElementById("modal-notif-title").innerText = notif.title;
    document.getElementById("modal-notif-sender").innerText = `${notif.senderName} (${notif.senderRole.toUpperCase()})`;
    document.getElementById("modal-notif-date").innerText = AcademicUI.formatTime(notif.createdAt);

    // Audience calculation
    let audStr = "";
    if (notif.recipientGroup === "all") audStr = "Entire College";
    else if (notif.recipientGroup === "staff") audStr = "Staff Only";
    else if (notif.recipientGroup === "students") audStr = "All Students";
    else if (notif.recipientGroup === "branch") {
      const bObj = AcademicDB.getBranchById(notif.targetBranchId);
      audStr = bObj ? bObj.name : notif.targetBranchId.toUpperCase();
      if (notif.targetSemester) audStr += ` - Semester ${notif.targetSemester}`;
      if (notif.targetClass) audStr += ` [Class: ${notif.targetClass}]`;
    }
    document.getElementById("modal-notif-audience").innerText = audStr;

    // HTML description injection
    document.getElementById("modal-notif-description").innerHTML = notif.description;

    // File attachments panel logic
    const attachDiv = document.getElementById("modal-notif-attachment-section");
    if (notif.attachment) {
      attachDiv.classList.remove("hidden");
      document.getElementById("modal-notif-file-name").innerText = notif.attachment.fileName;
      document.getElementById("modal-notif-file-size").innerText = notif.attachment.fileSize;
      
      // View button - opens preview
      const viewBtn = document.getElementById("modal-notif-view-btn");
      viewBtn.onclick = () => {
        const previewModal = document.getElementById("file-preview-modal");
        const previewContent = document.getElementById("preview-content");
        const previewFileName = document.getElementById("preview-file-name");
        
        previewFileName.innerText = notif.attachment.fileName;
        
        // Determine file type
        const fileName = notif.attachment.fileName.toLowerCase();
        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
        const isPdf = /\.pdf$/i.test(fileName);
        
        if (isImage) {
          // Show image preview
          previewContent.innerHTML = `
            <div style="text-align: center;">
              <img src="${notif.attachment.fileData || '#'}" style="max-width: 100%; max-height: 70vh; border-radius: 8px;" alt="Preview">
              <div style="margin-top: 16px;">
                <button class="btn btn-primary" onclick="document.getElementById('modal-notif-download-btn').click()">
                  Download Image
                </button>
              </div>
            </div>
          `;
        } else if (isPdf) {
          // Show PDF preview message
          previewContent.innerHTML = `
            <div style="text-align: center; padding: 40px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 60px; height: 60px; margin: 0 auto 16px; opacity: 0.5;">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              <h3>PDF File</h3>
              <p style="color: var(--text-muted); margin: 12px 0;">This is a PDF file. Click the button below to download and view it.</p>
              <button class="btn btn-primary" onclick="document.getElementById('modal-notif-download-btn').click()">
                Download PDF
              </button>
            </div>
          `;
        } else {
          // Generic file preview
          previewContent.innerHTML = `
            <div style="text-align: center; padding: 40px;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 60px; height: 60px; margin: 0 auto 16px; opacity: 0.5;">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              <h3>${notif.attachment.fileName}</h3>
              <p style="color: var(--text-muted); margin: 12px 0;">File size: ${notif.attachment.fileSize}</p>
              <button class="btn btn-primary" onclick="document.getElementById('modal-notif-download-btn').click()">
                Download File
              </button>
            </div>
          `;
        }
        
        previewModal.classList.remove("hidden");
      };
      
      // Close preview modal
      const closePreviewBtn = document.getElementById("close-preview-modal");
      closePreviewBtn.onclick = () => {
        document.getElementById("file-preview-modal").classList.add("hidden");
      };
      
      // Download button
      const dlBtn = document.getElementById("modal-notif-download-btn");
      dlBtn.onclick = () => {
        // Simulated direct browser downloads
        const link = document.createElement("a");
        link.href = notif.attachment.fileData || "#";
        link.download = notif.attachment.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
    } else {
      attachDiv.classList.add("hidden");
    }

    // Student feedback panel setup
    const feedSection = document.getElementById("modal-notif-feedback-section");
    if (currentUser.role === "student" || currentUser.role === "teacher" || currentUser.role === "principal") {
      feedSection.classList.remove("hidden");
      renderFeedbackList(notif.id);

      // Handle feedback submission
      const feedForm = document.getElementById("feedback-form");
      feedForm.onsubmit = (e) => {
        e.preventDefault();
        const inp = document.getElementById("feedback-input");
        const val = inp.value.trim();
        if (val) {
          AcademicDB.addFeedback(notif.id, currentUser.id, currentUser.name, val);
          inp.value = "";
          renderFeedbackList(notif.id);
        }
      };
    } else {
      feedSection.classList.add("hidden");
    }

    // PDF Print Export button trigger
    document.getElementById("modal-export-pdf-btn").onclick = () => {
      AcademicUI.exportNotificationAsPDF(notif);
    };
  };

  const renderFeedbackList = (notifId) => {
    const listDiv = document.getElementById("feedback-list");
    listDiv.innerHTML = "";

    const feedbacks = AcademicDB.getFeedbackForNotification(notifId);
    if (feedbacks.length === 0) {
      listDiv.innerHTML = `<div style="font-size:12px; color:var(--text-muted); text-align:center; padding:10px;">No comments/feedback left yet.</div>`;
    } else {
      feedbacks.forEach(f => {
        const item = document.createElement("div");
        item.className = "feedback-item";
        item.innerHTML = `
          <div class="feedback-item-header">
            <span class="feedback-item-sender">${f.studentName}</span>
            <span>${AcademicUI.formatTime(f.createdAt)}</span>
          </div>
          <div>${f.comment}</div>
        `;
        listDiv.appendChild(item);
      });
      // Scroll to bottom of comments feed
      listDiv.scrollTop = listDiv.scrollHeight;
    }
  };

  const closeDetailModal = () => {
    document.getElementById("notification-detail-modal").classList.add("hidden");
  };

  const renderCategoryPage = (category, container) => {
    let html = "";
    
    switch(category) {
      case "academics":
        html = AcademicUI.renderAcademicsPage();
        break;
      case "events":
        html = AcademicUI.renderEventsPage();
        break;
      case "placements":
        html = AcademicUI.renderPlacementsPage();
        break;
      case "achievements":
        html = AcademicUI.renderAchievementsPage();
        break;
      case "circulars":
        html = AcademicUI.renderCircularsPage();
        break;
      default:
        html = `<h2>Category not found</h2>`;
    }
    
    container.innerHTML = html;
    
    // Attach event listeners to all Add buttons after rendering
    setTimeout(() => {
      const addButtons = container.querySelectorAll('.add-category-btn');
      addButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const cat = btn.getAttribute('data-category');
          openNotifPublishOverlay(null, cat);
        });
      });
    }, 50);
  };

  const showCategoryDetails = (category, section) => {
    const isStaff = window.currentUserRole && (window.currentUserRole === "principal" || window.currentUserRole === "teacher" || window.currentUserRole === "admin");
    
    const categoryTitles = {
      'academics': '📚 Academics',
      'events': '🎉 Events',
      'placements': '💼 Placements',
      'achievements': '🏆 Achievements',
      'circulars': '📢 Circulars'
    };

    const defaultData = {
      // Academics
      'academics.timetable': { title: 'Semester Timetable', placeholder: 'Class Schedule:\nMonday: 9AM-12PM (Math)\nTuesday: 10AM-1PM (Physics)\nWednesday: 2PM-5PM (Chemistry)\n\nAdd class timings and subjects here...' },
      'academics.materials': { title: 'Syllabus & Course Materials', placeholder: 'Course Materials:\n- Syllabus PDF\n- Lecture Notes (Chapter 1-5)\n- Reference Books\n- Practice Questions\n\nLink to download materials here...' },
      'academics.calendar': { title: 'Academic Calendar', placeholder: 'Academic Calendar 2024-25:\nSemester Start: August 1\nMid Semester Exam: October 15\nDiwali Break: Nov 1-10\nSemester End: December 20\n\nAdd important dates...' },
      'academics.exams': { title: 'Exam Schedule', placeholder: 'Exam Schedule:\nMid Term: October 15-20\nFinal Exam: December 15-25\nPractical Exams: December 5-12\n\nAdd exam dates and timings...' },
      
      // Events
      'events.upcoming': { title: 'Upcoming Events', placeholder: 'Upcoming Events:\n- Annual Sports Day: July 15\n- Tech Fest: August 20-22\n- Cultural Night: September 10\n\nAdd event dates and details...' },
      'events.clubs': { title: 'Club Activities', placeholder: 'Club Activities:\n- Tech Club: Weekly meets on Friday\n- Sports Club: Daily 4-6 PM\n- Art Club: Sundays 2 PM\n\nAdd club schedules...' },
      'events.webinars': { title: 'Webinars & Sessions', placeholder: 'Upcoming Webinars:\n- Career Guidance: July 5, 3 PM\n- Tech Trends 2024: July 12, 4 PM\n- Soft Skills: July 19, 2 PM\n\nAdd webinar details...' },
      'events.register': { title: 'Event Registrations', placeholder: 'Event Registration Links:\n- Sports Day: [Registration Link]\n- Tech Fest: [Registration Link]\n- Cultural Event: [Registration Link]\n\nAdd registration details...' },
      
      // Placements
      'placements.jobs': { title: 'Active Job Openings', placeholder: 'Job Openings:\n- Company A: Software Engineer (200 seats)\n- Company B: Data Analyst (150 seats)\n- Company C: Business Analyst (100 seats)\n\nAdd company details and eligibility...' },
      'placements.timelines': { title: 'Company Timelines', placeholder: 'Recruitment Timeline:\n- Company A: July 10 (Resume Submission)\n- Company B: July 15 (Written Test)\n- Company C: July 20 (Interview)\n\nAdd timeline details...' },
      'placements.resources': { title: 'Placement Resources', placeholder: 'Preparation Resources:\n- Resume Templates: [Link]\n- Interview Q&A: [Link]\n- Aptitude Tests: [Link]\n\nAdd resource links...' },
      'placements.internships': { title: 'Internship Opportunities', placeholder: 'Internship Programs:\n- Summer Internship 2024: [Details]\n- Winter Internship 2024: [Details]\n- Year-round Programs: [Details]\n\nAdd internship details...' },
      
      // Achievements
      'achievements.student': { title: 'Student Achievements', placeholder: 'Student Awards:\n- Merit Scholarship: 50 students\n- Sports Award: 15 students\n- Excellence in Academics: 30 students\n\nAdd student achievements...' },
      'achievements.faculty': { title: 'Faculty Excellence', placeholder: 'Faculty Achievements:\n- Dr. Smith: Published in IEEE Journal\n- Prof. Johnson: Received Best Teacher Award\n- Dr. Williams: Research Grant Awarded\n\nAdd faculty achievements...' },
      'achievements.stories': { title: 'Success Stories', placeholder: 'Alumni Success:\n- Rahul Kumar: CEO at TechCorp\n- Priya Singh: Software Architect at Google\n- Amit Patel: Founder of StartupXYZ\n\nAdd success stories...' },
      'achievements.recognition': { title: 'Recognition Board', placeholder: 'Recognition Board:\n- Outstanding Volunteer: Anish Verma\n- Innovation Award: Sarah Johnson\n- Community Service: Rajesh Kumar\n\nAdd recognitions...' },
      
      // Circulars
      'circulars.official': { title: 'Official Circulars', placeholder: 'Official Notice:\nAll students must complete their fee submission by July 31st.\nLate submission will attract 5% penalty.\n\nAdd official notices...' },
      'circulars.holidays': { title: 'Leave & Holiday Notices', placeholder: 'College Holidays:\n- Diwali: November 1-5\n- Christmas: December 20 - Jan 2\n- Republic Day: January 26\n\nAdd holiday dates...' },
      'circulars.admin': { title: 'Administrative Notices', placeholder: 'Administrative Notice:\nAdmission for new batch starts from August 1st.\nRequired documents: 10th marksheet, 12th marksheet, ID proof\n\nAdd admin notices...' },
      'circulars.urgent': { title: 'Urgent Circulars', placeholder: 'URGENT: Campus closure on July 4 due to maintenance work.\nAll classes and facilities will be closed.\n\nAdd urgent notices...' }
    };

    const key = category + '.' + section;
    const data = defaultData[key] || { title: 'Details', placeholder: 'No details available.' };
    const saved = localStorage.getItem('category_' + key);
    const content = saved !== null ? saved : data.placeholder;

    document.querySelectorAll('.category-detail-modal').forEach(existing => existing.remove());

    // Create modal HTML
    const modal = document.createElement('div');
    modal.className = 'modal-overlay category-detail-modal';
    modal.innerHTML = `
      <div class="modal-container">
        <div class="modal-header">
          <h2>${data.title}</h2>
          <button class="modal-close-btn" onclick="this.closest('.category-detail-modal').remove()">&times;</button>
        </div>
        <div class="modal-body">
          <textarea id="category-data-field" class="form-textarea category-textarea" ${!isStaff ? 'readonly' : ''}></textarea>
        </div>
        <div class="modal-footer">
          ${isStaff ? `<button class="btn btn-primary" onclick="AcademicApp.saveCategoryData('${category}', '${section}')">Save</button>` : ''}
          <button class="btn btn-secondary" onclick="this.closest('.category-detail-modal').remove()">Close</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);

    const textarea = modal.querySelector('#category-data-field');
    textarea.placeholder = data.placeholder;
    textarea.value = content;

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  };

  const saveCategoryData = (category, section) => {
    const textarea = document.querySelector('#category-data-field');
    if (!textarea) return;
    
    const data = textarea.value;
    const key = category + '.' + section;
    
    // Save to localStorage for persistence
    localStorage.setItem('category_' + key, data);
    const published = publishCategoryUpdate(category, section, data);
    
    alert(published ? '✓ Information saved and published to students!' : '✓ Information saved successfully!');
    document.querySelector('.category-detail-modal').remove();
  };

  const saveCategoryInfo = (category, section) => {
    const fieldId = `${category}-${section}`;
    const textarea = document.getElementById(fieldId);
    
    if (!textarea) {
      alert('Error: Field not found');
      return;
    }
    
    const data = textarea.value;
    const key = category + '.' + section;
    
    // Save to localStorage for persistence
    localStorage.setItem('category_' + key, data);
    const published = publishCategoryUpdate(category, section, data);
    
    alert('✓ ' + section.charAt(0).toUpperCase() + section.slice(1) + ' saved successfully!' + (published ? ' Students have been notified.' : ''));
  };

  // Load saved category info on page load
  const loadCategoryInfo = (category, section) => {
    const key = category + '.' + section;
    const saved = localStorage.getItem('category_' + key);
    
    if (saved) {
      const fieldId = `${category}-${section}`;
      const textarea = document.getElementById(fieldId);
      if (textarea) {
        textarea.value = saved;
      }
    }
  };

  /* ==========================================
     REAL-TIME SERVER POLLING SIMULATION
     ========================================== */

  // Loop generator to simulate live socket push notifications
  const startRealTimeSimulation = () => {
    // Wait 20 seconds initially, then every 60 seconds push a simulated notice
    setTimeout(() => {
      triggerSimulatedNotification();
      
      setInterval(() => {
        triggerSimulatedNotification();
      }, 60000);
    }, 20000);
  };

  const triggerSimulatedNotification = () => {
    // Select random simulation circular
    const randomIndex = Math.floor(Math.random() * SIMULATION_NOTIFICATIONS.length);
    const mockPayload = { ...SIMULATION_NOTIFICATIONS[randomIndex] };

    // Customize dates and save
    mockPayload.createdAt = new Date().toISOString();
    const created = AcademicDB.createNotification(mockPayload);

    // 1. Alert Ticker marquee flash
    const ticker = document.getElementById("urgent-ticker-container");
    const tickerTxt = document.getElementById("urgent-ticker-text");
    tickerTxt.innerText = `NEW NOTICE: ${created.title} - published just now!`;
    ticker.classList.remove("hidden");

    // 2. Play subtle notification sound if available, otherwise just badge update
    renderHeader();
    if (activePage === "feed") loadActivePage(); // Live refresh active notices feed if user viewing it
  };

  return {
    init,
    changePage,
    setFeedFilter,
    applyQuickFilter,
    openNotifPublishOverlay,
    handleCardAction,
    approveTeacher,
    deleteUserPrompt,
    openAddUserModal,
    showCategoryDetails,
    saveCategoryData,
    saveCategoryInfo,
    loadCategoryInfo,
    openNotificationDetail
  };
})();

// Boot App on Window Load
window.addEventListener("DOMContentLoaded", AcademicApp.init);
