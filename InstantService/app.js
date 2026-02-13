// DOM Elements
const app = document.getElementById('app');
const chatRoot = document.getElementById('chat-root');

// State
let state = {
    currentPage: 'home',
    params: {},
    user: null,

    searchQuery: '',
    selectedCategory: 'All',

    isChatOpen: false,
    chatMessages: [
        { sender: 'bot', text: "Hi there! I'm your AI assistant. How can I help you today?" }
    ],

    showLoginModal: false,
    showRegisterModal: false,

    loginStep: 'input',
    tempLoginData: null,

    generatedOTP: null,   // ✅ Added OTP storage

    currentBooking: null
};

// Routing
const users = [
    {
        id: 1,
        name: "Admin User",
        email: "admin@speedyserve.com",
        mobile: "9999999999",
        password: "admin123", // In a real app, this would be hashed
        role: "admin"
    },
    {
        id: 2,
        name: "John Doe",
        email: "john@example.com",
        mobile: "9876543210",
        password: "password123",
        role: "user"
    },
    {
        id: 3,
        name: "Jane Smith",
        email: "jane@provider.com",
        mobile: "9123456780",
        password: "service123",
        role: "provider"
    }
];

let currentUser = null; // Replaces mockUser
const routes = {
    home: renderHome,
    services: renderServices,
    booking: renderBooking,
    confirmation: renderConfirmation,
    profile: renderProfile
};

function navigate(page, params = {}) {
    state.currentPage = page;
    state.params = params;
    renderApp();
    window.scrollTo(0, 0);
    if (page === 'booking') {
        setTimeout(initializeMap, 100); // Initialize map after render
    }
}

// Render Functions

function renderApp() {
    app.innerHTML = routes[state.currentPage]() + renderFooter() + renderAuthModals();
    // Re-attach event listeners if needed (not needed for inline onclicks)
}

// ===============================
// EMAIL OTP CONFIG (REAL)
// ===============================

const EMAILJS_SERVICE_ID = "service_1udxn5c";
const EMAILJS_TEMPLATE_ID = "template_t37g3gu";

// Send OTP Email Function
function sendOTPEmail(toEmail, otpCode) {
    return emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        to_email: toEmail,
        otp: otpCode
    });
}

function renderChat() {
    const chatClass = state.isChatOpen ? 'open' : '';
    // Only render if changed? No, simple re-render is fine for this scale, 
    // but to preserve focus we need to be careful.
    // Actually, since we only re-render chat on chat events, focus management is easier.

    chatRoot.innerHTML = `
        <div class="ai-chatbot">
            <div class="chat-window ${chatClass}" id="chat-window-el">
                <div class="chat-header">
                    <span>AI Assistant</span>
                    <button onclick="toggleChat()" style="color: white; background: transparent;"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <div class="chat-body" id="chat-body">
                    ${state.chatMessages.map(msg => `
                        <div class="chat-message ${msg.sender === 'user' ? 'user-message' : 'bot-message'}">
                            ${msg.text}
                        </div>
                    `).join('')}
                    ${state.isTyping ? `<div class="chat-message bot-message" style="font-style: italic; color: #6b7280;">AI is typing...</div>` : ''}
                </div>
                <div class="chat-input-area">
                    <input type="text" id="chat-input" placeholder="Type a message..." onkeypress="handleChatKey(event)" autocomplete="off">
                    <button onclick="sendChatMessage()"><i class="fa-solid fa-paper-plane"></i></button>
                </div>
            </div>
            <div class="chat-toggle ${state.isChatOpen ? 'hidden' : ''}" onclick="toggleChat()">
                <i class="fa-solid fa-robot"></i>
            </div>
        </div>
    `;

    // Restore scroll
    const chatBody = document.getElementById('chat-body');
    if (chatBody) chatBody.scrollTop = chatBody.scrollHeight;

    // Restore Focus if input exists and chat is open
    const input = document.getElementById('chat-input');
    if (input && state.isChatOpen && !state.isTyping) {
        input.focus();
    }
}

// Components that return HTML strings

function renderHeader() {
    return `
        <header>
            <div class="container flex justify-between items-center">
                <a href="#" onclick="navigate('home'); return false;" class="flex items-center gap-2" style="text-decoration: none;">
                    <i class="fa-solid fa-bolt" style="font-size: 1.5rem; color: var(--primary-color);"></i>
                    <span style="font-weight: 800; font-size: 1.5rem; letter-spacing: -0.025em; color: var(--text-primary);">Speedy<span style="color: var(--primary-color);">Serve</span></span>
                </a>
                <nav class="flex gap-4 items-center">
                    <a href="#" onclick="navigate('home'); return false;" class="nav-link ${state.currentPage === 'home' ? 'active' : ''}">Home</a>
                    <a href="#" onclick="navigate('services'); return false;" class="nav-link ${state.currentPage === 'services' ? 'active' : ''}">Services</a>
                    ${state.user
            ? `<div class="flex items-center gap-4">
                               <a href="#" onclick="navigate('profile'); return false;" class="nav-link ${state.currentPage === 'profile' ? 'active' : ''}">
                                    <i class="fa-solid fa-user"></i> ${state.user.name.split(' ')[0]}
                               </a>
                               <button onclick="logout()" class="btn btn-secondary" style="padding: 0.5rem 1rem;">Logout</button>
                           </div>`
            : `<button onclick="openLogin()" class="btn btn-primary" style="padding: 0.5rem 1rem;">Login</button>`
        }
                </nav>
            </div>
        </header>
    `;
}

