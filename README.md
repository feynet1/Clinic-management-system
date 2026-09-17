# ClinicCare PWA – Digital Healthcare & Clinical Workflow Platform

An end-to-end Progressive Web Application (PWA) engineered for outpatient clinics and diagnostic centers (specifically adapted for Ethiopian healthcare environments). 

Eliminates manual paper charts, paper prescription pads, and chaotic queues by synchronizing clinical and administrative workflows across **Receptionists, Triage Nurses, Doctors, Lab Technicians, Cashiers, Clinic Administrators, and Waiting Room Monitors**.

---

## Key Features

1. **Patient Registration & MRN Management**:
   - Automated Medical Record Number (`MRN-YYYY-XXXXX`) issuance.
   - Demographic information, emergency contacts, blood group, chronic conditions, and high-visibility drug allergy warnings.
2. **Nurse Triage Desk**:
   - Vital signs recording: Blood Pressure (Systolic/Diastolic), Temperature, Pulse, Respiratory Rate, SpO2, Height, and Weight.
   - Automated **BMI calculation** and nutritional categorization.
   - Pain score slider (0–10) and triage priority classification (`Normal`, `Urgent`, `Emergency`).
3. **Doctor Clinical Consultation Desk (EHR)**:
   - Comprehensive patient summary and vitals review.
   - Structured **SOAP Notes** (Subjective, Objective, Assessment, Plan).
   - **ICD-10 Diagnostic Lookup** integrating standard clinical codes (e.g. Malaria, Typhoid, Hypertension, Diabetes, Pneumonia).
   - One-click Diagnostic Laboratory order placement.
   - Digital **E-Prescription writer** with dosage, frequency, route, duration, and printable official clinic letterhead with digital signatures.
4. **Diagnostic Laboratory Portal**:
   - Investigation queue tracking (`Ordered` $\rightarrow$ `Sample Collected` $\rightarrow$ `Analyzing` $\rightarrow$ `Completed`).
   - Standardized parameter entry with biological reference ranges and automatic abnormal value flagging.
   - Printable official Diagnostic Laboratory Test Reports.
5. **Cashier Desk & Itemized Billing**:
   - Unified automatic billing aggregating consultation fees, laboratory tests, procedures, and medications.
   - Support for Ethiopian Payment Methods: **Cash**, **Telebirr** (Ethio Telecom), **CBE Birr** (Commercial Bank of Ethiopia), and **Medical Insurance**.
   - Printable **80mm ESC/POS Thermal POS Receipts** and formal claim statements.
6. **Live Waiting Room TV Display**:
   - Dedicated high-visibility monitor view for reception area TVs.
   - Real-time "NOW CALLING" banner with patient ticket number, room number, and doctor name.
   - Web Audio API melodic two-tone chime announcement bell when a patient is called.
7. **Offline-First PWA Architecture**:
   - Installable on desktop PCs, tablets, and mobile phones.
   - IndexedDB (Dexie.js) local cache allows nurses and doctors to record vitals and consultation notes without internet disruption.
   - Automatic background synchronization when the connection is restored.
8. **Tri-Lingual Localization**:
   - Seamless one-click switching between **English**, **Amharic (አማርኛ)**, and **Afaan Oromo (Afaan Oromoo)**.

---

## Quick Start (Local Run)

The application includes an integrated offline-first demo engine with pre-seeded data, allowing you to test all workflows immediately without external configuration.

```bash
# 1. Install dependencies (already completed)
npm install

# 2. Start the local development server
npm run dev

# 3. Build for production (PWA)
npm run build
```

The application will start at `http://localhost:3000`.

---

## Staff Login Credentials

> All accounts use the same default password. Run `supabase/SETUP_AUTH_USERS.sql` in your Supabase SQL Editor to activate them.

