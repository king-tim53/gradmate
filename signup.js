/**
 * GradMate Sign-Up Logic (Supabase & 90-Day Trial Integrated)
 * Arranged for Navigation and Cloud Connectivity
 */

// 1. INITIALIZE SUPABASE
const SUPABASE_URL = 'https://zengircmbnnfrvstnurb.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplbmdpcmNtYm5uZnJ2c3RudXJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4OTIwOTMsImV4cCI6MjA4MzQ2ODA5M30.6zc-iQfiAwtKNtFGIHL4Lej3bab2oHdau02hSJ4g7xk';               
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. DOM ELEMENTS
const step1 = document.getElementById('step-1');
const step2Student = document.getElementById('step-2-student');
const step2Supervisor = document.getElementById('step-2-supervisor');
const dot1 = document.getElementById('dot-1');
const dot2 = document.getElementById('dot-2');
const titleText = document.getElementById('form-title');
const subtitleText = document.getElementById('form-subtitle');
const roleContainer = document.getElementById('roleContainer');
const multiStepForm = document.getElementById('multiStepForm');

let currentRole = 'student'; // Default

// --- 3. ROLE TOGGLE (WORKING) ---
window.setSignUpRole = function(role) {
    currentRole = role;
    document.querySelectorAll('.role-btn').forEach(btn => {
        btn.classList.remove('active');
        if(btn.dataset.role === role) btn.classList.add('active');
    });
    subtitleText.innerText = role === 'student' ? "Join the academic network." : "Manage your students.";
};

// --- 4. NAVIGATION (WORKING CONTINUE BUTTON) ---
window.nextStep = function() {
    const name = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const pass = document.getElementById('pass').value;

    if (!name || !email || !pass) return alert("Please fill all details in Step 1.");

    // Hide Step 1 and Role Switcher
    step1.classList.add('d-none');
    roleContainer.classList.add('d-none');
    
    // Show correct Step 2
    if(currentRole === 'student') {
        step2Student.classList.remove('d-none');
        titleText.innerText = "Student Profile";
    } else {
        step2Supervisor.classList.remove('d-none');
        titleText.innerText = "Staff Profile";
    }
    
    // Update Stepper UI
    dot1.classList.replace('bg-primary', 'bg-success'); // Mark 1 as done
    dot2.classList.replace('bg-light', 'bg-primary');
    dot2.classList.replace('text-muted', 'text-white');
};

window.prevStep = function() {
    step2Student.classList.add('d-none');
    step2Supervisor.classList.add('d-none');
    step1.classList.remove('d-none');
    roleContainer.classList.remove('d-none');
    
    dot1.classList.replace('bg-success', 'bg-primary');
    dot2.classList.replace('bg-primary', 'bg-light');
    dot2.classList.replace('text-white', 'text-muted');
    titleText.innerText = "Create Account";
};

// --- 5. FORM SUBMISSION (SUPABASE CONNECTED) ---
multiStepForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    
    // Global Fields
    const email = document.getElementById('email').value;
    const password = document.getElementById('pass').value;
    const fullName = document.getElementById('fullName').value;

    // A. 90-Day Trial Logic (Anchor today + 90)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 90);

    // UI Loading State
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Securing Account...';
    btn.disabled = true;

    try {
        // B. Create Auth User in Supabase
        const { data: authData, error: authError } = await _supabase.auth.signUp({
            email: email,
            password: password
        });

        if (authError) throw authError;

        // C. Build Profile Object for Database
        let userProfile = {
            id: authData.user.id,
            full_name: fullName,
            role: currentRole,
            subscription_expiry: expiryDate.toISOString(),
            join_date: new Date().toISOString()
        };

        if (currentRole === 'student') {
            const tracks = getSelectedTracks();
            if (tracks === "") throw new Error("Please select at least one track.");

            userProfile.matric = document.getElementById('matric').value;
            userProfile.uni = document.getElementById('uni').value;
            userProfile.faculty = document.getElementById('faculty').value;
            userProfile.level = document.getElementById('level').value;
            userProfile.course = document.getElementById('program').value;
            userProfile.access_prefix = tracks;
        } else {
            const titleVal = document.getElementById('supTitle').value;
            userProfile.uni = document.getElementById('supUniInput').value;
            userProfile.matric = generateSPID(titleVal, fullName);
            userProfile.access_prefix = "ALL";
        }

        // D. Insert into Supabase 'profiles' table
        const { error: profileError } = await _supabase
            .from('profiles')
            .insert([userProfile]);

        if (profileError) throw profileError;

        // E. Success & Redirect
        alert("Account Created! Your 90-day free trial starts now.");
        window.location.href = currentRole === 'student' ? "dashboard.html" : "supervisor.html";

    } catch (err) {
        alert("Error: " + err.message);
        btn.innerHTML = "Complete Registration";
        btn.disabled = false;
    }
});

// --- HELPER FUNCTIONS ---

function getSelectedTracks() {
    let tracks = "";
    document.querySelectorAll('.track-checkbox:checked').forEach(cb => {
        tracks += cb.value;
    });
    return tracks; 
}

function generateSPID(title, fullName) {
    const titleMap = { "Dr.": "DR", "Prof.": "PF", "Engr.": "EG", "Arch.": "AR", "Mr.": "MR", "Mrs.": "MS" };
    const prefix = titleMap[title] || "ST";
    const coreID = Math.floor(1000000 + Math.random() * 9000000);
    const names = fullName.trim().split(" ");
    const initials = (names[0][0] + (names[1] ? names[1][0] : "X")).toUpperCase();
    return `SPID-${prefix}-${coreID}-${initials}`;
}