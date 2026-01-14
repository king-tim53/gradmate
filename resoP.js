document.addEventListener('DOMContentLoaded', () => {
    console.log("GradMate Resource Script Loaded");

    // --- STATE MANAGEMENT ---
    let currentLang = 'eng'; // Defaults to English

    // --- DATA DICTIONARY (Bilingual Content) ---
    const contentData = {
        headers: {
            title: { eng: "Project Resource Library", pg: "Project Defense Headquarters" },
            sub: { eng: "The ultimate guide to crushing your thesis.", pg: "The correct format to blast your defense." }
        },
        tabs: {
            anatomy: { eng: "Anatomy of Thesis", pg: "Chapter Breakdown" },
            method: { eng: "Methodology Lab", pg: "Methodology Lab" },
            survival: { eng: "Defense Survival", pg: "Defense Survival Kit" },
            vocab: { eng: "Research Vocab", pg: "Research Dictionary" }
        },
        // TAB 1: ANATOMY
        chapters: [
            {
                id: 1,
                title: { eng: "Chapter 1: Introduction", pg: "Chapter 1: The Beginning" },
                desc: { eng: "This sets the stage for the entire research.", pg: "Here you go tell us wetin worry you to start this research." },
                subs: { 
                    eng: ["1.1 Background of the Study", "1.2 Statement of the Problem", "1.3 Aim and Objectives", "1.4 Significance of Study", "1.5 Scope and Delimitations", "1.6 Operational Definition of Terms"],
                    pg: ["1.1 Introduction (The Gist)", "1.2 The Wahala (Problem)", "1.3 Wetin you wan achieve (Aim)", "1.4 Who e go help? (Significance)", "1.5 Where you stop (Scope)", "1.6 Meaning of big grammar (Definitions)"] 
                }
            },
            {
                id: 2,
                title: { eng: "Chapter 2: Literature Review", pg: "Chapter 2: Who Talk Am Before?" },
                desc: { eng: "Reviewing existing works related to your topic.", pg: "You go quote people wey don do am before make dem know say you read book." },
                subs: { 
                    eng: ["2.1 Conceptual Framework", "2.2 Theoretical Framework", "2.3 Empirical Review", "2.4 Gap in Knowledge"],
                    pg: ["2.1 Concept breakdown", "2.2 The Theory behind am", "2.3 Past Projects Review", "2.4 Wetin dem never do (The Gap)"] 
                }
            },
            {
                id: 3,
                title: { eng: "Chapter 3: Methodology", pg: "Chapter 3: How You Do Am" },
                desc: { eng: "The scientific methods used to gather data.", pg: "The recipe wey you use cook the soup." },
                subs: { 
                    eng: ["3.1 Research Design", "3.2 Population of Study", "3.3 Sample Size (Taro Yamane)", "3.4 Method of Data Collection", "3.5 Method of Data Analysis"],
                    pg: ["3.1 The Plan (Design)", "3.2 Everybody involved (Population)", "3.3 How many you pick? (Sample)", "3.4 How you share paper (Data Collection)", "3.5 How you calculate am (Analysis)"] 
                }
            },
            {
                id: 4,
                title: { eng: "Chapter 4: Results & Discussion", pg: "Chapter 4: The Result" },
                desc: { eng: "Presentation of data and testing hypotheses.", pg: "Show us wetin you find out. No lies here o." },
                subs: { 
                    eng: ["4.1 Data Presentation (Tables/Charts)", "4.2 Test of Hypothesis", "4.3 Discussion of Findings"],
                    pg: ["4.1 Show workings (Charts/Tables)", "4.2 Check if you dey right (Hypothesis)", "4.3 Wetin e mean? (Discussion)"] 
                }
            },
            {
                id: 5,
                title: { eng: "Chapter 5: Conclusion", pg: "Chapter 5: The End" },
                desc: { eng: "Summary, conclusion and recommendations.", pg: "Wrap up everything. Tell government wetin to do." },
                subs: { 
                    eng: ["5.1 Summary of Findings", "5.2 Conclusion", "5.3 Recommendations", "5.4 Contribution to Knowledge"],
                    pg: ["5.1 Summary (Long story short)", "5.2 Final Verdict", "5.3 Advice (Recommendation)", "5.4 Wetin you add join?"] 
                }
            }
        ],
        // TAB 2: METHODOLOGY
        methods: [
            {
                icon: "fa-clipboard-question",
                title: { eng: "Survey Research", pg: "Questionnaire Waka" },
                desc: { eng: "Best for social sciences. Uses questionnaires to get opinions from people.", pg: "You go share paper (Questionnaire) give plenty people make dem tick." }
            },
            {
                icon: "fa-flask",
                title: { eng: "Experimental Design", pg: "Lab Work" },
                desc: { eng: "For sciences/engineering. Testing variables in a controlled lab environment.", pg: "You go enter Lab mix chemicals or test machine." }
            },
            {
                icon: "fa-laptop-code",
                title: { eng: "Ex-Post Facto", pg: "Secondary Data" },
                desc: { eng: "Using data that already exists (e.g. CBN reports, Stock Market data).", pg: "You no go field. You use data wey CBN or Gov don keep." }
            }
        ],
        // TAB 3: SURVIVAL
        survival: {
            protTitle: { eng: "Protocol & Greeting", pg: "How to Greet (Protocol)" },
            protDesc: { eng: "How to respect the elders without looking weak.", pg: "Greet dem well make dem no fail you." },
            script: { 
                eng: "\"The Chairman of the Panel, The Head of Department, My Supervisor, Distinguished Academic Staff... Good Morning.\"", 
                pg: "\"Oga Chairman, My HOD, My Able Supervisor, all my Lecturers wey dey here... I hail una o. Good Morning.\"" 
            },
            slideTitle: { eng: "The 15-Slide Rule", pg: "The 15-Slide Format" },
            list: {
                eng: ["Slide 1: Title Page", "Slide 2: Statement of Problem", "Slide 3: Aim & Objectives", "Slide 4-5: Literature Review", "Slide 6-8: Methodology", "Slide 9-12: Data Analysis", "Slide 13: Conclusion", "Slide 14: Recommendations", "Slide 15: Thank You"],
                pg: ["Slide 1: Your Topic Name", "Slide 2: The Wahala (Problem)", "Slide 3: Wetin you wan do", "Slide 4-5: Who talk am before", "Slide 6-8: How you do am", "Slide 9-12: Wetin you see (Result)", "Slide 13: Summary", "Slide 14: Advice", "Slide 15: Thank You"]
            },
            tipTitle: { eng: "Golden Rule:", pg: "No lie give Supervisor:" },
            tipText: { eng: "If you don't know the answer, do not lie. Say 'I will look into that'.", pg: "If you no know am, talk say you no know am. No go form sabi." }
        },
        // TAB 4: GLOSSARY
        glossary: [
            { term: "Abstract", def: { eng: "A summary of the entire project found at the beginning.", pg: "The full gist of your project inside one paragraph." } },
            { term: "Hypothesis", def: { eng: "An educated guess you are testing (Null vs Alternative).", pg: "Wetin you suspect before you start the work." } },
            { term: "Population", def: { eng: "The entire group of people/items you are studying.", pg: "Everybody wey concern your topic." } },
            { term: "Sample Size", def: { eng: "The smaller group you actually collected data from.", pg: "The few people wey you fit reach out of the plenty population." } },
            { term: "Plagiarism", def: { eng: "Using someone else's work without giving credit.", pg: "Copy-copy. If Turnitin catch you, na carryover." } },
            { term: "Appendix", def: { eng: "Supplementary material added at the end (e.g., Questionnaire).", pg: "Extra documents wey you put for back back." } },
            { term: "Review", def: { eng: "Analyzing previous studies.", pg: "Checking wetin other guys don write." } },
            { term: "Variable", def: { eng: "Any factor that can change in an experiment.", pg: "Those things wey dey change inside your work." } }
        ]
    };

    // --- HELPER FUNCTION: Safe DOM Update ---
    const setText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
        else console.warn(`Element with ID '${id}' not found.`);
    };

    // --- RENDER FUNCTIONS ---
    
    // 1. Render Chapter List & Details
    const renderAnatomy = () => {
        const listContainer = document.getElementById('chapterList');
        const detailContainer = document.getElementById('chapterDetail');
        
        if (!listContainer || !detailContainer) return;

        listContainer.innerHTML = ''; // Clear previous
        
        contentData.chapters.forEach((ch, index) => {
            const li = document.createElement('a');
            li.className = `list-group-item list-group-item-action ${index === 0 ? 'active' : ''}`;
            li.innerHTML = `<div class="d-flex justify-content-between align-items-center"><span>${ch.title[currentLang]}</span><i class="fa-solid fa-chevron-right small"></i></div>`;
            li.onclick = () => {
                document.querySelectorAll('#chapterList .list-group-item').forEach(el => el.classList.remove('active'));
                li.classList.add('active');
                updateDetail(ch);
            };
            listContainer.appendChild(li);

            if (index === 0) updateDetail(ch);
        });

        function updateDetail(ch) {
            const subList = ch.subs[currentLang].map(s => `<li class="mb-2"><i class="fa-solid fa-check text-success me-2"></i>${s}</li>`).join('');
            detailContainer.innerHTML = `
                <h3 class="fw-800 mb-2 text-primary">${ch.title[currentLang]}</h3>
                <p class="text-muted border-bottom pb-3">${ch.desc[currentLang]}</p>
                <h6 class="fw-bold small text-uppercase text-secondary mb-3">Required Content:</h6>
                <ul class="list-unstyled text-muted small">${subList}</ul>
            `;
        }
    };

    // 2. Render Methodology
    const renderMethods = () => {
        const container = document.getElementById('methodContainer');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Update Headers
        setText('taroTitle', currentLang === 'eng' ? 'Taro Yamane Calc' : 'Taro Yamane Calculator');
        setText('taroSub', currentLang === 'eng' ? 'Calculate Sample Size' : 'Check how many people you need');
        setText('methodHeader', currentLang === 'eng' ? 'Choose Your Weapon (Methodology)' : 'Choose your pattern');

        // Create Cards
        let htmlContent = '';
        contentData.methods.forEach(m => {
            htmlContent += `
                <div class="col-md-6 col-lg-4">
                    <div class="method-card">
                        <div class="method-icon"><i class="fa-solid ${m.icon}"></i></div>
                        <h6 class="fw-bold">${m.title[currentLang]}</h6>
                        <p class="small text-muted mb-0">${m.desc[currentLang]}</p>
                    </div>
                </div>
            `;
        });
        container.innerHTML = htmlContent;
    };

    // 3. Render Survival
    const renderSurvival = () => {
        const s = contentData.survival;
        setText('protTitle', s.protTitle[currentLang]);
        setText('protDesc', s.protDesc[currentLang]);
        setText('scriptText', s.script[currentLang]);
        setText('slideTitle', s.slideTitle[currentLang]);
        setText('tipTitle', s.tipTitle[currentLang]);
        setText('tipText', s.tipText[currentLang]);

        const ul = document.getElementById('slideList');
        if (ul) {
            ul.innerHTML = s.list[currentLang].map(item => `<li><i class="fa-solid fa-file-powerpoint"></i> ${item}</li>`).join('');
        }
    };

    // 4. Render Vocab
    const renderVocab = (filter = '') => {
        const container = document.getElementById('glossaryContainer');
        if (!container) return;

        container.innerHTML = '';
        const filtered = contentData.glossary.filter(g => g.term.toLowerCase().includes(filter.toLowerCase()));
        
        let htmlContent = '';
        filtered.forEach(item => {
            htmlContent += `
                <div class="glossary-card-p">
                    <span class="term-title text-primary">${item.term}</span>
                    <p class="small text-muted mb-0">${item.def[currentLang]}</p>
                </div>
            `;
        });
        container.innerHTML = htmlContent;
    };

    // --- MAIN RENDER CONTROLLER ---
    const updateInterface = () => {
        console.log("Updating Interface to:", currentLang);

        // Header Text
        setText('headerTitle', contentData.headers.title[currentLang]);
        setText('headerSub', contentData.headers.sub[currentLang]);
        
        // Tab Labels
        setText('label-anatomy', contentData.tabs.anatomy[currentLang]);
        setText('label-method', contentData.tabs.method[currentLang]);
        setText('label-survival', contentData.tabs.survival[currentLang]);
        setText('label-vocab', contentData.tabs.vocab[currentLang]);

        // Run sub-functions
        renderAnatomy();
        renderMethods();
        renderSurvival();
        renderVocab();
    };

    // --- EVENT LISTENERS ---
    
    // Toggle Switch
    const toggle = document.getElementById('pidginToggle');
    if (toggle) {
        toggle.addEventListener('change', (e) => {
            currentLang = e.target.checked ? 'pg' : 'eng';
            document.body.classList.add('fade-transition');
            setTimeout(() => document.body.classList.remove('fade-transition'), 300);
            updateInterface();
        });
    }

    // Vocab Search
    const searchInput = document.getElementById('vocabSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => renderVocab(e.target.value));
    }

    // Taro Calculator Logic (Attached to window for HTML access)
    window.calculateTaro = () => {
        const N = parseFloat(document.getElementById('popInput').value);
        const e = parseFloat(document.getElementById('errorInput').value);
        
        if(!N || !e) {
            alert(currentLang === 'eng' ? "Please enter population value." : "Abeg enter numbers jare");
            return;
        }

        const n = N / (1 + (N * (e * e)));
        const resultDiv = document.getElementById('taroResult');
        const resultVal = document.getElementById('resultValue');
        
        if (resultDiv && resultVal) {
            resultDiv.classList.remove('d-none');
            resultVal.textContent = Math.ceil(n);
        }
    };

    // INITIALIZATION
    updateInterface(); 
});
// --- Feature 3: Taro Yamane Sync (Resource Page Side) ---
function calculateTaro() {
    const N = parseFloat(document.getElementById('popInput').value);
    const e = parseFloat(document.getElementById('errorInput').value);
    const resultDiv = document.getElementById('taroResult');
    const resultValue = document.getElementById('resultValue');

    if (!N || N <= 0) {
        alert("Please enter a valid population number.");
        return;
    }

    // Taro Yamane Formula: n = N / (1 + N(e^2))
    const n = N / (1 + N * Math.pow(e, 2));
    const roundedN = Math.ceil(n); // Always round up for sample sizes

    // 1. Display Result
    resultValue.innerText = roundedN;
    resultDiv.classList.remove('d-none');

    // 2. THE LINK: Save to methodology data
    const methodologyData = {
        sampleSize: roundedN,
        population: N,
        errorMargin: e * 100 + "%",
        calculatedAt: new Date().toLocaleString()
    };
    localStorage.setItem('gradmate_methodology_sync', JSON.stringify(methodologyData));

    // 3. UI Feedback
    const btn = event.target;
    const originalText = btn.innerText;
    btn.innerText = "✅ Sent to Project Hub";
    btn.classList.replace('btn-accent-gm', 'btn-success');
    
    setTimeout(() => {
        btn.innerText = originalText;
        btn.classList.replace('btn-success', 'btn-accent-gm');
    }, 3000);
}