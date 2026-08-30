# AI Commerce + Growth Agent — Antigravity Master Prompt

> Razorpay Buildathon 2026 — Track 1: AI Growth & Agentic Commerce.
> This file is the authoritative implementation specification.
> MongoDB is the primary application database, Neo4j is the derived
> commerce knowledge graph and Graph + Vector RAG layer, and Redis is
> the cache/temporary-state layer.

You are the lead software architect, senior full-stack engineer,
AI/agentic systems engineer, and DevOps engineer for this project.

We are building a production-style hackathon project for Razorpay
Buildathon 2026 — Track 1: AI Growth & Agentic Commerce.

PROJECT NAME:
AI Commerce + Growth Agent

============================================================
1. PROJECT OBJECTIVE
============================================================

Build an AI-native commerce platform that has two major sides:

A. CUSTOMER SIDE
An AI Commerce Agent helps customers:
- Understand their shopping intent
- Search merchant products
- Ask clarifying questions
- Compare products
- Recommend products
- Personalize recommendations
- Suggest relevant upsells/cross-sells
- Build a cart
- Create a Razorpay payment order
- Take the customer through Razorpay Checkout
- Verify payment
- Confirm the order

B. MERCHANT SIDE
An AI Growth Agent helps merchants:
- Understand sales data
- Analyze customer behavior
- Identify revenue opportunities
- Recommend upsells/cross-sells
- Identify customer segments
- Generate campaigns
- Estimate campaign impact
- Require merchant approval before executing sensitive actions
- Track campaign results
- Show AI-assisted revenue
- Show AOV/conversion/upsell improvements

CORE BUSINESS LOOP:

Customer intent
    ↓
Product discovery
    ↓
Recommendation
    ↓
Personalized upsell/cross-sell
    ↓
Cart
    ↓
Razorpay payment
    ↓
Transaction
    ↓
Customer/transaction data
    ↓
AI Growth Agent
    ↓
Revenue opportunity
    ↓
Merchant-approved action
    ↓
Campaign / recommendation
    ↓
More revenue
    ↓
Learning loop


============================================================
2. IMPORTANT PRODUCT POSITIONING
============================================================

Do NOT build this as a generic chatbot.

Do NOT build:
- A simple ChatGPT clone
- A product recommendation chatbot
- A dashboard with fake AI insights
- A simple Razorpay checkout wrapper

The product must demonstrate:

AI + COMMERCE + AGENTIC ACTIONS + PAYMENTS + MERCHANT GROWTH

The core differentiation is:

"An AI Revenue Agent that turns conversational shopping
into measurable merchant growth."

The agent must be able to take meaningful actions through
well-defined tools rather than only returning text.


============================================================
3. TECHNOLOGY STACK
============================================================

Use the following stack unless there is a compelling technical
reason to change something.

FRONTEND:
- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router
- TanStack Query
- Axios
- Lucide React
- Recharts

BACKEND:
- Node.js
- TypeScript
- Express.js

DATABASE:
- MongoDB

DATABASE ACCESS:
- Official MongoDB Node.js Driver
- Prefer the official driver over Mongoose unless schema abstraction
  materially improves maintainability

VALIDATION:
- Zod

AUTHENTICATION:
- JWT
- bcrypt/argon2 for password hashing
- Role-based access control

ROLES:
- CUSTOMER
- MERCHANT
- ADMIN

AI:
- LLM with tool/function calling
- Prefer Gemini API if practical
- Design the AI layer behind a provider abstraction so
  another LLM can be substituted later
- LangGraph.js may be used if it materially improves
  agent orchestration
- Do not over-engineer the agent architecture

VECTOR SEARCH:
- Neo4j Vector Indexes
- Neo4j provides graph + vector retrieval
- MongoDB remains the primary application source of truth

PAYMENTS:
- Razorpay Test Mode
- Razorpay Orders API
- Razorpay Checkout
- Razorpay payment verification
- Razorpay webhooks

CACHING:
- Redis

TESTING:
- Vitest/Jest for backend/unit tests
- Playwright for end-to-end browser tests
- Supertest for API tests where useful

API DOCUMENTATION:
- OpenAPI / Swagger

DEVOPS:
- Docker
- Docker Compose
- GitHub Actions

DEPLOYMENT TARGET:
- Frontend: Vercel or equivalent
- Backend: AWS EC2 / AWS-compatible deployment
- Database: MongoDB Atlas / managed MongoDB
- Graph database: Neo4j Aura / managed Neo4j or Docker for development
- Redis: managed Redis or Docker for development

OBSERVABILITY:
- Structured logging
- Request IDs
- Error tracking hooks
- Basic metrics

Do not introduce microservices initially.
Build a modular monolith first.


============================================================
4. HIGH-LEVEL ARCHITECTURE
============================================================

Architecture:

                    CUSTOMER
                       |
                       v
              React Web Application
                       |
                       v
                REST API / HTTPS
                       |
                       v
              Node.js + Express
                       |
            +----------+----------+
            |          |          |
            v          v          v
        Commerce    AI Layer   Merchant
         Services               Services
            |          |          |
            +----------+----------+
                       |
                       v
                   MongoDB
                       |
              +--------+--------+
              |                 |
              v                 v
            Redis             Neo4j
                         Graph + Vector
                                 
                       |
                       v
                 Razorpay APIs
                       |
                       v
                  Webhooks


