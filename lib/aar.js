/**
 * AAR (After Action Report) Module
 *
 * This module handles all AAR-related functionality including:
 * - Ship selection dropdowns
 * - Location and POI selection
 * - AAR form data collection and preview generation
 * - Clipboard copying functionality
 */

import { SHIPS, LOCATIONS } from './constants.js';
import { ships } from './shipAssignment.js';

// ============================================================================
// CAP DROPDOWN MANAGEMENT
// ============================================================================

let capDropdownCounter = 0;

function addCAPShipDropdown(preselectedShip = null) {
    const container = document.getElementById("aar-cap-container");
    if (!container) return;

    const dropdownId = `aar-cap-${capDropdownCounter}`;
    capDropdownCounter++;

    const wrapperId = `${dropdownId}-wrapper`;
    
    const uniqueAssignedShips = [...new Set(ships.map(s => s.ship).filter(s => s && s.trim()))];

    let optionsHtml = '';
    
    if (uniqueAssignedShips.length > 0) {
        optionsHtml += '<div class="px-3 py-2 text-xs font-semibold uppercase text-blue-300 bg-gray-800">From Assignments</div>';
        uniqueAssignedShips.forEach(ship => {
            optionsHtml += `<div class="custom-select-option cursor-pointer px-3 py-2 text-sm text-gray-300 hover:bg-blue-600 hover:text-white" data-value="${ship}">${ship}</div>`;
        });
        optionsHtml += '<div class="border-t border-gray-600 my-1"></div>';
        optionsHtml += '<div class="px-3 py-2 text-xs font-semibold uppercase text-blue-300 bg-gray-800">All Ships</div>';
    }

    SHIPS.forEach(ship => {
        optionsHtml += `<div class="custom-select-option cursor-pointer px-3 py-2 text-sm text-gray-300 hover:bg-blue-600 hover:text-white" data-value="${ship}">${ship}</div>`;
    });

    const html = `
        <div id="${wrapperId}" class="cap-ship-wrapper mb-3 flex gap-2 items-end">
            <div class="flex-1">
                <div class="custom-select-wrapper relative">
                    <div class="custom-select-trigger flex items-center justify-between rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-gray-300 cursor-pointer hover:border-primary-500" id="${dropdownId}">
                        <span class="custom-select-value">${preselectedShip || 'Select CAP ship...'}</span>
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                        </svg>
                    </div>
                    <div class="custom-select-options hidden absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        ${optionsHtml}
                    </div>
                </div>
            </div>
            <button onclick="removeCAPShipDropdown('${wrapperId}')" class="px-3 py-2 rounded-md border border-red-600 bg-red-700 text-white text-sm hover:bg-red-800">Remove</button>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', html);
    initializeCAPDropdown(dropdownId);

    // If a ship was selected and we're not at max, add a new empty one
    if (preselectedShip) {
        addCAPShipDropdown();
    }
}

function removeCAPShipDropdown(wrapperId) {
    const wrapper = document.getElementById(wrapperId);
    if (wrapper) {
        wrapper.remove();
    }
}

function initializeCAPDropdown(dropdownId) {
    const trigger = document.getElementById(dropdownId);
    if (!trigger) return;

    const wrapper = trigger.closest('.custom-select-wrapper');
    const optionsContainer = wrapper.querySelector('.custom-select-options');
    const valueDisplay = trigger.querySelector('.custom-select-value');

    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        optionsContainer.classList.toggle('hidden');
    });

    const options = optionsContainer.querySelectorAll('.custom-select-option');
    options.forEach(option => {
        option.addEventListener('click', (e) => {
            const value = e.target.getAttribute('data-value');
            valueDisplay.textContent = value;
            optionsContainer.classList.add('hidden');

            // Auto-add next dropdown
            const wrapperId = trigger.closest('.cap-ship-wrapper').id;
            const container = document.getElementById("aar-cap-container");
            const lastChild = container.lastElementChild;
            
            if (lastChild && lastChild.id === wrapperId) {
                addCAPShipDropdown();
            }
        });
    });

    document.addEventListener('click', () => {
        optionsContainer.classList.add('hidden');
    });
}

function getSelectedCAPShips() {
    const container = document.getElementById("aar-cap-container");
    if (!container) return [];

    const ships = [];
    container.querySelectorAll('.cap-ship-wrapper').forEach(wrapper => {
        const valueSpan = wrapper.querySelector('.custom-select-value');
        const value = valueSpan.textContent.trim();
        if (value && !value.includes('Select')) {
            ships.push(value);
        }
    });
    return ships;
}

function clearCAPShips() {
    const container = document.getElementById("aar-cap-container");
    if (!container) return;

    const wrappers = container.querySelectorAll('.cap-ship-wrapper');
    wrappers.forEach(wrapper => wrapper.remove());

    capDropdownCounter = 0;
    const emptyMsg = document.getElementById("aar-cap-empty");
    if (emptyMsg) emptyMsg.classList.remove("hidden");
}

// ============================================================================
// SHIP DROPDOWN POPULATION
// ============================================================================

function populateAARShipDropdown(selectId, assignedShips, preselectedShip = null, includeNone = false) {
    const selectElement = document.getElementById(selectId);
    if (!selectElement) return;

    let options = '';

    if (includeNone) {
        options += '<option value="">None</option>';
    }

    if (assignedShips.length > 0) {
        options += '<optgroup label="From Assignments">';
        assignedShips.forEach(ship => {
            options += `<option value="${ship}" ${preselectedShip === ship ? 'selected' : ''}>${ship}</option>`;
        });
        options += '</optgroup>';
        options += '<optgroup label="All Ships">';
    }

    SHIPS.forEach(ship => {
        options += `<option value="${ship}" ${preselectedShip === ship ? 'selected' : ''}>${ship}</option>`;
    });

    selectElement.innerHTML = options;

    if (preselectedShip) {
        selectElement.value = preselectedShip;
    }
}

function populateAARShipDropdowns() {
    const assignedShips = ships.map(s => s.ship).filter(s => s && s.trim() !== "");
    const uniqueShips = [...new Set(assignedShips)];

    const gunshipAssignment = ships.find(s => s.type === "Gunship" && s.ship && s.ship.trim() !== "");
    const medshipAssignment = ships.find(s => s.type === "Medship" && s.ship && s.ship.trim() !== "");

    populateAARShipDropdown("aar-gunship", uniqueShips, gunshipAssignment?.ship || null, false);
    populateAARShipDropdown("aar-medical", uniqueShips, medshipAssignment?.ship || null, true);

    populateCAPFromAssignments();
}

function populateCAPFromAssignments() {
    const container = document.getElementById("aar-cap-container");
    if (!container) return;

    container.querySelectorAll(".cap-ship-wrapper").forEach(wrapper => wrapper.remove());
    capDropdownCounter = 0;

    const capShips = ships.filter(s => s.type === "CAP" && s.ship && s.ship.trim() !== "");

    if (capShips.length === 0) {
        const emptyMsg = document.getElementById("aar-cap-empty");
        if (emptyMsg) emptyMsg.classList.remove("hidden");
    } else {
        const emptyMsg = document.getElementById("aar-cap-empty");
        if (emptyMsg) emptyMsg.classList.add("hidden");

        capShips.forEach(capShip => {
            addCAPShipDropdown(capShip.ship);
        });
    }
}

// ============================================================================
// LOCATION DROPDOWNS
// ============================================================================

function populateAARPlanetDropdown() {
    const select = document.getElementById("aar-planet");
    if (!select) return;

    let options = '<option value="">Select location...</option>';

    Object.keys(LOCATIONS).forEach(key => {
        const location = LOCATIONS[key];
        options += `<option value="${location.name}">${location.name}</option>`;
    });

    select.innerHTML = options;

    select.addEventListener('change', () => {
        populatePOIDropdown(select.value);
    });
}

function populatePOIDropdown(locationName) {
    const select = document.getElementById("aar-poi");
    if (!select) return;

    let options = '<option value="">Select POI...</option>';

    Object.keys(LOCATIONS).forEach(key => {
        const location = LOCATIONS[key];
        if (location.name === locationName && location.pois) {
            location.pois.forEach(poi => {
                options += `<option value="${poi}">${poi}</option>`;
            });
        }
    });

    select.innerHTML = options;
}

// ============================================================================
// AAR DATA COLLECTION
// ============================================================================

function getAARData() {
    return {
        gunship: document.getElementById("aar-gunship")?.value || "",
        medical: document.getElementById("aar-medical")?.value || "",
        capShips: getSelectedCAPShips(),
        additionalShips: document.getElementById("aar-additional-ships")?.value || "",
        planet: document.getElementById("aar-planet")?.value || "",
        poi: document.getElementById("aar-poi")?.value || "",
        extractionPoint: document.getElementById("aar-extraction")?.value || "",
        reason: document.getElementById("aar-reason")?.value || "",
        outcome: document.getElementById("aar-outcome")?.value || "",
        casualties: document.getElementById("aar-casualties")?.value || "",
        notes: document.getElementById("aar-notes")?.value || ""
    };
}

function generateAAROutput() {
    const data = getAARData();
    
    let output = "# __⚕️ AFTER ACTION REPORT ⚕️__\n\n";
    output += "## Ships Used\n";
    output += `- **Gunship:** ${data.gunship || "None"}\n`;
    output += `- **Medical:** ${data.medical || "None"}\n`;
    
    if (data.capShips.length > 0) {
        output += `- **CAP Ships:** ${data.capShips.join(", ")}\n`;
    }
    
    if (data.additionalShips) {
        output += `- **Additional:** ${data.additionalShips}\n`;
    }
    
    output += "\n## Mission Location\n";
    output += `- **Planet:** ${data.planet || "Unknown"}\n`;
    output += `- **POI:** ${data.poi || "Unknown"}\n`;
    
    if (data.extractionPoint) {
        output += `- **Extraction:** ${data.extractionPoint}\n`;
    }
    
    output += "\n## Mission Details\n";
    if (data.reason) output += `- **Reason:** ${data.reason}\n`;
    if (data.outcome) output += `- **Outcome:** ${data.outcome}\n`;
    if (data.casualties) output += `- **Casualties:** ${data.casualties}\n`;
    
    if (data.notes) {
        output += `\n## Notes\n${data.notes}\n`;
    }
    
    const timestamp = Math.floor(Date.now() / 1000);
    output += `\n-# Generated <t:${timestamp}:R>`;

    return output;
}

