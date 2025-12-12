
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
        // If link actually points to an ID on the page, use smooth scroll.
        // We prevent default only when the target exists on this page.
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({
                behavior: "smooth"
            });
        }
    });
});



function openModal(modalEl) {
    if (!modalEl) return;
    modalEl.setAttribute("aria-hidden", "false");
    // trap focus could be added later
}
function closeModal(modalEl) {
    if (!modalEl) return;
    modalEl.setAttribute("aria-hidden", "true");
}

// NAV avatar behavior: show initials when user exists
function updateNavAvatar() {
    const avatarEls = document.querySelectorAll(".profile-avatar");
    const userJSON = localStorage.getItem("swaplearn_user");
    let initials = "U";
    if (userJSON) {
        try {
            const u = JSON.parse(userJSON);
            if (u && u.name) {
                const parts = u.name.trim().split(/\s+/);
                initials = parts.map(p => p[0]?.toUpperCase()).slice(0,2).join("");
            } else if (u && u.email) {
                initials = u.email.charAt(0).toUpperCase();
            }
        } catch(e) {
            initials = "U";
        }
    }
    avatarEls.forEach(el => {
        el.dataset.initials = initials;
        // set pseudo content by inserting a small span for reliability
        el.innerHTML = `<span class="avatar-initials">${initials}</span>`;
    });
}


(function indexInit() {
    const indexPage = document.getElementById("index-page");
    if (!indexPage) return; // only run on index.html

    // Elements
    const openRegister = document.getElementById("open-register");
    const regModal = document.getElementById("registration-modal");
    const closeRegister = document.getElementById("close-register");
    const registerForm = document.getElementById("register-form");

    openRegister && openRegister.addEventListener("click", function (e) {
        e.preventDefault();
        openModal(regModal);
    });

    // close
    closeRegister && closeRegister.addEventListener("click", () => closeModal(regModal));
    regModal && regModal.addEventListener("click", (ev) => {
        if (ev.target === regModal) closeModal(regModal);
    });

    // registration submit
    registerForm && registerForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const name = document.getElementById("reg-name").value.trim();
        const email = document.getElementById("reg-email").value.trim();
        const password = document.getElementById("reg-password").value;

        // minimal validation
        if (!name || !email || !password) {
            alert("Please complete all fields.");
            return;
        }

       
        const user = {
            name,
            email,
            
            password,
            profile: null // profile will be created on dashboard
        };
        localStorage.setItem("swaplearn_user", JSON.stringify(user));

        // update avatar immediately
        updateNavAvatar();

        // close and go to dashboard page
        closeModal(regModal);
        window.location.href = "dashboard.html";
    });

    // avatar in navbar should also navigate to dashboard or open profile modal
    const navProfile = document.querySelector("#nav-profile");
    navProfile && navProfile.addEventListener("click", function () {
        // if user exists -> go to dashboard (where they can create profile)
        const userJSON = localStorage.getItem("swaplearn_user");
        if (userJSON) {
            window.location.href = "dashboard.html";
        } else {
            // If no user, open registration modal
            openModal(regModal);
        }
    });

    updateNavAvatar();
})();

