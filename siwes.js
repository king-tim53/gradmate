/**
 * GradMate SIWES Module Logic
 * Organized by Feature Groups
 */

// --- 1. GLOBAL STATE & INITIALIZATION ---
let technicalLogs = JSON.parse(localStorage.getItem('gradmate_logs')) || [];
let visitHistory = JSON.parse(localStorage.getItem('gradmate_visits')) || [];
let userSkills = JSON.parse(localStorage.getItem('gradmate_skills')) || [];
let vaultFiles = JSON.parse(localStorage.getItem('gradmate_vault_data')) || [];

document.addEventListener('DOMContentLoaded', () => {
    // Initialize AOS Animation
    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 800, once: true });
    }

    // Initial UI Renders
    renderVault();
    renderLogs();
    renderSkills();
    updateVisitationUI();
    renderHistory();
    activateSidebar();
    loadPlacementDetails(); // Load saved placement on start

    // Inside renderLogs(data) in siwes.js
    function renderLogs(data = technicalLogs) {
        const container = document.getElementById('logEntries');
        const emptyState = document.getElementById('logEmptyState');
        container.innerHTML = '';
    
        if (data.length === 0) {
            emptyState.classList.remove('d-none');
            return;
        }
        emptyState.classList.add('d-none');
    
        data.forEach(log => {
            // Check if the log is already verified by a mentor
            const isVerified = log.status === 'Industry Verified';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="ps-4"><input type="checkbox" class="log-checkbox" data-id="${log.id}"></td>
                <td class="small fw-bold text-secondary">${log.date}</td>
                <td class="text-wrap-300">${log.work}</td>
                <td class="text-muted smaller">${log.lessons}</td>
                <td>
                    <span class="status-chip ${isVerified ? 'bg-success text-white' : 'status-synced'}">
                        ${log.status}
                    </span>
                </td>
                <td class="text-end pe-4">
                    ${!isVerified ? `
                    <button class="btn btn-sm btn-outline-success me-1" onclick="openMentorPortal(${log.id})" title="Request Mentor Signature">
                        <i class="fa-solid fa-signature"></i>
                    </button>` : ''}
                    
                    <button class="btn-edit me-1" onclick="openEditModal(${log.id})"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-delete" onclick="deleteLog(${log.id})"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            container.appendChild(row);
        });
    }
});

// --- 2. PLACEMENT SETUP & DASHBOARD SYNC ---
function loadPlacementDetails() {
    const meta = JSON.parse(localStorage.getItem('gradmate_siwes_meta'));
    if (meta) {
        document.getElementById('displayCompany').innerText = meta.company;
        document.getElementById('displayPosition').innerText = meta.pos;
        document.getElementById('displayUnits').innerText = `${meta.units} Units`;
        
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        document.getElementById('displayStart').innerText = new Date(meta.start).toLocaleDateString('en-US', options);
        document.getElementById('displayEnd').innerText = new Date(meta.end).toLocaleDateString('en-US', options);
        
        // Update Days Remaining
        const today = new Date().setHours(0,0,0,0);
        const end = new Date(meta.end).setHours(0,0,0,0);
        const diffDays = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
        document.getElementById('daysRemaining').innerText = diffDays > 0 ? diffDays : 0;
    }
}

document.getElementById('setupForm').addEventListener('submit', function(e) {
    e.preventDefault();

    try {
        localStorage.setItem('test_storage', '1');
        localStorage.removeItem('test_storage');
    } catch (err) {
        alert("CRITICAL ERROR: Your browser is blocking LocalStorage.");
        return;
    }
    
    const company = document.getElementById('companyIn').value;
    const pos = document.getElementById('posIn').value;
    const startStr = document.getElementById('startIn').value;
    const endStr = document.getElementById('endIn').value;
    const units = document.getElementById('unitsIn').value;

    if (!startStr || !endStr) return alert("Please select both dates.");

    const start = new Date(startStr);
    const end = new Date(endStr);
    const today = new Date();

    // Calculate progress percentage
    const total = end - start;
    const passed = today - start;
    let percent = total > 0 ? Math.round((passed / total) * 100) : 0;
    percent = Math.max(0, Math.min(100, percent));

    // Save Data
    const meta = { company, pos, start: start.toISOString(), end: end.toISOString(), units };
    localStorage.setItem('gradmate_siwes_meta', JSON.stringify(meta));
    localStorage.setItem('gradmate_siwes_percent', percent);
    
    // Save deadline for main dashboard
    localStorage.setItem('gradmate_siwes_deadline', JSON.stringify({
        id: 'siwes-final', title: 'End of SIWES Program', date: endStr, category: 'siwes'
    }));

    loadPlacementDetails();
    bootstrap.Modal.getInstance(document.getElementById('setupSiwesModal')).hide();
    alert("Placement Setup Saved!");
});