function renderFooter() {
    return `
        <footer style="background: #111827; color: white; padding: 4rem 1rem 2rem; margin-top: auto; border-top: 1px solid #374151;">
            <div class="container">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 3rem; margin-bottom: 3rem;">
                    
                    <!-- Brand Section -->
                    <div>
                        <div class="flex items-center gap-2 mb-4" style="color: white;">
                            <i class="fa-solid fa-bolt" style="font-size: 1.5rem; color: var(--primary-color);"></i>
                            <span style="font-weight: 800; font-size: 1.5rem; letter-spacing: -0.025em;">Speedy<span style="color: var(--primary-color);">Serve</span></span>
                        </div>
                        <p style="color: #9CA3AF; line-height: 1.6; margin-bottom: 1.5rem;">
                            Your trusted partner for home services. We connect you with verified professionals for a hassle-free experience.
                        </p>
                        <div class="flex gap-4">
                            <a href="#" style="width: 36px; height: 36px; background: #374151; display: flex; align-items: center; justify-content: center; border-radius: 50%; color: white; transition: 0.2s;" onmouseover="this.style.background='var(--primary-color)'" onmouseout="this.style.background='#374151'">
                                <i class="fa-brands fa-twitter"></i>
                            </a>
                            <a href="#" style="width: 36px; height: 36px; background: #374151; display: flex; align-items: center; justify-content: center; border-radius: 50%; color: white; transition: 0.2s;" onmouseover="this.style.background='var(--primary-color)'" onmouseout="this.style.background='#374151'">
                                <i class="fa-brands fa-instagram"></i>
                            </a>
                            <a href="#" style="width: 36px; height: 36px; background: #374151; display: flex; align-items: center; justify-content: center; border-radius: 50%; color: white; transition: 0.2s;" onmouseover="this.style.background='var(--primary-color)'" onmouseout="this.style.background='#374151'">
                                <i class="fa-brands fa-linkedin-in"></i>
                            </a>
                        </div>
                    </div>

                    <!-- Contact Details -->
                    <div>
                        <h3 style="font-size: 1.1rem; font-weight: 600; margin-bottom: 1.5rem; color: #F3F4F6;">Contact Us</h3>
                        <ul style="list-style: none; padding: 0; display: flex; flex-direction: column; gap: 1rem;">
                            <li style="display: flex; gap: 1rem; align-items: flex-start; color: #D1D5DB;">
                                <i class="fa-solid fa-location-dot" style="color: var(--primary-color); margin-top: 0.25rem;"></i>
                                <span>Code Covenant HQ<br>Tech Park, India</span>
                            </li>
                            <li>
                                <a href="tel:+919518233887" style="display: flex; gap: 1rem; align-items: center; color: #D1D5DB; transition: 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#D1D5DB'">
                                    <i class="fa-solid fa-phone" style="color: var(--primary-color);"></i>
                                    <span>+91 9518233887</span>
                                </a>
                            </li>
                            <li>
                                <a href="mailto:gokulchawla0905@gmail.com" style="display: flex; gap: 1rem; align-items: center; color: #D1D5DB; transition: 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#D1D5DB'">
                                    <i class="fa-solid fa-envelope" style="color: var(--primary-color);"></i>
                                    <span>gokulchawla0905@gmail.com</span>
                                </a>
                            </li>
                            <li>
                                <a href="tel:+918629023046" style="display: flex; gap: 1rem; align-items: center; color: #D1D5DB; transition: 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#D1D5DB'">
                                    <i class="fa-solid fa-headset" style="color: var(--primary-color);"></i>
                                    <span>Customer Care: +91 8629023046</span>
                                </a>
                            </li>
                        </ul>
                    </div>

                    <!-- Quick Links -->
                    <div>
                        <h3 style="font-size: 1.1rem; font-weight: 600; margin-bottom: 1.5rem; color: #F3F4F6;">Quick Links</h3>
                        <ul style="list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.75rem;">
                            <li><a href="#" onclick="navigate('home'); return false;" style="color: #9CA3AF; transition: 0.2s;" onmouseover="this.style.color='var(--primary-color)'" onmouseout="this.style.color='#9CA3AF'">Home</a></li>
                            <li><a href="#" onclick="navigate('services'); return false;" style="color: #9CA3AF; transition: 0.2s;" onmouseover="this.style.color='var(--primary-color)'" onmouseout="this.style.color='#9CA3AF'">Find Professionals</a></li>
                            <li><a href="#" onclick="navigate('services'); return false;" style="color: #9CA3AF; transition: 0.2s;" onmouseover="this.style.color='var(--primary-color)'" onmouseout="this.style.color='#9CA3AF'">Become a Partner</a></li>
                            <li><a href="#" style="color: #9CA3AF; transition: 0.2s;" onmouseover="this.style.color='var(--primary-color)'" onmouseout="this.style.color='#9CA3AF'">Privacy Policy</a></li>
                        </ul>
                    </div>
                </div>

                <div style="border-top: 1px solid #374151; padding-top: 2rem; text-align: center;">
                    <p style="color: #6B7280; font-size: 0.875rem;">
                        &copy; 2026 SpeedyServe. Proudly built and owned by <strong style="color: #E5E7EB;">Team Code Covenant</strong>.
                    </p>
                </div>
            </div>
        </footer>
    `;
}

