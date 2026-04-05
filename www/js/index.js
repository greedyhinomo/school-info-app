// Wait for Cordova to be fully loaded
document.addEventListener('deviceready', onDeviceReady, false);

// Global variables
let allSchools = [];
let currentFilter = 'all';
let favorites = new Set();

// DOM elements
let searchInput;
let districtFilter;
let typeFilter;

// Called when Cordova is ready
function onDeviceReady() {
    console.log('Cordova is ready!');
    setupEventListeners();
    loadLocalData();
}

// Load data from data.json
function loadLocalData() {
    showLoading(true);
    
    // Path is relative to your index.html file
    fetch('data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('HTTP error ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            console.log("Data loaded successfully:", data.length, "schools");
            allSchools = data;
            updateStats();
            filterAndRenderSchools();
            showLoading(false);
        })
        .catch(error => {
            console.error("Error loading data.json:", error);
            // Use mock data if JSON file not found
            allSchools = getMockData();
            updateStats();
            filterAndRenderSchools();
            showLoading(false);
            showError("Using demo data (data.json not found)");
        });
}

// Mock data as fallback
function getMockData() {
    return [
        { id: 1, name: "Hong Kong University", address: "Pok Fu Lam, Hong Kong", district: "Central and Western", type: "University", session: "Whole Day" },
        { id: 2, name: "Chinese University of Hong Kong", address: "Sha Tin, N.T.", district: "Sha Tin", type: "University", session: "Whole Day" },
        { id: 3, name: "Hong Kong University of Science and Technology", address: "Clear Water Bay, Kowloon", district: "Sai Kung", type: "University", session: "Whole Day" },
        { id: 4, name: "Diocesan Boys' School", address: "131 Argyle St, Mong Kok", district: "Yau Tsim Mong", type: "Secondary", session: "Whole Day" },
        { id: 5, name: "Maryknoll Convent School", address: "23 Waterloo Rd, Kowloon Tong", district: "Kowloon City", type: "Secondary", session: "Whole Day" },
        { id: 6, name: "La Salle College", address: "18 La Salle Rd, Kowloon Tong", district: "Kowloon City", type: "Secondary", session: "Whole Day" },
        { id: 7, name: "St. Paul's Co-educational College", address: "33 MacDonnell Rd, Mid-Levels", district: "Central and Western", type: "Secondary", session: "Whole Day" },
        { id: 8, name: "True Light Middle School", address: "50 Tai Hang Rd, Causeway Bay", district: "Wan Chai", type: "Secondary", session: "Whole Day" },
        { id: 9, name: "Hong Kong Polytechnic University", address: "11 Yuk Choi Rd, Hung Hom", district: "Kowloon City", type: "University", session: "Whole Day" },
        { id: 10, name: "St. Stephen's Girls' College", address: "2 Lyttelton Rd, Mid-Levels", district: "Central and Western", type: "Secondary", session: "Whole Day" }
    ];
}

// Setup event listeners for all filters
function setupEventListeners() {
    // Main search input
    searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', filterAndRenderSchools);
    }
    
    // District filter
    districtFilter = document.getElementById('districtFilter');
    if (districtFilter) {
        districtFilter.addEventListener('input', filterAndRenderSchools);
    }
    
    // Type filter (text box)
    typeFilter = document.getElementById('typeFilter');
    if (typeFilter) {
        typeFilter.addEventListener('input', filterAndRenderSchools);
    }
    
    // Filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            filterAndRenderSchools();
        });
    });
}

// Main filter and render function
function filterAndRenderSchools() {
    if (!allSchools || allSchools.length === 0) return;
    
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const districtTerm = districtFilter ? districtFilter.value.toLowerCase() : '';
    const typeTerm = typeFilter ? typeFilter.value.toLowerCase() : '';
    
    let filtered = [...allSchools];
    
    // Apply type button filter
    if (currentFilter !== 'all') {
        filtered = filtered.filter(school => school.type === currentFilter);
    }
    
    // Apply search filter (by name)
    if (searchTerm) {
        filtered = filtered.filter(school => 
            school.name && school.name.toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply district filter (text box)
    if (districtTerm) {
        filtered = filtered.filter(school => 
            school.district && school.district.toLowerCase().includes(districtTerm)
        );
    }
    
    // Apply type filter (text box)
    if (typeTerm) {
        filtered = filtered.filter(school => 
            school.type && school.type.toLowerCase().includes(typeTerm)
        );
    }
    
    renderSchools(filtered);
    updateDisplayCount(filtered.length);
}

// Render schools to the list
function renderSchools(schools) {
    const container = document.getElementById('schoolList');
    
    if (!container) return;
    
    if (schools.length === 0) {
        container.innerHTML = '<div class="no-results">No schools found matching your criteria</div>';
        return;
    }
    
    container.innerHTML = schools.map(school => `
        <div class="school-card" onclick="showSchoolDetail(${school.id})">
            <div class="school-name">${escapeHtml(school.name)}</div>
            <div class="school-district">📍 ${escapeHtml(school.district)}</div>
            <div class="school-address">${escapeHtml(school.address)}</div>
            <div class="school-type">
                <span class="type-badge">${escapeHtml(school.type)}</span> | 
                <span class="session-badge">${escapeHtml(school.session)}</span>
            </div>
        </div>
    `).join('');
}

// Show school detail modal
function showSchoolDetail(schoolId) {
    const school = allSchools.find(s => s.id === schoolId);
    if (!school) return;
    
    document.getElementById('modalTitle').textContent = school.name;
    document.getElementById('modalAddress').textContent = school.address || 'N/A';
    document.getElementById('modalDistrict').textContent = school.district || 'N/A';
    document.getElementById('modalType').textContent = school.type || 'N/A';
    document.getElementById('modalSession').textContent = school.session || 'N/A';
    
    document.getElementById('modal').style.display = 'flex';
}

// Close modal
function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Update statistics
function updateStats() {
    const totalSpan = document.getElementById('totalSchools');
    if (totalSpan) {
        totalSpan.textContent = allSchools.length;
    }
}

// Update display count
function updateDisplayCount(count) {
    const statsDiv = document.getElementById('stats');
    if (statsDiv) {
        statsDiv.innerHTML = `<span id="totalSchools">${allSchools.length}</span> schools loaded | Showing <strong>${count}</strong> results`;
    }
}

// Show/hide loading indicator
function showLoading(show) {
    const container = document.getElementById('schoolList');
    if (show && container) {
        container.innerHTML = '<div class="loading">Loading school data...</div>';
    }
}

// Show error message
function showError(message) {
    const container = document.getElementById('schoolList');
    if (container) {
        container.innerHTML = `<div class="no-results" style="color: #c62828;">⚠️ ${message}</div>`;
    }
}

// Helper function to escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Toggle favorite (optional feature)
function toggleFavorite(schoolId) {
    if (favorites.has(schoolId)) {
        favorites.delete(schoolId);
    } else {
        favorites.add(schoolId);
    }
    saveFavorites();
    filterAndRenderSchools();
}

function saveFavorites() {
    localStorage.setItem('schoolFavorites', JSON.stringify([...favorites]));
}

function loadFavorites() {
    const saved = localStorage.getItem('schoolFavorites');
    if (saved) {
        favorites = new Set(JSON.parse(saved));
    }
}