| Role | Full Name | Email | Password |
|------|-----------|-------|----------|
| 🛡️ Admin / Medical Director | Dr. Selamawit Tadesse | `admin@cliniccare.com` | `Clinic@2026` |
| 🩺 Doctor | Dr. Henok Bekele | `doctor@cliniccare.com` | `Clinic@2026` |
| 💉 Nurse | Sr. Bethelhem Girma | `nurse@cliniccare.com` | `Clinic@2026` |
| 🖥️ Receptionist | Dawit Alemu | `reception@cliniccare.com` | `Clinic@2026` |
| 🔬 Lab Technician | Yared Kassahun | `lab@cliniccare.com` | `Clinic@2026` |
| 💳 Cashier | Hanan Mohammed | `cashier@cliniccare.com` | `Clinic@2026` |

> **Note:** To change a staff password later, run this in the Supabase SQL Editor:
> ```sql
> UPDATE auth.users
> SET encrypted_password = crypt('NewPassword123', gen_salt('bf'))
> WHERE email = 'doctor@cliniccare.com';
> ```

---

## Connecting to Supabase Cloud & Cloudflare R2

When you are ready to connect to your live Supabase project:

1. **Create a Supabase Project**:
   - Go to [supabase.com](https://supabase.com) and create a free project.
2. **Execute Database Migrations**:
   - Open your Supabase project's **SQL Editor**.
   - Copy and run the contents of [`supabase/schema.sql`](./supabase/schema.sql) to create all tables, foreign keys, and indexes.
   - Optionally run [`supabase/seed.sql`](./supabase/seed.sql) to populate initial staff profiles and test data.
3. **Configure Environment Variables**:
   - Update `.env` with your project keys:
     ```env
     VITE_SUPABASE_URL=https://your-project-ref.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-key-here
     VITE_STORAGE_BUCKET=clinic-documents
     ```
4. **Storage & Cloudflare R2**:
   - In Supabase Storage, create a bucket named `clinic-documents` with public read access.
   - Or configure Cloudflare R2 S3-compatible credentials in `src/lib/storage.ts`.

---

## Project Structure

```
clinic-management-system/
├── supabase/
│   ├── schema.sql                 # Complete PostgreSQL relational schema
│   └── seed.sql                   # Pre-seeded staff, ICD-10 codes, and lab tests
├── src/
│   ├── types/index.ts             # Domain interfaces (Patients, Vitals, SOAP, Billing, etc.)
│   ├── lib/
│   │   ├── supabase.ts            # Supabase client & realtime configuration
│   │   ├── offlineDb.ts           # IndexedDB (Dexie.js) offline database
│   │   └── storage.ts             # Cloud document & lab attachment storage adapter
│   ├── services/
│   │   ├── dataService.ts         # Unified CRUD & sync engine
│   │   └── soundService.ts        # Hospital queue chime synthesizer (Web Audio API)
│   ├── i18n/
│   │   └── translations.ts        # English, Amharic, and Afaan Oromo dictionaries
│   ├── context/
│   │   └── AppContext.tsx         # Global context for roles, language, and sync status
│   ├── components/
│   │   ├── layout/                # Navbar (role & language switchers) and Sidebar
│   │   ├── common/                # Searchable ICD-10 diagnostic lookup
│   │   └── print/                 # 80mm thermal receipt, prescription letterhead, lab report
│   └── pages/
│       ├── DashboardPage.tsx      # Overview & live queue
│       ├── PatientsPage.tsx       # MRN registration & lookup
│       ├── TriagePage.tsx         # Nurse vitals, auto-BMI, and pain score
│       ├── DoctorDeskPage.tsx     # EHR, SOAP notes, ICD-10, prescriptions, lab orders
│       ├── LabPortalPage.tsx      # Diagnostic testing workbench
│       ├── CashierPage.tsx        # Itemized billing (Cash, Telebirr, CBE Birr, Insurance)
│       ├── QueueMonitorPage.tsx   # Waiting room TV live monitor
│       └── AnalyticsPage.tsx      # Financial & disease incidence analytics
```
