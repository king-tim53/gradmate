/**
 * GradMate Project Defense Mastery - Core Logic
 * Reorganized for reliability and performance.
 */

// --- 1. GLOBAL STATE & DATA INITIALIZATION ---
let projectProfile = JSON.parse(localStorage.getItem('gradmate_project_profile')) || null;
let vaultState = JSON.parse(localStorage.getItem('gradmate_vault')) || [
    { id: 1, name: "Chapter 1", title: "Introduction", tag: "Setup", synced: false, pages: 0, fileData: null, fileName: "" },
    { id: 2, name: "Chapter 2", title: "Literature Review", tag: "Analysis", synced: false, pages: 0, fileData: null, fileName: "" },
    { id: 3, name: "Chapter 3", title: "Methodology", tag: "Process", synced: false, pages: 0, fileData: null, fileName: "" },
    { id: 4, name: "Chapter 4", title: "Data Analysis", tag: "Results", synced: false, pages: 0, fileData: null, fileName: "" },
    { id: 5, name: "Chapter 5", title: "Conclusion", tag: "Summary", synced: false, pages: 0, fileData: null, fileName: "" }
];
let meetingLogs = JSON.parse(localStorage.getItem('gradmate_meetings')) || [];
let correctionData = JSON.parse(localStorage.getItem('gradmate_corrections')) || [];

// --- 2. CORE INITIALIZATION (Run on Load) ---
document.addEventListener('DOMContentLoaded', () => {
    // UI Libraries
    AOS.init({ duration: 800, once: true });

    // Load Features
    if (projectProfile) updateProjectUI(projectProfile);
    
    const savedStep = localStorage.getItem('gradmate_project_step') || 1;
    updateRoadmap(parseInt(savedStep));

    updateVaultUI();
    renderMeetings();
    renderCorrections();
    loadMethodologySync();

    // Background Sync Processes
    syncSupervisorMeetings();
    syncClearanceStatus();
    setInterval(() => {
        syncSupervisorMeetings();
        syncClearanceStatus();
    }, 5000);

    const linkedSuper = JSON.parse(localStorage.getItem('gradmate_linked_supervisor'));
if (linkedSuper && linkedSuper.status === "APPROVED") {
    // Hide the search box and show the supervisor's name in the header or identity card
    document.getElementById('displaySupervisor').innerHTML = 
        `<i class="fa-solid fa-user-tie text-success me-2"></i> Linked: <span class="fw-bold text-dark">${linkedSuper.name}</span>`;
}
});

// --- 3. PROJECT PROFILE & SETUP ---
document.getElementById('projectSetupForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const projectInfo = {
        topic: document.getElementById('topicInput').value,
        supervisor: document.getElementById('supervisorInput').value,
        start: document.getElementById('startDateInput').value,
        end: document.getElementById('defenseDateInput').value,
        units: document.getElementById('unitsInput').value
    };

    localStorage.setItem('gradmate_project_profile', JSON.stringify(projectInfo));

    // Master Timeline Sync
    const defenseDeadline = {
        id: 'defense-final',
        title: "Final Project Defense",
        date: projectInfo.end,
        category: "project",
        note: "Panel Presentation & External Examination"
    };
    localStorage.setItem('gradmate_defense_deadline', JSON.stringify(defenseDeadline));

    updateProjectUI(projectInfo);
    bootstrap.Modal.getInstance(document.getElementById('projectSetupModal')).hide();
});

function updateProjectUI(data) {
    document.getElementById('displayTopic').innerText = `Topic: ${data.topic}`;
    document.getElementById('displaySupervisor').innerHTML = 
        `<i class="fa-solid fa-user-tie text-primary me-2"></i> Supervisor: <span class="fw-bold text-dark">${data.supervisor}</span>`;
    document.getElementById('displayUnits').innerText = data.units;
    
    const startFormatted = new Date(data.start).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
    const endFormatted = new Date(data.end).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
    
    document.getElementById('displayStart').innerText = startFormatted;
    document.getElementById('displayEnd').innerText = endFormatted;

    // Countdown Logic
    const today = new Date();
    const defenseDay = new Date(data.end);
    const timeDiff = defenseDay.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

    const countdownEl = document.getElementById('daysRemaining');
    countdownEl.innerText = daysLeft > 0 ? daysLeft : "00";
    
    if(daysLeft < 14) countdownEl.classList.replace('text-accent', 'text-danger');
}

