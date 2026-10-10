# FloraQuest REST API Documentation

## Base URL
- **Local Development:** `http://localhost:5000/api`
- **Production (Render):** `https://floraquest-api.onrender.com/api`

---

## Authentication & Security

The API uses **JSON Web Tokens (JWT)** issued upon registration or login.
- **Cookie Authentication:** Token is set in an `HttpOnly`, `Secure` (in production), `SameSite` cookie (`token`).
- **Bearer Token Fallback:** Clients may also pass the token in the `Authorization` header: `Authorization: Bearer <token>`.
- **Password Security:** Passwords hashed with `bcryptjs` (12 rounds).
- **Rate Limiting:** Auth endpoints are throttled to 30 requests per 15 minutes per IP; API endpoints to 120 requests/min.
- **CORS Protection:** Whitelisted to authorized frontend domain (Vercel) with `credentials: true`.

---

## Standard Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional human-readable confirmation"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR | UNAUTHORIZED | CELL_OCCUPIED | INSUFFICIENT_COINS | etc.",
    "message": "Human-readable description",
    "details": []
  }
}
```

---

## Endpoints

### 1. Health & System Status
* `GET /api/health`
  * **Auth:** Public
  * **Response:**
    ```json
    {
      "status": "healthy",
      "uptime": 124.5,
      "timestamp": "2026-10-10T14:15:00.000Z",
      "database": "connected",
      "environment": "production"
    }
    ```

---

### 2. Authentication
* `POST /api/auth/register`
  * **Auth:** Public
  * **Body:**
    ```json
    {
      "email": "botanist@nature.org",
      "username": "FloraExplorer",
      "password": "SecurePassword123!"
    }
    ```
  * **Response (201 Created):** Sets HTTP-only cookie and returns user + token.

* `POST /api/auth/login`
  * **Auth:** Public
  * **Body:**
    ```json
    {
      "identifier": "FloraExplorer", // or email
      "password": "SecurePassword123!"
    }
    ```

* `POST /api/auth/logout`
  * **Auth:** Public
  * **Response (200 OK):** Clears HTTP-only cookie.

* `GET /api/auth/me`
  * **Auth:** Required (`requireAuth`)
  * **Response (200 OK):** Current user profile, level, coins, and streak.

---

### 3. Plant Records & Growth Journal
* `GET /api/plants`
  * **Auth:** Required
  * **Response (200 OK):** List of user's plants with embedded `growthPhotos` and `careLogs`.

* `POST /api/plants`
  * **Auth:** Required
  * **Body:**
    ```json
    {
      "name": "Monstera Deliciosa",
      "species": "Monstera deliciosa",
      "location": "indoor",
      "sunlightNeeds": "indirect_bright",
      "waterFrequencyDays": 7,
      "primaryPhotoUrl": "https://...",
      "notes": "Adopted from botanical garden"
    }
    ```
  * **Behavior:** Transactionally creates plant, Day 1 growth entry, and awards **+15 Coins** and **+20 XP**.

* `DELETE /api/plants/:id`
  * **Auth:** Required (enforces user ownership)

* `POST /api/plants/:id/care`
  * **Auth:** Required
  * **Body:**
    ```json
    {
      "type": "water", // water | fertilize | prune | repot | mist | observation
      "notes": "Deep soak watering"
    }
    ```
  * **Behavior:** Updates `lastWateredDate`/`lastFertilizedDate`, records care log, awards **+10 Coins** and **+15 XP**.

* `POST /api/plants/:id/growth`
  * **Auth:** Required
  * **Body:**
    ```json
    {
      "photoUrl": "data:image/jpeg;base64,...",
      "stageLabel": "New Fenestrated Leaf",
      "notes": "Unfurled after warm morning sun"
    }
    ```
  * **Behavior:** Adds growth photo entry and awards **+20 Coins** and **+30 XP**.

---

### 4. Discoveries (On-Device Vision AI)
* `GET /api/discoveries`
  * **Auth:** Required
  * **Response (200 OK):** List of user's saved plant identification records.

* `POST /api/discoveries`
  * **Auth:** Required
  * **Body:**
    ```json
    {
      "imageUrl": "data:image/jpeg;base64,...",
      "topPrediction": {
        "label": "daisy",
        "score": 0.9996,
        "botanicalInfo": {
          "speciesName": "Daisy",
          "scientificName": "Bellis perennis"
        }
      },
      "alternativePredictions": [
        { "label": "pot, flowerpot", "score": 0.0002 }
      ],
      "confidenceTier": "high"
    }
    ```
  * **Behavior:** Transactionally saves discovery record and awards **+25 Coins** and **+35 XP**.

---

### 5. Quests & Outdoor Mindfulness
* `GET /api/quests`
  * **Auth:** Required
  * **Response (200 OK):** Active quests with server-computed progress and claim status for today/this week.

* `POST /api/quests/:id/claim`
  * **Auth:** Required
  * **Behavior:** **Server-authoritative validation**: checks if quest requirements are satisfied and verifies no claim exists for the current period (`periodKey`). Atomically awards coins/XP and creates transaction record. Returns `400 QUEST_ALREADY_CLAIMED` on duplicate attempts.

* `POST /api/observations`
  * **Auth:** Required
  * **Body:**
    ```json
    {
      "durationMinutes": 5,
      "locationDescription": "City Botanical Park",
      "floraObserved": ["White Clover", "Dandelion", "Oak Tree"],
      "sensoryNotes": "Cool pine scent and warm breeze",
      "weatherCondition": "Sunny, 22°C"
    }
    ```
  * **Behavior:** Saves outdoor observation and awards **+35 Coins** and **+60 XP**.

---

### 6. Botanical Shop & Virtual Garden Grid
* `GET /api/shop/items`
  * **Auth:** Required
  * **Response (200 OK):** Item catalog with unlock status based on user level and inventory counts.

* `POST /api/shop/buy`
  * **Auth:** Required
  * **Body:** `{ "itemId": "vp-monstera" }`
  * **Behavior:** **Atomic database transaction**: validates user level requirement, verifies `coins >= price`, deducts balance, adds item to inventory, logs ledger transaction.

* `GET /api/garden/layout`
  * **Auth:** Required
  * **Response (200 OK):** All placed items on the user's 8×8 grid sanctuary.

* `POST /api/garden/place`
  * **Auth:** Required
  * **Body:** `{ "itemId": "vp-monstera", "gridX": 3, "gridY": 4, "rotation": 0 }`
  * **Behavior:** Validates coordinate bounds `0..7` and checks for collision. Returns `409 CELL_OCCUPIED` if tile is occupied.

* `PUT /api/garden/items/:instanceId`
  * **Auth:** Required
  * **Body:** `{ "gridX": 4, "gridY": 4 }`
  * **Behavior:** Moves item to new coordinate with collision check.

* `PATCH /api/garden/items/:instanceId/rotate`
  * **Auth:** Required
  * **Behavior:** Increments rotation by 90° (`(rotation + 90) % 360`).

* `DELETE /api/garden/items/:instanceId`
  * **Auth:** Required
  * **Behavior:** Removes item from grid.

---

### 7. Data Management & JSON Portability
* `GET /api/data/profile`
  * **Auth:** Required
  * **Response (200 OK):** Full user summary, achievements, and transaction ledger.

* `GET /api/data/export`
  * **Auth:** Required
  * **Response (200 OK):** Downloadable JSON file containing all user plants, growth timelines, care logs, discoveries, observations, garden items, and economy transactions.

* `POST /api/data/import`
  * **Auth:** Required
  * **Body:** JSON backup payload.
  * **Behavior:** Restores all plants, growth timelines, and care logs into the authenticated user's account.
