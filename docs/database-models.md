# Database Models Implementation — Phase 6.3

## Overview

This document describes the MongoDB model/schema layer implemented for the Pandharpur Wari NSS Seva Portal.

| Property | Value |
|---|---|
| **Database** | `wariseva` |
| **Driver** | `mongodb@^7.5.0` (native driver, no Mongoose) |
| **Connection** | `lib/mongodb.js` (cached singleton) |
| **Models Directory** | `lib/models/` |

## File Structure

```
lib/
  mongodb.js              ← Connection utility (Phase 6.1)
  models/
    index.js              ← Exports all models + ensureAllIndexes()
    helpers.js            ← Validation, timestamps, ID generation
    volunteers.js         ← Volunteer registration model
    missingPersons.js     ← Missing person report model
    lostItems.js          ← Lost & found item model
    announcements.js      ← Announcement model
    emergencyContacts.js  ← Emergency contact directory model
    galleryImages.js      ← Gallery image index model
    contactMessages.js    ← Contact form message model
    reports.js            ← System report model
    analyticsEvents.js    ← Analytics event log model
    services.js           ← Service listing model
    faq.js                ← FAQ entries model
    admin.js              ← Admin user model
    settings.js           ← Portal settings model
    timelineStops.js      ← Timeline stop model
```

## Architecture Decisions

1. **No Mongoose**: The project uses the native MongoDB driver. Models are plain JavaScript modules that import `clientPromise` and expose functions for CRUD operations, validation, and index management.

2. **Collection-per-model**: Each model file exports functions for a single MongoDB collection.

3. **Validation at model level**: Each model validates documents before insert/update operations.

4. **Human-readable IDs**: Generated server-side using `getNextSequence()` + ID prefix patterns.

5. **Timestamps**: `createdAt` and `updatedAt` are managed automatically by model functions.

6. **Database initialization**: Call `ensureAllIndexes()` at application startup or during deployment.

## Model Details

### 1. Volunteers (`volunteers`)

**Purpose:** NSS volunteer registrations from the public form.

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `volunteerId` | string | auto | `VOL-2026-XXX` | Unique human-readable ID |
| `name` | string | yes | — | Full name |
| `email` | string | yes | — | Unique, lowercase |
| `phone` | string | yes | — | 10-digit mobile |
| `gender` | string | yes | — | Male / Female |
| `age` | number | yes | — | 16–80 |
| `address` | string | no | — | Residential address |
| `city` | string | yes | — | City/town |
| `college` | string | yes | — | Institution name |
| `nssUnit` | string | yes | — | NSS unit code |
| `bloodGroup` | string | yes | — | A+, A-, B+, B-, AB+, AB-, O+, O- |
| `emergencyPhone` | string | yes | — | Emergency contact |
| `skills` | string[] | no | `[]` | first_aid, crowd_mgmt, translation, logistics, it_support |
| `languages` | string[] | no | `[]` | marathi, hindi, english, kannada, telugu |
| `shift` | string | yes | — | morning, afternoon, evening, night |
| `status` | string | no | `"pending"` | pending, approved, rejected |
| `createdAt` | Date | auto | `now` | — |
| `updatedAt` | Date | auto | `now` | — |

**Indexes:** `{ email: 1 }` (unique), `{ volunteerId: 1 }` (unique), `{ status: 1 }`, `{ name: "text", college: "text" }`, `{ createdAt: -1 }`

**Sensitive:** email, phone, emergencyPhone, address — do not expose publicly.

---

### 2. Missing Persons (`missing_persons`)