// --- 4. THESIS ROADMAP (Pipeline Progress) ---
function updateRoadmap(step) {
    const steps = document.querySelectorAll('.roadmap-step');
    const pipeline = document.getElementById('neonPipeline');
    const percentText = document.getElementById('completionPercent');
    const phaseText = document.getElementById('currentPhase');

    steps.forEach((s, idx) => {
        if (idx < step) s.classList.add('active');
        else s.classList.remove('active');
    });

    const percentage = step * 20;
    const progressWidth = ((step - 1) / (steps.length - 1)) * 100;
    
    if(pipeline) pipeline.style.width = `${progressWidth}%`;
    if(percentText) percentText.innerText = `${percentage}%`;

    const phases = ["Proposal Stage", "Literature Review", "Methodology Phase", "Data Analysis", "Final Review"];
    if(phaseText) phaseText.innerText = phases[step - 1];

    localStorage.setItem('gradmate_project_step', step);
    localStorage.setItem('gradmate_project_percent', percentage); 
}

// --- 5. ANTI-LOSS VAULT (Chapter Management) ---
function updateVaultUI() {
    const container = document.getElementById('vaultFiles');
    if (!container) return;
    container.innerHTML = '';
    
    vaultState.forEach((ch) => {
        container.innerHTML += `
            <div class="vault-card ${ch.synced ? 'synced' : ''}">
                <div class="chapter-number" onclick="openChapterManager(${ch.id})">${ch.id}</div>
                <div class="chapter-info" onclick="openChapterManager(${ch.id})">
                    <span class="sub-topic text-primary fw-bold smaller d-block">${ch.title || 'Untitled Section'}</span>
                    <h6 class="fw-800 mb-0">${ch.name}</h6>
                    ${ch.pages > 0 ? `<span class="page-badge"><i class="fa-solid fa-file-lines me-1"></i>${ch.pages} Pages</span>` : ''}
                </div>
                <div class="ms-auto d-flex align-items-center">
                    ${ch.synced ? `
                        <button class="btn-vault-download" onclick="downloadChapter(${ch.id})" title="Download File">
                            <i class="fa-solid fa-download"></i>
                        </button>` : ''}
                    <button class="btn-manage" onclick="openChapterManager(${ch.id})">
                        <i class="fa-solid fa-ellipsis-vertical"></i>
                    </button>
                </div>
            </div>`;
    });
    localStorage.setItem('gradmate_vault', JSON.stringify(vaultState));
}

function openChapterManager(id) {
    const ch = vaultState.find(c => c.id === id);
    document.getElementById('m_chapterId').value = ch.id;
    document.getElementById('m_chapterName').innerText = `${ch.name} Manager`;
    document.getElementById('m_subTopic').value = ch.title;
    document.getElementById('m_tagline').value = ch.tag || "";
    document.getElementById('m_pages').value = ch.pages || "";
    
    const statusText = document.getElementById('m_statusText text-primary');
    if(statusText) statusText.innerText = ch.synced ? `Synced: ${ch.fileName}` : "Not Uploaded";
    
    new bootstrap.Modal(document.getElementById('chapterManagerModal')).show();
}

function triggerSpecificUpload() {
    document.getElementById('chapterFileInput').click();
}

function handleFileProcessing(input) {
    const id = parseInt(document.getElementById('m_chapterId').value);
    const ch = vaultState.find(c => c.id === id);
    const file = input.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            ch.synced = true;
            ch.fileData = e.target.result;
            ch.fileName = file.name;
            updateVaultUI();
            bootstrap.Modal.getInstance(document.getElementById('chapterManagerModal')).hide();
        };
        reader.readAsDataURL(file);
    }
}

function downloadChapter(id) {
    const ch = vaultState.find(c => c.id === id);
    if (!ch || !ch.fileData) return alert("No file found.");
    const link = document.createElement('a');
    link.href = ch.fileData;
    link.download = `GradMate_${ch.name}_${ch.fileName}`;
    link.click();
}

function saveChapterSettings() {
    const id = parseInt(document.getElementById('m_chapterId').value);
    const ch = vaultState.find(c => c.id === id);
    ch.title = document.getElementById('m_subTopic').value;
    ch.tag = document.getElementById('m_tagline').value;
    ch.pages = document.getElementById('m_pages').value;
    updateVaultUI();
    bootstrap.Modal.getInstance(document.getElementById('chapterManagerModal')).hide();
}