// --- 3. SUPERVISOR VISITATION LOGIC ---
function toggleVisitMode() {
    const isDigital = document.getElementById('supToggle').checked;
    document.getElementById('manualModeInputs').classList.toggle('d-none', isDigital);
    document.getElementById('digitalModeInputs').classList.toggle('d-none', !isDigital);
}

function recordVisit() {
    const isDigital = document.getElementById('supToggle').checked;
    const dateInput = document.getElementById('supDateIn').value;
    if (!dateInput) return alert("Please select a date.");

    let newVisit = {
        id: Date.now(),
        date: new Date(dateInput).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        type: isDigital ? 'digital' : 'manual',
        status: isDigital ? 'pending' : 'logged'
    };

    if (isDigital) {
        const spid = document.getElementById('supSpidIn').value.trim();
        if (spid.length < 5) return alert("Please enter a valid SPID.");
        newVisit.name = `Supervisor (${spid})`; 
        newVisit.spid = spid;
    } else {
        const name = document.getElementById('supNameIn').value.trim();
        if (!name) return alert("Please enter the Supervisor's Name.");
        newVisit.name = name;
    }
    
    visitHistory.push(newVisit);
    localStorage.setItem('gradmate_visits', JSON.stringify(visitHistory));

    updateVisitationUI();
    renderHistory();
    
    bootstrap.Modal.getInstance(document.getElementById('logVisitModal')).hide();
    document.getElementById('supNameIn').value = "";
    document.getElementById('supSpidIn').value = "";
}

function updateVisitationUI() {
    const circle = document.getElementById('visitationStatus');
    const text = document.getElementById('visitationText');
    const details = document.getElementById('lastVisitDetails');
    const countLabel = document.getElementById('visitCount');

    if (visitHistory.length === 0) return;

    const latest = visitHistory[visitHistory.length - 1];
    countLabel.innerText = `${visitHistory.length} Visits`;
    details.classList.remove('d-none');
    document.getElementById('lastSupName').innerText = latest.name;

    if (latest.type === 'digital' && latest.status === 'pending') {
        circle.className = 'visitation-pulse bg-warning text-white mb-3';
        circle.innerHTML = '<i class="fa-solid fa-hourglass-half"></i>';
        text.innerHTML = `<span class="text-warning fw-bold">Verification Pending...</span>`;
    } else {
        circle.className = 'visitation-pulse bg-soft-blue text-primary mb-3';
        circle.innerHTML = '<i class="fa-solid fa-user-check"></i>';
        text.innerHTML = `<span class="text-primary fw-bold">Visit Logged</span>`;
    }
}

function renderHistory() {
    const listContainer = document.getElementById('visitHistoryList');
    if (visitHistory.length === 0) return;

    listContainer.innerHTML = [...visitHistory].reverse().map(visit => `
        <div class="history-item animate__animated animate__fadeIn">
            <div class="history-icon bg-light">
                <i class="fa-solid ${visit.type === 'digital' ? 'fa-fingerprint' : 'fa-user-pen'}"></i>
            </div>
            <div class="history-info">
                <h6 class="mb-0 text-dark small fw-bold">${visit.name}</h6>
                <small class="text-muted"><i class="fa-regular fa-calendar me-1"></i> ${visit.date}</small>
            </div>
            <div class="ms-auto">
                <span class="badge ${visit.status === 'pending' ? 'bg-warning' : 'bg-light text-muted'}">${visit.status}</span>
            </div>
        </div>
    `).join('');
}


