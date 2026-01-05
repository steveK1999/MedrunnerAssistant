# Team Position Manager - API Integration Review

## API Structure Analysis

Based on the Medrunner API documentation at https://medrunner.dev/reference/websockets-events.html, the following WebSocket events are used:

### Available Events:
1. **TeamCreate** - Triggers when a team is created
   - Returns: `MedrunnerTeam` object
   - Usage: Refresh team list and update team count

2. **TeamUpdate** - Triggers when a team is updated
   - Returns: `MedrunnerTeam` object
   - Contains: `order` property (team's position)
   - Usage: Update current position if it changed

3. **TeamDelete** - Triggers when a team is deleted
   - Returns: `MedrunnerTeam` object
   - Usage: Refresh team list and recalculate position

4. **EmergencyCreate** - Triggers when an alert/emergency is created
   - Returns: `Emergency` object
   - Usage: Decrement team position by 1

5. **PersonUpdate** - Triggers when user/person data is updated
   - Returns: `Person` object
   - Contains: `activeTeam` property
   - Usage: Track if active team changes

## MedrunnerTeam Interface Properties

Based on the API structure, MedrunnerTeam objects contain:
- `id` - Team identifier
- `teamName` - Name of the team
- `order` - Team's position in queue (integer)
- `status` - Team status
- `members[]` - Array of team members
- `unit` - Unit the team belongs to
- `discordVoiceChannelId` - Discord channel for the team

## Implementation Details

### Current Implementation: `features/teamPositionManager.js`

**Events Monitored:**
- `TeamCreate|TeamUpdate|TeamDelete|EmergencyCreate|PersonUpdate`

**Key Functions:**

1. **fetchAllTeams()** 
   - Attempts multiple API methods to get team list:
     - `api.teams.list()` - Direct teams endpoint
     - `api.org.teams()` - Organization teams
     - `api.unit.listTeams()` - Unit-specific teams
   - Sorts teams by `order` property
   - Returns: Total team count

2. **getTeamPositionFromAPI()**
   - Gets user's active team from `self.data.activeTeam`
   - Searches for active team in fetched teams list
   - Uses `team.order` property as position
   - Returns: Current position (1-based)

3. **setTeamPosition(newPosition)**
   - Validates position within bounds (1 to teamCount)
   - Wraps around: if position < 1, uses teamCount
   - Updates local state
   - Placeholder for API call (depends on actual endpoint)

4. **callback(eventData, eventType)**
   - Handles TeamCreate/TeamDelete: Refreshes team list
   - Handles TeamUpdate: Updates position if changed
   - Handles EmergencyCreate: Decrements position by 1
   - Handles PersonUpdate: Detects active team changes

### UI Integration: `ui/renderer.js`

Functions exposed to UI:
- `loadTeamPosition()` - Initial load of position and team count
- `updateTeamPositionUI(position, count)` - Populates dropdown selector
- `setupTeamPositionListener()` - Handles manual position changes

### Electron Integration: `electron-main.cjs`

IPC Handlers:
- `get-team-position` - Returns current position
- `get-team-count` - Returns total teams
- `set-team-position` - Sets new position (triggered by UI)

## API Endpoints Used

### Fetch Teams
- **Method 1:** `api.teams.list()` (if available)
- **Method 2:** `api.org.teams()` (organization scope)
- **Method 3:** `api.unit.listTeams()` (unit scope)

**Required Data:** Returns array of MedrunnerTeam objects with `order` property

### Get Active Team
- **Source:** `await getSelf()` → `self.data.activeTeam` (team ID)

**Required Data:** User object with activeTeam property

### Update Team Order
- **Status:** TODO - Not yet implemented
- **Expected:** API endpoint to update team order (structure TBD)
- **Alternative:** May not be necessary if positions are auto-managed by API

## Testing

### Test Function
```javascript
export async function test(number) {
  // Test 1: Get current status (team count and position)
  // Test 2: Simulate alert (decrement position)
}
```

## Known Limitations & TODOs

1. **Team Listing Endpoints**
   - Currently tries 3 different API methods
   - Only one will work depending on actual API structure
   - Verify which endpoint is correct in actual environment

2. **Update Position Endpoint**
   - Currently no API call implemented
   - Need to determine correct endpoint to update team order
   - May require team ID and new order value

3. **Error Handling**
   - Falls back gracefully if API methods unavailable
   - Logs errors for debugging

4. **Position Wrapping**
   - Correctly wraps: 1 → n (last position) and n → 1 (first position)
   - Assumes 1-based indexing

## Integration Checklist

- [x] WebSocket event listeners set up
- [x] Team list fetching logic
- [x] Position calculation from `team.order` property
- [x] Position decrement on alert (EmergencyCreate)
- [x] UI dropdown selector
- [x] Manual position change support
- [x] Auto-detection of active team changes
- [ ] Verify correct API endpoints in actual environment
- [ ] Implement team order update endpoint
- [ ] Test with multiple teams
- [ ] Test position wrapping behavior

## Recommendations

1. **Verify API Endpoints:** Test which teams-fetching method works in your environment
2. **Check Team Order Property:** Confirm that MedrunnerTeam.order is 0-based or 1-based
3. **Update Endpoint:** Determine how to update team order via API
4. **Error Recovery:** Add retry logic for failed API calls
5. **Caching:** Consider caching team list if APIs are slow

