document.addEventListener('DOMContentLoaded', () => {
    // 1. Init System UI
    AOS.init({ duration: 800, once: true });
    
    // 2. Load All Data
    loadTpData();            // Profile info
    loadWidgetData();        // All widget data
    
    // 3. Init Specific Features
    initTimetable();         
    initDiary();             
    initAcademicRegistry();  // The new maximized feature
    renderRecentNotes();     
});

// --- Feature 1: Placement Setup Logic ---

const tpForm = document.getElementById('setupTpForm');

// --- Feature 2 Fix: Save TP Deadline for Dashboard ---
if (tpForm) {
    tpForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // 1. Capture Form Data
        const placementData = {
            school: document.getElementById('schoolIn').value,
            subject: document.getElementById('subjectIn').value,
            classLevel: document.getElementById('classIn').value,
            units: document.getElementById('unitsIn').value, 
            mentor: document.getElementById('mentorIn').value,
            startDate: document.getElementById('startIn').value,
            endDate: document.getElementById('endIn').value
        };

        // 2. Save Main Profile
        localStorage.setItem('gradmate_tp_profile', JSON.stringify(placementData));

        // 3. Calculate Progress for Dashboard (Sync Object)
        const start = new Date(placementData.startDate);
        const end = new Date(placementData.endDate);
        const today = new Date();
        
        const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        const daysPassed = Math.ceil((today - start) / (1000 * 60 * 60 * 24));
        
        let progressPercent = 0;
        if (totalDays > 0) {
            progressPercent = Math.round((daysPassed / totalDays) * 100);
        }
        if (progressPercent < 0) progressPercent = 0;
        if (progressPercent > 100) progressPercent = 100;

        const currentWeek = Math.floor(daysPassed / 7) + 1;

        const tpSync = {
            school: placementData.school,
            mentor: placementData.mentor,
            percent: progressPercent,
            week: currentWeek > 0 ? currentWeek : 1
        };
        localStorage.setItem('gradmate_tp_sync', JSON.stringify(tpSync));

        // ---------------------------------------------------------
        // NEW CODE: Create and Save the Deadline Object for Dashboard
        // ---------------------------------------------------------
        const deadlineObj = {
            id: 'tp-final', // Fixed ID so it updates instead of duplicating
            title: 'End of Teaching Practice',
            date: placementData.endDate, 
            category: 'tp', 
            note: 'Final Report & Clearance Due'
        };
        localStorage.setItem('gradmate_tp_deadline', JSON.stringify(deadlineObj));
        // ---------------------------------------------------------

        // 4. Update UI & Close
        updateTpUI(placementData);
        
        const modalEl = document.getElementById('setupTpModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();
        
        // Alert user (Optional)
        alert("Placement Profile Updated & Synced to Dashboard!");
    });
}

// Function to Load Data from Storage
function loadTpData() {
    const savedData = localStorage.getItem('gradmate_tp_profile');
    if (savedData) {
        const data = JSON.parse(savedData);
        updateTpUI(data);
        
        // Pre-fill Modal inputs for easier editing
        document.getElementById('schoolIn').value = data.school;
        document.getElementById('subjectIn').value = data.subject;
        document.getElementById('classIn').value = data.classLevel;
        document.getElementById('unitsIn').value = data.units || "3"; // <--- NEW PRE-FILL
        document.getElementById('mentorIn').value = data.mentor;
        document.getElementById('startIn').value = data.startDate;
        document.getElementById('endIn').value = data.endDate;
    }
}

// Function to Update Dashboard Elements
function updateTpUI(data) {
    // Text Elements
    document.getElementById('displaySchool').innerText = data.school;
    document.getElementById('displaySubject').innerText = data.subject;
    document.getElementById('displayClass').innerText = data.classLevel;
    document.getElementById('displayMentor').innerText = data.mentor;
    
    // Mobile Element check
    const mobileMentor = document.getElementById('displayMentorMobile');
    if(mobileMentor) mobileMentor.innerText = data.mentor;

    // Date Formatting
    const startObj = new Date(data.startDate);
    const endObj = new Date(data.endDate);

    document.getElementById('displayStart').innerText = startObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric'});
    document.getElementById('displayEnd').innerText = endObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric'});

    // Countdown Logic
    const today = new Date();
    // Calculate difference in milliseconds
    const timeDiff = endObj - today;
    // Convert to days (ceil to roundup partial days)
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    // Handle Logic: If finished, or not started
    let daysDisplay = daysDiff;
    if (daysDiff < 0) daysDisplay = 0;

    document.getElementById('daysRemaining').innerText = daysDisplay;
}

// --- STATE MANAGEMENT ---

// Load All Data on Init
function loadWidgetData() {
    const saved = localStorage.getItem('gradmate_tp_widgets');
    if (saved) {
        tpData = JSON.parse(saved);
    } else {
        // Dummy Initial Data for Demo
        tpData.syllabus = [
            {id: 1, topic: 'Intro to Geometry', done: true},
            {id: 2, topic: 'Pythagoras Theorem', done: false},
            {id: 3, topic: 'Angles in a Triangle', done: false}
        ];
        tpData.attendance = [
            {id: 1, name: 'AB', present: false}, // Initials
            {id: 2, name: 'CD', present: false},
            {id: 3, name: 'EF', present: false}
        ];
    }
    
   
}

// Call this in your DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    loadWidgetData();
});

function saveData() {
    localStorage.setItem('gradmate_tp_widgets', JSON.stringify(tpData));
}

// --- FEATURE 1: ADVANCED SYLLABUS LOGIC ---

// 1. Render Function
function renderSyllabus() {
    // Sort items by Week Number
    const sortedList = tpData.syllabus.sort((a, b) => a.week - b.week);
    
    const container = document.getElementById('syllabusContainer');
    container.innerHTML = '';

    if (sortedList.length === 0) {
        // Empty State
        container.innerHTML = `
             <div class="text-center py-5">
                <i class="fa-solid fa-clipboard-list text-light fa-3x mb-3"></i>
                <p class="small text-muted mb-2">Scheme of Work is empty.</p>
                <button class="btn btn-sm btn-orange-outline" onclick="generateSchemeTemplate()">Generate Wk 1-12 Template</button>
            </div>
        `;
        updateSyllabusStats(0, 0);
        return;
    }

    let completedCount = 0;
    const totalCount = sortedList.length;

    sortedList.forEach(item => {
        if(item.status === 'completed') completedCount++;
        
        // CSS Classes based on status
        let rowClass = '';
        if (item.status === 'completed') rowClass = 'completed';
        else if (item.status === 'skipped') rowClass = 'skipped';

        container.innerHTML += `
            <div class="syllabus-item ${rowClass}">
                <!-- Checkbox -->
                <div class="syllabus-checkbox-custom" onclick="toggleSyllabusStatus(${item.id})">
                    ${item.status === 'completed' ? '<i class="fa-solid fa-check fa-xs"></i>' : ''}
                    ${item.status === 'skipped' ? '<i class="fa-solid fa-minus fa-xs text-secondary"></i>' : ''}
                </div>
                
                <!-- Content -->
                <div class="flex-grow-1" onclick="editSyllabusTopic(${item.id})">
                    <span class="wk-badge">WK ${item.week}</span>
                    <div class="topic-text fw-bold text-dark small lh-sm">${item.topic}</div>
                    ${item.sub ? `<div class="text-muted smaller mt-1 text-truncate" style="max-width: 200px;">${item.sub}</div>` : ''}
                </div>

                <!-- Edit Icon -->
                <div class="syl-edit-icon" onclick="editSyllabusTopic(${item.id})">
                    <i class="fa-solid fa-pen"></i>
                </div>
            </div>
        `;
    });

    updateSyllabusStats(completedCount, totalCount);
}