function renderAuthModals() {
    if (!state.showLoginModal && !state.showRegisterModal) return '';

    return `
        <div class="modal-overlay open" onclick="if(event.target === this) closeAuthModals()">
            <div class="modal-content animate-fade-in">
                <div class="flex justify-between items-center mb-4">
                    <h2 style="font-size: 1.5rem; font-weight: 700;">${state.showLoginModal ? 'Welcome Back' : 'Create Account'}</h2>
                    <button onclick="closeAuthModals()" style="font-size: 1.5rem; color: var(--text-secondary);">&times;</button>
                </div>
                
                ${state.showLoginModal ? renderLoginForm() : renderRegisterForm()}
            </div>
        </div>
    `;
}

function renderLoginForm() {
    if (state.loginStep === 'otp') {
        return `
            <form onsubmit="handleVerifyOTP(event)">
                <div class="flex flex-col gap-4">
                    <div style="text-align: center; margin-bottom: 1rem;">
                        <p style="color: var(--text-secondary);">Enter the 4-digit OTP sent to</p>
                        <p style="font-weight: 600;">${state.tempLoginData}</p>
                    </div>
                    <div>
                        <label class="block mb-2 font-medium">OTP Code</label>
                        <input type="text" name="otp" required class="input-field" placeholder="1234" maxlength="4" style="letter-spacing: 0.5rem; text-align: center; font-size: 1.25rem;">
                    </div>
                    <button type="submit" class="btn btn-primary w-full" style="width: 100%; padding: 0.75rem;">Verify & Login</button>
                    <div class="text-center mt-2">
                        <button type="button" onclick="state.loginStep = 'input'; renderApp();" style="color: var(--text-secondary); font-size: 0.9rem; text-decoration: underline;">Change ID</button>
                    </div>
                </div>
            </form>
        `;
    }

    return `
        <form onsubmit="handleLogin(event)">
            <div class="flex flex-col gap-4">
                <div>
                    <label class="block mb-2 font-medium">Email or Mobile Number</label>
                    <input type="text" name="identifier" required class="input-field" placeholder="john@example.com or 9876543210">
                </div>
                <button type="submit" class="btn btn-primary w-full" style="width: 100%; padding: 0.75rem;">Send OTP</button>
                <div style="text-align: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
                    <p style="color: var(--text-secondary);">Don't have an account? <a href="#" onclick="openRegister(); return false;" style="color: var(--primary-color); font-weight: 600;">Sign Up</a></p>
                </div>
            </div>
        </form>
    `;
}

function renderRegisterForm() {
    return `
        <form onsubmit="handleRegister(event)">
            <div class="flex flex-col gap-4">
                <div>
                    <label class="block mb-2 font-medium">Full Name</label>
                    <input type="text" name="name" required class="input-field" placeholder="John Doe">
                </div>
                <div>
                    <label class="block mb-2 font-medium">Email</label>
                    <input type="email" name="email" required class="input-field" placeholder="john@example.com">
                </div>
                <div>
                    <label class="block mb-2 font-medium">Password</label>
                    <input type="password" name="password" required class="input-field" placeholder="Create a strong password">
                </div>
                <div>
                    <label class="block mb-2 font-medium">I want to join as:</label>
                    <select name="role" class="input-field">
                        <option value="user">Customer (I want to book services)</option>
                        <option value="provider">Service Provider (I want to offer services)</option>
                    </select>
                </div>
                <button type="submit" class="btn btn-primary w-full" style="width: 100%; padding: 0.75rem;">Create Account</button>
                 <div style="text-align: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
                    <p style="color: var(--text-secondary);">Already have an account? <a href="#" onclick="openLogin(); return false;" style="color: var(--primary-color); font-weight: 600;">Login</a></p>
                </div>
            </div>
        </form>
    `;
}

// Category Icons Mapping
const categoryIcons = {
    'Cleaning': 'fa-broom',
    'Plumbing': 'fa-faucet',
    'Electrician': 'fa-bolt',
    'Appliance': 'fa-fan',
    'Cooking': 'fa-utensils',
    'Carpenter': 'fa-hammer'
};

