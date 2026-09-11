# StudyLoop — Technical Architecture & Supabase Integration Guide

## 1. Programming Languages & Technology Stack

StudyLoop is written in **TypeScript** across both client, server, and native phone applications:

| Layer | Language / Framework | Details |
|---|---|---|
| **Web Frontend** | TypeScript, React 19, Tailwind CSS 4 | Desktop workstation and phone-responsive web marketplace with Radix UI and Wouter. |
| **Backend & API** | TypeScript, Node.js, Express, tRPC 11 | Type-safe end-to-end RPC router (`server/routers.ts`) guaranteeing zero contract drift. |
| **Database & ORM** | SQL (TiDB / MySQL compatible), Drizzle ORM | Normalized schema (`drizzle/schema.ts`) managing studies, universal profiles, screener questions, applications, and reminders. |
| **Phone App** | TypeScript, React Native, Expo SDK 54 | Dedicated mobile codebase (`/home/ubuntu/studyloop-mobile`) for iOS and Android with tabs, dynamic screener modals, and profile syncing. |

---

## 2. Supabase Integration: Yes, You Can Connect

StudyLoop is fully architected so you can either use the built-in credential authentication system or connect directly to **Supabase Auth & Database**.

### How to Connect Supabase

#### Option A: Use Supabase Auth for User Logins
1. Install the Supabase JS SDK:
   ```bash
   pnpm add @supabase/supabase-js
   ```

2. Create a client helper in `client/src/lib/supabase.ts`:
   ```ts
   import { createClient } from "@supabase/supabase-js";

   const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://your-project.supabase.co";
   const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "your-anon-key";

   export const supabase = createClient(supabaseUrl, supabaseAnonKey);
   ```

3. Update the login form (`client/src/pages/Login.tsx`):
   ```ts
   // Email + Password Sign In
   const { data, error } = await supabase.auth.signInWithPassword({
     email: emailOrUsername,
     password: password,
   });

   // Sign Up
   const { data, error } = await supabase.auth.signUp({
     email: email,
     password: password,
     options: {
       data: {
         full_name: name,
         role: role, // 'user' or 'researcher'
       }
     }
   });
   ```

4. Session Token Forwarding:
   Pass Supabase's `access_token` in the tRPC Authorization header (`client/src/main.tsx`) so the backend verifies the JWT using Supabase's JWT secret.

#### Option B: Use Supabase as the Primary PostgreSQL Database
1. Update `DATABASE_URL` in `.env` to point to your Supabase PostgreSQL connection pooler:
   ```
   DATABASE_URL="postgres://postgres.[YOUR-PROJECT]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
   ```
2. Switch Drizzle dialect from `mysql-core` to `pg-core` (or use Drizzle's Postgres adapter).
3. Run `pnpm drizzle-kit push` to synchronize all StudyLoop tables directly into your Supabase project.

---

## 3. Directory Layout in the Download Package

The exported archive contains organized directories according to clean development conventions:

```
studyloop-project/
├── studyloop-mvp/               <-- Full-stack Web Application (React 19 + Express + tRPC)
│   ├── client/
│   │   ├── src/
│   │   │   ├── components/      <-- Navbar, MobileBottomNav, StudyCard, CreateStudyModal
│   │   │   ├── pages/           <-- Home, BrowseStudies, StudyDetail, UniversalProfile, ParticipantDashboard, ResearcherPortal, ForInstitutions, Login
│   │   │   ├── contexts/        <-- ThemeContext
│   │   │   └── lib/             <-- tRPC client bindings
│   ├── drizzle/                 <-- Database schema and migration SQL files
│   ├── server/                  <-- Database helpers, tRPC routers, seed files
│   └── package.json
│
├── studyloop-mobile/            <-- Native Phone App (Expo SDK 54 + React Native)
│   ├── app/
│   │   └── (tabs)/              <-- index.tsx (Discover), applications.tsx (Tracker), profile.tsx
│   ├── package.json
│   └── tsconfig.json
│
└── README_STUDYLOOP.md          <-- Full product specification, problem statement, and Supabase guide
```
