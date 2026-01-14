document.addEventListener('DOMContentLoaded', () => {
    
    // Sidebar Toggle for Mobile
    const toggleBtn = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    
    if(toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }

    // Rotating Student Tips (Feature 6)
    const tips = [
        "Always make at least 3 hard copies of your final project before defense day!",
        "Start your SIWES logbook entries daily. Don't wait until the weekend!",
        "Meet your supervisor at least once every two weeks to stay on their good side.",
        "Dress professionally for your IT placement; industry connections start with appearance.",
        "Your project abstract is the first thing examiners read. Make it perfect!"
    ];

    const tipElement = document.getElementById('studentTip');
    let currentTip = 0;

    setInterval(() => {
        currentTip = (currentTip + 1) % tips.length;
        tipElement.style.opacity = 0;
        setTimeout(() => {
            tipElement.innerText = tips[currentTip];
            tipElement.style.opacity = 1;
        }, 500);
    }, 8000);

    // Dynamic Greeting based on time
    const greetingHeader = document.querySelector('.welcome-text h4');
    const hour = new Date().getHours();
    let greet = "Welcome back";
    
    if (hour < 12) greet = "Good morning";
    else if (hour < 17) greet = "Good afternoon";
    else greet = "Good evening";

    greetingHeader.innerHTML = `${greet}, <span class="text-primary">Timofe</span>!`;
});

// --- Feature 4: Peak Timeline Logic ---

let masterDeadlines = JSON.parse(localStorage.getItem('gradmate_deadlines')) || [
    { id: 1, title: "Industry Supervisor Signing", date: "2024-10-24", category: "siwes", note: "Weekly Logbook verification" },
    { id: 2, title: "Submit Project Chapter 3", date: "2024-10-28", category: "project", note: "Send to Prof. Adebayo" }
];

// --- Feature 2 Fix: Dashboard Timeline Renderer (Final Version) ---
function renderDeadlines() {
    const list = document.getElementById('timelineList');
    if (!list) return;

    // 1. FETCH DATA SOURCES
    const manualDeadlines = JSON.parse(localStorage.getItem('gradmate_deadlines')) || [];
    const projectDeadline = JSON.parse(localStorage.getItem('gradmate_defense_deadline'));
    const tpDeadline = JSON.parse(localStorage.getItem('gradmate_tp_deadline'));
    // NEW: Get SIWES Deadline
    const siwesDeadline = JSON.parse(localStorage.getItem('gradmate_siwes_deadline'));

    // 2. COMBINE THEM
    let allEvents = [...manualDeadlines];
    if (projectDeadline) allEvents.push(projectDeadline);
    if (tpDeadline) allEvents.push(tpDeadline);
    if (siwesDeadline) allEvents.push(siwesDeadline);

    // 3. SORT BY DATE
    allEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

    // 4. HANDLE EMPTY STATE
    if (allEvents.length === 0) {
        list.innerHTML = `
            <div class="text-center py-5 empty-timeline">
                <i class="fa-solid fa-calendar-xmark fa-3x mb-3 opacity-25"></i>
                <p class="text-muted small">No upcoming deadlines. You're all caught up!</p>
            </div>`;
        return;
    }

    // 5. RENDER THE LIST
    list.innerHTML = allEvents.map(event => {
        const dateObj = new Date(event.date);
        const day = dateObj.getDate();
        const month = dateObj.toLocaleString('en-US', { month: 'short' });
        
        // Dynamic Styling
        let colorClass = 'info'; // Default Blue (SIWES/Manual)
        let icon = 'fa-briefcase';

        if (event.category === 'project') {
            colorClass = 'primary'; // Purple
            icon = 'fa-graduation-cap';
        } else if (event.category === 'tp') {
            colorClass = 'warning'; // Orange
            icon = 'fa-chalkboard-user';
        }

        // Lock icon for official dates, trash icon for manual ones
        const isOfficial = ['siwes-final', 'tp-final', 'defense-final'].includes(event.id);

        return `
            <div class="timeline-item d-flex align-items-center p-3 mb-3 bg-white rounded-4 border-start border-4 border-${colorClass} shadow-sm animate__animated animate__fadeIn">
                <div class="date-badge text-center me-3 bg-light rounded-3 p-2" style="min-width: 55px;">
                    <h5 class="fw-800 mb-0">${day}</h5>
                    <small class="text-uppercase fw-bold smaller text-muted">${month}</small>
                </div>
                <div class="flex-grow-1">
                    <h6 class="fw-800 mb-0 small text-dark">${event.title}</h6>
                    <small class="text-muted smaller"><i class="fa-solid ${icon} me-1"></i> ${event.note}</small>
                </div>
                <div class="ms-auto">
                    ${isOfficial ? 
                        '<small class="text-muted opacity-50"><i class="fa-solid fa-lock"></i></small>' : 
                        `<button class="btn btn-link text-danger p-0" onclick="deleteDeadline('${event.id}')"><i class="fa-solid fa-circle-xmark"></i></button>`
                    }
                </div>
            </div>
        `;
    }).join('');
}

