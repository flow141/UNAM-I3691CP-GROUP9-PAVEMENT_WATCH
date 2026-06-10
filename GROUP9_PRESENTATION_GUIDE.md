# Pavement Watch — Group 9 Presentation Guide
**UNAM I3691CP | 2026**

---

## Who This Is For

| Role | Members |
|---|---|
| Project Managers | FRANS IMT (225058626), KANDJABANGA PTO (22127511) |
| Lead Developers | NKOSI MJ (225056437), NICODEMUS TN (225061066) |
| Firebase Leads | NDAKOLUTE PN (225031809), NEEMA W (222098694), HAUFIKU MV (225059738) |
| UI/UX Leads | NDILI MN (225057069), SHIKONGO NI (225056186), INGULA TN (224145959) |
| Document Leads | JUUSO SN (225045451), AMUSHILA AH (225085674), MATENGU TT (224096281) |
| GitHub Managers | ININGA FI (225058251), JOHANNES AT (222092203) |

---

## 1. What Is Pavement Watch?

Pavement Watch is a **mobile app** that allows citizens to report road and pavement problems (like potholes, broken sidewalks, damaged signs) in their area. The app connects three types of people:

- **Citizens (Users)** — take a photo of a problem, mark the location, and submit a report
- **Field Workers** — receive tasks assigned by an admin and go fix the reported problems
- **Admins** — review incoming reports, approve or reject them, and assign workers

Think of it like a complaint/ticketing system for roads — but on your phone.

---

## 2. The Big Picture — How the App Works

```
CITIZEN takes photo of pothole
        ↓
Reports it in the app (photo + GPS location + description)
        ↓
Report is saved as PENDING
        ↓
ADMIN reviews the report → APPROVES or REJECTS it
        ↓
If approved → WORKER is assigned the task
        ↓
WORKER navigates to location → fixes the problem → marks task COMPLETE
        ↓
CITIZEN sees their report status updated
```

This full cycle is called the **Report Workflow** and is the core feature of the app.

---

## 3. The Tech Stack (What the App Is Built With)

You don't need to memorise these, but you should know what each one does.

### Expo & React Native
- **React Native** is a framework for building mobile apps using JavaScript. Instead of writing separate code for Android and iPhone, you write once and it works on both.
- **Expo** is a tool on top of React Native that makes it easier to build, run, and test. It handles things like camera access, GPS, and running the app on your phone for testing.
- **React** is the underlying library. Think of it like building with LEGO — each piece of the screen (a button, a card, a map) is a "component" (a LEGO block) that you put together.

### Expo Router
- This controls **navigation** — how you move from one screen to another.
- It uses a **file-based** system: if you create a file called `report.jsx` inside the `user/` folder, that automatically becomes the `/user/report` screen. The file structure *is* the navigation structure.

### Firebase (Google's Backend Service)
- Firebase is a service from Google that gives us a **database, authentication (login), and file storage** without needing to build a server from scratch.
- We use three parts of Firebase:
  1. **Firebase Auth** — handles login and sign-up (email & password)
  2. **Firestore** — the database where user accounts are stored
  3. **Firebase Storage** — where uploaded photos are saved

### Geoapify (Maps & Location)
- This is a **maps API** — a service we pay/sign up for that gives us map visuals and location features.
- We use it for two things:
  1. **Map Tiles** — the actual visual map you see on screen (the streets, buildings, etc.)
  2. **Reverse Geocoding** — converting GPS coordinates (like `-22.5609, 17.0658`) into a readable address (like "123 Independence Ave, Windhoek")

### AsyncStorage
- This is **local storage on the device** — like saving data to the phone itself.
- Reports and tasks are temporarily saved here so the app works even with slow internet.

---

## 4. The Three User Roles — Screens & Features

### Role 1: User (Community Reporter)

| Screen | What It Does |
|---|---|
| Home | Dashboard showing a map of their submitted reports, stats (how many active, resolved) |
| Report Issue | Form to submit a new report — takes a photo, gets GPS location, selects issue type |
| My Reports | List of all reports the user has submitted with their current status |
| Notifications | Updates about their report status changes |
| Profile | User info, account settings |