**Purpose:** Missing pilgrim reports.

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `caseId` | string | auto | `MP-2026-XXX` | Unique human-readable ID |
| `name` | string | yes | — | Person's name |
| `age` | number | yes | — | — |
| `gender` | string | yes | — | Male / Female |
| `category` | string | yes | — | Child, Senior Citizen, Male, Female |
| `lastSeenLocation` | string | yes | — | Free text location |
| `dateReported` | Date | yes | — | — |
| `timeReported` | string | no | — | HH:MM format |
| `status` | string | no | `"Missing"` | Missing, Found |
| `height` | string | no | — | Approximate height |
| `clothing` | string | no | — | Clothing description |
| `emergencyNotice` | string | no | — | Medical/safety notes |
| `contactPhone` | string | yes | — | Family contact |
| `reportedBy` | string | no | — | Reporter name |
| `imageUrl` | string | no | — | Optional photo URL |
| `foundDate` | Date | no | — | When found |
| `resolvedNotes` | string | no | — | Resolution notes |
| `createdAt` | Date | auto | `now` | — |
| `updatedAt` | Date | auto | `now` | — |

**Indexes:** `{ caseId: 1 }` (unique), `{ status: 1 }`, `{ name: "text", clothing: "text" }`, `{ dateReported: -1 }`, `{ category: 1 }`

**Sensitive:** contactPhone — exposed for coordination but handle with care.

---

### 3. Lost Items (`lost_items`)

**Purpose:** Lost and found item registry.

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `itemId` | string | auto | `LI-2026-XXX` | Unique human-readable ID |
| `name` | string | yes | — | Item name |
| `category` | string | yes | — | Mobile, Wallet, Bag, Documents, Jewelry, Shoes, Other |
| `locationFound` | string | yes | — | Where found/lost |
| `dateReported` | Date | yes | — | — |
| `status` | string | no | `"Lost"` | Lost, Found, Claimed |
| `description` | string | no | — | Detailed description |
| `contactInfo` | string | yes | — | Claim contact |
| `claimedDate` | Date | no | — | When claimed |
| `claimedBy` | string | no | — | Claimant name |
| `reportedBy` | string | no | — | Reporter name |
| `imageUrl` | string | no | — | Optional photo URL |
| `createdAt` | Date | auto | `now` | — |
| `updatedAt` | Date | auto | `now` | — |

**Indexes:** `{ itemId: 1 }` (unique), `{ status: 1 }`, `{ category: 1 }`, `{ name: "text", description: "text" }`, `{ dateReported: -1 }`

---

### 4. Announcements (`announcements`)

**Purpose:** System announcements for public/admin dashboard.

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `announcementId` | string | auto | `ANN-2026-XXX` | Unique human-readable ID |
| `title` | string | yes | — | Announcement title |
| `description` | string | yes | — | Full description |
| `category` | string | yes | — | safety, schedule, camp, general |
| `priority` | string | no | `"medium"` | high, medium, low |
| `status` | string | no | `"draft"` | published, draft, scheduled |
| `publishDate` | Date | yes | — | When to publish |
| `createdBy` | string | no | — | Admin name/ID |
| `createdAt` | Date | auto | `now` | — |
| `updatedAt` | Date | auto | `now` | — |

**Indexes:** `{ announcementId: 1 }` (unique), `{ status: 1, publishDate: -1 }`, `{ priority: 1 }`, `{ category: 1 }`

---

### 5. Emergency Contacts (`emergency_contacts`)

**Purpose:** Emergency phone directory.

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `label` | string | yes | — | Display label |
| `phoneNumber` | string | yes | — | Emergency number(s) |
| `category` | string | yes | — | police, ambulance, medical, fire, nss, women, child, control_room |
| `description` | string | no | — | Service description |
| `order` | number | no | `0` | Display ordering |
| `isActive` | boolean | no | `true` | Visibility toggle |
| `createdAt` | Date | auto | `now` | — |
| `updatedAt` | Date | auto | `now` | — |

**Indexes:** `{ category: 1, order: 1 }`, `{ isActive: 1 }`

---

### 6. Gallery Images (`gallery_images`)

