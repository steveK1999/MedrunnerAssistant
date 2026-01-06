/**
 * Integration file for Ship Assignment and AAR modules in MedrunnerAssistant
 * 
 * This file loads and initializes the Ship Assignment and AAR modules
 * and exposes their functions globally for HTML onclick handlers
 */

// Dynamic import of the modules
let shipAssignmentModule;
let aarModule;

// Function to initialize the modules
async function initializeShipAndAARModules() {
    try {
        // Import the modules
        const constants = await import('../lib/constants.js');
        shipAssignmentModule = await import('../lib/shipAssignment.js');
        aarModule = await import('../lib/aar.js');

        // Make SHIPS and EMOJIS global for use in HTML
        window.SHIPS = constants.SHIPS;
        window.EMOJIS = constants.EMOJIS;

        // Expose all ship assignment functions globally
        window.addShip = shipAssignmentModule.addShip;
        window.removeShip = shipAssignmentModule.removeShip;
        window.updateShipType = shipAssignmentModule.updateShipType;
        window.updateShipName = shipAssignmentModule.updateShipName;
        window.addCrewMember = shipAssignmentModule.addCrewMember;
        window.removeCrewMember = shipAssignmentModule.removeCrewMember;
        window.updateCrewRole = shipAssignmentModule.updateCrewRole;
        window.updateCrewPosition = shipAssignmentModule.updateCrewPosition;
        window.updateCrewName = shipAssignmentModule.updateCrewName;
        window.updateCrewDiscordId = shipAssignmentModule.updateCrewDiscordId;
        window.updateCrewComment = shipAssignmentModule.updateCrewComment;
        window.renderShips = shipAssignmentModule.renderShips;
        window.generateOutput = shipAssignmentModule.generateOutput;
        window.updatePreview = shipAssignmentModule.updatePreview;
        window.copyToClipboard = shipAssignmentModule.copyToClipboard;
        window.importFromDiscord = shipAssignmentModule.importFromDiscord;
        window.openImportModal = shipAssignmentModule.openImportModal;
        window.closeImportModal = shipAssignmentModule.closeImportModal;
        window.confirmClearShipAssignments = shipAssignmentModule.confirmClearShipAssignments;
        window.updateCrewNameDatalist = shipAssignmentModule.updateCrewNameDatalist;

        // Expose all AAR functions globally
        window.populateAARPlanetDropdown = aarModule.populateAARPlanetDropdown;
        window.populateAARShipDropdowns = aarModule.populateAARShipDropdowns;
        window.addCAPShipDropdown = aarModule.addCAPShipDropdown;
        window.removeCAPShipDropdown = aarModule.removeCAPShipDropdown;
        window.getSelectedCAPShips = aarModule.getSelectedCAPShips;
        window.clearCAPShips = aarModule.clearCAPShips;
        window.getAARData = aarModule.getAARData;
        window.generateAAROutput = aarModule.generateAAROutput;
        window.updateAARPreview = aarModule.updateAARPreview;
        window.copyAARToClipboard = aarModule.copyAARToClipboard;
        window.clearAARForm = aarModule.clearAARForm;
        window.initializeAARForm = aarModule.initializeAARForm;

        // Load saved ship assignments
        shipAssignmentModule.loadShipAssignments();
        shipAssignmentModule.renderShips();
        shipAssignmentModule.updatePreview();

        // Initialize AAR form
        aarModule.initializeAARForm();

        console.log('Ship Assignment and AAR modules initialized successfully');
    } catch (error) {
        console.error('Failed to initialize Ship Assignment and AAR modules:', error);
    }
}

// Don't auto-initialize - let renderer.js handle initialization during DOMContentLoaded

// Tab switching function (if not already defined)
function switchTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
    });

    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab content
    const selectedTab = document.querySelector(`[data-tab="${tabName}"]`);
    if (selectedTab) {
        selectedTab.classList.add('active');
        selectedTab.style.display = 'block';
    }

    // Add active class to clicked button
    const selectedBtn = document.querySelector(`[data-tab="${tabName}"]`).closest('.tab-btn') || 
                        document.querySelector(`[data-tab="${tabName}"]`);
    if (selectedBtn && selectedBtn.classList.contains('tab-btn')) {
        selectedBtn.classList.add('active');
    }

    // Special handling for AAR tab - initialize if switching to AAR
    if (tabName === 'aar' && window.populateAARShipDropdowns) {
        window.populateAARShipDropdowns();
    }
}

// Placeholder function for loading ships (if used)
function loadShips() {
    console.log('Loading ships...');
    // This can be extended to load ships from the API if needed
}

export { initializeShipAndAARModules, switchTab };