// --- Feature 3: Peak Knowledge Hub Filter ---

function filterHub() {
    const query = document.getElementById('hubSearch').value.toLowerCase();
    const items = document.querySelectorAll('.hub-item');
    const emptyState = document.getElementById('hubEmpty');
    let found = false;

    items.forEach(item => {
        const text = item.getAttribute('data-topic').toLowerCase();
        const question = item.querySelector('.accordion-button').innerText.toLowerCase();
        
        if (text.includes(query) || question.includes(query)) {
            item.classList.remove('d-none');
            found = true;
        } else {
            item.classList.add('d-none');
        }
    });

    // Toggle Empty State
    if (found || query === "") {
        emptyState.classList.add('d-none');
    } else {
        emptyState.classList.remove('d-none');
    }
}
document.addEventListener('DOMContentLoaded', () => {
    // Smoother Greeting
    const greetingHeader = document.querySelector('.welcome-text h4');
    if (greetingHeader) {
        greetingHeader.style.opacity = 0;
        setTimeout(() => {
            greetingHeader.style.transition = "opacity 0.8s ease";
            greetingHeader.style.opacity = 1;
        }, 200);
    }
    
    // Smooth Tip Ticker
    rotateTips();
});

function rotateTips() {
    const tipElement = document.getElementById('studentTip');
    if (!tipElement) return;

    const tips = [
        "Pro-Tip: Sync your logbook daily to avoid backlogs.",
        "Pro-Tip: Use the Anti-Loss Vault for your Chapter 3 backup.",
        "Pro-Tip: Review common defense questions in our Simulator."
    ];
    let i = 0;

    setInterval(() => {
        tipElement.style.opacity = 0;
        tipElement.style.transform = "translateY(-5px)";
        
        setTimeout(() => {
            i = (i + 1) % tips.length;
            tipElement.innerText = tips[i];
            tipElement.style.transform = "translateY(5px)";
            
            setTimeout(() => {
                tipElement.style.opacity = 1;
                tipElement.style.transform = "translateY(0)";
            }, 50);
        }, 500);
    }, 10000);
}

// --- FEATURE: TRACK MANAGER (Immutable Core Logic) ---

function openTrackManager() {
    // 1. Get Current User Data
    const user = JSON.parse(localStorage.getItem('gradmateUser'));
    if (!user) return;

    // 2. Pre-fill Checkboxes based on current access
    // We check user.tracks array OR parse the user.access string (fallback)
    const currentTracks = user.tracks || user.access.split('');

    document.getElementById('manage-check-s').checked = currentTracks.includes('S');
    document.getElementById('manage-check-p').checked = currentTracks.includes('P');
    document.getElementById('manage-check-t').checked = currentTracks.includes('T');

    // 3. Show Modal
    new bootstrap.Modal(document.getElementById('trackManagerModal')).show();
}

