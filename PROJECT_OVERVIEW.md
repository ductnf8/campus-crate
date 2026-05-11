# Student Thrift Hub - Project Overview

## 1. Project Description

**Student Thrift Hub** is a modern peer-to-peer marketplace platform designed specifically for students to buy and sell used items. The application provides a complete e-commerce solution with advanced filtering, user authentication, payment processing, and seller management capabilities.

### Purpose
Enable students to participate in a sustainable, community-driven marketplace where they can easily discover, list, and transact used items within their geographic location and academic community.

---

## 2. Core Features

### User Features
- **Browse & Search**: Discover items with advanced filtering by category, location, price range, and geographic area (district/ward)
- **Favorites**: Save favorite items for later reference
- **Shopping Cart & Checkout**: Full e-commerce workflow with secure checkout
- **User Profiles**: Personalized seller profiles with ratings and transaction history
- **Ratings & Reviews**: Rate sellers and view user reputation
- **AI Chat Widget**: AI-powered customer support and assistance
- **University Verification**: Integration with university database for community trust

### Seller Features
- **Post Items**: List new items for sale with images and detailed descriptions
- **Edit Items**: Modify existing listings
- **Seller Dashboard**: Manage inventory and view orders
- **Seller Profile**: Showcase sales history and ratings
- **Order Management**: Track and manage incoming purchase orders

### Admin Features
- **Admin Panel**: Comprehensive administrative controls
- **User Management**: Oversee user accounts and roles
- **Content Moderation**: Manage listings and user-generated content
- **Analytics**: View platform statistics and metrics

### Payment & Transactions
- **SePay Integration**: Integrated payment gateway for secure transactions
- **Transaction History**: Track all payment records
- **Deposit Management**: User wallet/deposit system
- **User Upgrade**: Premium account features

---

## 3. Technology Stack

### Frontend

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | React | 18.3.1 |
| **Language** | TypeScript | - |
| **Build Tool** | Vite | - |
| **Routing** | React Router | 6.30.1 |
| **State Management** | TanStack React Query | 5.83.0 |
| **Styling** | Tailwind CSS | - |
| **UI Components** | shadcn/ui (Radix UI) | - |
| **Form Handling** | React Hook Form | 7.61.1 |
| **Validation** | Zod | 3.25.76 |
| **Animations** | Framer Motion | 11 |
| **Icons** | Lucide React | 0.462.0 |
| **Charts** | Recharts | 2.15.4 |
| **Notifications** | Sonner | 1.7.4 |
| **Testing** | Vitest, Playwright | Latest |

### Backend

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Database** | PostgreSQL | Primary data store via Supabase |
| **Auth** | Supabase Auth | OAuth-based user authentication |
| **Client SDK** | @supabase/supabase-js | 2.101.1 - Database & realtime access |
| **Cloud Functions** | Supabase Edge Functions | Serverless backend logic |
| **ORM/Queries** | Supabase JS Client | SQL query execution |

### Infrastructure & DevOps

| Component | Technology |
|-----------|-----------|
| **Database Hosting** | Supabase Cloud |
| **Authentication** | Supabase Auth + Lovable Cloud Auth |
| **Package Manager** | Bun |
| **Version Control** | Git |
| **Code Quality** | ESLint |
| **CSS Processing** | PostCSS, Tailwind |

---

## 4. Project Structure