function renderHome() {
    const featuredServices = services.slice(0, 4);
    const categories = ['Cleaning', 'Plumbing', 'Electrician', 'Appliance', 'Cooking', 'Carpenter'];

    return `
        ${renderHeader()}
    <main>
        <section class="hero">
            <div class="container">
                <h1 class="animate-fade-in">Expert Services, <br><span style="color: var(--primary-color);">Deeply Trusted.</span></h1>
                <p class="animate-fade-in" style="animation-delay: 0.1s;">Book trusted professionals for cleaning, plumbing, electrical work, and more with just a few clicks.</p>
                <div class="flex gap-2 justify-center mt-4 animate-fade-in" style="animation-delay: 0.2s;">
                    <input type="text" placeholder="What service do you need?" class="input-field" style="max-width: 400px; box-shadow: var(--shadow-md);" onchange="handleSearch(this.value)">
                        <button class="btn btn-primary" onclick="navigate('services')">Search</button>
                </div>
                <div class="flex justify-center gap-8 mt-8 animate-fade-in" style="animation-delay: 0.3s; color: var(--text-secondary);">
                    <div class="flex items-center gap-2"><i class="fa-solid fa-check-circle text-accent"></i> Verified Pros</div>
                    <div class="flex items-center gap-2"><i class="fa-solid fa-clock text-accent"></i> On-Time Service</div>
                    <div class="flex items-center gap-2"><i class="fa-solid fa-shield-halved text-accent"></i> 100% Safe</div>
                </div>
            </div>
        </section>

        <!-- Category Section -->
        <section class="container category-section animate-fade-in" style="animation-delay: 0.4s;">
            <div class="text-center mb-4">
                <h2 style="font-size: 2rem; font-weight: 700;">Browse by Category</h2>
                <p style="color: var(--text-secondary);">What do you need help with today?</p>
            </div>
            <div class="category-grid">
                ${categories.map(cat => `
                    <div class="category-card" onclick="setCategory('${cat}'); navigate('services')">
                        <div class="category-icon">
                            <i class="fa-solid ${categoryIcons[cat] || 'fa-tools'}"></i>
                        </div>
                        <span class="category-name">${cat}</span>
                    </div>
                `).join('')}
            </div>
        </section>

        <section class="container" style="padding: 4rem 1rem;">
            <div class="flex justify-between items-end mb-8">
                <div>
                    <h2 style="font-size: 2rem; font-weight: 700;">Featured Services</h2>
                    <p style="color: var(--text-secondary);">Most popular choices by our customers</p>
                </div>
                <button onclick="navigate('services')" class="btn btn-secondary">View All Services <i class="fa-solid fa-arrow-right ml-2"></i></button>
            </div>
            <div class="services-grid">
                ${featuredServices.map(service => renderServiceCard(service)).join('')}
            </div>
        </section>

        <section style="background: var(--primary-color); color: white; padding: 4rem 1rem; margin-top: 2rem; border-radius: var(--radius-lg); margin-bottom: 4rem;">
            <div class="container text-center">
                <h2 style="font-size: 2rem; font-weight: 700; margin-bottom: 1rem;">Why Choose SpeedyServe?</h2>
                <div class="flex flex-wrap justify-center gap-8 mt-8">
                    <div style="flex: 1; min-width: 250px; background: rgba(255,255,255,0.1); padding: 2rem; border-radius: var(--radius-lg); backdrop-filter: blur(5px);">
                        <i class="fa-solid fa-user-shield" style="font-size: 2.5rem; margin-bottom: 1rem;"></i>
                        <h3 style="font-size: 1.25rem; font-weight: 600;">Secure & Safe</h3>
                        <p style="opacity: 0.9;">Background checked professionals for your peace of mind.</p>
                    </div>
                    <div style="flex: 1; min-width: 250px; background: rgba(255,255,255,0.1); padding: 2rem; border-radius: var(--radius-lg); backdrop-filter: blur(5px);">
                        <i class="fa-solid fa-bolt" style="font-size: 2.5rem; margin-bottom: 1rem;"></i>
                        <h3 style="font-size: 1.25rem; font-weight: 600;">Fast Booking</h3>
                        <p style="opacity: 0.9;">Book a service in less than 60 seconds with our smart AI.</p>
                    </div>
                    <div style="flex: 1; min-width: 250px; background: rgba(255,255,255,0.1); padding: 2rem; border-radius: var(--radius-lg); backdrop-filter: blur(5px);">
                        <i class="fa-solid fa-headset" style="font-size: 2.5rem; margin-bottom: 1rem;"></i>
                        <h3 style="font-size: 1.25rem; font-weight: 600;">24/7 Support</h3>
                        <p style="opacity: 0.9;">Our support team is always available to assist you.</p>
                    </div>
                </div>
            </div>
        </section>
    </main>
    `;
}