function createNewChapter() {
    const newId = vaultState.length + 1;
    vaultState.push({ id: newId, name: `Chapter ${newId}`, title: "New Section", tag: "", synced: false, pages: 0, fileData: null, fileName: "" });
    updateVaultUI();
}

function deleteChapterFile() {
    const id = parseInt(document.getElementById('m_chapterId').value);
    const chIndex = vaultState.findIndex(c => c.id === id);
    if(confirm(`Completely remove Chapter ${id}?`)) {
        vaultState.splice(chIndex, 1);
        vaultState.forEach((ch, i) => { ch.id = i + 1; ch.name = `Chapter ${i + 1}`; });
        updateVaultUI();
        bootstrap.Modal.getInstance(document.getElementById('chapterManagerModal')).hide();
    }
}

// --- 6. SUPERVISOR SPID & LINKING ---
function searchSPID() {
    const inputField = document.getElementById('spidInput');
    const rawValue = inputField.value.trim().toUpperCase();
    const spidRegex = /^SPID-(DR|PR)-(\d{7})-([A-Z]{2})-([A-Z]+)$/;
    const match = rawValue.match(spidRegex);

    if (!match) {
        inputField.classList.add('shake-input');
        document.getElementById('spidErrorMsg').classList.remove('d-none');
        return; 
    }

    const [full, titleTag, idNumber, initials, uniTag] = match;
    const title = titleTag === 'DR' ? 'Dr.' : 'Prof.';
    
    document.getElementById('res_initials').innerText = initials;
    document.getElementById('res_uni').innerText = uniTag;
    document.getElementById('res_name').innerText = `${title} ${initials.charAt(0)}. ${initials.charAt(1)}. Surname`;
    
    document.getElementById('spidIdleState').classList.add('d-none');
    document.getElementById('spidResultCard').classList.remove('d-none');
}

function requestSupervisorRegistration() {
    const name = document.getElementById('res_name').innerText;
    localStorage.setItem('gradmate_linked_supervisor', JSON.stringify({ name, status: "PENDING", date: new Date().toLocaleDateString() }));
    
    document.getElementById('spidResultCard').classList.add('d-none');
    document.getElementById('spidSuccessState').classList.remove('d-none');
    
    // Fake Approval after 8s
    setTimeout(() => {
        const data = JSON.parse(localStorage.getItem('gradmate_linked_supervisor'));
        data.status = "APPROVED";
        localStorage.setItem('gradmate_linked_supervisor', JSON.stringify(data));
        location.reload(); 
    }, 8000);
}

// --- 7. CONSULTATION LOGS ---
function saveMeeting() {
    const date = document.getElementById('mt_date').value;
    const feedback = document.getElementById('mt_feedback').value;
    const steps = document.getElementById('mt_nextSteps').value;

    if(!date || !feedback) return alert("Fill all fields.");

    meetingLogs.unshift({ id: Date.now(), date, feedback, steps });
    localStorage.setItem('gradmate_meetings', JSON.stringify(meetingLogs));
    renderMeetings();
    bootstrap.Modal.getInstance(document.getElementById('addMeetingModal')).hide();
}

function renderMeetings() {
    const container = document.getElementById('meetingLogContainer');
    if (!container) return;
    if (meetingLogs.length === 0) {
        container.innerHTML = `<div class="text-center py-5 text-muted"><p class="smaller">No meetings logged yet.</p></div>`;
        return;
    }
    container.innerHTML = meetingLogs.map(m => `
        <div class="meeting-item p-3 mb-2 rounded-3 bg-white border-bottom animate__animated animate__fadeIn">
            <span class="meeting-date text-muted smaller fw-bold">${m.date}</span>
            <h6 class="fw-bold mt-1 small text-dark">${m.feedback}</h6>
            <p class="smaller text-muted mb-0"><i class="fa-solid fa-location-dot me-1"></i> ${m.steps}</p>
        </div>`).join('');
}

// --- 8. CORRECTION TRACKER ---
function addCorrection() {
    const text = document.getElementById('corrText').value;
    const chapter = document.getElementById('corrChapter').value;
    const isHigh = document.getElementById('corrPriority').checked;

    if (!text) return;
    correctionData.unshift({ id: Date.now(), text, chapter, priority: isHigh, resolved: false });
    localStorage.setItem('gradmate_corrections', JSON.stringify(correctionData));
    renderCorrections();
    document.getElementById('corrText').value = "";
}