```
student-thrift-hub/
├── public/                          # Static assets
│   └── robots.txt
├── src/
│   ├── App.tsx                      # Main application component
│   ├── main.tsx                     # Application entry point
│   ├── vite-env.d.ts                # Vite environment types
│   ├── App.css                      # Global styles
│   ├── index.css                    # Base styles
│   │
│   ├── assets/                      # Images, fonts, media
│   │
│   ├── components/                  # Reusable React components
│   │   ├── AdBanner.tsx             # Advertisement banner
│   │   ├── AIChatWidget.tsx         # AI chat interface
│   │   ├── CategoryChips.tsx        # Category filter UI
│   │   ├── FilterPanel.tsx          # Advanced filters
│   │   ├── HeroSection.tsx          # Landing hero banner
│   │   ├── ProductCard.tsx          # Item listing card
│   │   ├── ProductCardSkeleton.tsx  # Loading skeleton
│   │   ├── SearchBar.tsx            # Search interface
│   │   ├── SuggestedProducts.tsx    # Product suggestions
│   │   ├── UniversityInput.tsx      # University selector
│   │   ├── layout/
│   │   │   ├── Navbar.tsx           # Navigation bar
│   │   │   └── Footer.tsx           # Footer component
│   │   └── ui/                      # shadcn/ui components
│   │       ├── accordion.tsx
│   │       ├── alert-dialog.tsx
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── calendar.tsx
│   │       └── ... (40+ UI components)
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── use-mobile.tsx           # Mobile detection hook
│   │   ├── use-toast.ts             # Toast notifications
│   │   ├── useAuth.tsx              # Authentication context
│   │   ├── useLastRoute.ts          # Route history tracking
│   │   └── useLocationPicker.ts     # Location selection logic
│   │
│   ├── integrations/                # External service integrations
│   │   ├── lovable/                 # Lovable platform integration
│   │   └── supabase/                # Supabase client setup
│   │
│   ├── lib/                         # Utilities and constants
│   │   ├── constants.ts             # App constants
│   │   ├── universities.ts          # University database
│   │   └── utils.ts                 # Helper functions
│   │
│   ├── pages/                       # Page components (routes)
│   │   ├── Admin.tsx                # Admin dashboard
│   │   ├── Auth.tsx                 # Login/signup page
│   │   ├── Cart.tsx                 # Shopping cart
│   │   ├── Checkout.tsx             # Payment checkout
│   │   ├── Deposit.tsx              # Wallet/deposit management
│   │   ├── EditItem.tsx             # Edit product listing
│   │   ├── Favorites.tsx            # Saved favorites
│   │   ├── Index.tsx                # Homepage/browse items
│   │   ├── ItemDetail.tsx           # Product detail page
│   │   ├── MyPurchases.tsx          # Purchase history
│   │   ├── NotFound.tsx             # 404 page
│   │   ├── PostItem.tsx             # Create new listing
│   │   ├── Profile.tsx              # User profile
│   │   ├── SellerOrders.tsx         # Seller order management
│   │   ├── SellerProfile.tsx        # Seller public profile
│   │   └── Upgrade.tsx              # Account upgrade page
│   │
│   └── test/                        # Test configuration
│       ├── example.test.ts          # Example tests
│       └── setup.ts                 # Vitest setup
│
├── supabase/                        # Backend & database
│   ├── config.toml                  # Supabase configuration
│   ├── functions/
│   │   ├── ai-chat/                 # AI chat edge function
│   │   ├── seed-data/               # Database seeding function
│   │   └── sepay-webhook/           # Payment webhook handler
│   └── migrations/                  # Database schema versions
│       ├── 20260402110657_*.sql     # Initial schema
│       ├── 20260413020052_*.sql     # Orders & shipping
│       ├── 20260415043649_*.sql     # Addresses schema
│       ├── 20260419132638_*.sql     # Transaction history
│       ├── 20260504084918_*.sql     # Transactions table
│       ├── 20260505045914_*.sql     # User profiles update
│       ├── 20260505050003_*.sql     # Items enhancements
│       ├── 20260505050031_*.sql     # Ratings & reviews
│       ├── 20260506050853_*.sql     # Ad system
│       ├── 20260507081322_*.sql     # Role-based access
│       ├── 20260507081352_*.sql     # Additional refinements
│       └── 20260510120000_*.sql     # Item address details
│
├── Configuration Files
│   ├── package.json                 # Dependencies & scripts
│   ├── tsconfig.json                # TypeScript config
│   ├── tsconfig.app.json            # App-specific TS config
│   ├── tsconfig.node.json           # Node-specific TS config
│   ├── vite.config.ts               # Vite build config
│   ├── vitest.config.ts             # Test runner config
│   ├── tailwind.config.ts            # Tailwind styling config
│   ├── postcss.config.js            # CSS processing config
│   ├── eslint.config.js             # Code quality rules
│   ├── components.json              # shadcn/ui config
│   ├── playwright.config.ts         # E2E test config
│   ├── playwright-fixture.ts        # Test fixtures
│   └── supabase/config.toml         # Supabase config
│
├── Documentation
│   ├── README.md                    # Project readme
│   ├── PROJECT_OVERVIEW.md          # This file
│   └── .github/
│       └── copilot-instructions.md  # AI assistant guidelines
│
├── Environment & Build
│   ├── index.html                   # HTML entry point
│   ├── bun.lockb                    # Dependency lock file (Bun)
│   ├── OAuth client.json            # OAuth credentials
│   └── vite-env.d.ts                # Vite environment types
```