function updateAARPreview() {
    const preview = document.getElementById("aar-preview");
    if (!preview) return;

    const data = getAARData();
    const hasData = data.gunship || data.medical || data.capShips.length > 0 || data.planet || data.poi;

    if (!hasData) {
        preview.textContent = "Fill in AAR details to see preview...";
    } else {
        preview.textContent = generateAAROutput();
    }
}

function copyAARToClipboard() {
    const output = generateAAROutput();

    if (!navigator.clipboard) {
        try {
            const textArea = document.createElement("textarea");
            textArea.value = output;
            textArea.style.position = "fixed";
            textArea.style.top = "0";
            textArea.style.left = "0";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            showAARSuccess();
        } catch (err) {
            console.error("Failed to copy:", err);
            alert("Failed to copy to clipboard");
        }
        return;
    }

    navigator.clipboard.writeText(output)
        .then(() => {
            showAARSuccess();
        })
        .catch(err => {
            console.error("Failed to copy:", err);
            alert("Failed to copy to clipboard");
        });
}

function showAARSuccess() {
    const successMessage = document.getElementById("aar-successMessage");
    if (successMessage) {
        successMessage.classList.remove("hidden");
        setTimeout(() => {
            successMessage.classList.add("hidden");
        }, 3000);
    }
}

function clearAARForm() {
    const inputs = document.querySelectorAll("#aar-form input, #aar-form select, #aar-form textarea");
    inputs.forEach(input => {
        input.value = "";
    });

    clearCAPShips();
    updateAARPreview();
}

function initializeAARForm() {
    populateAARPlanetDropdown();
    populateAARShipDropdowns();

    // Add change listeners for live preview
    const inputs = document.querySelectorAll("#aar-form input, #aar-form select, #aar-form textarea");
    inputs.forEach(input => {
        input.addEventListener('change', updateAARPreview);
        input.addEventListener('input', updateAARPreview);
    });
}

export {
    populateAARPlanetDropdown,
    populateAARShipDropdowns,
    populateCAPFromAssignments,
    addCAPShipDropdown,
    removeCAPShipDropdown,
    getSelectedCAPShips,
    clearCAPShips,
    getAARData,
    generateAAROutput,
    updateAARPreview,
    copyAARToClipboard,
    clearAARForm,
    initializeAARForm
};