Use clean separation between:

- API layer
- Controllers
- Services
- Repositories/data access
- AI agents
- Agent tools
- Payment integration
- Event handling
- Database
- Authentication
- Observability


============================================================
5. PROJECT STRUCTURE
============================================================

Create a monorepo:

ai-commerce-growth-agent/

    apps/
        web/
        api/

    packages/
        shared/
        config/

    database/
        mongo/
            indexes.ts
            seed.ts
        neo4j/
            schema.ts
            seed.ts

    docs/
        architecture.md
        api.md
        database.md
        agent-design.md
        security.md
        demo-script.md

    tests/

    docker/
    
    .github/
        workflows/

    docker-compose.yml

    .env.example

    README.md

Use TypeScript throughout the frontend and backend.


============================================================
6. FRONTEND
============================================================

Build a polished production-style UI.

CUSTOMER PAGES:

/shop
/assistant
/products
/products/:id
/cart
/checkout
/order/:id
/orders

MERCHANT PAGES:

/merchant
/merchant/dashboard
/merchant/products
/merchant/customers
/merchant/orders
/merchant/campaigns
/merchant/insights
/merchant/audit

AUTH:

/login
/register

ADMIN:

/admin


============================================================
7. CUSTOMER EXPERIENCE
============================================================

Build an AI shopping assistant.

Example conversation:

USER:
"I need a laptop for machine learning under ₹80,000."

Agent should:

1. Understand intent
2. Extract:
   - category
   - budget
   - use case
   - constraints
3. Search products
4. Rank relevant products
5. Explain recommendation
6. Ask clarification if required
7. Show product cards
8. Allow product comparison
9. Add selected product to cart
10. Analyze relevant upsell opportunities
11. Recommend compatible accessories
12. Allow user to accept/reject upsell
13. Show final cart
14. Create Razorpay order
15. Require explicit user confirmation
16. Open Razorpay Checkout
17. Verify payment
18. Confirm order
19. Display order status


============================================================
8. AI AGENT ARCHITECTURE
============================================================

Use one primary orchestrator agent with specialized capabilities.

DO NOT create unnecessary autonomous agents.

Primary:

Commerce Orchestrator Agent

Specialized capabilities:

1. Product Search Tool
2. Product Recommendation Tool
3. Product Comparison Tool
4. Customer Profile Tool
5. Cart Tool
6. Growth/Upsell Tool
7. Order Tool
8. Payment Tool
9. Merchant Analytics Tool
10. Campaign Tool

The orchestrator should decide which tool to call.

Example:

User:
"Find me a gaming laptop under ₹70k."

Agent:

search_products({
    category: "laptop",
    maxPrice: 70000,
    tags: ["gaming"]
})

Then reason over returned structured data.

Do NOT allow the LLM to directly execute SQL.

All database access must happen through backend services/tools.


============================================================
9. AI TOOL DEFINITIONS
============================================================

Implement tools similar to:

searchProducts()
getProduct()
compareProducts()
checkInventory()

getCustomerProfile()
getCustomerHistory()

getCart()
addToCart()
removeFromCart()

calculateUpsellOpportunities()

createOrder()

createRazorpayOrder()
getPaymentStatus()

getMerchantAnalytics()

identifyRevenueOpportunities()

generateCampaign()

estimateCampaignImpact()

All tools must:

- Have strict schemas
- Validate inputs using Zod
- Return structured outputs
- Log important actions
- Have permission boundaries
- Never expose secrets


============================================================
10. AI PRODUCT RECOMMENDATION
============================================================

Implement a recommendation pipeline.

Initially use a hybrid approach:

1. Structured filtering
2. Business rules
3. Product metadata
4. Customer history
5. Similar products
6. Optional vector similarity
7. LLM reasoning over the candidates

Do NOT let the LLM hallucinate products.

Every recommended product must come from the actual database.

Recommendation output should include:

- Product
- Relevance score
- Reason
- Price
- Compatibility
- Inventory status


============================================================
11. AI UPSELL / CROSS-SELL ENGINE
============================================================

This is one of the most important features.

When a customer adds a product:

Example:

Laptop:
₹74,999

System evaluates:

- Product compatibility
- Customer history
- Similar customer purchases
- Remaining budget
- Product margin if available
- Purchase probability
- Inventory
- Relevance

Possible products:

USB-C Hub
₹1,299

Mouse
₹1,499

Laptop Bag
₹1,299

The Growth Agent should calculate an internal score.

Conceptually:

Upsell Score =
Purchase Probability
× Compatibility
× Customer Relevance
× Business Value

The agent should recommend only relevant products.

Example:

"This USB-C hub is compatible with the laptop you selected,
and 34% of similar customers purchased it."

Track:

- Upsell impressions
- Upsell acceptance
- Upsell revenue
- Cross-sell conversion
- Average order value


============================================================
12. MERCHANT AI GROWTH AGENT
============================================================

Create a merchant AI dashboard.

Merchant should be able to ask:

"How can I increase revenue?"

The agent should analyze actual database data.

Example insight:

"2,341 customers purchased laptops but did not purchase
accessories."

Then:

"Estimated revenue opportunity: ₹12.8L."

Recommend:

"Create a USB-C hub campaign."

Merchant clicks:

"Generate Campaign"

AI generates:

Target:
Laptop purchasers

Product:
USB-C Hub

Offer:
10% discount

