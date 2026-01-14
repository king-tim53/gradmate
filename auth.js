/**
 * GradMate Master Auth & Gatekeeper
 * Connects VS Code to Supabase Cloud and manages the 90-day trial.
 */

// 1. GLOBAL CONFIGURATION
const SUPABASE_URL = 'https://zengircmbnnfrvstnurb.supabase.co'; // Paste URL here
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplbmdpcmNtYm5uZnJ2c3RudXJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4OTIwOTMsImV4cCI6MjA4MzQ2ODA5M30.6zc-iQfiAwtKNtFGIHL4Lej3bab2oHdau02hSJ4g7xk';               // Paste Key here
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. CORE GATEKEEPER FUNCTION
async function gradmateGatekeeper() {
    // A. Verify Session
    const { data: { user }, error: authError } = await _supabase.auth.getUser();

    if (authError || !user) {
        console.warn("No active session found. Redirecting to login.");
        window.location.href = 'login.html';
        return;
    }

    // B. Fetch Real-time Profile (Trial Date, Name, and Track Access)
    const { data: profile, error: profError } = await _supabase
        .from('profiles')
        .select('subscription_expiry, access_prefix, full_name, role, matric, uni, faculty, level')
        .eq('id', user.id)
        .single();

    if (profError || !profile) {
        console.error("Profile not found in Supabase 'profiles' table.");
        return;
    }

    // C. THE 90-DAY TRIAL LOGIC
    const today = new Date();
    const expiryDate = new Date(profile.subscription_expiry);
    const currentPage = window.location.pathname.split("/").pop();

    if (today > expiryDate && currentPage !== 'payment.html') {
        alert("Your 90-day trial or subscription has ended. Please pay ₦400 to continue.");
        window.location.href = 'payment.html';
        return;
    }

    // D. MODULE PROTECTION (S, P, T Access)
    const prefix = profile.access_prefix || "";
    const moduleRules = {
        'siwes.html': 'S',
        'project.html': 'P',
        'tp.html': 'T'
    };

    if (moduleRules[currentPage] && !prefix.includes(moduleRules[currentPage])) {
        alert(`Restricted: You are not registered for the ${currentPage.split('.')[0].toUpperCase()} track.`);
        window.location.href = 'dashboard.html';
        return;
    }

    // E. UI INJECTION (Global)
    updateGlobalUI(profile, user);

    // F. FEATURE SYNC: THE NUDGE SYSTEM
    checkSupervisorNudges(user.id);
}

/**
 * 3. UI SYNC & IDENTITY PROTECTION
 * Ensures all dashboard elements match the Supabase profile.
 */
function updateGlobalUI(profile, user) {
    const page = window.location.pathname.split("/").pop();

    // Update Welcome Name
    const nameSpan = document.querySelector('.welcome-text span.text-primary');
    if (nameSpan) nameSpan.innerText = profile.full_name.split(" ")[0];

    // Update Sidebar/Identity Display
    const idDisplay = document.getElementById('displaySPID');
    if (idDisplay) idDisplay.innerText = profile.matric || "GM-ID";

    // Dashboard-Specific Profile Card Injection
    if (page === 'dashboard.html' || page === '') {
        const pMap = {
            'profile-name': profile.full_name,
            'profile-matric': profile.matric,
            'profile-level': profile.level || "Student",
            'profile-uni': profile.uni || "University",
            'profile-faculty': profile.faculty || "Faculty",
            'profile-full-id': profile.matric
        };

        for (let id in pMap) {
            const el = document.getElementById(id);
            if (el) el.innerText = pMap[id];
        }

        // Handle Welcome Modal (Session-based)
        if (!sessionStorage.getItem('welcomeShown')) {
            const modalEl = document.getElementById('welcomeIdModal');
            if (modalEl) {
                document.getElementById('modal-user-name').innerText = profile.full_name.split(" ")[0];
                document.getElementById('modal-user-id').innerText = profile.matric;
                new bootstrap.Modal(modalEl).show();
                sessionStorage.setItem('welcomeShown', 'true');
            }
        }
    }
}

/**
 * 4. FEATURE LINK: NUDGE SYSTEM (Cross-file sync)
 * Fetches alerts sent from supervisor.js
 */
async function checkSupervisorNudges(studentId) {
    const { data: nudges } = await _supabase
        .from('nudges')
        .select('*')
        .eq('target_student_id', studentId)
        .eq('is_read', false);

    if (nudges && nudges.length > 0) {
        const nudge = nudges[0]; // Show latest
        const alertBox = document.createElement('div');
        alertBox.className = "nudge-toast animate__animated animate__bounceInRight";
        alertBox.innerHTML = `
            <div class="d-flex align-items-center p-3 bg-dark text-white rounded-4 shadow-lg" 
                 style="position: fixed; bottom: 20px; right: 20px; z-index: 9999; border-left: 5px solid #ffc107;">
                <i class="fa-solid fa-bell text-warning me-3"></i>
                <div>
                    <small class="fw-bold d-block">Supervisor Nudge</small>
                    <span class="smaller">${nudge.message}</span>
                </div>
                <button class="btn-close btn-close-white ms-3" onclick="this.parentElement.remove()"></button>
            </div>
        `;
        document.body.appendChild(alertBox);
        
        // Mark as read in Supabase
        await _supabase.from('nudges').update({ is_read: true }).eq('id', nudge.id);
    }
}

// 5. INITIALIZE
document.addEventListener('DOMContentLoaded', gradmateGatekeeper);


if (_supabase) {
    console.log("GradMate is successfully linked to Supabase Cloud."); //
} else {
    console.error("Connection failed. Check your URL and Key.");
}

