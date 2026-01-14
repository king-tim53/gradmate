document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize AOS Animations
    AOS.init({
        duration: 800,
        once: true,
        offset: 50
    });

    // 2. Add slight tilt effect to cards on mousemove (Optional cool effect)
    const cards = document.querySelectorAll('.info-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Subtle spotlight effect using CSS custom properties
            card.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.8), rgba(255,255,255,0.95))`;
        });

        card.addEventListener('mouseleave', () => {
            // Reset background
            card.style.background = 'var(--glass-bg)';
        });
    });

    console.log("GradMate Info Module Loaded");
});