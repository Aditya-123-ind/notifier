/* ==========================================================================
   EduNotify UI Components and Icons Engine
   ========================================================================== */

const AcademicUI = (() => {
  // SVG Icon definitions
  const ICONS = {
    dashboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>`,
    notification: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`,
    users: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
    create: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
    calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
    briefcase: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`,
    feedback: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
    settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
    pin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="8" x2="22" y2="12"></line><line x1="12" y1="2" x2="22" y2="12"></line><path d="M12 2L2 12h5l5 5v5l10-10H12z"></path></svg>`,
    paperclip: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>`,
    clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
    edit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
    trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`,
    academics: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`,
    events: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6h12M8 10h12M8 14h12M8 18h12M3 6h.01M3 10h.01M3 14h.01M3 18h.01"></path></svg>`,
    trophy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-12a2 2 0 0 0-2-2h-2"></path><path d="M6 9c0-1 1-2 3-2h6c2 0 3 1 3 2"></path><ellipse cx="12" cy="15" rx="2" ry="2"></ellipse></svg>`,
    megaphone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 15.84 15.84 0 0 1-5.65-5.65 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`
  };

  // Build the dynamic sidebar navigation links based on user role
  const renderSidebarLinks = (role, currentPath, onNavClick) => {
    const menuUl = document.getElementById("sidebar-menu");
    if (!menuUl) return;

    let links = [];

    if (role === "admin") {
      links = [
        { label: "Dashboard", icon: "dashboard", path: "admin_dash" },
        { label: "Pending Approvals", icon: "users", path: "admin_approvals" },
        { label: "Manage Portal Users", icon: "settings", path: "admin_users" },
        { label: "View Portal Feed", icon: "notification", path: "feed" }
      ];
    } else if (role === "principal") {
      links = [
        { label: "Dashboard", icon: "dashboard", path: "principal_dash" },
        { label: "Pending Approvals", icon: "users", path: "principal_approvals" },
        { label: "Create Notice", icon: "create", path: "create_notification" },
        { label: "Notifications Hub", icon: "settings", path: "principal_manage" },
        { label: "View Portal Feed", icon: "notification", path: "feed" },
        { label: "📚 Academics", icon: "academics", path: "academics" },
        { label: "   ✏️ Manage Academics", icon: "edit", path: "academics_manage" },
        { label: "🎉 Events", icon: "events", path: "events" },
        { label: "   ✏️ Manage Events", icon: "edit", path: "events_manage" },
        { label: "💼 Placements", icon: "briefcase", path: "placements" },
        { label: "   ✏️ Manage Placements", icon: "edit", path: "placements_manage" },
        { label: "🏆 Achievements", icon: "trophy", path: "achievements" },
        { label: "   ✏️ Manage Achievements", icon: "edit", path: "achievements_manage" },
        { label: "📢 Circulars", icon: "megaphone", path: "circulars" },
        { label: "   ✏️ Manage Circulars", icon: "edit", path: "circulars_manage" }
      ];
    } else if (role === "teacher") {
      links = [
        { label: "Dashboard", icon: "dashboard", path: "teacher_dash" },
        { label: "Post Announcement", icon: "create", path: "create_notification" },
        { label: "My Branch Feed", icon: "notification", path: "feed" },
        { label: "📚 Academics", icon: "academics", path: "academics" },
        { label: "🎉 Events", icon: "events", path: "events" },
        { label: "💼 Placements", icon: "briefcase", path: "placements" },
        { label: "🏆 Achievements", icon: "trophy", path: "achievements" },
        { label: "📢 Circulars", icon: "megaphone", path: "circulars" }
      ];
    } else if (role === "student") {
      links = [
        { label: "Dashboard", icon: "dashboard", path: "student_dash" },
        { label: "Notice Board", icon: "notification", path: "feed" },
        { label: "📚 Academics", icon: "academics", path: "academics" },
        { label: "🎉 Events", icon: "events", path: "events" },
        { label: "💼 Placements", icon: "briefcase", path: "placements" },
        { label: "🏆 Achievements", icon: "trophy", path: "achievements" },
        { label: "📢 Circulars", icon: "megaphone", path: "circulars" }
      ];
    }

    menuUl.innerHTML = "";
    links.forEach(link => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.className = `sidebar-nav-link ${currentPath === link.path ? 'active' : ''}`;
      a.innerHTML = `${ICONS[link.icon]} <span>${link.label}</span>`;
      
      a.addEventListener("click", (e) => {
        e.preventDefault();
        onNavClick(link.path);
      });

      li.appendChild(a);
      menuUl.appendChild(li);
    });
  };

  // Convert Date string into a human readable format
  const formatTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const options = { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString('en-US', options);
  };

  // Create a Notification Card component inside the feed
  const createNotificationCard = (notif, currentUser, onActionClick, onTitleClick) => {
    const card = document.createElement("div");
    card.className = `notification-card ${notif.isPinned ? 'pinned' : ''}`;
    
    // Unread flag calculation
    const readRecords = AcademicDB.getReadStatus();
    const isRead = readRecords.some(r => r.notificationId === notif.id && r.userId === currentUser.id);
    if (!isRead && currentUser.role === "student") {
      card.classList.add("unread");
    }

    const pinIndicator = notif.isPinned 
      ? `<span class="pin-icon-badge" title="Pinned Announcement">${ICONS.pin}</span>` 
      : "";

    const attachmentBadge = notif.attachment
      ? `<span class="attachment-badge">${ICONS.paperclip} <span>Attachment (${notif.attachment.fileName})</span></span>`
      : "";

    const categoryClass = notif.category === "placements" ? "placement" : notif.category;
    const categoryLabel = notif.category === "placement" || notif.category === "placements" ? "placements" : notif.category;

    // Action buttons visibility (Admin, Principal can edit/delete all. Teachers can only edit/delete their own)
    let actionButtons = "";
    const isOwner = notif.senderId === currentUser.id;
    const canManage = currentUser.role === "admin" || currentUser.role === "principal" || (currentUser.role === "teacher" && isOwner);

    if (canManage) {
      actionButtons = `
        <div class="action-btn-group">
          <button class="header-icon-btn btn-sm" data-action="edit" data-id="${notif.id}" title="Edit Announcement">${ICONS.edit}</button>
          <button class="header-icon-btn btn-sm text-danger" data-action="delete" data-id="${notif.id}" title="Delete Announcement">${ICONS.trash}</button>
        </div>
      `;
    }

    // Format target audience description
    let audienceStr = "";
    if (notif.recipientGroup === "all") audienceStr = "Entire College";
    else if (notif.recipientGroup === "staff") audienceStr = "Staff Only";
    else if (notif.recipientGroup === "students") audienceStr = "All Students";
    else if (notif.recipientGroup === "branch") {
      const bObj = AcademicDB.getBranchById(notif.targetBranchId);
      const bCode = bObj ? bObj.code : notif.targetBranchId.toUpperCase();
      audienceStr = `${bCode}`;
      if (notif.targetSemester) audienceStr += ` - Sem ${notif.targetSemester}`;
      if (notif.targetClass) audienceStr += ` (${notif.targetClass})`;
    } else if (notif.recipientGroup === "student") {
      const sObj = AcademicDB.getUserById(notif.targetStudentId);
      audienceStr = sObj ? `Direct: ${sObj.name} (${sObj.branchId ? sObj.branchId.toUpperCase() : ''})` : "Direct Student";
    }

    card.innerHTML = `
      ${pinIndicator}
      <div class="card-header-row">
        <div class="card-title-group">
          <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
            <span class="category-pill ${categoryClass}">${categoryLabel}</span>
            <span class="priority-badge ${notif.priority}">${notif.priority}</span>
          </div>
          <h3 id="notif-title-click-${notif.id}" style="margin-top: 8px;">${notif.title}</h3>
        </div>
        ${actionButtons}
      </div>
      
      <div class="card-body-summary">
        ${notif.description.replace(/<[^>]*>/g, '')} <!-- Excerpt strip html -->
      </div>

      <div class="card-footer-row">
        <div class="card-meta-row">
          <div class="meta-field">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <span>${notif.senderName} (${notif.senderRole})</span>
          </div>
          <div class="meta-field">
            ${ICONS.clock}
            <span>${formatTime(notif.createdAt)}</span>
          </div>
          <div class="meta-field">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 8l4 4-4 4M8 12h8"/></svg>
            <span>Audience: <b>${audienceStr}</b></span>
          </div>
        </div>
        ${attachmentBadge}
      </div>
    `;

    // Hook listeners
    card.querySelector(`#notif-title-click-${notif.id}`).addEventListener("click", () => {
      onTitleClick(notif.id);
    });

    if (canManage) {
      card.querySelectorAll("[data-action]").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const act = btn.getAttribute("data-action");
          const nid = btn.getAttribute("data-id");
          onActionClick(act, nid);
        });
      });
    }

    return card;
  };

  // Client Side PDF compiler sheet generation
  const exportNotificationAsPDF = (notif) => {
    // Create print iframe wrapper
    const printFrame = document.createElement("iframe");
    printFrame.style.display = "none";
    document.body.appendChild(printFrame);

    const doc = printFrame.contentDocument || printFrame.contentWindow.document;

    // Audience calculation
    let audienceStr = "";
    if (notif.recipientGroup === "all") audienceStr = "Entire College";
    else if (notif.recipientGroup === "staff") audienceStr = "Staff Only";
    else if (notif.recipientGroup === "students") audienceStr = "All Students";
    else if (notif.recipientGroup === "branch") {
      const bObj = AcademicDB.getBranchById(notif.targetBranchId);
      audienceStr = bObj ? bObj.name : notif.targetBranchId.toUpperCase();
      if (notif.targetSemester) audienceStr += ` (Semester ${notif.targetSemester})`;
    } else if (notif.recipientGroup === "student") {
      const sObj = AcademicDB.getUserById(notif.targetStudentId);
      audienceStr = sObj ? `Direct Student: ${sObj.name} (${sObj.branchId ? sObj.branchId.toUpperCase() : ''})` : "Direct Student";
    }

    const printHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Print Circular - ${notif.title}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
          .letterhead { text-align: center; border-bottom: 3px double #1e40af; padding-bottom: 16px; margin-bottom: 30px; }
          .letterhead h1 { margin: 0; font-size: 26px; color: #1e40af; letter-spacing: 0.05em; font-family: Georgia, serif; }
          .letterhead p { margin: 4px 0 0 0; font-size: 13px; color: #475569; text-transform: uppercase; letter-spacing: 0.1em; }
          .doc-title { font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 20px; text-transform: capitalize; border-left: 4px solid #1e40af; padding-left: 10px; }
          .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; background-color: #f8fafc; border: 1px solid #e2e8f0; }
          .meta-table td { padding: 12px 16px; font-size: 13px; border-bottom: 1px solid #e2e8f0; }
          .meta-table td.label { font-weight: bold; color: #475569; width: 25%; }
          .content-block { min-height: 300px; font-size: 15px; margin-bottom: 50px; }
          .sign-block { text-align: right; margin-top: 60px; padding-right: 20px; }
          .sign-line { display: inline-block; border-top: 1px solid #475569; width: 200px; margin-top: 40px; text-align: center; padding-top: 6px; font-size: 13px; font-weight: bold; }
          .footer { border-top: 1px solid #cbd5e1; padding-top: 10px; font-size: 11px; color: #94a3b8; text-align: center; margin-top: 40px; }
        </style>
      </head>
      <body>
        <div class="letterhead">
          <h1>EXCELSIOR ACADEMIC COLLEGE</h1>
          <p>Office of the Academic Administration & Portal Registry</p>
        </div>
        
        <div class="doc-title">${notif.title}</div>
        
        <table class="meta-table">
          <tr>
            <td class="label">Reference No:</td>
            <td>Ref/EC/NOTIF/${notif.id.replace("notif_", "").slice(0, 6)}</td>
            <td class="label">Date Published:</td>
            <td>${formatTime(notif.createdAt)}</td>
          </tr>
          <tr>
            <td class="label">Posted By:</td>
            <td>${notif.senderName} (${notif.senderRole.toUpperCase()})</td>
            <td class="label">Target Audience:</td>
            <td>${audienceStr}</td>
          </tr>
          <tr>
            <td class="label">Category:</td>
            <td><b style="text-transform:uppercase;">${notif.category}</b></td>
            <td class="label">Priority Rating:</td>
            <td><span style="color:#ef4444; font-weight:bold; text-transform:uppercase;">${notif.priority}</span></td>
          </tr>
        </table>
        
        <div class="content-block">
          ${notif.description}
        </div>
        
        <div class="sign-block">
          <br><br>
          <div class="sign-line">Authorized Signatory</div>
        </div>

        <div class="footer">
          This is an electronically generated academic circular from EduNotify College Portal.
        </div>
      </body>
      </html>
    `;

    doc.open();
    doc.write(printHtml);
    doc.close();

    // Trigger printing once document finishes rendering
    printFrame.contentWindow.focus();
    setTimeout(() => {
      printFrame.contentWindow.print();
      // Remove temporary iframe
      setTimeout(() => document.body.removeChild(printFrame), 1000);
    }, 500);
  };

  return {
    ICONS,
    renderSidebarLinks,
    createNotificationCard,
    formatTime,
    exportNotificationAsPDF,
    
    // Category Pages
    renderAcademicsPage: (data = {}) => {
      const isStaff = window.currentUserRole && (window.currentUserRole === "principal" || window.currentUserRole === "teacher" || window.currentUserRole === "admin");
      return `
        <div class="category-page">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
            <h1>📚 Academics</h1>
            ${isStaff ? `<button class="btn btn-primary add-category-btn" data-category="academics">+ Add Academic Info</button>` : ''}
          </div>
          <div class="category-content">
            <div class="category-card">
              <h3>Semester Timetable</h3>
              <p>View your class schedule and exam dates</p>
              <button class="btn btn-primary" onclick="AcademicApp.showCategoryDetails('academics', 'timetable')">View</button>
            </div>
            <div class="category-card">
              <h3>Syllabus & Course Materials</h3>
              <p>Download course syllabus and study materials</p>
              <button class="btn btn-primary" onclick="AcademicApp.showCategoryDetails('academics', 'materials')">Access</button>
            </div>
            <div class="category-card">
              <h3>Academic Calendar</h3>
              <p>Important dates and academic milestones</p>
              <button class="btn btn-primary" onclick="AcademicApp.showCategoryDetails('academics', 'calendar')">View</button>
            </div>
            <div class="category-card">
              <h3>Exam Schedule</h3>
              <p>Internal assessments and final exams</p>
              <button class="btn btn-primary" onclick="AcademicApp.showCategoryDetails('academics', 'exams')">View</button>
            </div>
          </div>
        </div>
      `;
    },

    renderEventsPage: (data = {}) => {
      const isStaff = window.currentUserRole && (window.currentUserRole === "principal" || window.currentUserRole === "teacher" || window.currentUserRole === "admin");
      return `
        <div class="category-page">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
            <h1>🎉 Events</h1>
            ${isStaff ? `<button class="btn btn-primary add-category-btn" data-category="events">+ Add Event</button>` : ''}
          </div>
          <div class="category-content">
            <div class="category-card">
              <h3>Upcoming Events</h3>
              <p>Cultural fests, workshops, and seminars</p>
              <button class="btn btn-primary" onclick="AcademicApp.showCategoryDetails('events', 'upcoming')">View Calendar</button>
            </div>
            <div class="category-card">
              <h3>Club Activities</h3>
              <p>Technical clubs, sports, and cultural events</p>
              <button class="btn btn-primary" onclick="AcademicApp.showCategoryDetails('events', 'clubs')">Explore</button>
            </div>
            <div class="category-card">
              <h3>Webinars & Sessions</h3>
              <p>Online workshops and expert talks</p>
              <button class="btn btn-primary" onclick="AcademicApp.showCategoryDetails('events', 'webinars')">Attend</button>
            </div>
            <div class="category-card">
              <h3>Event Registrations</h3>
              <p>Register for upcoming college events</p>
              <button class="btn btn-primary" onclick="AcademicApp.showCategoryDetails('events', 'register')">Register</button>
            </div>
          </div>
        </div>
      `;
    },

    renderPlacementsPage: (data = {}) => {
      const isStaff = window.currentUserRole && (window.currentUserRole === "principal" || window.currentUserRole === "teacher" || window.currentUserRole === "admin");
      return `
        <div class="category-page">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
            <h1>💼 Placements</h1>
            ${isStaff ? `<button class="btn btn-primary add-category-btn" data-category="placements">+ Add Placement Info</button>` : ''}
          </div>
          <div class="category-content">
            <div class="category-card">
              <h3>Active Job Openings</h3>
              <p>Latest placement opportunities</p>
              <button class="btn btn-primary" onclick="AcademicApp.showCategoryDetails('placements', 'jobs')">View Jobs</button>
            </div>
            <div class="category-card">
              <h3>Company Timelines</h3>
              <p>Recruitment schedules and deadlines</p>
              <button class="btn btn-primary" onclick="AcademicApp.showCategoryDetails('placements', 'timelines')">View</button>
            </div>
            <div class="category-card">
              <h3>Placement Resources</h3>
              <p>Interview prep and resume guides</p>
              <button class="btn btn-primary" onclick="AcademicApp.showCategoryDetails('placements', 'resources')">Access</button>
            </div>
            <div class="category-card">
              <h3>Internship Opportunities</h3>
              <p>Summer internship programs</p>
              <button class="btn btn-primary" onclick="AcademicApp.showCategoryDetails('placements', 'internships')">Browse</button>
            </div>
          </div>
        </div>
      `;
    },

    renderAchievementsPage: (data = {}) => {
      const isStaff = window.currentUserRole && (window.currentUserRole === "principal" || window.currentUserRole === "teacher" || window.currentUserRole === "admin");
      return `
        <div class="category-page">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
            <h1>🏆 Achievements</h1>
            ${isStaff ? `<button class="btn btn-primary add-category-btn" data-category="achievements">+ Add Achievement</button>` : ''}
          </div>
          <div class="category-content">
            <div class="category-card">
              <h3>Student Achievements</h3>
              <p>Awards, prizes, and student accolades</p>
              <button class="btn btn-primary" onclick="AcademicApp.showCategoryDetails('achievements', 'student')">View</button>
            </div>
            <div class="category-card">
              <h3>Faculty Excellence</h3>
              <p>Faculty research and publications</p>
              <button class="btn btn-primary" onclick="AcademicApp.showCategoryDetails('achievements', 'faculty')">Browse</button>
            </div>
            <div class="category-card">
              <h3>Success Stories</h3>
              <p>Alumni achievements and placements</p>
              <button class="btn btn-primary" onclick="AcademicApp.showCategoryDetails('achievements', 'stories')">Read</button>
            </div>
            <div class="category-card">
              <h3>Recognition Board</h3>
              <p>Special recognitions and honors</p>
              <button class="btn btn-primary" onclick="AcademicApp.showCategoryDetails('achievements', 'recognition')">View</button>
            </div>
          </div>
        </div>
      `;
    },

    renderCircularsPage: (data = {}) => {
      const isStaff = window.currentUserRole && (window.currentUserRole === "principal" || window.currentUserRole === "teacher" || window.currentUserRole === "admin");
      return `
        <div class="category-page">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
            <h1>📢 Circulars</h1>
            ${isStaff ? `<button class="btn btn-primary add-category-btn" data-category="circulars">+ Add Circular</button>` : ''}
          </div>
          <div class="category-content">
            <div class="category-card">
              <h3>Official Circulars</h3>
              <p>Important official notices and announcements</p>
              <button class="btn btn-primary" onclick="AcademicApp.showCategoryDetails('circulars', 'official')">View</button>
            </div>
            <div class="category-card">
              <h3>Leave & Holiday Notices</h3>
              <p>College holidays and leave schedules</p>
              <button class="btn btn-primary" onclick="AcademicApp.showCategoryDetails('circulars', 'holidays')">Check</button>
            </div>
            <div class="category-card">
              <h3>Administrative Notices</h3>
              <p>Fee payments, registration deadlines</p>
              <button class="btn btn-primary" onclick="AcademicApp.showCategoryDetails('circulars', 'admin')">View</button>
            </div>
            <div class="category-card">
              <h3>Urgent Circulars</h3>
              <p>Time-sensitive announcements</p>
              <button class="btn btn-primary" onclick="AcademicApp.showCategoryDetails('circulars', 'urgent')">View</button>
            </div>
          </div>
        </div>
      `;
    },

    // ============ CATEGORY MANAGEMENT PAGES FOR PRINCIPALS ============

    renderAcademicsManager: (data = {}) => {
      return `
        <div class="category-page">
          <h1>📚 Academics Management</h1>
          <div class="management-container">
            <div class="management-section">
              <h3>Timetable</h3>
              <textarea class="form-textarea" id="academics-timetable" placeholder="Class Schedule:\nMonday: 9AM-12PM (Math)\nTuesday: 10AM-1PM (Physics)\n\nAdd class timings and subjects here..."></textarea>
              <button class="btn btn-primary" onclick="AcademicApp.saveCategoryInfo('academics', 'timetable')">Save Timetable</button>
            </div>

            <div class="management-section">
              <h3>Course Materials</h3>
              <textarea class="form-textarea" id="academics-materials" placeholder="Course Materials:\n- Syllabus PDF: [Link]\n- Lecture Notes: [Link]\n- Reference Books: [List]\n\nAdd course materials..."></textarea>
              <button class="btn btn-primary" onclick="AcademicApp.saveCategoryInfo('academics', 'materials')">Save Materials</button>
            </div>

            <div class="management-section">
              <h3>Academic Calendar</h3>
              <textarea class="form-textarea" id="academics-calendar" placeholder="Academic Calendar 2024-25:\nSemester Start: August 1\nMid Semester Exam: October 15\nDiwali Break: Nov 1-10\n\nAdd important dates..."></textarea>
              <button class="btn btn-primary" onclick="AcademicApp.saveCategoryInfo('academics', 'calendar')">Save Calendar</button>
            </div>

            <div class="management-section">
              <h3>Exam Schedule</h3>
              <textarea class="form-textarea" id="academics-exams" placeholder="Exam Schedule:\nMid Term: October 15-20\nFinal Exam: December 15-25\nPractical Exams: December 5-12\n\nAdd exam dates and timings..."></textarea>
              <button class="btn btn-primary" onclick="AcademicApp.saveCategoryInfo('academics', 'exams')">Save Exam Schedule</button>
            </div>
          </div>
        </div>
      `;
    },

    renderEventsManager: (data = {}) => {
      return `
        <div class="category-page">
          <h1>🎉 Events Management</h1>
          <div class="management-container">
            <div class="management-section">
              <h3>Upcoming Events</h3>
              <textarea class="form-textarea" id="events-upcoming" placeholder="Upcoming Events:\n- Annual Sports Day: July 15\n- Tech Fest: August 20-22\n- Cultural Night: September 10\n\nAdd event dates and details..."></textarea>
              <button class="btn btn-primary" onclick="AcademicApp.saveCategoryInfo('events', 'upcoming')">Save Events</button>
            </div>

            <div class="management-section">
              <h3>Club Activities</h3>
              <textarea class="form-textarea" id="events-clubs" placeholder="Club Activities:\n- Tech Club: Weekly meets on Friday 2 PM\n- Sports Club: Daily 4-6 PM\n- Art Club: Sundays 2 PM\n\nAdd club schedules..."></textarea>
              <button class="btn btn-primary" onclick="AcademicApp.saveCategoryInfo('events', 'clubs')">Save Club Activities</button>
            </div>

            <div class="management-section">
              <h3>Webinars & Sessions</h3>
              <textarea class="form-textarea" id="events-webinars" placeholder="Upcoming Webinars:\n- Career Guidance: July 5, 3 PM\n- Tech Trends 2024: July 12, 4 PM\n- Soft Skills: July 19, 2 PM\n\nAdd webinar details..."></textarea>
              <button class="btn btn-primary" onclick="AcademicApp.saveCategoryInfo('events', 'webinars')">Save Webinars</button>
            </div>

            <div class="management-section">
              <h3>Event Registrations</h3>
              <textarea class="form-textarea" id="events-register" placeholder="Event Registration Links:\n- Sports Day: [Registration Link]\n- Tech Fest: [Registration Link]\n- Cultural Event: [Registration Link]\n\nAdd registration details..."></textarea>
              <button class="btn btn-primary" onclick="AcademicApp.saveCategoryInfo('events', 'register')">Save Registrations</button>
            </div>
          </div>
        </div>
      `;
    },

    renderPlacementsManager: (data = {}) => {
      return `
        <div class="category-page">
          <h1>💼 Placements Management</h1>
          <div class="management-container">
            <div class="management-section">
              <h3>Job Openings</h3>
              <textarea class="form-textarea" id="placements-jobs" placeholder="Job Openings:\n- Company A: Software Engineer (200 seats)\n- Company B: Data Analyst (150 seats)\n- Company C: Business Analyst (100 seats)\n\nAdd company details and eligibility..."></textarea>
              <button class="btn btn-primary" onclick="AcademicApp.saveCategoryInfo('placements', 'jobs')">Save Job Openings</button>
            </div>

            <div class="management-section">
              <h3>Company Timelines</h3>
              <textarea class="form-textarea" id="placements-timelines" placeholder="Recruitment Timeline:\n- Company A: July 10 (Resume Submission)\n- Company B: July 15 (Written Test)\n- Company C: July 20 (Interview)\n\nAdd timeline details..."></textarea>
              <button class="btn btn-primary" onclick="AcademicApp.saveCategoryInfo('placements', 'timelines')">Save Timelines</button>
            </div>

            <div class="management-section">
              <h3>Placement Resources</h3>
              <textarea class="form-textarea" id="placements-resources" placeholder="Preparation Resources:\n- Resume Templates: [Link]\n- Interview Q&A: [Link]\n- Aptitude Tests: [Link]\n\nAdd resource links..."></textarea>
              <button class="btn btn-primary" onclick="AcademicApp.saveCategoryInfo('placements', 'resources')">Save Resources</button>
            </div>

            <div class="management-section">
              <h3>Internship Opportunities</h3>
              <textarea class="form-textarea" id="placements-internships" placeholder="Internship Programs:\n- Summer Internship 2024: [Details]\n- Winter Internship 2024: [Details]\n- Year-round Programs: [Details]\n\nAdd internship details..."></textarea>
              <button class="btn btn-primary" onclick="AcademicApp.saveCategoryInfo('placements', 'internships')">Save Internships</button>
            </div>
          </div>
        </div>
      `;
    },

    renderAchievementsManager: (data = {}) => {
      return `
        <div class="category-page">
          <h1>🏆 Achievements Management</h1>
          <div class="management-container">
            <div class="management-section">
              <h3>Student Achievements</h3>
              <textarea class="form-textarea" id="achievements-student" placeholder="Student Awards:\n- Merit Scholarship: 50 students\n- Sports Award: 15 students\n- Excellence in Academics: 30 students\n\nAdd student achievements..."></textarea>
              <button class="btn btn-primary" onclick="AcademicApp.saveCategoryInfo('achievements', 'student')">Save Student Awards</button>
            </div>

            <div class="management-section">
              <h3>Faculty Excellence</h3>
              <textarea class="form-textarea" id="achievements-faculty" placeholder="Faculty Achievements:\n- Dr. Smith: Published in IEEE Journal\n- Prof. Johnson: Received Best Teacher Award\n- Dr. Williams: Research Grant Awarded\n\nAdd faculty achievements..."></textarea>
              <button class="btn btn-primary" onclick="AcademicApp.saveCategoryInfo('achievements', 'faculty')">Save Faculty Achievements</button>
            </div>

            <div class="management-section">
              <h3>Success Stories</h3>
              <textarea class="form-textarea" id="achievements-stories" placeholder="Alumni Success:\n- Rahul Kumar: CEO at TechCorp\n- Priya Singh: Software Architect at Google\n- Amit Patel: Founder of StartupXYZ\n\nAdd success stories..."></textarea>
              <button class="btn btn-primary" onclick="AcademicApp.saveCategoryInfo('achievements', 'stories')">Save Success Stories</button>
            </div>

            <div class="management-section">
              <h3>Recognition Board</h3>
              <textarea class="form-textarea" id="achievements-recognition" placeholder="Recognition Board:\n- Outstanding Volunteer: Anish Verma\n- Innovation Award: Sarah Johnson\n- Community Service: Rajesh Kumar\n\nAdd recognitions..."></textarea>
              <button class="btn btn-primary" onclick="AcademicApp.saveCategoryInfo('achievements', 'recognition')">Save Recognitions</button>
            </div>
          </div>
        </div>
      `;
    },

    renderCircularsManager: (data = {}) => {
      return `
        <div class="category-page">
          <h1>📢 Circulars Management</h1>
          <div class="management-container">
            <div class="management-section">
              <h3>Official Circulars</h3>
              <textarea class="form-textarea" id="circulars-official" placeholder="Official Notice:\nAll students must complete their fee submission by July 31st.\nLate submission will attract 5% penalty.\n\nAdd official notices..."></textarea>
              <button class="btn btn-primary" onclick="AcademicApp.saveCategoryInfo('circulars', 'official')">Save Official Circulars</button>
            </div>

            <div class="management-section">
              <h3>Leave & Holiday Notices</h3>
              <textarea class="form-textarea" id="circulars-holidays" placeholder="College Holidays:\n- Diwali: November 1-5\n- Christmas: December 20 - Jan 2\n- Republic Day: January 26\n\nAdd holiday dates..."></textarea>
              <button class="btn btn-primary" onclick="AcademicApp.saveCategoryInfo('circulars', 'holidays')">Save Holiday Notices</button>
            </div>

            <div class="management-section">
              <h3>Administrative Notices</h3>
              <textarea class="form-textarea" id="circulars-admin" placeholder="Administrative Notice:\nAdmission for new batch starts from August 1st.\nRequired documents: 10th marksheet, 12th marksheet, ID proof\n\nAdd admin notices..."></textarea>
              <button class="btn btn-primary" onclick="AcademicApp.saveCategoryInfo('circulars', 'admin')">Save Admin Notices</button>
            </div>

            <div class="management-section">
              <h3>Urgent Circulars</h3>
              <textarea class="form-textarea" id="circulars-urgent" placeholder="URGENT: Campus closure on July 4 due to maintenance work.\nAll classes and facilities will be closed.\n\nAdd urgent notices..."></textarea>
              <button class="btn btn-primary" onclick="AcademicApp.saveCategoryInfo('circulars', 'urgent')">Save Urgent Circulars</button>
            </div>
          </div>
        </div>
      `;
    }
  };
})();
