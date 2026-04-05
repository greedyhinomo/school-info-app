// Global variables
let allSchools = [];
let currentLanguage = 'en';

const API_URL = "https://www.edb.gov.hk/attachment/en/student-parents/sch-info/sch-search/sch-location-info/SCH_LOC_EDB.json";

window.onload = function() {
    console.log("App started");
    fetchSchools();
};

function fetchSchools() {
    showLoading();
    
    fetch(API_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log("Data received:", data.length, "schools");
            allSchools = data;
            displaySchools(allSchools);
            updateStats(allSchools.length);
        })
        .catch(error => {
            console.error("Error:", error);
            showError();
        });
}

function displaySchools(schools) {
    const container = document.getElementById('schoolList');
    
    if (!schools || schools.length === 0) {
        container.innerHTML = '<div class="no-results">No schools found</div>';
        return;
    }
    
    let html = '';
    
    for (let i = 0; i < schools.length; i++) {
        const school = schools[i];
        
        let schoolName = currentLanguage === 'en' ? school.ENGLISHNAME : school["中文名"];
        let address = currentLanguage === 'en' ? school.ENGLISHADDRESS : school["中文地址"];
        let district = school.DISTRICT || school["分區"];
        let schoolLevel = school.SCHOOLLEVEL || school["學校類型"];
        let financeType = school.FINANCETYPE || school["資助種類"];
        
        schoolName = schoolName || "Name not available";
        address = address || "Address not available";
        district = district || "N/A";
        
        html += `
            <div class="school-card" onclick='showSchoolDetails(${JSON.stringify(school).replace(/'/g, "&#39;")})'>
                <div class="school-name">${escapeHtml(schoolName)}</div>
                <div class="school-district">📍 ${escapeHtml(district)}</div>
                <div class="school-address">🏠 ${escapeHtml(address)}</div>
                <div class="school-type">
                    ${schoolLevel ? `📚 ${schoolLevel} | ` : ''}
                    ${financeType ? `💰 ${financeType}` : ''}
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
    updateStats(schools.length);
}

function showSchoolDetails(school) {
    const name = currentLanguage === 'en' ? school.ENGLISHNAME : school["中文名"];
    const address = currentLanguage === 'en' ? school.ENGLISHADDRESS : school["中文地址"];
    const district = school.DISTRICT || school["分區"];
    const schoolLevel = school.SCHOOLLEVEL || school["學校類型"];
    const financeType = school.FINANCETYPE || school["資助種類"];
    const phone = school.TELEPHONE || school["聯絡電話"];
    const website = school.WEBSITE || school["網页"];
    const religion = school.RELIGION || school["宗教"];
    const session = school.SESSION || school["学校授課時間"];
    const gender = school.STUDENTSGENDER || school["就讀學生性别"];
    const latitude = school.LATITUDE;
    const longitude = school.LONGITUDE;
    
    let modalHtml = `
        <div class="modal" id="schoolModal" onclick="closeModalOnBackground(event)">
            <div class="modal-content">
                <div class="modal-header">${escapeHtml(name)}</div>
                <div class="modal-info">
                    <div class="modal-label">📍 District</div>
                    <div class="modal-value">${escapeHtml(district || 'N/A')}</div>
                </div>
                <div class="modal-info">
                    <div class="modal-label">🏠 Address</div>
                    <div class="modal-value">${escapeHtml(address || 'N/A')}</div>
                </div>
    `;
    
    if (phone) {
        modalHtml += `
            <div class="modal-info">
                <div class="modal-label">📞 Phone</div>
                <div class="modal-value"><a href="tel:${phone}" class="phone-link">${phone}</a></div>
            </div>
        `;
    }
    
    if (website && website !== "NIL" && website !== "#N/A") {
        modalHtml += `
            <div class="modal-info">
                <div class="modal-label">🌐 Website</div>
                <div class="modal-value"><a href="${website}" target="_blank" class="website-link">${website}</a></div>
            </div>
        `;
    }
    
    if (latitude && longitude) {
        modalHtml += `
            <div class="modal-info">
                <div class="modal-label">🗺️ Location</div>
                <div class="modal-value">
                    <a href="https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}" target="_blank">
                        View on Google Maps
                    </a>
                </div>
            </div>
        `;
    }
    
    modalHtml += `
                <button class="close-modal" onclick="closeModal()">Close</button>
            </div>
        </div>
    `;
    
    const existingModal = document.getElementById('schoolModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.getElementById('schoolModal').style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('schoolModal');
    if (modal) {
        modal.remove();
    }
}

function closeModalOnBackground(event) {
    if (event.target === event.currentTarget) {
        closeModal();
    }
}

function filterSchools() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (!searchTerm) {
        displaySchools(allSchools);
        return;
    }
    
    const filtered = allSchools.filter(school => {
        const nameEn = (school.ENGLISHNAME || "").toLowerCase();
        const nameZh = (school["中文名"] || "").toLowerCase();
        const districtEn = (school.DISTRICT || "").toLowerCase();
        const districtZh = (school["分區"] || "").toLowerCase();
        
        return nameEn.includes(searchTerm) || 
               nameZh.includes(searchTerm) || 
               districtEn.includes(searchTerm) || 
               districtZh.includes(searchTerm);
    });
    
    displaySchools(filtered);
}

function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'zh' : 'en';
    const btn = document.getElementById('langBtn');
    btn.textContent = currentLanguage === 'en' ? '🌐 中文' : '🌐 English';
    
    const searchTerm = document.getElementById('searchInput').value;
    if (searchTerm) {
        filterSchools();
    } else {
        displaySchools(allSchools);
    }
}

function updateStats(count) {
    const statsDiv = document.getElementById('stats');
    const totalSpan = document.getElementById('totalCount');
    
    if (totalSpan) {
        totalSpan.textContent = allSchools.length;
    }
    
    const searchTerm = document.getElementById('searchInput').value;
    if (searchTerm && count !== allSchools.length) {
        statsDiv.innerHTML = `🔍 Found ${count} school(s) matching "${searchTerm}" | Total: ${allSchools.length} schools`;
    } else {
        statsDiv.innerHTML = `🏫 Showing ${count} schools in Hong Kong`;
    }
}

function showLoading() {
    const container = document.getElementById('schoolList');
    container.innerHTML = '<div class="loading">📡 Loading school data from Education Bureau...<br><br>Please wait a moment.</div>';
}

function showError() {
    const container = document.getElementById('schoolList');
    container.innerHTML = `
        <div class="no-results">
            ⚠️ Unable to load school data.<br><br>
            Please check your internet connection and try again.<br><br>
            <button onclick="fetchSchools()" style="padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 25px;">Retry</button>
        </div>
    `;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