function renderCorrections() {
    const list = document.getElementById('correctionList');
    if (!list) return;
    list.innerHTML = '';
    
    let pending = 0;
    correctionData.forEach(task => {
        if(!task.resolved) pending++;
        list.innerHTML += `
            <div class="correction-item ${task.priority ? 'high-priority' : ''} ${task.resolved ? 'resolved' : ''}">
                <input type="checkbox" class="form-check-input me-3" ${task.resolved ? 'checked' : ''} onclick="toggleTask(${task.id})">
                <div class="flex-grow-1">
                    <span class="chapter-tag">${task.chapter}</span>
                    <span class="correction-text">${task.text}</span>
                </div>
                <button class="btn-delete-task" onclick="deleteTask(${task.id})"><i class="fa-solid fa-trash-can"></i></button>
            </div>`;
    });
    document.getElementById('pendingCount').innerText = `${pending} Tasks Pending`;
}

function toggleTask(id) {
    const task = correctionData.find(t => t.id === id);
    task.resolved = !task.resolved;
    localStorage.setItem('gradmate_corrections', JSON.stringify(correctionData));
    renderCorrections();
}

function deleteTask(id) {
    correctionData = correctionData.filter(t => t.id !== id);
    localStorage.setItem('gradmate_corrections', JSON.stringify(correctionData));
    renderCorrections();
}

// --- 9. AI DEFENSE SIMULATOR ---
const defenseBank = [
    { question: "What is the 'Problem Statement' of your research?", hint: "Examiners want to see the specific gap you are filling." },
    { question: "Why did you choose this Research Methodology?", hint: "Discuss feasibility and data accuracy." },
    { question: "How did you arrive at your sample size?", hint: "Quote your formula (e.g., Taro Yamane)." }
];

function generateMockQuestion() {
    const idx = Math.floor(Math.random() * defenseBank.length);
    const q = defenseBank[idx];
    document.getElementById('mockQuestion').innerText = q.question;
    document.getElementById('questionHint').innerText = q.hint;
    document.getElementById('hintBtn').disabled = false;
    document.getElementById('hintArea').classList.add('d-none');
}

function toggleHint() {
    document.getElementById('hintArea').classList.toggle('d-none');
}

// --- 10. CITATION ENGINE ---
function generateCitation() {
    const author = document.getElementById('citeAuthor').value;
    const year = document.getElementById('citeYear').value;
    const title = document.getElementById('citeTitle').value;
    const matric = document.getElementById('citeMatric').value;
    
    if(!author || !year || !title) return;
    const citation = `${author} (${year}). ${title}. GradMate Academic Repository.`;
    document.getElementById('citationText').innerText = citation;
    document.getElementById('citationResultContainer').classList.remove('d-none');
}

function copyCitation() {
    const text = document.getElementById('citationText').innerText;
    navigator.clipboard.writeText(text);
    alert("Citation Copied!");
}

// --- 11. BACKGROUND SYNC UTILS ---
function syncClearanceStatus() {
    const signal = JSON.parse(localStorage.getItem('gradmate_clearance_signal'));
    if (signal) {
        document.getElementById('clearanceZone').classList.remove('d-none');
        document.getElementById('clearanceCode').innerText = `AUTH: ${signal.code}`;
    }
}

function loadMethodologySync() {
    const syncData = JSON.parse(localStorage.getItem('gradmate_methodology_sync'));
    if (syncData) {
        document.getElementById('linkedSampleSize').innerText = syncData.sampleSize;
        document.getElementById('linkedPop').innerText = syncData.population;
        document.getElementById('methodologyLink').classList.remove('d-none');
    }
}

function syncSupervisorMeetings() {
    const mailbox = JSON.parse(localStorage.getItem('gradmate_meeting_mailbox'));
    if (mailbox) {
        meetingLogs = [...mailbox, ...meetingLogs];
        localStorage.removeItem('gradmate_meeting_mailbox');
        localStorage.setItem('gradmate_meetings', JSON.stringify(meetingLogs));
        renderMeetings();
    }
}

function downloadNUCGuide() {
    alert("Downloading: GradMate_NUC_Standard_Project_Guide.pdf");
}