function saveTrackChanges() {
    const user = JSON.parse(localStorage.getItem('gradmateUser'));
    
    // 1. Capture New Selections
    const s = document.getElementById('manage-check-s').checked;
    const p = document.getElementById('manage-check-p').checked;
    const t = document.getElementById('manage-check-t').checked;

    if (!s && !p && !t) {
        alert("You must select at least one track to maintain an active account.");
        return;
    }

    // 2. Calculate New Prefix (The Mutable Part)
    let newTracks = [];
    let newPrefix = "";
    
    if (s) { newPrefix += "S"; newTracks.push("S"); }
    if (p) { newPrefix += "P"; newTracks.push("P"); }
    if (t) { newPrefix += "T"; newTracks.push("T"); }

    // 3. Construct New ID (Using Immutable Core)
    // Format: [NEW_PREFIX]-[OLD_CORE]-[OLD_INITIALS]-U
    // We split the old displayID to be safe, or rebuild from user properties
    const initials = user.displayID.split('-')[2]; // Extract initials from existing ID
    const core = user.coreID; // The Immutable Core
    
    const newDisplayID = `${newPrefix}-${core}-${initials}-U`;

    // 4. Update User Object
    user.access = newPrefix;
    user.tracks = newTracks;
    user.displayID = newDisplayID;

    // 5. Save to Database
    localStorage.setItem('gradmateUser', JSON.stringify(user));

    // 6. UI Feedback
    // Close Selection Modal
    const selectionModalEl = document.getElementById('trackManagerModal');
    const selectionModal = bootstrap.Modal.getInstance(selectionModalEl);
    selectionModal.hide();

    // Show Success Modal with New ID
    document.getElementById('new-generated-id').innerText = newDisplayID;
    new bootstrap.Modal(document.getElementById('trackSuccessModal')).show();
}
// --- Feature 1: Progress Sync (Dashboard Side) ---
document.addEventListener('DOMContentLoaded', () => {
    syncProjectProgress();
    syncTpProgress();
    syncSiwesProgress();
    renderMasterTimeline();
    
    
    updateLiveTpStatus(); 
    updateFinancialTip(); 
    
    // Optional: Refresh every minute so the "NOW" status changes automatically 
    // without the student needing to refresh the page.
    setInterval(updateLiveTpStatus, 60000); 
});

// --- Feature 1 Fix: Teaching Practice Progress Sync (Robust Version) ---
function syncTpProgress() {
    console.log("GradMate Debug: Attempting to sync TP Progress...");

    // 1. Get the Sync Data
    const rawData = localStorage.getItem('gradmate_tp_sync');
    
    // DEBUG: Check if data exists
    if (!rawData) {
        console.warn("GradMate Debug: No TP data found in LocalStorage. Please go to the TP Module and save your placement.");
        // Optional: Set default "0%" if no data found
        const tpCard = document.getElementById('prog-tp');
        if (tpCard) tpCard.querySelector('h3').innerText = "0%";
        return;
    }

    const tpData = JSON.parse(rawData);
    console.log("GradMate Debug: Data found:", tpData);

    // 2. Find the TP Progress Card elements
    const tpCard = document.getElementById('prog-tp');
    
    if (!tpCard) {
        console.error("GradMate Debug: Could not find element with ID 'prog-tp' in dashboard.html");
        return;
    }

    // 3. Update the UI
    // A. Update the Big Percentage Number
    const percentText = tpCard.querySelector('h3');
    if (percentText) {
        percentText.innerText = `${tpData.percent}%`;
    }

    // B. Update the Linear Progress Bar
    const progressBar = tpCard.querySelector('.progress-bar');
    if (progressBar) {
        progressBar.style.width = `${tpData.percent}%`;
        // Color logic
        progressBar.className = `progress-bar ${tpData.percent === 100 ? 'bg-success' : 'bg-warning'}`;
    }

    // C. Update the Circular Progress Indicator
    // We snap to the nearest 5 (e.g., 43% -> 40 or 45) to ensure CSS classes exist
    const circle = tpCard.querySelector('.progress-circle');
    if (circle) {
        // Remove old 'p' classes
        circle.className = circle.className.replace(/\bp\d+\b/g, ''); 
        
        // Add new class (Snap to integer to be safe)
        const safePercent = Math.round(tpData.percent);
        circle.classList.add(`p${safePercent}`);
        
        // Border color logic
        if (tpData.percent === 100) {
            circle.classList.remove('border-warning');
            circle.classList.add('border-success');
        }
    }
    
    console.log("GradMate Debug: TP Progress updated successfully.");
}

// --- FEATURE 4: THE MASTER TIMELINE AGGREGATOR (DASHBOARD SIDE) ---

/**
 * 1. INITIALIZE TIMELINE ON LOAD
 */
