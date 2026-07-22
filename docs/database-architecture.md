# Database Architecture — Pandharpur Wari NSS Seva Portal

## 1. Database Overview

| Property | Value |
|---|---|
| **Database Name** | `wariseva` |
| **Database Engine** | MongoDB Atlas (v7.x) |
| **Driver** | `mongodb@^7.5.0` via npm |
| **Connection Module** | `lib/mongodb.js` (cached singleton, reads `MONGODB_URI` from env) |
| **Application Framework** | Next.js 14.2 (App Router) |

The database uses the `wariseva` database name. All collections live under this database. Connection is established through the shared utility at `lib/mongodb.js`, which implements connection caching to prevent hot-reload connection leaks during development.

## 2. Collection List

The current application uses **14 data entities**. Below is the proposed MongoDB collection architecture:

| # | Collection Name | Purpose | Source of Data |
|---|---|---|---|
| 1 | `volunteers` | NSS volunteer registrations | `data/volunteers.js`, `/register` form |
| 2 | `missing_persons` | Missing pilgrim reports | `data/missingPersons.js` |
| 3 | `lost_items` | Lost & found item records | `data/lostItems.js` |
| 4 | `announcements` | Public/admin announcements | `data/announcements.js` |
| 5 | `emergency_contacts` | Emergency helpline directory | `data/dummyData.js`, `/emergency-contacts` page |
| 6 | `gallery_images` | Gallery photo index | Hardcoded in `app/gallery/page.js`, `app/admin/gallery/page.js` |
| 7 | `contact_messages` | Public contact form submissions | `app/contact/page.js` form |
| 8 | `reports` | Admin-generated system reports | `data/reports.js` |
| 9 | `analytics_events` | Activity log / analytics events | `data/analytics.js`, `data/dashboard.js` |
| 10 | `services` | Public service listings | `data/dummyData.js` services array |
| 11 | `faq` | FAQ entries | Hardcoded in `app/faq/page.js` |
| 12 | `admins` | Admin user profiles | `app/admin/profile/page.js` |
| 13 | `settings` | Portal-wide configuration | `app/admin/settings/page.js` |
| 14 | `timeline_stops` | Wari pilgrimage route milestones | `components/Timeline.js` |

---

## 3. Collection Schemas

### 3.1 `volunteers`

**Purpose:** Stores NSS volunteer registration data submitted via the public registration form and managed via the admin dashboard.

| Field | Type | Required | Default | Unique | Index | Notes |
|---|---|---|---|---|---|---|
| `_id` | ObjectId | auto | auto | yes | PK | MongoDB auto-generated |
| `volunteerId` | string | yes | auto | yes | unique | Human-readable ID, e.g. `VOL-2026-XXX` |
| `name` | string | yes | — | no | text | Full name |
| `email` | string | yes | — | yes | unique | Email address |
| `phone` | string | yes | — | no | yes | 10-digit mobile |
| `gender` | string | yes | — | no | — | Male / Female |
| `age` | number | yes | — | no | — | 16-80 |
| `address` | string | no | — | no | — | Residential address |
| `city` | string | yes | — | no | — | City / town |
| `college` | string | yes | — | no | text | Institution name |
| `nssUnit` | string | yes | — | no | yes | NSS unit code |
| `bloodGroup` | string | yes | — | no | — | A+, A-, B+, B-, AB+, AB-, O+, O- |
| `emergencyPhone` | string | yes | — | no | — | Emergency contact number |
| `skills` | string[] | no | [] | no | — | first_aid, crowd_mgmt, translation, logistics, it_support |
| `languages` | string[] | no | [] | no | — | marathi, hindi, english, kannada, telugu |
| `shift` | string | yes | — | no | — | morning, afternoon, evening, night |
| `status` | string | yes | "pending" | no | yes | pending, approved, rejected |
| `createdAt` | Date | auto | now | no | yes | Timestamp of registration |
| `updatedAt` | Date | auto | now | no | — | Timestamp of last update |

