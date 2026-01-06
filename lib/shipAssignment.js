/**
 * Ship Assignment Module
 *
 * This module handles all ship assignment related functionality including:
 * - Ship management (add, remove, update)
 * - Crew member management (add, remove, update)
 * - Drag and drop functionality for crew members
 * - Discord import/export functionality
 * - Preview generation and clipboard operations
 */

import { SHIPS, EMOJIS } from './constants.js';

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

let ships = [];
let shipIdCounter = 0;
let draggedElement = null;
let draggedShipId = null;

const EMOJI_TO_ROLE = {};
const EMOJI_TO_POSITION = {};

// Build reverse mappings
Object.keys(EMOJIS.roles).forEach(role => {
    const emoji = EMOJIS.roles[role];
    EMOJI_TO_ROLE[emoji] = role;
});

Object.keys(EMOJIS.positions).forEach(pos => {
    const emoji = EMOJIS.positions[pos];
    EMOJI_TO_POSITION[emoji] = pos;
});

const SHIP_ASSIGNMENTS_STORAGE_KEY = "mrs_ship_assignments";

// ============================================================================
// CACHED CREW NAMES
// ============================================================================

/**
 * Gets cached crew names from localStorage
 */
function getCachedCrewNames() {
    try {
        const cached = localStorage.getItem("mrs_cached_crew_names");
        return cached ? JSON.parse(cached) : [];
    } catch (e) {
        return [];
    }
}

/**
 * Saves a crew name to cache
 */
function cacheCrewName(name) {
    if (!name || !name.trim()) return;
    
    try {
        const cached = getCachedCrewNames();
        const lowerName = name.toLowerCase();
        
        if (!cached.some(n => n.toLowerCase() === lowerName)) {
            cached.push(name);
            localStorage.setItem("mrs_cached_crew_names", JSON.stringify(cached));
        }
    } catch (e) {
        console.warn("Failed to cache crew name:", e);
    }
}

/**
 * Lists all cached crew names
 */
function listCachedCrew() {
    console.log("Cached Crew Names:", getCachedCrewNames());
}

// ============================================================================
// PERSISTENCE
// ============================================================================

