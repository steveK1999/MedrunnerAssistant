/**
 * Constants Module
 * 
 * Contains all constants for the MRS Lead Toolkit including:
 * - Ship types and names
 * - Emojis for Discord formatting
 * - Roles and positions
 * - Locations and POIs
 */

/**
 * All available Medrunner ships
 * @type {Array<string>}
 */
const SHIPS = [
    "Cutlass Black",
    "Cutlass Red",
    "Cutlass Blue",
    "Avenger Warlock",
    "Aurora ES",
    "C-788",
    "C-789",
    "C-790",
    "C-791",
    "C-792",
    "C-793",
    "C-794",
    "C-795",
    "C-796",
    "C-797",
    "C-798",
    "C-799",
    "C-800",
    "C-801",
    "Carrack-01",
    "Carrack-02",
    "Carrack-03",
    "Javelin",
    "Polaris",
    "Hull A",
    "Hull B",
    "Hull C",
    "Hull D",
    "Hull E",
    "MSR-01",
    "MSR-02",
    "MSR-03",
    "Endeavor",
    "Bengal"
];

/**
 * Emoji mapping for Discord messages
 * @type {Object}
 */
const EMOJIS = {
    header: "⚕️",
    shipTypes: {
        "Gunship": "🔫",
        "Medship": "⚕️",
        "CAP": "🛡️"
    },
    roles: {
        "PIL": "🛸",
        "LEAD": "👨‍✈️",
        "MED": "🩺",
        "SEC": "🔫",
        "CAP": "🛡️"
    },
    positions: {
        1: "<:P1:1281549969876078633>",
        2: "<:P2:1281549974435819621>",
        3: "<:P3:1281549976576610335>",
        4: "<:P4:1281549978945794138>",
        5: "<:P5:1281549981239259156>",
        6: "<:P6:1281549983580487691>",
        7: "<:P7:1281549985868038185>",
        8: "<:P8:1281549988127481988>",
        9: "<:P9:1281549990302277661>"
    }
};

/**
 * All locations organized by celestial body
 * @type {Object}
 */
const LOCATIONS = {
    STANTON: {
        name: "Stanton",
        designation: "Stanton System",
        celestialBodies: ["Crusader", "Stanton", "Microtech", "Arccorp", "Daymar", "Yela"]
    },
    CRUSADER: {
        name: "Crusader",
        designation: "Stanton 1",
        pois: [
            "Orison",
            "Port Tressler",
            "Calliope Station",
            "Jericho Station",
            "Hickes Research Outpost",
            "Security Post Criska",
            "Security Post Dipur",
            "Security Post Lespin",
            "Ashburn Channel Aid Shelter",
            "Flanagan's Ravine Aid Shelter",
            "Julep Ravine Aid Shelter",
            "Mogote Aid Shelter",
            "NT-999-XV",
            "Stash House (Cellin)",
            "Unnamed Abandoned Outpost",
            "CommArray ST2-28"
        ]
    },
    STANTON_PLANET: {
        name: "Stanton (Planet)",
        designation: "Stanton 2",
        pois: [
            "Lorville",
            "New Babbage",
            "Port Olisar",
            "GrimHex"
        ]
    },
    MICROTECH: {
        name: "Microtech",
        designation: "Stanton 2a",
        pois: [
            "New Babbage",
            "North Terminal",
            "East Terminal",
            "South Terminal",
            "Port Olisar",
            "ArcCorp Mining Area 141",
            "ArcCorp Mining Area 092",
            "Shubin Mining Facility SCD-2",
            "Security Post Klescher",
            "Security Post Tyrol",
            "Tamper Ridge Aid Shelter",
            "The Orphanage",
            "Titus Landing",
            "Wyman Estate"
        ]
    },
    ARCCORP: {
        name: "ArcCorp",
        designation: "Stanton 2b",
        pois: [
            "Lorville",
            "Baijini Point",
            "Twin Peaks Mining Area",
            "Shubin Mining Facility ARC-L1",
            "Shubin Mining Facility GH-L2",
            "Security Post Vosper",
            "Hickes Research Outpost",
            "Security Post Criska",
            "Security Post Dipur",
            "Security Post Lespin",
            "Ashburn Channel Aid Shelter",
            "Flanagan's Ravine Aid Shelter",
            "Julep Ravine Aid Shelter",
            "Mogote Aid Shelter",
            "NT-999-XV",
            "Stash House (Cellin)",
            "Unnamed Abandoned Outpost",
            "CommArray ST2-28"
        ]
    },
    DAYMAR: {
        name: "Daymar",
        designation: "Stanton 2b",
        pois: [
            "Bountiful Harvest Hydroponics",
            "ArcCorp Mining Area 141",
            "Kudre Ore",
            "Shubin Mining Facility SCD-1",
            "Security Post Moluto",
            "Security Post Prashad",
            "Security Post Thaquray",
            "NT-999-XVI",
            "The Garden",
            "TPF",
            "Wailing Rock",
            "Kudre Ore Mine (Closed)",
            "Dunlow Ridge Aid Shelter"
        ]
    },
    YELA: {
        name: "Yela",
        designation: "Stanton 2c",
        pois: [
            "Port Olisar",
            "Com Array"
        ]
    },
    CALIBAN: {
        name: "Caliban",
        designation: "Stanton 3",
        pois: [
            "Caliban Prime"
        ]
    },
    HURSTON: {
        name: "Hurston",
        designation: "Stanton 4",
        pois: [
            "Reclamation Yard Kc-1",
            "Reclamation Yard Kc-2",
            "Reclamation Yard Kc-3"
        ]
    },
    CLIO: {
        name: "Clio",
        designation: "Stanton 4a",
        pois: [
            "Clio Prime"
        ]
    },
    PRISTINE: {
        name: "Pristine",
        designation: "Stanton 4b",
        pois: [
            "Pristine Station"
        ]
    }
};

/**
 * Extraction points (data might need to be expanded based on patches)
 * @type {Array<string>}
 */
const EXTRACTION_POINTS = [
    "Illegal Spice Farm",
    "Derelict Ship",
    "Crashed Ship",
    "Asteroid Field",
    "Mining Operation",
    "Underground Facility",
    "Custom Location"
];

/**
 * Alert timer stages
 * @type {Array<Object>}
 */
const TIMER_STAGES = [
    { id: "idle", label: "Ready", buttonText: "Start Alert Timer", field: null },
    { id: "contact", label: "Contact", buttonText: "Contact Made", field: "timer-contact" },
    { id: "engaged", label: "Engaged", buttonText: "Engage Enemy", field: "timer-engaged" },
    { id: "medical", label: "Medical", buttonText: "Begin Medical", field: "timer-medical" },
    { id: "extract", label: "Extract", buttonText: "Begin Extract", field: "timer-extract" }
];

export { SHIPS, EMOJIS, LOCATIONS, EXTRACTION_POINTS, TIMER_STAGES };
