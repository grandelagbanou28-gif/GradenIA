// ========================================
// Graden IA - Premium JavaScript
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });

    // Mobile nav toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            navToggle.classList.toggle('active');
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
    }

    // Fade-in animations on scroll
    const fadeElements = document.querySelectorAll('.feature-card, .tech-item, .models-table-wrapper, .hero-code');

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                fadeObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeElements.forEach(el => {
        el.classList.add('fade-in');
        fadeObserver.observe(el);
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Copy code block on click
    document.querySelectorAll('.hero-code pre, .doc-content pre').forEach(block => {
        block.style.cursor = 'pointer';
        block.title = 'Cliquer pour copier';

        block.addEventListener('click', () => {
            const code = block.querySelector('code');
            if (code) {
                navigator.clipboard.writeText(code.textContent).then(() => {
                    const originalText = block.title;
                    block.title = 'Copie !';
                    block.style.opacity = '0.7';
                    setTimeout(() => {
                        block.title = originalText;
                        block.style.opacity = '1';
                    }, 1500);
                });
            }
        });
    });

    // Active nav link based on current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Typing effect for hero code (optional)
    const heroCode = document.querySelector('.hero-code code');
    if (heroCode && window.innerWidth > 768) {
        const text = heroCode.innerHTML;
        heroCode.style.opacity = '0';
        setTimeout(() => {
            heroCode.style.opacity = '1';
            heroCode.style.transition = 'opacity 0.5s ease';
        }, 500);
    }

    // Table row hover effect
    document.querySelectorAll('.models-table tbody tr').forEach(row => {
        row.addEventListener('mouseenter', () => {
            row.style.transform = 'scale(1.01)';
            row.style.transition = 'transform 0.2s ease';
        });
        row.addEventListener('mouseleave', () => {
            row.style.transform = 'scale(1)';
        });
    });

    // Feature card stagger animation
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.1}s`;
    });

    // Tech item stagger animation
    const techItems = document.querySelectorAll('.tech-item');
    techItems.forEach((item, index) => {
        item.style.transitionDelay = `${index * 0.05}s`;
    });

    console.log('%c Graden IA', 'font-size: 24px; font-weight: bold; color: #2563eb;');
    console.log('%cAssistant IA personnel intelligent', 'font-size: 12px; color: #64748b;');
});
