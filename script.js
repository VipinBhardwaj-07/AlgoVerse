(function () {
    'use strict';
    const $ = (s) => document.querySelector(s);
    const $$ = (s) => Array.from(document.querySelectorAll(s));
    function initMobileMenu() {
        const ham = $('#ham');
        const mob = $('#mobileMenu');
        const backdrop = $('#mobileMenuBackdrop');
        if (!ham || !mob) return;
        let scrollLockY = 0;
        function setMenu(open) {
            mob.classList.toggle('open', open);
            document.documentElement.classList.toggle('menu-open', open);
            ham.classList.toggle('open', open);
            if (backdrop) backdrop.classList.toggle('show', open);
            ham.setAttribute('aria-expanded', open ? 'true' : 'false');
            if (open) {
                scrollLockY = window.scrollY;
                document.body.style.position = 'fixed';
                document.body.style.top = `-${scrollLockY}px`;
                document.body.style.left = '0';
                document.body.style.right = '0';
                document.body.style.width = '100%';
            } else {
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.left = '';
                document.body.style.right = '';
                document.body.style.width = '';
                window.scrollTo(0, scrollLockY);
                resetMobileSearch();
                mob.querySelectorAll('.mobile-accordion.open').forEach(acc => acc.classList.remove('open'));
            }
        }
        ham.addEventListener('click', () => setMenu(!mob.classList.contains('open')));
        if (backdrop) backdrop.addEventListener('click', () => setMenu(false));
        mob.querySelectorAll('[data-accordion]').forEach(acc => {
            const toggle = acc.querySelector('.mobile-accordion-toggle');
            if (!toggle) return;
            toggle.addEventListener('click', () => {
                const isOpen = acc.classList.contains('open');
                mob.querySelectorAll('[data-accordion]').forEach(a => {
                    a.classList.remove('open');
                    const t = a.querySelector('.mobile-accordion-toggle');
                    if (t) t.setAttribute('aria-expanded', 'false');
                });
                if (!isOpen) { acc.classList.add('open'); toggle.setAttribute('aria-expanded', 'true'); }
            });
        });
        const searchInput = $('#mobileSearchInput');
        function resetMobileSearch() {
            if (!searchInput) return;
            searchInput.value = '';
            mob.querySelectorAll('.mobile-nav-list > a, .mobile-nav-list > .mobile-accordion, .mobile-accordion-panel a').forEach(el => {
                el.style.display = '';
            });
        }
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                const q = searchInput.value.trim().toLowerCase();
                mob.querySelectorAll('.mobile-nav-list > a').forEach(a => {
                    const text = a.textContent.toLowerCase();
                    a.style.display = (!q || text.includes(q)) ? '' : 'none';
                });
                mob.querySelectorAll('[data-accordion]').forEach(acc => {
                    const toggle = acc.querySelector('.mobile-accordion-toggle');
                    const toggleText = (toggle?.textContent || '').toLowerCase();
                    const panelLinks = Array.from(acc.querySelectorAll('.mobile-accordion-panel a'));
                    let anyChildMatch = false;
                    panelLinks.forEach(a => {
                        const match = !q || a.textContent.toLowerCase().includes(q);
                        a.style.display = match ? '' : 'none';
                        if (q && match) anyChildMatch = true;
                    });
                    const selfMatch = !q || toggleText.includes(q);
                    acc.style.display = (selfMatch || anyChildMatch) ? '' : 'none';
                    if (q && anyChildMatch) acc.classList.add('open');
                    else if (!q) acc.classList.remove('open');
                });
            });
        }
        $$('#mobileMenu a').forEach(a => {
            a.addEventListener('click', (e) => {
                const href = a.getAttribute('href') || '';
                setMenu(false);
                if (href.startsWith('#')) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        const y = target.getBoundingClientRect().top + window.scrollY - 90;
                        window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                }
            });
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mob.classList.contains('open')) setMenu(false);
        });
        document.addEventListener('click', (e) => {
            if (mob.classList.contains('open') && !mob.contains(e.target) && !ham.contains(e.target)) setMenu(false);
        });
        window.addEventListener('popstate', () => setMenu(false));
        window.addEventListener('resize', () => {
            if (window.innerWidth > 1024) setMenu(false);
        });
        window.addEventListener('orientationchange', () => setMenu(false));
        window.closeMobileMenu = () => setMenu(false);
    }
    function initMarquee() {
        const techs = [
            'Sorting Algorithms','Graph Theory','Dynamic Programming','Binary Search','Hash Maps','Trees & Tries',
            'Heaps','Greedy Algorithms','Backtracking','Bit Manipulation','Segment Trees','Union Find','String Matching',
            'Divide & Conquer','Sliding Window'
        ];
        const track = $('#marquee');
        if (!track) return;
        const doubled = [...techs, ...techs];
        track.innerHTML = doubled.map(t => `<span class="marquee-item">${t}</span>`).join('');
    }
    function initBackToTop() {
        const btt = $('#btt');
        if (!btt) return;
        window.addEventListener('scroll', () => btt.classList.toggle('show', window.scrollY > 400));
        btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
    function initScrollIndicator() {
        const indicator = $('#scrollIndicator');
        if (!indicator) return;
        function update() {
            indicator.classList.toggle('hide', window.scrollY > 120);
        }
        window.addEventListener('scroll', update, { passive: true });
        update();
    }
    function initScrollProgress() {
        const bar = $('#scrollProgress');
        if (!bar) return;
        function update() {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            bar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
        }
        window.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);
        update();
    }
    function initCarouselDots(gridSelector, dotsId) {
        const grid = document.querySelector(gridSelector);
        const dotsWrap = document.getElementById(dotsId);
        if (!grid || !dotsWrap) return;
        const cards = Array.from(grid.children);
        if (!cards.length) return;
        dotsWrap.innerHTML = cards.map((_, i) => `<span class="dot${i === 0 ? ' active' : ''}"></span>`).join('');
        const dots = Array.from(dotsWrap.children);
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio > 0.55) {
                    const idx = cards.indexOf(entry.target);
                    dots.forEach(d => d.classList.remove('active'));
                    if (dots[idx]) dots[idx].classList.add('active');
                }
            });
        }, { root: grid, threshold: [0.55] });
        cards.forEach(c => observer.observe(c));
        dots.forEach((d, i) => d.addEventListener('click', () => {
            cards[i].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }));
    }
    function initCountUp() {
        const nums = document.querySelectorAll('.stat-num[data-target]');
        if (!nums.length) return;
        function animate(el) {
            const target = parseInt(el.dataset.target, 10);
            const suffix = el.dataset.suffix || '';
            const dur = 1100;
            const start = performance.now();
            function step(now) {
                const p = Math.min((now - start) / dur, 1);
                const eased = 1 - Math.pow(1 - p, 3);
                const val = Math.round(eased * target);
                el.textContent = val + suffix;
                if (p < 1) requestAnimationFrame(step);
                else el.textContent = target + suffix;
            }
            requestAnimationFrame(step);
        }
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animate(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.4 });
        nums.forEach(n => observer.observe(n));
    }
    function autoInitCarousels(selector) {
        document.querySelectorAll(selector).forEach((grid) => {
            const cards = Array.from(grid.children);
            if (cards.length < 2) return;
            const dotsWrap = document.createElement('div');
            dotsWrap.className = 'carousel-dots';
            grid.insertAdjacentElement('afterend', dotsWrap);
            dotsWrap.innerHTML = cards.map((_, i) => `<span class="dot${i === 0 ? ' active' : ''}"></span>`).join('');
            const dots = Array.from(dotsWrap.children);
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && entry.intersectionRatio > 0.55) {
                        const idx = cards.indexOf(entry.target);
                        dots.forEach(d => d.classList.remove('active'));
                        if (dots[idx]) dots[idx].classList.add('active');
                    }
                });
            }, { root: grid, threshold: [0.55] });
            cards.forEach(c => observer.observe(c));
            dots.forEach((d, i) => d.addEventListener('click', () => {
                cards[i].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }));
        });
    }
    function initMobileStickyCta() {
        const bar = $('#mobileStickyCta');
        if (!bar) return;
        const footer = document.querySelector('footer');
        function update() {
            if (window.innerWidth > 768) { bar.classList.remove('show'); return; }
            const pastHero = window.scrollY > 500;
            const nearFooter = footer && footer.getBoundingClientRect().top < window.innerHeight;
            const menuOpen = $('#mobileMenu')?.classList.contains('open');
            bar.classList.toggle('show', pastHero && !nearFooter && !menuOpen);
        }
        window.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);
        document.addEventListener('click', () => setTimeout(update, 50));
        update();
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
    function initScrollAnimations() {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
        }, { threshold: 0.15 });
        $$('.fade-in').forEach(el => observer.observe(el));
    }
    function initNavbarShadow() {
        const nav = document.querySelector('nav'); // page uses a <nav>
        if (!nav) return;
        window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 40));
    }
    const EMAILJS_CONFIG = {
        PUBLIC_KEY: "KEoMvdAn-u03kvZs9",
        SERVICE_ID: "service_uymid52",
        TEMPLATE_ID: "template_1o28t8a",
        ADMIN_EMAIL: "officialalgoverse@gmail.com"
    };
    if (typeof emailjs !== 'undefined') emailjs.init({ publicKey: EMAILJS_CONFIG.PUBLIC_KEY });
    function sendContactForm() {
        if (typeof emailjs === 'undefined') { alert('Email service is not loaded.'); return; }
        const firstName = ($('#contactFirstName')?.value || '').trim();
        const lastName = ($('#contactLastName')?.value || '').trim();
        const email = ($('#contactEmail')?.value || '').trim();
        const message = ($('#contactMessage')?.value || '').trim();
        if (!firstName || !email || !message) { alert('Please fill all required fields.'); return; }
        emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, {
            from_name: `${firstName} ${lastName}`,
            from_email: email,
            message
        }).then(() => alert('Message sent successfully!'))
        .catch((err) => { console.error('Email send failed', err); alert('Failed to send message.'); });
    }
    window.sendContactForm = sendContactForm;
    function getUsers() {
        try { return JSON.parse(localStorage.getItem('algoVerseUsers') || '{}'); }
        catch (e) { console.error('Failed to read stored users', e); return {}; }
    }
    function saveUsers(users) { localStorage.setItem('algoVerseUsers', JSON.stringify(users)); }
    function showAuthMessage(message, type = 'error') {
        const el = $('#authMessage'); if (!el) return; el.textContent = message; el.classList.toggle('success', type === 'success');
    }
    function getProfileData(email) {
        try { return JSON.parse(localStorage.getItem('algoVerseProfile_' + email) || '{}'); }
        catch (e) { return {}; }
    }
    // One place that paints every piece of account UI (desktop nav, dropdown, mobile drawer)
    function paintAccountUI(email) {
        const loggedIn = !!email;
        const users = getUsers();
        const user = loggedIn ? (users[email] || {}) : {};
        const profile = loggedIn ? getProfileData(email) : {};
        const name = (profile.name || user.name || (email ? email.split('@')[0] : '') || 'User').trim();
        const first = name.split(/\s+/)[0];
        const initial = name.charAt(0).toUpperCase() || 'U';
        const img = profile.profileImage || '';
        const setText = (id, v) => { const el = $('#' + id); if (el) el.textContent = v; };

        const userBadge = $('#userBadge'), loginBtn = $('#loginBtn'), signupBtn = $('#signupBtn');
        if (userBadge) userBadge.style.display = loggedIn ? 'flex' : 'none';
        if (loginBtn) loginBtn.style.display = loggedIn ? 'none' : 'inline-flex';
        if (signupBtn) signupBtn.style.display = loggedIn ? 'none' : 'inline-flex';

        setText('userStatus', 'Hi, ' + first);
        setText('navUserEmail', email || 'Account');
        setText('navProfileInitial', initial);
        setText('dropdownUserName', name);
        setText('dropdownUserEmail', email || 'Account');
        setText('dropdownProfileInitial', initial);
        setText('mobileUserName', name);
        setText('mobileUserEmail', email || '');
        setText('mobileAvatarInitial', initial);

        [['dropdownProfileAvatar', 'dropdownProfileImage'], ['mobileAvatar', 'mobileAvatarImg'], ['profileTrigger', null]].forEach(([wrapId, imgId]) => {
            const wrap = $('#' + wrapId); if (!wrap || !imgId) return;
            const im = $('#' + imgId);
            if (img && im) { im.src = img; wrap.classList.add('has-image'); } else { if (im) im.removeAttribute('src'); wrap.classList.remove('has-image'); }
        });
        const navAvatar = document.querySelector('.profile-avatar');
        if (navAvatar) {
            if (img) { navAvatar.style.backgroundImage = 'url("' + img + '")'; navAvatar.classList.add('has-image'); }
            else { navAvatar.style.backgroundImage = ''; navAvatar.classList.remove('has-image'); }
        }

        const mobileAccount = $('#mobileAccount'), mLogin = $('#mobileLoginBtn'), mSignup = $('#mobileSignupBtn');
        if (mobileAccount) mobileAccount.hidden = !loggedIn;
        const mAuthWrap = document.querySelector('.mobile-menu-auth'); if (mAuthWrap) mAuthWrap.hidden = loggedIn;
        if (mLogin) mLogin.style.display = loggedIn ? 'none' : 'block';
        if (mSignup) mSignup.style.display = loggedIn ? 'none' : 'block';
    }
    window.refreshAccountUI = function () { paintAccountUI(localStorage.getItem('algoVerseCurrentUser')); };
    function syncMobileAuth() { paintAccountUI(localStorage.getItem('algoVerseCurrentUser')); }
    function setLoggedInUser(email) {
        const users = getUsers();
        if (!users[email]) return;
        localStorage.setItem('algoVerseCurrentUser', email);
        paintAccountUI(email);
    }
    function clearLoggedInUser() {
        localStorage.removeItem('algoVerseCurrentUser');
        paintAccountUI('');
    }
    function restoreLoggedInUser() {
        const currentEmail = localStorage.getItem('algoVerseCurrentUser');

        if (currentEmail) {
            setLoggedInUser(currentEmail);
        } else {
            syncMobileAuth();
        }
    }
    function handleAuthSubmit(e) {
        e.preventDefault(); const modal = $('#authModal'); if (!modal) return; const mode = modal.dataset.mode || 'login'; const name = ($('#authName')?.value || '').trim(); const email = ($('#authEmail')?.value || '').trim().toLowerCase(); const password = ($('#authPassword')?.value || '');
        if (!email || !password) { showAuthMessage('Please fill in both email and password.'); return; }
        const users = getUsers();
        if (mode === 'signup') {
            if (!name) { showAuthMessage('Please enter your full name to create an account.'); return; }
            if (users[email]) { showAuthMessage('This email is already registered. Try logging in.'); return; }
            users[email] = { name, password, createdAt: new Date().toISOString() }; saveUsers(users); setLoggedInUser(email); showAuthMessage(`Account created successfully. Welcome, ${name}!`, 'success'); setTimeout(closeAuthModal, 1000); return;
        }
        const user = users[email]; if (!user || user.password !== password) { showAuthMessage('Invalid email or password. Please try again.'); return; }
        setLoggedInUser(email); showAuthMessage(`Login successful. Welcome back, ${user.name}!`, 'success'); setTimeout(closeAuthModal, 1000);
    }
    function logoutUser() { clearLoggedInUser(); showAuthMessage('You have been logged out.', 'success'); }
    function openAuthModal(mode) {
        const modal = $('#authModal'); const title = $('#modalTitle'); const subtitle = $('#modalSubtitle'); const nameField = $('#nameFieldGroup'); const submitBtn = $('#modalSubmitBtn'); if (!modal) return;
        if (mode === 'signup') { if (title) title.innerHTML = 'Create your Algo<span>Verse</span> account'; if (subtitle) subtitle.innerText = 'Join 50k+ engineers mastering DSA today'; if (nameField) nameField.style.display = 'block'; if (submitBtn) submitBtn.innerText = 'Create Account →'; }
        else { if (title) title.innerHTML = 'Welcome back to Algo<span>Verse</span>'; if (subtitle) subtitle.innerText = 'Master your algorithmic skills'; if (nameField) nameField.style.display = 'none'; if (submitBtn) submitBtn.innerText = 'Sign In →'; }
        modal.dataset.mode = mode; modal.classList.add('show');
        // close mobile menu if open
        if (typeof window.closeMobileMenu === 'function') window.closeMobileMenu();
    }
    function closeAuthModal() { const modal = $('#authModal'); if (modal) { modal.classList.remove('show'); showAuthMessage(''); } }
    let activePaymentMethod = 'card';
    function setPaymentMethod(method) {
        activePaymentMethod = method;
        $$('.payment-method-btn').forEach(btn => btn.classList.toggle('active', btn.getAttribute('data-method') === method));
        $$('.payment-method-panel').forEach(panel => {
            const shouldShow = panel.id === `${method}Panel`;
            panel.hidden = !shouldShow;
        });
    }
    function openPaymentModal(planName = 'Pro Version', price = '$19 lifetime') {
        const modal = $('#paymentModal'); const planNameEl = $('#paymentPlanName'); const planPriceEl = $('#paymentPlanPrice'); const paymentMessage = $('#paymentMessage'); if (!modal || !planNameEl || !planPriceEl) return;
        planNameEl.textContent = planName;
        planPriceEl.textContent = price;
        if (paymentMessage) {
            paymentMessage.textContent = '';
            paymentMessage.classList.remove('success');
        }
        setPaymentMethod('card');
        const paymentForm = $('#paymentForm'); if (paymentForm) paymentForm.reset();
        modal.hidden = false;
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        if (typeof window.closeMobileMenu === 'function') window.closeMobileMenu();
    }
    function closePaymentModal() {
        const modal = $('#paymentModal'); const paymentMessage = $('#paymentMessage'); if (modal) {
            modal.classList.remove('show');
            modal.hidden = true;
        }
        if (paymentMessage) {
            paymentMessage.textContent = '';
            paymentMessage.classList.remove('success');
        }
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
    }
    async function processPayment() {
        const email = ($('#paymentEmail')?.value || '').trim();
        const paymentMessage = $('#paymentMessage');
        const submitBtn = $('.payment-submit');
        const planName = $('#paymentPlanName')?.textContent || 'Pro Version';
        const amount = $('#paymentPlanPrice')?.textContent || '$19 lifetime';
        if (!email) {
            if (paymentMessage) {
                paymentMessage.textContent = 'Please enter your email for the receipt.';
                paymentMessage.classList.remove('success');
            }
            return;
        }
        if (activePaymentMethod === 'card') {
            const cardNumber = ($('#cardNumber')?.value || '').replace(/\s+/g, '');
            const cardName = ($('#cardName')?.value || '').trim();
            const cardExpiry = ($('#cardExpiry')?.value || '').trim();
            const cardCvv = ($('#cardCvv')?.value || '').trim();
            if (!cardNumber || cardNumber.length < 12 || !cardName || !cardExpiry || !cardCvv) {
                if (paymentMessage) {
                    paymentMessage.textContent = 'Please complete your card details.';
                    paymentMessage.classList.remove('success');
                }
                return;
            }
        } else if (activePaymentMethod === 'upi') {
            const upiId = ($('#upiId')?.value || '').trim();
            if (!upiId) {
                if (paymentMessage) {
                    paymentMessage.textContent = 'Please enter your UPI ID.';
                    paymentMessage.classList.remove('success');
                }
                return;
            }
        } else {
            const walletId = ($('#walletId')?.value || '').trim();
            if (!walletId) {
                if (paymentMessage) {
                    paymentMessage.textContent = 'Please enter your wallet details.';
                    paymentMessage.classList.remove('success');
                }
                return;
            }
        }
        if (paymentMessage) {
            paymentMessage.textContent = 'Starting secure checkout…';
            paymentMessage.classList.remove('success');
        }
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Processing…';
        }
        try {
            const response = await fetch(`${BACKEND_URL}/create-checkout-session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan: planName, amount, email, paymentMethod: activePaymentMethod })
            });
            const data = await response.json().catch(() => null);
            if (!response.ok || !data?.url) {
                throw new Error(data?.error || 'Unable to start checkout.');
            }
            window.location.href = data.url;
        } catch (error) {
            if (paymentMessage) {
                paymentMessage.textContent = error.message || 'Checkout could not be started.';
                paymentMessage.classList.remove('success');
            }
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Pay $19 Now →';
            }
        }
    }
    window.openAuthModal = openAuthModal; window.closeAuthModal = closeAuthModal; window.logoutUser = logoutUser; window.openPaymentModal = openPaymentModal; window.closePaymentModal = closePaymentModal; window.processPayment = processPayment;
    function initAuth() { const authForm = $('#authForm'); if (authForm) authForm.addEventListener('submit', handleAuthSubmit); restoreLoggedInUser(); }
    function initPaymentFlow() {
        $$('.payment-method-btn').forEach(btn => {
            btn.addEventListener('click', () => setPaymentMethod(btn.getAttribute('data-method') || 'card'));
        });
    }
    const isLocalHost = (location.hostname === 'localhost' || location.hostname === '127.0.0.1');
    const isFileProtocol = location.protocol === 'file:';
    const BACKEND_URL = (isLocalHost || isFileProtocol) ? 'http://localhost:5000' : '/api';
    function initChatbot() {
        const chatBtn = $('#vera-chat-btn'); const chatBox = $('#vera-chat-box'); const closeBtn = $('#vera-close'); const sendBtn = $('#vera-send'); const voiceBtn = $('#vera-voice'); const input = $('#vera-input'); const messages = $('#vera-messages');
        if (!chatBtn || !chatBox) { console.warn('Chatbot elements not found'); return; }
        chatBtn.onclick = () => chatBox.style.display = 'flex'; if (closeBtn) closeBtn.onclick = () => chatBox.style.display = 'none';
        function addUserMessage(text) { if (!messages) return; const div = document.createElement('div'); div.className = 'vera-user'; div.innerText = text; messages.appendChild(div); messages.scrollTop = messages.scrollHeight; }
        function addBotMessage(text) { if (!messages) return; const div = document.createElement('div'); div.className = 'vera-bot'; div.innerText = text; messages.appendChild(div); messages.scrollTop = messages.scrollHeight; try { const speech = new SpeechSynthesisUtterance(text); speechSynthesis.speak(speech); } catch (e) { console.warn('TTS not available', e); } }
        async function sendMessage() {
            if (!input) return; const text = input.value.trim(); if (!text) return; addUserMessage(text); input.value = '';
            try {
                const response = await fetch(`${BACKEND_URL}/chat`, { method: 'POST', mode: 'cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text }) });
                const data = await response.json().catch(() => null);
                if (!response.ok) { const errorMessage = data?.error || response.statusText || 'Unknown error'; console.error('Chat API error', response.status, errorMessage, data); addBotMessage(`Sorry, Vera is unavailable: ${errorMessage}`); return; }
                if (data?.reply) addBotMessage(data.reply); else { console.error('Chat API returned no reply', data); addBotMessage("Sorry, I couldn't process that."); }
            } catch (err) { console.error('Chat error', err); addBotMessage("Sorry, I'm currently unavailable. Please check if the backend is running."); }
        }
        if (sendBtn) sendBtn.addEventListener('click', sendMessage); if (input) input.addEventListener('keypress', e => { if (e.key === 'Enter') sendMessage(); });
        if (voiceBtn && typeof (window.SpeechRecognition || window.webkitSpeechRecognition) !== 'undefined') {
            const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)(); recognition.lang = 'en-US'; voiceBtn.onclick = () => recognition.start();
            recognition.onresult = (ev) => { if (input) { input.value = ev.results[0][0].transcript; sendMessage(); } };
            recognition.onerror = (ev) => { console.error('Speech recognition error', ev.error); addBotMessage("Sorry, I couldn't hear that. Please try again."); };
        }
    }
    function init() {
        initMobileMenu(); initMarquee(); initBackToTop(); initMobileStickyCta(); initFAQ(); initScrollAnimations(); initNavbarShadow(); initAuth(); initPaymentFlow(); initChatbot();
        initScrollProgress(); initCountUp(); initScrollIndicator();
        initCarouselDots('.courses-grid', 'coursesDots');
        initCarouselDots('.testimonials-grid', 'testimonialsDots');
        autoInitCarousels('.features-grid');
        autoInitCarousels('.blog-grid');
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
    window.addEventListener('load', () => {
        const currentUser = localStorage.getItem('algoVerseCurrentUser');
        let seen = false;
        try { seen = sessionStorage.getItem('algoVerseAuthPrompted') === '1'; } catch (e) {}
        if (!currentUser && !seen) {
            try { sessionStorage.setItem('algoVerseAuthPrompted', '1'); } catch (e) {}
            setTimeout(() => openAuthModal('signup'), 800);
        }
    });
    window.openVideoDemo = function () { const videoModal = $('#videoModal'); const demoVideo = $('#demoVideo'); if (!videoModal || !demoVideo) return; videoModal.hidden = false; videoModal.classList.add('show'); demoVideo.currentTime = 0; demoVideo.play().catch(() => {}); };
    window.closeVideoDemo = function () { const videoModal = $('#videoModal'); const demoVideo = $('#demoVideo'); if (!videoModal || !demoVideo) return; demoVideo.pause(); videoModal.classList.remove('show'); videoModal.hidden = true; };
})();



/* =====================================================
   ALGOVERSE PROFILE DROPDOWN
   ===================================================== */

document.addEventListener('DOMContentLoaded', function () {
    const profileWrapper = document.getElementById('userBadge');
    const profileTrigger = document.getElementById('profileTrigger');
    const profileDropdown = document.getElementById('profileDropdown');

    if (!profileWrapper || !profileTrigger || !profileDropdown) {
        return;
    }

    profileTrigger.addEventListener('click', function (event) {
        event.stopPropagation();

        const isOpen = profileWrapper.classList.contains('open');

        profileWrapper.classList.toggle('open', !isOpen);
        profileTrigger.setAttribute('aria-expanded', String(!isOpen));
    });

    document.addEventListener('click', function (event) {
        if (!profileWrapper.contains(event.target)) {
            profileWrapper.classList.remove('open');
            profileTrigger.setAttribute('aria-expanded', 'false');
        }
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            profileWrapper.classList.remove('open');
            profileTrigger.setAttribute('aria-expanded', 'false');
        }
    });

    profileDropdown.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            profileWrapper.classList.remove('open');
            profileTrigger.setAttribute('aria-expanded', 'false');
        });
    });
});

/* =====================================================
   HERO BACKGROUND — live algorithm animation
   A drifting graph runs breadth-first search (click anywhere in the
   hero to start it from the nearest node) while bubble sort plays
   along the bottom edge. Pauses off-screen / in background tabs.
   ===================================================== */
(function () {
    'use strict';
    var hero = document.getElementById('hero');
    var wrap = document.getElementById('auroraVideoWrap');
    var cv = document.getElementById('heroCanvas');
    if (!hero || !wrap || !cv || !cv.getContext) return;
    var ctx = cv.getContext('2d');
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var TEAL = '0,229,192', VIO = '124,92,252';

    var W = 0, H = 0, mobile = false, running = false, raf = 0, last = 0;
    var nodes = [], link = 150, trav = null, nextTravAt = 0;
    var mouse = { x: -9999, y: -9999, on: false };
    var bars = null;

    function rnd(a, b) { return a + Math.random() * (b - a); }

    function resize() {
        var r = wrap.getBoundingClientRect();
        W = Math.max(1, r.width); H = Math.max(1, r.height);
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        mobile = W < 720;
        link = mobile ? 105 : 150;
        buildNodes(); buildBars(); trav = null; nextTravAt = 0;
        if (!running) draw(performance.now());
    }

    function buildNodes() {
        var count = mobile ? 22 : Math.max(24, Math.min(58, Math.round(W * H / 24000)));
        var x0 = mobile ? 0.04 : 0.36;
        nodes = [];
        for (var i = 0; i < count; i++) {
            nodes.push({
                x: rnd(x0, 0.97) * W, y: rnd(0.07, 0.8) * H,
                vx: rnd(-0.16, 0.16), vy: rnd(-0.16, 0.16), r: rnd(1.8, 3.2)
            });
        }
    }

    /* ---------- bubble sort strip ---------- */
    function buildBars() {
        var n = mobile ? 16 : Math.max(18, Math.min(40, Math.round(W / 46)));
        bars = { n: n, a: [], i: 0, j: 0, ca: -1, cb: -1, acc: 0, wait: 0, done: false };
        resetBars();
    }
    function resetBars() {
        var n = bars.n, a = [];
        for (var k = 1; k <= n; k++) a.push(k);
        for (var m = n - 1; m > 0; m--) { var q = Math.floor(Math.random() * (m + 1)); var t = a[m]; a[m] = a[q]; a[q] = t; }
        bars.a = a; bars.i = 0; bars.j = 0; bars.ca = bars.cb = -1; bars.done = false; bars.wait = 0;
    }
    function stepBars() {
        var b = bars, a = b.a, n = b.n;
        if (b.i >= n - 1) { b.done = true; b.ca = b.cb = -1; b.wait = 1600; return; }
        b.ca = b.j; b.cb = b.j + 1;
        if (a[b.j] > a[b.j + 1]) { var t = a[b.j]; a[b.j] = a[b.j + 1]; a[b.j + 1] = t; }
        b.j++;
        if (b.j >= n - 1 - b.i) { b.j = 0; b.i++; }
    }
    function updateBars(dt) {
        var b = bars;
        if (b.done) { b.wait -= dt; if (b.wait <= 0) resetBars(); return; }
        b.acc += dt * (mobile ? 0.05 : 0.11);
        var guard = 0;
        while (b.acc >= 1 && guard++ < 8) { b.acc -= 1; stepBars(); if (b.done) break; }
    }
    function drawBars(now) {
        var b = bars, n = b.n, pad = mobile ? 16 : 40;
        var slot = (W - pad * 2) / n, bw = slot * 0.62;
        var maxH = H * (mobile ? 0.09 : 0.15), base = H - (mobile ? 18 : 22);
        var sortedFrom = b.done ? 0 : n - b.i;
        var flash = b.done ? 0.5 + 0.5 * Math.sin(now / 160) : 0;
        for (var k = 0; k < n; k++) {
            var h = (b.a[k] / n) * maxH + 4, x = pad + k * slot + (slot - bw) / 2, col;
            if (b.done) col = 'rgba(' + TEAL + ',' + (0.3 + flash * 0.35) + ')';
            else if (k === b.ca || k === b.cb) col = 'rgba(' + TEAL + ',0.85)';
            else if (k >= sortedFrom) col = 'rgba(' + TEAL + ',0.3)';
            else col = 'rgba(' + VIO + ',0.28)';
            ctx.fillStyle = col;
            ctx.fillRect(x, base - h, bw, h);
        }
    }

    /* ---------- BFS across the drifting graph ---------- */
    function startTrav(start, now) {
        var n = nodes.length, adj = [], i, j;
        for (i = 0; i < n; i++) adj.push([]);
        for (i = 0; i < n; i++) for (j = i + 1; j < n; j++) {
            var dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
            if (dx * dx + dy * dy < link * link) { adj[i].push(j); adj[j].push(i); }
        }
        var level = new Array(n), parent = new Array(n), q = [start], head = 0, maxL = 0;
        for (i = 0; i < n; i++) { level[i] = -1; parent[i] = -1; }
        level[start] = 0;
        while (head < q.length) {
            var u = q[head++];
            for (var k = 0; k < adj[u].length; k++) {
                var v = adj[u][k];
                if (level[v] < 0) { level[v] = level[u] + 1; parent[v] = u; if (level[v] > maxL) maxL = level[v]; q.push(v); }
            }
        }
        var lvlMs = 300;
        trav = { start: start, t0: now, lvlMs: lvlMs, level: level, parent: parent, end: now + (maxL + 1) * lvlMs + 2400 };
    }
    function pickStart(x, y) {
        var best = -1, bd = 1e12;
        for (var i = 0; i < nodes.length; i++) {
            var dx = nodes[i].x - x, dy = nodes[i].y - y, d = dx * dx + dy * dy;
            if (d < bd) { bd = d; best = i; }
        }
        return best;
    }

    function update(dt) {
        var i, nd, step = dt / 16.7;
        for (i = 0; i < nodes.length; i++) {
            nd = nodes[i];
            nd.x += nd.vx * step; nd.y += nd.vy * step;
            var minX = (mobile ? 0.02 : 0.32) * W, maxX = W * 0.99, minY = H * 0.05, maxY = H * 0.82;
            if (nd.x < minX || nd.x > maxX) { nd.vx *= -1; nd.x = Math.max(minX, Math.min(maxX, nd.x)); }
            if (nd.y < minY || nd.y > maxY) { nd.vy *= -1; nd.y = Math.max(minY, Math.min(maxY, nd.y)); }
            if (mouse.on) {
                var dx = nd.x - mouse.x, dy = nd.y - mouse.y, d2 = dx * dx + dy * dy;
                if (d2 < 130 * 130 && d2 > 1) { var d = Math.sqrt(d2), f = (1 - d / 130) * 0.5 * step; nd.x += dx / d * f; nd.y += dy / d * f; }
            }
        }
        updateBars(dt);
    }

    function draw(now) {
        ctx.clearRect(0, 0, W, H);
        var i, j, n = nodes.length, mAlpha = mobile ? 0.7 : 1;
        ctx.globalAlpha = mAlpha;
        /* ambient edges */
        ctx.lineWidth = 1;
        for (i = 0; i < n; i++) for (j = i + 1; j < n; j++) {
            var dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y, d2 = dx * dx + dy * dy;
            if (d2 < link * link) {
                ctx.strokeStyle = 'rgba(' + VIO + ',' + ((1 - Math.sqrt(d2) / link) * 0.22).toFixed(3) + ')';
                ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
            }
        }
        /* cursor links */
        if (mouse.on) {
            for (i = 0; i < n; i++) {
                var mx = nodes[i].x - mouse.x, my = nodes[i].y - mouse.y, md = Math.sqrt(mx * mx + my * my);
                if (md < 160) {
                    ctx.strokeStyle = 'rgba(' + TEAL + ',' + ((1 - md / 160) * 0.35).toFixed(3) + ')';
                    ctx.beginPath(); ctx.moveTo(mouse.x, mouse.y); ctx.lineTo(nodes[i].x, nodes[i].y); ctx.stroke();
                }
            }
        }
        /* BFS wave */
        var glow = new Array(n);
        for (i = 0; i < n; i++) glow[i] = 0;
        if (trav) {
            ctx.lineWidth = 1.6;
            for (i = 0; i < n; i++) {
                var lv = trav.level[i]; if (lv < 0) continue;
                var age = now - (trav.t0 + lv * trav.lvlMs); if (age < 0) continue;
                glow[i] = Math.max(0, 1 - age / 2300);
                var p = trav.parent[i];
                if (p >= 0) {
                    var prog = Math.min(1, age / 240), a = Math.max(0, 0.9 - age / 2600);
                    if (a > 0) {
                        ctx.strokeStyle = 'rgba(' + TEAL + ',' + a.toFixed(3) + ')';
                        ctx.beginPath(); ctx.moveTo(nodes[p].x, nodes[p].y);
                        ctx.lineTo(nodes[p].x + (nodes[i].x - nodes[p].x) * prog, nodes[p].y + (nodes[i].y - nodes[p].y) * prog);
                        ctx.stroke();
                    }
                }
            }
        }
        /* nodes */
        for (i = 0; i < n; i++) {
            var nd = nodes[i], g = glow[i];
            if (g > 0.01) {
                var rad = nd.r + 4 + g * 14, grad = ctx.createRadialGradient(nd.x, nd.y, 0, nd.x, nd.y, rad);
                grad.addColorStop(0, 'rgba(' + TEAL + ',' + (0.55 * g).toFixed(3) + ')');
                grad.addColorStop(1, 'rgba(' + TEAL + ',0)');
                ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(nd.x, nd.y, rad, 0, 6.2832); ctx.fill();
            }
            ctx.fillStyle = g > 0.05 ? 'rgba(' + TEAL + ',' + (0.55 + g * 0.45).toFixed(3) + ')' : 'rgba(' + VIO + ',0.6)';
            ctx.beginPath(); ctx.arc(nd.x, nd.y, nd.r + g * 1.6, 0, 6.2832); ctx.fill();
        }
        if (trav) { /* start-node ring */
            var s = nodes[trav.start], ra = (now - trav.t0) / 900;
            if (s && ra < 1) {
                ctx.strokeStyle = 'rgba(' + TEAL + ',' + (0.6 * (1 - ra)).toFixed(3) + ')'; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.arc(s.x, s.y, 6 + ra * 26, 0, 6.2832); ctx.stroke();
            }
        }
        ctx.globalAlpha = 1;
        drawBars(now);
    }

    function frame(now) {
        if (!running) return;
        var dt = Math.min(50, now - (last || now)); last = now;
        if (!trav && now >= nextTravAt) startTrav(Math.floor(Math.random() * nodes.length), now);
        else if (trav && now > trav.end) { trav = null; nextTravAt = now + 600; }
        update(dt); draw(now);
        raf = requestAnimationFrame(frame);
    }
    function start() { if (running || reduce) return; running = true; last = 0; raf = requestAnimationFrame(frame); }
    function stop() { running = false; cancelAnimationFrame(raf); }

    /* interaction (desktop pointer only) */
    if (window.matchMedia && window.matchMedia('(hover: hover)').matches && !reduce) {
        hero.addEventListener('mousemove', function (e) {
            var r = wrap.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.on = true;
        });
        hero.addEventListener('mouseleave', function () { mouse.on = false; });
        hero.addEventListener('click', function (e) {
            if (e.target.closest('a, button')) return;
            var r = wrap.getBoundingClientRect();
            startTrav(pickStart(e.clientX - r.left, e.clientY - r.top), performance.now());
        });
    }

    resize();
    if (reduce) { startTrav(Math.floor(nodes.length / 2), performance.now() - 1400); draw(performance.now()); }
    var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(resize, 150); });
    if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (en) { en[0].isIntersecting && !document.hidden ? start() : stop(); }, { threshold: 0 }).observe(hero);
    } else { start(); }
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
})();