// --- 4. DAILY LOGBOOK MANAGEMENT ---
document.getElementById('logForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const newLog = {
        id: Date.now(),
        date: new Date().toLocaleDateString('en-GB'),
        work: document.getElementById('workIn').value,
        lessons: document.getElementById('lessonIn').value,
        status: 'Synced'
    };
    technicalLogs.unshift(newLog);
    localStorage.setItem('gradmate_logs', JSON.stringify(technicalLogs));
    renderLogs();
    this.reset();
    bootstrap.Modal.getInstance(document.getElementById('addLogModal')).hide();
});

function renderLogs(data = technicalLogs) {
    const container = document.getElementById('logEntries');
    const emptyState = document.getElementById('logEmptyState');
    container.innerHTML = '';

    if (data.length === 0) {
        emptyState.classList.remove('d-none');
        return;
    }
    emptyState.classList.add('d-none');

    data.forEach(log => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="ps-4"><input type="checkbox" class="log-checkbox" data-id="${log.id}"></td>
            <td class="small fw-bold text-secondary">${log.date}</td>
            <td class="text-wrap-300">${log.work}</td>
            <td class="text-muted smaller">${log.lessons}</td>
            <td><span class="status-chip status-synced">${log.status}</span></td>
            <td class="text-end pe-4">
                <button class="btn-edit me-1" onclick="openEditModal(${log.id})"><i class="fa-solid fa-pen"></i></button>
                <button class="btn-delete" onclick="deleteLog(${log.id})"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        container.appendChild(row);
    });
}

function deleteLog(id) {
    if(confirm("Delete this log entry?")) {
        technicalLogs = technicalLogs.filter(l => l.id !== id);
        localStorage.setItem('gradmate_logs', JSON.stringify(technicalLogs));
        renderLogs();
    }
}

function filterLogs() {
    const query = document.getElementById('logSearch').value.toLowerCase();
    const filtered = technicalLogs.filter(l => 
        l.work.toLowerCase().includes(query) || l.lessons.toLowerCase().includes(query)
    );
    renderLogs(filtered);
}
document.getElementById('logForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const submitBtn = this.querySelector('button[type="submit"]');
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Tagging Location...';

    // Request Geo-location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude.toFixed(4);
            const lng = position.coords.longitude.toFixed(4);
            saveLogWithGeo(lat, lng);
        }, () => {
            // If user denies location, save anyway but without geo-tag
            saveLogWithGeo(null, null);
        });
    } else {
        saveLogWithGeo(null, null);
    }
});

function saveLogWithGeo(lat, lng) {
    const newLog = {
        id: Date.now(),
        date: new Date().toLocaleDateString('en-GB'),
        work: document.getElementById('workIn').value,
        lessons: document.getElementById('lessonIn').value,
        status: 'Synced',
        geo: lat ? `${lat}, ${lng}` : null, // The Geo-tag
        timestamp: new Date().toLocaleTimeString()
    };
    
    technicalLogs.unshift(newLog);
    localStorage.setItem('gradmate_logs', JSON.stringify(technicalLogs));
    
    renderLogs();
    document.getElementById('logForm').reset();
    bootstrap.Modal.getInstance(document.getElementById('addLogModal')).hide();
    
    // Reset button text
    document.querySelector('#logForm button[type="submit"]').innerHTML = 'Sync with Logbook';
}

// --- 5. DOCUMENT VAULT (4 SLOT LIMIT) ---
function handleVaultUpload(input, slotId) {
    const file = input.files[0];
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) return alert("File too large! (Limit 1.5MB)");

    const reader = new FileReader();
    reader.onload = function(e) {
        const fileData = {
            id: Date.now(),
            slot: slotId,
            name: file.name,
            content: e.target.result,
            type: file.type,
            size: (file.size / 1024).toFixed(1) + ' KB'
        };
        vaultFiles = vaultFiles.filter(f => f.slot !== slotId);
        vaultFiles.push(fileData);
        localStorage.setItem('gradmate_vault_data', JSON.stringify(vaultFiles));
        renderVault();
    };
    reader.readAsDataURL(file);
}

