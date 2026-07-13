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
            }
        }
        ham.addEventListener('click', () => setMenu(!mob.classList.contains('open')));
        if (backdrop) backdrop.addEventListener('click', () => setMenu(false));
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
    function setLoggedInUser(email) {
        const users = getUsers(); const user = users[email]; if (!user) return; localStorage.setItem('algoVerseCurrentUser', email);
        const userBadge = $('#userBadge'); const userStatus = $('#userStatus'); const loginBtn = $('#loginBtn'); const signupBtn = $('#signupBtn');
        if (userBadge && userStatus && loginBtn && signupBtn) {
            userStatus.textContent = `Hi, ${user.name}`; userBadge.style.display = 'flex'; loginBtn.style.display = 'none'; signupBtn.style.display = 'none';
        }
    }
    function clearLoggedInUser() { localStorage.removeItem('algoVerseCurrentUser'); const userBadge = $('#userBadge'); const loginBtn = $('#loginBtn'); const signupBtn = $('#signupBtn'); if (userBadge && loginBtn && signupBtn) { userBadge.style.display = 'none'; loginBtn.style.display = 'inline-flex'; signupBtn.style.display = 'inline-flex'; } }
    function restoreLoggedInUser() { const currentEmail = localStorage.getItem('algoVerseCurrentUser'); if (currentEmail) setLoggedInUser(currentEmail); }
    function handleAuthSubmit(e) {
        e.preventDefault(); const modal = $('#authModal'); if (!modal) return; const mode = modal.dataset.mode || 'login'; const name = ($('#authName')?.value || '').trim(); const email = ($('#authEmail')?.value || '').trim().toLowerCase(); const password = ($('#authPassword')?.value || '');
        if (!email || !password) { showAuthMessage('Please fill in both email and password.'); return; }
        const users = getUsers();
        if (mode === 'signup') {
            if (!name) { showAuthMessage('Please enter your full name to create an account.'); return; }
            if (users[email]) { showAuthMessage('This email is already registered. Try logging in.'); return; }
            users[email] = { name, password }; saveUsers(users); setLoggedInUser(email); showAuthMessage(`Account created successfully. Welcome, ${name}!`, 'success'); setTimeout(closeAuthModal, 1000); return;
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
        initMobileMenu(); initMarquee(); initBackToTop(); initFAQ(); initScrollAnimations(); initNavbarShadow(); initAuth(); initPaymentFlow(); initChatbot();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
    window.addEventListener('load', () => {
        const currentUser = localStorage.getItem('algoVerseCurrentUser');
        if (!currentUser) setTimeout(() => openAuthModal('signup'), 800);
    });
    window.openVideoDemo = function () { const videoModal = $('#videoModal'); const demoVideo = $('#demoVideo'); if (!videoModal || !demoVideo) return; videoModal.hidden = false; videoModal.classList.add('show'); demoVideo.currentTime = 0; demoVideo.play().catch(() => {}); };
    window.closeVideoDemo = function () { const videoModal = $('#videoModal'); const demoVideo = $('#demoVideo'); if (!videoModal || !demoVideo) return; demoVideo.pause(); videoModal.classList.remove('show'); videoModal.hidden = true; };
})();