Expected conversion:
8.4%

Estimated revenue:
₹2.1L

Merchant must approve before campaign execution.


============================================================
13. MERCHANT DASHBOARD METRICS
============================================================

Display:

- Total revenue
- AI-assisted revenue
- Average order value
- AI-assisted AOV
- Conversion rate
- AI-assisted conversion rate
- Upsell conversion rate
- Cross-sell revenue
- Top products
- Top recommendations
- Campaign performance
- Customer segments
- Revenue opportunities

Use Recharts for visualizations.

Do not use fake numbers in production logic.

For demo data, clearly mark seeded/synthetic data.


============================================================
14. CAMPAIGN SYSTEM
============================================================

Implement campaign lifecycle:

DRAFT
    ↓
PENDING_APPROVAL
    ↓
APPROVED
    ↓
RUNNING
    ↓
COMPLETED

Merchant approval is required before execution.

Campaign model should include:

- target segment
- product
- message
- offer
- budget
- expected conversion
- expected revenue
- actual revenue
- status
- timestamps


============================================================
15. RAZORPAY INTEGRATION
============================================================

Use Razorpay TEST MODE only during development.

Implement:

1. Backend Razorpay client
2. Create Razorpay Order
3. Return order_id to frontend
4. Open Razorpay Checkout
5. Receive payment result
6. Verify payment signature server-side
7. Handle Razorpay webhooks
8. Update local order state
9. Store payment information
10. Maintain idempotency

NEVER put Razorpay secret keys in frontend.

Use:

RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET

in environment variables.

Payment flow:

Cart
 ↓
Backend validates cart
 ↓
Backend creates local order
 ↓
Backend creates Razorpay order
 ↓
Frontend opens Razorpay Checkout
 ↓
Customer pays
 ↓
Backend verifies payment
 ↓
Webhook confirms state
 ↓
Local order updated
 ↓
Order confirmed


============================================================
16. PAYMENT STATE MACHINE
============================================================

Implement explicit states:

CREATED
PENDING_PAYMENT
AUTHORIZED
CAPTURED
FAILED
CANCELLED
REFUNDED

Do not use a simple boolean:

paymentSuccessful = true/false

Payment state transitions must be controlled.

Never mark an order as paid based only on frontend input.


============================================================
17. IDEMPOTENCY
============================================================

Implement idempotency for sensitive operations.

Especially:

- Order creation
- Razorpay order creation
- Campaign execution
- Payment-related operations

Example:

Idempotency-Key: abc123

If the same request arrives twice:

The backend must not create duplicate orders/actions.


============================================================
18. SECURITY / GUARDRAILS
============================================================

This is a fintech-related project.

Implement:

- JWT authentication
- Role-based access control
- Input validation
- Rate limiting
- CORS
- Secure HTTP headers
- Environment variables
- Password hashing
- Request size limits
- API authorization
- Audit logs
- Payment verification
- Webhook signature verification

AI-specific guardrails:

The AI cannot:

- Directly execute arbitrary SQL
- Directly access secrets
- Modify payment state
- Bypass user confirmation
- Spend unlimited money
- Execute merchant campaigns without approval
- Invent products
- Invent payment success
- Change transaction amounts arbitrarily

Sensitive actions must be gated.


============================================================
19. PAYMENT CONFIRMATION POLICY
============================================================

The AI may:

- Recommend products
- Build a cart
- Calculate totals
- Create a pending order
- Prepare Razorpay checkout

The AI may NOT silently charge the user.

Before payment:

Show:

Order total
Items
Discount
Final amount

Then:

"Confirm payment"

Only after explicit confirmation should payment proceed.


============================================================
20. AUDIT TRAIL
============================================================

Implement agent_actions table.

Every important AI decision should record:

- agent
- action
- tool
- input
- output
- reason
- user_id
- merchant_id
- timestamp
- status
- confirmation_required
- confirmation_received

Example:

Agent:
Growth Agent

Action:
Recommend USB-C Hub

Reason:
34% of similar customers purchased this accessory.

Expected revenue:
₹1,299

User confirmation:
Approved

Status:
Executed


============================================================
21. DATABASE SCHEMA
============================================================

Design MongoDB document/collection models and Neo4j graph models.

Core entities:

User
CustomerProfile
Merchant
Product
ProductCategory
Inventory
Cart
CartItem
Order
OrderItem
Payment
CustomerEvent
Recommendation
RecommendationEvent
Campaign
CampaignAudience
CampaignEvent
AgentAction
AuditLog

Relationships must be properly modeled.

Include:

- Primary keys
- Foreign keys
- Unique constraints
- Indexes
- Created/updated timestamps
- Appropriate enum types


============================================================
22. PRODUCT CATALOG
============================================================

Create a realistic seeded catalog.

Use at least:

100 products

Across categories such as:

- Laptops
- Phones
- Accessories
- Monitors
- Keyboards
- Mice
- Headphones
- Bags
- Chargers
- USB-C hubs

Each product should include:

- Name
- Description
- Category
- Brand
- Price
- Inventory
- Rating
- Tags
- Specifications
- Compatibility metadata
- Frequently-bought-with metadata

Seed enough customer/order/event data to make the
growth dashboard meaningful.

Use clearly labeled synthetic/demo data.


============================================================
23. CUSTOMER EVENT SYSTEM
============================================================

Track events:

PRODUCT_VIEWED
SEARCHED
ADDED_TO_CART
REMOVED_FROM_CART
CHECKOUT_STARTED
PAYMENT_STARTED
PAYMENT_SUCCESS
PAYMENT_FAILED
ORDER_COMPLETED
RECOMMENDATION_SHOWN
RECOMMENDATION_ACCEPTED
RECOMMENDATION_REJECTED
UPSELL_SHOWN
UPSELL_ACCEPTED
UPSELL_REJECTED

Use these events for analytics and recommendations.


============================================================
24. REDIS
============================================================

Use Redis for appropriate workloads.

Examples:

- Product search caching
- Frequently accessed product data
- Rate limiting
- Temporary session data
- Idempotency keys
- Short-lived agent state where appropriate

Do not use Redis as the primary source of truth.


============================================================
25. VECTOR SEARCH
============================================================

Use Neo4j vector indexes only where useful.

Generate embeddings for:

- Product descriptions
- Product specifications
- Product tags

Use vector search for semantic product discovery.

Example:

User:
"I need something for machine learning and coding."

The system should retrieve semantically relevant laptops.

Combine vector retrieval with structured filters.

Never rely exclusively on vector search for price/inventory constraints.



============================================================
46. MONGODB + NEO4J + HYBRID RAG ARCHITECTURE
============================================================

This section is authoritative and overrides any remaining older
references to PostgreSQL, Prisma, or pgvector.

DATABASE RESPONSIBILITIES:

MongoDB:
- Primary application and transactional source of truth
- Users
- Customers
- Merchants
- Products
- Categories
- Carts
- Orders
- Payments
- Customer events
- Recommendations
- Campaigns
- Agent actions
- Audit logs

Neo4j:
- Derived commerce knowledge graph
- Relationship-aware retrieval
- Graph analytics
- Product/customer relationship modeling
- Vector indexes for semantic commerce retrieval

Redis:
- Caching
- Rate limiting
- Idempotency keys
- Temporary agent state
- Optional asynchronous event streams

Razorpay:
- Payment processing and gateway state

Do not create conflicting sources of truth.


============================================================
NEO4J KNOWLEDGE GRAPH
============================================================

Use Neo4j as the commerce knowledge graph and graph retrieval
database.

Neo4j is NOT the primary transactional source of truth.

Nodes:

Customer
Merchant
Product
Category
Brand
Order
Campaign
UseCase

Relationships:

(Customer)-[:PURCHASED]->(Product)
(Customer)-[:VIEWED]->(Product)
(Customer)-[:ADDED_TO_CART]->(Product)
(Customer)-[:INTERESTED_IN]->(Category)
(Customer)-[:PREFERS]->(Brand)

(Merchant)-[:SELLS]->(Product)
(Merchant)-[:RUNS]->(Campaign)

(Product)-[:BELONGS_TO]->(Category)
(Product)-[:MADE_BY]->(Brand)
(Product)-[:COMPATIBLE_WITH]->(Product)
(Product)-[:SIMILAR_TO]->(Product)
(Product)-[:FREQUENTLY_BOUGHT_WITH]->(Product)
(Product)-[:SUITABLE_FOR]->(UseCase)

(Order)-[:PLACED_BY]->(Customer)
(Order)-[:CONTAINS]->(Product)

(Campaign)-[:TARGETS]->(Customer)

Every graph node that maps to application data must contain a
stable domain identifier such as productId, customerId, orderId,
merchantId, or campaignId.


============================================================
HYBRID GRAPH + VECTOR RAG
============================================================

Implement:

MongoDB / documents
        ↓
Ingestion
        ↓
Cleaning + chunking
        ↓
Entity extraction
        ↓
Relationship extraction
        ↓
Embedding generation
        ↓
Neo4j graph + vector indexes
        ↓
Hybrid retrieval
        ↓
Reranking
        ↓
Context construction
        ↓
LLM
        ↓
Grounded answer / controlled action

The system must combine:

1. MongoDB structured retrieval
2. Neo4j vector retrieval
3. Neo4j graph traversal
4. Customer context
5. Business rules

Hard constraints such as price, inventory, category, availability,
and merchant must be enforced with structured queries, not vector
similarity.


============================================================
RAG DATA
============================================================

Index appropriate commerce knowledge:

- Product descriptions
- Product specifications
- Product features
- Product compatibility
- Product use cases
- Merchant information
- Product relationships
- Customer preferences where appropriate
- Campaign information
- Commerce knowledge

Never place:
- API keys
- Payment secrets
- JWT secrets
- Authentication secrets
- Unnecessary sensitive customer information

into the RAG corpus.


============================================================
VECTOR SEARCH
============================================================

Use Neo4j vector indexes for semantic retrieval.

Generate embeddings for product and commerce content.

Example:

User:
"I need a laptop for coding and machine learning."

Embedding retrieval should find semantically relevant products.

Then apply MongoDB structured constraints:

category = laptop
price <= 80000
inventory > 0

Never use vector similarity as the authority for exact price or
inventory.


============================================================
GRAPH RETRIEVAL
============================================================

Use Neo4j graph traversal for relationship-aware retrieval.

Examples:

Customer → PURCHASED → Product

Product → FREQUENTLY_BOUGHT_WITH → Product

Product → COMPATIBLE_WITH → Product

Product → SUITABLE_FOR → UseCase

Customer → INTERESTED_IN → Category