function renderVault() {
    const labels = ["SCAF Form", "ITF Form 8", "ID Copy", "Other"];
    const icons = ["fa-file-contract", "fa-file-invoice", "fa-id-card", "fa-ellipsis"];

    for (let i = 1; i <= 4; i++) {
        const slot = document.getElementById(`vault-slot-${i}`);
        const file = vaultFiles.find(f => f.slot === i);

        if (file) {
            slot.innerHTML = `
                <div class="vault-file-card animate__animated animate__fadeIn">
                    <i class="fa-solid fa-file-pdf mb-2 text-primary" style="font-size: 2rem;"></i>
                    <div class="file-name-text fw-bold small text-truncate w-100 px-2">${file.name}</div>
                    <div class="vault-actions mt-2">
                        <button class="btn-vault-action" onclick="downloadVaultFile(${file.id})"><i class="fa-solid fa-download"></i></button>
                        <button class="btn-vault-action text-danger" onclick="deleteVaultFile(${file.id})"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>`;
            slot.classList.add('has-file');
        } else {
            slot.innerHTML = `
                <label class="vault-upload-label w-100 h-100 d-flex flex-column align-items-center justify-content-center">
                    <input type="file" hidden onchange="handleVaultUpload(this, ${i})">
                    <i class="fa-solid ${icons[i-1]} mb-2 opacity-50" style="font-size: 1.8rem;"></i>
                    <span class="smaller fw-bold">${labels[i-1]}</span>
                    <span class="text-muted" style="font-size: 0.65rem;">Click to upload</span>
                </label>`;
            slot.classList.remove('has-file');
        }
    }
    if(document.getElementById('vaultCount')) document.getElementById('vaultCount').innerText = `(${vaultFiles.length}/4)`;
}

function deleteVaultFile(id) {
    vaultFiles = vaultFiles.filter(f => f.id !== id);
    localStorage.setItem('gradmate_vault_data', JSON.stringify(vaultFiles));
    renderVault();
}

function downloadVaultFile(id) {
    const file = vaultFiles.find(f => f.id === id);
    if (file) {
        const a = document.createElement('a');
        a.href = file.content;
        a.download = file.name;
        a.click();
    }
}


// --- 6. SKILL TRACKER ---
document.getElementById('addSkillForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const newSkill = {
        id: Date.now(),
        name: document.getElementById('skillNameIn').value,
        level: document.getElementById('skillLevelIn').value
    };
    userSkills.push(newSkill);
    localStorage.setItem('gradmate_skills', JSON.stringify(userSkills));
    renderSkills();
    bootstrap.Modal.getInstance(document.getElementById('addSkillModal')).hide();
    this.reset();
});

function renderSkills() {
    const container = document.getElementById('skillsContainer');
    if (userSkills.length === 0) {
        container.innerHTML = `<div class="text-center py-4 text-muted smaller">No skills added yet.</div>`;
        return;
    }
    container.innerHTML = userSkills.map(skill => `
        <div class="skill-item animate__animated animate__fadeInUp">
            <div class="d-flex justify-content-between align-items-center">
                <div><span class="fw-bold small">${skill.name}</span> <span class="smaller text-muted ms-2">${skill.level}%</span></div>
                <i class="fa-solid fa-trash-can delete-skill smaller" onclick="deleteSkill(${skill.id})"></i>
            </div>
            <div class="skill-progress-bar"><div class="skill-progress-fill" style="width: ${skill.level}%"></div></div>
        </div>`).join('');
}

function deleteSkill(id) {
    userSkills = userSkills.filter(s => s.id !== id);
    localStorage.setItem('gradmate_skills', JSON.stringify(userSkills));
    renderSkills();
}


// --- 7. REPORT GENERATOR ---
function generateReportOutline() {
    const reportOutput = document.getElementById('reportOutput');
    const logs = JSON.parse(localStorage.getItem('gradmate_logs')) || [];
    const placement = JSON.parse(localStorage.getItem('gradmate_siwes_meta')) || {};

    reportOutput.innerHTML = `<div class="text-center py-5"><h5>Synthesizing Data...</h5></div>`;

    setTimeout(() => {
        if (logs.length === 0) {
            reportOutput.innerHTML = `<div class="text-center py-5"><p>No logs found. Add entries first.</p></div>`;
            return;
        }

        const uniqueTasks = [...new Set(logs.map(l => l.work))].slice(0, 5);
        reportOutput.innerHTML = `
            <div class="report-document" style="font-family: serif; padding: 20px; background: white; color: black;">
                <h4 class="text-center text-uppercase">Technical Report</h4>
                <p class="text-center">Organization: <strong>${placement.company || 'N/A'}</strong></p>
                <hr>
                <h6>Introduction</h6>
                <p>This report covers technical training as a ${placement.pos || 'Intern'}.</p>
                <h6>Work Executed</h6>
                <ul>${uniqueTasks.map(t => `<li>${t}</li>`).join('')}</ul>
            </div>`;
    }, 1000);
}


