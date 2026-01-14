document.addEventListener('DOMContentLoaded', () => {
    
    // Initialize Animations
    AOS.init({
        duration: 1000,
        once: true,
        easing: 'ease-out-quad'
    });

    // Navbar scroll background change
    const nav = document.getElementById('mainNav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // Subtle Tilt effect for cards
    const cards = document.querySelectorAll('.glass-card, .bento-item');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) translateY(0)`;
        });
    });

    // Mock Defense Simulator Text Rotation
    const defenseQuestions = [
        "How does your design account for the voltage fluctuations common in the Nigerian power grid?",
        "What is the significance of your sample size in Chapter 3?",
        "How did you handle the limitations encountered during data collection?",
        "In your opinion, how can this research be commercialized in the Nigerian market?"
    ];

    let questionIndex = 0;
    const questionElement = document.querySelector('.ui-body h5');
    
    if(questionElement) {
        setInterval(() => {
            questionIndex = (questionIndex + 1) % defenseQuestions.length;
            questionElement.style.opacity = 0;
            setTimeout(() => {
                questionElement.innerText = `"${defenseQuestions[questionIndex]}"`;
                questionElement.style.opacity = 1;
            }, 500);
        }, 5000);
    }
});