**Indexes:**
- `{ email: 1 }` — unique
- `{ volunteerId: 1 }` — unique
- `{ status: 1 }` — for filtering by approval state
- `{ name: "text", college: "text" }` — text search
- `{ createdAt: -1 }` — sorted listing

**Validation:**
- `email` must match email regex
- `phone` must be 10 digits
- `age` must be 16–80
- `status` must be one of: pending, approved, rejected

---

### 3.2 `missing_persons`

**Purpose:** Reports of missing pilgrims during the Wari, managed by admin and viewable by the public.

| Field | Type | Required | Default | Unique | Index | Notes |
|---|---|---|---|---|---|---|
| `_id` | ObjectId | auto | auto | yes | PK | |
| `caseId` | string | yes | auto | yes | unique | e.g. `MP-2026-XXX` |
| `name` | string | yes | — | no | text | Full name of missing person |
| `age` | number | yes | — | no | — | |
| `gender` | string | yes | — | no | — | Male / Female |
| `category` | string | yes | — | no | — | Child, Senior Citizen, Male, Female |
| `lastSeenLocation` | string | yes | — | no | — | Free text location name |
| `dateReported` | Date | yes | — | no | yes | Date of report |
| `timeReported` | string | no | — | no | — | Time of last sighting (HH:MM) |
| `status` | string | yes | "Missing" | no | yes | Missing, Found |
| `height` | string | no | — | no | — | Approximate height description |
| `clothing` | string | no | — | no | — | Description of clothing worn |
| `emergencyNotice` | string | no | — | no | — | Medical/safety notes |
| `contactPhone` | string | yes | — | no | — | Family/coordinator contact |
| `reportedBy` | string | no | — | no | — | Name of reporting person |
| `imageUrl` | string | no | — | no | — | Optional photo URL |
| `foundDate` | Date | no | — | no | — | When person was found |
| `resolvedNotes` | string | no | — | no | — | Resolution notes |
| `createdAt` | Date | auto | now | no | yes | |
| `updatedAt` | Date | auto | now | no | — | |

**Indexes:**
- `{ caseId: 1 }` — unique
- `{ status: 1 }` — filter missing vs found
- `{ name: "text", clothing: "text" }` — text search
- `{ dateReported: -1 }` — sort by recency
- `{ category: 1 }` — filter by category

**Note:** The existing dummy data uses translation keys for `lastSeenKey` (pointing to timeline stops). In the MongoDB schema, `lastSeenLocation` is a plain text string to allow flexibility. When migrating, resolve keys to their translated text or store as a reference to `timeline_stops`.

---

### 3.3 `lost_items`

**Purpose:** Lost and found item registry, managed by admin.

| Field | Type | Required | Default | Unique | Index | Notes |
|---|---|---|---|---|---|---|
| `_id` | ObjectId | auto | auto | yes | PK | |
| `itemId` | string | yes | auto | yes | unique | e.g. `LI-2026-XXX` |
| `name` | string | yes | — | no | text | Item name / description |
| `category` | string | yes | — | no | yes | Mobile, Wallet, Bag, Documents, Jewelry, Shoes, Other |
| `locationFound` | string | yes | — | no | — | Where item was found/lost |
| `dateReported` | Date | yes | — | no | yes | Date of report |
| `status` | string | yes | "Lost" | no | yes | Lost, Found, Claimed |
| `description` | string | no | — | no | — | Detailed item description |
| `contactInfo` | string | yes | — | no | — | Claim contact desk or phone |
| `claimedDate` | Date | no | — | no | — | When claimed |
| `claimedBy` | string | no | — | no | — | Name of claimant |
| `reportedBy` | string | no | — | no | — | Who reported the item |
| `imageUrl` | string | no | — | no | — | Optional item photo |
| `createdAt` | Date | auto | now | no | yes | |
| `updatedAt` | Date | auto | now | no | — | |

**Indexes:**
- `{ itemId: 1 }` — unique
- `{ status: 1 }` — filter by status
- `{ category: 1 }` — filter by category
- `{ name: "text", description: "text" }` — text search
- `{ dateReported: -1 }` — sort by recency

---

### 3.4 `announcements`