---

## 5. Database Schema

### Core Tables

#### `profiles`
Stores user account information and metadata.
- `id` (UUID, Primary Key)
- `username` (Text)
- `full_name` (Text)
- `avatar_url` (Text/URL)
- `university` (Text)
- `email` (Text)
- `created_at` (Timestamp)

#### `items`
Product listings with location and market data.
- `id` (UUID, Primary Key)
- `seller_id` (UUID, Foreign Key → profiles)
- `title` (Text)
- `description` (Text)
- `price` (Decimal)
- `image_url` (Text/URL)
- `category` (Text)
- `status` (Enum: active, sold, removed)
- `location` (Text)
- `district` (Text) - Vietnamese district
- `ward` (Text) - Vietnamese ward
- `quantity` (Integer)
- `views_count` (Integer)
- `is_featured` (Boolean)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

#### `favorites`
User favorite items tracking.
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → profiles)
- `item_id` (UUID, Foreign Key → items)
- `created_at` (Timestamp)

#### `orders`
Purchase orders with status tracking.
- `id` (UUID, Primary Key)
- `buyer_id` (UUID, Foreign Key → profiles)
- `seller_id` (UUID, Foreign Key → profiles)
- `item_id` (UUID, Foreign Key → items)
- `quantity` (Integer)
- `total_price` (Decimal)
- `status` (Enum: pending, confirmed, shipped, delivered, cancelled)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

#### `shipping_addresses`
Delivery address information.
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → profiles)
- `street_address` (Text)
- `district` (Text)
- `ward` (Text)
- `phone` (Text)
- `is_default` (Boolean)
- `created_at` (Timestamp)

#### `transactions`
Payment transaction records.
- `id` (UUID, Primary Key)
- `order_id` (UUID, Foreign Key → orders)
- `user_id` (UUID, Foreign Key → profiles)
- `amount` (Decimal)
- `currency` (Text)
- `status` (Enum: completed, pending, failed)
- `payment_method` (Text)
- `payment_id` (Text) - SePay transaction ID
- `created_at` (Timestamp)

#### `ratings`
User and seller ratings/reviews.
- `id` (UUID, Primary Key)
- `order_id` (UUID, Foreign Key → orders)
- `rater_id` (UUID, Foreign Key → profiles)
- `rated_user_id` (UUID, Foreign Key → profiles)
- `rating` (Integer: 1-5)
- `comment` (Text)
- `created_at` (Timestamp)

#### `ads`
Advertisement placements and campaigns.
- `id` (UUID, Primary Key)
- `seller_id` (UUID, Foreign Key → profiles)
- `item_id` (UUID, Foreign Key → items)
- `is_active` (Boolean)
- `created_at` (Timestamp)
- `expires_at` (Timestamp)

#### `user_roles`
Role-based access control for users.
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → profiles)
- `role` (Enum: user, seller, admin, moderator)
- `created_at` (Timestamp)

---

## 6. Key Integrations

### Supabase
- **Database**: PostgreSQL for persistent data storage
- **Authentication**: OAuth-based user authentication system
- **Real-time**: Supabase Realtime for live data updates
- **Edge Functions**: Serverless backend functions deployed globally
  - `ai-chat`: AI conversation handler
  - `seed-data`: Database initialization utility
  - `sepay-webhook`: Payment webhook processor

### SePay
- Payment gateway integration for transaction processing
- Webhook handlers for payment status updates

### Lovable Cloud Auth
- OAuth client authentication
- User credential management

### AI Chat Widget
- Powered by Supabase Edge Functions
- Provides real-time customer support and product recommendations

---

## 7. Application Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | Index | Homepage - browse all items |
| `/auth` | Auth | Login/signup page |
| `/item/:id` | ItemDetail | View single product details |
| `/post` | PostItem | Create new listing |
| `/edit/:id` | EditItem | Modify existing listing |
| `/profile` | Profile | User account profile |
| `/favorites` | Favorites | View saved favorite items |
| `/cart` | Cart | Shopping cart display |
| `/checkout/:id` | Checkout | Payment/order confirmation |
| `/seller/:id` | SellerProfile | View seller's public profile |
| `/seller-orders` | SellerOrders | Seller's order management |
| `/upgrade` | Upgrade | Account upgrade/premium features |
| `/deposit` | Deposit | Wallet management |
| `/my-purchases` | MyPurchases | Purchase history |
| `/admin` | Admin | Admin dashboard |
| `*` | NotFound | 404 page |

