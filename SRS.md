# Software Requirements Specification (SRS)

## Student Thrift Hub - Peer-to-Peer Student Marketplace Platform

**Document Version:** 1.0  
**Date:** May 10, 2026  
**Status:** Active  
**Standard:** IEEE 830-1998

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [Functional Requirements](#3-functional-requirements)
4. [Non-Functional Requirements](#4-non-functional-requirements)
5. [Use Cases](#5-use-cases)
6. [Assumptions and Dependencies](#6-assumptions-and-dependencies)

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) document describes the complete functional and non-functional requirements for the **Student Thrift Hub** application. It serves as a comprehensive guide for developers, quality assurance personnel, project managers, and stakeholders to understand the intended functionality, constraints, and quality attributes of the system.

### 1.2 Scope

**Student Thrift Hub** is a web-based peer-to-peer marketplace platform designed to enable students to buy and sell used items within their academic community. The platform provides:

- **For Buyers**: Product discovery, filtering, shopping cart management, secure checkout, order tracking, and seller ratings
- **For Sellers**: Product listing creation, inventory management, order fulfillment, sales analytics, and wallet-based payment settlements
- **For Administrators**: Content moderation, user management, and platform oversight
- **For All Users**: Authentication, user profiles, favorites management, and AI-powered product recommendations

**Out of Scope**:
- Mobile native applications (web responsive only)
- Multi-currency support (Vietnamese Đồng only)
- International shipping
- Direct peer-to-peer messaging system (AI chat only)
- Physical inventory management at warehouse level

### 1.3 Definitions and Acronyms

| Term | Definition |
|------|-----------|
| **SRS** | Software Requirements Specification |
| **API** | Application Programming Interface |
| **RLS** | Row-Level Security policies for database access control |
| **JWT** | JSON Web Token for stateless authentication |
| **OAuth** | Open Authorization protocol for secure user authentication |
| **UX** | User Experience |
| **UI** | User Interface |
| **Buyer** | User purchasing items on the platform |
| **Seller** | User listing and selling items on the platform |
| **Item** | A product listed for sale on the marketplace |
| **Order** | A transaction record of a purchase between buyer and seller |
| **Transaction** | A financial record of wallet deposits and settlements |
| **Plan/Tier** | Subscription level (Free, Pro, Premium) affecting feature access |
| **Plan Restriction** | Feature limitation based on current plan tier |
| **Stock** | Inventory quantity of an item available for sale |
| **Featured** | Premium visibility placement for items |
| **RPC** | Remote Procedure Call to Supabase database functions |
| **VND** | Vietnamese Đồng (currency) |
| **NAPTIEN** | Vietnamese bank transfer description format with transaction code |
| **COD** | Cash on Delivery payment method |
| **SePay** | Third-party payment service provider |
| **Gemini 2.5 Flash** | Google's AI language model for natural language processing |
| **Webhook** | HTTP callback mechanism for real-time notifications |
| **Edge Function** | Serverless backend function deployed at edge locations |

### 1.4 References

- IEEE Std 830-1998 - IEEE Guide to Software Requirements Specifications
- Supabase PostgreSQL Documentation
- React 18 Documentation
- React Router v6 Documentation
- Tailwind CSS Documentation
- SePay Payment Gateway API
- Google Gemini API Documentation

---

## 2. Overall Description

### 2.1 Product Perspective

**Student Thrift Hub** is a standalone web application built using modern web technologies. The system comprises three main components:

#### 2.1.1 Frontend Application
- React 18.3 single-page application with TypeScript
- Responsive design supporting desktop and mobile browsers
- Real-time UI updates using TanStack React Query
- Client-side state management with custom React hooks

#### 2.1.2 Backend Services
- Supabase PostgreSQL database with Row-Level Security
- Supabase Authentication (OAuth 2.0 and email/password)
- Supabase Edge Functions (serverless backend logic)
- Real-time synchronization via Supabase Realtime

#### 2.1.3 External Integrations
- **SePay**: Payment gateway for wallet deposits and transactions
- **Google Gemini 2.5 Flash**: AI-powered product search and recommendations
- **Vietnam Provinces API**: Geographic hierarchy data (province, district, ward)

### 2.2 Product Functions (High-Level)

| Function Category | Description |
|-------------------|-------------|
| **User Management** | Authentication, profile creation, account management |
| **Product Marketplace** | Item browsing, searching, filtering, detailed viewing |
| **Shopping Cart** | Add/remove items, quantity management, persistent storage |
| **Order Management** | Checkout, order creation, order tracking, history |
| **Payments** | Wallet system, deposits, transactions, settlements |
| **Seller Dashboard** | Item management, order fulfillment, address management |
| **Admin Panel** | Content moderation, user oversight, ad management |
| **AI Assistance** | Natural language product search and recommendations |
| **Social Features** | Ratings, reviews, favorites, user profiles |

### 2.3 User Classes and Characteristics

#### 2.3.1 Anonymous User
- **Description**: Unregistered visitor browsing the platform
- **Capabilities**: View marketplace items, search products, view seller profiles
- **Limitations**: Cannot post items, make purchases, or access cart
- **Frequency**: High traffic volume

#### 2.3.2 Registered User (Buyer)
- **Description**: Enrolled student with active account
- **Capabilities**: Browse marketplace, manage shopping cart, fund wallet, purchase items, rate sellers, manage favorites
- **Limitations**: Item posting governed by subscription plan
- **Frequency**: Daily to weekly usage

#### 2.3.3 Registered Seller
- **Description**: Enrolled student actively selling items
- **Capabilities**: All buyer capabilities plus: post items, edit listings, fulfill orders, manage inventory, save addresses, track sales
- **SubscriptionPlan**: Subject to monthly posting limits (Free: 5 items/month, Pro: Unlimited)
- **Frequency**: Multiple times per week

#### 2.3.4 Administrator
- **Description**: System administrator with elevated privileges
- **Capabilities**: Moderate content, manage users, control ads, view analytics, generate reports
- **Verification**: RLS-enforced role verification on every administrative operation
- **Frequency**: Daily

#### 2.3.5 AI Chat Assistant
- **Description**: Automated system component
- **Capabilities**: Process natural language queries, search products, provide recommendations
- **Integration**: Google Gemini 2.5 Flash with tool-calling capabilities
- **Frequency**: On-demand, subsecond response target

### 2.4 Operating Environment

#### 2.4.1 Hardware Requirements
- **Client**: Standard web browser on desktop, tablet, or mobile device
- **Server**: Supabase cloud infrastructure (auto-scaling)
- **Database**: PostgreSQL 14+ on Supabase managed infrastructure
- **CDN**: Integrated with Supabase for static asset delivery

#### 2.4.2 Software Environment
- **Browsers Supported**: 
  - Chrome 90+
  - Firefox 88+
  - Safari 14+
  - Edge 90+
- **Operating Systems**: Windows, macOS, Linux
- **Internet Connection**: Minimum 2 Mbps for optimal experience

#### 2.4.3 Network Requirements
- HTTPS/TLS 1.2+ for all network communication
- Support for WebSocket connections for real-time updates
- Tolerance for intermittent connectivity (offline mode via localStorage)

#### 2.4.4 Development and Deployment
- **Build Tool**: Vite for optimized production bundles
- **Package Manager**: Bun for dependency management
- **Version Control**: Git with semantic versioning
- **Testing**: Vitest for unit/integration tests, Playwright for E2E tests
- **Deployment**: Supabase Cloud + static hosting (Vercel/Netlify recommended)

### 2.5 Design and Implementation Constraints

- **Language**: TypeScript for type safety across frontend and Edge Functions
- **Framework**: React 18.3 only (no React Native for mobile)
- **Database**: PostgreSQL only (Supabase)
- **Authentication**: OAuth 2.0 primary, email/password secondary
- **Currency**: Vietnamese Đồng (VND) only
- **Geography**: Vietnam only (Vietnamese provinces/districts/wards)
- **Categories**: Fixed 8 product categories (not user-configurable)
- **UI Components**: shadcn/ui + Radix UI for accessibility compliance
- **Styling**: Tailwind CSS + Framer Motion for animations

### 2.6 User Documentation

- In-app help tooltips and guidance text
- FAQ section in footer
- Seller documentation (item posting guide, best practices)
- Admin documentation (moderation workflows, policies)
- API documentation for Edge Functions (if applicable)

---

## 3. Functional Requirements

### 3.1 Authentication and Authorization

#### 3.1.1 User Registration and Login

**Req-AUTH-001**: The system SHALL support user registration via email/password combination.
- Email validation: Valid RFC 5322 format required
- Password requirements: Minimum 8 characters, case-insensitive
- Duplicate email prevention at database level

**Req-AUTH-002**: The system SHALL support OAuth 2.0 authentication with Google.
- Google account linking with automatic profile creation
- Seamless account merging if email matches existing user
- Token refresh mechanism with expiration handling

**Req-AUTH-003**: The system SHALL enforce JWT-based session management.
- Token expiration: 1 hour (configurable)
- Automatic token refresh with sliding window
- Logout functionality clears all session data

**Req-AUTH-004**: The system SHALL implement Row-Level Security (RLS) on all database operations.
- Users can only access/modify their own data
- Admin role verified via RPC function on each administrative operation
- Public queries (browse items) allowed without authentication

#### 3.1.2 Authorization and Access Control

**Req-AUTH-005**: The system SHALL enforce role-based access control (RBAC).
- **User role**: Standard buyer/seller capabilities
- **Admin role**: Full platform access with moderation powers
- **Implicit seller role**: Assigned when user posts first item

**Req-AUTH-006**: The system SHALL prevent unauthorized access to protected resources.
- Unauthenticated users redirected to `/auth` page
- Admin endpoints return 403 Forbidden if user lacks admin role
- Cross-user data access attempts logged for security audit

### 3.2 Product Marketplace (Item Management)

#### 3.2.1 Item Browsing and Discovery

**Req-MARKET-001**: The system SHALL display a paginated list of available items on the homepage.
- Page size: 20 items per page (default)
- Infinite scroll pagination with dynamic loading
- Display fields: image, title, price, seller, location, created date
- Out-of-stock items marked as "Hết hàng" badge with checkout prevention

**Req-MARKET-002**: The system SHALL support full-text search across items.
- Search fields: item title, description, category, location
- Case-insensitive matching
- Partial keyword matching supported
- Real-time search with debounce (300ms)

**Req-MARKET-003**: The system SHALL support multi-criteria filtering.
- **Category Filter**: 8 predefined categories (Electronics, Books, Clothing, Furniture, Sports, Accessories, Food, Other)
- **Price Range**: Min and max price input fields with validation
- **Location Hierarchy**: 
  - Province selection (dropdown)
  - District selection (cascading dropdown based on province)
  - Ward selection (cascading dropdown based on district)
- **Sort Options**: 
  - Newest first (default)
  - Price ascending
  - Price descending
  - Most viewed (popularity)

**Req-MARKET-004**: The system SHALL provide item detail views with comprehensive information.
- Display: Title, description, price, quantity available, seller info, location, images
- Related items recommendations (same category or location)
- Seller profile card with ratings and link to seller page
- Availability status and last updated timestamp

**Req-MARKET-005**: The system SHALL track and display item view counts.
- Increment view counter on item detail page access
- Asynchronous RPC call (non-blocking)
- Update UI with current view count after viewing

#### 3.2.2 Item Creation and Editing

**Req-MARKET-006**: The system SHALL allow authenticated sellers to post new items.
- Required fields: title (≤200 chars), description, price (≥0), quantity (≥0), category, location hierarchy (province, district, ward), address detail
- Optional fields: images (up to 5), featured status (admin only)
- Form validation with real-time error feedback
- Server-side validation and XSS prevention

**Req-MARKET-007**: The system SHALL enforce posting limits based on subscription plan.
- **Free**: 5 items per calendar month with 5,000đ per-item fee
- **Pro**: Unlimited items per month (49,000đ/month subscription)
- **Premium**: Unlimited items + featured display + Pro badge (129,000đ/month)
- Real-time limit checking before form submission
- Clear messaging about plan restrictions and upgrade prompts

**Req-MARKET-008**: The system SHALL allow sellers to edit existing items.
- Edit allowed only by item owner
- All editable fields same as creation
- Timestamp updated on modification
- Changes reflected immediately in search results

**Req-MARKET-009**: The system SHALL allow sellers to delete items.
- Soft delete implementation (status changes to "removed")
- Associated orders remain intact for historical records
- Favorites referencing deleted items removed (cascade delete)
- Deleted items excluded from browsing/search

**Req-MARKET-010**: The system SHALL prevent item quantity overflow and underflow.
- Maximum quantity: 9,999 items per listing
- Minimum quantity: 0 (indicates out of stock; auto-marks item as sold)
- Quantity cannot go negative (checkout validation prevents over-ordering)

#### 3.2.3 Featured Items and Promotions

**Req-MARKET-011**: The system SHALL support admin-controlled featured item placement.
- Featured items displayed prominently on marketplace homepage
- Featured status toggleable only by administrators
- No automatic expiration (manual admin control)

**Req-MARKET-012**: The system SHALL display ads on designated placements.
- Ad placements: Homepage banner, item detail page bottom
- Admin controls ad activation/deactivation
- Ad targeting by category or seller (optional)

### 3.3 Shopping Cart and Order Management

#### 3.3.1 Shopping Cart Operations

**Req-CART-001**: The system SHALL maintain persistent shopping cart using browser localStorage.
- Store cart items in object format: `{ itemId: { quantity, title, price } }`
- Legacy array format auto-migration on load
- Cart persists across browser sessions

**Req-CART-002**: The system SHALL allow users to add items to cart.
- Add item with default quantity 1 (user input optional)
- Prevent duplicate entries (increment quantity if exists)
- Validate quantity ≤ available stock
- Real-time cart count update in navbar

**Req-CART-003**: The system SHALL allow users to modify cart item quantities.
- Quantity adjustment UI (plus/minus buttons or input field)
- Validate new quantity > 0 and ≤ available stock
- Remove item from cart if quantity set to 0
- Real-time total price recalculation

**Req-CART-004**: The system SHALL allow users to remove items from cart.
- Single-click removal
- Confirmation dialog optional
- Real-time cart updates

**Req-CART-005**: The system SHALL validate cart before checkout.
- Verify all items still available with sufficient stock
- Flag out-of-stock items with option to remove
- Calculate final total including delivery fees
- Display warning if total exceeds wallet balance

#### 3.3.2 Checkout and Order Creation

**Req-ORDER-001**: The system SHALL provide multi-step checkout workflow.
- **Step 1**: Review cart items (add/remove/qty adjust)
- **Step 2**: Select or enter shipping address
- **Step 3**: Choose delivery method (Standard/Express)
- **Step 4**: Select payment method (COD/Bank Transfer)
- **Step 5**: Review order summary and confirm

**Req-ORDER-002**: The system SHALL manage shipping addresses.
- Users can save up to 25 shipping addresses
- Address fields: street address, district, ward, phone number, recipient name
- One address marked as default
- Address selection/creation during checkout
- Address editing capability

**Req-ORDER-003**: The system SHALL validate order before creation.
- Buyer ≠ seller check (prevent self-purchase)
- Quantity validation (≤ available stock)
- Shipping address completeness validation
- Wallet balance check (≥ total order amount)
- All validations performed server-side

**Req-ORDER-004**: The system SHALL create order records with correct status workflow.
- Initial status: "pending" (awaiting seller confirmation)
- Allowed transitions: pending → confirmed → shipped → completed
- Seller can transition from pending → confirmed (optional)
- Seller can transition from confirmed → shipped with timestamp
- System auto-completes (shipped → completed) after 5 business days
- Cancellation allowed only if status ≤ pending

**Req-ORDER-005**: The system SHALL automatically decrement item inventory on order creation.
- Quantity decrement: cart quantity from item stock
- Trigger auto-marks item as "sold" if quantity ≤ 0
- Decrement atomic operation (no race conditions)
- Inventory rollback if order creation fails

**Req-ORDER-006**: The system SHALL enforce plan-based order limits.
- Free plan: Max 5 active orders per month
- Pro plan: Unlimited orders
- Premium plan: Unlimited orders + priority support
- Limit blocking only applied to new order creation

#### 3.3.3 Order Tracking and History

**Req-ORDER-007**: The system SHALL provide order history views for buyers and sellers.
- **Buyer view**: "My Purchases" page with order list (20 per page, paginated)
- **Seller view**: "Seller Orders" page with incoming orders, filter by status
- Display fields: order ID, items, total, date, status, seller/buyer info
- Quick action buttons: track shipment, rate seller, contact support

**Req-ORDER-008**: The system SHALL allow sellers to mark orders as shipped.
- Shipped status requires shipping method selection
- Timestamp recorded automatically on status change
- Buyer notified via email/in-app notification
- Order status updates propagate in real-time

**Req-ORDER-009**: The system SHALL track order lifecycle timestamps.
- Created at: Order creation time
- Confirmed at: Seller confirmation time
- Shipped at: Seller shipment time
- Completed at: Delivery timestamp or 5-day auto-completion

**Req-ORDER-010**: The system SHALL support order export for sellers.
- Export to Excel/CSV format
- Columns: Order ID, Buyer name, Item, Quantity, Total, Status, Created date
- Filter by date range, status, buyer
- Batch download capability for multiple orders

### 3.4 Wallet and Payment System

#### 3.4.1 Wallet Operations

**Req-WALLET-001**: The system SHALL initialize new user wallets with starting balance.
- Initial balance: 20,000 VND (~$0.85 USD)
- one-time initialization on account creation
- Balance stored in profiles table

**Req-WALLET-002**: The system SHALL provide wallet balance display.
- Prominent display in navbar and user profile
- Real-time balance updates after transactions
- Wallet balance check before checkout to prevent overspendings

**Req-WALLET-003**: The system SHALL allow users to view transaction history.
- Transaction list page with 20 transactions per page (paginated)
- Columns: Date, Type (deposit/purchase/refund), Amount, Status, Reference code
- Filter by date range, type, status
- Download transaction report (CSV/Excel)

#### 3.4.2 Wallet Top-Up and Deposits

**Req-WALLET-004**: The system SHALL support wallet deposit functionality.
- User navigates to Deposit page
- Displays deposit instructions with QR code for bank transfer
- QR code generated via SePay API
- Includes account number, amount field, NAPTIEN transaction code template
- Deposits charged to user's personal bank account

**Req-WALLET-005**: The system SHALL process SePay webhook notifications.
- Webhook endpoint receives payment confirmations
- Webhook validation: signature verification, timestamp validation
- NAPTIEN code extraction via regex from payment description: `NAPTIEN.<code>`
- Duplicate detection: prevents duplicate deposits via unique reference_code constraint
- Status mapping: SePay status → transaction status (pending/completed/failed)
- Automatic balance credit on deposit completion
- Transaction record created in transactions table

**Req-WALLET-006**: The system SHALL handle payment errors gracefully.
- Webhook status codes: 429 (rate limit), 402 (quota), 401 (auth) handled
- Retry logic for transient failures (up to 3 retries)
- User notification of deposit failures
- Manual support escalation for unresolved issues

#### 3.4.3 Order Payment Processing

**Req-WALLET-007**: The system SHALL deduct payment from buyer wallet on order creation.
- Deduction atomic with order creation (transaction rollback on failure)
- Amount deducted: order total (items + delivery fee)
- Balance validation: wallet balance ≥ order total (prevents overdraft)
- Transaction record created with reference to order ID
- Seller receives payment settlement (deducted from platform commissions)

**Req-WALLET-008**: The system SHALL support refunds for cancelled orders.
- Refund triggered on order cancellation
- Amount refunded: full order amount + paid delivery fee
- Refund processed immediately (wallet balance updated)
- Transaction record marks refund with original order reference
- Notification sent to buyer confirming refund

### 3.5 Seller Features

#### 3.5.1 Seller Profile and Dashboard

**Req-SELLER-001**: The system SHALL provide seller-specific dashboard.
- Quick stats: Active listings, total sales, pending orders, average rating
- Order list with filtering and sorting
- Address management quick access
- Performance metrics (monthly sales trend chart)

**Req-SELLER-002**: The system SHALL support saved posting addresses.
- Users can save up to 25 frequently-used addresses
- Address fields: street, district, ward, label (e.g., "Home", "Office")
- Quick-select dropdown during item posting
- Edit/delete saved address capability
- Default address auto-populated on new post form

**Req-SELLER-003**: The system SHALL display seller public profile.
- Seller info: Name, avatar, bio, university, member since
- Sale statistics: Total items sold, active listings, response rate
- Seller rating: Average rating (1-5 stars), number of ratings
- Product showcase: Recent items for sale
- Contact method: Link to send inquiry

#### 3.5.2 Seller Plan Management

**Req-SELLER-004**: The system SHALL offer tiered subscription plans with distinct features.

| Feature | Free | Pro | Premium |
|---------|------|-----|---------|
| Monthly cost | 0 VND | 49,000 VND | 129,000 VND |
| Items/month limit | 5 | Unlimited | Unlimited |
| Per-item fee | 5,000 VND | 0 VND | 0 VND |
| Featured display | ❌ | ✅ | ✅ |
| Pro badge | ❌ | ✅ | ✅ |
| Push notifications | ❌ | ❌ | ✅ |
| Basic analytics | ❌ | ✅ | ✅ |
| Advanced analytics | ❌ | ❌ | ✅ |
| Trusted seller badge | ❌ | ❌ | ✅ |

**Req-SELLER-005**: The system SHALL enforce plan-based item posting quotas.
- Plan retrieved from user_roles or subscription status
- Quota check: posted items this month < limit
- Over-limit prevention: form submission blocked with upgrade prompt
- Quota resets on 1st of calendar month (00:00 UTC+7)

**Req-SELLER-006**: The system SHALL manage plan upgrades and downgrades.
- In-app upgrade UI on homepage and seller dashboard
- Redirect to payment processor (SePay) for subscription
- Automatic plan assignment on payment completion
- Downgrade allowed with effective date (prevents mid-month refunds)
- Plan cancellation supported (reverts to Free tier)

### 3.6 Admin Functions

#### 3.6.1 Content Moderation

**Req-ADMIN-001**: The system SHALL provide admin panel for content moderation.
- Access control: RLS enforces admin role verification on every operation
- Item management: View all items, search by ID/seller/title, delete inappropriate content
- Mark deleted items with removal reason (spam, prohibited item, offensive language)
- User management: View all profiles, search by username/email, disable accounts
- Disable user: Prevents login but preserves order history

**Req-ADMIN-002**: The system SHALL allow admin item deletion.
- Soft delete: Item status changed to "removed"
- Deletion reason recorded (optional)
- Associated orders preserved for audit
- Favorites referencing item removed (cascade delete)

**Req-ADMIN-003**: The system SHALL support ad management.
- Admin can activate/deactivate ads
- Ad placements: Homepage banner, item detail page
- Ad duration configurable (start/end dates)
- Feature disable supported (remove ads entirely)

#### 3.6.2 Analytics and Reporting

**Req-ADMIN-004**: The system SHALL provide basic platform analytics.
- Dashboard metrics: Total users, active listings, monthly orders, platform revenue
- User growth chart (daily active users)
- Top categories by sales volume
- Top sellers by sales count
- Payment method distribution

**Req-ADMIN-005**: The system SHALL support data export for reporting.
- Export options: Users, Items, Orders, Transactions
- Format support: CSV and Excel
- Date range filtering
- Scheduled export capability (emails report automatically)

### 3.7 Ratings and Reviews

#### 3.7.1 Rating System

**Req-RATING-001**: The system SHALL allow users to rate sellers.
- Rating triggered post-order-completion
- Rating scale: 1-5 stars (required)
- Comment field: Optional (max 500 characters)
- One rating per buyer-seller pair (UNIQUE constraint)
- Update rating: User can edit within 7 days of creation

**Req-RATING-002**: The system SHALL calculate and display seller ratings.
- Average rating displayed on seller profile (1 decimal place)
- Rating count displayed
- Individual ratings visible to other users (anonymized buyer names)
- Rating sort option: Help buyers identify high-rated sellers

**Req-RATING-003**: The system SHALL prevent rating manipulation.
- Must be order-related (order must exist and be completed)
- Cannot rate self (buyer ≠ seller validation)
- UNIQUE (user_id, seller_id) constraint prevents duplicates
- Delete rating only by owner or admin

### 3.8 Favorites Management

#### 3.8.1 Favorites Operations

**Req-FAV-001**: The system SHALL allow users to manage favorites.
- Add to favorites: Heart icon on product card (one-click)
- Remove from favorites: Click again to toggle
- UNIQUE (user_id, item_id) constraint prevents duplicates

**Req-FAV-002**: The system SHALL provide favorites list view.
- Dedicated favorites page: `/favorites`
- Display: Same as product cards (image, title, price, seller)
- Pagination: 20 items per page
- Empty state: Message + link to browse marketplace
- Sort options: Recently added, price ↑/↓, most viewed

**Req-FAV-003**: The system SHALL cascade delete favorites.
- If item deleted: Automatic favorite deletion
- If user deleted: Automatic favorite deletion
- Data consistency maintained at database level

### 3.9 AI Chat Assistant

#### 3.9.1 AI-Powered Product Search

**Req-AI-001**: The system SHALL provide natural language product search via AI chat widget.
- Widget location: Fixed chat bubble (bottom-right corner)
- User input: Free-text natural language query
- Processing: Sent to Google Gemini 2.5 Flash via OpenRouter API
- Tool usage: Gemini calls `searchProducts` RPC function with keywords
- Product search: Searches items by title, description, location, and category
- Response format: Conversational text with product suggestions + live item links
- Retry logic: Up to 3 retries on tool-calling failures

**Req-AI-002**: The system SHALL integrate product search tool.
- Tool name: `searchProducts`
- Input parameters: Search keywords, filters (category, max price)
- Output: Matching items with URLs for direct product viewing
- Execution: Server-side RPC function execution
- Performance: Response time < 3 seconds (99th percentile)

**Req-AI-003**: The system SHALL handle AI chat errors gracefully.
- Network errors: Display "Xin thử lại sau" (Try again later)
- Tool failures: Helpful error messages with debugging info
- Rate limiting: Queue requests; notify user of busy state
- Fallback: Link to browse marketplace if AI unavailable

**Req-AI-004**: The system SHALL maintain chat session state.
- Session storage: Browser sessionStorage during active session
- Context preservation: Recent queries remembered for follow-up questions
- Clear chat history: Manual clear button
- Export chat: Optional download of conversation history

### 3.10 University Integration

#### 3.10.1 University Database

**Req-UNI-001**: The system SHALL maintain university database.
- Data source: built-in universities.ts file with comprehensive list
- User profile field: university selection (dropdown on profile creation)
- Purpose: Community identification and trust building
- Search: Quick search by university name with autocomplete
- Update: Can be changed in profile settings

#### 3.10.2 University Verification (Future Enhancement)

**Req-UNI-002**: The system SHALL support university email verification (optional future feature).
- Email domain whitelist per university
- Verification code sent to student email
- Account flagged as "verified student" on successful verification
- Verified badge displayed on public profile

### 3.11 Notifications

#### 3.11.1 Email Notifications

**Req-NOTIF-001**: The system SHALL send email notifications for key events.
- New order received (seller)
- Order shipped/dispatched (buyer)
- Order completed (buyer)
- Rating received (seller)
- Wallet balance low alert
- Plan upgrade/downgrade confirmation

**Req-NOTIF-002**: The system SHALL support in-app push notifications (Premium plan).
- Implementation: Web Push API
- Notifications: Order status updates, messages, recommendations
- Frequency: User-configurable in settings
- Desktop and mobile browser support

#### 3.11.2 Notification Preferences

**Req-NOTIF-003**: The system SHALL allow users to manage notification preferences.
- Settings page: Enable/disable notification types
- Email frequency: Immediate, daily digest, weekly digest
- Push notification opt-in/opt-out
- Do Not Disturb hours (e.g., 22:00-08:00)

---

## 4. Non-Functional Requirements

### 4.1 Performance Requirements

**Req-PERF-001**: Homepage Load Time
- First Contentful Paint (FCP): ≤ 2.5 seconds (from initial page load)
- Largest Contentful Paint (LCP): ≤ 4 seconds
- Time to Interactive (TTI): ≤ 5 seconds
- Measurement: 95th percentile on 3G network (at minimum)

**Req-PERF-002**: Search Response Time
- Query response time: ≤ 1 second (99th percentile)
- Full-text search with 8 concurrent filters: ≤ 2 seconds
- Auto-complete suggestions: ≤ 300ms
- Database indexes: Required on user_id, category, status, created_at

**Req-PERF-003**: API Response Time
- Average API response: ≤ 200ms
- 95th percentile: ≤ 500ms
- Checkout flow end-to-end: ≤ 3 seconds
- Image upload processing: ≤ 5 seconds

**Req-PERF-004**: Pagination and Infinite Scroll
- Infinite scroll load next 20 items: ≤ 1 second
- No UI jank or layout shift during loading
- Smooth scrolling at 60fps
- Memory footprint: Virtualized list to prevent DOM bloat

**Req-PERF-005**: Real-Time Updates
- Wallet balance update: ≤ 500ms (after transaction completion)
- Inventory update: ≤ 1 second (propagate to all viewers)
- Rating display update: ≤ 2 seconds
- WebSocket connection latency: ≤ 100ms

**Req-PERF-006**: Image Optimization
- Lazy loading enabled for all product images
- Image compression: JPEG quality 80%, WebP format where supported
- Responsive images: Srcset across breakpoints (320px, 640px, 1280px)
- Cache headers: 30-day browser cache + CDN cache

**Req-PERF-007**: Bundle Size
- Initial JavaScript bundle: ≤ 300KB (gzipped)
- CSS bundle: ≤ 50KB (gzipped)
- Vendor code splitting: Separate bundle for dependencies
- Dynamic imports for admin panel and seller features

### 4.2 Scalability Requirements

**Req-SCAL-001**: User Capacity
- Target capacity: 100,000 concurrent users on platform
- Peak load handling: 10,000 simultaneous active users (browsing/searching)
- Growth plan: 25% month-over-month user growth supported

**Req-SCAL-002**: Data Volume Scalability
- Support 1 million items cataloged on platform
- Support 500,000 users registered
- Support 10 million orders in system lifetime
- Database query optimization for large datasets

**Req-SCAL-003**: Serverless Function Scaling
- Supabase Edge Functions: Auto-scale to handle traffic spikes
- Concurrency: 1,000+ concurrent function invocations handled
- Response time stable under load (no degradation)
- Graceful degradation if rate limit exceeded

### 4.3 Reliability and Availability

**Req-REL-001**: Availability SLA
- Target availability: 99.5% uptime (SLA)
- Maximum planned downtime: 4 hours per month for maintenance
- Maintenance window: Scheduled during off-peak hours (02:00-06:00 UTC+7 Sunday)
- Alert system: Early warning to users before maintenance

**Req-REL-002**: Error Recovery
- Database connection pool exhaustion: Graceful retry with exponential backoff
- API timeout: 30-second timeout with user-friendly error message
- Payment gateway unavailable: Queue transactions for retry (max 5 retries over 24 hours)
- Corrupted session data: Auto-clear and redirect to re-login

**Req-REL-003**: Data Backup and Disaster Recovery
- Database backup frequency: Daily automated backups to geographically separate location
- Backup retention: 30-day retention policy
- RTO (Recovery Time Objective): 4 hours
- RPO (Recovery Point Objective): 1 hour maximum data loss
- Disaster recovery drill: Quarterly testing

**Req-REL-004**: Transaction Integrity
- ACID compliance: All database transactions maintain atomicity, consistency, isolation, durability
- Idempotent operations: Payment webhooks designed to be re-playable (no double-charging)
- Order processing: Transactions rollback if any step fails
- Wallet deduction: Atomic with order creation (no orphaned transactions)

**Req-REL-005**: Graceful Degradation
- Database unavailable: Show cached items from previous load (stale data acceptable)
- Payment gateway unavailable: Queue order for later processing; notify user
- Image CDN unavailable: Fallback to origin server images
- Real-time synchronization fail: Fall back to polling (less than 5-second interval)

### 4.4 Security Requirements

#### 4.4.1 Authentication Security

**Req-SEC-001**: Account Credential Protection
- Password hashing: bcrypt with salt (14 rounds minimum)
- Password policy: Minimum 8 characters, no character type requirements (accessibility)
- Account lockout: After 5 failed login attempts, 15-minute lockout
- Session timeout: 1-hour idle timeout; automatic logout

**Req-SEC-002**: OAuth Security
- PKCE flow implementation (RFC 7636)
- State parameter validation on OAuth callback
- Scopes: email, profile only (minimal permissions)
- Token expiration: 1 hour for access tokens

**Req-SEC-003**: JWT Security
- Token signing: RS256 algorithm (asymmetric)
- Token validation: Signature verification on every API call
- Claims validation: exp (expiration), iat (issued at), aud (audience)
- Token revocation on logout

#### 4.4.2 Authorization and Access Control

**Req-SEC-004**: Row-Level Security (RLS)
- All tables protected by RLS policies
- Users can only select/insert/update/delete own data
- Admin queries bypass RLS with service role
- Policy enforcement: Database-level, not application-level

**Req-SEC-005**: Role-Based Access Control
- Admin role: Verified via database query with RLS on every operation
- Seller role: Implicit assignment on first item post
- Role verification: No caching; fresh check for sensitive operations

**Req-SEC-006**: CORS Protection
- Allowed origins: Production domain only (e.g., thrifthub.vn)
- Credentials included: Cookies/auth headers required for cross-origin requests
- Preflight requests: Properly handled with OPTIONS

#### 4.4.3 Data Protection

**Req-SEC-007**: Encryption in Transit
- TLS 1.2 minimum (TLS 1.3 preferred)
- HSTS header: max-age=31536000 (1 year, includeSubDomains)
- Certificate pinning: Optional for mobile web view
- No unencrypted HTTP allowed

**Req-SEC-008**: Encryption at Rest
- Database encryption: Supabase default PostgreSQL at-rest encryption
- File storage encryption: Supabase object storage encryption
- Sensitive fields: Additional application-level encryption for PII if required

**Req-SEC-009**: PII Protection
- PII fields: Email, phone, street address, full name
- Data minimization: Collect only necessary PII
- Retention policy: Delete PII 2 years after account deletion
- User right to deletion: Users can request data export and deletion

#### 4.4.4 Input Validation and Output Encoding

**Req-SEC-010**: Input Validation
- Server-side validation: All client input validated before storage
- Type validation: Zod schemas enforce correct data types
- Range validation: Price ≥ 0, quantity 0-9999
- Format validation: Email RFC 5322, phone 10-11 digits
- XSS prevention: HTML content sanitized before storage

**Req-SEC-011**: Output Encoding
- HTML encoding: React's default JSX protection
- URL encoding: Proper URL parameter encoding
- JSON encoding: Safe JSON serialization (no unescaped quotes)
- CSV export: Proper CSV escaping (quotes, newlines)

#### 4.4.5 Payment Security

**Req-SEC-012**: Payment Data Protection
- PCI DSS scope: Only merchant public key stored; full card data never stored
- Payment tokenization: SePay handles tokenization
- User wallet: Encrypted balance field (at-rest)
- Transaction records: No sensitive payment method data logged

**Req-SEC-013**: Webhook Validation
- Signature verification: HMAC-SHA256 validation on SePay webhooks
- Timestamp validation: Reject if older than 5 minutes
- Idempotency: Duplicate detection by reference_code prevents double-processing
- Replay attack prevention: Nonce or timestamp checking

#### 4.4.6 API Security

**Req-SEC-014**: API Rate Limiting
- Public endpoints: 100 requests per minute per IP
- Authenticated endpoints: 1,000 requests per minute per user
- Payment endpoints: 10 requests per minute per user
- Rate limit headers: X-RateLimit-Limit, X-RateLimit-Remaining

**Req-SEC-015**: API Error Handling
- No sensitive data in error messages (e.g., no database error details)
- Generic error message: "An error occurred" with error code
- Logging: Detailed error logged server-side (not sent to client)
- Stack traces: Never exposed in production

#### 4.4.7 Security Testing

**Req-SEC-016**: Vulnerability Management
- OWASP Top 10 coverage: Regular assessment
- Dependency scanning: Automated checks for known vulnerabilities
- Penetration testing: Annual security audit recommended
- Bug bounty program: Consider implementing for production

### 4.5 Maintainability

**Req-MAINT-001**: Code Quality
- Language: 100% TypeScript (no JavaScript)
- Linting: ESLint with strict configuration
- Code style: Consistent formatting via Prettier
- Complexity: Cyclomatic complexity ≤ 10 per function
- Documentation: JSDoc comments for public APIs

**Req-MAINT-002**: Testing Coverage
- Unit tests: Minimum 70% coverage for business logic
- Integration tests: Cover critical user workflows (signup, purchase, checkout)
- E2E tests: Playwright tests for 10+ critical user journeys
- Test execution: Automated on every pull request (CI/CD)

**Req-MAINT-003**: Version Control
- Repository: Git with semantic versioning (SemVer)
- Branching: Feature branches + main branch protection
- Commit messages: Conventional commits (feat:, fix:, docs:, etc.)
- Change log: Maintained CHANGELOG.md with releases

**Req-MAINT-004**: Documentation
- README.md: Project setup, development workflow, deployment
- API documentation: Edge Function signatures and examples
- Architecture document: System design and component interactions
- Database schema: Entity-relationship diagram (ER diagram)
- Inline comments: Explain business logic and non-obvious code

**Req-MAINT-005**: Monitoring and Logging
- Error tracking: Sentry or similar for error aggregation
- Performance monitoring: Web Vitals tracking
- User analytics: Segment or Mixpanel for feature usage
- Audit logging: Log all admin actions + sensitive user actions
- Log retention: 90-day retention minimum

### 4.6 Usability

**Req-USAB-001**: Responsive Design
- Breakpoints: 320px, 640px, 1024px, 1280px
- Mobile-first approach: Base styles for mobile, enhance for larger screens
- Touch targets: Minimum 48x48px for interactive elements
- Landscape support: All pages support landscape orientation

**Req-USAB-002**: Accessibility (WCAG 2.1 Level AA)
- Color contrast: Minimum 4.5:1 for text
- Keyboard navigation: All functionality accessible via keyboard
- Screen reader support: Semantic HTML + ARIA labels
- Form labels: Associated labels for all inputs
- Focus indicators: Visible focus outline on keyboard navigation

**Req-USAB-003**: Localization (Vietnamese)
- All UI text in Vietnamese
- Date format: DD/MM/YYYY
- Currency: Vietnamese Đồng (VND) with "đ" symbol
- Number formatting: 1.000.000 for millions (European style)
- Time zone: UTC+7 (Indochina Time)

**Req-USAB-004**: User Guidance
- Onboarding: Welcome guide on first login
- Help text: Tooltip hover text for complex features
- Inline validation: Real-time form error messages
- Empty states: Helpful guidance + links to related features
- 404 page: Suggest related pages to minimize dead ends

**Req-USAB-005**: Error Messages
- Clarity: Explain what went wrong + how to fix
- Language: Simple, non-technical language
- Specificity: Point to exact field with error (form validation)
- Recovery: Always provide action to resolve (e.g., "Tap here to retry")

---

## 5. Use Cases

### 5.1 Use Case Overview

The following use cases represent the primary user interactions with the system:

| Use Case ID | Actor | Title | Complexity |
|------------|-------|-------|-----------|
| UC-01 | User | Register and Create Account | Low |
| UC-02 | User | Login to System | Low |
| UC-03 | Buyer | Browse and Search Items | Medium |
| UC-04 | Buyer | Add Item to Shopping Cart | Low |
| UC-05 | Buyer | Checkout and Complete Purchase | High |
| UC-06 | Buyer | Rate and Review Seller | Low |
| UC-07 | Seller | Post New Item for Sale | Medium |
| UC-08 | Seller | Manage Inventory and Listings | Medium |
| UC-09 | Seller | Fulfill Order and Ship | Medium |
| UC-10 | Admin | Moderate Content | Medium |
| UC-11 | User | Manage Favorites | Low |
| UC-12 | User | Fund Wallet via Bank Transfer | Medium |
| UC-13 | User | View Transaction History | Low |
| UC-14 | User | Search Items via AI Chat | Medium |
| UC-15 | Seller | Upgrade Subscription Plan | Low |

### 5.2 Representative Use Cases

#### **UC-03: Browse and Search Items**

**Actors**: Anonymous User, Registered User

**Preconditions**: 
- System is running and accessible
- Items exist in marketplace

**Main Flow**:
1. User navigates to homepage (`/`)
2. System displays featured items and latest listings (20 per page)
3. User (optional) enters search query in search bar
4. User (optional) applies filters:
   - Category selection
   - Price range (min/max)
   - Location: Province → District → Ward
   - Sort order (newest, price ↑/↓, popular)
5. System queries items matching filters and displays paginated results
6. User clicks an item card to view details
7. System displays item detail page with:
   - Images, title, description, price, quantity
   - Seller profile card
   - Related items in same category
   - Add-to-cart button
8. User either adds to cart or continues browsing

**Postconditions**: 
- Item view count incremented (asynchronously)
- Cart unchanged (if user doesn't add item)

**Alternate Flows**:
- A1: No items match query → System displays "No items found" with browse suggestions
- A2: User enables AI Chat → Natural language search capability available
- A3: User filters by sold-out items → Out-of-stock items excluded from results

---

#### **UC-05: Checkout and Complete Purchase**

**Actors**: Registered Buyer

**Preconditions**: 
- User authenticated and logged in
- Items in shopping cart
- User has wallet balance ≥ cart total
- All items in cart still have sufficient stock

**Main Flow**:
1. User navigates to Cart page (`/cart`)
2. System displays cart items with quantity, price, subtotal
3. User reviews items (optional: adjust quantities, remove items)
4. User clicks "Proceed to Checkout"
5. System validates cart (quantity, stock, balance)
6. User navigates to checkout page (Step 1: Review)
7. User confirms cart items or makes final adjustments
8. User proceeds to Step 2: Shipping Address
9. User selects existing address OR enters new address with:
   - Recipient name, phone, street, district, ward
10. User proceeds to Step 3: Delivery Method
11. User selects delivery: Standard (free) or Express (fee)
12. User proceeds to Step 4: Payment Method
13. User selects: COD (Cash on Delivery) or Bank Transfer
14. User proceeds to Step 5: Order Review
15. System displays order summary with:
    - Items, quantities, prices
    - Shipping address, delivery method
    - Subtotal, delivery fee, total
    - Wallet balance after deduction
16. User clicks "Confirm Order"
17. System performs final validations:
    - Buyer ≠ seller check
    - Quantity ≤ available stock
    - Wallet balance ≥ total
18. System creates Order in "pending" status
19. System decrements item quantities in inventory
20. System deducts payment from buyer wallet
21. System creates transaction record
22. System marks out-of-stock items with zero quantity as "sold"
23. System sends order confirmation email to buyer and seller
24. System redirects user to "My Purchases" page
25. Order appears in seller's "Seller Orders" dashboard

**Postconditions**: 
- Order created with ID and status
- Inventory decremented for all items
- Wallet balance reduced by order total
- Buyer and seller notified via email
- Transaction record created

**Alternate Flows**:
- A1: Cart item out of stock during checkout → Validation fails; user prompted to remove item
- A2: Insufficient wallet balance → Checkout blocked; prompt to deposit funds
- A3: Buyer attempts self-purchase → Validation fails; user redirected to prevent
- A4: Network error during payment → Order rollback; transaction not processed; wallet not charged
- A5: User selects express delivery → Additional fee added to total
- A6: User creates new shipping address → Address saved for future use

**Exception Handling**:
- E1: Payment gateway unavailable → Order queued for later processing; user notified of delay
- E2: Duplicate order prevention → Reference ID checked to prevent accidental double-submission

---

#### **UC-07: Post New Item for Sale**

**Actors**: Registered Seller

**Preconditions**: 
- User authenticated and logged in
- User has posting limit remaining (based on plan)
- User's account status is active (not disabled)

**Main Flow**:
1. Seller navigates to Post Item page (`/post`)
2. System displays item creation form with fields:
   - Title (≤200 characters)
   - Description
   - Price (≥0)
   - Quantity (≥0)
   - Category (8 predefined options)
   - Location: Province, District, Ward (cascading dropdowns)
   - Address detail (street address)
   - Image upload (up to 5 images)
3. System checks posting limit:
   - Free: 5 per month (fee 5,000đ per item)
   - Pro/Premium: Unlimited
4. Seller fills form with item details
5. Seller uploads images (JPEG/PNG, ≤10MB each, max 5 total)
6. System validates inputs:
   - Required fields present
   - Title length ≤200
   - Price valid decimal ≥0
   - Quantity integer 0-9999
   - At least one image
   - Location hierarchy complete
7. Seller reviews item preview
8. Seller clicks "Post Item"
9. System charges posting fee if applicable (Free plan: 5,000đ)
10. System deducts fee from seller wallet
11. System creates item record with:
    - Status: "active"
    - Seller ID
    - View count: 0
    - Created timestamp
    - Images uploaded to CDN
12. System redirects to item detail page
13. Item becomes visible in marketplace search/browse
14. Seller receives confirmation notification

**Postconditions**: 
- Item created and visible in marketplace
- Item count incremented for seller
- Posting fee charged (if applicable)
- Seller wallet balance reduced (if applicable)
- Item searchable by title, category, location

**Alternate Flows**:
- A1: Seller reaches posting limit → Form submission blocked; upgrade prompt shown
- A2: Seller's wallet insufficient for fee → Payment fails; item not posted; error displayed
- A3: Image upload fails → Retry option offered; item saved as draft (optional)
- A4: Seller selects saved address → Auto-populated into address detail field
- A5: Seller sets quantity to 0 → Item marked as "sold" upon posting

**Exception Handling**:
- E1: Form submission network error → Item saved as draft; retry option offered
- E2: Duplicate item detection → Optional warning if similar item exists by same seller

---

#### **UC-09: Fulfill Order and Ship**

**Actors**: Seller

**Preconditions**: 
- Seller authenticated and logged in
- Order exists in "pending" or "confirmed" status
- Order belongs to seller (seller ID matches)
- Seller account is active

**Main Flow**:
1. Seller navigates to Seller Orders page (`/seller-orders`)
2. System displays paginated list of orders (20 per page)
3. System shows pending and confirmed orders (sortable by date, status)
4. Seller searches/filters orders by buyer name, order ID, date range
5. Seller clicks on order to view details:
   - Order ID, items, quantities, prices, total
   - Buyer shipping address and contact info
   - Order status and timeline
   - Item images and descriptions
6. Seller clicks "Confirm Order" if status is "pending"
7. System transitions status from pending → confirmed
8. System notifies buyer that order confirmed
9. Seller packages item and prepares shipment
10. Seller returns to order detail
11. Seller clicks "Mark as Shipped"
12. System displays shipment form:
    - Delivery method (Standard/Express as selected by buyer)
    - Optional tracking number field
    - Shipping notes field (optional)
13. Seller fills in tracking info (optional) and clicks "Ship"
14. System records:
    - Order status: shipped
    - Shipped timestamp: current time
    - Tracking number (if provided)
15. System notifies buyer:
    - Email: Order shipped with tracking info
    - In-app notification: Delivery status update
16. System auto-completes order after 5 business days
17. Order marked as "completed"
18. Buyer prompted to rate seller
19. Seller sees completed order in sales history

**Postconditions**: 
- Order status transitioned: pending → confirmed → shipped → completed
- Buyer notified of shipment
- Seller credited with payment upon completion
- Order appears in seller's sales history for analytics

**Alternate Flows**:
- A1: Seller declines to confirm order → Order remains "pending" (optional)
- A2: Seller re-ships item → Status can be updated again before completion
- A3: Buyer reports issue → Order can be cancelled (if not yet completed)
- A4: Seller exports orders → Batch download of order data (CSV/Excel)

**Exception Handling**:
- E1: Order already shipped by another process → System prevents duplicate shipment
- E2: 5-day auto-completion fails → Manual completion option available
- E3: Tracking number invalid → Warning but allows shipment to proceed

---

#### **UC-12: Fund Wallet via Bank Transfer**

**Actors**: Registered User

**Preconditions**: 
- User authenticated and logged in
- User has active bank account in Vietnam
- User wants to deposit funds

**Main Flow**:
1. User navigates to Deposit page (`/deposit`)
2. System displays deposit instructions with:
   - Account holder name
   - Bank account number (merchant account)
   - Bank name (e.g., Techcombank, VietcomBank)
   - QR code for bank transfer (generated by SePay API)
   - NAPTIEN code template: `NAPTIEN.<user_id>`
   - Recommended amount (100,000đ minimum)
3. System displays form:
   - Amount input field (VND)
   - Frequency options (one-time, recurring)
4. User selects amount (e.g., 500,000đ)
5. User scans QR code with bank app (or manually enters details)
6. User's bank app opens with pre-filled transfer details
7. User enters NAPTIEN code from template into bank transfer description
8. User completes bank transfer
9. (Asynchronous) Bank settlement: Funds transferred from user's account to merchant
10. (Asynchronous) SePay notifies platform via webhook:
    - Payment confirmation
    - Transaction ID, amount, description, status
    - NAPTIEN code extracted from description
11. System processes SePay webhook:
    - Signature verification (HMAC-SHA256)
    - Timestamp validation (≤5 minutes old)
    - Duplicate check: reference_code not previously processed
    - NAPTIEN code extraction via regex
12. System creates transaction record:
    - Type: "deposit"
    - Amount: 500,000đ
    - Status: "completed"
    - Reference code (SePay transaction ID)
13. System credits user wallet:
    - New balance: previous + 500,000đ
14. System sends email confirmation to user:
    - Deposit amount, timestamp, new balance
15. User checks wallet balance (updated in real-time)

**Postconditions**: 
- Wallet balance increased by deposit amount
- Transaction record created
- Confirmation email sent to user
- Funds available for purchases immediately

**Alternate Flows**:
- A1: User enters wrong amount in bank app → User can retry transfer with correct amount
- A2: User forgets NAPTIEN code → Deposit still processed (code used for reconciliation)
- A3: Recurring deposit selected → Monthly auto-transfer set up (requires bank setup)
- A4: User selects crypto payment (future) → Alternative payment method presented

**Exception Handling**:
- E1: Payment gateway unavailable → Webhook queueing mechanism retries up to 5 times over 24 hours
- E2: Duplicate transaction detected → Webhook rejected; duplicate prevention via reference_code
- E3: Webhook signature invalid → Request logged and flagged for security review
- E4: User initiation timeout → 24-hour pending deposit auto-cancellation with notification

---

### 5.3 Use Case Relationships

```
Register/Login
    ↓
Browse Items ←─ AI Chat Search
    ↓
Add to Cart
    ↓
Checkout & Purchase ← Fund Wallet
    ↓
Rate Seller
    ├─ (Seller: Fulfill Order)
    └─ (Admin: Moderate if needed)

Seller Dashboard
    ├─ Post Item ─ Upgrade Plan
    ├─ Manage Inventory
    └─ Fulfill Orders

Admin Panel ─ Moderate Content
```

---

## 6. Assumptions and Dependencies

### 6.1 Assumptions

#### Business Assumptions

**Assume-BUS-001**: Vietnam-Only Operation
- Platform operates exclusively in Vietnam
- Uses Vietnamese Đồng (VND) as sole currency
- Supports Vietnamese geographic hierarchy (provinces, districts, wards)
- Regulatory compliance limited to Vietnamese laws

**Assume-BUS-002**: University-Affiliated Audience
- Users are confirmed or claimed to be university students
- University-based community fosters trust and repeat patronage
- No formal age verification (relies on user honesty)

**Assume-BUS-003**: Student Demographics
- Primary users: Age 18-25, tech-savvy, mobile-first
- Secondary users: 26-30 alumni, returning to marketplace
- Limited purchasing power (suggests lower price points)
- Price-sensitive buyer base

**Assume-BUS-004**: Sustainable Business Model
- Seller subscription tiers (Free/Pro/Premium) primary revenue
- Per-post fees (Free tier) secondary revenue
- Platform commission on transactions (potential future)
- Advertising placement (optional, not core revenue)
- Assume 30% of sellers upgrade to paid plans eventually

**Assume-BUS-005**: Peer-to-Peer Trust
- Ratings system sufficient for trust building (no formal verification)
- Assume users behave honestly in post-transaction ratings
- Dispute resolution handled offline (outside platform scope)

#### Technical Assumptions

**Assume-TECH-001**: Supabase Availability
- Supabase services (database, auth, functions, storage) remain 99.5%+ available
- No catastrophic Supabase outage expected
- Supabase pricing remains in affordable range for 100K+ users

**Assume-TECH-002**: Third-Party Services Reliability
- SePay payment gateway remains operational (99.9% uptime SLA)
- Google Gemini API availability for AI chat (99% uptime)
- Vietnam Provinces API availability (99.5% uptime)
- All integrations provide webhook delivery guarantees

**Assume-TECH-003**: Browser Compatibility
- Target browsers (Chrome, Firefox, Safari, Edge) maintain modern standards
- No legacy browser support (IE 11 not supported)
- JavaScript enabled in all target browsers
- LocalStorage available (4-5MB minimum)

**Assume-TECH-004**: Image Upload Infrastructure
- Image CDN available with responsive image serving
- Max image size 10MB per file (user constraint)
- Total images per item: 5 (system constraint)
- Image processing and thumbnail generation handled by CDN

**Assume-TECH-005**: Network Connectivity
- Minimum 2 Mbps connection sufficient for platform
- 3G network performance acceptable (FCP ≤ 2.5s)
- WebSocket support available for real-time features
- No requirement for offline-first architecture (online-first)

#### User Behavior Assumptions

**Assume-USER-001**: User Growth Rate
- Assume 25% month-over-month user growth (conservative estimate)
- Assume 20% of users are active sellers
- Assume 80% of users are active buyers
- Average user session: 30 minutes

**Assume-USER-002**: Transaction Volume
- Average buyer makes 2-3 purchases per month
- Average seller creates 3-5 listings per month
- Average item shelf life: 30 days before sold or delisted

**Assume-USER-003**: Return Rate
- Assume 60% of users return within 30 days (retention)
- Assume 40% churn after first purchase (no repeat)
- Assume 10% of users become regular repeat customers

**Assume-USER-004**: Mobile Usage
- Assume 60% of traffic from mobile (handset or tablet)
- Assume 40% desktop traffic
- Mobile-first responsive design is critical
- Touch-friendly UI components mandatory

### 6.2 Dependencies

#### External Dependencies

**Dep-EXT-001**: Supabase Platform
- **Dependency**: Database, authentication, real-time, serverless functions
- **Impact**: If Supabase unavailable, entire platform offline
- **Mitigation**: Choose Supabase for high SLA commitment; consider backups
- **Contingency**: 4-hour manual disaster recovery process

**Dep-EXT-002**: SePay Payment Gateway
- **Dependency**: Payment processing, wallet deposits, webhook notifications
- **Impact**: If SePay unavailable, transactions cannot be processed; user wallets cannot be funded
- **Mitigation**: Implement payment queue + retry mechanism; timeout handling
- **Contingency**: Manual refund process for failed transactions

**Dep-EXT-003**: Google Gemini 2.5 Flash API
- **Dependency**: Natural language processing for AI chat
- **Impact**: If API unavailable, AI chat feature disabled gracefully
- **Mitigation**: Fallback to traditional search when AI unavailable
- **Contingency**: Disable AI chat feature; direct users to manual search

**Dep-EXT-004**: Vietnam Provinces API (open-api.vn)
- **Dependency**: Geographic hierarchy data (provinces, districts, wards)
- **Impact**: If API unavailable, location filtering broken; item posting challenging
- **Mitigation**: Cache province/district/ward data on frontend (sync daily)
- **Contingency**: Use bundled geographic data if API unavailable

**Dep-EXT-005**: OAuth Google API
- **Dependency**: Google authentication (sign in with Google)
- **Impact**: If unavailable, OAuth sign-in fails; email/password still works
- **Mitigation**: Maintain email/password as primary auth method
- **Contingency**: Google OAuth optional feature; email required

#### Internal Dependencies

**Dep-INT-001**: Database Migrations
- **Dependency**: All database schema changes versioned and automated
- **Impact**: Deployment coordination required; rollback capability needed
- **Mitigation**: Test migrations in staging environment before production
- **Contingency**: Database versioning allows rollback to previous schema

**Dep-INT-002**: JWT Secret Key
- **Dependency**: Secure key generation and storage for session tokens
- **Impact**: Compromise of key compromises all user sessions
- **Mitigation**: Rotate keys annually; store in secure vault (Supabase secrets)
- **Contingency**: Emergency key rotation without full system reset

**Dep-INT-003**: Environment Configuration
- **Dependency**: API keys, secrets, configuration files
- **Impact**: Missing or incorrect configuration prevents deployment
- **Mitigation**: Documented configuration checklist; automation scripts
- **Contingency**: Configuration validation at startup; clear error messages

#### Stakeholder Dependencies

**Dep-STAKE-001**: Seller Adoption
- **Dependency**: Sufficient sellers posting items to attract buyers
- **Impact**: If sellers don't list items, platform has no inventory; buyers won't return
- **Mitigation**: Seller onboarding process; free tier posting allowance
- **Contingency**: Seed platform with admin-curated listings; recruitment campaigns

**Dep-STAKE-002**: Buyer Adoption
- **Dependency**: Sufficient buyers purchasing to create seller incentive
- **Impact**: If buyers don't purchase, sellers won't continue listing
- **Mitigation**: Marketing campaigns; referral incentives; featured listings
- **Contingency**: Partner with campus organizations; cross-promotion

**Dep-STAKE-003**: University Support
- **Dependency**: University recognition and student trust
- **Impact**: Without university support, platform seen as non-affiliated; lower trust
- **Mitigation**: University partnerships; student organization endorsements
- **Contingency**: Grassroots marketing; word-of-mouth growth

---

## Document Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Project Manager | [TBD] | [Approved] | [Date] |
| Technical Lead | [TBD] | [Approved] | [Date] |
| Quality Assurance | [TBD] | [Approved] | [Date] |
| Product Owner | [TBD] | [Approved] | [Date] |

---

## Document Change History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | May 10, 2026 | Development Team | Initial SRS document creation |

---

**End of Software Requirements Specification**

*This document is confidential and intended for authorized project team members only.*
