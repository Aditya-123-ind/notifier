/* ==========================================================================
   EduNotify Authentication & Session Layer
   ========================================================================== */

const AcademicAuth = (() => {
  const SESSION_KEY = "college_current_session";

  // Get current active session
  const getCurrentUser = () => {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY));
  };

  // Sign out helper
  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    window.location.reload();
  };

  // Perform email/password sign-in check
  const login = (email, password) => {
    const user = AcademicDB.getUserByEmail(email);
    if (!user) {
      return { success: false, error: "No user found with this email address." };
    }
    if (user.passwordHash !== password) {
      return { success: false, error: "Incorrect password. Please try again." };
    }
    if (user.status === "pending") {
      return { success: false, error: "Your account is pending Admin approval. Please contact the administrator." };
    }
    
    // Save to session
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return { success: true, user };
  };

  // Process user signup registration
  const register = (fields) => {
    // Check if email already registered
    const exists = AcademicDB.getUserByEmail(fields.email);
    if (exists) {
      return { success: false, error: "This email address is already registered." };
    }

    const newUser = {
      name: fields.name,
      email: fields.email.toLowerCase(),
      passwordHash: fields.password, // Store as text for mockup simplicity
      role: fields.role,
      branchId: fields.branchId || null,
      status: fields.role === "teacher" ? "pending" : "active", // Teachers require admin approval
    };

    if (fields.role === "student") {
      newUser.semester = fields.semester;
      newUser.rollNumber = fields.rollNumber;
    } else if (fields.role === "teacher") {
      newUser.employeeId = fields.employeeId;
    }

    const created = AcademicDB.createUser(newUser);
    return { success: true, user: created };
  };

  // Reset password simulation
  const recoverPassword = (email, newPassword) => {
    const user = AcademicDB.getUserByEmail(email);
    if (!user) {
      return { success: false, error: "No account found with this email address." };
    }
    AcademicDB.updateUser(user.id, { passwordHash: newPassword });
    return { success: true };
  };

  // Render the login/register/forgot card template into the DOM
  const renderAuthPage = (mode = "login") => {
    const authContainer = document.getElementById("auth-container");
    const appLayout = document.getElementById("app-layout");
    
    authContainer.classList.remove("hidden");
    appLayout.classList.add("hidden");

    let cardContent = "";

    if (mode === "login") {
      cardContent = `
        <div class="auth-card">
          <div class="auth-header">
            <div class="auth-logo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
              </svg>
            </div>
            <h1>Welcome Back</h1>
            <p>Sign in to access your notifications portal</p>
          </div>

          <div class="auth-tabs">
            <div class="auth-tab active" onclick="AcademicAuth.renderAuthPage('login')">Sign In</div>
            <div class="auth-tab" onclick="AcademicAuth.renderAuthPage('register')">Sign Up</div>
          </div>

          <div id="auth-alert" class="stat-icon-wrapper red hidden" style="width:100%; height:auto; background:#fee2e2; color:#ef4444; border-radius:6px; padding:10px; margin-bottom:16px; font-size:13px; font-weight:500; display:none; justify-content:center;">
          </div>

          <form id="login-form">
            <div class="form-group">
              <label for="login-email" class="form-label">College Email ID</label>
              <input type="email" id="login-email" class="form-input" placeholder="e.g. name@college.edu" required>
            </div>
            <div class="form-group">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <label for="login-password" class="form-label">Password</label>
                <a href="#" style="font-size:12px;" onclick="AcademicAuth.renderAuthPage('recover')">Forgot Password?</a>
              </div>
              <input type="password" id="login-password" class="form-input" placeholder="••••••••" required>
            </div>
            <button type="submit" class="btn btn-primary" style="width:100%; margin-top:8px;">Sign In</button>
          </form>

        </div>
      `;
    } else if (mode === "register") {
      const branches = AcademicDB.getBranches();
      const branchOptions = branches.map(b => `<option value="${b.id}">${b.name}</option>`).join("");

      cardContent = `
        <div class="auth-card" style="max-width: 520px;">
          <div class="auth-header">
            <div class="auth-logo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
              </svg>
            </div>
            <h1>Create Account</h1>
            <p>Register as a teacher or student</p>
          </div>

          <div class="auth-tabs">
            <div class="auth-tab" onclick="AcademicAuth.renderAuthPage('login')">Sign In</div>
            <div class="auth-tab active" onclick="AcademicAuth.renderAuthPage('register')">Sign Up</div>
          </div>

          <div id="auth-alert" class="stat-icon-wrapper red hidden" style="width:100%; height:auto; background:#fee2e2; color:#ef4444; border-radius:6px; padding:10px; margin-bottom:16px; font-size:13px; font-weight:500; display:none; justify-content:center;">
          </div>

          <form id="register-form">
            <div class="form-group">
              <label for="reg-name" class="form-label">Full Name</label>
              <input type="text" id="reg-name" class="form-input" placeholder="e.g. John Doe" required>
            </div>
            <div class="form-group">
              <label for="reg-email" class="form-label">College Email ID</label>
              <input type="email" id="reg-email" class="form-input" placeholder="e.g. name@college.edu" required>
            </div>
            
            <div class="form-grid">
              <div class="form-group">
                <label for="reg-role" class="form-label">I am a</label>
                <select id="reg-role" class="form-select" required>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher / Staff</option>
                </select>
              </div>
              <div class="form-group">
                <label for="reg-branch" class="form-label">Branch / Department</label>
                <select id="reg-branch" class="form-select" required>
                  <option value="">Select Branch</option>
                  ${branchOptions}
                </select>
              </div>
            </div>

            <!-- Student Specific Fields -->
            <div id="reg-student-fields" class="form-grid">
              <div class="form-group">
                <label for="reg-semester" class="form-label">Current Semester</label>
                <select id="reg-semester" class="form-select">
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                  <option value="3">Semester 3</option>
                  <option value="4">Semester 4</option>
                  <option value="5">Semester 5</option>
                  <option value="6" selected>Semester 6</option>
                  <option value="7">Semester 7</option>
                  <option value="8">Semester 8</option>
                </select>
              </div>
              <div class="form-group">
                <label for="reg-roll" class="form-label">University Roll No / USN</label>
                <input type="text" id="reg-roll" class="form-input" placeholder="USN-2023-CSE001">
              </div>
            </div>

            <!-- Teacher Specific Fields -->
            <div id="reg-teacher-fields" class="form-group hidden">
              <label for="reg-empid" class="form-label">Employee Registration ID</label>
              <input type="text" id="reg-empid" class="form-input" placeholder="EMP-XXX-YYY">
            </div>

            <div class="form-group">
              <label for="reg-password" class="form-label">Create Password</label>
              <input type="password" id="reg-password" class="form-input" placeholder="Min 6 characters" required minlength="6">
            </div>

            <button type="submit" class="btn btn-primary" style="width:100%; margin-top:8px;">Submit Registration</button>
          </form>
        </div>
      `;
    } else if (mode === "recover") {
      cardContent = `
        <div class="auth-card">
          <div class="auth-header">
            <div class="auth-logo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h1>Password Recovery</h1>
            <p>Enter your email to verify and reset password</p>
          </div>

          <div id="auth-alert" class="stat-icon-wrapper red hidden" style="width:100%; height:auto; background:#fee2e2; color:#ef4444; border-radius:6px; padding:10px; margin-bottom:16px; font-size:13px; font-weight:500; display:none; justify-content:center;">
          </div>

          <form id="recover-form">
            <div class="form-group">
              <label for="recover-email" class="form-label">College Email ID</label>
              <input type="email" id="recover-email" class="form-input" placeholder="e.g. name@college.edu" required>
            </div>
            <div class="form-group">
              <label for="recover-new-pass" class="form-label">New Password</label>
              <input type="password" id="recover-new-pass" class="form-input" placeholder="Enter new password" required minlength="6">
            </div>
            <button type="submit" class="btn btn-primary" style="width:100%; margin-top:8px;">Reset Password</button>
            <button type="button" class="btn btn-outline" style="width:100%; margin-top:8px;" onclick="AcademicAuth.renderAuthPage('login')">Back to Login</button>
          </form>
        </div>
      `;
    }

    authContainer.innerHTML = cardContent;
    setupFormListeners(mode);
  };

  // Bind forms submit event handlers
  const setupFormListeners = (mode) => {
    const alertDiv = document.getElementById("auth-alert");

    const showAlert = (msg, isSuccess = false) => {
      alertDiv.innerText = msg;
      alertDiv.classList.remove("hidden");
      alertDiv.style.display = "flex";
      if (isSuccess) {
        alertDiv.style.backgroundColor = "var(--success-light)";
        alertDiv.style.color = "var(--success)";
      } else {
        alertDiv.style.backgroundColor = "var(--urgent-light)";
        alertDiv.style.color = "var(--urgent)";
      }
    };

    if (mode === "login") {
      document.getElementById("login-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("login-email").value;
        const pass = document.getElementById("login-password").value;
        const res = login(email, pass);
        if (res.success) {
          window.location.reload(); // Reload triggers routing in app.js
        } else {
          showAlert(res.error);
        }
      });
    } else if (mode === "register") {
      const roleSel = document.getElementById("reg-role");
      const studFields = document.getElementById("reg-student-fields");
      const teachFields = document.getElementById("reg-teacher-fields");

      roleSel.addEventListener("change", (e) => {
        if (e.target.value === "student") {
          studFields.classList.remove("hidden");
          teachFields.classList.add("hidden");
          document.getElementById("reg-roll").setAttribute("required", "true");
          document.getElementById("reg-empid").removeAttribute("required");
        } else {
          studFields.classList.add("hidden");
          teachFields.classList.remove("hidden");
          document.getElementById("reg-roll").removeAttribute("required");
          document.getElementById("reg-empid").setAttribute("required", "true");
        }
      });

      // Default state triggers
      document.getElementById("reg-roll").setAttribute("required", "true");

      document.getElementById("register-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const fields = {
          name: document.getElementById("reg-name").value,
          email: document.getElementById("reg-email").value,
          role: roleSel.value,
          branchId: document.getElementById("reg-branch").value,
          password: document.getElementById("reg-password").value,
          semester: document.getElementById("reg-semester").value,
          rollNumber: document.getElementById("reg-roll").value,
          employeeId: document.getElementById("reg-empid").value
        };

        const res = register(fields);
        if (res.success) {
          if (fields.role === "teacher") {
            showAlert("Registration submitted! Account is pending Admin approval.", true);
            setTimeout(() => renderAuthPage("login"), 3500);
          } else {
            showAlert("Registration successful! Redirection to Login...", true);
            setTimeout(() => renderAuthPage("login"), 1500);
          }
        } else {
          showAlert(res.error);
        }
      });
    } else if (mode === "recover") {
      document.getElementById("recover-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("recover-email").value;
        const newPass = document.getElementById("recover-new-pass").value;
        const res = recoverPassword(email, newPass);
        if (res.success) {
          showAlert("Password has been reset successfully. Redirecting to Login...", true);
          setTimeout(() => renderAuthPage("login"), 2000);
        } else {
          showAlert(res.error);
        }
      });
    }
  };

  return {
    getCurrentUser,
    logout,
    renderAuthPage
  };
})();