**Purpose:** System announcements broadcast to the public and shown on admin dashboard.

| Field | Type | Required | Default | Unique | Index | Notes |
|---|---|---|---|---|---|---|
| `_id` | ObjectId | auto | auto | yes | PK | |
| `announcementId` | string | yes | auto | yes | unique | e.g. `ANN-2026-XXX` |
| `title` | string | yes | — | no | text | Title of announcement |
| `description` | string | yes | — | no | — | Full description |
| `category` | string | yes | — | no | yes | safety, schedule, camp, general |
| `priority` | string | yes | "medium" | no | yes | high, medium, low |
| `status` | string | yes | "draft" | no | yes | published, draft, scheduled |
| `publishDate` | Date | yes | — | no | yes | When to publish |
| `createdBy` | string | no | — | no | — | Admin name or ID |
| `createdAt` | Date | auto | now | no | — | |
| `updatedAt` | Date | auto | now | no | — | |

**Indexes:**
- `{ announcementId: 1 }` — unique
- `{ status: 1, publishDate: -1 }` — fetch published/scheduled announcements ordered by date
- `{ priority: 1 }` — filter by priority
- `{ category: 1 }` — filter by category

---

### 3.5 `emergency_contacts`

**Purpose:** Directory of emergency phone numbers displayed in the footer and on the emergency contacts page.

| Field | Type | Required | Default | Unique | Index | Notes |
|---|---|---|---|---|---|---|
| `_id` | ObjectId | auto | auto | yes | PK | |
| `label` | string | yes | — | — | — | Display label |
| `phoneNumber` | string | yes | — | — | — | Emergency number(s) |
| `category` | string | yes | — | — | yes | police, ambulance, medical, fire, nss, women, child, control_room |
| `description` | string | no | — | — | — | Brief description of the service |
| `order` | number | no | 0 | — | yes | Display ordering |
| `isActive` | boolean | no | true | — | yes | Toggle visibility |
| `createdAt` | Date | auto | now | — | — | |
| `updatedAt` | Date | auto | now | — | — | |

**Indexes:**
- `{ category: 1, order: 1 }` — sorted listing by category
- `{ isActive: 1 }` — filter active contacts

---

### 3.6 `gallery_images`

**Purpose:** Photo gallery index for the public gallery page and admin gallery manager.

| Field | Type | Required | Default | Unique | Index | Notes |
|---|---|---|---|---|---|---|
| `_id` | ObjectId | auto | auto | yes | PK | |
| `imageUrl` | string | yes | — | — | — | Path to image file |
| `title` | string | no | — | — | — | Image caption / title |
| `category` | string | yes | — | — | yes | wari, nss, medical, volunteers, pilgrims, events |
| `altText` | string | no | — | — | — | Accessibility alt text |
| `uploadedBy` | string | no | — | — | — | Admin name or ID |
| `fileSize` | number | no | — | — | — | Size in bytes |
| `mimeType` | string | no | — | — | — | image/jpeg, image/png, etc. |
| `createdAt` | Date | auto | now | — | yes | |
| `updatedAt` | Date | auto | now | — | — | |

**Indexes:**
- `{ category: 1 }` — filter by category
- `{ createdAt: -1 }` — sort by upload date

---

### 3.7 `contact_messages`

**Purpose:** Contact form submissions from the public contact page.

| Field | Type | Required | Default | Unique | Index | Notes |
|---|---|---|---|---|---|---|
| `_id` | ObjectId | auto | auto | yes | PK | |
| `name` | string | yes | — | — | — | Sender's full name |
| `email` | string | yes | — | — | — | Sender's email |
| `phone` | string | yes | — | — | — | Sender's 10-digit phone |
| `message` | string | yes | — | — | text | The message body |
| `isRead` | boolean | no | false | — | yes | Admin read status |
| `readAt` | Date | no | — | — | — | When admin read it |
| `createdAt` | Date | auto | now | — | yes | |

**Indexes:**
- `{ createdAt: -1 }` — sort by newest first
- `{ isRead: 1 }` — filter unread messages

---