function saveShipAssignments() {
    try {
        const data = {
            ships: ships,
            shipIdCounter: shipIdCounter,
            savedAt: Date.now()
        };
        localStorage.setItem(SHIP_ASSIGNMENTS_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.warn("Failed to save ship assignments:", e);
    }
}

function loadShipAssignments() {
    try {
        const stored = localStorage.getItem(SHIP_ASSIGNMENTS_STORAGE_KEY);
        if (stored) {
            const data = JSON.parse(stored);
            if (data.ships && Array.isArray(data.ships)) {
                ships = data.ships;
                shipIdCounter = data.shipIdCounter || 0;
                return true;
            }
        }
    } catch (e) {
        console.warn("Failed to load ship assignments:", e);
    }
    return false;
}

function clearShipAssignments() {
    localStorage.removeItem(SHIP_ASSIGNMENTS_STORAGE_KEY);
    ships = [];
    shipIdCounter = 0;
    renderShips();
    updatePreview();
    console.log("Ship assignments cleared");
}

function getShipAssignmentsSavedTime() {
    try {
        const stored = localStorage.getItem(SHIP_ASSIGNMENTS_STORAGE_KEY);
        if (stored) {
            const data = JSON.parse(stored);
            return data.savedAt ? new Date(data.savedAt) : null;
        }
    } catch (e) {
        return null;
    }
    return null;
}

// ============================================================================
// SHIP MANAGEMENT
// ============================================================================

function addShip() {
    const shipId = shipIdCounter++;
    let shipType = "Gunship";

    const hasGunship = ships.some(s => s.type === "Gunship");
    const hasMedship = ships.some(s => s.type === "Medship");

    if (hasGunship && !hasMedship) {
        shipType = "Medship";
    } else if (hasGunship && hasMedship) {
        shipType = "CAP";
    }

    ships.push({
        id: shipId,
        type: shipType,
        ship: "",
        crew: []
    });
    renderShips();
    updatePreview();
    saveShipAssignments();
}

function removeShip(shipId) {
    ships = ships.filter(s => s.id !== shipId);
    renderShips();
    updatePreview();
    saveShipAssignments();
}

function updateShipType(shipId, type) {
    const ship = ships.find(s => s.id === shipId);
    if (ship) {
        ship.type = type;
        updatePreview();
        saveShipAssignments();
    }
}

function updateShipName(shipId, name) {
    const ship = ships.find(s => s.id === shipId);
    if (ship) {
        ship.ship = name;
        updatePreview();
        saveShipAssignments();
    }
}

// ============================================================================
// CREW MANAGEMENT
// ============================================================================

function addCrewMember(shipId) {
    const ship = ships.find(s => s.id === shipId);
    if (!ship) return;

    let newRole = "SEC";

    switch (ship.type) {
        case "Gunship":
            const gunshipCrewCount = ship.crew.length;
            if (gunshipCrewCount === 0) {
                newRole = "PIL";
            } else if (gunshipCrewCount === 1) {
                newRole = "LEAD";
            } else if (gunshipCrewCount === 2) {
                newRole = "MED";
            } else {
                newRole = "SEC";
            }
            break;
        case "Medship":
            newRole = ship.crew.length === 0 ? "MED" : "SEC";
            break;
        case "CAP":
            newRole = ship.crew.length === 0 ? "CAP" : "SEC";
            break;
        default:
            newRole = "SEC";
    }

    let newPosition = null;
    let highestNumber = 0;

    ships.forEach(s => {
        s.crew.forEach(c => {
            if (c.position && c.position > highestNumber) {
                highestNumber = c.position;
            }
        });
    });

    if (highestNumber < 9) {
        newPosition = highestNumber + 1;
    } else if (highestNumber === 0) {
        newPosition = null;
    }

    ship.crew.push({
        id: Date.now(),
        role: newRole,
        position: newPosition,
        name: "",
        discordId: "",
        comment: ""
    });

    renderShips();
    updatePreview();
    saveShipAssignments();
    updateCrewNameDatalist();
}

function removeCrewMember(shipId, crewId) {
    const ship = ships.find(s => s.id === shipId);
    if (!ship) return;

    let removedPosition = null;
    const crewMemberToRemove = ship.crew.find(c => c.id === crewId);

    if (crewMemberToRemove) {
        removedPosition = crewMemberToRemove.position;
    }

    ship.crew = ship.crew.filter(c => c.id !== crewId);

    if (removedPosition) {
        ships.forEach(s => {
            s.crew.forEach(c => {
                if (c.position && c.position > removedPosition) {
                    c.position -= 1;
                }
            });
        });
    }

    renderShips();
    updatePreview();
    saveShipAssignments();
    updateCrewNameDatalist();
}

function updateCrewRole(shipId, crewId, role) {
    const ship = ships.find(s => s.id === shipId);
    if (ship) {
        const crew = ship.crew.find(c => c.id === crewId);
        if (crew) {
            crew.role = role;
            updatePreview();
            saveShipAssignments();
        }
    }
}

function updateCrewPosition(shipId, crewId, position) {
    const ship = ships.find(s => s.id === shipId);
    if (ship) {
        const crew = ship.crew.find(c => c.id === crewId);
        if (crew) {
            crew.position = position ? parseInt(position) : null;
            updatePreview();
            saveShipAssignments();
        }
    }
}

function updateCrewName(shipId, crewId, name) {
    const ship = ships.find(s => s.id === shipId);
    if (ship) {
        const crew = ship.crew.find(c => c.id === crewId);
        if (crew) {
            crew.name = name;
            cacheCrewName(name);
            updatePreview();
            saveShipAssignments();
        }
    }
}

function onCrewNameChange(shipId, crewId, name) {
    const ship = ships.find(s => s.id === shipId);
    if (!ship) return;
    
    const crew = ship.crew.find(c => c.id === crewId);
    if (!crew) return;

    // Update the name
    crew.name = name;
    cacheCrewName(name);
    
    updatePreview();
    saveShipAssignments();
    renderShips();
}

function updateCrewDiscordId(shipId, crewId, discordId) {
    const ship = ships.find(s => s.id === shipId);
    if (ship) {
        const crew = ship.crew.find(c => c.id === crewId);
        if (crew) {
            crew.discordId = discordId;
            updatePreview();
            saveShipAssignments();
        }
    }
}

function updateCrewComment(shipId, crewId, comment) {
    const ship = ships.find(s => s.id === shipId);
    if (ship) {
        const crew = ship.crew.find(c => c.id === crewId);
        if (crew) {
            crew.comment = comment;
            updatePreview();
            saveShipAssignments();
        }
    }
}

// ============================================================================
// CREW NAME DATALIST
// ============================================================================

function updateCrewNameDatalist() {
    const datalist = document.getElementById("crew-name-suggestions");
    const discordDatalist = document.getElementById("crew-discord-suggestions");
    if (!datalist || !discordDatalist) return;

    const cachedNames = getCachedCrewNames();
    
    datalist.innerHTML = "";
    discordDatalist.innerHTML = "";
    
    const assignedNames = new Set();
    const assignedDiscordIds = new Set();
    ships.forEach(ship => {
        ship.crew.forEach(crew => {
            if (crew.name && crew.name.trim()) {
                assignedNames.add(crew.name.trim().toLowerCase());
            }
            if (crew.discordId && crew.discordId.trim()) {
                assignedDiscordIds.add(crew.discordId.trim());
            }
        });
    });
    
    const availableNames = cachedNames.filter(name => 
        !assignedNames.has(name.toLowerCase())
    );

    availableNames.forEach(name => {
        const option = document.createElement("option");
        option.value = name;
        datalist.appendChild(option);
    });
}

// ============================================================================
// RENDERING
// ============================================================================

function renderShips() {
    const container = document.getElementById("ships-container");
    if (!container) return;

    container.innerHTML = ships.map(ship => `
        <div class="ship-card mb-4 rounded-lg border border-gray-600 bg-gray-800 p-4">
            <!-- Ship Header -->
            <div class="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:gap-4">
                <!-- Ship Type -->
                <select onchange="updateShipType(${ship.id}, this.value)" class="flex-1 rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-gray-300">
                    <option value="Gunship" ${ship.type === 'Gunship' ? 'selected' : ''}>Gunship</option>
                    <option value="Medship" ${ship.type === 'Medship' ? 'selected' : ''}>Medship</option>
                    <option value="CAP" ${ship.type === 'CAP' ? 'selected' : ''}>CAP</option>
                </select>
                
                <!-- Ship Name -->
                <select onchange="updateShipName(${ship.id}, this.value)" class="flex-1 rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-gray-300">
                    <option value="">Select ship...</option>
                    ${SHIPS.map(shipName => `<option value="${shipName}" ${ship.ship === shipName ? 'selected' : ''}>${shipName}</option>`).join('')}
                </select>
                
                <!-- Add Crew Button -->
                <button onclick="addCrewMember(${ship.id})" class="btn btn-success">➕ Add Crew</button>
                
                <!-- Remove Ship Button -->
                <button onclick="removeShip(${ship.id})" class="btn btn-danger">🗑️ Remove Ship</button>
            </div>

            <!-- Crew List -->
            <div class="crew-list flex flex-col gap-2">
                ${ship.crew.map(crew => `
                    <div class="crew-member" style="display: grid; grid-template-columns: auto auto 1fr 1fr 1fr auto; gap: 0.75rem; align-items: center; padding: 0.75rem; background: var(--surface); border: 1px solid var(--border); border-radius: 8px;">
                        <!-- Position -->
                        <select onchange="updateCrewPosition(${ship.id}, ${crew.id}, this.value)" class="crew-select" style="width: 70px; text-align: center;">
                            <option value="">Position</option>
                            ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => `<option value="${num}" ${crew.position === num ? 'selected' : ''}>${num}</option>`).join('')}
                        </select>
                        
                        <!-- Role -->
                        <select onchange="updateCrewRole(${ship.id}, ${crew.id}, this.value)" class="crew-select" style="width: 80px;">
                            <option value="PIL" ${crew.role === 'PIL' ? 'selected' : ''}>PIL</option>
                            <option value="LEAD" ${crew.role === 'LEAD' ? 'selected' : ''}>LEAD</option>
                            <option value="MED" ${crew.role === 'MED' ? 'selected' : ''}>MED</option>
                            <option value="SEC" ${crew.role === 'SEC' ? 'selected' : ''}>SEC</option>
                            <option value="CAP" ${crew.role === 'CAP' ? 'selected' : ''}>CAP</option>
                        </select>
                        
                        <!-- Discord ID -->
                        <input type="text" placeholder="Discord ID" value="${crew.discordId || ''}" list="crew-discord-suggestions" onchange="updateCrewDiscordId(${ship.id}, ${crew.id}, this.value)" class="crew-input">
                        
                        <!-- Name -->
                        <input type="text" placeholder="Name" value="${crew.name || ''}" onchange="updateCrewName(${ship.id}, ${crew.id}, this.value)" list="crew-name-suggestions" class="crew-input">
                        
                        <!-- Comment -->
                        <input type="text" placeholder="Comment" value="${crew.comment || ''}" onchange="updateCrewComment(${ship.id}, ${crew.id}, this.value)" class="crew-input">
                        
                        <!-- Remove Button -->
                        <button onclick="removeCrewMember(${ship.id}, ${crew.id})" class="btn btn-danger" style="padding: 0.5rem 0.75rem; font-size: 0.85rem; white-space: nowrap;">🗑️</button>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function generateOutput() {
    const timestamp = Math.floor(Date.now() / 1000);
    let output = `# __${EMOJIS.header}SHIP ASSIGNMENTS${EMOJIS.header}__\n\n`;

    ships.forEach(ship => {
        if (ship.crew.length > 0) {
            const shipTypeEmoji = EMOJIS.shipTypes[ship.type] || "🚀";
            output += `## __**${ship.type}**__ ${shipTypeEmoji} ${ship.ship}\n`;

            ship.crew.forEach(crew => {
                const roleEmoji = EMOJIS.roles[crew.role] || "👤";
                const mention = crew.discordId ? `<@${crew.discordId}>` : "[No Discord ID]";

                let positionText = "";
                if (crew.position) {
                    const positionEmoji = EMOJIS.positions[crew.position] || crew.position;
                    positionText = ` ${positionEmoji}`;
                }

                let commentText = "";
                if (crew.comment && crew.comment.trim() !== "") {
                    commentText = ` (${crew.comment.trim()})`;
                }

                output += `> ${roleEmoji} - ${mention}${positionText}${commentText}\n`;
            });

            output += "\n";
        }
    });

    output += `-# Updated <t:${timestamp}:R>`;
    return output;
}

function updatePreview() {
    const preview = document.getElementById("preview");
    if (!preview) return;

    if (ships.length === 0 || ships.every(s => s.crew.length === 0)) {
        preview.textContent = "Add ships and crew members to see preview...";
    } else {
        preview.textContent = generateOutput();
    }
}

function copyToClipboard() {
    const output = generateOutput();

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
            showSuccessMessage();
        } catch (err) {
            console.error("Fallback: Oops, unable to copy", err);
            alert("Failed to copy to clipboard. Please try again.");
        }
        return;
    }

    navigator.clipboard.writeText(output)
        .then(() => {
            showSuccessMessage();
        })
        .catch(err => {
            alert("Failed to copy to clipboard. Please try again.");
            console.error("Failed to copy:", err);
        });
}

