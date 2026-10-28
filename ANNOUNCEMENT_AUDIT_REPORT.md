# Announcement Management System Audit Report
Project: Pandharpur Wari Seva
Date: 2026-10-23

---

## 1. Files and Components Inspected

### Core Model & Database
- `lib/models/announcements.js` — MongoDB model with validation, indexes, CRUD helpers
- `lib/models/helpers.js` — Shared validation, ID generation, timestamp utilities
- `lib/models/index.js` — Model exports and index management

### API Routes
- `app/api/announcements/route.js` — GET (list with pagination/filtering), POST (create)
- `app/api/announcements/[id]/route.js` — GET (single), PATCH (update), DELETE

### Admin UI
- `app/admin/announcements/page.js` — Full admin management interface (create/edit/list/delete)
- `app/admin/announcements/loading.js` — Loading skeleton

### Public/Volunteer Display
- `components/AnnouncementTicker.js` — Scrolling ticker on home page
- `app/page.js` — Home page including AnnouncementTicker
- `app/volunteer/dashboard/page.js` — Volunteer dashboard (no direct announcement display)

### Dashboard & Analytics
- `app/api/dashboard/route.js` — Admin dashboard stats including "active_announcements" count
- `app/admin/page.js` — Admin dashboard UI showing alerts from published announcements

### Translations
- `locales/en.json` — English strings (admin.announcements.*, announcements.*)
- `locales/mr.json` — Marathi strings (admin.announcements.*, announcements.*)

### Auth & Helpers
- `lib/api-helpers.js` — Authentication, authorization (requireRole), response helpers
- `lib/push-notifications.js` — Push notification on publish

---

## 2. Current Announcement Workflow