function renderServices() {
    const filteredServices = services.filter(service => {
        const matchesCategory = state.selectedCategory === 'All' || service.category === state.selectedCategory;
        const matchesSearch = service.name.toLowerCase().includes(state.searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const categories = ['All', ...new Set(services.map(s => s.category))];

    return `
        ${renderHeader()}
    <main class="container animate-fade-in" style="padding: 2rem 1rem;">
        <div class="flex flex-col gap-8">
            <div class="text-center">
                <h1 style="font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem;">Find the Perfect Service</h1>
                <p style="color: var(--text-secondary);">Browse our wide range of professional services</p>
            </div>

            <div class="flex justify-center flex-wrap gap-3" style="padding-bottom: 1rem;">
                ${categories.map(cat => `
                        <button 
                            onclick="setCategory('${cat}')" 
                            class="btn ${state.selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}"
                            style="padding: 0.5rem 1.25rem; border-radius: 2rem; transition: all 0.2s ease;"
                        >
                            <i class="fa-solid ${categoryIcons[cat] || (cat === 'All' ? 'fa-list' : 'fa-tools')} mr-2" style="margin-right: 0.5rem;"></i>
                            ${cat}
                        </button>
                    `).join('')}
            </div>

            <div class="services-grid">
                ${filteredServices.length > 0
            ? filteredServices.map(service => renderServiceCard(service)).join('')
            : `<div style="grid-column: 1 / -1; text-align: center; padding: 4rem; background: var(--secondary-color); border-radius: var(--radius-lg);">
                            <i class="fa-solid fa-search" style="font-size: 3rem; color: #9CA3AF; margin-bottom: 1rem;"></i>
                            <h3 style="font-size: 1.25rem; font-weight: 600; color: var(--text-secondary);">No services found</h3>
                            <p style="color: var(--text-secondary);">Try adjusting your search or filters.</p>
                            <button onclick="setCategory('All')" class="btn btn-primary mt-4">View All Services</button>
                           </div>`
        }
            </div>
        </div>
    </main>
    `;
}

function renderServiceCard(service) {
    return `
        <div class="service-card animate-fade-in">
            <div style="position: relative;">
                <img src="${service.image}" alt="${service.name}" class="card-img" loading="lazy">
                <div style="position: absolute; top: 10px; right: 10px; background: white; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 600; box-shadow: var(--shadow-sm);">
                    ${service.category}
                </div>
            </div>
            <div class="card-content">
                <h3 class="card-title">${service.name}</h3>
                <p style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 1rem; line-height: 1.5; min-height: 2.6em;">
                    ${service.description}
                </p>
                <div style="border-top: 1px solid var(--border-color); padding-top: 1rem; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <span style="font-size: 0.875rem; color: var(--text-secondary);">Starts at</span>
                        <div class="card-price">₹${service.price}</div>
                    </div>
                    <button onclick="navigate('booking', { serviceId: ${service.id} })" class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.875rem;">
                        Book Now
                    </button>
                </div>
            </div>
        </div>
        `;
}

function renderBooking() {
    const service = services.find(s => s.id === state.params.serviceId);
    if (!service) return navigate('services');

    return `
        ${renderHeader()}
    <main class="container animate-fade-in" style="padding: 2rem 1rem; max-width: 900px;">
        <button onclick="navigate('services')" style="color: var(--text-secondary); margin-bottom: 2rem; display: flex; align-items: center; gap: 0.5rem; font-weight: 500;">
            <i class="fa-solid fa-arrow-left"></i> Back to Services
        </button>

        <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 2rem; align-items: start;">
            <!-- Summary Card -->
            <div style="background: white; border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--border-color); position: sticky; top: 100px;">
                <img src="${service.image}" alt="${service.name}" style="width: 100%; height: 200px; object-fit: cover;">
                    <div style="padding: 1.5rem;">
                        <h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem;">${service.name}</h2>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <span style="color: var(--text-secondary);">Service Cost</span>
                            <span style="font-weight: 600;">₹${service.price}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                            <span style="color: var(--text-secondary);">Service Fee</span>
                            <span style="font-weight: 600;">₹99.00</span>
                        </div>
                        <div style="border-top: 1px solid var(--border-color); padding-top: 1rem; display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 1.125rem; font-weight: 700;">Total</span>
                            <span style="font-size: 1.5rem; font-weight: 800; color: var(--primary-color);">₹${(service.price + 99).toFixed(2)}</span>
                        </div>
                    </div>
            </div>

            <!-- Form -->
            <div style="background: white; border-radius: var(--radius-lg); border: 1px solid var(--border-color); padding: 2rem;">
                <h1 style="font-size: 1.75rem; font-weight: 700; margin-bottom: 0.5rem;">Complete your Booking</h1>
                <p style="color: var(--text-secondary); margin-bottom: 2rem;">Fill in the details below to schedule your service.</p>

                <div class="flex gap-4 mb-6 p-1 bg-gray-100 rounded-lg" style="background: var(--secondary-color); border-radius: var(--radius-md); padding: 0.25rem;">
                    <button onclick="setBookingType('instant')" id="btn-instant" class="btn btn-primary" style="flex: 1;">Instant Booking</button>
                    <button onclick="setBookingType('scheduled')" id="btn-scheduled" class="btn btn-secondary" style="flex: 1;">Schedule for Later</button>
                </div>

                <form id="booking-form" onsubmit="handleBooking(event)">
                    <div class="flex flex-col gap-6">
                        <div id="date-time-inputs" class="hidden">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                <div>
                                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.9rem;">Date</label>
                                    <input type="date" id="booking-date" class="input-field">
                                </div>
                                <div>
                                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.9rem;">Time</label>
                                    <select id="booking-time" class="input-field">
                                        <option value="">Select Time</option>
                                        <option value="09:00">09:00 AM</option>
                                        <option value="11:00">11:00 AM</option>
                                        <option value="13:00">01:00 PM</option>
                                        <option value="15:00">03:00 PM</option>
                                        <option value="17:00">05:00 PM</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div id="instant-info" style="background: #e0f2fe; padding: 1rem; border-radius: var(--radius-md); color: #0284c7; display: flex; align-items: center; gap: 1rem;">
                            <i class="fa-solid fa-bolt" style="font-size: 1.5rem;"></i>
                            <div>
                                <h4 style="font-weight: 600;">Arriving ASAP</h4>
                                <p style="font-size: 0.9rem;">Professional will arrive within 45-60 minutes.</p>
                            </div>
                        </div>

                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.9rem;">Service Address</label>
                            <div style="position: relative; margin-bottom: 0.5rem;">
                                <textarea id="address-input" required class="input-field" rows="2" placeholder="Enter your full address"></textarea>
                                <button type="button" onclick="getCurrentLocation()" style="position: absolute; right: 10px; bottom: 10px; color: var(--primary-color); font-size: 0.9rem; font-weight: 500;">
                                    <i class="fa-solid fa-location-crosshairs"></i> Locate Me
                                </button>
                            </div>
                            <div id="map" style="height: 200px; width: 100%; border-radius: var(--radius-md); border: 1px solid var(--border-color);"></div>
                        </div>

                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.9rem;">Special Instructions (Optional)</label>
                            <textarea class="input-field" rows="2" placeholder="Any specific details for the professional?"></textarea>
                        </div>

                        <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem; padding: 1rem;">
                            Confirm Booking
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </main>
    `;
}

let map, marker;
let bookingType = 'instant';

function setBookingType(type) {
    bookingType = type;
    const btnInstant = document.getElementById('btn-instant');
    const btnScheduled = document.getElementById('btn-scheduled');
    const dateTimeInputs = document.getElementById('date-time-inputs');
    const instantInfo = document.getElementById('instant-info');

    if (type === 'instant') {
        btnInstant.classList.remove('btn-secondary');
        btnInstant.classList.add('btn-primary');
        btnScheduled.classList.remove('btn-primary');
        btnScheduled.classList.add('btn-secondary');
        dateTimeInputs.classList.add('hidden');
        instantInfo.classList.remove('hidden');
    } else {
        btnScheduled.classList.remove('btn-secondary');
        btnScheduled.classList.add('btn-primary');
        btnInstant.classList.remove('btn-primary');
        btnInstant.classList.add('btn-secondary');
        dateTimeInputs.classList.remove('hidden');
        instantInfo.classList.add('hidden');
    }
}

function initializeMap() {
    if (map) {
        map.remove(); // Clean up existing map instance
    }

    // Default to New Delhi coordinates
    const defaultLat = 28.6139;
    const defaultLng = 77.2090;

    map = L.map('map').setView([defaultLat, defaultLng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    marker = L.marker([defaultLat, defaultLng], { draggable: true }).addTo(map);

    marker.on('dragend', function (event) {
        const position = marker.getLatLng();
        console.log(`New position: ${position.lat}, ${position.lng} `);
        // Reverse geocoding could go here to update address text
    });
}

function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            if (map && marker) {
                map.setView([lat, lng], 15);
                marker.setLatLng([lat, lng]);
                document.getElementById('address-input').value = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)} (Simulated Address)`;
            }
        }, error => {
            alert("Error getting location: " + error.message);
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}


function renderProfile() {
    if (!state.user) {
        navigate('home');
        return '';
    }

    return `
        ${renderHeader()}
    <main class="container" style="padding: 2rem 1rem;">
        <div class="flex flex-col gap-6">
            <div style="background: white; padding: 2rem; border-radius: var(--radius-lg); border: 1px solid var(--border-color); display: flex; items-center; gap: 2rem; flex-wrap: wrap;">
                <div style="width: 100px; height: 100px; background: linear-gradient(135deg, var(--primary-color), var(--accent-color)); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 3rem; font-weight: 700;">
                    ${state.user.name.charAt(0)}
                </div>
                <div>
                    <h1 style="font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem;">${state.user.name}</h1>
                    <p style="color: var(--text-secondary); margin-bottom: 1rem;"><i class="fa-solid fa-envelope"></i> ${state.user.email}</p>
                    <div class="flex gap-2">
                        <span style="background: #ecfdf5; color: #059669; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.875rem; font-weight: 600;">Verified User</span>
                        <span style="background: #eff6ff; color: var(--primary-color); padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.875rem; font-weight: 600;">Member since 2024</span>
                    </div>
                </div>
            </div>

            <div style="background: white; padding: 2rem; border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
                <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-color);">Booking History</h2>

                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    <!-- Mock History -->
                    <div style="border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; fles-wrap: wrap; gap: 1rem;">
                        <div class="flex gap-4 items-center">
                            <div style="width: 50px; height: 50px; background: #f3f4f6; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                                <i class="fa-solid fa-broom text-primary"></i>
                            </div>
                            <div>
                                <h4 style="font-weight: 600;">Home Cleaning</h4>
                                <p style="font-size: 0.875rem; color: var(--text-secondary);">Oct 24, 2024 • 10:00 AM</p>
                            </div>
                        </div>
                        <div class="flex flex-col items-end">
                            <span style="font-weight: 700;">₹3999</span>
                            <span style="color: #059669; font-weight: 600; font-size: 0.875rem;">Completed</span>
                        </div>
                    </div>
                    <div style="border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; fles-wrap: wrap; gap: 1rem;">
                        <div class="flex gap-4 items-center">
                            <div style="width: 50px; height: 50px; background: #f3f4f6; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                                <i class="fa-solid fa-bolt text-primary"></i>
                            </div>
                            <div>
                                <h4 style="font-weight: 600;">Electrical Repair</h4>
                                <p style="font-size: 0.875rem; color: var(--text-secondary);">Nov 12, 2024 • 2:00 PM</p>
                            </div>
                        </div>
                        <div class="flex flex-col items-end">
                            <span style="font-weight: 700;">₹999</span>
                            <span style="color: #059669; font-weight: 600; font-size: 0.875rem;">Completed</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
    `;
}


// Logic Functions

function handleSearch(query) {
    state.searchQuery = query;
    if (state.currentPage !== 'services') {
        navigate('services');
    } else {
        renderApp();
    }
}

function setCategory(category) {
    state.selectedCategory = category;
    renderApp();
}

function openLogin() {
    state.showLoginModal = true;
    state.showRegisterModal = false;
    state.loginStep = 'input';
    renderApp();
}

function closeAuthModals() {
    state.showLoginModal = false;
    state.showRegisterModal = false;
    state.loginStep = 'input';

    state.generatedOTP = null;
    state.tempLoginData = null;

    renderApp();
}

function openRegister() {
    state.showRegisterModal = true;
    state.showLoginModal = false;
    renderApp();
}

function handleLogin(e) {
    e.preventDefault();

    const identifier = e.target.identifier.value.trim();

    // Check if email
    if (!identifier.includes("@")) {
        alert("Only Email OTP supported right now. Please enter an email.");
        return;
    }

    // Generate OTP
    const otpCode = Math.floor(1000 + Math.random() * 9000);

    // Save OTP + Identifier
    state.generatedOTP = otpCode;
    state.tempLoginData = identifier;
    state.loginStep = "otp";

    // Send OTP Email
    sendOTPEmail(identifier, otpCode)
        .then(() => {
            alert("OTP sent successfully to your email!");
            renderApp();
        })
        .catch((err) => {
            console.error("Email Error:", err);
            alert("Failed to send OTP email. Check EmailJS setup.");
        });
}

function handleVerifyOTP(e) {
    e.preventDefault();

    const otp = e.target.otp.value.trim();

    // Validate OTP
    if (parseInt(otp) !== state.generatedOTP) {
        alert("Wrong OTP! Please try again.");
        return;
    }

    // OTP Verified ✅
    const identifier = state.tempLoginData;

    let user = users.find(u => u.email === identifier);

    // Create new user if not exists
    if (!user) {
        user = {
            id: users.length + 1,
            name: identifier.split("@")[0],
            email: identifier,
            role: "user"
        };
        users.push(user);
    }

    state.user = user;

    // Reset OTP state
    state.generatedOTP = null;
    state.tempLoginData = null;

    closeAuthModals();

    alert(`Welcome, ${user.name}!`);
}

function handleRegister(e) {
    e.preventDefault();
    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    const role = e.target.role.value;

    // Check if email already exists
    if (users.find(u => u.email === email)) {
        alert('Email already registered');
        return;
    }

    // Create new user
    const newUser = {
        id: users.length + 1,
        name,
        email,
        password, // In real app, hash this
        role
    };

    users.push(newUser);
    state.user = newUser;
    closeAuthModals();
    alert('Registration successful! Welcome to SpeedyServe.');
}

function logout() {
    state.user = null;
    navigate('home');
}

function handleBooking(e) {
    e.preventDefault();
    if (!state.user) {
        alert('Please login to continue booking.');
        openLogin();
        return;
    }

    const form = e.target;
    // const date = form.querySelector('input[type="date"]').value; // Removed strict dependency
    // const time = form.querySelector('select').value;

    // Simulate API call
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerText;
    btn.innerText = 'Confirming...';
    btn.disabled = true;
    btn.style.opacity = '0.7';

    setTimeout(() => {
        btn.innerText = originalText;
        btn.disabled = false;

        // Generate Booking Details
        const bookingId = 'BK-' + Math.floor(100000 + Math.random() * 900000);
        const serviceId = state.params.serviceId || 1; // Default fallback
        const service = services.find(s => s.id === serviceId);

        // Determine Arrival Time
        let arrivalTime = '';
        const now = new Date();
        if (bookingType === 'instant') {
            const arrival = new Date(now.getTime() + 45 * 60000); // +45 mins
            arrivalTime = `Today, roughly ${arrival.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else {
            const dateInput = form.querySelector('input[type="date"]'); // May be hidden/empty
            const timeInput = form.querySelector('select'); // May be hidden/empty

            // Allow fallback if user toggled back and forth
            const dateVal = dateInput.value || new Date().toISOString().split('T')[0];
            const timeVal = timeInput.value || '10:00';

            arrivalTime = `${dateVal} at ${timeVal}`;
        }

        const bookingDetails = {
            id: bookingId,
            service: service,
            provider: {
                name: "Rahul Sharma",
                rating: 4.8,
                phone: "+91 98765 43210"
            },
            address: form.querySelector('textarea').value || 'Location provided on map',
            date: arrivalTime,
            paymentStatus: "Pending (Pay on Service)",
            total: (service.price + 99).toFixed(2),
            type: bookingType
        };

        state.currentBooking = bookingDetails;

        // Add to history (simulated)
        // In a real app, this would be an API call to save the booking

        alert('Booking Successful!');
        navigate('confirmation');
    }, 1500);
}

function renderConfirmation() {
    if (!state.currentBooking) return navigate('home');
    const booking = state.currentBooking;

    return `
        ${renderHeader()}
        <main class="container animate-fade-in" style="padding: 2rem 1rem; max-width: 800px;">
            <div style="background: white; border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--border-color); text-align: center; padding: 3rem 2rem;">
                
                <div style="width: 80px; height: 80px; background: #ecfdf5; color: #059669; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; margin: 0 auto 1.5rem;">
                    <i class="fa-solid fa-check"></i>
                </div>

                <h1 style="font-size: 2rem; font-weight: 800; margin-bottom: 0.5rem; color: var(--text-primary);">Booking Confirmed!</h1>
                <p style="color: var(--text-secondary); margin-bottom: 2rem;">Your service request has been successfully placed.</p>

                <div style="background: #f9fafb; border-radius: var(--radius-md); padding: 1.5rem; margin-bottom: 2rem; border: 1px dashed var(--border-color); display: inline-block;">
                    <span style="display: block; font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.25rem;">Booking ID</span>
                    <span style="font-size: 1.5rem; font-weight: 700; letter-spacing: 1px; color: var(--primary-color);">${booking.id}</span>
                </div>

                <div style="text-align: left; background: white; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0; overflow: hidden; margin-bottom: 2rem;">
                    <div style="padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-color); background: #f9fafb; font-weight: 600;">
                        Booking Details
                    </div>
                    <div style="padding: 1.5rem; display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
                        <div>
                            <span style="display: block; font-size: 0.875rem; color: var(--text-secondary);">Service</span>
                            <span style="font-weight: 600;">${booking.service.name}</span>
                        </div>
                        <div>
                            <span style="display: block; font-size: 0.875rem; color: var(--text-secondary);">Expected Arrival</span>
                            <span style="font-weight: 600; color: ${booking.type === 'instant' ? '#059669' : ''};">
                                ${booking.date}
                            </span>
                        </div>
                        <div>
                            <span style="display: block; font-size: 0.875rem; color: var(--text-secondary);">Address</span>
                            <span style="font-weight: 500; font-size: 0.95rem;">${booking.address}</span>
                        </div>
                        <div>
                            <span style="display: block; font-size: 0.875rem; color: var(--text-secondary);">Payment Status</span>
                            <span style="font-weight: 600; color: #d97706;">${booking.paymentStatus}</span>
                        </div>
                    </div>
                </div>

                <div style="text-align: left; background: white; border: 1px solid var(--border-color); border-radius: var(--radius-md); overflow: hidden; margin-bottom: 2rem;">
                    <div style="padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-color); background: #f9fafb; font-weight: 600;">
                        Provider Assigned
                    </div>
                    <div style="padding: 1.5rem; display: flex; gap: 1rem; align-items: center;">
                        <div style="width: 50px; height: 50px; background: #e0f2fe; color: var(--primary-color); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; font-weight: 700;">
                            ${booking.provider.name.charAt(0)}
                        </div>
                        <div>
                            <div style="font-weight: 600;">${booking.provider.name}</div>
                            <div style="font-size: 0.875rem; color: var(--text-secondary);">
                                <i class="fa-solid fa-star" style="color: #fbbf24;"></i> ${booking.provider.rating} Rating
                            </div>
                        </div>
                        <div style="margin-left: auto;">
                            <a href="tel:${booking.provider.phone}" class="btn btn-secondary" style="padding: 0.5rem 1rem; font-size: 0.875rem;">
                                <i class="fa-solid fa-phone mr-2"></i> Call
                            </a>
                        </div>
                    </div>
                </div>

                <div class="flex gap-4 justify-center">
                    <button onclick="navigate('home')" class="btn btn-secondary">Back to Home</button>
                    <button onclick="navigate('profile')" class="btn btn-primary">View My Bookings</button>
                </div>

            </div>
        </main>
    `;
}

// Chat Logic
function toggleChat() {
    state.isChatOpen = !state.isChatOpen;
    renderChat();
}

function handleChatKey(e) {
    if (e.key === 'Enter') sendChatMessage();
}

function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;

    // Add user message
    state.chatMessages.push({ sender: 'user', text });

    // Clear input but keep focus logic handled in renderChat
    input.value = '';

    // Set AI typing state
    state.isTyping = true;
    renderChat();

    // AI Response Logic
    setTimeout(() => {
        let response = "I'm not sure about that. Try asking for 'cleaning' or 'plumbing'.";
        const lowerText = text.toLowerCase();

        // Simulating AI intent recognition
        if (lowerText.includes('hello') || lowerText.includes('hi')) {
            response = "Hello! I'm here to help you get jobs done. \n\nTell me what you need, like 'cleaning' or 'repair'.";
        } else if (lowerText.includes('clean') || lowerText.includes('maid') || lowerText.includes('dust')) {
            response = "We have top-rated home cleaning services starting at ₹3999. Would you like to see the available options? <br><br> <button class='btn btn-primary' onclick=\"navigate('services'); setCategory('Cleaning')\" style='padding:0.25rem 0.5rem; font-size:0.8rem; margin-top:0.5rem;'>View Cleaning Services</button>";
        } else if (lowerText.includes('plumb') || lowerText.includes('leak') || lowerText.includes('pipe')) {
            response = "For plumbing emergencies or repairs, our experts are ready. <br><br> <button class='btn btn-primary' onclick=\"navigate('services'); setCategory('Plumbing')\" style='padding:0.25rem 0.5rem; font-size:0.8rem; margin-top:0.5rem;'>View Plumbing</button>";
        } else if (lowerText.includes('electric') || lowerText.includes('light') || lowerText.includes('wire')) {
            response = "Certified electricians are just a click away. <br><br> <button class='btn btn-primary' onclick=\"navigate('services'); setCategory('Electrician')\" style='padding:0.25rem 0.5rem; font-size:0.8rem; margin-top:0.5rem;'>View Electricians</button>";
        } else if (lowerText.includes('price') || lowerText.includes('cost')) {
            response = "Our prices are transparent and displayed upfront on every service card. No hidden fees!";
        } else if (lowerText.includes('book')) {
            response = "You can book any service by clicking the 'Book Now' button on the service page.";
        } else if (lowerText.includes('thank')) {
            response = "You're welcome! Let me know if you need anything else.";
        }

        state.chatMessages.push({ sender: 'bot', text: response });
        state.isTyping = false;
        renderChat();
    }, 1500); // 1.5s delay for realism
}


// Initial Render
renderApp();
renderChat(); // Render chat initially (closed state)