Product → SIMILAR_TO → Product

Return the relevant nodes and the relationships that support the
retrieval result.


============================================================
HYBRID RETRIEVAL EXAMPLE
============================================================

User:
"Find me an ML laptop under ₹80,000 and suggest useful accessories."

MongoDB retrieves:
- laptops
- price <= ₹80,000
- inventory > 0

Neo4j vector retrieval finds:
- machine learning
- coding
- developer
- GPU
- performance

Neo4j graph retrieval finds:
- frequently bought together products
- compatible products
- similar products
- relevant use cases
- customer purchase patterns

Combine results.

Rerank candidates.

Send only grounded context to the LLM.

The LLM produces the recommendation.


============================================================
RAG INGESTION CODE STRUCTURE
============================================================

Create:

apps/api/src/rag/

    ingestion/
        productIngestion.ts
        customerIngestion.ts
        eventIngestion.ts
        documentIngestion.ts

    extraction/
        entityExtractor.ts
        relationshipExtractor.ts

    embeddings/
        embeddingService.ts

    retrieval/
        vectorRetriever.ts
        graphRetriever.ts
        mongoRetriever.ts
        hybridRetriever.ts

    reranking/
        reranker.ts

    generation/
        contextBuilder.ts
        ragGenerator.ts

    sync/
        neo4jProjectionService.ts
        eventProcessor.ts

The ingestion pipeline must be idempotent and safe to rerun.


============================================================
RAG TOOL INTERFACE
============================================================

Implement tools:

searchSemanticProducts()
searchGraphRelationships()
getCustomerContext()
getRelatedProducts()
getCompatibleProducts()
getFrequentlyBoughtTogether()
hybridProductSearch()

The agent must use these tools instead of inventing relationships.

Every tool must:
- Use Zod input validation
- Return typed structured output
- Enforce authorization
- Never expose secrets
- Log safe audit information


============================================================
GROUNDING
============================================================

Every recommendation must be grounded in actual MongoDB or Neo4j
data.

The LLM must never invent:
- Product names
- Prices
- Inventory
- Compatibility
- Discounts
- Payment status
- Customer history
- Campaign performance

Retain source identifiers internally.

The recommendation explanation should be able to distinguish:
- Structured MongoDB evidence
- Semantic/vector evidence
- Neo4j graph evidence
- Customer-history evidence
- Business-rule evidence

If evidence is insufficient, say so rather than hallucinating.


============================================================
MONGODB DESIGN
============================================================

Create these collections:

users
customers
merchants
products
categories
carts
orders
payments
customer_events
recommendations
campaigns
agent_actions
audit_logs

Use appropriate indexes.

Important indexes:

products.category
products.price
products.inventory
products.brand

orders.customerId
orders.merchantId
orders.status
orders.createdAt

customer_events.customerId
customer_events.type
customer_events.createdAt

campaigns.merchantId
campaigns.status

Use compound indexes where query patterns justify them.

MongoDB documents should use stable domain IDs that can also be
represented in Neo4j.

MongoDB remains authoritative for orders, payments, inventory,
and transactional state.


============================================================
MONGODB → NEO4J SYNCHRONIZATION
============================================================

Neo4j is an eventually consistent projection.

Flow:

MongoDB state change
        ↓
Domain/application event
        ↓
Neo4j projection service
        ↓
Create/update graph nodes and relationships

Events include:

ORDER_COMPLETED
PAYMENT_SUCCESS
PRODUCT_CREATED
PRODUCT_UPDATED
CUSTOMER_CREATED
CUSTOMER_PURCHASED_PRODUCT
RECOMMENDATION_ACCEPTED
UPSELL_ACCEPTED

For the MVP, an application-level event processor is sufficient.

Redis Streams may be introduced for asynchronous processing when
useful.

Never allow Neo4j lag to alter payment or order truth.


============================================================
RAG + COMMERCE FLOW
============================================================

1. Agent parses user intent.
2. Extract category, budget, use case, and constraints.
3. MongoDB performs hard structured filtering.
4. Neo4j vector retrieval finds semantic candidates.
5. Neo4j graph traversal finds relationships.
6. Customer context is retrieved.
7. Business rules are applied.
8. Results are deduplicated and reranked.
9. Context is constructed with evidence identifiers.
10. LLM generates a grounded response.
11. Growth/upsell tool identifies relevant opportunities.
12. User confirms product.
13. Cart is updated in MongoDB.
14. Backend creates Razorpay order.
15. User explicitly confirms payment.
16. Razorpay Checkout runs.
17. Backend verifies payment.
18. Razorpay webhook updates payment/order state.
19. MongoDB stores final transaction state.
20. Domain event updates Neo4j.
21. Recommendation/conversion analytics are updated.


============================================================
KNOWLEDGE GRAPH DEMO UI
============================================================

Create a merchant-facing "Commerce Knowledge Graph" page.

Example:

Machine Learning
      │
      │ SUITABLE_FOR
      ▼
  Laptop X
      │
      ├── COMPATIBLE_WITH ──→ USB-C Hub
      │
      ├── FREQUENTLY_BOUGHT_WITH ──→ Laptop Bag
      │
      └── SIMILAR_TO ──→ Laptop Y

Also support:

Customer
   │
   ├── PURCHASED → Laptop
   ├── VIEWED → Monitor
   └── INTERESTED_IN → Machine Learning

