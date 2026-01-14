/**
 * GradMate Supervisor Logic
 * Handles real-time data injection from localStorage and section switching.
 */

// --- 1. STATE & DATA ---
let supervisorData = [
    { id: 1, name: "Timofe Segun-Ojo", matric: "2403200003", status: "Uploaded Chapter 1", stage: "ch1", cleared: false },
    { id: 2, name: "Sarah Alabi", matric: "2403200005", status: "Uploaded Chapter 2", stage: "ch2", cleared: false },
    { id: 3, name: "Emeka Okonkwo", matric: "2403200010", status: "Correction Needed (Ch 3)", stage: "ch3", cleared: false }
];

let pendingStudents = [
    { id: 101, name: "Daniel Kaluuya", matric: "2403200055", date: "Just now" }
];

let settings = JSON.parse(localStorage.getItem('gradmate_sup_settings')) || { autoAccept: true };

// --- 2. INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    AOS.init();
    
    // Get logged in user from localStorage
    const currentUser = JSON.parse(localStorage.getItem('gradmateUser'));

    // SECURITY & INJECTION
    if (currentUser && currentUser.role === 'supervisor') {
        // Inject Identity Info
        document.getElementById('supTitle').innerText = currentUser.title || "Staff";
        document.getElementById('supName').innerText = currentUser.name;
        document.getElementById('supUni').innerText = (currentUser.university || "University").toUpperCase();
        document.getElementById('supStaffId').innerText = currentUser.staffId || "N/A";
        
        // FIX: Inject the actual SPID (e.g. DR-87654321-FA)
        const spidDisplay = document.getElementById('displaySPID');
        if(spidDisplay) {
            spidDisplay.innerText = currentUser.displayID || `SPID-${currentUser.staffId}`;
        }

        // Set Department (Fallback if not chosen during signup)
        document.getElementById('supDept').innerText = currentUser.department || "General Research";
    } else {
        // Redirect to login if someone tries to access this page without being a supervisor
        console.warn("Unauthorized access detected.");
        // window.location.href = "login.html"; 
    }

    // Render components
    updateStats();
    renderStudentList(supervisorData);
    renderPendingRequests();
    renderSiwesList();
    
    // Apply saved settings to UI
    const autoToggle = document.getElementById('toggleAutoAccept');
    if(autoToggle) autoToggle.checked = settings.autoAccept;
});

// --- 3. SECTION NAVIGATION ---
window.switchSection = function(sectionId) {
    // Hide all sections
    document.querySelectorAll('.view-section').forEach(el => el.classList.add('d-none'));
    
    // Show target section
    const target = document.getElementById(`section-${sectionId}`);
    if(target) {
        target.classList.remove('d-none');
    } else {
        console.error(`Section section-${sectionId} not found!`);
    }
    
    // Update Sidebar Active State
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    // This finds the clicked sidebar item
    if(event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
};

// --- 4. CORE FEATURES ---

function updateStats() {
    document.getElementById('statTotal').innerText = supervisorData.length;
    document.getElementById('statCleared').innerText = supervisorData.filter(s => s.cleared).length;
    document.getElementById('statPending').innerText = supervisorData.filter(s => s.status.includes("Uploaded")).length;
}

function renderStudentList(data) {
    const container = document.getElementById('studentListContainer');
    if(!container) return;
    
    container.innerHTML = data.map(student => `
        <div class="student-row d-md-flex align-items-center">
            <div class="col-md-4 d-flex align-items-center">
                <div class="avatar-initials me-3">${getInitials(student.name)}</div>
                <div>
                    <h6 class="fw-bold mb-0 text-dark">${student.name}</h6>
                    <p class="text-muted smaller mb-0 font-monospace">${student.matric}</p>
                </div>
            </div>
            <div class="col-md-3">
                <span class="status-badge status-pending">${student.status}</span>
            </div>
            <div class="col-md-5 text-md-end">
                <button class="btn-action" onclick="openPushModal(${student.id})"><i class="fa-solid fa-pen"></i></button>
                <button class="btn-action bg-dark text-white" onclick="actionClear(${student.id})"><i class="fa-solid fa-gavel"></i></button>
            </div>
        </div>
    `).join('');

    // Inside renderStudentList(data)
data.forEach(student => {
    // Calculate if student is "Inactive" (e.g., no update in 7 days)
    const lastUpdate = new Date(student.lastSeen || Date.now()); 
    const daysInactive = Math.floor((new Date() - lastUpdate) / (1000 * 60 * 60 * 24));
    const isInactive = daysInactive >= 14;

    const row = document.createElement('div');
    row.className = `student-row ${isInactive ? 'border-start border-4 border-danger' : ''}`;
    
    row.innerHTML = `
        <div class="col-md-5 text-md-end">
            ${isInactive ? `
                <button class="btn btn-sm btn-warning fw-bold me-2" onclick="sendNudge(${student.id}, '${student.name}')">
                    <i class="fa-solid fa-bell fa-shake"></i> Nudge
                </button>` : ''}
            </div>
    `;
});
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

function copySPID() {
    const text = document.getElementById('displaySPID').innerText;
    navigator.clipboard.writeText(text);
    showToast("SPID copied to clipboard!");
}

function showToast(msg) {
    const toastMsg = document.getElementById('toastMsg');
    if(toastMsg) toastMsg.innerText = msg;
    const toastEl = document.getElementById('actionToast');
    if(toastEl) {
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
    }
}


function sendNudge(studentId, studentName) {
    const nudgeData = {
        id: Date.now(),
        sender: JSON.parse(localStorage.getItem('gradmateUser')).name,
        timestamp: new Date().toISOString(),
        message: "Your supervisor noticed you haven't updated your progress recently. Please sync your latest work.",
        targetStudentId: studentId
    };

    // Store the nudge in a global mailbox
    let nudges = JSON.parse(localStorage.getItem('gradmate_nudges')) || [];
    nudges.push(nudgeData);
    localStorage.setItem('gradmate_nudges', JSON.stringify(nudges));

    showToast(`Nudge sent to ${studentName}`);
}

// ... Additional SIWES and Repository functions from your file go here ...