### 3.8 `reports`

**Purpose:** Admin system reports (PDF/download records).

| Field | Type | Required | Default | Unique | Index | Notes |
|---|---|---|---|---|---|---|
| `_id` | ObjectId | auto | auto | yes | PK | |
| `reportId` | string | yes | auto | yes | unique | e.g. `REP-2026-XXX` |
| `title` | string | yes | — | — | text | Report title |
| `description` | string | yes | — | — | — | Report description |
| `type` | string | yes | — | — | yes | daily, volunteer, emergency, audit, weekly |
| `date` | Date | yes | — | — | yes | Report date |
| `fileSize` | string | no | — | — | — | e.g. "1.4 MB" |
| `fileUrl` | string | no | — | — | — | Link to stored PDF |
| `author` | string | no | — | — | — | Author name |
| `downloadCount` | number | no | 0 | — | — | Number of downloads |
| `createdAt` | Date | auto | now | — | — | |
| `updatedAt` | Date | auto | now | — | — | |

**Indexes:**
- `{ reportId: 1 }` — unique
- `{ type: 1, date: -1 }` — filter by type, sorted by date
- `{ date: -1 }` — sort by recency

---

### 3.9 `analytics_events`

**Purpose:** Activity/analytics log for the admin dashboard and analytics page.

| Field | Type | Required | Default | Unique | Index | Notes |
|---|---|---|---|---|---|---|
| `_id` | ObjectId | auto | auto | yes | PK | |
| `eventType` | string | yes | — | — | yes | volunteer, missing, lost_found, emergency, gallery, announcement |
| `titleKey` | string | no | — | — | — | i18n key for event title |
| `titleText` | string | no | — | — | — | Fallback text if no i18n key |
| `titleArgs` | object | no | {} | — | — | Dynamic title arguments |
| `details` | string | no | — | — | — | Additional detail text |
| `status` | string | yes | — | — | yes | pending, active, claimed, resolved, success, published |
| `metadata` | object | no | {} | — | — | Flexible extra data |
| `createdAt` | Date | auto | now | — | yes | |

**Indexes:**
- `{ eventType: 1, createdAt: -1 }` — filter by type, sorted by time
- `{ createdAt: -1 }` — sort for timeline view
- `{ status: 1 }` — filter by status

---

### 3.10 `services`

**Purpose:** The list of services displayed on the home page and services page.

| Field | Type | Required | Default | Unique | Index | Notes |
|---|---|---|---|---|---|---|
| `_id` | ObjectId | auto | auto | yes | PK | |
| `serviceId` | string | yes | — | yes | unique | e.g. "emergency", "missing" |
| `titleKey` | string | yes | — | — | — | i18n key for title |
| `descriptionKey` | string | yes | — | — | — | i18n key for description |
| `iconName` | string | no | — | — | — | Icon identifier for rendering |
| `colorClass` | string | no | — | — | — | CSS color class |
| `order` | number | no | 0 | — | yes | Display order |
| `isActive` | boolean | no | true | — | yes | Toggle visibility |
| `createdAt` | Date | auto | now | — | — | |
| `updatedAt` | Date | auto | now | — | — | |

**Indexes:**
- `{ serviceId: 1 }` — unique
- `{ order: 1 }` — sort order

**Note:** Services are mostly static content driven by i18n keys. They may not need a full CRUD interface. Consider keeping them as configuration rather than a managed collection unless admin editability is required.

---

### 3.11 `faq`

**Purpose:** Frequently Asked Questions entries.

| Field | Type | Required | Default | Unique | Index | Notes |
|---|---|---|---|---|---|---|
| `_id` | ObjectId | auto | auto | yes | PK | |
| `questionKey` | string | yes | — | — | — | i18n key for question |
| `answerKey` | string | yes | — | — | — | i18n key for answer |
| `order` | number | no | 0 | — | yes | Display ordering |
| `category` | string | no | "general" | — | — | FAQ category |
| `isActive` | boolean | no | true | — | — | Toggle visibility |
| `createdAt` | Date | auto | now | — | — | |
| `updatedAt` | Date | auto | now | — | — | |

