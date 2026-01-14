document.addEventListener('DOMContentLoaded', () => {
    
    // --- STATE ---
    let currentLang = 'eng';
    let totalScore = 0;

    // --- DATA DICTIONARY ---
    const contentData = {
        headers: {
            title: { eng: "TP Resource Hub", pg: "Teaching Practice HQ" },
            sub: { eng: "Master the art of the Nigerian classroom.", pg: "How to handle secondary school wahala." }
        },
        tabs: {
            note: { eng: "Lesson Note Architect", pg: "Lesson Note Builder" },
            control: { eng: "Classroom War Room", pg: "Class Control Tactics" },
            score: { eng: "Supervisor Scorecard", pg: "Grading Expo" },
            style: { eng: "Teacher's Code", pg: "Dressing Code" }
        },
        // TAB 1: LESSON NOTE
        lessonSteps: [
            {
                title: { eng: "Step 1: Subject Matter", pg: "Step 1: The Topic" },
                desc: { eng: "State clearly: Subject, Topic, Class, Average Age, and Duration (e.g., 40 mins).", pg: "Write the Subject, Topic and Time clearly. Use board divider if needed." }
            },
            {
                title: { eng: "Step 2: Behavioral Objectives", pg: "Step 2: Wetin dem must learn" },
                desc: { eng: "Must be measurable. Use verbs like 'List', 'Mention'. Avoid 'Know'.", pg: "No write 'Understand'. Write 'List' or 'Define'. Supervisor go mark you down for 'Understand'." }
            },
            {
                title: { eng: "Step 3: Entry Behavior", pg: "Step 3: Wetin dem sabi before" },
                desc: { eng: "Link the new topic to what students already learned previously.", pg: "Remind them of last week topic so dem no go look you like zombie." }
            },
            {
                title: { eng: "Step 4: Presentation (Steps I-IV)", pg: "Step 4: The Teaching Proper" },
                desc: { eng: "Step 1: Introduction. Step 2: Content. Step 3: Activity. Step 4: Summary.", pg: "Start with ginger (Intro), then pour the knowledge, then make dem participate." }
            },
            {
                title: { eng: "Step 5: Evaluation", pg: "Step 5: Ask Questions" },
                desc: { eng: "Ask questions based strictly on your objectives to check understanding.", pg: "Ask questions to know who sleep and who hear word." }
            }
        ],
        // TAB 2: WAR ROOM (SCENARIOS)
        scenarios: [
            {
                icon: "fa-volume-high",
                problem: { eng: "The Class is Too Noisy", pg: "The Class resemble Market" },
                solution: { eng: "Do not shout. Use a signal (like raising a hand) or write names of noise makers silently on the board.", pg: "No shout make your voice no crack. Just write 'List of Noise Makers' for board. Everywhere go quiet." }
            },
            {
                icon: "fa-bed",
                problem: { eng: "Student Sleeping", pg: "Student dey Sleep" },
                solution: { eng: "Walk to their desk while teaching and tap the table gently. Do not humiliate them.", pg: "Waka go him seat, tap table small. No disgrace am, e fit be hunger or sickness." }
            },
            {
                icon: "fa-question",
                problem: { eng: "You Don't Know an Answer", pg: "Student ask hard question" },
                solution: { eng: "Admit it politely: 'That's a great question. I will research it and tell you next class.'", pg: "No lie o! Tell am say 'Good question, I go check am come back'. No perform magic." }
            },
            {
                icon: "fa-bolt",
                problem: { eng: "Supervisor Walks In", pg: "Supervisor enter class" },
                solution: { eng: "Keep teaching! Acknowledge with a nod, offer a seat/Lesson Note if available, but do not stop.", pg: "No stop teaching! Give am seat and your Note, then continue like say e no dey dia." }
            }
        ],
        // TAB 3: CHECKLIST
        checklist: [
            { text: { eng: "Lesson Note is up to date & signed", pg: "Lesson Note complete & signed" }, marks: 20 },
            { text: { eng: "Appropriate Introduction (Set Induction)", pg: "You start the class well" }, marks: 10 },
            { text: { eng: "Mastery of Subject Matter", pg: "You sabi wetin you dey teach" }, marks: 20 },
            { text: { eng: "Classroom Control & Management", pg: "Class no noise" }, marks: 10 },
            { text: { eng: "Effective use of Chalkboard", pg: "Your handwriting straight for board" }, marks: 10 },
            { text: { eng: "Use of Instructional Materials", pg: "You bring teaching aid (Chart/Cardboard)" }, marks: 10 },
            { text: { eng: "Teacher's Personality & Dressing", pg: "You dress well (Corporate)" }, marks: 10 },
            { text: { eng: "Evaluation & Assignment", pg: "You ask question & give assignment" }, marks: 10 }
        ],
        // TAB 4: STYLE
        style: {
            male: {
                eng: ["Clean haircut/shave", "Ties are compulsory", "Polished shoes (No sneakers)", "Shirt tucked in"],
                pg: ["Barber must shine your head", "Tie crucial, no neck choking", "Shoe must shine", "Tuck in shirt well"]
            },
            female: {
                eng: ["Skirts below the knees", "No loud makeup or jewelry", "Covered shoulders", "Comfortable flat shoes/low heels"],
                pg: ["Skirt must pass knee", "Make-up minimal", "No spaghetti hand", "Shoe wey no go kill leg"]
            }
        }
    };

    // --- DOM ELEMENTS ---
    const setText = (id, text) => { const el = document.getElementById(id); if(el) el.textContent = text; };

    // --- RENDER FUNCTIONS ---

    // 1. Render Lesson Note
    const renderLessonNote = () => {
        const container = document.getElementById('lessonSteps');
        if(!container) return;
        container.innerHTML = contentData.lessonSteps.map(step => `
            <div class="timeline-item">
                <div class="timeline-marker"></div>
                <div class="ln-card">
                    <h6 class="fw-800 text-teal mb-2">${step.title[currentLang]}</h6>
                    <p class="mb-0 text-muted small">${step.desc[currentLang]}</p>
                </div>
            </div>
        `).join('');
    };

    // 2. Render War Room
    const renderWarRoom = () => {
        const container = document.getElementById('scenarioGrid');
        if(!container) return;
        container.innerHTML = contentData.scenarios.map(s => `
            <div class="col-md-6">
                <div class="war-card">
                    <div class="war-icon"><i class="fa-solid ${s.icon}"></i></div>
                    <h6 class="fw-bold mb-2">${s.problem[currentLang]}</h6>
                    <div class="war-solution">
                        <i class="fa-solid fa-check-circle text-success me-1"></i> ${s.solution[currentLang]}
                    </div>
                </div>
            </div>
        `).join('');
    };

    // 3. Render Checklist
    const renderChecklist = () => {
        const container = document.getElementById('checklistContainer');
        if(!container) return;
        container.innerHTML = contentData.checklist.map((item, index) => `
            <div class="list-group-item checklist-item py-3" onclick="toggleCheck(this, ${item.marks})">
                <div class="d-flex align-items-center">
                    <i class="fa-solid fa-circle-check fs-4 me-3"></i>
                    <div>
                        <span class="d-block fw-bold text-dark small">${item.text[currentLang]}</span>
                        <span class="badge bg-light text-muted border">${item.marks} Marks</span>
                    </div>
                </div>
            </div>
        `).join('');
        // Reset score on language switch
        totalScore = 0;
        updateScoreDisplay();
    };

    // 4. Render Style
    const renderStyle = () => {
        const mList = document.getElementById('maleList');
        const fList = document.getElementById('femaleList');
        if(mList) mList.innerHTML = contentData.style.male[currentLang].map(t => `<li><i class="fa-solid fa-check-circle"></i> ${t}</li>`).join('');
        if(fList) fList.innerHTML = contentData.style.female[currentLang].map(t => `<li><i class="fa-solid fa-check-circle"></i> ${t}</li>`).join('');
        
        // Static translations
        setText('diyHeader', currentLang === 'eng' ? 'Improvised Materials Guide' : 'DIY Guide (Do Am Yourself)');
        setText('diyText', currentLang === 'eng' ? 'No money for aids? Use cartons & bottle tops.' : 'Money no dey? Use carton and cover of bottle teach.');
    };

    // --- LOGIC FUNCTIONS ---

    window.toggleCheck = (el, marks) => {
        if(el.classList.contains('checked')) {
            el.classList.remove('checked');
            totalScore -= marks;
        } else {
            el.classList.add('checked');
            totalScore += marks;
        }
        updateScoreDisplay();
    };

    function updateScoreDisplay() {
        const scoreEl = document.getElementById('totalScore');
        const bar = document.getElementById('scoreBar');
        if(scoreEl && bar) {
            scoreEl.textContent = totalScore;
            bar.style.width = `${totalScore}%`;
            
            // Color Logic
            if(totalScore < 50) bar.className = 'progress-bar bg-danger';
            else if(totalScore < 70) bar.className = 'progress-bar bg-warning';
            else bar.className = 'progress-bar bg-success';
        }
    }

    // Bloom's Verbs (Static mostly, but good for filtering)
    const verbs = {
        know: ['Define', 'List', 'Label', 'Name', 'State', 'Identify'],
        app: ['Calculate', 'Demonstrate', 'Illustrate', 'Solve', 'Use', 'Apply'],
        create: ['Design', 'Compose', 'Construct', 'Invent', 'Plan', 'Formulate']
    };

    window.filterVerbs = (category) => {
        const list = document.getElementById('verbList');
        // Button Active State
        document.querySelectorAll('.verb-filter button').forEach(b => b.classList.remove('active', 'bg-teal', 'text-white'));
        event.target.classList.add('active', 'bg-teal', 'text-white'); // Simple active toggle
        
        if(list) {
            list.innerHTML = verbs[category].map(v => `<li class="list-group-item bg-transparent"><i class="fa-solid fa-caret-right me-2 text-teal"></i>${v}</li>`).join('');
        }
    };

    // --- MAIN CONTROLLER ---
    const updateInterface = () => {
        // Headers
        setText('headerTitle', contentData.headers.title[currentLang]);
        setText('headerSub', contentData.headers.sub[currentLang]);

        // Tab Labels
        setText('label-note', contentData.tabs.note[currentLang]);
        setText('label-control', contentData.tabs.control[currentLang]);
        setText('label-score', contentData.tabs.score[currentLang]);
        setText('label-style', contentData.tabs.style[currentLang]);

        renderLessonNote();
        renderWarRoom();
        renderChecklist();
        renderStyle();
    };

    // Event Listeners
    const toggle = document.getElementById('pidginToggle');
    if(toggle) {
        toggle.addEventListener('change', (e) => {
            currentLang = e.target.checked ? 'pg' : 'eng';
            document.body.classList.add('fade-transition');
            setTimeout(() => document.body.classList.remove('fade-transition'), 300);
            updateInterface();
        });
    }

    // Initialize Bloom's List
    filterVerbs('know');
    updateInterface();

});