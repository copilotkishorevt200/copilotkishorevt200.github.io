document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 2. Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('bg-black/90', 'backdrop-blur-xl', 'border-white/10', 'h-20', 'shadow-[0_10px_30px_rgba(0,0,0,0.5)]');
            navbar.classList.remove('bg-transparent', 'border-transparent', 'h-24');
        } else {
            navbar.classList.add('bg-transparent', 'border-transparent', 'h-24');
            navbar.classList.remove('bg-black/90', 'backdrop-blur-xl', 'border-white/10', 'h-20', 'shadow-[0_10px_30px_rgba(0,0,0,0.5)]');
        }
    });

    // 3. Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');
    const closeIcon = document.getElementById('close-icon');

    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
        menuIcon.classList.toggle('hidden');
        closeIcon.classList.toggle('hidden');
    });

    // Close mobile menu on link click
    const mobileLinks = document.querySelectorAll('.mobile-link');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
            menuIcon.classList.remove('hidden');
            closeIcon.classList.add('hidden');
        });
    });

    // 4. Contact Form Submission Handling
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            const message = document.getElementById('message').value;

            const text = `Name: ${name}%0APhone: ${phone}%0AMessage: ${message}`;
            window.open(`https://wa.me/919677711992?text=${text}`, '_blank');
            contactForm.reset();
        });
    }

    // 5. Scroll Reveal Animations (Intersection Observer)
    const revealElements = document.querySelectorAll('.js-reveal');

    const revealOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            const target = entry.target;
            const delay = target.getAttribute('data-delay') || 0;

            setTimeout(() => {
                // Remove pre-animation classes
                target.classList.remove('opacity-0');
                // Check which direction to remove based on what exists
                target.classList.remove('-translate-x-5', 'translate-x-8', '-translate-x-8', 'translate-y-10', 'translate-y-8', 'translate-y-5', 'scale-95');

                // Add completion classes
                target.classList.add('opacity-100', 'translate-y-0', 'translate-x-0', 'scale-100');
            }, parseInt(delay));

            observer.unobserve(target);
        });
    }, revealOptions);

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // 6. Set current year in footer
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
});
