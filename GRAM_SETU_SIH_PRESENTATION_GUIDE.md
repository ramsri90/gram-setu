# 🏛️ Gram Setu — Smart India Hackathon (SIH) Presentation & Technical Guide

---

## 📌 Executive Summary & Problem Statement

### **The Problem in Rural Governance:**
In India's Panchayati Raj system, rural infrastructure development faces two major bottlenecks:
1. **Grievance Visibility Gap**: Citizens lack a transparent, real-time tracking system for local infrastructure issues (drinking water contamination, damaged roads, broken streetlights, PHC equipment failures).
2. **Subjective Budget Allocation**: Gram Panchayat funds are often allocated subjectively or on a first-come, first-served basis, leading to inefficient fund utilization where high-impact or critical emergency projects get left unfunded.

### **The Solution: Gram Setu**
**Gram Setu** is a dual-portal digital governance platform that connects villagers directly with official decision-makers:
- **For Citizens**: A lightweight portal to report village infrastructure problems with photo evidence and track resolution progress in real time (*Reported ➔ Noted ➔ Work in Progress ➔ Completed*).
- **For Official Master Admins**: An algorithmic decision-support dashboard featuring a **Multi-Criteria Weighted Scoring Engine** and a **0/1 Knapsack Dynamic Programming (DP) Budget Optimizer** that scientifically selects the optimal combination of projects to maximize public impact within budget constraints.

---

## 🏗️ System Architecture & Data Flow

```mermaid
graph TD
    subgraph Client Layer
        A[Citizen Portal] -->|Upload Photo & Submit Grievance| B[Next.js App / React UI]
        C[Official Master Admin] -->|Review, Change Status & Run Optimizer| B
    end

    subgraph Business Logic & Algorithmic Engine
        B --> D[Multi-Criteria Scoring Engine]
        D -->|Calculates Normalized Priority Score| E[0/1 Knapsack DP Solver]
        E -->|Optimal Budget Allocation Plan| F[Strategy Simulator & GIS Analytics]
    end

    subgraph Backend & Database Layer (Supabase / PostgreSQL)
        B -->|Live 3s Polling & CRUD Operations| G[(PostgreSQL Database)]
        B -->|Image Evidence File Upload| H[(Supabase Storage Bucket: issue-images)]
        G -->|Row Level Security RLS| I[User Profiles & Auth]
    end
```

### **Data Flow:**
1. **Citizen Submission**: A villager fills out a complaint form with location, category, urgency rating, estimated cost, and uploads a site photo directly to the Supabase `issue-images` storage bucket.
2. **PostgreSQL Persistence**: The problem record is saved in the `problems` PostgreSQL table with initial status `'reported'`.
3. **Live Multi-Device Sync**: An automated 3-second auto-polling loop keeps all logged-in devices (Citizen & Official PCs) synchronized without manual page refreshes.
4. **Official Review & Action**: Official Master Admins log in to inspect uploaded photo evidence, mark status as **"Marked as Noted"**, **"Work in Progress"**, or **"Mark Resolved"**, or delete invalid issues.
5. **Algorithmic Budget Optimization**: The Master Admin specifies the available Panchayat budget. The system normalizes criteria across all complaints, calculates a composite **Priority Score (0-100)**, and runs a **0/1 Knapsack DP Algorithm** to find the exact set of projects that yields maximum public benefit.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose / Rationale |
| :--- | :--- | :--- |
| **Framework** | **Next.js 16 (App Router + Turbopack)** | High-performance React SSR/CSR hybrid rendering with fast development builds. |
| **Frontend Library** | **React 19 & TypeScript** | Type-safe component development preventing runtime NullPointer/Type errors. |
| **Styling System** | **Vanilla CSS & Tailwind Utilities** | Custom Teal & White Mix glassmorphism design system (`#0d9488`, `#06b6d4`, `#041418`). |
| **Database** | **Supabase PostgreSQL** | Relational SQL database with custom ENUMs, triggers, and Row Level Security (RLS). |
| **Authentication** | **Supabase Auth** | Dual role authentication (`citizen` vs `official`) with persistent `localStorage` session cache. |
| **Object Storage** | **Supabase Storage** | Public storage bucket (`issue-images`) for hosting citizen-uploaded site photos. |
| **Algorithmic Engine** | **Custom 0/1 Knapsack DP** | Dynamic programming grid scaled to ₹10,000 units for optimal combinatorial project selection. |
| **Icons & Maps** | **Lucide React Icons & Custom Canvas GIS** | Clean visual feedback, progress indicators, and interactive spatial problem mapping. |

---

## 🧮 Core Algorithms Explained (Deep Dive)

### **1. Multi-Criteria Priority Scoring Engine**
Each problem \(P\) receives a composite priority score between 0 and 100 based on 6 normalized criteria:

$$\text{Priority Score} = \frac{\sum (w_i \cdot N_i)}{\sum w_i} \times 100$$

Where:
- **\(N_{\text{people}}\)**: Normalized population affected across the dataset.
- **\(N_{\text{urgency}}\)**: Reported urgency rating (1 to 5).
- **\(N_{\text{safety}}\)**: Critical public safety risk rating (1 to 5).
- **\(N_{\text{health}}\)**: Epidemic and vector disease threat rating (1 to 5).
- **\(N_{\text{condition}}\)**: Asset deterioration rating (Condition 1 = failing gets highest need weight).
- **\(N_{\text{efficiency}}\)**: Cost-to-benefit ratio (\(\text{Impact Factor} / \text{Cost in Lakhs}\)).