**Issue Types a user can report:**
- Pothole
- Broken Sidewalk
- Road Crack
- Damaged Sign
- Street Light Out

### Role 2: Worker (Field Worker)

| Screen | What It Does |
|---|---|
| Tasks | Dashboard showing assigned tasks with a count of active vs completed |
| Map | Interactive map showing all task locations, with navigation directions |
| Task Details | Full info about a specific task, buttons to "Start Work" and "Mark Complete" |
| Notifications | Alerts for new task assignments |
| Profile | Worker info, stats (tasks completed, success rate) |

### Role 3: Admin

| Screen | What It Does |
|---|---|
| Dashboard | Shows all pending reports, buttons to Approve or Reject each one |
| Reports | Full list of all reports with search and filter options |
| Notifications | (In progress) |
| Profile | (In progress) |

---

## 5. The File Structure — Where Things Live

```
pavement-watch/
│
├── app/                    ← All the SCREENS live here
│   ├── index.jsx           ← Login screen (first screen you see)
│   ├── signup.jsx          ← Sign-up screen
│   ├── user/               ← Screens only the User role sees
│   ├── worker/             ← Screens only the Worker role sees
│   └── admin/              ← Screens only the Admin role sees
│
├── components/             ← Reusable building blocks (shared across screens)
│   ├── shared/             ← Things used everywhere (buttons, maps, nav bar)
│   └── auth/               ← Components used on login/signup screens
│
├── services/               ← Code that talks to outside services
│   ├── firebase.js         ← Connects to Firebase
│   ├── geoapify.js         ← Connects to the Geoapify map/location API
│   ├── maps.js             ← Helper functions for directions
│   └── storage.js          ← Wrapper around AsyncStorage (local device storage)
│
├── constants/              ← Fixed values used across the app
│   ├── theme.js            ← Colors, spacing, border sizes
│   └── maps.js             ← Map coordinate helpers
│
├── assets/                 ← Images and icons
├── .env                    ← SECRET API keys (never share this file publicly)
├── .env.example            ← A safe template showing what keys are needed
├── app.config.js           ← App settings (name, bundle ID, permissions)
└── package.json            ← List of all libraries/packages the app uses
```

---

## 6. Environment Files & API Keys

### What is a `.env` file?

A `.env` file is a plain text file that stores **secret values** your app needs — like API keys and passwords. It is kept **off GitHub** (listed in `.gitignore`) so that strangers cannot steal your keys.

Think of it like the app's private key ring. The app reads from it when it starts, but you never show it to anyone.

### Our `.env` file contains:

```
EXPO_PUBLIC_GEOAPIFY_MAPS_API_KEY=9075f481c308412fbef436ee3474ae68
EXPO_PUBLIC_GEOAPIFY_GEOCODING_API_KEY=5e196c836e1940f083c308b8e3cd61f5
```

- The prefix `EXPO_PUBLIC_` means Expo is allowed to read this value inside the app code.
- Without these keys, the map will not load and location addresses will not work.

### What is a `.env.example` file?

This is a **safe copy** of the `.env` file with the actual values removed. It shows teammates what variables they need, without exposing the real secrets.

```
EXPO_PUBLIC_GEOAPIFY_MAPS_API_KEY=your_key_here
EXPO_PUBLIC_GEOAPIFY_GEOCODING_API_KEY=your_key_here
```

When a new team member clones the project, they copy `.env.example` → rename it `.env` → fill in the real keys.

### Firebase Keys

Firebase keys are stored directly in `services/firebase.js`:

| Key | Value | What It's For |
|---|---|---|
| `apiKey` | `AIzaSyBPqEpRX3c5G6dPGMJV06A7OMz1R1R9LPk` | Identifies our app to Google/Firebase |
| `projectId` | `pavement-watch-8c9de` | The name of our Firebase project |
| `authDomain` | `pavement-watch-8c9de.firebaseapp.com` | Where login requests are sent |
| `storageBucket` | `pavement-watch-8c9de.firebasestorage.app` | Where photos are uploaded |
| `appId` | `1:1063834639851:web:355b24f…` | Unique ID for this specific app |

> **Important note for presentation:** Firebase keys in a client app are not completely secret — they are meant to be restricted using **Firestore Security Rules** instead. The rules file (`firestore.rules`) controls who can read or write data.

