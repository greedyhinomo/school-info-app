// Wait for Cordova to be fully loaded.
document.addEventListener('deviceready', function() {
    console.log('Cordova is ready!');
    // You can add your Cordova-dependent code here.
}, false);

function loadLocalData() {
    // Path is relative to your index.html file
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            console.log("Data loaded successfully:", data);
            // Now you can use the data, for example:
            // allSchools = data;
            // filterAndRenderSchools();
        })
        .catch(error => {
            console.error("Error loading data.json:", error);
        });
}
// Add these variables at the top with your other variables
let allSchools = [];
let currentFilter = 'all';
let favorites = new Set();

// Get DOM elements
let searchInput;
let districtFilter;
let typeFilter;

// Setup event listeners (add the new filters)
function setupEventListeners() {
    // Main search input
    searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', filterAndRenderSchools);
    
    // District filter
    districtFilter = document.getElementById('districtFilter');
    districtFilter.addEventListener('input', filterAndRenderSchools);
    
    // Type filter (text box)
    typeFilter = document.getElementById('typeFilter');
    typeFilter.addEventListener('input', filterAndRenderSchools);
    
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

// Enhanced filter function with multiple criteria
function filterAndRenderSchools() {
    const searchTerm = searchInput.value.toLowerCase();
    const districtTerm = districtFilter.value.toLowerCase();
    const typeTerm = typeFilter.value.toLowerCase();
    
    let filtered = allSchools;
    
    // Apply type button filter
    if (currentFilter !== 'all') {
        filtered = filtered.filter(school => school.type === currentFilter);
    }
    
    // Apply search filter (by name)
    if (searchTerm) {
        filtered = filtered.filter(school => 
            school.name.toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply district filter (text box)
    if (districtTerm) {
        filtered = filtered.filter(school => 
            school.district.toLowerCase().includes(districtTerm)
        );
    }
    
    // Apply type filter (text box)
    if (typeTerm) {
        filtered = filtered.filter(school => 
            school.type.toLowerCase().includes(typeTerm)
        );
    }
    
    renderSchools(filtered);
    updateDisplayCount(filtered.length);
}