// 2. Stats Update
function updateSyllabusStats(done, total) {
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);
    
    document.getElementById('syllabusPercent').innerText = `${percent}%`;
    document.getElementById('syllabusProgress').style.width = `${percent}%`;
    document.getElementById('topicsCovered').innerText = done;
    document.getElementById('topicsTotal').innerText = total;
}

// 3. Toggle Status (Cycle: Pending -> Completed -> Skipped -> Pending)
function toggleSyllabusStatus(id) {
    const item = tpData.syllabus.find(i => i.id === id);
    if(item) {
        // Simple Toggle for click: Pending <-> Completed
        // Note: 'Skipped' is usually set via edit modal, but we can cycle if preferred.
        // Let's stick to Pending <-> Completed for quick check
        item.status = (item.status === 'completed') ? 'pending' : 'completed';
        saveData();
        renderSyllabus();
    }
}

// 4. Modal Operations
let editingSylId = null;

function openSyllabusModal() {
    editingSylId = null;
    document.getElementById('sylForm').reset();
    document.getElementById('sylModalTitle').innerText = "Add Topic";
    document.getElementById('sylDeleteBtn').classList.add('d-none');
    
    // Auto-suggest next week number
    const nextWeek = tpData.syllabus.length + 1;
    document.getElementById('sylWeek').value = nextWeek;

    new bootstrap.Modal(document.getElementById('syllabusModal')).show();
}

function editSyllabusTopic(id) {
    const item = tpData.syllabus.find(i => i.id === id);
    if(!item) return;

    editingSylId = id;
    document.getElementById('sylModalTitle').innerText = "Edit Topic";
    document.getElementById('sylDeleteBtn').classList.remove('d-none');

    document.getElementById('sylWeek').value = item.week;
    document.getElementById('sylTopic').value = item.topic;
    document.getElementById('sylSub').value = item.sub || '';
    document.getElementById('sylStatus').value = item.status;

    new bootstrap.Modal(document.getElementById('syllabusModal')).show();
}

function saveSyllabusTopic() {
    const week = parseInt(document.getElementById('sylWeek').value);
    const topic = document.getElementById('sylTopic').value;
    const sub = document.getElementById('sylSub').value;
    const status = document.getElementById('sylStatus').value;

    if(!topic) return alert("Topic is required");

    if(editingSylId) {
        // Update Existing
        const item = tpData.syllabus.find(i => i.id === editingSylId);
        item.week = week;
        item.topic = topic;
        item.sub = sub;
        item.status = status;
    } else {
        // Add New
        tpData.syllabus.push({
            id: Date.now(),
            week, topic, sub, status
        });
    }

    saveData();
    renderSyllabus();
    bootstrap.Modal.getInstance(document.getElementById('syllabusModal')).hide();
}

function deleteSyllabusTopic() {
    if(confirm("Delete this topic?")) {
        const index = tpData.syllabus.findIndex(i => i.id === editingSylId);
        if(index > -1) {
            tpData.syllabus.splice(index, 1);
            saveData();
            renderSyllabus();
            bootstrap.Modal.getInstance(document.getElementById('syllabusModal')).hide();
        }
    }
}

// 5. Template Generator (The "Magic" Button)
function generateSchemeTemplate() {
    if(tpData.syllabus.length > 0) {
        if(!confirm("This will add Weeks 1-12 to your list. Continue?")) return;
    }

    for(let i = 1; i <= 12; i++) {
        // Don't duplicate if week exists
        if(!tpData.syllabus.find(item => item.week === i)) {
            let topicName = "Topic for Week " + i;
            if(i === 7) topicName = "Mid-Term Break / Test"; // Common Nigerian standard
            if(i === 12) topicName = "Revision & Examination";

            tpData.syllabus.push({
                id: Date.now() + i, // unique enough
                week: i,
                topic: topicName,
                sub: "",
                status: (i === 7) ? 'skipped' : 'pending' // Mark midterm as skipped by default
            });
        }
    }
    saveData();
    renderSyllabus();
}

function clearSyllabus() {
    if(confirm("Are you sure you want to delete the entire scheme of work?")) {
        tpData.syllabus = [];
        saveData();
        renderSyllabus();
    }
}

// --- FEATURE 5: PRO ATTENDANCE LOGIC ---

// Data Structure Update (Ensure this is part of your main tpData object)
// tpData.classes = [ {id, name, students: []} ]
// tpData.attendanceRecords = { "classId_YYYY-MM-DD": { studentId: "status" } }

let currentClassId = null;
let currentViewMode = 'grid'; // 'grid' or 'list'

function initAttendance() {
    // Initialize Data Structures if empty
    if (!tpData.classes) tpData.classes = [];
    if (!tpData.attendanceRecords) tpData.attendanceRecords = {};
    
    // Set Date to Today
    document.getElementById('attDate').valueAsDate = new Date();
    
    renderClassDropdown();
    
    // Auto-select first class if exists
    if(tpData.classes.length > 0) {
        selectClass(tpData.classes[0].id);
    }
}

// Call on load
document.addEventListener('DOMContentLoaded', () => {
   // ... other inits ...
   initAttendance();
});

function renderClassDropdown() {
    const list = document.getElementById('classDropdown');
    // Keep the "Manage Classes" button at bottom
    const manageBtnHtml = `<li><hr class="dropdown-divider"></li>
    <li><a class="dropdown-item small text-orange fw-bold" href="#" onclick="openClassManager()"><i class="fa-solid fa-plus me-2"></i>Manage Classes</a></li>`;
    
    let html = '';
    tpData.classes.forEach(cls => {
        html += `<li><a class="dropdown-item fw-bold" href="#" onclick="selectClass('${cls.id}')">${cls.name}</a></li>`;
    });
    
    list.innerHTML = html + manageBtnHtml;
}

function selectClass(id) {
    currentClassId = id;
    const cls = tpData.classes.find(c => c.id === id);
    if(cls) {
        document.getElementById('activeClassBtn').innerText = cls.name;
        document.getElementById('attClassLabel').innerText = cls.name; // Update Label in widget
        loadAttendanceData();
    }
}

function loadAttendanceData() {
    if(!currentClassId) return;

    const date = document.getElementById('attDate').value;
    const key = `${currentClassId}_${date}`;
    const records = tpData.attendanceRecords[key] || {};
    
    const cls = tpData.classes.find(c => c.id === currentClassId);
    const container = document.getElementById('attendanceContainer');
    container.innerHTML = '';

    // Calculate Stats
    let present = 0, late = 0, absent = 0, total = cls.students.length;

    // Create Wrapper based on View Mode
    const wrapper = document.createElement('div');
    wrapper.className = currentViewMode === 'grid' ? 'att-grid-view' : 'att-list-view';

    cls.students.forEach(student => {
        const status = records[student.id] || 'none'; // none, present, late, absent
        
        if(status === 'present') present++;
        else if(status === 'late') late++;
        else if(status === 'absent') absent++;

        if(currentViewMode === 'grid') {
            // Bubble UI
            wrapper.innerHTML += `
                <div class="att-bubble status-${status}" onclick="cycleStatus(${student.id})">
                    ${getInitials(student.name)}
                </div>
            `;
        } else {
            // List UI
            wrapper.innerHTML += `
                <div class="att-list-item status-${status}" onclick="cycleStatus(${student.id})">
                    <div class="att-status-indicator"></div>
                    <span class="small fw-bold text-dark">${student.name}</span>
                </div>
            `;
        }
    });

    container.appendChild(wrapper);

    // Update Stats UI
    document.getElementById('statPresent').innerText = present;
    document.getElementById('statLate').innerText = late;
    document.getElementById('statAbsent').innerText = absent;
    
    const percent = total === 0 ? 0 : Math.round(((present + late) / total) * 100); // Late counts as present-ish for percentage
    document.getElementById('attPercentage').innerText = `${percent}%`;
}