---

## 8. Development Workflow

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Build with development mode
npm run build:dev

# Code quality check
npm run lint

# Preview production build
npm run preview

# Run tests
npm run test

# Watch tests
npm run test:watch
```

### Development Setup
1. Install dependencies: `bun install`
2. Start Supabase: `supabase start`
3. Configure environment variables (OAuth credentials, API keys)
4. Run development server: `npm run dev`
5. Access application at `http://localhost:5173`

### Database Migrations
Database schema is version-controlled via migration files in `supabase/migrations/`. Migrations are automatically applied when deploying to Supabase.

---

## 9. Authentication Flow

1. User navigates to `/auth` page
2. OAuth login via Lovable Cloud Auth
3. Supabase validates credentials
4. User profile created/fetched from `profiles` table
5. Authentication context (`useAuth` hook) provides user state
6. Protected routes check `user` object before rendering

---

## 10. Shopping Flow

1. **Browse**: User searches/filters items on homepage
2. **View**: Click product card to view item details
3. **Add to Cart**: Select item and confirm quantity
4. **Review Cart**: View items in shopping cart
5. **Checkout**: Enter shipping address and payment info
6. **Payment**: Process transaction via SePay gateway
7. **Confirmation**: Order created and notification sent
8. **Tracking**: Order visible in "My Purchases"

---

## 11. Seller Features Flow

1. **Authentication**: Seller must be logged in
2. **Post Item**: Fill form with item details, upload images
3. **Listing Created**: Item appears in marketplace
4. **Manage**: Edit or remove listings as needed
5. **Orders Received**: View incoming purchase orders
6. **Fulfill Orders**: Update order status (confirmed, shipped, delivered)
7. **Ratings**: Receive ratings from buyers

---

## 12. Code Quality & Testing

### Linting
- ESLint with TypeScript support
- Configuration in `eslint.config.js`
- Run: `npm run lint`

### Testing
- **Unit/Integration**: Vitest framework
- **E2E Testing**: Playwright
- Test fixtures in `playwright-fixture.ts`
- Example tests in `src/test/`

### Type Safety
- Full TypeScript implementation
- Strict type checking
- Zod schema validation for forms

---

## 13. Performance Optimizations

- **Code Splitting**: Route-based code splitting via React Router
- **Image Optimization**: Lazy loading for product images
- **Caching**: TanStack React Query for smart data caching
- **Bundle Size**: Tree-shaking and minification via Vite
- **Animations**: GPU-accelerated animations with Framer Motion

---

## 14. Security Considerations

- **Authentication**: OAuth 2.0 via Supabase Auth
- **Database Security**: Row-level security (RLS) policies
- **HTTPS**: All connections encrypted in transit
- **Form Validation**: Client-side with Zod, server-side with Supabase
- **Payment Security**: Tokenized transactions via SePay
- **User Input**: Sanitization and XSS prevention

---

## 15. Deployment

### Frontend
- Built with Vite for optimal bundle size
- Deployed to cloud hosting (Supabase recommended)
- Environment configuration via `.env` files

### Backend
- Supabase handles database and Edge Functions deployment
- Migrations automatically applied on push
- Serverless functions scale automatically

### Environment Variables
Required configuration:
- Supabase URL and API keys
- OAuth client ID and secret
- SePay API credentials
- Feature flags

---

## 16. Future Enhancements

Potential areas for growth:
- Mobile app using React Native
- Advanced recommendation engine
- Seller analytics dashboard
- Multi-language support
- Shipping integration with logistics partners
- Advanced search with AI-powered suggestions
- Community forums and discussion boards
- Item categorization improvements
- Automated item expiration policies

---

## 17. Contributing Guidelines

- Follow TypeScript strict mode
- Use provided ESLint configuration
- Write tests for new features
- Use semantic commits
- Document complex logic
- Follow existing code patterns

---

## 18. Support & Resources

- **Documentation**: See README.md
- **Database**: Supabase dashboard
- **Monitoring**: Analytics via Supabase
- **Issue Tracking**: GitHub Issues
- **Contact**: Project maintainers

---

*Last Updated: May 10, 2026*