**Indexes:**
- `{ order: 1 }` — sort order

**Note:** FAQ content is currently driven by i18n keys (English/Marathi translations). If multi-language FAQ content is managed in the database, store both language versions instead of referencing keys.

---

### 3.12 `admins`

**Purpose:** Admin user profiles and authentication.

| Field | Type | Required | Default | Unique | Index | Notes |
|---|---|---|---|---|---|---|
| `_id` | ObjectId | auto | auto | yes | PK | |
| `name` | string | yes | — | — | — | Full name |
| `email` | string | yes | — | yes | unique | Login email |
| `passwordHash` | string | yes | — | — | — | bcrypt hash (never plaintext) |
| `phone` | string | no | — | — | — | Contact number |
| `role` | string | yes | "admin" | — | yes | super_admin, admin, coordinator |
| `about` | string | no | — | — | — | Short bio |
| `isActive` | boolean | no | true | — | yes | Account active? |
| `lastLoginAt` | Date | no | — | — | — | Last login timestamp |
| `createdAt` | Date | auto | now | — | — | |
| `updatedAt` | Date | auto | now | — | — | |

**Indexes:**
- `{ email: 1 }` — unique (login lookup)
- `{ role: 1 }` — filter by role

**Security:**
- NEVER store plaintext passwords
- Use bcrypt (or similar) for password hashing
- `passwordHash` must NEVER be returned in API responses

---

### 3.13 `settings`

**Purpose:** Portal-wide configuration settings manageable by admins.

| Field | Type | Required | Default | Unique | Index | Notes |
|---|---|---|---|---|---|---|
| `_id` | ObjectId | auto | auto | yes | PK | |
| `key` | string | yes | — | yes | unique | Config key, e.g. "siteName", "supportEmail" |
| `value` | any | yes | — | — | — | Config value |
| `type` | string | no | "string" | — | — | string, number, boolean, json |
| `description` | string | no | — | — | — | Human-readable description |
| `updatedBy` | string | no | — | — | — | Admin name or ID |
| `createdAt` | Date | auto | now | — | — | |
| `updatedAt` | Date | auto | now | — | — | |

**Indexes:**
- `{ key: 1 }` — unique

**Note:** Store settings as key-value pairs for flexibility. The admin settings form currently manages: `siteName`, `supportEmail`, `campOfficePhone`, `footerText`.

---

### 3.14 `timeline_stops`

**Purpose:** Wari pilgrimage route milestones displayed on the About page timeline.

| Field | Type | Required | Default | Unique | Index | Notes |
|---|---|---|---|---|---|---|
| `_id` | ObjectId | auto | auto | yes | PK | |
| `stopId` | string | yes | — | yes | unique | e.g. "alandi", "pune", "saswad" |
| `dayRange` | string | yes | — | — | — | e.g. "Day 1 - 2" |
| `titleKey` | string | yes | — | — | — | i18n key for title (English) |
| `titleKeyMr` | string | no | — | — | — | i18n key for title (Marathi) |
| `descriptionKey` | string | yes | — | — | — | i18n key for description (English) |
| `descriptionKeyMr` | string | no | — | — | — | i18n key for description (Marathi) |
| `order` | number | yes | — | — | yes | Sequence order |
| `color` | string | no | — | — | — | CSS color class for marker |
| `isActive` | boolean | no | true | — | — | Toggle visibility |
| `createdAt` | Date | auto | now | — | — | |
| `updatedAt` | Date | auto | now | — | — | |

**Indexes:**
- `{ stopId: 1 }` — unique
- `{ order: 1 }` — sort order

**Note:** Timeline stops are currently driven by i18n keys. This collection is optional for Phase 6.2 and can remain in locale files unless admin editability is required.

---

## 4. Entity Relationships