### Data Model (MongoDB)
```javascript
{
  announcementId: "ANN-2026-001",  // Human-readable ID
  title: "Heavy Rain Alert",
  description: "Heavy rains expected...",
  category: "safety",              // safety | schedule | camp | general
  status: "published",             // published | draft | scheduled
  priority: "high",                // high | medium | low
  publishDate: ISODate("..."),     // When announcement becomes active
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

### Status Semantics (Current)
| Status | Meaning | Visible to Public/Volunteers? |
|--------|---------|-------------------------------|
| `published` | Live announcement | **Yes** (via API filter) |
| `draft` | Work in progress | **No** (API filters to published only) |
| `scheduled` | Future publication | **No** (API filters to published only) |

### Creation Flow (Admin)
1. Admin opens `/admin/announcements`
2. Fills form (title, description, category, priority, status, publishDate)
3. Clicks "Publish Announcement" button (label is misleading — saves with whatever status selected)
4. `POST /api/announcements` creates document
5. If `status === "published"`, push notification sent to all volunteers

### Editing Flow
1. Admin clicks edit icon on any announcement in list
2. Modal opens pre-filled with current values
3. Admin modifies fields including status
4. `PATCH /api/announcements/[id]` updates document
5. If status changed **TO** `published`, push notification sent

### Deletion Flow
1. Admin clicks trash icon → confirmation dialog → confirm
2. `DELETE /api/announcements/[id]` permanently removes document
3. **No archive/restore capability**

### Public/Volunteer Fetch
- `GET /api/announcements?limit=10` (no auth) → returns only `status: "published"`
- `AnnouncementTicker` polls this endpoint on mount
- Admin dashboard shows "active_announcements" count = `countDocuments({ status: "published" })`

### Authorization
| Action | Required Role |
|--------|---------------|
| List all (with status filter) | super_admin, admin, coordinator |
| List published (public) | None |
| Create | super_admin, admin |
| Update | super_admin, admin |
| Delete | super_admin, admin |
| View single (non-published) | super_admin, admin, coordinator |

---

## 3. Confirmed Bugs / Limitations

### Critical Gaps vs. Requirements

| # | Requirement | Current State | Gap |
|---|-------------|---------------|-----|
| 1 | Save as draft without publishing | **Supported** (status: "draft") | ✅ Works |
| 2 | Publish an announcement | **Supported** (status: "published") | ✅ Works |
| 3 | Edit existing announcement | **Supported** (PATCH) | ✅ Works |
| 4 | **Archive selected published announcements** | **NOT SUPPORTED** | ❌ No "archived" status |
| 5 | **Restore an archived announcement** | **NOT SUPPORTED** | ❌ No archive state |
| 6 | **Delete only via explicit confirmed action** | **Partially** — has confirmation dialog but **permanent delete only** | ⚠️ No soft-delete/archive alternative |
| 7 | **Publish new + choice to archive selected previous** | **NOT SUPPORTED** | ❌ No bulk archive-on-publish workflow |
| 8 | Never auto-delete/archive all previous on new create | **Compliant** — current code doesn't do this | ✅ Safe |
| 9 | Archived remain in MongoDB, hidden from active view | **N/A** — no archive status | ❌ Missing |
| 10 | Drafts not visible to volunteers/public | **Compliant** — API filters to published only | ✅ Works |

### UI/UX Issues
1. **Misleading button label**: "Publish Announcement" button saves with whatever status is selected (draft/scheduled/published)
2. **No status filter in admin list**: Admin sees all announcements mixed; no tabs/filters for Published/Draft/Scheduled/Archived
3. **No visual distinction** in list for draft vs published vs scheduled
4. **No bulk actions**: Cannot select multiple and archive/publish/delete
5. **No "Archive" button** — only Edit and Delete
6. **Push notification logic**: Only triggers on create-if-published or update-to-published. No notification on schedule→published transition (handled by update logic), but no "scheduled publishing" cron job exists.

### Data Integrity
- **No soft-delete**: `DELETE` is permanent. No `deletedAt` or `isArchived` field.
- **No audit trail** for status changes (who published/archived when).
- **Scheduled status unused**: No background job to auto-publish scheduled announcements at `publishDate`.

### Translation Coverage
- English & Marathi have keys for create/edit form labels, but **missing** keys for:
  - "Archive", "Restore", "Archived" status label
  - "Archive selected previous announcements" workflow text
  - Bulk action confirmations

---

## 4. Recommended Implementation Plan

### Phase 1: Data Model Extensions (Backward Compatible)
1. **Add "archived" to VALID_STATUSES** in `announcements.js`
2. **Add indexes** for `status: "archived"` queries
3. **No migration needed** — existing documents unaffected; new status is additive

### Phase 2: API Enhancements
1. **GET /api/announcements** — Add `archived` to allowed status filters for admins
2. **PATCH /api/announcements/[id]** — Allow status transitions to/from `archived`
3. **New endpoint**: `POST /api/announcements/[id]/archive` (explicit archive action)
4. **New endpoint**: `POST /api/announcements/[id]/restore` (restore from archived → draft or published)
5. **New endpoint**: `POST /api/announcements/bulk-archive` — Accept array of IDs + new announcement data; archive selected, create new
6. **Keep DELETE** as permanent, but add warning in UI that it's irreversible

### Phase 3: Admin UI Overhaul
1. **Add status tabs/filter**: All | Published | Draft | Scheduled | Archived
2. **Visual badges** for each status in list view
3. **Replace Delete button** with:
   - "Archive" button (for published/scheduled)
   - "Restore" button (for archived → draft)
   - "Delete" button (for draft/archived only, with stronger confirmation)
4. **Fix "Publish Announcement" button** → "Save Announcement"; show status selector clearly
5. **Add bulk actions toolbar** when checkboxes selected: Archive Selected, Delete Selected (drafts only)
6. **Add "Publish New & Archive Selected" workflow**:
   - Checkbox column in list
   - "Create New" button opens modal with option: "Archive selected published announcements"
   - On submit: bulk archive checked items + create new published announcement

### Phase 4: Scheduled Publishing (Optional but Recommended)
1. Add cron job / Next.js middleware / scheduled function to:
   - Query `status: "scheduled" AND publishDate <= now`
   - Update to `published` + send push notification
2. Or use MongoDB TTL index + change stream (more complex)

### Phase 5: Translations
Add missing keys to both `en.json` and `mr.json`:
```json
{
  "admin": {
    "announcements": {
      "status_archived": "Archived",
      "btn_archive": "Archive",
      "btn_restore": "Restore",
      "btn_bulk_archive": "Archive Selected",
      "confirm_archive": "Archive selected announcements?",
      "confirm_restore": "Restore this announcement to draft?",
      "confirm_delete_permanent": "Permanently delete? This cannot be undone.",
      "publish_with_archive": "Publish new & archive selected",
      "archive_selected_label": "Archive selected published announcements",
      "no_archived": "No archived announcements",
      "tab_all": "All",
      "tab_published": "Published",
      "tab_draft": "Drafts",
      "tab_scheduled": "Scheduled",
      "tab_archived": "Archived"
    }
  }
}
```

---

## 5. Database Compatibility & Data Preservation

### ✅ Safe Changes (Additive Only)
- Adding `"archived"` to `VALID_STATUSES` enum — **no migration**, existing docs valid
- New indexes — **online creation**, no downtime
- New API endpoints — **additive**, no breaking changes

### ⚠️ Changes Requiring Caution
- **PATCH status transitions**: Add validation to prevent invalid transitions (e.g., archived → scheduled directly)
- **DELETE endpoint**: Keep as-is (permanent). Document that archive is preferred.

### 📊 Current Data Impact Assessment
Run this query to understand existing data:
```javascript
db.announcements.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])
```
Expected: Mostly "published", some "draft", possibly "scheduled". Zero "archived".

### 🔒 Rollback Plan
- If issues arise: Remove `"archived"` from `VALID_STATUSES`, drop new indexes, revert API/UI code
- No data loss since no documents are modified during migration

---

## 6. Files Requiring Modification

### Must Change
| File | Changes |
|------|---------|
| `lib/models/announcements.js` | Add "archived" to VALID_STATUSES; add archive/restore helper functions |
| `app/api/announcements/route.js` | Allow `status=archived` filter for admins; add bulk-archive endpoint |
| `app/api/announcements/[id]/route.js` | Allow status transitions to/from archived; add archive/restore endpoints |
| `app/admin/announcements/page.js` | Major UI overhaul: tabs, badges, bulk actions, archive/restore buttons, publish-with-archive workflow |

### Should Change (Translations)
| File | Changes |
|------|---------|
| `locales/en.json` | Add missing announcement keys (archive, restore, tabs, confirmations) |
| `locales/mr.json` | Add Marathi translations for new keys |

### Optional Enhancements
| File | Changes |
|------|---------|
| `lib/push-notifications.js` | No change needed (triggers on publish) |
| `app/api/dashboard/route.js` | No change (counts published only = "active") |
| `components/AnnouncementTicker.js` | No change (fetches published only) |
| Scheduled job (new file) | `lib/cron/publish-scheduled.js` or Vercel Cron for auto-publish |

---

## 7. Testing Plan

### Unit / Model Tests
- [ ] `validate()` accepts "archived" status
- [ ] `prepareForInsert()` defaults status to "draft"
- [ ] `prepareForUpdate()` allows status transitions including archived
- [ ] Index creation includes archived status

### API Integration Tests
- [ ] GET `/api/announcements?status=archived` returns archived (admin only)
- [ ] GET `/api/announcements` (public) excludes archived
- [ ] PATCH status: published → archived ✓
- [ ] PATCH status: archived → draft ✓
- [ ] PATCH status: archived → published ✓
- [ ] POST `/api/announcements/bulk-archive` archives selected + creates new
- [ ] DELETE still works (permanent)
- [ ] Push notification sent on publish (create published, update to published, restore to published)

### Admin UI Tests
- [ ] Tabs filter correctly: All/Published/Draft/Scheduled/Archived
- [ ] Status badges show correct color/label per status
- [ ] "Archive" button visible on published/scheduled rows
- [ ] "Restore" button visible on archived rows
- [ ] "Delete" button only on draft/archived rows (with stronger confirm)
- [ ] Bulk checkbox selection enables bulk actions toolbar
- [ ] "Create New" modal has "Archive selected published" checkbox
- [ ] Creating with "Archive selected" archives checked items + creates published
- [ ] Editing draft → published sends push notification
- [ ] Marathi locale renders all new strings correctly

### Public/Volunteer Tests
- [ ] Home page ticker shows only published announcements
- [ ] Archived announcements never appear in ticker
- [ ] Draft/scheduled never appear in ticker
- [ ] Volunteer dashboard unaffected (no announcement display currently)

### Regression Tests
- [ ] Existing published announcements still display
- [ ] Existing drafts still editable
- [ ] Admin dashboard "active_announcements" count unchanged
- [ ] Admin dashboard "alerts" panel shows published announcements
- [ ] No data loss after deployment

### Edge Cases
- [ ] Archive already-archived announcement (should no-op or error gracefully)
- [ ] Restore deleted announcement (impossible — confirm permanent delete warns)
- [ ] Bulk archive with zero selected (should disable button)
- [ ] Concurrent status updates (optimistic locking not implemented — accept last-write-wins)
- [ ] Scheduled announcement auto-publish (if cron implemented)

---

## Summary

**Current system supports**: Draft, Published, Scheduled statuses; create/edit/delete; public fetch of published only.

**Missing for requirements**: Archive status, restore, bulk archive-on-publish, explicit confirmed delete (soft-delete alternative), status-filtered admin UI.

**Risk Level**: **Low** — all changes are additive; no existing data migration required; existing API contracts preserved.

**Estimated Effort**: 
- Model/API: ~2-3 hours
- Admin UI: ~4-6 hours (most complex)
- Translations: ~30 min
- Testing: ~2-3 hours
- **Total: ~1-2 days**

---

**Next Step**: Await your approval to proceed with implementation.