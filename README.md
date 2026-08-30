# AI Commerce + Growth Agent

**Razorpay Buildathon 2026 — Track 1**

AI Commerce + Growth Agent is a platform that helps customers find the right products and helps merchants increase revenue using AI.

## What it does

### Customer
- Chat with an AI shopping assistant
- Search and compare products
- Get personalized recommendations
- Get upsell and cross-sell suggestions
- Add products to cart and pay using Razorpay

### Merchant
- View sales and customer insights
- Ask AI for ways to increase revenue
- Find products that are often bought together
- Find upsell and cross-sell opportunities
- Generate and approve marketing campaigns

## How AI works

We use **Hybrid RAG**, which combines information from MongoDB and Neo4j before giving it to the AI.

```text
User Query
    ↓
MongoDB + Neo4j
    ↓
Relevant Data
    ↓
RAG
    ↓
AI Agent
    ↓
Recommendation / Action
```

Neo4j is used as a knowledge graph to understand relationships:

```text
Customer → PURCHASED → Laptop
Laptop → FREQUENTLY_BOUGHT_WITH → USB-C Hub
Laptop → SUITABLE_FOR → Machine Learning
```

This helps the AI make recommendations based on real product and customer relationships.

## Tech Stack

- **React + TypeScript** — frontend
- **Node.js + Express** — backend
- **MongoDB** — main application database
- **Neo4j** — knowledge graph and vector search
- **Redis** — caching and temporary data
- **LLM** — AI reasoning and responses
- **RAG** — retrieves real business data for the AI
- **Razorpay** — payments
- **Docker** — local development and deployment

## Main Flow

```text
Customer
   ↓
AI Shopping Agent
   ↓
Product Recommendation
   ↓
Upsell / Cross-sell
   ↓
Cart
   ↓
Razorpay Payment
   ↓
MongoDB
   ↓
Customer Events
   ↓
Neo4j Knowledge Graph
   ↓
Better Recommendations
   ↓
AI Growth Agent
   ↓
Merchant Revenue Opportunities
```

## Key Idea

The project connects **AI, commerce, customer behavior, product relationships, payments, and merchant growth** in one system.

MongoDB stores the main application data, while Neo4j helps the AI understand relationships and retrieve relevant information. The AI uses this information to give grounded recommendations and help merchants find new revenue opportunities.
