# Database Design Document
**Student Thrift Hub - Peer-to-Peer Student Marketplace**

**Document Version:** 1.0  
**Date:** May 11, 2026  
**Database Platform:** PostgreSQL 14.5 on Supabase  
**Status:** Active Development

---

## Table of Contents

1. [Database Overview](#database-overview)
2. [Entity Relationship Diagram](#entity-relationship-diagram)
3. [Core Tables](#core-tables)
4. [Table Definitions with Constraints](#table-definitions-with-constraints)
5. [Relationships Between Tables](#relationships-between-tables)
6. [Database Functions](#database-functions)
7. [Indexing Strategy](#indexing-strategy)
8. [Row-Level Security (RLS) Policies](#row-level-security-rls-policies)
9. [Backup & Recovery Strategy](#backup--recovery-strategy)
10. [Scaling Strategy](#scaling-strategy)
11. [Performance Optimization](#performance-optimization)
12. [Data Migration & Maintenance](#data-migration--maintenance)

---

## Database Overview

### Database Architecture

```
Student Thrift Hub Database
├── Public Schema (Default)
│   ├── Tables (9 main tables)
│   ├── Functions (4 custom functions)
│   ├── Enums (1: app_role)
│   └── Policies (Row-Level Security)
├── Storage Buckets
│   └── items/ (Product images, media)
├── Real-time Subscriptions
│   └── WebSocket listeners for table changes
└── Backup System
    └── Automated daily backups + Point-in-time recovery
```

### Key Characteristics

| Aspect | Details |
|--------|---------|
| **Platform** | PostgreSQL 14.5 on Supabase |
| **Schema** | Single public schema |
| **Tables** | 9 core tables + system tables |
| **Total Estimated Rows** | 1M+ (at scale) |
| **Concurrent Connections** | 100+ (with connection pooling) |
| **Backup Frequency** | Daily automated backups |
| **Recovery Point Objective (RPO)** | < 24 hours |
| **Recovery Time Objective (RTO)** | 1-4 hours |
| **Replication** | Read replicas available |
| **Encryption** | TLS in transit, AES-256 at rest |

### Data Classifications

```
HOT (Active, frequently accessed):
  - items (active listings)
  - orders (current transactions)
  - profiles (user info)
  - transactions (recent payments)

WARM (Semi-active, accessed sometimes):
  - ratings (historical reviews)
  - favorites (user preferences)
  - shipping_addresses (saved addresses)

COLD (Archive, rarely accessed):
  - ads (past advertisements)
  - user_roles (historical roles)
  - Archived items/orders (soft-deleted)
```

---

## Entity Relationship Diagram

```mermaid
erDiagram
    PROFILES ||--o{ ITEMS : "posts"
    PROFILES ||--o{ ORDERS : "places_as_buyer"
    PROFILES ||--o{ ORDERS : "sells_as_seller"
    PROFILES ||--o{ RATINGS : "receives"
    PROFILES ||--o{ RATINGS : "gives"
    PROFILES ||--o{ FAVORITES : "saves"
    PROFILES ||--o{ TRANSACTIONS : "makes"
    PROFILES ||--o{ SHIPPING_ADDRESSES : "owns"
    PROFILES ||--o{ USER_ROLES : "has"
    ITEMS ||--o{ ORDERS : "ordered"
    ITEMS ||--o{ RATINGS : "rated"
    ITEMS ||--o{ FAVORITES : "saved"
    ORDERS ||--o{ SHIPPING_ADDRESSES : "uses"
    ORDERS ||--o{ TRANSACTIONS : "contains"
    ADS ||--o{ PROFILES : "displays_to"

    PROFILES {
        uuid id PK
        string email UK
        string name
        string phone
        string university
        string avatar_url
        string bio
        decimal balance "user's wallet"
        timestamp created_at
        timestamp updated_at
    }

    ITEMS {
        uuid id PK
        uuid user_id FK "seller"
        string title
        string description
        decimal price
        string category
        string location
        string district
        string ward
        string address_detail
        string status "active|sold|archived"
        int quantity
        string image_url
        int views_count
        boolean is_featured
        timestamp created_at
        timestamp updated_at
    }

    ORDERS {
        uuid id PK
        uuid buyer_id FK
        uuid seller_id FK
        uuid item_id FK
        int quantity
        decimal total_price
        string payment_method
        string delivery_method
        string status "pending|confirmed|shipped|delivered|cancelled"
        string recipient_name
        string recipient_phone
        string recipient_address
        string message
        uuid shipping_address_id FK
        timestamp shipped_at
        timestamp created_at
        timestamp updated_at
    }

    RATINGS {
        uuid id PK
        uuid seller_id FK
        uuid user_id FK "rater"
        int rating "1-5"
        string comment
        timestamp created_at
    }

    TRANSACTIONS {
        uuid id PK
        uuid user_id FK
        decimal amount
        string type "deposit|withdrawal|refund"
        string status "pending|success|failed"
        string payment_method "bank_transfer|card|wallet"
        string transaction_code
        string reference_code "NAPTIEN<user8chars>"
        string bank_brand
        string description
        json raw_webhook "SePay webhook data"
        timestamp created_at
        timestamp updated_at
    }

    FAVORITES {
        uuid id PK
        uuid user_id FK
        uuid item_id FK
        timestamp created_at
        unique "user_id,item_id"
    }

    SHIPPING_ADDRESSES {
        uuid id PK
        uuid user_id FK
        string recipient_name
        string phone
        string address
        boolean is_default
        timestamp created_at
        timestamp updated_at
    }

    USER_ROLES {
        uuid id PK
        uuid user_id FK
        string role "admin|moderator|user"
        timestamp created_at
    }

    ADS {
        uuid id PK
        string title
        string image_url
        string link
        string position "header|sidebar|footer"
        boolean is_active
        timestamp created_at
    }
```

---

## Core Tables

### Summary

| Table | Purpose | Rows (Est.) | Growth Rate |
|-------|---------|-------------|-------------|
| **profiles** | User accounts, authentication | 50K | 100/day |
| **items** | Product listings | 500K | 1K/day |
| **orders** | Purchase transactions | 200K | 500/day |
| **transactions** | Payment records | 250K | 600/day |
| **ratings** | Seller reviews | 100K | 200/day |
| **favorites** | Saved items | 300K | 300/day |
| **shipping_addresses** | Delivery addresses | 75K | 150/day |
| **user_roles** | Role assignments | 1K | 10/day |
| **ads** | Advertisements | 500 | 5/day |

---

## Table Definitions with Constraints

### 1. PROFILES Table

**Purpose**: Core user account information and wallet balance

```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    phone VARCHAR(20),
    university VARCHAR(255),
    avatar_url TEXT,
    bio TEXT,
    balance NUMERIC(15,2) DEFAULT 0.00 CHECK (balance >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT | Unique user identifier |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Email for authentication |
| `name` | VARCHAR(255) | NOT NULL | User's full name |
| `phone` | VARCHAR(20) | - | Contact phone number |
| `university` | VARCHAR(255) | - | University affiliation |
| `avatar_url` | TEXT | - | Profile picture URL |
| `bio` | TEXT | - | User biography |
| `balance` | NUMERIC(15,2) | CHECK (≥0) | Wallet balance in VND |
| `created_at` | TIMESTAMP | DEFAULT NOW | Account creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW | Last update timestamp |

**Constraints**:
- `UNIQUE(email)` - One account per email
- `CHECK(balance >= 0)` - No negative balance
- `NOT NULL` - email, name required

---

### 2. ITEMS Table

**Purpose**: Product listings and inventory management

```sql
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(12,0) NOT NULL CHECK (price > 0),
    category VARCHAR(50),
    location VARCHAR(100),
    district VARCHAR(100),
    ward VARCHAR(100),
    address_detail TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'sold', 'archived')),
    quantity INT DEFAULT 1 CHECK (quantity >= 0),
    image_url TEXT,
    views_count INT DEFAULT 0 CHECK (views_count >= 0),
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| `id` | UUID | PRIMARY KEY | Unique item identifier |
| `user_id` | UUID | FK → profiles.id | Item seller |
| `title` | VARCHAR(255) | NOT NULL | Product name |
| `description` | TEXT | - | Product details |
| `price` | NUMERIC(12,0) | NOT NULL, > 0 | Price in VND (whole numbers) |
| `category` | VARCHAR(50) | - | Product category |
| `location` | VARCHAR(100) | - | Province/city |
| `district` | VARCHAR(100) | - | District name |
| `ward` | VARCHAR(100) | - | Ward/commune name |
| `address_detail` | TEXT | - | Specific address |
| `status` | VARCHAR(20) | CHECK IN (...) | active, sold, archived |
| `quantity` | INT | ≥ 0 | Stock quantity |
| `image_url` | TEXT | - | Product image URL |
| `views_count` | INT | ≥ 0 | View counter |
| `is_featured` | BOOLEAN | DEFAULT FALSE | Featured listing flag |
| `created_at` | TIMESTAMP | DEFAULT NOW | Creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW | Last update timestamp |

**Constraints**:
- `NOT NULL` - title, user_id, price required
- `CHECK(price > 0)` - Price must be positive
- `CHECK(quantity >= 0)` - Non-negative quantity
- `CHECK(status IN (...))` - Valid status values
- `FK` - user_id references profiles with CASCADE delete

---

### 3. ORDERS Table

**Purpose**: Purchase transactions and order management

```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    total_price NUMERIC(12,0) NOT NULL CHECK (total_price > 0),
    payment_method VARCHAR(50),
    delivery_method VARCHAR(50),
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    recipient_name VARCHAR(255) NOT NULL,
    recipient_phone VARCHAR(20) NOT NULL,
    recipient_address TEXT NOT NULL,
    message TEXT,
    shipping_address_id UUID REFERENCES shipping_addresses(id),
    shipped_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_quantity CHECK (quantity > 0),
    CONSTRAINT valid_price CHECK (total_price > 0)
);
```

| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| `id` | UUID | PRIMARY KEY | Unique order identifier |
| `buyer_id` | UUID | FK → profiles.id | Buyer user |
| `seller_id` | UUID | FK → profiles.id | Seller user |
| `item_id` | UUID | FK → items.id | Product ordered |
| `quantity` | INT | > 0 | Quantity ordered |
| `total_price` | NUMERIC(12,0) | > 0 | Total order amount |
| `payment_method` | VARCHAR(50) | - | sepay, card, wallet, etc. |
| `delivery_method` | VARCHAR(50) | - | express, standard |
| `status` | VARCHAR(30) | CHECK IN (...) | Order status |
| `recipient_name` | VARCHAR(255) | NOT NULL | Delivery recipient |
| `recipient_phone` | VARCHAR(20) | NOT NULL | Contact number |
| `recipient_address` | TEXT | NOT NULL | Delivery address |
| `message` | TEXT | - | Order notes |
| `shipping_address_id` | UUID | FK → shipping_addresses.id | Saved address |
| `shipped_at` | TIMESTAMP | - | Shipment timestamp |
| `created_at` | TIMESTAMP | DEFAULT NOW | Creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW | Update timestamp |

**Status Flow**:
```
pending → confirmed → processing → shipped → delivered
                                                ↓
                                           (refund possible)
```

---

### 4. TRANSACTIONS Table

**Purpose**: Payment and wallet transaction history

```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    amount NUMERIC(12,0) NOT NULL CHECK (amount > 0),
    type VARCHAR(20) CHECK (type IN ('deposit', 'withdrawal', 'refund', 'payment')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
    payment_method VARCHAR(50),
    transaction_code VARCHAR(100) UNIQUE,
    reference_code VARCHAR(100) UNIQUE,
    bank_brand VARCHAR(50),
    description TEXT,
    raw_webhook JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| `id` | UUID | PRIMARY KEY | Unique transaction ID |
| `user_id` | UUID | FK → profiles.id | User account |
| `amount` | NUMERIC(12,0) | > 0 | Transaction amount |
| `type` | VARCHAR(20) | CHECK IN (...) | deposit, withdrawal, refund |
| `status` | VARCHAR(20) | CHECK IN (...) | pending, success, failed |
| `payment_method` | VARCHAR(50) | - | bank_transfer, card, wallet |
| `transaction_code` | VARCHAR(100) | UNIQUE | SePay transaction ID |
| `reference_code` | VARCHAR(100) | UNIQUE | NAPTIEN<user8chars> |
| `bank_brand` | VARCHAR(50) | - | VCB, VPB, TCB, etc. |
| `description` | TEXT | - | Transaction description |
| `raw_webhook` | JSONB | - | Full webhook payload |
| `created_at` | TIMESTAMP | DEFAULT NOW | Creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW | Update timestamp |

**Reference Code Format**: `NAPTIEN<first8chars_of_user_id>`
- Example: `NAPTIEN550e8400` for user `550e8400-e29b-41d4-...`

---

### 5. RATINGS Table

**Purpose**: Seller reviews and reputation system

```sql
CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT no_self_rating CHECK (seller_id != user_id),
    UNIQUE(seller_id, user_id)
);
```

| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| `id` | UUID | PRIMARY KEY | Unique rating ID |
| `seller_id` | UUID | FK → profiles.id | Rated seller |
| `user_id` | UUID | FK → profiles.id | Rater/reviewer |
| `rating` | INT | 1-5 | Star rating |
| `comment` | TEXT | - | Review comment |
| `created_at` | TIMESTAMP | DEFAULT NOW | Creation timestamp |

**Constraints**:
- `CHECK(rating BETWEEN 1 AND 5)` - Valid rating range
- `CHECK(seller_id != user_id)` - Can't rate self
- `UNIQUE(seller_id, user_id)` - One rating per buyer-seller pair

---

### 6. FAVORITES Table

**Purpose**: User's saved items

```sql
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, item_id)
);
```

| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| `id` | UUID | PRIMARY KEY | Unique favorite ID |
| `user_id` | UUID | FK → profiles.id | User who favorited |
| `item_id` | UUID | FK → items.id | Favorited item |
| `created_at` | TIMESTAMP | DEFAULT NOW | Creation timestamp |

**Constraints**:
- `UNIQUE(user_id, item_id)` - One favorite per user-item pair

---

### 7. SHIPPING_ADDRESSES Table

**Purpose**: Saved shipping addresses for quick checkout

```sql
CREATE TABLE shipping_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    recipient_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| `id` | UUID | PRIMARY KEY | Unique address ID |
| `user_id` | UUID | FK → profiles.id | Address owner |
| `recipient_name` | VARCHAR(255) | NOT NULL | Recipient name |
| `phone` | VARCHAR(20) | NOT NULL | Contact phone |
| `address` | TEXT | NOT NULL | Full address |
| `is_default` | BOOLEAN | DEFAULT FALSE | Default address flag |
| `created_at` | TIMESTAMP | DEFAULT NOW | Creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW | Update timestamp |

---

### 8. USER_ROLES Table

**Purpose**: Role-based access control

```sql
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE app_role AS ENUM ('admin', 'moderator', 'user');
```

| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| `id` | UUID | PRIMARY KEY | Unique role assignment ID |
| `user_id` | UUID | FK → profiles.id | User assigned |
| `role` | app_role | ENUM | admin, moderator, user |
| `created_at` | TIMESTAMP | DEFAULT NOW | Creation timestamp |

---

### 9. ADS Table

**Purpose**: Advertisement management

```sql
CREATE TABLE ads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    image_url TEXT,
    link TEXT,
    position VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

| Column | Type | Constraint | Description |
|--------|------|-----------|-------------|
| `id` | UUID | PRIMARY KEY | Unique ad ID |
| `title` | VARCHAR(255) | NOT NULL | Ad title |
| `image_url` | TEXT | - | Ad image URL |
| `link` | TEXT | - | Ad link/CTA |
| `position` | VARCHAR(50) | - | header, sidebar, footer |
| `is_active` | BOOLEAN | DEFAULT TRUE | Active flag |
| `created_at` | TIMESTAMP | DEFAULT NOW | Creation timestamp |

---

## Relationships Between Tables

### One-to-Many Relationships

```
profiles (1) ──────→ (∞) items
  └─ A user can post many items
  └─ Foreign Key: items.user_id → profiles.id
  └─ Delete Cascade: Deleting user deletes their items

profiles (1) ──────→ (∞) orders (as buyer)
  └─ A buyer places many orders
  └─ Foreign Key: orders.buyer_id → profiles.id

profiles (1) ──────→ (∞) orders (as seller)
  └─ A seller receives many orders
  └─ Foreign Key: orders.seller_id → profiles.id

profiles (1) ──────→ (∞) transactions
  └─ A user has many transactions
  └─ Foreign Key: transactions.user_id → profiles.id

profiles (1) ──────→ (∞) ratings (as seller)
  └─ A seller receives many ratings
  └─ Foreign Key: ratings.seller_id → profiles.id

profiles (1) ──────→ (∞) ratings (as rater)
  └─ A user can give many ratings
  └─ Foreign Key: ratings.user_id → profiles.id

profiles (1) ──────→ (∞) favorites
  └─ A user can save many items
  └─ Foreign Key: favorites.user_id → profiles.id

profiles (1) ──────→ (∞) shipping_addresses
  └─ A user has many shipping addresses
  └─ Foreign Key: shipping_addresses.user_id → profiles.id

items (1) ──────→ (∞) orders
  └─ An item can be ordered multiple times (before sold)
  └─ Foreign Key: orders.item_id → items.id

items (1) ──────→ (∞) favorites
  └─ An item can be favorited by many users
  └─ Foreign Key: favorites.item_id → items.id

orders (1) ──────→ (∞) transactions
  └─ An order can have associated transactions
  └─ Implicit relationship via amounts/descriptions
```

### Many-to-Many Relationships

```
profiles ⟷ items (through favorites)
  └─ Users ⟷ Items they've saved
  └─ Table: favorites (junction table)

profiles ⟷ profiles (ratings)
  └─ Raters ⟷ Sellers they've rated
  └─ Table: ratings (self-referential)
```

### Referential Integrity

```sql
-- Cascade deletes
ALTER TABLE items ADD CONSTRAINT items_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE orders ADD CONSTRAINT orders_buyer_id_fkey
  FOREIGN KEY (buyer_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE orders ADD CONSTRAINT orders_seller_id_fkey
  FOREIGN KEY (seller_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Restrict deletes (prevent orphaning)
ALTER TABLE transactions ADD CONSTRAINT transactions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE RESTRICT;

ALTER TABLE user_roles ADD CONSTRAINT user_roles_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
```

---

## Database Functions

### 1. `increment_view_count(item_id UUID)`

**Purpose**: Atomically increment item view counter

```sql
CREATE OR REPLACE FUNCTION increment_view_count(item_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE items
  SET views_count = views_count + 1,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = item_id;
END;
$$ LANGUAGE plpgsql;
```

**Usage**:
```typescript
await supabase.rpc('increment_view_count', { item_id: 'uuid' });
```

**Benefits**:
- Atomic operation (no race conditions)
- Reduces network round-trips
- Automatically updates timestamp

---

### 2. `search_items_for_ai(_q?, _location?, _max_price?, _limit?)`

**Purpose**: Full-text search for AI chat integration

```sql
CREATE OR REPLACE FUNCTION search_items_for_ai(
  _q TEXT DEFAULT NULL,
  _location TEXT DEFAULT NULL,
  _max_price NUMERIC DEFAULT NULL,
  _limit INT DEFAULT 6
)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  description TEXT,
  price NUMERIC,
  location VARCHAR,
  district VARCHAR,
  ward VARCHAR,
  image_url TEXT,
  category VARCHAR,
  quantity INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT i.id, i.title, i.description, i.price, i.location, i.district, i.ward, i.image_url, i.category, i.quantity
  FROM items i
  WHERE i.status = 'active'
    AND i.quantity > 0
    AND (_q IS NULL OR i.title ILIKE '%' || _q || '%' OR i.description ILIKE '%' || _q || '%')
    AND (_location IS NULL OR i.location ILIKE '%' || _location || '%' OR i.district ILIKE '%' || _location || '%')
    AND (_max_price IS NULL OR i.price <= _max_price)
  ORDER BY i.views_count DESC, i.created_at DESC
  LIMIT _limit;
END;
$$ LANGUAGE plpgsql;
```

**Usage**:
```typescript
const { data, error } = await supabase.rpc('search_items_for_ai', {
  _q: 'laptop',
  _location: 'Hà Nội',
  _max_price: 20000000,
  _limit: 6
});
```

---

### 3. `has_role(_user_id UUID, _role app_role)`

**Purpose**: Check if user has specific role

```sql
CREATE OR REPLACE FUNCTION has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN AS $$
DECLARE
  user_has_role BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id AND role = _role
  ) INTO user_has_role;

  RETURN user_has_role;
END;
$$ LANGUAGE plpgsql;
```

**Usage**:
```typescript
const isAdmin = await supabase.rpc('has_role', {
  _user_id: userId,
  _role: 'admin'
});
```

---

### 4. `find_profile_by_id_prefix(_prefix TEXT)`

**Purpose**: Find user profile by ID prefix (for payment webhooks)

```sql
CREATE OR REPLACE FUNCTION find_profile_by_id_prefix(_prefix TEXT)
RETURNS TABLE (
  id UUID,
  balance NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.balance
  FROM profiles p
  WHERE p.id::TEXT LIKE _prefix || '%'
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;
```

**Usage**:
```typescript
// Extract first 8 chars of user ID from NAPTIEN<user8chars>
const codeFragment = 'ab12cd34';
const { data } = await supabase.rpc('find_profile_by_id_prefix', {
  _prefix: codeFragment
});
```

---

## Indexing Strategy

### Primary Indexes (Automatic)

All primary keys have automatic B-tree indexes:

```sql
CREATE INDEX idx_profiles_id ON profiles (id);
CREATE INDEX idx_items_id ON items (id);
CREATE INDEX idx_orders_id ON orders (id);
```

### Essential Indexes (Must Have)

```sql
-- Foreign Key Indexes
CREATE INDEX idx_items_user_id ON items (user_id);
CREATE INDEX idx_orders_buyer_id ON orders (buyer_id);
CREATE INDEX idx_orders_seller_id ON orders (seller_id);
CREATE INDEX idx_orders_item_id ON orders (item_id);
CREATE INDEX idx_ratings_seller_id ON ratings (seller_id);
CREATE INDEX idx_ratings_user_id ON ratings (user_id);
CREATE INDEX idx_favorites_user_id ON favorites (user_id);
CREATE INDEX idx_favorites_item_id ON favorites (item_id);
CREATE INDEX idx_transactions_user_id ON transactions (user_id);
CREATE INDEX idx_shipping_addresses_user_id ON shipping_addresses (user_id);

-- Search Indexes
CREATE INDEX idx_items_status ON items (status);
CREATE INDEX idx_items_category ON items (category);
CREATE INDEX idx_items_location ON items (location);
CREATE INDEX idx_items_district ON items (district);
CREATE INDEX idx_items_price ON items (price);
CREATE INDEX idx_items_created_at ON items (created_at DESC);
CREATE INDEX idx_items_is_featured ON items (is_featured) WHERE is_featured = TRUE;

-- Order Indexes
CREATE INDEX idx_orders_status ON orders (status);
CREATE INDEX idx_orders_created_at ON orders (created_at DESC);
CREATE INDEX idx_transactions_status ON transactions (status);

-- Unique/Constraint Indexes (Automatic)
CREATE UNIQUE INDEX idx_profiles_email ON profiles (email);
CREATE UNIQUE INDEX idx_transactions_transaction_code ON transactions (transaction_code);
CREATE UNIQUE INDEX idx_favorites_user_item ON favorites (user_id, item_id);
```

### Advanced Indexes (Performance)

```sql
-- Composite Indexes (for common filter combinations)
CREATE INDEX idx_items_search ON items (status, quantity, location)
  WHERE status = 'active' AND quantity > 0;

CREATE INDEX idx_items_featured_search ON items (created_at DESC, views_count DESC)
  WHERE is_featured = TRUE;

-- GiST Index for geographic searches (future)
CREATE INDEX idx_items_location_gist ON items
  USING gist (to_tsvector('vietnamese', title || ' ' || COALESCE(description, '')));

-- B-tree Index for range queries
CREATE INDEX idx_transactions_created_at ON transactions (created_at DESC)
  WHERE status = 'success';

-- Partial Index for active items only
CREATE INDEX idx_items_active ON items (user_id, created_at DESC)
  WHERE status = 'active';
```

### Index Maintenance

```sql
-- Analyze query plans
EXPLAIN ANALYZE
SELECT * FROM items
WHERE status = 'active'
  AND location ILIKE '%Hà Nội%'
  AND price BETWEEN 1000000 AND 20000000
ORDER BY created_at DESC
LIMIT 20;

-- Reindex if needed (during maintenance)
REINDEX TABLE items;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Remove unused indexes
SELECT * FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexname NOT LIKE 'pg_toast%';
```

---

## Row-Level Security (RLS) Policies

### Enable RLS

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
```

### Profile Policies

```sql
-- Users can view all public profiles
CREATE POLICY "Profiles are viewable by all" ON profiles
  FOR SELECT USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### Items Policies

```sql
-- All can view active items
CREATE POLICY "Active items are visible to all" ON items
  FOR SELECT USING (status = 'active' OR auth.uid() = user_id);

-- Users can only insert items for themselves
CREATE POLICY "Users can create own items" ON items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update own items
CREATE POLICY "Users can update own items" ON items
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete own items
CREATE POLICY "Users can delete own items" ON items
  FOR DELETE USING (auth.uid() = user_id);
```

### Orders Policies

```sql
-- Users can view their own orders (as buyer or seller)
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (
    auth.uid() = buyer_id 
    OR auth.uid() = seller_id
    OR EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- Buyers can create orders
CREATE POLICY "Buyers can create orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Sellers can update their order status
CREATE POLICY "Sellers can update own orders" ON orders
  FOR UPDATE USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);
```

### Transactions Policies

```sql
-- Users can view their own transactions
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

-- System can create transactions (via functions)
CREATE POLICY "Transactions created by system" ON transactions
  FOR INSERT WITH CHECK (true);
```

### Favorites Policies

```sql
-- Users can only manage their own favorites
CREATE POLICY "Users can manage own favorites" ON favorites
  FOR ALL USING (auth.uid() = user_id);
```

### Shipping Addresses Policies

```sql
-- Users can only manage their own addresses
CREATE POLICY "Users can manage own addresses" ON shipping_addresses
  FOR ALL USING (auth.uid() = user_id);
```

---

## Backup & Recovery Strategy

### Backup Schedule

```
Daily Backups:
├── Full Database Backup → Daily (2:00 AM UTC)
├── Transaction Log Backup → Every 5 minutes
├── Point-in-Time Recovery (PITR) → 7-30 days retention
└── Retention Policy → 30 days (automated cleanup)

Weekly Backups:
├── Full Backup → Every Sunday (1:00 AM UTC)
├── Retention → 90 days
└── Offsite Storage → AWS S3, Google Cloud Storage

Monthly Backups:
├── Full Backup → 1st of every month
├── Retention → 1 year
└── Archival Storage → Glacier, Cold Storage
```

### Backup Locations

```
Primary:    Supabase Cloud (same region)
Secondary:  AWS S3 (cross-region replicated)
Tertiary:   Google Cloud Storage (different region)
Disaster:   On-premise archive (cold storage)
```

### Recovery Procedures

**RPO & RTO Targets**:
- Recovery Point Objective (RPO): < 5 minutes
- Recovery Time Objective (RTO): < 1 hour for minor incidents, < 4 hours for major

**Recovery Levels**:

| Scenario | RPO | RTO | Procedure |
|----------|-----|-----|-----------|
| Single record corruption | 5 min | 15 min | Point-in-time restore to specific table |
| Data loss (accidental delete) | 5 min | 30 min | Database restore from backup |
| Complete database failure | 24 hours | 2-4 hours | Failover to secondary region |
| Regional outage | 24 hours | 4-6 hours | Restore from offsite backup |

### Automated Backups (Supabase)

```sql
-- Supabase automatically handles:
-- - Continuous replication
-- - Daily incremental backups
-- - Point-in-time recovery up to 7 days
-- - Automatic backup verification
-- - Cross-region replication option

-- Manual backup triggers (for critical operations):
SELECT pg_start_backup('critical-backup-' || NOW()::TEXT);
-- ... perform critical operations ...
SELECT pg_stop_backup();
```

### Restoration Test

```
Monthly Test Schedule:
├── Week 1: Test PITR (7 days ago)
├── Week 2: Test incremental restore
├── Week 3: Test full database restore
└── Week 4: Dry-run failover to secondary
```

### Data Retention Policy

```
Active Data:
├── Transactions → 7 years (tax/legal requirement)
├── Orders → 2 years (customer service)
├── Items → Until soft-delete (marked archived)
├── Profiles → Until account deletion
└── Audit logs → 1 year

Archive Data:
├── Archived items → 1 year then purge
├── Old transactions → 7 years (offline)
└── Deleted profiles → 30 days (soft-delete) then purge
```

---

## Scaling Strategy

### Vertical Scaling (Increasing Capacity)

```
Phase 1 (Current - 100K users):
├── PostgreSQL 14, 4 CPU, 16 GB RAM
├── Connection pool: 100 connections
├── Storage: 500 GB SSD
└── Suitable for MVP

Phase 2 (500K users):
├── PostgreSQL 14, 8 CPU, 32 GB RAM
├── Connection pool: 200 connections
├── Storage: 2 TB SSD
├── Read replicas: 2
└── Expected at: 6-12 months

Phase 3 (2M users):
├── PostgreSQL 14, 16 CPU, 64 GB RAM
├── Connection pool: 500 connections
├── Storage: 5 TB SSD
├── Read replicas: 4
└── Expected at: 18-24 months
```

### Horizontal Scaling (Distribution)

**Read Replicas**:
```
Master Database (Write)
    ↓
Replication Stream
    ↓
├─ Read Replica 1 (Southeast Asia)
├─ Read Replica 2 (East Asia)
└─ Read Replica 3 (South Asia)

Configuration:
- Sync replication for critical queries
- Async replication for analytics
- Automatic failover to standby
```

**Connection Pooling**:
```sql
-- PgBouncer configuration
-- Reduce connection overhead
[databases]
stumarket_db = host=db.supabase.co port=5432 dbname=postgres

[pgbouncer]
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 100
min_pool_size = 10
reserve_pool_size = 5
```

### Partitioning Strategy

```sql
-- Partition large tables by date (for faster queries)

-- Orders table (by creation date)
CREATE TABLE orders_2026_q1 PARTITION OF orders
  FOR VALUES FROM ('2026-01-01') TO ('2026-04-01');

CREATE TABLE orders_2026_q2 PARTITION OF orders
  FOR VALUES FROM ('2026-04-01') TO ('2026-07-01');

-- Benefits:
-- - Faster queries on specific date ranges
-- - Easier maintenance and archival
-- - Better index performance
-- - Parallel query execution

-- Items table (by status)
CREATE TABLE items_active PARTITION OF items
  FOR VALUES IN ('active');

CREATE TABLE items_sold PARTITION OF items
  FOR VALUES IN ('sold');

CREATE TABLE items_archived PARTITION OF items
  FOR VALUES IN ('archived');
```

### Caching Layer

```
Application Layer Cache:
├── React Query (Client-side) → 5 min TTL
├── Browser Cache → HTTP headers (1 hour)
└── CDN Cache → 1 hour for static

Database Query Cache:
├── Recently viewed items → 5 min
├── Category listings → 10 min
├── User profiles → 15 min
└── Top sellers → 1 hour
```

### Analytics & Monitoring

```sql
-- Monitor database performance
SELECT
  schemaname,
  tablename,
  seq_scan,
  seq_tup_read,
  idx_scan,
  idx_tup_fetch
FROM pg_stat_user_tables
ORDER BY seq_scan DESC
LIMIT 10;

-- Check slow queries
SELECT
  query,
  mean_time,
  calls,
  max_time
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC
LIMIT 20;

-- Monitor table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## Performance Optimization

### Query Optimization

**Bad Query** (N+1 problem):
```typescript
// Fetches 1 + N queries
const items = await supabase.from('items').select('*');
for (const item of items) {
  const seller = await supabase
    .from('profiles')
    .select('name')
    .eq('id', item.user_id)
    .single();
}
```

**Good Query** (Join):
```typescript
// Single query with join
const { data } = await supabase
  .from('items')
  .select(`
    *,
    profiles (name, avatar_url)
  `);
```

### Connection Pooling

```sql
-- Enable connection pooling in Supabase
-- This reduces connection overhead from 100ms to 10ms

Connection Pool Benefits:
├── Reduced authentication overhead
├── Faster query execution
├── Better resource utilization
└── Support for more concurrent users
```

### Vacuum & Analyze

```sql
-- Run regularly to maintain performance
VACUUM ANALYZE;

-- Aggressive vacuum for large tables
VACUUM (ANALYZE, VERBOSE) items;

-- Schedule maintenance (weekly)
-- PostgreSQL auto-vacuum handles most cases
-- Manual vacuum needed after large deletes
```

---

## Data Migration & Maintenance

### Migration Tools

```
Framework: Supabase Migrations
├── Version control for database schema
├── Reversible migrations
├── Automatic rollback on failure
└── Stored in supabase/migrations/ directory

Example Migration:
  20260511120000_create_items_table.sql
```

### Common Maintenance Tasks

```sql
-- 1. Archive old items (soft delete)
UPDATE items
SET status = 'archived'
WHERE status = 'sold'
  AND updated_at < CURRENT_DATE - INTERVAL '1 year';

-- 2. Delete old favorites
DELETE FROM favorites
WHERE created_at < CURRENT_DATE - INTERVAL '2 years';

-- 3. Cleanup abandoned carts (if tracked in transactions)
DELETE FROM transactions
WHERE status = 'pending'
  AND created_at < CURRENT_DATE - INTERVAL '1 month';

-- 4. Reindex for performance
REINDEX TABLE CONCURRENTLY items;

-- 5. Update table statistics
ANALYZE items;
```

### Monitoring & Alerting

```sql
-- Monitor database health
SELECT
  database,
  usename,
  application_name,
  state,
  query_start,
  backend_start
FROM pg_stat_activity
WHERE state != 'idle';

-- Alert thresholds:
-- - Connections > 80% of max
-- - Query duration > 30 seconds
-- - Transaction duration > 5 minutes
-- - Replication lag > 1 second
-- - Disk usage > 80% of capacity
```

### Database Statistics

```
Expected Database Size (at scale):

1M users:         150 GB
├── Profiles:     200 MB
├── Items:        50 GB
├── Orders:       30 GB
├── Transactions: 40 GB
├── Ratings:      10 GB
└── Other:        20 GB

Growth Rate:      ~100 GB/year
Compression:      ~30% with zstd
Archival:         Move to cold storage after 1 year
```

---

## Glossary

| Term | Definition |
|------|-----------|
| **ACID** | Atomicity, Consistency, Isolation, Durability |
| **FK** | Foreign Key constraint |
| **RLS** | Row-Level Security for data isolation |
| **PITR** | Point-in-Time Recovery |
| **RPO** | Recovery Point Objective (max data loss) |
| **RTO** | Recovery Time Objective (max downtime) |
| **Partitioning** | Splitting large tables by date/range |
| **Index** | Data structure for fast lookups |
| **Vacuum** | Database cleanup/maintenance operation |
| **Replication** | Data synchronization to backup databases |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | May 11, 2026 | Database Team | Initial comprehensive database design |

---

## References

- [PostgreSQL Documentation](https://www.postgresql.org/docs/14/)
- [Supabase Documentation](https://supabase.com/docs)
- [Database Design Best Practices](https://en.wikipedia.org/wiki/Database_design)
- [Row-Level Security](https://www.postgresql.org/docs/14/ddl-rowsecurity.html)
- [Index Strategies](https://www.postgresql.org/docs/14/sql-createindex.html)

---

**Document Status**: Active | **Last Updated**: May 11, 2026 | **Next Review**: June 11, 2026
