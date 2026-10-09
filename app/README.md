# VendorZone — Frontend

Smart Digital Management Infrastructure for Street Vendors and Municipal Authorities.

Built with **Next.js (App Router)**, **React**, **JavaScript / JSX**, and **Tailwind CSS**.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create or verify `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```
*(Default is `http://localhost:3000` or wherever your separate Express backend runs)*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏗️ Architecture & Backend Connection

All API calls are centralized and organized in [`lib/api.js`](file:///c:/Users/varsh/OneDrive/Desktop/pro/lib/api.js).

```
Next.js Frontend Components & Pages
               ↓
          lib/api.js (Clean fetch calls)
               ↓
    REST API (Authorization: Bearer <token>)
               ↓
    Separate Express / Node Backend
```

### Authentication Architecture:
- Handled in [`lib/auth.js`](file:///c:/Users/varsh/OneDrive/Desktop/pro/lib/auth.js)
- Tokens stored in `localStorage` under `token`
- User metadata stored under `user`
- Sent as `Authorization: Bearer <token>` on all protected endpoints.

---

## 📁 Project Structure

```text
VendorZone-Frontend/
│
├── app/
│   ├── layout.jsx                # Root layout with subtle CSS grid background
│   ├── page.jsx                  # Public landing page with hero & features
│   ├── globals.css               # Tailwind directives & clean scrollbar
│   │
│   ├── login/
│   │   └── page.jsx              # Role-aware login with demo quick-fill
│   ├── register/
│   │   └── page.jsx              # Registration (Vendor / Officer role selector)
│   │
│   ├── vendor/                   # Street Vendor Portal
│   │   ├── layout.jsx            # Vendor sidebar & navigation
│   │   ├── page.jsx              # Vendor dashboard overview & metric cards
│   │   ├── profile/page.jsx      # Business profile, ID & verification
│   │   ├── zones/page.jsx        # Authorized zones & slot reservation modal
│   │   ├── reservations/page.jsx # Slot bookings & digital permit viewer
│   │   ├── permits/page.jsx      # Digital QR certificates & print view
│   │   └── complaints/page.jsx   # Grievance filing & resolution tracking
│   │
│   ├── officer/                  # Municipal Enforcement Portal
│   │   ├── layout.jsx            # Officer sidebar & navigation
│   │   ├── page.jsx              # Officer dashboard with queue metrics
│   │   ├── vendors/page.jsx      # Vendor verification review (Verify / Reject)
│   │   ├── zones/page.jsx        # Zone capacity creation & maintenance controls
│   │   ├── reservations/page.jsx # Slot approvals & permit issuance
│   │   └── complaints/page.jsx   # Grievance redressal & official resolution
│   │
│   ├── admin/                    # Platform Administrator Portal
│   │   ├── layout.jsx            # Admin sidebar & navigation
│   │   ├── page.jsx              # High-level metrics & activity ledger
│   │   ├── users/page.jsx        # User directory & role filtering
│   │   ├── zones/page.jsx        # City-wide zone management
│   │   ├── reservations/page.jsx # Platform reservation audit
│   │   └── complaints/page.jsx   # Platform dispute resolution audit
│   │
│   └── verify/
│       └── [permitId]/
│           └── page.jsx          # Public QR spot-check verification (Zero-login)
│
├── components/
│   ├── Navbar.jsx                # Responsive topbar with auth & roles
│   ├── Sidebar.jsx               # Role-based workspace navigation
│   ├── Button.jsx                # Standardized button variants with loading states
│   ├── Input.jsx                 # Styled form input with validation errors
│   ├── Modal.jsx                 # Accessible dialog component
│   ├── StatusBadge.jsx           # Colored status badges (Valid, Pending, Expired, etc.)
│   └── GridBackground.jsx        # Pure CSS grid background wrapper
│
├── lib/
│   ├── api.js                    # Direct REST API endpoints client
│   └── auth.js                   # Token & session utilities
│
├── .env.local                    # Backend URL configuration
├── tailwind.config.js
└── package.json
```

---

## 📡 API Endpoint Mapping (`lib/api.js`)

| Frontend Function | HTTP Method & Path | Description |
|---|---|---|
| `loginUser(data)` | `POST /api/auth/login` | Vendor / Officer / Admin login |
| `registerUser(data)` | `POST /api/auth/register` | New account registration |
| `getCurrentUser()` | `GET /api/auth/me` | Current authenticated user |
| `getVendorProfile()` | `GET /api/vendor/profile` | Current vendor's profile |
| `createVendorProfile(data)` | `POST /api/vendor/profile` | Initial vendor profile registration |
| `updateVendorProfile(data)` | `PUT /api/vendor/profile` | Update vendor profile |
| `getZones()` | `GET /api/zones` | Fetch available vending zones |
| `createZone(data)` | `POST /api/zones` | Officer/Admin create new zone |
| `updateZone(id, data)` | `PUT /api/zones/:id` | Update zone details & status |
| `deleteZone(id)` | `DELETE /api/zones/:id` | Remove a vending zone |
| `createReservation(data)` | `POST /api/reservations` | Book slot in a vending zone |
| `getMyReservations()` | `GET /api/reservations/my` | Vendor's booked slots |
| `cancelReservation(id)` | `PUT /api/reservations/:id/cancel` | Cancel booking |
| `getReservations()` | `GET /api/reservations` | Officer/Admin view all reservations |
| `approveReservation(id)` | `PUT /api/reservations/:id/approve` | Approve reservation & issue permit |
| `rejectReservation(id)` | `PUT /api/reservations/:id/reject` | Reject reservation request |
| `getPermit(permitId)` | `GET /api/permits/:permitId` | Fetch permit details |
| `verifyPermit(permitId)` | `GET /api/reservations/verify/:permitId` | **Public** QR code verification |
| `createComplaint(data)` | `POST /api/complaints` | File grievance / complaint |
| `getMyComplaints()` | `GET /api/complaints/my` | Vendor's filed complaints |
| `getOfficerComplaints()` | `GET /api/complaints` | Officer complaints queue |
| `updateComplaint(id, data)`| `PUT /api/complaints/:id` | Update grievance resolution |
| `getVendors()` | `GET /api/officer/vendors` | Officer pending vendor queue |
| `verifyVendor(id)` | `PUT /api/officer/vendors/:id/verify` | Approve vendor credentials |
| `rejectVendor(id)` | `PUT /api/officer/vendors/:id/reject` | Reject vendor verification |
| `getUsers()` | `GET /api/admin/users` | Admin user accounts list |
| `getAdminZones()` | `GET /api/admin/zones` | Admin zone management |
| `getAdminReservations()` | `GET /api/admin/reservations` | Admin reservations list |
| `getAdminComplaints()` | `GET /api/admin/complaints` | Admin complaints ledger |
| `getAdminStats()` | `GET /api/admin/stats` | Admin platform metrics |