// Cycle: None -> Present -> Late -> Absent -> None
function cycleStatus(studentId) {
    const date = document.getElementById('attDate').value;
    const key = `${currentClassId}_${date}`;
    
    if(!tpData.attendanceRecords[key]) tpData.attendanceRecords[key] = {};
    
    const current = tpData.attendanceRecords[key][studentId] || 'none';
    let next = 'present';
    
    if(current === 'present') next = 'late';
    else if(current === 'late') next = 'absent';
    else if(current === 'absent') next = 'none';
    
    tpData.attendanceRecords[key][studentId] = next;
    
    saveData();
    loadAttendanceData(); // Re-render to show change
}

// Bulk Action
function markAll(status) {
    if(!currentClassId) return alert("Please select a class first.");
    const date = document.getElementById('attDate').value;
    const key = `${currentClassId}_${date}`;
    
    if(!tpData.attendanceRecords[key]) tpData.attendanceRecords[key] = {};
    
    const cls = tpData.classes.find(c => c.id === currentClassId);
    cls.students.forEach(s => {
        tpData.attendanceRecords[key][s.id] = status;
    });
    
    saveData();
    loadAttendanceData();
}

// View Toggle
function toggleViewMode() {
    currentViewMode = currentViewMode === 'grid' ? 'list' : 'grid';
    const icon = document.getElementById('viewIcon');
    icon.className = currentViewMode === 'grid' ? 'fa-solid fa-list' : 'fa-solid fa-border-all';
    loadAttendanceData();
}

// --- CLASS MANAGER MODAL LOGIC ---

function openClassManager() {
    document.getElementById('managerClassName').innerText = currentClassId 
        ? tpData.classes.find(c => c.id === currentClassId).name 
        : "No Class Selected";
    new bootstrap.Modal(document.getElementById('classManagerModal')).show();
}

function createNewClass() {
    const name = document.getElementById('newClassName').value;
    if(!name) return;
    
    const newClass = {
        id: 'cls_' + Date.now(),
        name: name,
        students: []
    };
    
    tpData.classes.push(newClass);
    saveData();
    
    // Reset and select
    document.getElementById('newClassName').value = '';
    renderClassDropdown();
    selectClass(newClass.id);
    bootstrap.Modal.getInstance(document.getElementById('classManagerModal')).hide();
}

function addStudentToClass() {
    if(!currentClassId) return alert("Select or Create a class first!");
    const name = document.getElementById('addStudentInput').value;
    if(!name) return;
    
    const cls = tpData.classes.find(c => c.id === currentClassId);
    cls.students.push({
        id: Date.now(),
        name: name
    });
    
    saveData();
    document.getElementById('addStudentInput').value = '';
    loadAttendanceData();
}

// Helper
function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

