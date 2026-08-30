# 5-Minute Hackathon Demo Script

## Part 1: Customer AI Shopping Flow (2.5 Mins)
1. Navigate to `/assistant`.
2. Type prompt: `"I need a laptop for machine learning under ₹80,000"`.
3. Highlight AI reasoning: Intent parsed -> Tool `search_products()` executed over MongoDB & Neo4j vector RAG -> Grounded laptop recommended with specifications.
4. Click **"Add to Cart"**.
5. AI Growth Agent calculates Upsell score: Recommends compatible USB-C Hub (₹1,549) with reasoning: *"34% of similar customers purchased this hub."*
6. Click **"Accept & Add Accessory"**.
7. Click **"Proceed to Checkout"**.
8. Show explicit payment breakdown (Total, Savings, Final Charge).
9. Click **"Confirm & Pay via Razorpay"** -> Triggers Razorpay Checkout modal -> Payment verified server-side -> Order status transitions to `CAPTURED`.

## Part 2: Merchant AI Growth Dashboard (2.5 Mins)
1. Switch to **Merchant Mode** -> Navigate to `/merchant/dashboard`.
2. Review real-time metrics: Total Revenue, AI-Assisted Revenue, AOV, AI AOV, and Upsell Conversion Rate.
3. Click Copilot prompt: *"How can I increase revenue?"*
4. AI Copilot discovers revenue opportunity: *"2,341 customers purchased laptops without accessories. Est. Opportunity: ₹12.8L"*.
5. Click **"Manage AI Campaigns"** -> Review proposed campaign.
6. Click **"Approve & Authorize Campaign Execution"** -> Campaign status transitions to `APPROVED` -> `RUNNING`.
7. Navigate to `/merchant/graph` -> Show live Neo4j Knowledge Graph topology connecting products, categories, use cases, and customers.
8. Navigate to `/merchant/audit` -> Show immutable audit trail of agent actions and tool calls.
