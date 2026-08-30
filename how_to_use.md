# AI Commerce + Growth Agent

> **Razorpay Buildathon 2026 — Track 1: AI Growth & Agentic Commerce**  
> An AI Revenue Agent that turns conversational shopping into measurable merchant growth.

---

## 🌟 Architecture & Key Features

### 1. Customer AI Shopping Assistant (`/assistant`)
- **Conversational Product Discovery**: Structured intent extraction (budget limits, specifications, use cases).
- **Hybrid Graph + Vector RAG**: MongoDB structured filtering combined with Neo4j vector similarity search and Cypher graph traversal.
- **AI Upsell & Cross-Sell Engine**: Computes internal upsell score ($Upsell Score = Probability \times Compatibility \times Relevance \times Value$) to suggest accessories.
- **Explicit Payment Confirmation**: Requires user review before triggering server-verified Razorpay Checkout.

### 2. Merchant AI Growth Copilot (`/merchant`)
- **Real Metrics Dashboard**: Aggregates Total Revenue, AI-Assisted Revenue, AOV, AI-Assisted AOV, and Conversion Rates.
- **Revenue Opportunity Discovery**: Automatically scans purchase history gaps (e.g. laptop buyers without accessories).
- **Campaign Generator & Approval Workflow**: AI proposes targeted campaigns requiring explicit merchant approval before execution.
- **Interactive Knowledge Graph Visualizer**: Renders Neo4j graph nodes and relationships.
- **Audit Trail**: Logs all agent decisions, tool invocations, and reasoning.

---

## 🛠️ Technology Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, TanStack Query, Axios, Lucide Icons, Recharts.
- **Backend**: Node.js, TypeScript, Express.js, Zod validation.
- **Database**: MongoDB (Official Node.js Driver) — Primary transactional source of truth.
- **Knowledge Graph + Vector RAG**: Neo4j (Bolt Driver) + Neo4j Vector Indexes.
- **Cache & Temp Infrastructure**: Redis.
- **Payments**: Razorpay Test Mode (Orders API, Checkout, HMAC signature verification, Webhooks).
- **AI Engine**: Gemini API with provider abstraction & tool calling.

---

## 🚀 Quick Start & Local Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Run Development Server
```bash
npm run dev
```
- API Server: `http://localhost:5000`
- Web Application: `http://localhost:3000`

### 4. Run Tests
```bash
npm run test
```

### 5. Docker Orchestration
```bash
docker compose up --build
```