function showSuccessMessage() {
    const successMessage = document.getElementById("successMessage");
    if (successMessage) {
        successMessage.classList.remove("hidden");
        setTimeout(() => {
            successMessage.classList.add("hidden");
        }, 3000);
    }
}

// ============================================================================
// DISCORD IMPORT
// ============================================================================

function parseDiscordMessage(message) {
    const parsedShips = [];
    let currentShipId = 0;
    const lines = message.split("\n");
    let currentShip = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (!line) continue;
        if (line.match(/^#\s+__/)) continue;
        if (line.startsWith("-#")) continue;

        const shipMatch = line.match(/^##\s*__\*\*(.+?)\*\*__\s*<:[^>]+>\s+(.+)$/);
        if (shipMatch) {
            const shipType = shipMatch[1].trim();
            const shipName = shipMatch[2].trim();

            if (currentShip) {
                parsedShips.push(currentShip);
            }

            currentShip = {
                id: currentShipId++,
                type: shipType,
                ship: shipName,
                crew: []
            };
            continue;
        }

        if (currentShip && line.match(/^>/)) {
            const crewLine = line.replace(/^>\s*/, "").trim();
            const emojiMatch = crewLine.match(/^<:([^>]+):(\d+)>\s*-\s*(<@!?(\d+)>|\[No Discord ID\])/);
            
            if (emojiMatch) {
                const roleEmoji = `<:${emojiMatch[1]}:${emojiMatch[2]}>`;
                const mention = emojiMatch[3];
                const discordId = emojiMatch[4] || null;
                
                let role = "SEC";
                Object.keys(EMOJIS.roles).forEach(r => {
                    if (EMOJIS.roles[r] === roleEmoji) {
                        role = r;
                    }
                });

                let remainder = crewLine.substring(emojiMatch[0].length).trim();
                remainder = remainder.replace(/^\-\s*/, "").trim();

                let position = null;
                let comment = "";

                for (const [emoji, num] of Object.entries(EMOJIS.positions)) {
                    if (remainder.includes(emoji)) {
                        position = num;
                        const parts = remainder.replace(emoji, "").trim();
                        const commentMatch = parts.match(/\(([^)]+)\)/);
                        if (commentMatch) {
                            comment = commentMatch[1].trim();
                        }
                        break;
                    }
                }

                if (!position) {
                    const barePositionMatch = remainder.match(/:P(\d):/);
                    if (barePositionMatch) {
                        position = parseInt(barePositionMatch[1]);
                        const parts = remainder.replace(barePositionMatch[0], "").trim();
                        const commentMatch = parts.match(/\(([^)]+)\)/);
                        if (commentMatch) {
                            comment = commentMatch[1].trim();
                        }
                    }
                }

                if (!position) {
                    const commentMatch = remainder.match(/\(([^)]+)\)/);
                    if (commentMatch) {
                        comment = commentMatch[1].trim();
                    }
                }

                currentShip.crew.push({
                    id: Date.now() + Math.random(),
                    role: role,
                    position: position ? parseInt(position) : null,
                    name: "",
                    discordId: discordId || "",
                    comment: comment
                });
            }
        }
    }

    if (currentShip) {
        parsedShips.push(currentShip);
    }

    return parsedShips;
}

