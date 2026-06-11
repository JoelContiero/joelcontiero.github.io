/* ==========================================================================
   JOEL CONTIERO — PORTFOLIO INTERAKTIVITÄT
   Bewusst schlank: Navigation, Mobile-Menü (barrierefrei), Scroll-Reveal
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ===== NAVBAR: SCROLL-ZUSTAND & AKTIVER LINK =====
    const nav = document.querySelector('nav');
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('main section[id]');

    const handleScrollEffects = () => {
        nav.classList.toggle('scrolled', window.scrollY > 40);

        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + section.offsetHeight) {
                currentSectionId = section.id;
            }
        });

        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${currentSectionId}`);
        });
    };

    window.addEventListener('scroll', handleScrollEffects, { passive: true });
    handleScrollEffects();

    // ===== MOBILE-MENÜ (mit aria-expanded, Escape & Fokus-Rückgabe) =====
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');

    const setMenuOpen = (open) => {
        hamburger.classList.toggle('open', open);
        mobileMenu.classList.toggle('open', open);
        hamburger.setAttribute('aria-expanded', String(open));
        hamburger.setAttribute('aria-label', open ? 'Menü schliessen' : 'Menü öffnen');
        document.body.style.overflow = open ? 'hidden' : '';
        if (open) {
            mobileMenu.removeAttribute('hidden');
        } else {
            // hidden erst nach der Ausblend-Transition setzen
            setTimeout(() => {
                if (!mobileMenu.classList.contains('open')) {
                    mobileMenu.setAttribute('hidden', '');
                }
            }, 300);
        }
    };

    if (hamburger && mobileMenu) {
        // Menü ist per CSS unsichtbar; hidden-Attribut nur als No-JS-Fallback
        mobileMenu.removeAttribute('hidden');
        mobileMenu.classList.remove('open');

        hamburger.addEventListener('click', () => {
            setMenuOpen(!mobileMenu.classList.contains('open'));
        });

        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => setMenuOpen(false));
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
                setMenuOpen(false);
                hamburger.focus();
            }
        });
    }

    // Bewusst kein Scroll-Reveal: Inhalte sind immer sichtbar — auch in
    // Full-Page-Screenshots, PDF-Exporten, beim Drucken und ohne JavaScript.
});
