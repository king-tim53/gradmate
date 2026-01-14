const step1 = document.getElementById('step-1');
const step2Student = document.getElementById('step-2-student');
const step2Supervisor = document.getElementById('step-2-supervisor');
const dot1 = document.getElementById('dot-1');
const dot2 = document.getElementById('dot-2');
const title = document.getElementById('form-title');
const subtitle = document.getElementById('form-subtitle');
const roleContainer = document.getElementById('roleContainer');

let currentRole = 'student'; // Default

// --- 1. Role Toggle ---
window.setSignUpRole = function(role) {
    currentRole = role;
    document.querySelectorAll('.role-btn').forEach(btn => {
        btn.classList.remove('active');
        if(btn.dataset.role === role) btn.classList.add('active');
    });
    subtitle.innerText = role === 'student' ? "Join the academic network." : "Manage your students.";
};

// --- 2. Navigation ---
window.nextStep = function() {
    const name = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const pass = document.getElementById('pass').value;

    if (!name || !email || !pass) return alert("Please fill all details.");

    step1.classList.add('d-none');
    roleContainer.classList.add('d-none');
    
    if(currentRole === 'student') {
        step2Student.classList.remove('d-none');
        title.innerText = "Student Profile";
    } else {
        step2Supervisor.classList.remove('d-none');
        title.innerText = "Staff Profile";
    }
    
    dot2.classList.replace('bg-light', 'bg-primary');
    dot2.classList.replace('text-muted', 'text-white');
};

window.prevStep = function() {
    step2Student.classList.add('d-none');
    step2Supervisor.classList.add('d-none');
    step1.classList.remove('d-none');
    roleContainer.classList.remove('d-none');
    
    dot2.classList.replace('bg-primary', 'bg-light');
    dot2.classList.replace('text-white', 'text-muted');
    title.innerText = "Create Account";
};

// --- 3. IMMUTABLE CORE ID GENERATOR ---
function generateStudentIdentity(fullName, selectedTracks) {
    // A. Initials Extraction (e.g., David Ojo -> DO)
    const nameParts = fullName.trim().split(" ");
    const initials = (nameParts[0][0] + (nameParts[1] ? nameParts[1][0] : nameParts[0][1])).toUpperCase();

    // B. Prefix Building (e.g., S + P -> SP)
    let prefix = "";
    if (selectedTracks.includes("S")) prefix += "S";
    if (selectedTracks.includes("P")) prefix += "P";
    if (selectedTracks.includes("T")) prefix += "T";
    if (prefix === "") prefix = "S"; // Fallback safety

    // C. 8-Digit Core Generator (The Collision Loop)
    let coreID;
    let isUnique = false;
    
    // Simulate checking a database (Local Storage)
    const existingDB = JSON.parse(localStorage.getItem('gradmate_db_ids')) || [];

    while (!isUnique) {
        // Generate random 8-digit number (10000000 to 99999999)
        coreID = Math.floor(10000000 + Math.random() * 90000000);
        
        // Check if this specific number exists
        if (!existingDB.includes(coreID)) {
            isUnique = true;
            existingDB.push(coreID); // Reserve it
            localStorage.setItem('gradmate_db_ids', JSON.stringify(existingDB));
        }
    }

    // D. Assemble Final ID (Display Token)
    const displayID = `${prefix}-${coreID}-${initials}-U`;

    return { coreID, displayID, prefix };
}

