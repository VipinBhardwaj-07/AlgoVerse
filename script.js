(function () {
    'use strict';
    const $ = (s) => document.querySelector(s);
    const $$ = (s) => Array.from(document.querySelectorAll(s));

    function initMobileMenu() {
        const ham = $('#ham');
        const mob = $('#mobileMenu');
        const backdrop = $('#mobileMenuBackdrop');
        if (!ham || !mob) return;

        function setMenu(open) {
            mob.classList.toggle('open', open);
            ham.classList.toggle('open', open);
            if (backdrop) backdrop.classList.toggle('show', open);
            ham.setAttribute('aria-expanded', open ? 'true' : 'false');
        }

        ham.addEventListener('click', () => setMenu(!mob.classList.contains('open')));
        if (backdrop) backdrop.addEventListener('click', () => setMenu(false));

        $$('#mobileMenu a, .mobile-sub-nav a').forEach(a => {
            a.addEventListener('click', (e) => {
                const href = a.getAttribute('href') || '';
                setMenu(false);
                if (href.startsWith('#')) {
                    e.preventDefault();
                    const target = $(href);
                    if (target) {
                        const y = target.getBoundingClientRect().top + window.scrollY - 130;
                        window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                }
            });
        });
    }

    function initMarquee() {
        const techs = [
            'Sorting Algorithms','Graph Theory','Dynamic Programming','Binary Search','Hash Maps','Trees & Tries',
            'Heaps','Greedy Algorithms','Backtracking','Bit Manipulation','Segment Trees'
        ];
        const track = $('#marquee');
        if (!track) return;
        const doubled = [...techs, ...techs];
        track.innerHTML = doubled.map(t => `<span class="marquee-item">${t}</span>`).join('');
    }

    function initBackToTop() {
        const btt = $('#btt');
        if (!btt) return;
        window.addEventListener('scroll', () => btt.style.display = window.scrollY > 400 ? 'block' : 'none');
        btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    function initFAQ() {
        $$('.faq-q').forEach(btn => {
            btn.addEventListener('click', () => {
                const item = btn.parentElement;
                const alreadyOpen = item.classList.contains('open');
                $$('.faq-item').forEach(i => i.classList.remove('open'));
                if (!alreadyOpen) item.classList.add('open');
            });
        });
    }

    function initChatbot() {
        const chatBtn = $('#vera-chat-btn'); const chatBox = $('#vera-chat-box'); const closeBtn = $('#vera-close'); const sendBtn = $('#vera-send'); const input = $('#vera-input'); const messages = $('#vera-messages');
        if (!chatBtn || !chatBox) return;
        chatBtn.onclick = () => chatBox.style.display = chatBox.style.display === 'flex' ? 'none' : 'flex';
        if (closeBtn) closeBtn.onclick = () => chatBox.style.display = 'none';
        
        function addMsg(text, isUser) {
            if (!messages) return;
            const div = document.createElement('div');
            div.className = isUser ? 'vera-user' : 'vera-bot';
            div.innerText = text;
            messages.appendChild(div);
            messages.scrollTop = messages.scrollHeight;
        }

        async function send() {
            const txt = input.value.trim(); if (!txt) return;
            addMsg(txt, true); input.value = '';
            setTimeout(() => addMsg("Thanks for your message! Our system support engineers are reviewing your query.", false), 800);
        }
        if (sendBtn) sendBtn.onclick = send;
        if (input) input.onkeypress = (e) => { if (e.key === 'Enter') send(); };
    }

    // Modal Operations Definitions
    function openAuthModal(mode) {
        const modal = $('#authModal'); const title = $('#modalTitle'); const nameField = $('#nameFieldGroup');
        if (!modal) return;
        if (mode === 'signup') { if (title) title.innerText = 'Create Account'; if (nameField) nameField.style.display = 'block'; }
        else { if (title) title.innerText = 'Welcome Back'; if (nameField) nameField.style.display = 'none'; }
        modal.classList.add('show');
    }
    function closeAuthModal() { $('#authModal')?.classList.remove('show'); }
    function openPaymentModal() { $('#paymentModal').hidden = false; $('#paymentModal').classList.add('show'); }
    function closePaymentModal() { $('#paymentModal').classList.remove('show'); $('#paymentModal').hidden = true; }
    function openVideoDemo() { $('#videoModal').hidden = false; $('#videoModal').classList.add('show'); $('#demoVideo')?.play().catch(()=>{}); }
    function closeVideoDemo() { $('#videoModal').classList.remove('show'); $('#videoModal').hidden = true; $('#demoVideo')?.pause(); }

    window.openAuthModal = openAuthModal; window.closeAuthModal = closeAuthModal;
    window.openPaymentModal = openPaymentModal; window.closePaymentModal = closePaymentModal;
    window.openVideoDemo = openVideoDemo; window.closeVideoDemo = closeVideoDemo;

    function init() {
        initMobileMenu(); initMarquee(); initBackToTop(); initFAQ(); initChatbot();
    }
    document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();