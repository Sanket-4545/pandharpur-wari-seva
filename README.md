# Pandharpur Wari NSS Seva Portal - Phase 1

This is the foundation and home page of the **Pandharpur Wari NSS Seva Portal**, a modern production-ready web application built to coordinate National Service Scheme (NSS) volunteer support and services for pilgrims (Warkaris) during the annual Pandharpur Wari.

## Tech Stack
- **Framework:** Next.js (App Router)
- **Language:** JavaScript
- **Styling:** Tailwind CSS (Custom saffron & deep blue palette)
- **Icons:** Lucide React
- **Translation:** Client-side React Context and Local Storage (English & Marathi support)

## Getting Started

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Run the Development Server:**
   ```bash
   npm run dev
   ```

3. **Open the App:**
   Navigate to `http://localhost:3000` to view the homepage.

## Folder Structure
- `app/` - Layout and routing configuration.
- `components/` - Reusable presentational and interactive elements.
- `locales/` - Translation files for English (`locales/en.json`) and Marathi (`locales/mr.json`).
- `data/` - Static lists for services, statistics, and helpline contacts.
- `context/` - Global context for locale/language switching.
- `public/` - Static assets and placeholders.