// --- 8. UTILS & NAVIGATION ---
function activateSidebar() {
    const currentPage = window.location.pathname.split("/").pop();
    const navIds = { 'siwes.html': 'nav-siwes', 'dashboard.html': 'nav-dashboard' };
    const activeId = navIds[currentPage];
    if (activeId && document.getElementById(activeId)) {
        document.getElementById(activeId).classList.add('active');
    }
}

function bulkExport() {
    window.print();
}

function toggleSelectAll(source) {
    document.querySelectorAll('.log-checkbox').forEach(c => c.checked = source.checked);
}

function generateMentorLink(logId) {
    const log = technicalLogs.find(l => l.id === logId);
    const student = JSON.parse(localStorage.getItem('gradmateUser'));

    // Populate the Mentor View Modal
    document.getElementById('m_logId').value = logId;
    document.getElementById('m_studentName').innerText = student.name;
    document.getElementById('m_logDate').innerText = log.date;
    document.getElementById('m_logWork').innerText = log.work;
    document.getElementById('m_logLessons').innerText = log.lessons;

    new bootstrap.Modal(document.getElementById('mentorReviewModal')).show();
}

function mentorSignOff() {
    const logId = parseInt(document.getElementById('m_logId').value);
    const mentorName = document.getElementById('mentorName').value;

    if (!mentorName) return alert("Please enter your name to sign.");

    // Update the log status
    const logIndex = technicalLogs.findIndex(l => l.id === logId);
    technicalLogs[logIndex].status = 'Industry Verified';
    technicalLogs[logIndex].mentor = mentorName;
    technicalLogs[logIndex].verifiedAt = new Date().toISOString();

    // Save and Refresh
    localStorage.setItem('gradmate_logs', JSON.stringify(technicalLogs));
    renderLogs();

    bootstrap.Modal.getInstance(document.getElementById('mentorReviewModal')).hide();
    alert(`Log successfully verified by ${mentorName}`);
}

// Opens the modal and populates it with that specific log's data
window.openMentorPortal = function(logId) {
    const log = technicalLogs.find(l => l.id === logId);
    const user = JSON.parse(localStorage.getItem('gradmateUser'));

    document.getElementById('m_logId').value = logId;
    document.getElementById('m_studentName').innerText = user.name;
    document.getElementById('m_logDate').innerText = log.date;
    document.getElementById('m_logWork').innerText = log.work;
    document.getElementById('m_logLessons').innerText = log.lessons;

    new bootstrap.Modal(document.getElementById('mentorReviewModal')).show();
};

// Processes the mentor's signature and updates the status
window.mentorSignOff = function() {
    const logId = parseInt(document.getElementById('m_logId').value);
    const mentorName = document.getElementById('mentorName').value;

    if (!mentorName) return alert("Mentor must enter their name to sign off.");

    const logIndex = technicalLogs.findIndex(l => l.id === logId);
    if (logIndex > -1) {
        // Update the status and attach mentor name
        technicalLogs[logIndex].status = 'Industry Verified';
        technicalLogs[logIndex].mentorName = mentorName;
        technicalLogs[logIndex].verifiedAt = new Date().toISOString();

        // Save back to LocalStorage
        localStorage.setItem('gradmate_logs', JSON.stringify(technicalLogs));
        
        // Refresh Table
        renderLogs();
        
        // Close Modal
        bootstrap.Modal.getInstance(document.getElementById('mentorReviewModal')).hide();
        
        // Show success (Use existing toast if available)
        alert(`Log entry verified by ${mentorName}`);
    }
};