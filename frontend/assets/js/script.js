const API_URL = "http://localhost:5000/api";
let authToken = localStorage.getItem("token") || null;

// --- DOM References ---
const loginLink = document.getElementById("loginLink");
const signupLink = document.getElementById("signupLink");
const addListingLink = document.getElementById("addListingLink");
const logoutBtn = document.getElementById("logoutBtn");
const signupForm = document.getElementById('signupForm');
const loginForm = document.getElementById('loginForm');
const propertyForm = document.getElementById('propertyForm');
const searchForm = document.getElementById("searchForm");
const propertyDetailContainer = document.getElementById('propertyDetailContainer');

// --- UI AND AUTH STATE ---
function updateUIAuthState() {
  if (!loginLink) return;
  if (authToken) {
    loginLink.classList.add("hidden");
    signupLink.classList.add("hidden");
    addListingLink.classList.remove("hidden");
    logoutBtn.classList.remove("hidden");
  } else {
    loginLink.classList.remove("hidden");
    signupLink.classList.remove("hidden");
    addListingLink.classList.add("hidden");
    logoutBtn.classList.add("hidden");
  }
}
updateUIAuthState();

// --- EVENT LISTENERS ---
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    authToken = null;
    updateUIAuthState();
    alert("Logged out successfully!");
    window.location.href = "index.html";
  });
}
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        try {
            const res = await fetch(`${API_URL}/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            alert('Registration successful! Please log in.');
            window.location.href = 'login.html';
        } catch (err) {
            alert(`Registration Failed: ${err.message}`);
        }
    });
}
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        try {
            const res = await fetch(`${API_URL}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            localStorage.setItem('token', data.token);
            alert('Login successful!');
            window.location.href = 'index.html';
        } catch (err) {
            alert(`Login Failed: ${err.message}`);
        }
    });
}

// --- Add Property Form Logic using Image URL ---
if (propertyForm) {
    if (!authToken) {
        alert('You must be logged in to add a property.');
        window.location.href = 'login.html';
    }

    propertyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Create a simple JavaScript object with the form data
        const propertyData = {
            title: document.getElementById('title').value,
            price: document.getElementById('price').value,
            location: document.getElementById('location').value,
            description: document.getElementById('description').value,
            image: document.getElementById('image').value, // Get the URL from the text input
        };

        const submitButton = propertyForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Adding...';

        try {
            const res = await fetch(`${API_URL}/properties`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Send as JSON
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(propertyData) // Send the JSON string
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            
            alert('Property added successfully!');
            window.location.href = 'index.html';

        } catch (err) {
            alert(`Error: ${err.message}`);
            submitButton.disabled = false;
            submitButton.textContent = 'Add Property';
        }
    });
}