This visualization must make the Neo4j contribution visible in
the hackathon demonstration.


============================================================
RAG OBSERVABILITY
============================================================

Record safe metadata for:

- Query
- Retrieval strategy
- Retrieved node/document identifiers
- Retrieval scores
- Graph relationships used
- Reranking results
- Context identifiers
- LLM response metadata
- Agent action
- Request/trace ID

Never log secrets or unnecessary sensitive customer data.

Track:
- Retrieved candidate count
- Retrieval source
- Similarity score where applicable
- Graph evidence
- Reranking score
- Final selected products
- Recommendation acceptance/rejection

Clearly distinguish observed metrics from AI estimates.


============================================================
RAG FALLBACK
============================================================

If Neo4j or the embedding provider is unavailable:

1. Use MongoDB structured product search.
2. Apply deterministic business rules.
3. Return grounded MongoDB products.
4. Continue cart and payment functionality.

The core commerce/payment system must not depend on the AI/RAG
layer being available.


============================================================
RAG QUALITY AND SECURITY RULES
============================================================

1. Never allow arbitrary Cypher from the LLM.
2. Never allow arbitrary MongoDB queries from the LLM.
3. LLMs can call only approved backend tools.
4. Validate every tool input with Zod.
5. Enforce user/merchant authorization before tool execution.
6. Keep payment secrets outside the RAG corpus.
7. Keep payment state authoritative in MongoDB + Razorpay.
8. Keep graph data derived and eventually consistent.
9. Do not hallucinate products or commerce facts.
10. Do not expose unnecessary personal information.
11. Make ingestion idempotent.
12. Make graph projection idempotent.
13. Make sensitive actions auditable.
14. Require explicit user confirmation before payment.
15. Require merchant approval before campaign execution.


============================================================
FINAL TECHNOLOGY ARCHITECTURE
============================================================

Frontend:
React + TypeScript + Vite
Tailwind CSS + shadcn/ui
React Router
TanStack Query
Axios
Recharts

Backend:
Node.js + TypeScript + Express
Zod
JWT + RBAC

Application Database:
MongoDB + official MongoDB Node.js Driver

Knowledge Graph + Vector RAG:
Neo4j + Neo4j Vector Indexes
Neo4j JavaScript/TypeScript Driver

Cache/Temporary Infrastructure:
Redis

AI:
Gemini or another LLM with provider abstraction
Tool/function calling
Structured outputs
Hybrid Graph + Vector RAG

Payments:
Razorpay Test Mode
Orders API
Checkout
Signature verification
Webhooks
Idempotency

Testing:
Vitest/Jest
Supertest
Playwright

DevOps:
Docker
Docker Compose
GitHub Actions
AWS-compatible deployment

Architecture:
Modular monolith first.
No unnecessary microservices.


============================================================
26. API DESIGN
============================================================

Use versioned APIs:

/api/v1/...

Example:

GET    /api/v1/products
GET    /api/v1/products/:id

POST   /api/v1/cart
GET    /api/v1/cart
POST   /api/v1/cart/items
DELETE /api/v1/cart/items/:id

POST   /api/v1/orders
GET    /api/v1/orders/:id

POST   /api/v1/payments/create
GET    /api/v1/payments/:id

POST   /api/v1/webhooks/razorpay

POST   /api/v1/agent/chat
POST   /api/v1/agent/actions

GET    /api/v1/merchant/analytics
GET    /api/v1/merchant/insights

POST   /api/v1/merchant/campaigns
POST   /api/v1/merchant/campaigns/:id/approve


============================================================
27. ERROR HANDLING
============================================================

Create standardized API errors.

Example:

{
  "success": false,
  "error": {
    "code": "PRODUCT_OUT_OF_STOCK",
    "message": "The selected product is currently unavailable."
  },
  "requestId": "..."
}

Handle:

- Invalid input
- Unauthorized
- Forbidden
- Not found
- Database failure
- AI failure
- Razorpay failure
- Webhook failure
- Timeout
- Rate limit
- Duplicate request


============================================================
28. AI FAILURE HANDLING
============================================================

If the AI provider fails:

Do NOT break the entire commerce system.

Fallback:

AI unavailable
    ↓
Normal product search
    ↓
Normal cart
    ↓
Normal checkout

The core payment/commerce functionality must remain usable.


============================================================
29. PAYMENT FAILURE DEMO
============================================================

Implement a graceful payment failure flow.

Example:

Payment fails.

Agent must say:

"The payment was not completed. I verified the transaction
status and will not mark this order as paid."

Then offer:

"Retry payment"

Never claim payment success unless the backend has verified it.


============================================================
30. TESTING REQUIREMENTS
============================================================

Write tests for:

Authentication
Authorization
Product search
Product filtering
Cart
Order creation
Inventory validation
Idempotency
Payment verification
Webhook verification
Upsell scoring
Recommendation logic
Campaign approval
Agent tool permissions

End-to-end test:

User
 ↓
AI search
 ↓
Product recommendation
 ↓
Add to cart
 ↓
Upsell
 ↓
Checkout
 ↓
Razorpay test payment
 ↓
Webhook
 ↓
Order confirmed


============================================================
31. BROWSER TESTING
============================================================

Use Playwright.

Antigravity should use its browser capabilities where appropriate
to verify:

- Login
- Customer shopping flow
- AI assistant
- Product selection
- Cart
- Checkout UI
- Merchant dashboard
- Campaign approval
- Responsive layout