### **2. 0/1 Knapsack Dynamic Programming (DP) Optimizer**
- **Objective**: Maximize total priority score \(\sum S_i \cdot x_i\) subject to total cost \(\sum C_i \cdot x_i \le B\), where \(x_i \in \{0, 1\}\).
- **Scaling Trick**: To handle large budget values (e.g. ₹45 Lakhs = 4,500,000), costs are scaled down by `DP_SCALE = 10000` (₹10,000 units), transforming the continuous problem into a 2D integer DP table of size \((N+1) \times (W+1)\).
- **Backtracking**: Traverses the DP matrix backward to extract the exact list of funded projects.

---

## 🔒 Security & Data Integrity

1. **Row Level Security (RLS)**:
   - `public.profiles`: Users can read public profiles and edit only their own records (`auth.uid() = id`).
   - `public.problems`: Public read access enabled; authenticated citizens can insert; officials can update status or delete.
2. **Database Trigger (`handle_new_user`)**:
   - Uses `ON CONFLICT (id) DO UPDATE` and exception blocks to guarantee that auth signup never crashes database record creation.
3. **Password Protection**:
   - Password fields use strict input masking (`type="password"` with `••••••••`). No raw credentials exposed on UI screens.
4. **Session Persistence**:
   - Logged-in sessions are stored in client `localStorage` and automatically restored on page refresh without forcing repeated logins.

---

## 🎤 3-Minute SIH First Round Pitch Script

> **[0:00 - 0:30] Introduction & Problem**
> *"Respected Judges, good morning/afternoon. Rural development in India's 2.5 Lakh Gram Panchayats often suffers from two challenges: delayed grievance resolution for villagers and subjective, non-optimal spending of government funds. We present **Gram Setu** — an AI-assisted smart governance platform that bridges villagers with Panchayati Raj officials using transparent grievance tracking and 0/1 Knapsack budget optimization."*

> **[0:30 - 1:30] Live Product Demonstration**
> *"Let us demonstrate the system. When a villager opens Gram Setu on their mobile or PC, they enter the **Citizen Portal**. They can raise an issue — such as a broken handpump — attach a photo, and submit it. The villager gets a live progress tracker (*Reported ➔ Noted ➔ Work in Progress ➔ Completed*).*
>
> *Now, switching to the **Official Master Admin Portal**: Official Shri Rajesh Verma logs in. He sees a clean dashboard with zero dummy data — only real citizen complaints. He can inspect the uploaded site photo, mark the issue as **"Marked as Noted"** or **"Work in Progress"**, or delete invalid issues."*

> **[1:30 - 2:30] Algorithmic Innovation**
> *"Where Gram Setu truly shines is in budget allocation. When a Panchayat has a fixed budget of ₹45 Lakhs and 20 competing infrastructure demands, how do officials decide which projects to fund?*
>
> *Our system normalizes population reach, health threats, safety hazards, and asset decay into a 100-point Priority Score. Then, our **0/1 Knapsack Dynamic Programming algorithm** solves the combinatorial budget allocation in milliseconds, selecting the exact set of projects that maximizes public welfare per rupee spent. We also provide a **Strategy Simulator** comparing Maximum Reach vs Emergency Safety vs High Cost Efficiency."*

> **[2:30 - 3:00] Tech Stack & Impact**
> *"Gram Setu is built using **Next.js 16, TypeScript, Supabase PostgreSQL, and Supabase Storage**. It features real-time 3-second multi-device synchronization, Row Level Security, and persistent session management. Gram Setu brings speed, transparency, and scientific rigor to rural governance. Thank you!"*

---

## ❓ SIH Judge Q&A Preparation

### **Q1: How do you handle invalid or fake citizen complaints?**
> **Answer**: *"Officials review every submission in the Official Master Admin Portal. They can inspect uploaded site photos, verify location details, and use the built-in 'Delete Issue' function to reject invalid or duplicate entries before running the budget optimizer."*

### **Q2: Why did you use 0/1 Knapsack DP instead of a simple Greedy algorithm?**
> **Answer**: *"A greedy algorithm (sorting by score/cost ratio) is suboptimal for discrete items because it can leave large budget remainders unspent. 0/1 Knapsack Dynamic Programming guarantees the globally optimal combination of projects that fits strictly within the budget ceiling."*

### **Q3: How is data synchronized between a citizen's phone and the official's PC?**
> **Answer**: *"All problem records and photo evidence are stored in Supabase PostgreSQL and Supabase Storage. The client application runs a 3-second auto-sync loop, ensuring that as soon as a citizen submits a complaint on device A, the official's PC on device B immediately receives the update."*

### **Q4: How does the system handle rural areas with poor internet connectivity?**
> **Answer**: *"Gram Setu includes client-side fallback storage (Data URLs & local caching). If internet connectivity drops, citizens can prepare submissions offline, which sync to Supabase PostgreSQL as soon as connection is restored."*

### **Q5: What makes your tech stack production-ready for SIH?**
> **Answer**: *"We use Next.js 16 with App Router, TypeScript for zero runtime type errors, Supabase for scalable PostgreSQL with Row Level Security (RLS) policies, and persistent session management."*