document.addEventListener('DOMContentLoaded', () => {
    renderMasterTimeline();
});

/**
 * 2. THE CORE RENDERER
 * This function gathers all dates, sorts them, and injects them into the UI
 */
function renderMasterTimeline() {
    const timelineList = document.getElementById('timelineList');
    if (!timelineList) return;

    // 1. FETCH DATA FROM ALL SOURCES
    const manualDeadlines = JSON.parse(localStorage.getItem('gradmate_deadlines')) || [];
    const defenseDeadline = JSON.parse(localStorage.getItem('gradmate_defense_deadline'));
    
    // FETCH THE NEW TP DEADLINE
    const tpDeadline = JSON.parse(localStorage.getItem('gradmate_tp_deadline'));
    
    // 2. COMBINE INTO ONE MASTER LIST
    let allEvents = [...manualDeadlines];

    // Add Project Defense if it exists
    if (defenseDeadline) {
        allEvents.push(defenseDeadline);
    }

    // ADDED: Add Teaching Practice End Date if it exists
    if (tpDeadline) {
        allEvents.push(tpDeadline);
    }

    // 3. SORT BY DATE (This organizes all modules correctly)
    allEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

    // 4. THE REST OF THE CODE (RENDER HTML)
    if (allEvents.length === 0) {
        timelineList.innerHTML = `<div class="text-center py-5">...</div>`; // Keep your existing empty state
        return;
    }

    timelineList.innerHTML = allEvents.map(event => {
        const dateObj = new Date(event.date);
        const day = dateObj.getDate();
        const month = dateObj.toLocaleString('en-US', { month: 'short' });
        
        // Dynamic styling: Purple for Project, Blue for TP/Other
        const isProject = event.category === 'project';
        const colorClass = isProject ? 'primary' : 'info';
        const icon = isProject ? 'fa-graduation-cap' : 'fa-briefcase';

        return `
            <div class="timeline-item d-flex align-items-center p-3 mb-3 bg-white rounded-4 border-start border-4 border-${colorClass} shadow-sm">
                <div class="date-badge text-center me-3 bg-light rounded-3 p-2" style="min-width: 55px;">
                    <h5 class="fw-800 mb-0">${day}</h5>
                    <small class="text-uppercase fw-bold smaller text-muted">${month}</small>
                </div>
                <div class="flex-grow-1">
                    <h6 class="fw-800 mb-0 small text-dark">${event.title}</h6>
                    <small class="text-muted smaller"><i class="fa-solid ${icon} me-1"></i> ${event.note}</small>
                </div>
                <div class="ms-auto">
                    <button class="btn btn-link text-danger p-0" onclick="deleteDeadline('${event.id}')">
                        <i class="fa-solid fa-circle-xmark"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');


    // D. GENERATE HTML
    if (allEvents.length === 0) {
        timelineList.innerHTML = `
            <div class="text-center py-5">
                <i class="fa-solid fa-calendar-xmark fa-3x mb-3 opacity-25"></i>
                <p class="text-muted small">No upcoming deadlines. You're all caught up!</p>
            </div>`;
        return;
    }

    timelineList.innerHTML = allEvents.map(event => {
        const dateObj = new Date(event.date);
        const day = dateObj.getDate();
        const month = dateObj.toLocaleString('en-US', { month: 'short' });
        
        // Dynamic styling: Purple for Project, Blue for SIWES/Manual
        const isProject = event.category === 'project';
        const colorClass = isProject ? 'primary' : 'info';
        const icon = isProject ? 'fa-graduation-cap' : 'fa-briefcase';

        return `
            <div class="timeline-item d-flex align-items-center p-3 mb-3 bg-white rounded-4 border-start border-4 border-${colorClass} shadow-sm animate__animated animate__fadeIn">
                <div class="date-badge text-center me-3 bg-light rounded-3 p-2" style="min-width: 55px;">
                    <h5 class="fw-800 mb-0">${day}</h5>
                    <small class="text-uppercase fw-bold smaller text-muted">${month}</small>
                </div>
                <div class="flex-grow-1">
                    <h6 class="fw-800 mb-0 small text-dark">${event.title}</h6>
                    <small class="text-muted smaller"><i class="fa-solid ${icon} me-1"></i> ${event.note}</small>
                </div>
                <div class="ms-auto">
                    <button class="btn btn-link text-danger p-0" onclick="deleteDeadline('${event.id}')">
                        <i class="fa-solid fa-circle-xmark"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * 3. ADD NEW DEADLINE
 * Connected to the "Set Deadline" button in your dashboard.html modal
 */
function addNewDeadline() {
    const title = document.getElementById('dlTitle').value;
    const date = document.getElementById('dlDate').value;
    const category = document.getElementById('dlCategory').value;
    const note = document.getElementById('dlNote').value;

    if (!title || !date) {
        alert("Please fill in the Task Title and Date.");
        return;
    }

    const newDL = {
        id: 'manual-' + Date.now(),
        title: title,
        date: date,
        category: category,
        note: note || "Manual Task"
    };

    // Save to the list
    let deadlines = JSON.parse(localStorage.getItem('gradmate_deadlines')) || [];
    deadlines.push(newDL);
    localStorage.setItem('gradmate_deadlines', JSON.stringify(deadlines));

    // Clear UI inputs
    document.getElementById('dlTitle').value = '';
    document.getElementById('dlDate').value = '';
    document.getElementById('dlNote').value = '';

    // Close Modal
    const modalEl = document.getElementById('addDeadlineModal');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if(modalInstance) modalInstance.hide();
    
    // Refresh the list
    renderMasterTimeline();
}

/**
 * 4. DELETE DEADLINE
 * Updated to allow manual task deletion while protecting official sync dates
 */
function deleteDeadline(id) {
    // These specific IDs are generated by modules and are "Protected"
    const protectedIDs = ['defense-final', 'tp-final', 'siwes-final'];

    if (protectedIDs.includes(id)) {
        alert("This is an official academic deadline synced from your modules. To change or remove it, please update your placement details in the specific Module page.");
        return;
    }
    
    // Standard logic for tasks you added manually
    if (confirm("Are you sure you want to delete this task from your timeline?")) {
        let deadlines = JSON.parse(localStorage.getItem('gradmate_deadlines')) || [];
        
        // Filter out the item to be deleted
        deadlines = deadlines.filter(d => d.id !== id);
        
        // Save back to storage
        localStorage.setItem('gradmate_deadlines', JSON.stringify(deadlines));
        
        // Refresh the UI immediately
        renderMasterTimeline();
    }
}



// --- FEATURE 4: FINANCIAL HEALTH SYNC ---

function updateFinancialTip() {
    const tipText = document.getElementById('studentTip');
    const balance = localStorage.getItem('gradmate_tp_balance_sync');

    // If there's no balance data yet, keep the default tip
    if (balance === null) return;

    const currentBalance = parseFloat(balance);
    const transportPerDay = 500; // Average daily T-fare
    const daysLeft = Math.floor(currentBalance / transportPerDay);

    let message = "";

    if (currentBalance <= 0) {
        message = "Wallet empty! Don't forget to log your stipend or allowance.";
    } else if (currentBalance < 1000) {
        message = `Low Funds: ₦${currentBalance} left. Save this for tomorrow's transport!`;
    } else {
        message = `Finance Insight: ₦${currentBalance} can cover about ${daysLeft} days of transport.`;
    }

    // Update the tip banner on the dashboard
    if (tipText) {
        tipText.innerText = message;
    }
}

// --- FEATURE 4: FINANCIAL HEALTH SYNC (DASHBOARD SIDE) ---

function updateFinancialTip() {
    // This targets the <p id="studentTip"> already in your HTML
    const tipText = document.getElementById('studentTip');
    const tipIcon = document.querySelector('.tip-icon i');
    const balance = localStorage.getItem('gradmate_tp_balance_sync');

    if (!tipText || balance === null) return;

    const currentBalance = parseFloat(balance);
    const transportPerDay = 500; // Estimated daily cost
    const daysLeft = Math.floor(currentBalance / transportPerDay);

    let message = "";
    let iconClass = "fa-solid fa-lightbulb"; // Default icon

    if (currentBalance <= 0) {
        message = "Wallet empty! Don't forget to log your stipend.";
        iconClass = "fa-solid fa-triangle-exclamation text-danger";
    } else if (currentBalance < 1000) {
        message = `Low Funds: ₦${currentBalance} left. Safe travels tomorrow!`;
        iconClass = "fa-solid fa-wallet text-warning";
    } else {
        message = `Finance Tip: Your ₦${currentBalance} covers about ${daysLeft} days of transport.`;
        iconClass = "fa-solid fa-coins text-success";
    }

    // Update the HTML
    tipText.innerText = message;
    if (tipIcon) tipIcon.className = iconClass;
}

// ======================================================
// PASTE AT THE VERY BOTTOM OF DASHBOARD.JS
// ======================================================

// 1. FIXED: Project Progress Sync (Prevents ReferenceError)
function syncProjectProgress() {
    // Get saved data or default to 0
    const savedPercent = localStorage.getItem('gradmate_project_percent') || 0;
    const savedStep = localStorage.getItem('gradmate_project_step') || 1;

    // A. Update the Stats Card
    const projectStats = document.querySelector('#prog-project');
    if (projectStats) {
        // Update Text
        const h3 = projectStats.querySelector('h3');
        if(h3) h3.innerText = `${savedPercent}%`;
        
        // Update Bar
        const bar = projectStats.querySelector('.progress-bar');
        if(bar) bar.style.width = `${savedPercent}%`;
        
        // Update Circle
        const circle = projectStats.querySelector('.progress-circle');
        if(circle) {
            // Remove old p-classes and add new one
            circle.className = circle.className.replace(/\bp\d+\b/g, ''); 
            circle.classList.add(`p${savedPercent}`);
        }
    }

    // B. Update the Module Entry Badge (Chapter number)
    const projectModule = document.querySelector('#mod-project');
    if (projectModule) {
        const badge = projectModule.querySelector('.badge');
        if(badge) badge.innerText = `Ch. ${savedStep}`;
    }
}

// 2. FIXED: Teaching Practice Progress Sync (Fixes Issue 1)
function syncTpProgress() {
    console.log("GradMate: Syncing TP Progress...");
    
    // Get Data
    const rawData = localStorage.getItem('gradmate_tp_sync');
    
    // If no data (User hasn't set up TP yet), we stop.
    if (!rawData) return;

    const tpData = JSON.parse(rawData);
    const tpCard = document.getElementById('prog-tp');
    
    if (tpCard) {
        // A. Update Text
        const h3 = tpCard.querySelector('h3');
        if(h3) h3.innerText = tpData.percent + "%";

        // B. Update Linear Bar
        const bar = tpCard.querySelector('.progress-bar');
        if(bar) {
            bar.style.width = tpData.percent + "%";
            
            // Turn Green if 100%
            if (tpData.percent >= 100) {
                bar.classList.remove('bg-warning');
                bar.classList.add('bg-success');
            } else {
                // Ensure it is orange (warning) otherwise
                bar.classList.add('bg-warning');
            }
        }

        // C. Update Circular Progress
        const circle = tpCard.querySelector('.progress-circle');
        if (circle) {
            // Reset to base classes
            circle.className = "progress-circle border-warning"; 
            
            // Add specific percentage class (e.g. p50)
            circle.classList.add("p" + Math.round(tpData.percent));
            
            // Turn border Green if 100%
            if (tpData.percent >= 100) {
                circle.classList.remove('border-warning');
                circle.classList.add('border-success');
            }
        }
    }
}

// ======================================================
// FIX FOR ISSUE 3: LIVE TP BADGE (CRASH PROOF)
// ======================================================

function updateLiveTpStatus() {
    console.log("GradMate: Updating TP Badge...");

    // 1. Get Elements
    const badge = document.getElementById('tp-status-badge');
    const activityText = document.getElementById('tp-live-activity');
    if (!badge || !activityText) return;

    // 2. Get Data (Safe Default to empty object {})
    const timetableData = JSON.parse(localStorage.getItem('gradmate_tp_timetable')) || {};
    const tpSync = JSON.parse(localStorage.getItem('gradmate_tp_sync'));

    // 3. Time Logic
    const now = new Date();
    // Use 'long' to match keys like "Monday", "Tuesday"
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }); 
    const currentMins = (now.getHours() * 60) + now.getMinutes();

    console.log(`GradMate: Time is ${now.getHours()}:${now.getMinutes()} (${currentDay})`);

    // 4. Default State (School Closed / After Hours)
    // If sync data exists, show Week X, otherwise Week 1
    let displayWeek = tpSync ? tpSync.week : 1;
    let statusText = `Week ${displayWeek}`;
    let badgeClass = "badge bg-warning text-dark bg-opacity-25"; 
    let activityDesc = "Lesson notes & class management.";

    // 5. Check Timetable (Only if data exists for today)
    if (timetableData && timetableData[currentDay]) {
        const todaysClasses = timetableData[currentDay];
        
        // Find active class
        const activeClass = todaysClasses.find(slot => {
            const startMins = convertToMinutes(slot.start);
            const endMins = convertToMinutes(slot.end);
            return currentMins >= startMins && currentMins < endMins;
        });

        if (activeClass) {
            // CLASS IS LIVE
            statusText = "NOW";
            badgeClass = "badge bg-danger animate__animated animate__pulse animate__infinite"; 
            activityDesc = `Teaching: <strong>${activeClass.subject}</strong>`;
        } else {
            // FREE PERIOD (School Hours: 8am - 2pm)
            // 480 mins = 8:00 AM, 840 mins = 2:00 PM
            if (currentMins >= 480 && currentMins <= 840) {
                statusText = "FREE";
                badgeClass = "badge bg-success"; 
                activityDesc = "Free period. Update logbook?";
            }
        }
    }

    // 6. Update DOM
    badge.className = badgeClass;
    badge.innerText = statusText;
    activityText.innerHTML = activityDesc;
}

// Helper: Convert "13:30" to 810 minutes
function convertToMinutes(timeStr) {
    if(!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return (h * 60) + m;
}

// 7. Force Run immediately
updateLiveTpStatus();


// ======================================================
// FIX FOR ISSUE 4: SMART FINANCIAL TIPS
// ======================================================

function updateFinancialTip() {
    // 1. Get Elements
    const tipText = document.getElementById('studentTip');
    const tipIcon = document.querySelector('.tip-icon i'); // The lightbulb icon
    
    if (!tipText) return;

    // 2. Get Data from TP Module
    const balanceStr = localStorage.getItem('gradmate_tp_balance_sync');
    
    // If user has never used the TP Wallet, do nothing (keep default generic tip)
    if (balanceStr === null) return;

    const balance = parseFloat(balanceStr);
    const transportCost = 500; // Estimated daily transport cost in Naira

    // 3. Determine the Smart Message
    let msg = "";
    let iconClass = "fa-solid fa-lightbulb"; // Default

    if (balance <= 0) {
        msg = "Wallet Empty: Don't forget to log your allowance in the TP Module!";
        iconClass = "fa-solid fa-triangle-exclamation text-danger";
    } else if (balance < 1000) {
        msg = `Low Funds: ₦${balance.toLocaleString()} left. Save this for tomorrow's transport!`;
        iconClass = "fa-solid fa-coins text-warning";
    } else {
        const days = Math.floor(balance / transportCost);
        msg = `Finance Insight: ₦${balance.toLocaleString()} covers approx. ${days} days of transport.`;
        iconClass = "fa-solid fa-wallet text-success";
    }

    // 4. Update the UI
    tipText.innerText = msg;
    
    // Update the icon to match the context
    if (tipIcon) tipIcon.className = iconClass;
}

// --- SIWES PROGRESS SYNC ---
function syncSiwesProgress() {
    // 1. Get Data from LocalStorage
    const savedPercent = localStorage.getItem('gradmate_siwes_percent');
    
    // If no data, stop
    if (!savedPercent) return; 

    // 2. Find and Update Card
    const siwesCard = document.getElementById('prog-siwes');
    if (siwesCard) {
        // Text
        const h3 = siwesCard.querySelector('h3');
        if(h3) h3.innerText = savedPercent + "%";
        
        // Bar
        const bar = siwesCard.querySelector('.progress-bar');
        if(bar) bar.style.width = savedPercent + "%";
        
        // Circle
        const circle = siwesCard.querySelector('.progress-circle');
        if(circle) {
            circle.className = "progress-circle p" + savedPercent;
        }
    }
}