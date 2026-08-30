# System Architecture & Technical Specifications

> **Razorpay Buildathon 2026 — Track 1: AI Growth & Agentic Commerce**

## 1. Overview
The platform integrates consumer-facing AI Shopping Agents with merchant revenue optimization tools:

- **Primary Application DB**: MongoDB (Official Node.js driver) — Authoritative store for products, carts, orders, transactions, customer profiles, and campaigns.
- **Knowledge Graph + Vector RAG**: Neo4j (Bolt driver & Vector Index) — Relationship-aware graph topology (`COMPATIBLE_WITH`, `FREQUENTLY_BOUGHT_WITH`, `SUITABLE_FOR`) combined with semantic vector retrieval.
- **Cache & Temp State**: Redis — Session caching, rate limiting, and idempotency key enforcement.
- **Payments Engine**: Razorpay Test Mode — Orders API, Checkout modal, server-side HMAC signature verification, and webhook verification.

## 2. Payment State Machine
```
[CREATED] ──► [PENDING_PAYMENT] ──► [AUTHORIZED] ──► [CAPTURED] (Order Completed)
                                  └──► [FAILED] / [CANCELLED]
```

## 3. Hybrid Graph + Vector RAG Pipeline
1. Parse user intent & extract constraints (budget, category, use case).
2. MongoDB structured filter enforces hard constraints (`price <= maxPrice` & `inventory > 0`).
3. Neo4j vector retrieval fetches semantic candidates.
4. Neo4j graph traversal extracts accessory compatibility & co-purchase patterns.
5. Deduplication & reranking feeds grounded evidence into Gemini LLM tool callers.