// --- 4. Form Submission ---
document.getElementById('multiStepForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    
    if (currentRole === 'student') {
        const name = document.getElementById('fullName').value;
        const matric = document.getElementById('matric').value;
        const uni = document.getElementById('uni').value;
        // Capture New Academic Info
        const level = document.getElementById('level').value; // e.g., 400L
        const faculty = document.getElementById('faculty').value; // e.g., Engineering
        const course = document.getElementById('program').value; // e.g., Computer Engineering
        
        // Get Selected Tracks
        const checkboxes = document.querySelectorAll('.track-checkbox:checked');
        const tracks = Array.from(checkboxes).map(cb => cb.value);

        if (tracks.length === 0) return alert("Please select at least one track (SIWES, Project, or Teaching).");

        // UI Loading
        btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Generating ID...';
        btn.disabled = true;

        setTimeout(() => {
            // Generate ID
            const identity = generateStudentIdentity(name, tracks);

            // Create User Object
            const user = {
                role: 'student',
                name: name,
                matric: matric, // Saved as text string only
                uni: uni,
                 // New Fields Added Here:
                 level: level,
                 faculty: faculty,
                 course: course,
                coreID: identity.coreID, // The Anchor
                displayID: identity.displayID, // The Token (e.g. SP-12345678-DO-U)
                access: identity.prefix, // S, SP, or SPT
                tracks: tracks // Array ['S', 'P']
            };

            // Save to Local Storage (Simulating Login Session)
            localStorage.setItem('gradmateUser', JSON.stringify(user));

            // Redirect
            window.location.href = "dashboard.html";
        }, 1500);

    }  else {
        // 1. Capture the inputs from the form
        const fullName = document.getElementById('fullName').value; // From Step 1
        const title = document.getElementById('supTitle').value;
        // We need to find the University input (it currently lacks an ID in your HTML)
        const uni = document.querySelector('#step-2-supervisor input[placeholder*="e.g. OAU"]').value;
    
        // 2. Create the Supervisor Object
        const supervisorUser = {
            role: 'supervisor',
            title: title,
            name: fullName,
            university: uni,
            // Generate a mock Staff ID
            staffId: "STF-" + Math.floor(1000 + Math.random() * 9000)
        };
    
        // 3. Save to LocalStorage
        localStorage.setItem('gradmateUser', JSON.stringify(supervisorUser));
        
        // 4. Redirect
        window.location.href = "supervisor.html";
    }
});

// --- 3. IMMUTABLE CORE ID GENERATOR (The Engine) ---
function generateStudentIdentity(fullName, selectedTracks) {
    // A. Initials Extraction (e.g., David Ojo -> DO)
    const nameParts = fullName.trim().split(" ");
    // Handle cases with single names safely
    const firstInitial = nameParts[0] ? nameParts[0][0] : "X";
    const lastInitial = nameParts.length > 1 ? nameParts[1][0] : nameParts[0][1] || "X";
    const initials = (firstInitial + lastInitial).toUpperCase();

    // B. Prefix Building (e.g., S + P -> SP)
    let prefix = "";
    if (selectedTracks.includes("S")) prefix += "S";
    if (selectedTracks.includes("P")) prefix += "P";
    if (selectedTracks.includes("T")) prefix += "T";
    if (prefix === "") prefix = "S"; // Fallback safety

    // C. 8-Digit Core Generator (The Collision Loop)
    let coreID;
    let isUnique = false;
    
    // Simulate checking a database (Local Storage)
    const existingDB = JSON.parse(localStorage.getItem('gradmate_db_ids')) || [];

    while (!isUnique) {
        // Generate random 8-digit number (10000000 to 99999999)
        coreID = Math.floor(10000000 + Math.random() * 90000000);
        
        // Check if this specific number exists in our mock DB
        if (!existingDB.includes(coreID)) {
            isUnique = true;
            existingDB.push(coreID); // Reserve it
            localStorage.setItem('gradmate_db_ids', JSON.stringify(existingDB));
        }
    }

    // D. Assemble Final ID (Display Token)
    // Format: ACCESS-CORE-INITIALS-STATUS
    const displayID = `${prefix}-${coreID}-${initials}-U`;

    return { coreID, displayID, prefix };
}


// Inside your signup function in signup.js
const newUser = {
    name: name,
    matric: matric,
    access: accessPrefix,
    joinDate: new Date().toISOString(), // This saves the exact second they joined
    isSubscribed: true // They start as "Subscribed" for the free trial
};
localStorage.setItem('gradmateUser', JSON.stringify(newUser));



// Initializing the connection
const SUPABASE_URL = 'https://zengircmbnnfrvstnurb.supabase.co'; // Paste URL here
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplbmdpcmNtYm5uZnJ2c3RudXJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4OTIwOTMsImV4cCI6MjA4MzQ2ODA5M30.6zc-iQfiAwtKNtFGIHL4Lej3bab2oHdau02hSJ4g7xk';               // Paste Key here
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);