```
admins (1) ──< manages >── (many) volunteers
admins (1) ──< manages >── (many) missing_persons
admins (1) ──< manages >── (many) lost_items
admins (1) ──< manages >── (many) announcements
admins (1) ──< manages >── (many) gallery_images
admins (1) ──< manages >── (many) emergency_contacts
admins (1) ──< manages >── (many) reports
admins (1) ──< manages >── (many) contact_messages
admins (1) ──< manages >── (many) faq
admins (1) ──< manages >── (1) settings

public (many) ──< submits >── contact_messages
public (many) ──< views >── missing_persons
public (many) ──< views >── lost_items
public (many) ──< views >── announcements
public (many) ──< views >── gallery_images
public (many) ──< views >── emergency_contacts
public (many) ──< views >── services
public (many) ──< views >── faq
public (many) ──< views >── timeline_stops
```

**Key relationships:**
- All admin-managed entities reference `admins` via `createdBy` / `updatedBy` fields (optional string reference)
- `volunteers` is created by public registration but managed (approved/rejected) by admins
- `contact_messages` is submitted by the public and read/managed by admins

---

## 5. Index Recommendations Summary

| Collection | Index | Type | Purpose |
|---|---|---|---|
| `volunteers` | `{ email: 1 }` | Unique | Prevent duplicate registrations |
| `volunteers` | `{ status: 1 }` | Single | Filter pending/approved/rejected |
| `volunteers` | `{ name: "text", college: "text" }` | Text | Search |
| `missing_persons` | `{ status: 1 }` | Single | Filter missing vs found |
| `missing_persons` | `{ name: "text" }` | Text | Search by name |
| `lost_items` | `{ status: 1 }` | Single | Filter by lost/found/claimed |
| `lost_items` | `{ category: 1 }` | Single | Filter by item type |
| `announcements` | `{ status: 1, publishDate: -1 }` | Compound | Fetch active announcements |
| `emergency_contacts` | `{ isActive: 1, order: 1 }` | Compound | Ordered active contacts |
| `gallery_images` | `{ category: 1 }` | Single | Filter by category |
| `contact_messages` | `{ isRead: 1 }` | Single | Filter unread messages |
| `admins` | `{ email: 1 }` | Unique | Login lookup |
| `settings` | `{ key: 1 }` | Unique | Config lookup |
| All collections | `{ createdAt: -1 }` | Single | Sort by recency |

---

## 6. Public vs Admin Access Strategy

| Collection | Public Read | Public Create | Admin Read | Admin Create | Admin Update | Admin Delete |
|---|---|---|---|---|---|---|
| `volunteers` | No | Yes (via register form) | Yes | Yes | Yes (approve/reject) | Yes |
| `missing_persons` | Yes | No (admin only) | Yes | Yes | Yes | Yes |
| `lost_items` | Yes | No (admin only) | Yes | Yes | Yes | Yes |
| `announcements` | Yes (published only) | No | Yes (all statuses) | Yes | Yes | Yes |
| `emergency_contacts` | Yes | No | Yes | Yes | Yes | Yes |
| `gallery_images` | Yes | No | Yes | Yes | Yes | Yes |
| `contact_messages` | No | Yes (via contact form) | Yes | No | Yes (mark read) | Yes |
| `reports` | No | No | Yes | Yes | Yes | Yes |
| `analytics_events` | No | No | Yes | Yes (auto-logged) | No | No |
| `services` | Yes | No | Yes | Yes (if needed) | Yes | Yes |
| `faq` | Yes | No | Yes | Yes | Yes | Yes |
| `admins` | No | No | Yes | Yes (super admin) | Yes (self) | Yes (super admin) |
| `settings` | No | No | Yes | Yes | Yes | No |
| `timeline_stops` | Yes | No | Yes | Yes | Yes | Yes |

**Authentication rules:**
- All admin write operations require authentication
- Public create operations (contact form, volunteer registration) do not require authentication but may implement rate limiting
- Public read operations do not require authentication

---

## 7. Security & Privacy Considerations

### Sensitive Data Identified

