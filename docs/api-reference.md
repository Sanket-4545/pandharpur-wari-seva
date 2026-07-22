# API Reference

## Base URL
All endpoints are prefixed with `/api`.

## Common Patterns

### Response Format
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Format
```json
{
  "success": false,
  "error": "message"
}
```

### Pagination
List endpoints accept `page` (default 1) and `limit` (default 10) query params.
Paginated response format:
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "pages": 5
  }
}
```

---

## Volunteers
- **GET** `/api/volunteers` — List volunteers (paginated, filterable by `status`, `role`, `serviceArea`)
- **POST** `/api/volunteers` — Create new volunteer
- **GET** `/api/volunteers/[id]` — Get volunteer by `_id`
- **PATCH** `/api/volunteers/[id]` — Update volunteer status (`{ "status": "active" | "inactive" | "completed" }`)
- **DELETE** `/api/volunteers/[id]` — Delete volunteer

## Missing Persons
- **GET** `/api/missing-persons` — List missing persons (paginated, filterable by `status`, `gender`, `search`)
- **POST** `/api/missing-persons` — Create new missing person record
- **GET** `/api/missing-persons/[id]` — Get missing person by `caseId`
- **PATCH** `/api/missing-persons/[id]` — Update record
- **DELETE** `/api/missing-persons/[id]` — Delete record

## Lost Items
- **GET** `/api/lost-items` — List lost/found items (paginated, filterable by `status`, `type`, `category`, `search`)
- **POST** `/api/lost-items` — Create new lost/found item
- **GET** `/api/lost-items/[id]` — Get item by `itemId`
- **PATCH** `/api/lost-items/[id]` — Update item
- **DELETE** `/api/lost-items/[id]` — Delete item

## Contact Messages
- **GET** `/api/contact-messages` — List messages (admin, paginated)
- **POST** `/api/contact-messages` — Submit contact form (public)
- **GET** `/api/contact-messages/[id]` — Get message by `_id`
- **PATCH** `/api/contact-messages/[id]` — Mark as read (`{ "read": true }`)
- **DELETE** `/api/contact-messages/[id]` — Delete message

## Reports
- **GET** `/api/reports` — List reports (paginated, filterable by `type`)
- **POST** `/api/reports` — Create new report
- **GET** `/api/reports/[id]` — Get report by `reportId`
- **PATCH** `/api/reports/[id]` — Update report status
- **DELETE** `/api/reports/[id]` — Delete report

## Announcements
- **GET** `/api/announcements` — List announcements (paginated, filterable by `status`, `category`)
- **POST** `/api/announcements` — Create new announcement
- **GET** `/api/announcements/[id]` — Get announcement by `announcementId`
- **PATCH** `/api/announcements/[id]` — Update announcement
- **DELETE** `/api/announcements/[id]` — Delete announcement

## Emergency Contacts
- **GET** `/api/emergency-contacts` — List active contacts (filterable by `category`)
- **POST** `/api/emergency-contacts` — Create new contact
- **PUT** `/api/emergency-contacts/[id]` — Update contact
- **DELETE** `/api/emergency-contacts/[id]` — Delete contact

## Gallery Images
- **GET** `/api/gallery-images` — List images (paginated, filterable by `category`)
- **POST** `/api/gallery-images` — Create new image entry
- **DELETE** `/api/gallery-images/[id]` — Delete image

## Services
- **GET** `/api/services` — List active services
- **POST** `/api/services` — Create new service
- **PUT** `/api/services/[id]` — Update service
- **DELETE** `/api/services/[id]` — Delete service

## FAQ
- **GET** `/api/faq` — List active FAQs
- **POST** `/api/faq` — Create new FAQ
- **PUT** `/api/faq/[id]` — Update FAQ
- **DELETE** `/api/faq/[id]` — Delete FAQ

## Timeline Stops
- **GET** `/api/timeline-stops` — List active timeline stops (sorted by `order`)
- **POST** `/api/timeline-stops` — Create new stop
- **PUT** `/api/timeline-stops/[id]` — Update stop
- **DELETE** `/api/timeline-stops/[id]` — Delete stop

## Settings
- **GET** `/api/settings` — List all settings
- **POST** `/api/settings` — Create new setting
- **GET** `/api/settings/[key]` — Get setting by key
- **PUT** `/api/settings/[key]` — Create/update setting by key (upsert)
- **DELETE** `/api/settings/[key]` — Delete setting
- **PATCH** `/api/settings` — Bulk upsert settings

## Admins
- **GET** `/api/admins` — List admins (sanitized, no passwords)
- **POST** `/api/admins` — Create admin (password hashed)
- **GET** `/api/admins/[id]` — Get admin by `_id`
- **PUT** `/api/admins/[id]` — Update admin
- **DELETE** `/api/admins/[id]` — Delete admin

## Analytics Events
- **GET** `/api/analytics-events` — List events (paginated, filterable by `eventType`)
- **POST** `/api/analytics-events` — Create event
- **GET** `/api/analytics-events/[id]` — Get event by `_id`

## Database
- **GET** `/api/db` — Get database stats (collection names and document counts)