Take screenshots as verification artifacts.


============================================================
32. UI/UX REQUIREMENTS
============================================================

Design should feel like a modern fintech + AI commerce product.

Style:

- Clean
- Professional
- Minimal
- Responsive
- Fast
- Accessible

Avoid generic AI-looking interfaces.

Customer UI should feel like:

AI shopping assistant + modern ecommerce.

Merchant UI should feel like:

Stripe/Razorpay-style analytics dashboard + AI copilot.

Use:
- Cards
- Tables
- Charts
- Status badges
- Activity timelines
- AI insight cards
- Confirmation dialogs

Do not overuse gradients or flashy animations.


============================================================
33. DEMO MODE
============================================================

Create a deterministic demo environment.

Seed:

- 100+ products
- 500+ customers
- 1,000+ historical orders
- customer events
- recommendations
- campaigns

Create a DEMO_MODE configuration.

Demo mode should allow:

Customer flow:
"Find me a laptop for ML under ₹80k."

Then:

Product recommendation
→ Upsell
→ Cart
→ Razorpay test checkout
→ Order success

Merchant flow:
"How can I increase revenue?"

Then:

Revenue insight
→ Campaign recommendation
→ Approval
→ Campaign result


============================================================
34. ANALYTICS
============================================================

Calculate real metrics from database data.

Important metrics:

Total Revenue
AI Assisted Revenue
Average Order Value
AI Assisted AOV
Conversion Rate
Upsell Conversion Rate
Cross-sell Revenue
Recommendation Acceptance Rate
Campaign Conversion Rate
Revenue Per Customer

Do not hardcode dashboard numbers.

All metrics must come from database queries.


============================================================
35. DOCUMENTATION
============================================================

Create:

README.md

docs/architecture.md
docs/database.md
docs/api.md
docs/agent-design.md
docs/security.md
docs/payment-flow.md
docs/demo-script.md

README must include:

- Problem
- Solution
- Architecture
- Tech stack
- Setup
- Environment variables
- Database setup
- Seed instructions
- Running locally
- Razorpay test setup
- AI setup
- Testing
- Deployment
- Demo flow


============================================================
36. ENVIRONMENT CONFIGURATION
============================================================

Create:

.env.example

Include placeholders for:

DATABASE_URL=
REDIS_URL=

JWT_SECRET=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

AI_API_KEY=

Do not commit actual secrets.

Create strong validation for required environment variables.


============================================================
37. DOCKER
============================================================

Create Dockerfiles for:

frontend
backend

Create docker-compose.yml containing:

mongodb
neo4j
redis
backend
frontend

Use health checks.

The project should be startable with:

docker compose up --build


============================================================
38. CI/CD
============================================================

Create GitHub Actions workflow:

On push/pull request:

1. Install dependencies
2. Typecheck
3. Lint
4. Unit tests
5. Integration tests
6. Build frontend
7. Build backend
8. Verify Docker build

Do not deploy automatically until tests pass.


============================================================
39. CODE QUALITY
============================================================

Requirements:

- Strict TypeScript
- ESLint
- Prettier
- No any unless justified
- No duplicated business logic
- Clear naming
- Small services
- Proper error handling
- Typed API responses
- Environment validation
- No secrets in code
- No direct database access from controllers
- No direct database access from LLM agents


============================================================
40. AGENT DEVELOPMENT WORKFLOW
============================================================

IMPORTANT:

Do NOT generate the entire project blindly in one step.

Work incrementally.

Before implementation:

1. Inspect workspace.
2. Produce architecture artifact.
3. Produce implementation plan.
4. Identify dependencies.
5. Identify risks.
6. Identify security concerns.
7. Ask for confirmation only when a decision materially affects architecture.

Then implement in phases.

After each phase:

1. Run type checking.
2. Run linting.
3. Run tests.
4. Start relevant services.
5. Test API endpoints.
6. Use browser testing when applicable.
7. Fix failures.
8. Provide a concise artifact summarizing:
   - What changed
   - Tests run
   - Results
   - Remaining issues

Do not claim something works without verifying it.


============================================================
41. IMPLEMENTATION PHASES
============================================================

PHASE 1:
Repository setup
TypeScript
React
Express
MongoDB
Neo4j
Redis
Docker
Environment configuration

PHASE 2:
MongoDB collection/document design
Indexes
Neo4j graph schema
Graph indexes/constraints
Seed data
Product APIs
MongoDB → Neo4j projection foundation

PHASE 3:
Authentication
JWT
RBAC
Customer/Merchant roles

PHASE 4:
Cart
Orders
Inventory
Order state machine

PHASE 5:
Customer frontend
Product catalog
Product details
Cart

PHASE 6:
AI Commerce Agent
Tool calling
Product search
Recommendation
Comparison

PHASE 7:
Growth Agent
Upsell
Cross-sell
Customer analytics
Revenue opportunities

PHASE 8:
Razorpay integration
Orders
Checkout
Payment verification
Webhooks
Idempotency

PHASE 9:
Merchant dashboard
Analytics
AI insights
Campaigns

PHASE 10:
Audit logs
Guardrails
Failure handling
Rate limiting
Security hardening

PHASE 11:
Redis
Neo4j vector indexes
Embedding generation
Semantic search
Hybrid Graph + Vector RAG
RAG ingestion pipeline
Reranking
Grounded generation