| Data | Sensitivity | Storage | Public Exposure |
|---|---|---|---|
| Admin email/password | CRITICAL | `admins` collection, password hashed with bcrypt | NEVER exposed |
| Volunteer phone/email | HIGH | `volunteers` collection | Not exposed publicly |
| Volunteer emergency contact | HIGH | `volunteers` collection | Not exposed publicly |
| Volunteer address | MEDIUM | `volunteers` collection | Not exposed publicly |
| Missing person contact phone | MEDIUM | `missing_persons` collection | Exposed (for tips) - use with caution |
| Lost item contact info | MEDIUM | `lost_items` collection | Exposed (for claiming) |
| Contact message details | MEDIUM | `contact_messages` collection | Not exposed publicly |
| Missing person medical notes | HIGH | `missing_persons` collection | Exposed (for safety) - review per case |
| Database credentials | CRITICAL | `MONGODB_URI` in `.env.local` only | NEVER exposed |

### Protection Rules

1. **Passwords**: NEVER store plaintext passwords. Use bcrypt with salt rounds >= 10.
2. **Environment variables**: All database URIs, API keys, and secrets must be in `.env.local` (gitignored).
3. **API responses**: Never return `passwordHash` or internal `_id` values that could leak user data.
4. **Phone numbers on missing persons**: These are intentionally public for coordination. Consider adding a consent checkbox.
5. **Rate limiting**: Contact form and volunteer registration endpoints should implement rate limiting.
6. **Input sanitization**: All user-submitted text must be sanitized to prevent XSS and NoSQL injection.
7. **Data validation**: Server-side validation must exist for all fields, not just client-side.
8. **Access control**: All admin API routes must verify authentication before returning data.

### Recommended Protection Fields
- Mask/truncate phone numbers in analytics displays
- Never display admin email addresses publicly
- Volunteer personal data (address, emergency contact) should require authentication to view
- Contact messages should only be visible to authenticated admins

---

## 8. Migration Strategy

### Current State
```
Static/Dummy Data (data/*.js files + hardcoded arrays in pages)
    ↓
React Client State (useState, context)
    ↓
UI Rendering
```

### Target State
```
MongoDB Collections (wariseva database)
    ↓
API Routes (Next.js Route Handlers)
    ↓
Server Components / Client Fetch
    ↓
UI Rendering
```

### Migration Phases

#### Phase 6.3 — API Routes & Data Layer
- Create API route handlers for each collection
- Implement CRUD endpoints with validation
- Connect API to MongoDB via `lib/mongodb.js`
- Admin pages fetch from API instead of static imports

#### Phase 6.4 — Frontend Integration
- Replace static data imports with fetch calls to API routes
- Implement loading, empty, and error states
- Connect volunteer registration form to API
- Connect contact form to API

#### Phase 7 — Authentication & Admin
- Implement admin authentication (login/logout)
- Protect admin API routes
- Seed initial admin account
- Connect admin profile/settings pages

#### Migration Order (One Feature at a Time)

| Step | Collection | Risk | Reason |
|---|---|---|---|
| 1 | `announcements` | Low | Simple CRUD, no public page dependency yet |
| 2 | `emergency_contacts` | Low | Small dataset, read-only public display |
| 3 | `missing_persons` | Medium | Core feature with public + admin interfaces |
| 4 | `lost_items` | Medium | Similar pattern to missing_persons |
| 5 | `volunteers` | Medium | Registration form + admin approval workflow |
| 6 | `gallery_images` | Low | Image URL storage, admin upload flow |
| 7 | `contact_messages` | Low | Simple form submission, admin inbox |
| 8 | `reports` | Low | Admin-only feature |
| 9 | `analytics_events` | Low | System-generated, no user interaction |
| 10 | `admins` | High | Requires authentication first |
| 11 | `settings` | Low | Admin-only configuration |
| 12 | `services` | Very Low | Highly static, can stay as config |
| 13 | `faq` | Very Low | Highly static, can stay in locales |
| 14 | `timeline_stops` | Very Low | Highly static, can stay in locales |

### Rollback Strategy
- Keep `data/*.js` files intact during migration
- Each feature migration is independent
- If a feature's API fails, the component can fall back to static data imports
- No data is deleted from static files until API is verified working

---

## 9. Duplicate Data Check