---

## 7. The APIs in Detail

### Geoapify — Map API

**What is an API?**
An API (Application Programming Interface) is a way for your app to ask another service for something. Like calling a restaurant to order food — you don't go into the kitchen, you just call and ask.

**How Geoapify works in our app:**

1. **Map Tiles API**
   - When you open a map screen, the app sends a request to Geoapify saying "give me the map image for this area"
   - Geoapify sends back map tiles (small square image chunks that form the full map)
   - This is why you see a real street map — not just a blank screen
   - The map style used is `osm-bright` (OpenStreetMap bright theme)

2. **Reverse Geocoding API**
   - When GPS gives us coordinates like `-22.5609, 17.0658`, that means nothing to a human
   - The app sends those coordinates to Geoapify and asks "what address is this?"
   - Geoapify replies with something like "Independence Ave, Windhoek, Namibia"
   - That readable address is then shown on the report form

**Where the code lives:** `services/geoapify.js`

---

### Firebase — Backend Service

**Firebase Authentication**
- Handles sign-up and login
- Uses email + password
- When you log in, Firebase gives the app a **token** (like a wristband at an event) that proves you are who you say you are
- The token is stored locally on the device so you stay logged in

**Firestore Database**
- A **NoSQL database** — data is stored in "documents" inside "collections", not in tables like Excel
- Our main collection: `users`
  - Each document = one user
  - Each document has fields: `email`, `fullName`, `role`, `createdAt`
- Think of it like a filing cabinet: `users` is the drawer, each person is a folder inside it

**Firebase Storage**
- Used to store photos taken when reporting an issue
- When a user takes a photo, the image is uploaded here and a URL (link) to that image is saved in the report

**Firestore Security Rules**
- The file `firestore.rules` controls who can read and write to the database
- Currently set to allow **all reads and writes until 5 July 2026** (development/testing mode)
- Before going live/production, these rules must be tightened so only logged-in users can access their own data

---

## 8. Data Flow — Step by Step

### When a User Submits a Report

```
1. User opens "Report Issue" screen
2. Takes a photo → image saved to Firebase Storage
3. App gets GPS coordinates from phone → sends to Geoapify → gets address
4. User selects issue type + writes description
5. User taps Submit
6. Report is saved to AsyncStorage (local) as "pending"
7. Report appears in Admin's dashboard
```

### When an Admin Approves a Report

```
1. Admin sees the report in the Dashboard
2. Admin taps Approve
3. Report status changes from "pending" → "approved"
4. A new task is created for a Worker
5. Task saved to AsyncStorage under workerTasks
```

### When a Worker Completes a Task

```
1. Worker sees task in their Task list
2. Worker opens the Map → navigates to the location
3. Worker opens Task Details → taps "Start Work"
4. Worker fixes the problem → taps "Mark Complete"
5. Task moves to completedTasks
6. Worker's success rate stats update
```

---

## 9. Report Status Lifecycle

Every report/task moves through these statuses:

```
PENDING → APPROVED → IN PROGRESS → COMPLETED
                ↘
              REJECTED
```

| Status | Color | Meaning |
|---|---|---|
| Pending | Orange | Submitted, waiting for admin review |
| Approved | Blue | Admin approved, waiting for worker |
| In Progress | Yellow | Worker has started fixing it |
| Completed | Green | Fixed and done |
| Rejected | Red | Admin decided it was invalid |

---

## 10. The Map System

The map in Pavement Watch uses a special setup because React Native's built-in maps have limitations on some platforms.

**How it works:**
- We use a `WebView` (basically a mini web browser inside the app)
- Inside that WebView, we load a **Leaflet.js** map (a popular open-source web map library)
- Leaflet fetches map images from **Geoapify**
- The result looks like a normal map but is actually a webpage embedded in the app

**Why this approach?**
- Works consistently on Android and iOS
- Geoapify tiles look clean and load fast
- Easier to customise markers and overlays

**Files involved:**
- `components/shared/GeoapifyMapView.jsx` — the map component
- `services/geoapify.js` — the API call logic
- `constants/maps.js` — coordinate helper functions

---

