# StudyLoop MVP — Clinical Research Marketplace

StudyLoop is a consumer-first marketplace for compensated medical research opportunities, modeled after modern talent platforms like Handshake and Indeed. It directly addresses the $8M/day delay bottleneck in clinical drug development by turning passive clinical trial databases into an active, personalized recommendation engine.

---

## 1. Product Concept & Problem Solved

### The Problem
* **80% of clinical trials fail** to meet initial enrollment targets on time.
* Delays cause pharmaceutical and biotech companies **up to $8 million per day** in lost revenue and extended development costs.
* Existing sites (e.g., ClinicalTrials.gov) act as passive, technical registries that require motivated patients to decipher medical jargon.
* Research teams routinely struggle with representation (e.g., balanced male participation, rural populations, and non-academic participants), while eligible healthy volunteers remain unaware that paid opportunities exist.

### The Solution: Medical Research as an Opportunity Marketplace
* **Universal Profile:** Participants fill out baseline demographic and health data once.
* **Compatibility Engine:** An algorithm calculates tailored compatibility scores (e.g., 95% Match) and explains why a study fits.
* **Transparent Criteria & Compensation:** Every study card displays total pay ($250–$1,850+), schedule, time commitment, and location upfront.
* **Dynamic Pre-Screeners:** When clicking apply, participants answer 3–5 protocol-specific exclusion questions.
* **Qualified Site Handoff:** Only participants who pass the screener reach the study coordinator’s dashboard.
* **Researcher Portal:** Study teams track qualified applicants, view demographic/geographic cohort balance, and manage candidate status.
* **Dual Experience (Phone & Computer):**
  * **Phone view:** Mobile-optimized participant discovery feed, fixed bottom navigation bar (`Home`, `Explore`, `My Profile`, `Research`), quick persona switchers, and full-screen pre-screening modal.
  * **Computer view:** High-density desktop workspace with navigation sidebar, live recruitment progress meters, diversity representation breakdowns, and candidate status controls.

---

## 2. Technical Stack

* **Frontend:** React 19, TypeScript, Tailwind CSS 4, Radix UI, Wouter, Sonner.
* **Backend:** Node.js, Express, tRPC 11 (type-safe end-to-end API contracts).
* **Database & ORM:** TiDB / MySQL with Drizzle ORM (`studies`, `participant_profiles`, `screener_questions`, `study_applications`, `organization_inquiries`, `users`).
* **Testing:** Vitest automated test suite passing with zero TypeScript diagnostics.

---

## 3. Seeded Protocols & Personas

The MVP includes illustrative clinical research studies reflecting real-world recruitment challenges:
1. **Healthy Aging & Multi-Sensory Neural Resilience Study** ($650, 3 visits, in-person in Durham, NC; prioritizing rural communities and male representation).
2. **Healthy Volunteer Longitudinal Blood & Immune Response Profiling** ($250, 2 visits; healthy volunteer control).
3. **National Digital Sleep & Circadian Rhythm Observational Study** ($320 + smart ring, 100% remote nationwide).
4. **Phase II Evaluation of Once-Weekly Oral GLP-1 Receptor Agonist** ($1,850, 24 weeks; Type 2 Diabetes cohort).
5. **Neuroimaging of Risk Evaluation and Financial Decision Making** ($350 fMRI study, single afternoon session).

### Quick-Fill Test Personas (on `/profile`)
* **Rural Male (Diversity Target):** Marcus Davis, age 58, Sanford, NC, healthy volunteer.
* **Urban Student (Healthy-Control Target):** Chloe Martinez, age 23, Durham, NC, healthy volunteer.
* **Chronic Condition Patient:** Robert Chen, age 52, Cary, NC, Type 2 Diabetes on metformin.

---

## 4. Key Routes & Features

* `/`: Consumer landing page explaining the marketplace model, dual-device highlights, and participant/researcher entry points.
* `/browse`: Filterable study marketplace with keyword search, category filters, healthy volunteer toggle, and personalized match badges.
* `/profile`: Universal Profile onboarding form with demo persona quick-load buttons and privacy safeguards.
* `/study/:slug`: Transparent study details page with compensation schedules, protocol requirements, and the interactive pre-screener modal.
* `/researchers`: Workstation-first operations dashboard for recruitment teams showing qualified pipeline candidates and diversity metrics.
* `/for-institutions`: B2B monetization plans (Site Starter SaaS, Institution Pro, Enterprise Pharma) and sponsored study promotions.