PHASE 12:
Testing
Playwright
API tests
Unit tests

PHASE 13:
Docker
CI/CD
Deployment

PHASE 14:
Final polish
Demo mode
Screenshots
Demo script
Architecture artifact
Final README


============================================================
42. ACCEPTANCE CRITERIA
============================================================

The project is NOT complete until all of these work:

CUSTOMER:

[ ] Register
[ ] Login
[ ] Browse products
[ ] Search products
[ ] AI product discovery
[ ] AI recommendation
[ ] Product comparison
[ ] Add to cart
[ ] AI upsell
[ ] Checkout
[ ] Razorpay test payment
[ ] Payment verification
[ ] Order confirmation
[ ] Order history

MERCHANT:

[ ] Login
[ ] Dashboard
[ ] Revenue metrics
[ ] AI insights
[ ] Revenue opportunities
[ ] Customer segments
[ ] Campaign generation
[ ] Campaign approval
[ ] Campaign analytics
[ ] Audit trail

AI:

[ ] Tool calling
[ ] Structured outputs
[ ] Product grounding
[ ] No hallucinated products
[ ] Customer context
[ ] Upsell reasoning
[ ] Merchant insights
[ ] Permission boundaries
[ ] Failure fallback

PAYMENTS:

[ ] Razorpay test mode
[ ] Server-side order creation
[ ] Checkout
[ ] Signature verification
[ ] Webhook verification
[ ] Payment state machine
[ ] Idempotency
[ ] Duplicate protection
[ ] Failure handling

ENGINEERING:

[ ] TypeScript
[ ] PostgreSQL
[ ] Prisma
[ ] Redis
[ ] Docker
[ ] Tests
[ ] CI
[ ] API documentation
[ ] Security
[ ] Logging
[ ] Documentation


============================================================
43. FINAL DEMO FLOW
============================================================

The final 5-minute demo should be:

PART 1 — CUSTOMER

User:
"I need a laptop for machine learning under ₹80,000."

AI:
Understands intent.

AI:
Finds products.

AI:
Explains recommendation.

User:
"Add it."

AI:
Suggests compatible accessory.

User:
"Yes."

AI:
Updates cart.

User:
"Buy it."

AI:
Shows final amount.

User:
Confirms payment.

Razorpay:
Test checkout.

Payment:
Successful.

Backend:
Verifies payment.

Order:
Confirmed.

PART 2 — MERCHANT

Switch to merchant dashboard.

Show:

Revenue
AI-assisted revenue
AOV
Upsell revenue
Conversion

Merchant asks:

"How can I increase revenue?"

AI:

"2,341 customers purchased laptops but not accessories."

AI:

"Estimated opportunity: ₹12.8L."

Merchant:

"Generate campaign."

AI:

Creates campaign proposal.

Merchant:

"Approve."

Campaign:

Executed in demo mode.

Dashboard:

Shows resulting metrics.

PART 3 — FAILURE

Demonstrate a payment failure.

AI correctly identifies:

"Payment wasn't completed."

It does NOT mark the order as paid.

Show:

Audit trail.

============================================================
44. IMPORTANT ENGINEERING RULES
============================================================

1. Prefer simple architecture over unnecessary complexity.
2. Build a modular monolith first.
3. Never hardcode secrets.
4. Never trust frontend payment status.
5. Never let LLM directly modify database.
6. Never let LLM execute arbitrary SQL.
7. Never invent product information.
8. Every product recommendation must be grounded in DB data.
9. Every sensitive action must have permission checks.
10. Payment actions require explicit user confirmation.
11. Merchant campaigns require merchant approval.
12. Use idempotency for sensitive operations.
13. Log important AI and payment actions.
14. Verify webhooks.
15. Handle AI failures gracefully.
16. Handle payment failures gracefully.
17. Do not claim tests passed unless they actually passed.
18. Do not create unnecessary microservices.
19. Do not add technologies just for the sake of the hackathon.
20. Prioritize a working end-to-end flow over excessive features.


============================================================
45. FIRST TASK
============================================================

Do NOT start coding immediately.

First inspect the current workspace.

Then create an implementation plan artifact containing:

1. Product overview
2. User journeys
3. System architecture
4. Database architecture
5. API architecture
6. AI agent architecture
7. Razorpay payment architecture
8. Security architecture
9. Folder structure
10. Development phases
11. Testing strategy
12. Deployment strategy
13. Risks and mitigations

Then wait for my approval before starting Phase 1.

When implementing, work phase-by-phase and verify each phase
before moving to the next.

============================================================
47. FINAL ARCHITECTURE OVERRIDES
============================================================

The following rules take precedence over any older section in this
prompt:

- MongoDB replaces PostgreSQL.
- Official MongoDB Node.js Driver replaces Prisma.
- Neo4j Vector Indexes replace pgvector.
- MongoDB is the application source of truth.
- Neo4j is the derived knowledge graph + vector retrieval layer.
- Redis remains the cache/temporary state layer.
- Razorpay remains authoritative for gateway-side payment processing.
- Do not introduce PostgreSQL, Prisma, or pgvector anywhere in the
  implementation unless I explicitly request a future architecture
  change.

Before coding, inspect the workspace, create the architecture and
implementation-plan artifacts, identify conflicts, and then wait
for approval to begin Phase 1. Work incrementally and verify every
phase with actual tests and browser/API checks.