// --- PROPERTY LISTING & SEARCH ---
async function loadProperties(query = "") {
  try {
    let url = `${API_URL}/properties`;
    if (query) url += `?q=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Could not fetch properties.');
    const properties = await res.json();
    const container = document.getElementById("propertiesContainer");
    if (!container) return;
    
    container.innerHTML = "";
    if (properties.length === 0) {
      container.innerHTML = `<p class="col-span-full text-center text-gray-400">No properties found.</p>`;
      return;
    }

    properties.forEach(p => {
      const cardLink = document.createElement("a");
      cardLink.href = `property.html?id=${p._id}`;
      cardLink.className = "glass-card p-6 block hover:shadow-xl transition-shadow duration-300";
      cardLink.innerHTML = `
        <img src="${p.image || 'https://via.placeholder.com/400'}" alt="${p.title}" class="rounded-lg mb-4 w-full h-48 object-cover"/>
        <div class="card-content">
            <h3 class="text-xl font-bold mb-2 text-white">${p.title}</h3>
            <p class="text-sm mb-1 text-gray-400">${p.location}</p>
            <p class="text-lg mb-2 font-semibold text-yellow-400">₹${Number(p.price).toLocaleString('en-IN')}</p>
            <p class="text-sm text-gray-300">${p.description.substring(0, 100)}...</p>
        </div>
      `;
      container.appendChild(cardLink);
    });
    init3DTilt();
  } catch (err) {
    const container = document.getElementById("propertiesContainer");
    if (container) container.innerHTML = `<p class="col-span-full text-center text-red-400">Error: Could not load properties.</p>`;
  }
}
if (document.getElementById("propertiesContainer")) {
  loadProperties();
}
if (searchForm) {
  searchForm.addEventListener("submit", e => {
    e.preventDefault();
    const query = document.getElementById("searchLocation").value.trim();
    loadProperties(query);
  });
}

// --- PROPERTY DETAIL PAGE LOGIC ---
async function loadPropertyDetails(propertyId) {
    if (!propertyId) {
        if(propertyDetailContainer) propertyDetailContainer.innerHTML = `<p class="text-center text-red-400">No property ID provided.</p>`;
        return;
    }
    try {
        const res = await fetch(`${API_URL}/properties/${propertyId}`);
        if (!res.ok) throw new Error('Property not found.');
        const property = await res.json();
        const loadingMessage = document.getElementById('loadingMessage');
        if(loadingMessage) loadingMessage.style.display = 'none';
        
        propertyDetailContainer.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div class="property-image-container animate-fadeInUp">
                    <img src="${property.image || 'https://via.placeholder.com/800x600'}" alt="${property.title}" class="w-full h-full object-cover">
                </div>
                <div class="animate-fadeInUp delay-1">
                    <h1 class="text-4xl md:text-5xl font-bold text-white mb-2">${property.title}</h1>
                    <p class="text-xl text-gray-400 mb-4">${property.location}</p>
                    <p class="text-4xl font-light text-yellow-400 mb-6">₹${Number(property.price).toLocaleString('en-IN')}</p>
                    <p class="text-gray-300 leading-relaxed">${property.description}</p>
                </div>
            </div>
        `;

        const contactAgentCard = document.getElementById('contactAgentCard');
        if (contactAgentCard) {
            contactAgentCard.innerHTML = `
                <div class="contact-card p-6">
                    <h3 class="text-xl font-bold text-white mb-3">Contact Agent</h3>
                    <p class="text-gray-400 mb-4">Get in touch with a consultant today.</p>
                    <div class="mb-4">
                        <span class="inline-block bg-gray-700/50 text-gray-300 text-sm font-mono px-3 py-1 rounded-md">+91 22 3357 8...</span>
                    </div>
                    <a href="#" class="text-sm text-gray-500 hover:text-white transition">Privacy Policy</a>
                    <div class="mt-6">
                        <p class="text-sm text-gray-400 mb-3">Social Media</p>
                        <div class="flex items-center gap-4">
                            <a href="#" class="text-gray-400 hover:text-white transition"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clip-rule="evenodd" /></svg></a>
                            <a href="#" class="text-gray-400 hover:text-white transition"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg></a>
                            <a href="#" class="text-gray-400 hover:text-white transition"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zM12.04 20.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31c-.82-1.31-1.26-2.83-1.26-4.38 0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42s2.42 3.62 2.42 5.82c0 4.54-3.7 8.24-8.24 8.24zm4.52-6.14c-.25-.12-1.47-.72-1.7-.82s-.39-.12-.56.12c-.17.25-.64.82-.79.99s-.29.17-.54.06c-.25-.12-1.06-.39-2.02-1.25s-1.46-1.73-1.63-2.02c-.17-.29-.02-.45.1-.56s.25-.29.37-.44c.12-.14.17-.25.25-.41s.12-.29.06-.54c-.06-.25-.56-1.34-.76-1.84s-.4-.42-.56-.42h-.48c-.17 0-.44.06-.68.29s-.91.89-.91 2.18.93 2.53 1.06 2.71c.12.17 1.81 2.76 4.39 3.82.6.25 1.07.41 1.44.52.59.19 1.13.16 1.56.1.47-.06 1.47-.6 1.68-1.18s.21-1.09.15-1.18c-.06-.1-.23-.16-.48-.28z"/></svg></a>
                        </div>
                    </div>
                    <a href="#" class="mt-8 block w-full bg-yellow-400 text-gray-900 text-center py-3 rounded-full text-lg font-medium btn">Get in touch</a>
                </div>
            `;
        }
        initMap(property.location);
    } catch (err) {
        if(propertyDetailContainer) propertyDetailContainer.innerHTML = `<p class="text-center text-red-400">Error: ${err.message}</p>`;
    }
}
if (propertyDetailContainer) {
    const urlParams = new URLSearchParams(window.location.search);
    const propertyId = urlParams.get('id');
    loadPropertyDetails(propertyId);
}

// --- ANIMATIONS ---
function init3DTilt() {
  const cards = document.querySelectorAll(".glass-card");
  cards.forEach(card => {
    card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const rotateX = (mouseY / rect.height - 0.5) * -15;
        const rotateY = (mouseX / rect.width - 0.5) * 15;
        card.style.setProperty('--rotateX', `${rotateX}deg`);
        card.style.setProperty('--rotateY', `${rotateY}deg`);
        card.style.setProperty('--glareX', `${mouseX}px`);
        card.style.setProperty('--glareY', `${mouseY}px`);
    });
    card.addEventListener("mouseleave", () => {
        card.style.setProperty('--rotateX', '0deg');
        card.style.setProperty('--rotateY', '0deg');
    });
  });
}

// --- MAP INITIALIZATION ---
async function initMap(locationString) {
    const mapSection = document.getElementById('mapSection');
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationString)}`);
        const data = await response.json();
        if (data && data.length > 0) {
            const { lat, lon } = data[0];
            mapSection.classList.remove('hidden');
            const map = L.map('map').setView([lat, lon], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
            L.marker([lat, lon]).addTo(map).bindPopup(`<b>${locationString}</b>`).openPopup();
        } else {
            mapSection.classList.add('hidden');
        }
    } catch (error) {
        console.error("Map initialization failed:", error);
        mapSection.classList.add('hidden');
    }
}