**Purpose:** Photo gallery index.

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `imageUrl` | string | yes | — | Path to image file |
| `title` | string | no | — | Image caption |
| `category` | string | no | — | wari, nss, medical, volunteers, pilgrims, events |
| `altText` | string | no | — | Accessibility alt text |
| `uploadedBy` | string | no | — | Admin name/ID |
| `fileSize` | number | no | — | Size in bytes |
| `mimeType` | string | no | — | image/jpeg, image/png, etc. |
| `createdAt` | Date | auto | `now` | — |
| `updatedAt` | Date | auto | `now` | — |

**Indexes:** `{ category: 1 }`, `{ createdAt: -1 }`

---

### 7. Contact Messages (`contact_messages`)

**Purpose:** Public contact form submissions.

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `name` | string | yes | — | Sender's name |
| `email` | string | yes | — | Sender's email |
| `phone` | string | yes | — | 10-digit phone |
| `message` | string | yes | — | Message body (min 10 chars) |
| `isRead` | boolean | no | `false` | Admin read status |
| `readAt` | Date | no | `null` | When read by admin |
| `createdAt` | Date | auto | `now` | — |

**Indexes:** `{ createdAt: -1 }`, `{ isRead: 1 }`

**Sensitive:** email, phone, message — do not expose publicly.

---

### 8. Reports (`reports`)

**Purpose:** Admin system reports.

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `reportId` | string | auto | `REP-2026-XXX` | Unique human-readable ID |
| `title` | string | yes | — | Report title |
| `description` | string | yes | — | Report description |
| `type` | string | yes | — | daily, volunteer, emergency, audit, weekly |
| `date` | Date | yes | — | Report date |
| `fileSize` | string | no | — | e.g. "1.4 MB" |
| `fileUrl` | string | no | — | Link to stored PDF |
| `author` | string | no | — | Author name |
| `downloadCount` | number | no | `0` | Download count |
| `createdAt` | Date | auto | `now` | — |
| `updatedAt` | Date | auto | `now` | — |

**Indexes:** `{ reportId: 1 }` (unique), `{ type: 1, date: -1 }`, `{ date: -1 }`

---

### 9. Analytics Events (`analytics_events`)

**Purpose:** Activity log for admin dashboard.

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `eventType` | string | yes | — | volunteer, missing, lost_found, emergency, gallery, announcement |
| `titleKey` | string | no | — | i18n key for title |
| `titleText` | string | no | — | Fallback text |
| `titleArgs` | object | no | `{}` | Dynamic title arguments |
| `details` | string | no | — | Detail text |
| `status` | string | yes | — | pending, active, claimed, resolved, success, published |
| `metadata` | object | no | `{}` | Flexible extra data |
| `createdAt` | Date | auto | `now` | — |

**Indexes:** `{ eventType: 1, createdAt: -1 }`, `{ createdAt: -1 }`, `{ status: 1 }`

---

### 10. Services (`services`)

**Purpose:** Public service listings (i18n-driven).

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `serviceId` | string | yes | — | Unique ID, e.g. "emergency" |
| `titleKey` | string | yes | — | i18n key for title |
| `descriptionKey` | string | yes | — | i18n key for description |
| `iconName` | string | no | — | Lucide icon name |
| `colorClass` | string | no | — | CSS color class |
| `order` | number | no | `0` | Display order |
| `isActive` | boolean | no | `true` | Visibility toggle |
| `createdAt` | Date | auto | `now` | — |
| `updatedAt` | Date | auto | `now` | — |

**Indexes:** `{ serviceId: 1 }` (unique), `{ order: 1 }`

---

### 11. FAQ (`faq`)

**Purpose:** Frequently Asked Questions (i18n-driven).

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `questionKey` | string | yes | — | i18n key |
| `answerKey` | string | yes | — | i18n key |
| `order` | number | no | `0` | Display order |
| `category` | string | no | `"general"` | FAQ category |
| `isActive` | boolean | no | `true` | Visibility toggle |
| `createdAt` | Date | auto | `now` | — |
| `updatedAt` | Date | auto | `now` | — |

**Indexes:** `{ order: 1 }`

