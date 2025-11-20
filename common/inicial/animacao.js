function animateCounter(element, target, duration) {
    let startTime = null;
    const start = 0;

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);

        // Easing function: ease-out cubic (mais suave no final)
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        const value = Math.floor(easedProgress * (target - start) + start);

        // Formatar número com separador de milhares
        element.textContent = value.toLocaleString('pt-BR');

        if (progress < 1) {
            requestAnimationFrame(animation);
        }
    }

    requestAnimationFrame(animation);
}

function startCounters() {
    const counters = document.querySelectorAll('.counter');

    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        animateCounter(counter, target, 2500); // 2.5 segundos
    });
}

// Animar quando o elemento aparecer na tela (scroll)
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            startCounters();
            // Animar apenas uma vez
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.3 });