| Entity | Files Found | Notes |
|---|---|---|
| **Emergency Contacts** | `data/dummyData.js` (4 items), `app/emergency-contacts/page.js` (8 items hardcoded) | **DUPLICATE**. The footer uses `data/dummyData.js` (4 items: police, medical, nss, email). The emergency contacts page has 8 hardcoded items (police, ambulance, medical, fire, nss, women, child, control). These overlap but differ in detail. **Recommendation**: Single source of truth in `emergency_contacts` collection. |
| **Gallery Images** | `app/gallery/page.js` (12 images hardcoded), `app/admin/gallery/page.js` (6 images hardcoded) | **DUPLICATE**. The public page has 12 images, admin has 6. Admin images are a subset. **Recommendation**: Single source of truth in `gallery_images` collection. |
| **Services** | `data/dummyData.js` (10 services), `app/services/page.js` (imports from data) | **MOVED**. `services.js` data file and page import match. Single source. |
| **Dashboard Stats** | `data/dashboard.js` | Single source. |
| **Recent Activities** | `data/dashboard.js` | Single source. However, this will be replaced by real analytics events. |
| **Volunteer List** | `data/volunteers.js` | Single source. |
| **Missing Persons** | `data/missingPersons.js` | Single source. |
| **Lost Items** | `data/lostItems.js` | Single source. |
| **Announcements** | `data/announcements.js` | Single source. |
| **Reports** | `data/reports.js` | Single source. |
| **FAQ** | `app/faq/page.js` (hardcoded) | Single source (inline). |

**Key finding:** Emergency contacts and gallery images have duplicated definitions between admin and public views. After migration, both admin and public pages should read from the same MongoDB collection.

---

## 10. Future Expansion Considerations

### Additional Collections (Potential Future)
| Collection | Purpose |
|---|---|
| `medical_camps` | Track medical camp locations, supplies, staff |
| `food_distribution` | Food/water distribution points and schedules |
| `crowd_density` | Real-time crowd density at key locations |
| `transport_schedule` | Bus/train schedules for pilgrims |
| `feedback` | Post-event feedback from volunteers and pilgrims |
| `notifications` | Push notification logs |
| `audit_log` | Admin action audit trail |

### Schema Evolution Strategy
- Use MongoDB's flexible schema to add fields as needed
- Add new fields with `required: false` initially
- Use `$set` for backward-compatible updates
- Document all schema changes in this file

### Performance Considerations
- Expected collection sizes: `volunteers` (~5K max), `missing_persons` (~500/year), `lost_items` (~1K/year)
- All other collections are small (< 200 documents)
- No sharding needed for current scale
- Ensure indexes on all query patterns before production deployment

---

## 11. Data File Map

| Current Data File | Maps To Collection | Status |
|---|---|---|
| `data/dummyData.js` → navLinks | — | Config, no collection needed |
| `data/dummyData.js` → statistics | — | Config, no collection needed |
| `data/dummyData.js` → services | `services` | Optional migration |
| `data/dummyData.js` → emergencyContacts | `emergency_contacts` | Migrate (also duplicate with page.js) |
| `data/volunteers.js` | `volunteers` | Migrate |
| `data/missingPersons.js` | `missing_persons` | Migrate |
| `data/lostItems.js` | `lost_items` | Migrate |
| `data/announcements.js` | `announcements` | Migrate |
| `data/dashboard.js` | `analytics_events` | Migrate (replace with real data) |
| `data/analytics.js` | `analytics_events` | Migrate (replace with real data) |
| `data/reports.js` | `reports` | Migrate |
| `app/faq/page.js` → faqItems | `faq` | Optional migration |
| `app/gallery/page.js` → images | `gallery_images` | Migrate |
| `app/admin/gallery/page.js` → images | `gallery_images` | Migrate (same source) |
| `app/emergency-contacts/page.js` → contacts | `emergency_contacts` | Migrate (same source as footer) |
| `components/Timeline.js` → steps | `timeline_stops` | Optional migration |
| `context/LanguageContext.js` | — | No migration needed |
| `locales/en.json`, `locales/mr.json` | — | No migration needed (translation system) |