---

### 12. Admins (`admins`)

**Purpose:** Admin user profiles and authentication.

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `name` | string | yes | — | Full name |
| `email` | string | yes | — | Unique, lowercase |
| `passwordHash` | string | yes | — | bcrypt hash — NEVER store plaintext |
| `phone` | string | no | — | Contact number |
| `role` | string | no | `"admin"` | super_admin, admin, coordinator |
| `about` | string | no | — | Short bio |
| `isActive` | boolean | no | `true` | Account active? |
| `lastLoginAt` | Date | no | `null` | Last login timestamp |
| `createdAt` | Date | auto | `now` | — |
| `updatedAt` | Date | auto | `now` | — |

**Indexes:** `{ email: 1 }` (unique), `{ role: 1 }`

**Security:**
- `passwordHash` is NEVER returned in API responses (use `sanitizeAdmin()`)
- Passwords are hashed with bcrypt (salt rounds >= 10) at the auth/API layer
- `passwordHash` is excluded from `prepareForUpdate()` to prevent accidental overwrites

---

### 13. Settings (`settings`)

**Purpose:** Portal-wide configuration key-value store.

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `key` | string | yes | — | Unique config key |
| `value` | any | yes | — | Config value |
| `type` | string | no | `"string"` | string, number, boolean, json |
| `description` | string | no | — | Human-readable description |
| `updatedBy` | string | no | — | Admin name/ID |
| `createdAt` | Date | auto | `now` | — |
| `updatedAt` | Date | auto | `now` | — |

**Indexes:** `{ key: 1 }` (unique)

**Note:** `upsert()` function allows atomic create-or-update of settings.

---

### 14. Timeline Stops (`timeline_stops`)

**Purpose:** Wari pilgrimage route milestones.

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `stopId` | string | yes | — | Unique, e.g. "alandi" |
| `dayRange` | string | yes | — | e.g. "Day 1 - 2" |
| `titleKey` | string | yes | — | i18n key (English) |
| `titleKeyMr` | string | no | — | i18n key (Marathi) |
| `descriptionKey` | string | yes | — | i18n key (English) |
| `descriptionKeyMr` | string | no | — | i18n key (Marathi) |
| `order` | number | yes | — | Sequence order |
| `color` | string | no | — | CSS color class |
| `isActive` | boolean | no | `true` | Visibility toggle |
| `createdAt` | Date | auto | `now` | — |
| `updatedAt` | Date | auto | `now` | — |

**Indexes:** `{ stopId: 1 }` (unique), `{ order: 1 }`

---

## Database Initialization

To initialize all indexes at application startup:

```javascript
import { ensureAllIndexes } from "@/lib/models";

// Call during startup
await ensureAllIndexes();
```

To get collection statistics:

```javascript
import { getDbStats } from "@/lib/models";

const stats = await getDbStats();
// { volunteers: { count: 1248 }, missing_persons: { count: 142 }, ... }
```

## Model Usage Example

```javascript
import { Volunteers, MissingPersons } from "@/lib/models";

// Insert a volunteer
await Volunteers.insertOne({
  name: "Rahul Deshmukh",
  email: "rahul.desh@gmail.com",
  phone: "9876501234",
  gender: "Male",
  age: 21,
  city: "Pune",
  college: "COEP",
  nssUnit: "NSS-UNIT-01",
  bloodGroup: "O+",
  emergencyPhone: "9876500001",
  shift: "morning",
});

// Find by human-readable ID
const volunteer = await Volunteers.findById("VOL-2026-001");

// Update status
await Volunteers.updateStatus("VOL-2026-001", "approved");

// Find all pending
const pending = await Volunteers.findAll({ status: "pending" });
```

## Security Notes

- All database credentials are stored in `.env.local` (gitignored)
- `passwordHash` in the `admins` model is never exposed via API responses
- Model validation prevents invalid data from reaching the database
- All models use the `wariseva` database name consistently
