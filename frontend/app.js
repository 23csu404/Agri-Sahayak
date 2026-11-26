
const API_URL = "http://127.0.0.1:8000";

let currentLanguage = "en";

// =====================================================
// LANGUAGE SWITCHING
// =====================================================

function setLanguage(language) {
    currentLanguage = language;

    document.documentElement.lang = language;

    document.querySelectorAll("[data-en][data-hi]").forEach(element => {
        element.textContent = element.dataset[language];
    });

    document.getElementById("languageLabel").textContent =
        language === "en" ? "हिंदी" : "English";
}

document.getElementById("languageToggle").addEventListener("click", () => {
    setLanguage(currentLanguage === "en" ? "hi" : "en");
});


// =====================================================
// NAVIGATION
// =====================================================

function showPage(pageId) {

    const dashboard = document.getElementById("dashboard");

    dashboard.style.display =
        pageId === "dashboard" ? "block" : "none";

    document.querySelectorAll(".placeholder-section").forEach(section => {
        section.style.display =
            section.id === pageId ? "block" : "none";
    });

    document.querySelectorAll(".nav-link").forEach(link => {
        link.classList.toggle(
            "active",
            link.getAttribute("href") === `#${pageId}`
        );
    });

    const selectedLink = document.querySelector(
        `.nav-link[href="#${pageId}"]`
    );

    const breadcrumb = document.querySelector(".breadcrumb strong");

    if (breadcrumb && selectedLink) {
        breadcrumb.textContent = selectedLink.innerText.trim();
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

document.querySelectorAll('a[href^="#"]').forEach(link => {

    link.addEventListener("click", event => {

        const pageId = link.getAttribute("href").substring(1);

        if (document.getElementById(pageId)) {

            event.preventDefault();

            showPage(pageId);

            if (pageId === "schemes") {
                loadSchemes();
            }
        }
    });

});


// =====================================================
// GOVERNMENT SCHEMES
// =====================================================

function escapeHTML(value) {

    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);

}


function schemeCard(scheme) {

    const name = escapeHTML(scheme.scheme_name);

    const description = escapeHTML(
        scheme.description || ""
    );

    const eligibility = escapeHTML(
        scheme.eligibility || "Please check official guidelines."
    );

    const benefits = escapeHTML(
        scheme.benefits || ""
    );

    const level = escapeHTML(
        scheme.scheme_level || "Central"
    );

    const code = escapeHTML(
        scheme.scheme_code || ""
    );

    let officialLink = "#";

    try {

        const url = new URL(scheme.official_url);

        if (
            url.protocol === "https:" ||
            url.protocol === "http:"
        ) {
            officialLink = url.href;
        }

    } catch (error) {

        officialLink = "#";

    }

    return `
        <article class="scheme-card">

            <div class="scheme-card-top">

                <span class="scheme-tag">${level}</span>

                <span class="scheme-code">${code}</span>

            </div>

            <h3>${name}</h3>

            <p>${description}</p>

            <div class="scheme-detail">

                <strong>Benefits / लाभ</strong>

                <p>${benefits}</p>

            </div>

            <div class="scheme-detail">

                <strong>Eligibility / पात्रता</strong>

                <p>${eligibility}</p>

            </div>

            <a
                href="${officialLink}"
                target="_blank"
                rel="noopener noreferrer"
                class="scheme-official"
            >
                Official Website ↗
            </a>

        </article>
    `;

}


async function loadSchemes(endpoint = "/schemes/") {

    const container = document.getElementById("schemeResults");

    if (!container) return;

    container.innerHTML =
        "<p>Loading schemes... / योजनाएँ लोड हो रही हैं...</p>";

    try {

        const response = await fetch(API_URL + endpoint);

        if (!response.ok) {
            throw new Error("Unable to fetch schemes");
        }

        const result = await response.json();

        const schemes = result.data || [];

        document.getElementById("schemeCount").textContent =
            `${schemes.length} schemes found`;

        container.innerHTML = schemes.length
            ? schemes.map(schemeCard).join("")
            : "<p>No schemes found. / कोई योजना नहीं मिली।</p>";

    } catch (error) {

        container.innerHTML = `
            <p class="error-message">
                Unable to connect to the server.
                Please make sure FastAPI is running.
                <br>
                Server से कनेक्शन नहीं हो पाया।
            </p>
        `;

        console.error("Schemes error:", error);

    }

}


// =====================================================
// SCHEME SEARCH
// =====================================================

function searchSchemes() {

    const searchValue = document
        .getElementById("schemeSearch")
        .value.trim();

    if (!searchValue) {

        loadSchemes();

        return;

    }

    loadSchemes(
        "/schemes/search?name=" +
        encodeURIComponent(searchValue)
    );

}


// =====================================================
// STATE FILTER
// =====================================================

function filterSchemesByState() {

    const state = document.getElementById("stateFilter").value;

    if (!state) {

        loadSchemes();

        return;

    }

    loadSchemes(
        "/schemes/state/" +
        encodeURIComponent(state)
    );

}


// =====================================================
// INITIALIZE GOVERNMENT SCHEMES PAGE
// =====================================================

function initializeSchemesPage() {

    const section = document.getElementById("schemes");

    section.innerHTML = `

        <div class="module-header">

            <span class="eyebrow">FARMER SUPPORT</span>

            <h2>Government Schemes / सरकारी योजनाएँ</h2>

            <p>
                Explore government support available for farmers.
            </p>

        </div>

        <div class="scheme-controls">

            <input
                type="search"
                id="schemeSearch"
                placeholder="Search scheme name or code..."
            >

            <button id="schemeSearchButton">
                Search / खोजें
            </button>

            <select id="stateFilter">

                <option value="">
                    All India / सभी राज्य
                </option>

                <option value="Haryana">Haryana</option>

                <option value="Punjab">Punjab</option>

                <option value="Rajasthan">Rajasthan</option>

                <option value="Uttar Pradesh">Uttar Pradesh</option>

                <option value="Delhi">Delhi</option>

            </select>

        </div>

        <p id="schemeCount" class="scheme-count"></p>

        <div id="schemeResults" class="scheme-grid">

            <p>Loading schemes...</p>

        </div>

    `;

    document.getElementById("schemeSearchButton")
        .addEventListener("click", searchSchemes);

    document.getElementById("schemeSearch")
        .addEventListener("keydown", event => {

            if (event.key === "Enter") {
                searchSchemes();
            }

        });

    document.getElementById("stateFilter")
        .addEventListener("change", filterSchemesByState);

}


// =====================================================
// INITIALIZATION
// =====================================================

initializeSchemesPage();

setLanguage("en");

showPage("dashboard");

if (window.location.hash) {

    const initialPage = window.location.hash.substring(1);

    if (document.getElementById(initialPage)) {

        showPage(initialPage);

        if (initialPage === "schemes") {
            loadSchemes();
        }

    }

}

if (window.lucide) {
    lucide.createIcons();
}


// =====================================================
// CROP IMAGE UPLOAD AND PREVIEW
// =====================================================

const cropImageInput = document.getElementById("cropImageInput");

const chooseImageBtn = document.getElementById("chooseImageBtn");

const previewContainer = document.getElementById(
    "imagePreviewContainer"
);

const cropImagePreview = document.getElementById(
    "cropImagePreview"
);

const removeImageBtn = document.getElementById(
    "removeCropImageBtn"
);

const uploadArea = document.getElementById("uploadArea");

let selectedCropImage = null;


// Open file picker

chooseImageBtn.addEventListener("click", () => {

    cropImageInput.click();

});


// When image is selected

cropImageInput.addEventListener("change", event => {

    const file = event.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {

        alert("Please select a valid image.");

        cropImageInput.value = "";

        return;

    }

    if (file.size > 10 * 1024 * 1024) {

        alert("Image must be smaller than 10 MB.");

        cropImageInput.value = "";

        return;

    }

    // Revoke previous preview URL if one exists

    if (cropImagePreview.src.startsWith("blob:")) {
        URL.revokeObjectURL(cropImagePreview.src);
    }

    selectedCropImage = file;

    const imageURL = URL.createObjectURL(file);

    cropImagePreview.src = imageURL;

    uploadArea.hidden = true;

    previewContainer.hidden = false;

    // Hide previous results and errors

    document.getElementById("detectionResult").hidden = true;

    document.getElementById("detectionError").hidden = true;

});


// Remove selected image

removeImageBtn.addEventListener("click", () => {

    if (cropImagePreview.src.startsWith("blob:")) {

        URL.revokeObjectURL(cropImagePreview.src);

    }

    cropImageInput.value = "";

    cropImagePreview.src = "";

    selectedCropImage = null;

    previewContainer.hidden = true;

    uploadArea.hidden = false;

    document.getElementById("detectionResult").hidden = true;

    document.getElementById("detectionError").hidden = true;

});


// =====================================================
// AI DISEASE GUIDANCE DISPLAY
// =====================================================

function displayGuidanceList(elementId, items) {

    const list = document.getElementById(elementId);

    list.replaceChildren();

    if (!Array.isArray(items) || items.length === 0) {

        const item = document.createElement("li");

        item.textContent = "No information available.";

        list.appendChild(item);

        return;

    }

    items.forEach(text => {

        const item = document.createElement("li");

        item.textContent = String(text);

        list.appendChild(item);

    });

}


function displayDiseaseGuidance(guidance) {

    const guidanceBox = document.getElementById("diseaseGuidance");

    if (!guidance || typeof guidance !== "object") {

        guidanceBox.hidden = true;

        return;

    }

    document.getElementById("resultCause").textContent =
        guidance.cause || "Information not available.";

    displayGuidanceList(
        "resultSymptoms",
        guidance.symptoms
    );

    displayGuidanceList(
        "resultPrevention",
        guidance.prevention
    );

    document.getElementById("resultAdvice").textContent =
        guidance.advice || "Please consult a local agriculture expert.";

    guidanceBox.hidden = false;

}


// =====================================================
// AI CROP DISEASE PREDICTION
// =====================================================

const analyzeCropBtn = document.getElementById("analyzeCropBtn");

const loadingBox = document.getElementById("detectionLoading");

const resultBox = document.getElementById("detectionResult");

const errorBox = document.getElementById("detectionError");

const guidanceBox = document.getElementById("diseaseGuidance");


analyzeCropBtn.addEventListener("click", async () => {

    if (!selectedCropImage) {

        alert("Please select a crop image first.");

        return;

    }

    const formData = new FormData();

    formData.append("file", selectedCropImage);

    loadingBox.hidden = false;

    resultBox.hidden = true;

    errorBox.hidden = true;

    guidanceBox.hidden = true;

    analyzeCropBtn.disabled = true;

    try {

        const response = await fetch(
            `${API_URL}/api/vision/upload`,
            {
                method: "POST",
                body: formData
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {

            throw new Error(
                data.detail || "Crop analysis failed."
            );

        }

        const prediction = data.prediction;

        // Basic prediction details

        document.getElementById("resultCrop").textContent =
            prediction.crop_name || "-";

        document.getElementById("resultDisease").textContent =
            prediction.disease_name || "-";

        document.getElementById("resultConfidence").textContent =
            `${prediction.confidence ?? 0}%`;

        document.getElementById("resultStatus").textContent =
            prediction.status || "-";


        // Disease cause, symptoms, prevention and advice

        displayDiseaseGuidance(prediction.guidance);


        // Display complete prediction result

        resultBox.hidden = false;


        // Refresh Lucide icons

        if (window.lucide) {
            lucide.createIcons();
        }

    } catch (error) {

        errorBox.textContent = error.message;

        errorBox.hidden = false;

        console.error("Crop prediction error:", error);

    } finally {

        loadingBox.hidden = true;

        analyzeCropBtn.disabled = false;

    }

});
// =====================================================
// DEMO FARMER LOGIN - NOT REAL AUTHENTICATION
// =====================================================

const loginScreen = document.getElementById("loginScreen");
const appContainer = document.getElementById("appContainer");

const phoneLoginSection = document.getElementById("phoneLoginSection");
const otpLoginSection = document.getElementById("otpLoginSection");

const loginPhone = document.getElementById("loginPhone");
const demoOtp = document.getElementById("demoOtp");

const sendOtpBtn = document.getElementById("sendOtpBtn");
const verifyOtpBtn = document.getElementById("verifyOtpBtn");
const backToPhoneBtn = document.getElementById("backToPhoneBtn");

const loginError = document.getElementById("loginError");

let demoFarmer = null;


// Demo OTP generation step

sendOtpBtn.addEventListener("click", () => {

    const phone = loginPhone.value.trim();

    loginError.hidden = true;

    if (!/^[6-9]\d{9}$/.test(phone)) {

        loginError.textContent =
            "Please enter a valid 10-digit Indian mobile number.";

        loginError.hidden = false;

        return;
    }

    demoFarmer = {
        name: "Farmer",
        phone: phone
    };

    phoneLoginSection.hidden = true;
    otpLoginSection.hidden = false;

    demoOtp.value = "";

});


// Demo OTP verification


verifyOtpBtn.addEventListener("click", () => {

    const enteredOtp = demoOtp.value.trim();

    loginError.hidden = true;

    if (enteredOtp !== "123456") {
        loginError.textContent =
            "Incorrect OTP. Please enter 123456.";

        loginError.hidden = false;
        return;
    }

    loginScreen.hidden = true;
    appContainer.hidden = false;

    // Reset dashboard layout
    appContainer.style.removeProperty("display");

    const dashboard = document.getElementById("dashboard");

    dashboard.style.display = "block";
    dashboard.hidden = false;

    // Hide other sections
    document.querySelectorAll(".placeholder-section").forEach(section => {
        section.style.display = "none";
    });

    // Update navigation
    document.querySelectorAll(".nav-link").forEach(link => {
        link.classList.toggle(
            "active",
            link.getAttribute("href") === "#dashboard"
        );
    });

    // Update farmer avatar
    const avatar = document.querySelector(".profile-avatar");

    if (avatar) {
        avatar.textContent = "👨‍🌾";
        avatar.title = `+91 ${demoFarmer.phone}`;
    }

    // Update URL
    history.replaceState(null, "", "#dashboard");

    window.scrollTo(0, 0);

    if (window.lucide) {
        lucide.createIcons();
    }

});

