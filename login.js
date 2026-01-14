// 1. INITIALIZE SUPABASE
const SUPABASE_URL = 'https://zengircmbnnfrvstnurb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplbmdpcmNtYm5uZnJ2c3RudXJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4OTIwOTMsImV4cCI6MjA4MzQ2ODA5M30.6zc-iQfiAwtKNtFGIHL4Lej3bab2oHdau02hSJ4g7xk'; // Use your full key
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENTS ---
    const togglePassword = document.querySelector('#togglePassword');
    const passwordInput = document.querySelector('#passwordInput');
    const loginForm = document.querySelector('#loginForm');
    const loginView = document.getElementById('login-view');
    const forgotView = document.getElementById('forgot-view');
    const step1 = document.getElementById('fp-step-1');
    const step2 = document.getElementById('fp-step-2');
    const step3 = document.getElementById('fp-step-3');

    // --- STATE ---
    let selectedRole = 'student';
    let generatedOTP = null;

    // --- VIEW SWITCHING ---
    window.toggleView = function(viewName) {
        if(viewName === 'forgot') {
            loginView.classList.add('d-none');
            forgotView.classList.remove('d-none');
        } else {
            loginView.classList.remove('d-none');
            forgotView.classList.add('d-none');
        }
    };

    // --- ROLE SELECTION ---
    window.setRole = function(role) {
        selectedRole = role;
        document.querySelectorAll('.role-btn').forEach(btn => {
            btn.classList.remove('active');
            if(btn.dataset.role === role) btn.classList.add('active');
        });
    };

    // --- ACTUAL SUPABASE LOGIN LOGIC ---
    if(loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = e.target.querySelector('input[type="email"]').value;
            const password = e.target.querySelector('input[type="password"]').value;
            const btn = e.target.querySelector('button[type="submit"]');

            btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Authenticating...';
            btn.disabled = true;

            // 1. Authenticate with Supabase
            const { data: authData, error: authError } = await _supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (authError) {
                alert("Login Failed: " + authError.message);
                btn.innerHTML = 'Login to Dashboard';
                btn.disabled = false;
                return;
            }

            // 2. Fetch profile to verify role
            const { data: profile, error: profError } = await _supabase
                .from('profiles')
                .select('role')
                .eq('id', authData.user.id)
                .single();

            if (profError || profile.role !== selectedRole) {
                alert(`Access Denied: This account is a ${profile ? profile.role : 'different role'}.`);
                btn.innerHTML = 'Login to Dashboard';
                btn.disabled = false;
                return;
            }

            // 3. Successful Redirect
            window.location.href = profile.role === 'student' ? "dashboard.html" : "supervisor.html";
        });
    }

    // --- PASSWORD TOGGLE ---
    if(togglePassword) {
        togglePassword.addEventListener('click', function () {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }
});