function importFromDiscord() {
    const message = document.getElementById("import-discord-message").value;
    const statusEl = document.getElementById("import-status");

    if (!message.trim()) {
        showImportStatus("error", "Please paste a Discord message first.");
        return;
    }

    try {
        const parsedShips = parseDiscordMessage(message);

        if (parsedShips.length === 0) {
            showImportStatus("error", "No ships found in the message. Make sure it's a valid ship assignment message.");
            return;
        }

        ships = parsedShips;
        shipIdCounter = Math.max(...ships.map(s => s.id), 0) + 1;

        renderShips();
        updatePreview();
        saveShipAssignments();

        closeImportModal();
        showImportSuccessBanner(`Successfully imported ${parsedShips.length} ship(s)!`);
    } catch (error) {
        console.error("Import error:", error);
        showImportStatus("error", "Failed to parse message: " + error.message);
    }
}

function showImportStatus(type, message) {
    const statusEl = document.getElementById("import-status");
    if (!statusEl) return;

    statusEl.className = "mt-3 rounded-lg px-4 py-3 text-center font-medium";

    if (type === "success") {
        statusEl.classList.add("bg-green-600", "text-white");
    } else {
        statusEl.classList.add("bg-red-600", "text-white");
    }

    statusEl.textContent = message;
    statusEl.classList.remove("hidden");

    setTimeout(() => {
        statusEl.classList.add("hidden");
    }, 5000);
}

