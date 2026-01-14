document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. DATA DEFINITIONS (MOCK DATABASE)
       ========================================================================== */

    // Objective 1: SIWES Approved Courses
    const siwesCourses = [
        { "name": "Computer Science", "faculty": "Sciences" },
        { "name": "Biochemistry", "faculty": "Sciences" },
        { "name": "Microbiology", "faculty": "Sciences" },
        { "name": "Industrial Chemistry", "faculty": "Sciences" },
        { "name": "Geology", "faculty": "Sciences" },
        { "name": "Physics with Electronics", "faculty": "Sciences" },
        { "name": "Civil Engineering", "faculty": "Engineering" },
        { "name": "Mechanical Engineering", "faculty": "Engineering" },
        { "name": "Electrical/Electronic Engineering", "faculty": "Engineering" },
        { "name": "Chemical Engineering", "faculty": "Engineering" },
        { "name": "Agricultural Engineering", "faculty": "Engineering" },
        { "name": "Petroleum Engineering", "faculty": "Engineering" },
        { "name": "Mining Engineering", "faculty": "Engineering" },
        { "name": "Metallurgical Engineering", "faculty": "Engineering" },
        { "name": "Polymer & Textile Engineering", "faculty": "Engineering" },
        { "name": "Architecture", "faculty": "Environmental" },
        { "name": "Estate Management", "faculty": "Environmental" },
        { "name": "Quantity Surveying", "faculty": "Environmental" },
        { "name": "Urban & Regional Planning", "faculty": "Environmental" },
        { "name": "Building Technology", "faculty": "Environmental" },
        { "name": "Agriculture", "faculty": "Agriculture" },
        { "name": "Food Science & Technology", "faculty": "Agriculture" },
        { "name": "Animal Science", "faculty": "Agriculture" },
        { "name": "Crop & Soil Science", "faculty": "Agriculture" },
        { "name": "Forestry", "faculty": "Agriculture" },
        { "name": "Fisheries", "faculty": "Agriculture" },
        { "name": "Mass Communication", "faculty": "Arts/Social Sciences" },
        { "name": "Economics", "faculty": "Arts/Social Sciences" },
        { "name": "Sociology", "faculty": "Arts/Social Sciences" },
        { "name": "Library & Information Science", "faculty": "Education" },
        { "name": "Business Education", "faculty": "Education" },
        { "name": "Technical Education", "faculty": "Education" },
        { "name": "Pharmacy", "faculty": "Medical" },
        { "name": "Nursing", "faculty": "Medical" },
        { "name": "Medical Laboratory Science", "faculty": "Medical" }
    ];

    // Objective 2: Industry Mappings
    let industryMappings = [
        { program: "Computer Science", businesses: ["Software Development Companies", "Telecommunication Firms (MTN, Airtel, Glo)", "Banks (IT Departments)", "Internet Service Providers", "Data Centers", "Cybersecurity Firms"] },
        { program: "Biochemistry", businesses: ["Pharmaceutical Companies", "Food & Beverage Industries (Nestle, Coca-Cola)", "Medical Research Institutes", "Quality Control Laboratories", "Hospitals (Lab Departments)"] },
        { program: "Microbiology", businesses: ["Pharmaceutical Companies", "Breweries", "Food Processing Plants", "Medical Research Institutes", "Environmental Health Agencies"] },
        { program: "Industrial Chemistry", businesses: ["Paint & Chemical Manufacturing Firms", "Petrochemical Companies", "Food Processing Industries", "Textile & Polymer Industries", "Quality Assurance Labs"] },
        { program: "Geology", businesses: ["Oil Exploration Companies (NNPC, Shell, Chevron)", "Mining Corporations", "Water Resources Agencies", "Geological Survey Departments", "Environmental Consulting Firms"] },
        { program: "Physics with Electronics", businesses: ["Electronics Manufacturing Firms", "Telecommunication Companies", "Power Generation & Distribution Companies", "Research Institutes", "Broadcasting Stations (Technical Units)"] },
        { program: "Civil Engineering", businesses: ["Construction Companies (Julius Berger, Cappa & D’Alberto)", "Ministry of Works", "State Water Corporations", "Highway Authorities", "Structural Consulting Firms"] },
        { program: "Mechanical Engineering", businesses: ["Automobile Assembly Plants", "Manufacturing Industries", "Oil & Gas Servicing Firms", "Maintenance Departments", "Industrial Equipment Companies"] },
        { program: "Electrical/Electronic Engineering", businesses: ["Power Distribution Companies (DisCos)", "Electrical Contracting Firms", "Telecommunication Companies", "Manufacturing Plants (Electrical Maintenance)", "Broadcasting Stations (Technical Units)"] },
        { program: "Chemical Engineering", businesses: ["Petrochemical Industries", "Refineries", "Food & Beverage Companies", "Pharmaceutical Manufacturing", "Water Treatment Plants"] },
        { program: "Agricultural Engineering", businesses: ["Agricultural Equipment Companies", "Irrigation Projects", "Food Processing Plants", "Research Institutes", "Government Agricultural Agencies"] },
        { program: "Petroleum Engineering", businesses: ["Oil Exploration Companies", "Refineries", "Petrochemical Industries", "Oilfield Service Firms", "Energy Consulting Firms"] },
        { program: "Mining Engineering", businesses: ["Mining Corporations", "Quarry Companies", "Geological Survey Departments", "Cement Industries", "Mineral Exploration Firms"] },
        { program: "Metallurgical Engineering", businesses: ["Steel Manufacturing Companies", "Foundries", "Automobile Industries", "Mining Corporations", "Research Institutes"] },
        { program: "Polymer & Textile Engineering", businesses: ["Textile Industries", "Plastic Manufacturing Firms", "Rubber Processing Companies", "Paint & Chemical Industries", "Research Institutes"] },
        { program: "Architecture", businesses: ["Architectural Firms", "Construction Sites", "Ministry of Housing", "Real Estate Development Companies", "Urban Development Authorities"] },
        { program: "Estate Management", businesses: ["Real Estate Firms", "Property Development Companies", "Government Housing Corporations", "Facility Management Firms", "Mortgage Institutions"] },
        { program: "Quantity Surveying", businesses: ["Construction Companies", "Cost Consulting Firms", "Government Works Departments", "Project Management Firms", "Real Estate Developers"] },
        { program: "Urban & Regional Planning", businesses: ["Town Planning Authorities", "Ministry of Urban Development", "Environmental Agencies", "Construction & Infrastructure Firms", "Consulting Firms"] },
        { program: "Building Technology", businesses: ["Construction Companies", "Building Materials Firms", "Government Works Departments", "Facility Management Firms", "Real Estate Developers"] },
        { program: "Agriculture", businesses: ["Commercial Farms", "Food Processing Plants", "Agricultural Research Institutes", "Government Agricultural Agencies", "Export/Import Firms (Agro Products)"] },
        { program: "Food Science & Technology", businesses: ["Food & Beverage Companies", "Quality Control Departments", "Packaging Industries", "Research Institutes", "Export/Import Agencies (Food Products)"] },
        { program: "Animal Science", businesses: ["Livestock Farms", "Feed Mills", "Veterinary Clinics", "Research Institutes", "Food Processing Plants"] },
        { program: "Crop & Soil Science", businesses: ["Agricultural Research Institutes", "Commercial Farms", "Government Agricultural Agencies", "Soil Testing Labs", "Fertilizer Companies"] },
        { program: "Forestry", businesses: ["Forestry Research Institutes", "Timber Companies", "Environmental Agencies", "Wildlife Conservation Projects", "Government Forestry Departments"] },
        { program: "Fisheries", businesses: ["Fish Farms", "Aquaculture Companies", "Food Processing Plants", "Research Institutes", "Government Fisheries Departments"] },
        { program: "Mass Communication", businesses: ["Radio & TV Stations", "Newspaper Publishing Houses", "Advertising Agencies", "Public Relations Firms", "Corporate Communications Departments"] },
        { program: "Economics", businesses: ["Banks", "Government Ministries (Finance, Budget)", "Research Institutes", "Consulting Firms", "NGOs (Economic Development Projects)"] },
        { program: "Sociology", businesses: ["Social Research Institutes", "NGOs", "Government Social Welfare Departments", "Community Development Agencies", "Corporate HR Departments"] },
        { program: "Library & Information Science", businesses: ["University Libraries", "Public Libraries", "Corporate Knowledge Centers", "Information Management Firms", "Archives & Records Offices"] },
        { program: "Business Education", businesses: ["Corporate Administrative Departments", "Banks (Operations & Customer Service)", "Accountancy/Consulting Firms (Training/Admin)", "SMEs (Office Management & Records)", "Government Ministries (Admin & Records)"] },
        { program: "Technical Education", businesses: ["Technical Colleges (Workshop Units)", "TVET Centers (NBTE-affiliated)", "Industrial Training Departments (Manufacturing)", "Educational Technology Units (MoE/State SUBEB)", "Apprenticeship & Skills Development Centers"] },
        { program: "Pharmacy", businesses: ["Pharmaceutical Companies", "Hospitals (Pharmacy Departments)", "Drug Research Institutes", "Community Pharmacies", "Regulatory Agencies (NAFDAC)"] },
        { program: "Nursing", businesses: ["Hospitals", "Primary Health Centers", "Public Health Agencies", "NGOs in Healthcare", "Community Clinics"] },
        { program: "Medical Laboratory Science", businesses: ["Hospitals (Lab Departments)", "Diagnostic Centers", "Medical Research Institutes", "Public Health Agencies", "Private Laboratories"] }
    ];

    // Objective 3: Glossary Terms
    const glossaryTerms = [
        { term: "Logbook", def: "A weekly record of activities kept by the student during the IT period." },
        { term: "Form 8", def: "End of Programme Report Sheet submitted to the ITF." },
        { term: "SPE-1", def: "Student Commencement Form sent to ITF immediately upon resumption." },
        { term: "Industry Supervisor", def: "The staff at your workplace assigned to mentor you." },
        { term: "Institution Supervisor", def: "Lecturer from your school who visits to grade you." },
        { term: "Siwes Coordinator", def: "Head of the SIWES unit in your university." },
        { term: "Defense", def: "Oral presentation of your technical report." },
        { term: "Allowance", def: "Stipend paid by ITF (subject to federal funding)." },
        { term: "Scaf Form", def: "Student Commencement Attachment Form (to be mailed to ITF)." },
        { term: "ITF", def: "Industrial Training Fund - the body regulating SIWES in Nigeria." }
    ];

    // Objective 3: FAQ Data
    const faqs = [
        { q: "How long is SIWES for Engineering students?", a: "Typically 6 months (24 weeks), usually during the second semester of 400 Level." },
        { q: "Do I get paid during SIWES?", a: "Some companies pay a monthly stipend. ITF also pays a bulk allowance after completion, but this can take time." },
        { q: "What should I wear to my SIWES workplace?", a: "Dress corporately or according to the company's safety dress code (e.g., PPE for factories)." },
        { q: "What happens if I lose my Logbook?", a: "Report immediately to your school's SIWES unit. You may need to buy a replacement and rewrite entries." },
        { q: "Can I do my SIWES in a different state?", a: "Yes, as long as the company is relevant to your course and you can fund your accommodation." },
        { q: "What is the deadline for submitting Form 8?", a: "Usually within 2 weeks of completing your training." },
        { q: "Do I have to write a report?", a: "Yes, a Technical Report detailing your experience is required for grading." },
        { q: "How is SIWES graded?", a: "It carries roughly 6-15 units depending on your school. Grading is based on Logbook, Supervisor score, and Defense." },
        { q: "Can I change my placement after starting?", a: "Only with official permission from your school's SIWES unit, and usually only for safety/rejection reasons." },
        { q: "What is the Scaf Form?", a: "Student Commencement Attachment Form. Must be mailed to ITF area office closest to your workplace." },
        { q: "Does ITF visit students?", a: "Yes, ITF officials do random checks to ensure students are actually at their duty posts." },
        { q: "What if my company doesn't have a stamp?", a: "You must insist on an official signature or letterhead validation for your forms." },
        { q: "Can I do SIWES in a family business?", a: "Generally discouraged unless it is a structured, registered company relevant to your field." },
        { q: "Is SIWES compulsory?", a: "Yes, it is a graduation requirement for approved courses." },
        { q: "Where can I get the Logbook?", a: "It is provided by your University's SIWES directorate." }
    ];

    /* ==========================================================================
       2. UI RENDERING FUNCTIONS
       ========================================================================== */

    // Render Courses (Objective 1)
    function renderCourses(filterText = '') {
        const container = document.getElementById('courseListContainer');
        if (!container) return;
        container.innerHTML = '';
        
        const filtered = siwesCourses.filter(c => c.name.toLowerCase().includes(filterText.toLowerCase()));

        if (filtered.length === 0) {
            container.innerHTML = `<div class="col-12 text-center text-muted mt-4">No approved course found matching "${filterText}".</div>`;
            return;
        }

        filtered.forEach(course => {
            let icon = 'fa-book';
            if(course.faculty === 'Engineering') icon = 'fa-gears';
            if(course.faculty === 'Sciences') icon = 'fa-flask';
            if(course.faculty === 'Agriculture') icon = 'fa-wheat-awn';
            if(course.faculty === 'Environmental') icon = 'fa-city';

            container.insertAdjacentHTML('beforeend', `
                <div class="col-6 col-md-4 col-lg-3">
                    <div class="course-card">
                        <div class="course-icon"><i class="fa-solid ${icon}"></i></div>
                        <h6 class="fw-bold mb-1">${course.name}</h6>
                        <span class="badge bg-light text-secondary border">${course.faculty}</span>
                        <div class="mt-2 text-success small"><i class="fa-solid fa-check-circle"></i> Approved</div>
                    </div>
                </div>
            `);
        });
    }

    // Render Industry Accordion (Objective 2)
    function renderIndustries(filterText = '') {
        const container = document.getElementById('industryAccordion');
        if (!container) return;
        container.innerHTML = '';

        const filtered = industryMappings.filter(item => item.program.toLowerCase().includes(filterText.toLowerCase()));

        if (filtered.length === 0) {
            container.innerHTML = `<div class="text-center text-muted mt-4">No suggestions found. Try adding it!</div>`;
            return;
        }

        filtered.forEach((item, index) => {
            const businessList = item.businesses.map(b => `<li>${b}</li>`).join('');
            container.insertAdjacentHTML('beforeend', `
                <div class="accordion-item mb-2 border rounded overflow-hidden">
                    <h2 class="accordion-header">
                        <button class="accordion-button ${index !== 0 ? 'collapsed' : ''}" type="button" data-bs-toggle="collapse" data-bs-target="#ind-${index}">
                            <span class="fw-bold text-dark">${item.program}</span>
                        </button>
                    </h2>
                    <div id="ind-${index}" class="accordion-collapse collapse ${index === 0 ? 'show' : ''}" data-bs-parent="#industryAccordion">
                        <div class="accordion-body bg-light">
                            <h6 class="text-muted small text-uppercase mb-2">Recommended Business Lines:</h6>
                            <ul class="mb-0 ps-3">${businessList}</ul>
                        </div>
                    </div>
                </div>
            `);
        });
    }

    // Helper: Glossary Icons
    function getTermIcon(term) {
        const t = term.toLowerCase();
        if(t.includes('logbook')) return 'fa-book-journal-whills';
        if(t.includes('form') || t.includes('spe')) return 'fa-file-signature';
        if(t.includes('supervisor')) return 'fa-user-tie';
        if(t.includes('defense')) return 'fa-chalkboard-user';
        if(t.includes('allowance')) return 'fa-naira-sign';
        if(t.includes('coordinator')) return 'fa-user-gear';
        if(t.includes('scaf')) return 'fa-paper-plane';
        if(t.includes('itf')) return 'fa-building-columns';
        return 'fa-lightbulb';
    }

    // Render Glossary Neon Cards (Objective 3)
    function renderGlossary(filterText = '') {
        const container = document.getElementById('glossaryContainer');
        if (!container) return;
        container.innerHTML = '';
        
        const filtered = glossaryTerms.filter(g => g.term.toLowerCase().includes(filterText.toLowerCase()));

        if (filtered.length === 0) {
            container.innerHTML = `<div class="col-12 text-center py-5"><p class="text-muted">No terms found matching "${filterText}"</p></div>`;
            return;
        }

        filtered.forEach((item, index) => {
            const delay = index * 0.1;
            const iconClass = getTermIcon(item.term);
            container.insertAdjacentHTML('beforeend', `
                <div class="animate-glossary-entry" style="animation-delay: ${delay}s;">
                    <div class="glossary-card">
                        <div class="d-flex justify-content-between align-items-start">
                            <div class="glossary-icon"><i class="fa-solid ${iconClass}"></i></div>
                            <div class="spinner-grow text-primary" style="width: 8px; height: 8px; opacity: 0.5;" role="status"></div>
                        </div>
                        <h6>${item.term}</h6>
                        <p>${item.def}</p>
                    </div>
                </div>
            `);
        });
    }

    // Render FAQs (Objective 3)
    function renderFAQs() {
        const container = document.getElementById('faqAccordion');
        if (!container) return;
        faqs.forEach((item, index) => {
            container.insertAdjacentHTML('beforeend', `
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq${index}">
                            ${item.q}
                        </button>
                    </h2>
                    <div id="faq${index}" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                        <div class="accordion-body text-muted small">${item.a}</div>
                    </div>
                </div>
            `);
        });
    }

    /* ==========================================================================
       3. EVENT LISTENERS & INITIALIZATION
       ========================================================================== */

    // Course Search Listener
    const courseSearch = document.getElementById('courseSearch');
    if (courseSearch) {
        courseSearch.addEventListener('input', (e) => renderCourses(e.target.value));
    }

    // Industry Search Listener
    const industrySearch = document.getElementById('industrySearch');
    if (industrySearch) {
        industrySearch.addEventListener('input', (e) => renderIndustries(e.target.value));
    }

    // Glossary Search Listener
    const glossarySearch = document.getElementById('glossarySearch');
    if (glossarySearch) {
        glossarySearch.addEventListener('input', (e) => renderGlossary(e.target.value));
    }

    // Add Industry Form Submission
    const addIndustryForm = document.getElementById('addIndustryForm');
    if(addIndustryForm) {
        addIndustryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const programName = document.getElementById('newProgramName').value;
            const businessLines = document.getElementById('newBusinessLines').value.split(',').map(s => s.trim());

            industryMappings.unshift({ program: programName, businesses: businessLines });
            renderIndustries();
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('addIndustryModal'));
            modal.hide();
            addIndustryForm.reset();
        });
    }

    // Initialization Calls
    renderCourses();
    renderIndustries();
    renderGlossary();
    renderFAQs();

});
// Auto-activate Sidebar links
function activateSidebar() {
    const currentPage = window.location.pathname.split("/").pop();
    const navIds = {
        'dashboard.html': 'nav-dashboard',
        'siwes.html': 'nav-siwes',
        'resoS.html': 'nav-resources'
    };

    const activeId = navIds[currentPage];
    if (activeId) {
        const element = document.getElementById(activeId);
        if (element) element.classList.add('active');
    }
}

// Call this inside your document.addEventListener('DOMContentLoaded', ...)