## 11. Bottom Navigation (Role-Based)

The bottom navigation bar changes depending on who is logged in:

| User Role | Tab 1 | Tab 2 | Tab 3 | Tab 4 |
|---|---|---|---|---|
| User | Home | Reports | Alerts | Profile |
| Worker | Tasks | Map | Alerts | Profile |
| Admin | Dashboard | Reports | Alerts | Profile |

The app reads the user's `role` from Firebase after login and shows the correct navigation.

**File:** `components/shared/BottomNav.jsx`

---

## 12. GitHub & CI/CD Workflows

**What is GitHub used for here?**
- Storing all the code (version control)
- Managing branches (each developer works on their own branch, then merges)
- Running automated checks (CI/CD)

**Workflows in `.github/workflows/`:**

1. **`deno.yml`** — Runs code linting and tests automatically whenever code is pushed to the `main` branch
   - Linting = checks if the code follows style rules (like spell-checking for code)
   - Tests = verifies that the code does what it's supposed to do

2. **`npm-publish.yml`** — Automatically publishes the app as an NPM package whenever a new release is created on GitHub

**Current branch:** `maqpping`
**Main branch:** `main`

---

## 13. App Configuration (`app.config.js`)

This file tells Expo how to build and package the app.

| Setting | Value | What It Means |
|---|---|---|
| App Name | `Pavement-Watch` | Name shown on phone home screen |
| Slug | `pavement-watch` | URL-safe identifier used by Expo |
| iOS Bundle ID | `com.unam.pavementwatch` | Unique identifier for Apple App Store |
| Android Package | `com.unam.pavementwatch` | Unique identifier for Google Play Store |
| Android Icon Color | `#2E7D32` (green) | Background color of the app icon |

**Permissions the app requests from the phone:**
- `ACCESS_FINE_LOCATION` — GPS for precise location
- `ACCESS_COARSE_LOCATION` — Network-based location (fallback)
- `CAMERA` — Taking photos for reports

---

## 14. Theme & Design System

All colors, spacing, and sizes are defined in one place: `constants/theme.js`

**Brand Colors:**

| Name | Color | Used For |
|---|---|---|
| Primary | `#2E7D32` (dark green) | Buttons, headers, active states |
| Error | `#DC2626` (red) | Error messages, rejected status |
| Success | `#16A34A` (bright green) | Success messages, completed status |
| Warning | `#F97316` (orange) | Pending status, warnings |
| Info | `#2563EB` (blue) | Approved status, info badges |

**Why centralise this?** If we want to change the app's color scheme, we change it in one file — not in hundreds of different screens.

---

## 15. Possible Presentation Questions & Answers

**Q: Why did you use Expo instead of plain React Native?**
A: Expo gives us ready-made tools for camera, GPS, and running the app on our phones during development without needing to install Android Studio or Xcode. It saved us a lot of setup time.

---

**Q: What happens if the internet connection is slow or drops?**
A: Reports and tasks are saved locally on the device using AsyncStorage first. This means the app keeps working offline. When the connection returns, data syncs with Firebase.

---

**Q: Why does the map use a WebView instead of React Native Maps?**
A: React Native Maps can be unreliable across different Android versions and requires complex setup. Using a WebView with Leaflet.js gives us full control over the map behavior and works consistently on all devices.

---

**Q: How does the app know if I are a User, Worker, or Admin?**
A: When you sign up, your role is saved in Firestore under your user document. Every time you log in, the app reads that role from Firebase and shows the correct screens and navigation for that role.

---

**Q: Is the app secure? Can anyone access the database?**
A: During development, the Firestore rules are open (expires 5 July 2026). Before deploying to production, we must write proper security rules so that users can only read/write their own data, workers can only see their assigned tasks, and admins have full access.

---

**Q: What is an API key and why does it need to be kept secret?**
A: An API key is like a password that identifies your app to an external service. If someone steals your Geoapify key, they could use your free map requests and you hit your usage limit (or get a bill). If someone steals your Firebase key without proper security rules, they could read or write to your database. Keys should never be committed to a public GitHub repository.

---

**Q: Why is the `.env` file not on GitHub?**
A: The `.gitignore` file tells Git to ignore `.env`. This prevents secret keys from being uploaded. The `.env.example` file is uploaded instead — it shows the structure without real values so new developers know what to fill in.