function openImportModal() {
    const modal = document.getElementById("import-modal");
    if (modal) {
        modal.classList.remove("hidden");
        modal.classList.add("flex");
    }
}

function closeImportModal() {
    const modal = document.getElementById("import-modal");
    if (modal) {
        modal.classList.add("hidden");
        modal.classList.remove("flex");
    }
    const textarea = document.getElementById("import-discord-message");
    if (textarea) {
        textarea.value = "";
    }
}

function showImportSuccessBanner(message) {
    const banner = document.getElementById("import-success-banner");
    const messageEl = document.getElementById("import-success-message");

    if (banner && messageEl) {
        messageEl.textContent = message;
        banner.classList.remove("hidden");

        setTimeout(() => {
            banner.classList.add("hidden");
        }, 4000);
    }
}

function confirmClearShipAssignments() {
    if (ships.length === 0) {
        return;
    }

    const crewCount = ships.reduce((sum, s) => sum + s.crew.length, 0);
    const message = `Are you sure you want to clear all ${ships.length} ship(s) and ${crewCount} crew member(s)?\n\nThis cannot be undone.`;

    if (confirm(message)) {
        clearShipAssignments();
    }
}

// ============================================================================
// SYNC FUNCTIONS
// ============================================================================

function syncTeamMemberRoleToShips(memberName, newRole) {
    if (!memberName) return;
    
    let updated = false;
    ships.forEach(ship => {
        ship.crew.forEach(crew => {
            if (crew.name && crew.name.toLowerCase() === memberName.toLowerCase()) {
                crew.role = newRole;
                updated = true;
            }
        });
    });
    
    if (updated) {
        renderShips();
        updatePreview();
        saveShipAssignments();
    }
}

function syncTeamMemberDiscordIdToShips(memberName, discordId) {
    if (!memberName) return;
    
    let updated = false;
    ships.forEach(ship => {
        ship.crew.forEach(crew => {
            if (crew.name && crew.name.toLowerCase() === memberName.toLowerCase()) {
                crew.discordId = discordId;
                updated = true;
            }
        });
    });
    
    if (updated) {
        renderShips();
        updatePreview();
        saveShipAssignments();
    }
}

export {
    ships,
    SHIPS,
    EMOJIS,
    addShip,
    removeShip,
    updateShipType,
    updateShipName,
    addCrewMember,
    removeCrewMember,
    updateCrewRole,
    updateCrewPosition,
    updateCrewName,
    updateCrewDiscordId,
    updateCrewComment,
    updateCrewNameDatalist,
    renderShips,
    generateOutput,
    updatePreview,
    copyToClipboard,
    saveShipAssignments,
    loadShipAssignments,
    clearShipAssignments,
    parseDiscordMessage,
    importFromDiscord,
    openImportModal,
    closeImportModal,
    confirmClearShipAssignments,
    syncTeamMemberRoleToShips,
    syncTeamMemberDiscordIdToShips
};