// Dashboard page logic: profile create/edit and display
(function dashboardInit() {
    const dashboardPage = document.getElementById("dashboard-page");
    if (!dashboardPage) return; // only run on dashboard.html

    const navProfile = document.querySelector("#nav-profile");
    const pModal = document.getElementById("profile-modal");
    const closeProfile = document.getElementById("close-profile");
    const profileForm = document.getElementById("profile-form");
    const profileDisplay = document.getElementById("profile-display");
    const welcomeText = document.getElementById("welcome-text");

    function loadUser() {
        const raw = localStorage.getItem("swaplearn_user");
        if (!raw) return null;
        try { return JSON.parse(raw); } catch(e) { return null; }
    }

    function saveUser(u) {
        localStorage.setItem("swaplearn_user", JSON.stringify(u));
    }

    function renderProfile() {
        const user = loadUser();
        if (!user) {
            welcomeText.textContent = "You are not signed in. Please register from the home page.";
            profileDisplay.innerHTML = "";
            return;
        }
        welcomeText.textContent = `Hello, ${user.name || user.email}!`;

        if (user.profile) {
            const prof = user.profile;
            const skills = (prof.skills || []).map(s => `<span class="pill">${s}</span>`).join(" ");
            const needs = (prof.needs || []).map(n => `<span class="pill pill-muted">${n}</span>`).join(" ");
            profileDisplay.innerHTML = `
                <div style="display:flex;align-items:center;gap:16px;">
                    <div class="profile-avatar large">${getInitials(user.name)}</div>
                    <div>
                      <h3 style="margin:0">${prof.name || user.name}</h3>
                      <p style="margin:4px 0;color:#666">${prof.place || ''}</p>
                    </div>
                </div>
                <div style="margin-top:14px">
                  <strong>Skills:</strong> ${skills || "<em>None</em>"}
                </div>
                <div style="margin-top:8px">
                  <strong>Needs:</strong> ${needs || "<em>None</em>"}
                </div>
                <div style="margin-top:12px">
                  <button id="edit-profile-btn" class="btn-main">Edit Profile</button>
                </div>
            `;
            const editBtn = document.getElementById("edit-profile-btn");
            editBtn && editBtn.addEventListener("click", () => openProfileModalWithData(user.profile));
        } else {
            profileDisplay.innerHTML = `
              <p>You don't have a profile yet. Click your profile avatar (top-right) or the button below to create one.</p>
              <div style="margin-top:12px"><button id="create-profile-btn" class="btn-main">Create Profile</button></div>
            `;
            document.getElementById("create-profile-btn").addEventListener("click", () => openModal(pModal));
        }
    }

    function getInitials(name) {
        if (!name) return "U";
        const parts = name.trim().split(/\s+/);
        return parts.map(p => p[0].toUpperCase()).slice(0,2).join("");
    }

    function openProfileModalWithData(profile) {
        if (!profile) {
            document.getElementById("p-name").value = "";
            document.getElementById("p-place").value = "";
            document.getElementById("p-skills").value = "";
            document.getElementById("p-needs").value = "";
        } else {
            document.getElementById("p-name").value = profile.name || "";
            document.getElementById("p-place").value = profile.place || "";
            document.getElementById("p-skills").value = (profile.skills || []).join(", ");
            document.getElementById("p-needs").value = (profile.needs || []).join(", ");
        }
        openModal(pModal);
    }

    // nav profile click opens modal to create/edit profile
    navProfile && navProfile.addEventListener("click", function () {
        const user = loadUser();
        if (!user) {
            // if no account, send them back to index to register
            alert("Please register first from the home page.");
            window.location.href = "index.html";
            return;
        }
        openProfileModalWithData(user.profile || null);
    });

    // close modal handlers
    closeProfile && closeProfile.addEventListener("click", () => closeModal(pModal));
    pModal && pModal.addEventListener("click", (ev) => {
        if (ev.target === pModal) closeModal(pModal);
    });

    // profile submit - save to user profile
    profileForm && profileForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const pName = document.getElementById("p-name").value.trim();
        const pPlace = document.getElementById("p-place").value.trim();
        const pSkills = document.getElementById("p-skills").value.split(",").map(x => x.trim()).filter(Boolean);
        const pNeeds = document.getElementById("p-needs").value.split(",").map(x => x.trim()).filter(Boolean);

        const user = loadUser() || {};
        user.profile = {
            name: pName || user.name,
            place: pPlace,
            skills: pSkills,
            needs: pNeeds
        };
        saveUser(user);
        closeModal(pModal);
        updateNavAvatar();
        renderProfile();
    });

    // Init: render
    updateNavAvatar();
    renderProfile();
})();


// --- Need Skills ---
fetch("http://localhost:5000/api/discover/need")
  .then(res => res.json())
  .then(data => {
    const needList = document.getElementById("needList");
    if (needList) {
      needList.innerHTML = "";
      data.forEach(row => {
        const li = document.createElement("li");
        li.textContent = `${row.username} needs ${row.skill_name}`;
        needList.appendChild(li);
      });
    }
  });

// --- Teach Skills ---
fetch("http://localhost:5000/api/discover/teach")
  .then(res => res.json())
  .then(data => {
    const teachList = document.getElementById("teachList");
    if (teachList) {
      teachList.innerHTML = "";
      data.forEach(row => {
        const li = document.createElement("li");
        li.textContent = `${row.username} teaches ${row.skill_name}`;
        teachList.appendChild(li);
      });
    }
  });

function toggleMenu() {
    document.getElementById("navMenu").classList.toggle("show");
}