// Export CSV
function exportAttendance() {
    if(!currentClassId) return;
    const cls = tpData.classes.find(c => c.id === currentClassId);
    const date = document.getElementById('attDate').value;
    const key = `${currentClassId}_${date}`;
    const records = tpData.attendanceRecords[key] || {};
    
    let csvContent = "data:text/csv;charset=utf-8,Student Name,Status,Date\n";
    
    cls.students.forEach(s => {
        const status = (records[s.id] || 'Unmarked').toUpperCase();
        csvContent += `${s.name},${status},${date}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${cls.name}_Attendance_${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


// --- FEATURE 10: FINTECH WALLET LOGIC ---

// 1. Configuration: Categories & Icons
const walletCategories = {
    expense: [
        { id: 'transport', name: 'Transport', icon: 'fa-bus', colorClass: 'bg-icon-transport' },
        { id: 'food', name: 'Food', icon: 'fa-burger', colorClass: 'bg-icon-food' },
        { id: 'data', name: 'Airtime/Data', icon: 'fa-wifi', colorClass: 'bg-icon-data' },
        { id: 'edu', name: 'Materials', icon: 'fa-book', colorClass: 'bg-icon-edu' },
        { id: 'clothing', name: 'Clothing', icon: 'fa-shirt', colorClass: 'bg-icon-clothing' },
        { id: 'gift', name: 'Gift/Other', icon: 'fa-gift', colorClass: 'bg-icon-gift' }
    ],
    income: [
        { id: 'stipend', name: 'School Pay', icon: 'fa-school', colorClass: 'bg-icon-income' },
        { id: 'allowance', name: 'Allowance', icon: 'fa-hand-holding-dollar', colorClass: 'bg-icon-income' },
        { id: 'salary', name: 'Salary', icon: 'fa-briefcase', colorClass: 'bg-icon-income' },
        { id: 'gift_in', name: 'Gift', icon: 'fa-gift', colorClass: 'bg-icon-income' }
    ]
};

// 2. Render Main Finance Widget
function renderFinance() {
    // tpData is global from your existing code
    const financeData = tpData.finance || { balance: 0, history: [] }; 
    
    // Update Balance
    const balanceEl = document.getElementById('walletBalance');
    if (!balanceEl.dataset.hidden) {
        balanceEl.innerText = financeData.balance.toLocaleString('en-NG', { minimumFractionDigits: 2 });
    }

    // Render History List
    const listContainer = document.getElementById('transactionList');
    listContainer.innerHTML = '';

    if (!financeData.history || financeData.history.length === 0) {
        listContainer.innerHTML = `
            <div class="text-center py-5 opacity-50">
                <i class="fa-solid fa-receipt fa-2x mb-2"></i>
                <p class="small fw-bold">No transactions yet</p>
            </div>`;
        return;
    }

    // Sort by date (newest first)
    const sortedHistory = [...financeData.history].reverse();

    sortedHistory.forEach(tx => {
        const isExpense = tx.type === 'expense';
        const colorClass = tx.colorClass || (isExpense ? 'bg-icon-transport' : 'bg-icon-income');
        
        listContainer.innerHTML += `
            <div class="trans-item">
                <div class="trans-icon-box ${colorClass}">
                    <i class="fa-solid ${tx.icon}"></i>
                </div>
                <div class="flex-grow-1">
                    <h6 class="fw-bold text-dark mb-0" style="font-size: 0.85rem;">${tx.category}</h6>
                    <small class="text-muted" style="font-size: 0.7rem;">
                        ${new Date(tx.date).toLocaleDateString('en-GB', {day: 'numeric', month:'short'})} 
                        ${tx.note ? '• ' + tx.note : ''}
                    </small>
                </div>
                <div class="text-end">
                    <span class="fw-bold ${isExpense ? 'text-amt-exp' : 'text-amt-inc'}" style="font-size: 0.9rem;">
                        ${isExpense ? '-' : '+'}₦${tx.amount.toLocaleString()}
                    </span>
                </div>
            </div>
        `;
    });
}

// 3. Open Modal
function openTransactionModal(type) {
    document.getElementById('transForm').reset();
    document.getElementById('transactionType').value = type;
    
    // Set Title
    document.getElementById('transModalTitle').innerText = type === 'expense' ? 'Log Expense' : 'Add Income';
    
    // Generate Category Grid
    const grid = document.getElementById('categoryGrid');
    grid.innerHTML = '';
    
    const cats = walletCategories[type];
    cats.forEach(cat => {
        grid.innerHTML += `
            <div class="cat-item" onclick="selectCategory(this, '${cat.name}', '${cat.icon}', '${cat.colorClass}')">
                <i class="fa-solid ${cat.icon}"></i>
                <span>${cat.name}</span>
            </div>
        `;
    });

    // Auto-select first category
    selectCategory(grid.firstElementChild, cats[0].name, cats[0].icon, cats[0].colorClass);

    new bootstrap.Modal(document.getElementById('transactionModal')).show();
}

// 4. Handle Category Selection UI
function selectCategory(element, name, icon, colorClass) {
    // Remove active class from all
    document.querySelectorAll('.cat-item').forEach(el => el.classList.remove('selected'));
    // Add to clicked
    element.classList.add('selected');
    
    // Set Hidden Inputs
    document.getElementById('selectedCategoryName').value = name;
    document.getElementById('selectedCategoryIcon').value = icon;
    // We store the color class in dataset or handle logic
    element.dataset.color = colorClass; 
}

// 5. Save Transaction
function saveTransaction() {
    const amount = parseFloat(document.getElementById('transAmount').value);
    const type = document.getElementById('transactionType').value;
    const category = document.getElementById('selectedCategoryName').value;
    const icon = document.getElementById('selectedCategoryIcon').value;
    const note = document.getElementById('transNote').value;
    
    // Find color class based on selection
    const selectedEl = document.querySelector('.cat-item.selected');
    const colorClass = selectedEl ? selectedEl.dataset.color : 'bg-light';

    if (!amount || amount <= 0) return alert("Please enter a valid amount");

    // Init data structure if missing
    if (!tpData.finance) tpData.finance = { balance: 0, history: [] };
    if (!tpData.finance.history) tpData.finance.history = [];

    // Update Balance
    if (type === 'expense') tpData.finance.balance -= amount;
    else tpData.finance.balance += amount;

    // Add to History
    const newTx = {
        id: Date.now(),
        type,
        amount,
        category,
        icon,
        colorClass,
        note,
        date: new Date().toISOString()
    };

    tpData.finance.history.push(newTx);

    saveData(); // Save to localStorage
    renderFinance(); // Update UI
    localStorage.setItem('gradmate_tp_balance_sync', tpData.finance.balance);
    
    bootstrap.Modal.getInstance(document.getElementById('transactionModal')).hide();
}

// 6. Toggle Balance Privacy
function toggleWalletView() {
    const balanceEl = document.getElementById('walletBalance');
    const eyeIcon = document.getElementById('walletEye');
    
    if (balanceEl.innerText.includes('***')) {
        renderFinance(); // Restore number
        balanceEl.dataset.hidden = ""; // remove flag
        eyeIcon.classList.replace('fa-eye-slash', 'fa-eye');
    } else {
        balanceEl.innerText = "****";
        balanceEl.dataset.hidden = "true"; // set flag
        eyeIcon.classList.replace('fa-eye', 'fa-eye-slash');
    }
}

// 7. Clear History (Optional Debugging)
function clearFinanceHistory() {
    if(confirm("Reset wallet history? Balance will set to 0.")) {
        tpData.finance = { balance: 0, history: [] };
        saveData();
        renderFinance();
    }
}


function toggleWalletView() {
    const bal = document.getElementById('walletBalance');
    if(bal.innerText.includes('*')) renderFinance();
    else bal.innerText = "****";
}


// --- FEATURE 8: PRO LOGBOOK LOGIC ---

let editingDiaryId = null;

// Initialize Diary (Call this in your DOMContentLoaded)
function initDiary() {
    calculateCurrentWeek();
    renderDiary();
}

// 1. Auto-Calculate Week Number from Profile Data
function calculateCurrentWeek() {
    const profileData = JSON.parse(localStorage.getItem('gradmate_tp_profile'));
    if(profileData && profileData.startDate) {
        const start = new Date(profileData.startDate);
        const now = new Date();
        
        // Difference in weeks
        const diffInMs = now - start;
        const diffInWeeks = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 7)) + 1;
        
        const displayWeek = diffInWeeks > 0 ? diffInWeeks : 1;
        document.getElementById('autoWeekNum').innerText = displayWeek;
        
        // Set default value in modal
        document.getElementById('logWeek').value = displayWeek;
    }
}

// 2. Render Timeline
function renderDiary() {
    const container = document.getElementById('diaryHistory');
    container.innerHTML = '';
    
    // Sort by Week Number (Descending - newest top)
    const logs = (tpData.diary || []).sort((a, b) => b.week - a.week);

    if (logs.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4 text-muted opacity-50">
                <i class="fa-solid fa-book-open fa-2x mb-2"></i>
                <p class="small fw-bold">No logs yet.</p>
            </div>
        `;
        return;
    }

    logs.forEach(log => {
        container.innerHTML += `
            <div class="diary-card" onclick="editDiaryEntry(${log.id})">
                <div class="diary-dot mood-${log.mood}"></div>
                <span class="diary-week-badge">Week ${log.week} • ${log.date}</span>
                <div class="diary-title">${log.topic}</div>
                <div class="method-tag">${log.method}</div>
                <div class="diary-desc">${log.desc}</div>
            </div>
        `;
    });
}

// 3. Modal Actions
function openDiaryModal() {
    editingDiaryId = null;
    document.getElementById('diaryForm').reset();
    document.getElementById('diaryModalTitle').innerText = "New Log Entry";
    document.getElementById('diaryDeleteBtn').classList.add('d-none');
    
    // Refresh week calculation just in case
    calculateCurrentWeek();
    
    new bootstrap.Modal(document.getElementById('diaryModal')).show();
}

function editDiaryEntry(id) {
    const log = tpData.diary.find(l => l.id === id);
    if (!log) return;

    editingDiaryId = id;
    document.getElementById('diaryModalTitle').innerText = "Edit Week " + log.week;
    document.getElementById('diaryDeleteBtn').classList.remove('d-none');

    // Populate Fields
    document.getElementById('logWeek').value = log.week;
    document.getElementById('logMood').value = log.mood;
    document.getElementById('logTopic').value = log.topic;
    document.getElementById('logMethod').value = log.method;
    document.getElementById('logDesc').value = log.desc;

    new bootstrap.Modal(document.getElementById('diaryModal')).show();
}

function saveDiaryEntry() {
    const week = parseInt(document.getElementById('logWeek').value);
    const mood = document.getElementById('logMood').value;
    const topic = document.getElementById('logTopic').value;
    const method = document.getElementById('logMethod').value;
    const desc = document.getElementById('logDesc').value;

    if (!topic || !desc) return alert("Please fill in Topic and Summary.");

    if (!tpData.diary) tpData.diary = [];

    if (editingDiaryId) {
        // Edit Existing
        const index = tpData.diary.findIndex(l => l.id === editingDiaryId);
        if(index > -1) {
            tpData.diary[index] = {
                ...tpData.diary[index],
                week, mood, topic, method, desc
            };
        }
    } else {
        // Create New
        const newLog = {
            id: Date.now(),
            date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
            week, mood, topic, method, desc
        };
        tpData.diary.unshift(newLog); // Add to top
    }

    saveData();
    renderDiary();
    bootstrap.Modal.getInstance(document.getElementById('diaryModal')).hide();
}

function deleteDiaryEntry() {
    if(confirm("Delete this log entry?")) {
        const index = tpData.diary.findIndex(l => l.id === editingDiaryId);
        if(index > -1) {
            tpData.diary.splice(index, 1);
            saveData();
            renderDiary();
            bootstrap.Modal.getInstance(document.getElementById('diaryModal')).hide();
        }
    }
}

// 4. Export Functionality
function exportLogbook() {
    if (!tpData.diary || tpData.diary.length === 0) {
        alert("No logs to export.");
        return;
    }

    // Sort by week for reading
    const sortedLogs = [...tpData.diary].sort((a, b) => a.week - b.week);
    
    let content = "GRADMATE TEACHING PRACTICE LOGBOOK\n";
    content += `Generated: ${new Date().toLocaleString()}\n`;
    content += "========================================\n\n";

    sortedLogs.forEach(log => {
        content += `WEEK ${log.week} (${log.date})\n`;
        content += `------------------------\n`;
        content += `TOPIC:       ${log.topic}\n`;
        content += `METHOD:      ${log.method}\n`;
        content += `SUMMARY:     ${log.desc}\n`;
        content += `STATUS:      ${log.mood.toUpperCase()}\n`;
        content += `\n`;
    });

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `TP_Logbook_Export.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Ensure initDiary is called in your existing DOMContentLoaded listener
// document.addEventListener('DOMContentLoaded', () => { ... initDiary(); ... });

// --- FEATURE 6: ADVANCED TIMETABLE LOGIC ---

// 1. Data Structure & State
let timetableData = JSON.parse(localStorage.getItem('gradmate_tp_timetable')) || {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: []
};
let selectedDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
// Ensure we default to Mon-Fri, if today is Sat/Sun, show Monday
if (!['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(selectedDay)) {
    selectedDay = 'Monday';
}

// 2. Initialize Timetable
function initTimetable() {
    renderDayTabs();
    loadDaySchedule(selectedDay);
    startRealTimeClock();
}

// Add this to your DOMContentLoaded listener
document.addEventListener('DOMContentLoaded', () => {
    // ... existing init calls ...
    initTimetable(); 
});

// 3. Render Day Tabs
function renderDayTabs() {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const container = document.getElementById('dayTabs');
    container.innerHTML = days.map(day => `
        <button class="nav-link ${day === selectedDay ? 'active' : ''}" 
            onclick="switchDay('${day}')">${day.substring(0,3)}</button>
    `).join('');
}

// 4. Switch Day View
function switchDay(day) {
    selectedDay = day;
    renderDayTabs(); // Refresh active state
    loadDaySchedule(day);
}

// 5. Load & Render Cards
function loadDaySchedule(day) {
    const container = document.getElementById('timetableContainer');
    const schedule = timetableData[day] || [];
    
    // Sort by start time
    schedule.sort((a, b) => a.start.localeCompare(b.start));

    container.innerHTML = '';

    if (schedule.length === 0) {
        container.innerHTML = `
            <div class="text-center w-100 py-4 text-muted border border-dashed rounded-3">
                <i class="fa-solid fa-mug-hot fa-2x mb-2 opacity-25"></i>
                <p class="small fw-bold mb-1">No classes on ${day}</p>
                <button class="btn btn-sm btn-link text-orange text-decoration-none" onclick="openTimetableModal()">+ Add Class</button>
            </div>`;
    } else {
        schedule.forEach(slot => {
            const isActive = checkIsActive(day, slot.start, slot.end);
            container.innerHTML += `
                <div class="tt-card ${isActive ? 'status-active' : ''}" onclick="editSlot('${slot.id}')">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h6 class="fw-800 mb-0 text-dark">${slot.subject}</h6>
                        ${isActive ? '<i class="fa-solid fa-record-vinyl text-danger fa-fade"></i>' : ''}
                    </div>
                    <p class="fw-bold text-secondary mb-0" style="font-size:0.9rem">
                        <i class="fa-regular fa-clock me-1"></i> ${formatTime(slot.start)} - ${formatTime(slot.end)}
                    </p>
                    <p class="text-muted small mt-1 mb-0">
                        <i class="fa-solid fa-users-rectangle me-1"></i> ${slot.class}
                    </p>
                </div>
            `;
        });
    }

    updateStatusBanner(day, schedule);
}

// 6. Real-Time Logic (The Brain)
function checkIsActive(day, start, end) {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    if (day !== today) return false;

    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    
    const startMins = convertToMins(start);
    const endMins = convertToMins(end);

    return currentMins >= startMins && currentMins < endMins;
}

function updateStatusBanner(day, schedule) {
    const banner = document.getElementById('statusBanner');
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

    // Only show live status if viewing Today
    if (day !== today) {
        banner.className = 'mt-3 rounded-3 p-3 d-flex align-items-center bg-light text-muted border';
        banner.innerHTML = `<i class="fa-solid fa-calendar me-3"></i><span>Viewing schedule for ${day}.</span>`;
        return;
    }

    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    
    // Find active or next class
    const activeSlot = schedule.find(s => checkIsActive(day, s.start, s.end));
    const nextSlot = schedule.find(s => convertToMins(s.start) > currentMins);

    if (activeSlot) {
        // BUSY
        const endMins = convertToMins(activeSlot.end);
        const diff = endMins - currentMins;
        banner.className = 'mt-3 rounded-3 p-3 d-flex align-items-center banner-busy';
        banner.innerHTML = `
            <i class="fa-solid fa-chalkboard-user fa-2x me-3"></i>
            <div>
                <h6 class="fw-bold mb-0">Class in Session: ${activeSlot.subject}</h6>
                <small>Ends in <strong>${diff} mins</strong>. Keep it up!</small>
            </div>`;
    } else if (nextSlot) {
        // FREE
        const startMins = convertToMins(nextSlot.start);
        const diff = startMins - currentMins;
        
        let timeMsg = diff > 60 
            ? `starts in ${Math.floor(diff/60)}hr ${diff%60}min` 
            : `starts in ${diff} minutes`;

        banner.className = 'mt-3 rounded-3 p-3 d-flex align-items-center banner-free';
        banner.innerHTML = `
            <i class="fa-solid fa-mug-hot fa-2x me-3"></i>
            <div>
                <h6 class="fw-bold mb-0">Free Period Active</h6>
                <small>Next class (${nextSlot.subject}) ${timeMsg}.</small>
            </div>`;
    } else {
        // DONE FOR THE DAY
        banner.className = 'mt-3 rounded-3 p-3 d-flex align-items-center banner-done';
        banner.innerHTML = `
            <i class="fa-solid fa-house-chimney-user fa-2x me-3"></i>
            <div>
                <h6 class="fw-bold mb-0">Classes Done!</h6>
                <small>No more classes scheduled for today. Rest well.</small>
            </div>`;
    }
}

// 7. Helpers
function convertToMins(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
}

function formatTime(timeStr) {
    // Convert 13:00 to 1:00 PM
    const [h, m] = timeStr.split(':');
    const date = new Date();
    date.setHours(h);
    date.setMinutes(m);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function startRealTimeClock() {
    setInterval(() => {
        const now = new Date();
        document.getElementById('realTimeClock').innerText = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        // Refresh schedule view if we are looking at today (to update "Now" badges and timers)
        const day = document.querySelector('.day-tabs .nav-link.active').innerText; // get shorthand
        const fullDay = Object.keys(timetableData).find(k => k.startsWith(day)); // map Mon -> Monday
        
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        if(fullDay === today) {
            loadDaySchedule(fullDay);
        }
    }, 60000); // Every minute
}


// --- FEATURE 2: ADVANCED LESSON NOTE BUILDER ---

// State
let currentStep = 1;
let totalSteps = 4;
let editingNoteId = null;

// Call on load
document.addEventListener('DOMContentLoaded', () => {
    // ... existing inits ...
    renderRecentNotes();
});

// 1. Wizard Navigation
function openNoteWizard() {
    editingNoteId = null;
    document.getElementById('noteForm').reset();
    document.getElementById('wizardTitle').innerText = "New Lesson Note";
    document.getElementById('noteDeleteBtn').classList.add('d-none');
    
    currentStep = 1;
    updateWizardUI();
    new bootstrap.Modal(document.getElementById('noteWizardModal')).show();
}

function changeStep(n) {
    // Validate Step 1 before moving
    if(currentStep === 1 && n === 1) {
        if(!document.getElementById('lnTopic').value) return alert("Please enter a Topic.");
    }

    currentStep += n;
    if (currentStep < 1) currentStep = 1;
    if (currentStep > totalSteps) currentStep = totalSteps;
    updateWizardUI();
}

function updateWizardUI() {
    // Hide all steps
    document.querySelectorAll('.wizard-step').forEach(el => el.classList.add('d-none'));
    // Show current
    document.getElementById(`step${currentStep}`).classList.remove('d-none');
    
    // Update Text/Bar
    document.getElementById('currentStepNum').innerText = currentStep;
    document.getElementById('wizardProgress').style.width = `${(currentStep/totalSteps)*100}%`;

    // Buttons
    document.getElementById('prevBtn').disabled = (currentStep === 1);
    
    if(currentStep === totalSteps) {
        document.getElementById('nextBtn').classList.add('d-none');
        document.getElementById('finishBtn').classList.remove('d-none');
    } else {
        document.getElementById('nextBtn').classList.remove('d-none');
        document.getElementById('finishBtn').classList.add('d-none');
    }
}

// 2. Save Logic
function saveNote() {
    const note = {
        id: editingNoteId || Date.now(),
        dateCreated: new Date().toISOString(),
        // Basics
        subject: document.getElementById('lnSubject').value,
        topic: document.getElementById('lnTopic').value,
        class: document.getElementById('lnClass').value,
        duration: document.getElementById('lnDuration').value,
        date: document.getElementById('lnDate').value,
        mat: document.getElementById('lnMat').value,
        // Objectives
        entry: document.getElementById('lnEntry').value,
        obj: document.getElementById('lnObj').value,
        // Procedure (T=Teacher, S=Student)
        step1T: document.getElementById('lnStep1T').value, step1S: document.getElementById('lnStep1S').value,
        step2T: document.getElementById('lnStep2T').value, step2S: document.getElementById('lnStep2S').value,
        step3T: document.getElementById('lnStep3T').value, step3S: document.getElementById('lnStep3S').value,
        step4T: document.getElementById('lnStep4T').value, step4S: document.getElementById('lnStep4S').value,
        // Eval
        eval: document.getElementById('lnEval').value,
        assign: document.getElementById('lnAssign').value
    };

    let notes = JSON.parse(localStorage.getItem('gradmate_tp_notes')) || [];
    
    if(editingNoteId) {
        const index = notes.findIndex(n => n.id === editingNoteId);
        if(index > -1) notes[index] = note;
    } else {
        notes.unshift(note);
    }

    localStorage.setItem('gradmate_tp_notes', JSON.stringify(notes));
    
    bootstrap.Modal.getInstance(document.getElementById('noteWizardModal')).hide();
    renderRecentNotes();
    alert("Lesson Note Saved!");
}

// 3. Render Dashboard Widget
function renderRecentNotes() {
    const notes = JSON.parse(localStorage.getItem('gradmate_tp_notes')) || [];
    const container = document.getElementById('recentNotesGrid');
    const countEl = document.getElementById('noteCount');
    
    countEl.innerText = notes.length;
    container.innerHTML = '';

    if(notes.length === 0) {
        container.innerHTML = `<div class="col-12 text-center py-4 text-muted small">No notes saved.</div>`;
        return;
    }

    // Show max 4
    notes.slice(0, 4).forEach(note => {
        container.innerHTML += `
            <div class="col-md-6">
                <div class="note-preview-card">
                    <div class="d-flex justify-content-between mb-2">
                        <span class="badge bg-light text-dark border">${note.class}</span>
                        <div class="dropdown">
                            <i class="fa-solid fa-ellipsis text-muted cursor-pointer" data-bs-toggle="dropdown"></i>
                            <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0">
                                <li><a class="dropdown-item small" href="#" onclick="editNote(${note.id})"><i class="fa-solid fa-pen me-2"></i>Edit</a></li>
                                <li><a class="dropdown-item small" href="#" onclick="previewNote(${note.id})"><i class="fa-solid fa-print me-2"></i>Print/PDF</a></li>
                            </ul>
                        </div>
                    </div>
                    <h6 class="fw-bold mb-1 text-truncate">${note.topic}</h6>
                    <small class="text-muted d-block mb-2">${note.subject}</small>
                    <div class="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                        <small class="text-muted" style="font-size:0.7rem">${new Date(note.dateCreated).toLocaleDateString()}</small>
                        <button class="btn btn-sm btn-light text-orange fw-bold" onclick="editNote(${note.id})">Open</button>
                    </div>
                </div>
            </div>
        `;
    });
}

// 4. Edit
function editNote(id) {
    const notes = JSON.parse(localStorage.getItem('gradmate_tp_notes'));
    const note = notes.find(n => n.id === id);
    if(!note) return;

    editingNoteId = id;
    document.getElementById('wizardTitle').innerText = "Edit Note";
    document.getElementById('noteDeleteBtn').classList.remove('d-none');

    // Fill basics
    document.getElementById('lnSubject').value = note.subject;
    document.getElementById('lnTopic').value = note.topic;
    document.getElementById('lnClass').value = note.class;
    document.getElementById('lnDuration').value = note.duration;
    document.getElementById('lnDate').value = note.date;
    document.getElementById('lnMat').value = note.mat;
    
    // Fill Steps
    document.getElementById('lnEntry').value = note.entry;
    document.getElementById('lnObj').value = note.obj;
    
    document.getElementById('lnStep1T').value = note.step1T; document.getElementById('lnStep1S').value = note.step1S;
    document.getElementById('lnStep2T').value = note.step2T; document.getElementById('lnStep2S').value = note.step2S;
    document.getElementById('lnStep3T').value = note.step3T; document.getElementById('lnStep3S').value = note.step3S;
    document.getElementById('lnStep4T').value = note.step4T; document.getElementById('lnStep4S').value = note.step4S;

    document.getElementById('lnEval').value = note.eval;
    document.getElementById('lnAssign').value = note.assign;

    currentStep = 1;
    updateWizardUI();
    new bootstrap.Modal(document.getElementById('noteWizardModal')).show();
}

function deleteNote() {
    if(confirm("Permanently delete this note?")) {
        let notes = JSON.parse(localStorage.getItem('gradmate_tp_notes'));
        notes = notes.filter(n => n.id !== editingNoteId);
        localStorage.setItem('gradmate_tp_notes', JSON.stringify(notes));
        bootstrap.Modal.getInstance(document.getElementById('noteWizardModal')).hide();
        renderRecentNotes();
    }
}

// 5. Print Preview (The Official Look)
function previewNote(id) {
    const notes = JSON.parse(localStorage.getItem('gradmate_tp_notes'));
    const n = notes.find(n => n.id === id);
    if(!n) return;

    const area = document.getElementById('printArea');
    
    // Convert newlines to <br>
    const fmt = (text) => (text || '').replace(/\n/g, '<br>');

    area.innerHTML = `
        <div class="text-center mb-4 pb-3 border-bottom border-dark">
            <h3 class="fw-bold mb-0 text-uppercase">Lesson Note</h3>
            <p class="mb-0">Week Ending: ${n.date}</p>
        </div>
        
        <table class="table table-bordered border-dark table-sm mb-4">
            <tr><td class="fw-bold bg-light" width="20%">Subject</td><td>${n.subject}</td><td class="fw-bold bg-light" width="20%">Class</td><td>${n.class}</td></tr>
            <tr><td class="fw-bold bg-light">Topic</td><td colspan="3">${n.topic}</td></tr>
            <tr><td class="fw-bold bg-light">Duration</td><td>${n.duration}</td><td class="fw-bold bg-light">Date</td><td>${n.date}</td></tr>
            <tr><td class="fw-bold bg-light">Instruct. Mat.</td><td colspan="3">${n.mat}</td></tr>
        </table>

        <div class="mb-3">
            <h6 class="fw-bold text-decoration-underline">Entry Behavior</h6>
            <p>${fmt(n.entry)}</p>
        </div>

        <div class="mb-4">
            <h6 class="fw-bold text-decoration-underline">Behavioral Objectives</h6>
            <p>${fmt(n.obj)}</p>
        </div>

        <h6 class="fw-bold text-decoration-underline mb-2">Presentation</h6>
        <table class="table table-bordered border-dark mb-4">
            <thead class="bg-light">
                <tr><th width="15%">Step</th><th>Teacher's Activity</th><th>Student's Activity</th></tr>
            </thead>
            <tbody>
                <tr><td class="fw-bold">Step I<br><small>Intro</small></td><td>${fmt(n.step1T)}</td><td>${fmt(n.step1S)}</td></tr>
                <tr><td class="fw-bold">Step II<br><small>Content</small></td><td>${fmt(n.step2T)}</td><td>${fmt(n.step2S)}</td></tr>
                <tr><td class="fw-bold">Step III<br><small>Eval</small></td><td>${fmt(n.step3T)}</td><td>${fmt(n.step3S)}</td></tr>
                <tr><td class="fw-bold">Step IV<br><small>Summary</small></td><td>${fmt(n.step4T)}</td><td>${fmt(n.step4S)}</td></tr>
            </tbody>
        </table>

        <div class="mb-3">
            <h6 class="fw-bold text-decoration-underline">Evaluation</h6>
            <p>${fmt(n.eval)}</p>
        </div>

        <div class="mb-3">
            <h6 class="fw-bold text-decoration-underline">Assignment</h6>
            <p>${fmt(n.assign)}</p>
        </div>
    `;

    new bootstrap.Modal(document.getElementById('printModal')).show();
}

// --- FEATURE 10 ADD-ON: EXPORT & VIEW MORE LOGIC ---

let filteredTransactions = []; // Store filtered state

function openExportModal() {
    // Default to 'week' view
    document.getElementById('exportFilter').value = 'week';
    filterExportList();
    new bootstrap.Modal(document.getElementById('exportModal')).show();
}

function filterExportList() {
    const filterType = document.getElementById('exportFilter').value;
    const history = tpData.finance.history || [];
    const container = document.getElementById('fullHistoryList');
    const totalExpEl = document.getElementById('exportTotalExp');
    const totalIncEl = document.getElementById('exportTotalInc');

    // 1. Filter Data by Date
    const today = new Date();
    today.setHours(0,0,0,0);

    filteredTransactions = history.filter(tx => {
        const txDate = new Date(tx.date);
        txDate.setHours(0,0,0,0);

        if (filterType === 'today') {
            return txDate.getTime() === today.getTime();
        } else if (filterType === 'week') {
            // Calculate start of week (Sunday)
            const day = today.getDay(); 
            const diff = today.getDate() - day; // adjust when day is sunday
            const startOfWeek = new Date(today.setDate(diff));
            startOfWeek.setHours(0,0,0,0);
            return new Date(tx.date) >= startOfWeek;
        } else {
            return true; // All time
        }
    });

    // 2. Render List
    container.innerHTML = '';
    let expSum = 0;
    let incSum = 0;

    // Reverse to show newest first
    const viewList = [...filteredTransactions].reverse();

    if (viewList.length === 0) {
        container.innerHTML = `<div class="text-center py-4 text-muted small">No transactions found for this period.</div>`;
    } else {
        viewList.forEach(tx => {
            if(tx.type === 'expense') expSum += tx.amount;
            else incSum += tx.amount;

            const isExp = tx.type === 'expense';
            
            container.innerHTML += `
                <div class="d-flex justify-content-between align-items-center border-bottom py-2">
                    <div class="d-flex align-items-center">
                        <div class="me-2 text-center" style="width:30px;">
                            <i class="fa-solid ${tx.icon} text-muted small"></i>
                        </div>
                        <div>
                            <span class="d-block small fw-bold text-dark">${tx.category}</span>
                            <span class="d-block smaller text-muted">${new Date(tx.date).toLocaleString('en-GB', {weekday:'short', hour:'2-digit', minute:'2-digit'})}</span>
                        </div>
                    </div>
                    <span class="small fw-bold ${isExp ? 'text-danger' : 'text-success'}">
                        ${isExp ? '-' : '+'}₦${tx.amount.toLocaleString()}
                    </span>
                </div>
            `;
        });
    }

    // 3. Update Totals
    totalExpEl.innerText = `₦${expSum.toLocaleString()}`;
    totalIncEl.innerText = `₦${incSum.toLocaleString()}`;
}

function downloadTxtExport() {
    if (filteredTransactions.length === 0) {
        alert("No transactions to export for this period.");
        return;
    }

    const filterType = document.getElementById('exportFilter').value;
    const now = new Date().toLocaleString();
    let receiptText = `GRADMATE TP WALLET STATEMENT\n`;
    receiptText += `Generated: ${now}\n`;
    receiptText += `Period: ${filterType.toUpperCase()}\n`;
    receiptText += `=====================================\n\n`;

    let totalExp = 0;
    let totalInc = 0;

    // Sort old to new for text file usually looks better as a timeline
    const sortedForTxt = [...filteredTransactions].sort((a,b) => new Date(a.date) - new Date(b.date));

    sortedForTxt.forEach(tx => {
        const isExp = tx.type === 'expense';
        const dateStr = new Date(tx.date).toLocaleDateString('en-GB');
        const sign = isExp ? '-' : '+';
        
        if(isExp) totalExp += tx.amount; else totalInc += tx.amount;

        // Formatting line
        // Date | Category (Note) | Amount
        let line = `${dateStr} | ${tx.category.padEnd(12)} | ${sign}N${tx.amount}\n`;
        if(tx.note) line += `   Note: ${tx.note}\n`;
        line += `-------------------------------------\n`;
        
        receiptText += line;
    });

    receiptText += `\n=====================================\n`;
    receiptText += `TOTAL INCOME:   +N${totalInc.toLocaleString()}\n`;
    receiptText += `TOTAL EXPENSES: -N${totalExp.toLocaleString()}\n`;
    receiptText += `NET CHANGE:      N${(totalInc - totalExp).toLocaleString()}\n`;
    receiptText += `=====================================\n`;

    // Create Blob and Download
    const blob = new Blob([receiptText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `TP_Wallet_${filterType}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// --- FEATURE 6: TIMETABLE MANAGER (ADD/EDIT/SAVE) ---

// 1. Open Modal to Add New Class
function openTimetableModal() {
    editingSlotId = null;
    document.getElementById('ttForm').reset();
    document.getElementById('ttModalTitle').innerText = "Add Class Slot";
    document.getElementById('ttDeleteBtn').classList.add('d-none');
    
    // Default to the day currently being viewed
    document.getElementById('ttDay').value = selectedDay;

    new bootstrap.Modal(document.getElementById('timetableModal')).show();
}

// 2. Save or Update a Class Slot
function saveTimetableSlot() {
    const day = document.getElementById('ttDay').value;
    const start = document.getElementById('ttStart').value;
    const end = document.getElementById('ttEnd').value;
    const subject = document.getElementById('ttSubject').value;
    const className = document.getElementById('ttClass').value;

    if (!start || !end || !subject || !className) {
        alert("Please fill in all timetable details.");
        return;
    }

    const slotData = {
        id: editingSlotId || 'slot_' + Date.now(),
        start, end, subject, class: className
    };

    if (editingSlotId) {
        // Update existing
        const index = timetableData[day].findIndex(s => s.id === editingSlotId);
        if (index > -1) timetableData[day][index] = slotData;
    } else {
        // Add new
        if (!timetableData[day]) timetableData[day] = [];
        timetableData[day].push(slotData);
    }

    // SAVE TO LOCALSTORAGE (This is what the Dashboard reads!)
    localStorage.setItem('gradmate_tp_timetable', JSON.stringify(timetableData));

    // Refresh UI
    loadDaySchedule(day);
    bootstrap.Modal.getInstance(document.getElementById('timetableModal')).hide();
}

// 3. Open Modal to Edit Existing Class
let editingSlotId = null;
function editSlot(id) {
    // Find the slot across all days
    let foundSlot = null;
    let foundDay = null;

    for (const day in timetableData) {
        const slot = timetableData[day].find(s => s.id === id);
        if (slot) {
            foundSlot = slot;
            foundDay = day;
            break;
        }
    }

    if (foundSlot) {
        editingSlotId = id;
        document.getElementById('ttModalTitle').innerText = "Edit Class Slot";
        document.getElementById('ttDeleteBtn').classList.remove('d-none');

        document.getElementById('ttDay').value = foundDay;
        document.getElementById('ttStart').value = foundSlot.start;
        document.getElementById('ttEnd').value = foundSlot.end;
        document.getElementById('ttSubject').value = foundSlot.subject;
        document.getElementById('ttClass').value = foundSlot.class;

        new bootstrap.Modal(document.getElementById('timetableModal')).show();
    }
}

// 4. Delete a Slot
function deleteSlot() {
    if (confirm("Remove this class from your timetable?")) {
        const day = document.getElementById('ttDay').value;
        timetableData[day] = timetableData[day].filter(s => s.id !== editingSlotId);
        
        localStorage.setItem('gradmate_tp_timetable', JSON.stringify(timetableData));
        loadDaySchedule(day);
        bootstrap.Modal.getInstance(document.getElementById('timetableModal')).hide();
    }
}


function selectAssignment(id) {
    activeAsgnId = id;
    const asgn = tpData.assignments.find(a => a.id === id);
    
    // UI Transitions
    document.getElementById('registerEmptyState').classList.add('d-none');
    document.getElementById('registerView').classList.remove('d-none');
    document.getElementById('activeRegisterTitle').innerText = `${asgn.subject} - ${asgn.baseClass}`;
    
    renderAssignments(); // Refresh pills to show active state
    loadAttendanceData();
}

// --- ATTENDANCE & MASTER ANCHORING ---
function loadAttendanceData() {
    if(!activeAsgnId) return;
    const asgn = tpData.assignments.find(a => a.id === activeAsgnId);
    const date = document.getElementById('attDate').value;
    const key = `${activeAsgnId}_${date}`;
    const records = tpData.attendanceRecords[key] || {};
    
    // FILTER: Find only students anchored to this Class Arm (e.g. SS 1A)
    const rollCall = tpData.masterStudents.filter(s => s.baseClass === asgn.baseClass);
    
    document.getElementById('activeRegisterStats').innerText = `${rollCall.length} Students Enrolled`;
    
    const container = document.getElementById('attendanceContainer');
    container.innerHTML = '';

    if(rollCall.length === 0) {
        container.innerHTML = `<div class="text-center py-4 small text-muted">No students in ${asgn.baseClass}. Click Master List to add some.</div>`;
    }

    rollCall.forEach(student => {
        const status = records[student.id] || 'none';
        container.innerHTML += `
            <div class="att-bubble status-${status} position-relative" onclick="cycleStatus('${student.id}')">
                ${getInitials(student.name)}
                <div class="truancy-dot" id="truant_${student.id}"></div>
            </div>
        `;
    });
    
    updateStats(rollCall, records);
    checkTruancy(rollCall, date);
}

// THE MAX FEATURE: Cross-check other subjects today
function checkTruancy(roll, date) {
    roll.forEach(student => {
        let wasPresentElsewhere = false;
        // Check all other assignments for this student's class
        tpData.assignments.forEach(otherAsgn => {
            if(otherAsgn.id === activeAsgnId) return;
            const otherKey = `${otherAsgn.id}_${date}`;
            if(tpData.attendanceRecords[otherKey] && tpData.attendanceRecords[otherKey][student.id] === 'present') {
                wasPresentElsewhere = true;
            }
        });

        // If present in another subject but marked absent here, show the red dot
        const currentStatus = (tpData.attendanceRecords[`${activeAsgnId}_${date}`] || {})[student.id];
        if(wasPresentElsewhere && currentStatus === 'absent') {
            document.getElementById(`truant_${student.id}`).style.display = 'block';
        }
    });
}

function cycleStatus(studentId) {
    const date = document.getElementById('attDate').value;
    const key = `${activeAsgnId}_${date}`;
    if(!tpData.attendanceRecords[key]) tpData.attendanceRecords[key] = {};
    
    const current = tpData.attendanceRecords[key][studentId] || 'none';
    const nextMap = { 'none': 'present', 'present': 'absent', 'absent': 'none' };
    tpData.attendanceRecords[key][studentId] = nextMap[current];
    
    saveData();
    loadAttendanceData();
}

// Master List: Adding student anchors them to the current Class Arm
function addStudentToClass() {
    const name = document.getElementById('addStudentInput').value;
    const asgn = tpData.assignments.find(a => a.id === activeAsgnId);
    if(!name || !asgn) return alert("Select a subject and enter a name.");
    
    const newStudent = {
        id: 'std_' + Date.now(),
        name: name,
        baseClass: asgn.baseClass // Anchor fixed to the arm
    };
    
    tpData.masterStudents.push(newStudent);
    saveData();
    document.getElementById('addStudentInput').value = '';
    loadAttendanceData();
}

function updateStats(roll, records) {
    let p = 0; let a = 0;
    roll.forEach(s => { 
        if(records[s.id] === 'present') p++; 
        if(records[s.id] === 'absent') a++;
    });
    document.getElementById('statPresent').innerText = p;
    document.getElementById('statAbsent').innerText = a;
    const pct = roll.length ? Math.round((p / roll.length) * 100) : 0;
    document.getElementById('attPercentage').innerText = pct + '%';
}

let activeAsgnId = null;

// Call in DOMContentLoaded
function initAcademicRegistry() {
    renderAssignments();
    document.getElementById('attDate').valueAsDate = new Date();
}

function selectAssignment(id) {
    activeAsgnId = id;
    const asgn = tpData.assignments.find(a => a.id === id);
    
    document.getElementById('registerEmptyState').classList.add('d-none');
    document.getElementById('registerView').classList.remove('d-none');
    document.getElementById('activeRegisterTitle').innerText = `${asgn.subject} (${asgn.baseClass})`;
    
    renderAssignments(); // Re-render pills to show active state
    loadAttendanceData();
}

function loadAttendanceData() {
    const asgn = tpData.assignments.find(a => a.id === activeAsgnId);
    const date = document.getElementById('attDate').value;
    const key = `${activeAsgnId}_${date}`;
    const records = tpData.attendanceRecords[key] || {};
    
    // Filter students belonging to this class arm
    const rollCall = tpData.masterStudents.filter(s => s.baseClass === asgn.baseClass);
    const container = document.getElementById('attendanceContainer');
    container.innerHTML = '';

    rollCall.forEach(student => {
        const status = records[student.id] || 'none';
        container.innerHTML += `
            <div class="att-bubble status-${status}" onclick="cycleStatus('${student.id}')">
                ${getInitials(student.name)}
                <div class="truancy-dot" id="truant_${student.id}"></div>
            </div>
        `;
    });
    
    checkTruancy(rollCall, date);
}

// MAX FUNCTIONALITY: Cross-Subject Truancy Check
function checkTruancy(roll, date) {
    roll.forEach(student => {
        let seenElsewhere = false;
        tpData.assignments.forEach(oa => {
            if(oa.id === activeAsgnId) return;
            const otherKey = `${oa.id}_${date}`;
            if(tpData.attendanceRecords[otherKey]?.[student.id] === 'present') seenElsewhere = true;
        });

        const myStatus = (tpData.attendanceRecords[`${activeAsgnId}_${date}`] || {})[student.id];
        if(seenElsewhere && myStatus === 'absent') {
            document.getElementById(`truant_${student.id}`).style.display = 'block';
        }
    });
}