---

**Q: How does reverse geocoding work?**
A: The phone's GPS gives us raw numbers like latitude `-22.5609` and longitude `17.0658`. Those numbers alone don't tell a human much. We send them to Geoapify's Geocoding API which looks up those coordinates in its map database and returns a human-readable address.

---

**Q: What is Firestore and how is it different from a normal database?**
A: Firestore is a NoSQL document database. Instead of rows and columns like Excel or SQL, data is stored in "documents" (like JSON objects) grouped into "collections". It is flexible, scales automatically, and updates in real time.

---

**Q: What does the Admin role actually do in the workflow?**
A: The Admin is the gatekeeper. They review all incoming reports from citizens and decide if they are valid. If valid, they approve the report and a task is automatically created for a worker. If the report is a duplicate, spam, or unclear, they reject it. Without Admin approval, no worker ever gets assigned.

---

**Q: Can a user sign up as an Admin?**
A: No. The sign-up screen only allows choosing between User and Worker roles. Admin accounts must be created or assigned manually through the backend. This is intentional — you don't want anyone to give themselves admin privileges.

---

**Q: How are workers assigned to tasks?**
A: Currently the assignment is done through the admin's approval action — when a report is approved, a task appears in the worker pool. Full manual assignment (choosing a specific worker) is a feature that can be added in a future version.

---

## 16. Quick Reference — Key Files by Role

### If you are a Developer (NKOSI, NICODEMUS)
- Start here: `app/_layout.jsx` (root of navigation)
- User screens: `app/user/`
- Worker screens: `app/worker/`
- Admin screens: `app/admin/`
- Shared components: `components/shared/`

### If you are a Firebase Lead (NDAKOLUTE, NEEMA, HAUFIKU)
- Firebase setup: `services/firebase.js`
- Security rules: `firestore.rules`
- Database indexes: `firestore.indexes.json`
- Storage logic: built into report submission in `app/user/report.jsx`

### If you are a UI/UX Lead (NDILI, SHIKONGO, INGULA)
- Design tokens: `constants/theme.js`
- Reusable UI components: `components/shared/ui.jsx`
- Navigation bar: `components/shared/BottomNav.jsx`
- Status badges: `components/shared/StatusBadge.jsx`

### If you are a Document Lead (JUUSO, AMUSHILA, MATENGU)
- App overview: `README.md`
- This document: `GROUP9_PRESENTATION_GUIDE.md`
- Config reference: `app.config.js`
- Dependencies list: `package.json`

### If you are a GitHub Manager (ININGA, JOHANNES)
- CI/CD workflows: `.github/workflows/`
- Branch structure: `main` (production), `maqpping` (current development)
- Environment template: `.env.example`
- Git ignore rules: `.gitignore`

---

## 17. Glossary

| Term | Plain English Meaning |
|---|---|
| API | A way for one app to talk to another service and request data or actions |
| API Key | A password that proves to an API who you are |
| AsyncStorage | Storage built into the phone (like saving a file locally) |
| Authentication | Verifying who you are — logging in |
| Component | A reusable piece of the screen (button, card, map) |
| Expo | A toolkit that makes building React Native apps easier |
| Firebase | Google's service providing database, login, and file storage |
| Firestore | Firebase's database service |
| Geocoding | Turning a place name into coordinates |
| Reverse Geocoding | Turning coordinates into a readable address |
| GPS | The phone's location sensor that gives latitude/longitude |
| Leaflet.js | A popular web library for showing interactive maps |
| NoSQL | A type of database that stores flexible documents instead of tables |
| React Native | A framework for building phone apps with JavaScript |
| Role | A user type (User / Worker / Admin) that determines what you can see and do |
| Token | A temporary digital pass proving you are logged in |
| WebView | A mini web browser embedded inside a mobile app |
| `.env` | A file storing secret configuration values, not shared publicly |
| `.gitignore` | A file telling Git which files NOT to upload to GitHub |
| CI/CD | Automated testing and deployment that runs when code is pushed |

---

*Pavement Watch — Group 9 | UNAM I3691CP | 2026*
