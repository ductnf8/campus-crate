# API Documentation
**Student Thrift Hub - Peer-to-Peer Student Marketplace**

**Document Version:** 1.0  
**Date:** May 11, 2026  
**Base URL:** `https://<project>.supabase.co`

---

## Table of Contents

1. [Introduction](#introduction)
2. [Authentication Methods](#authentication-methods)
3. [Base URL & Environment](#base-url--environment)
4. [API Conventions](#api-conventions)
5. [Endpoints by Module](#endpoints-by-module)
   - [Authentication](#authentication-module)
   - [Users](#users-module)
   - [Products/Items](#productsitems-module)
   - [Orders](#orders-module)
   - [Payments & Transactions](#payments--transactions-module)
   - [Favorites](#favorites-module)
   - [Ratings & Reviews](#ratings--reviews-module)
   - [AI Chat](#ai-chat-module)
   - [Admin Operations](#admin-operations-module)
   - [Webhooks](#webhooks-module)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)
8. [Pagination](#pagination)
9. [Status Codes & Responses](#status-codes--responses)

---

## Introduction

The Student Thrift Hub API provides RESTful endpoints for a peer-to-peer student marketplace platform. The API is built on **Supabase**, which offers PostgreSQL database with auto-generated REST APIs and real-time capabilities.

### Key Features

- **Real-time Updates**: WebSocket subscriptions for live data changes
- **Row-Level Security**: Database-level access control via JWT authentication
- **Serverless Functions**: Custom Edge Functions for complex operations
- **Type-Safe**: Full TypeScript support with auto-generated types
- **OAuth Integration**: Third-party authentication (Google, GitHub, etc.)

### API Access

All API requests require a valid **JWT token** obtained through authentication. The token must be included in the `Authorization` header.

---

## Authentication Methods

### 1. Supabase Auth (OAuth & Email)

**Endpoint**: `POST /auth/v1/token`

OAuth-based authentication with providers like Google, GitHub, Microsoft, and Apple.

```typescript
// OAuth Sign-In
const response = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/callback`,
  },
});
```

**Request**:
```json
{
  "provider": "google",
  "redirect_uri": "https://yourdomain.com/auth/callback"
}
```

**Response** (OAuth):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "rpt_...",
  "user": {
    "id": "user-uuid",
    "email": "student@hust.edu.vn",
    "user_metadata": {
      "name": "Nguyễn Văn Minh"
    }
  }
}
```

### 2. JWT Token Refresh

**Endpoint**: `POST /auth/v1/token?grant_type=refresh_token`

Refresh an expired access token using a refresh token.

```typescript
const { data, error } = await supabase.auth.refreshSession();
```

**Request**:
```json
{
  "grant_type": "refresh_token",
  "refresh_token": "rpt_..."
}
```

### 3. Session Management

**Endpoint**: `GET /auth/v1/user`

Get the currently authenticated user's information.

```typescript
const { data: { user } } = await supabase.auth.getUser();
```

**Response**:
```json
{
  "id": "user-uuid",
  "aud": "authenticated",
  "role": "authenticated",
  "email": "student@hust.edu.vn",
  "email_confirmed_at": "2026-05-11T10:30:00Z",
  "phone": "+84901234567",
  "confirmed_at": "2026-05-11T10:30:00Z",
  "last_sign_in_at": "2026-05-11T14:22:00Z",
  "app_metadata": {
    "provider": "google",
    "providers": ["google"]
  },
  "user_metadata": {
    "name": "Nguyễn Văn Minh",
    "university": "ĐH Bách Khoa Hà Nội"
  },
  "identities": [
    {
      "id": "student@hust.edu.vn",
      "user_id": "user-uuid",
      "identity_data": {
        "email": "student@hust.edu.vn"
      },
      "provider": "google",
      "created_at": "2026-05-11T10:30:00Z"
    }
  ],
  "created_at": "2026-05-11T10:30:00Z",
  "updated_at": "2026-05-11T14:22:00Z"
}
```

### 4. Sign Out

**Endpoint**: `POST /auth/v1/logout`

```typescript
await supabase.auth.signOut();
```

---

## Base URL & Environment

### Development
```
Base URL: http://localhost:8080 (frontend)
Supabase URL: https://<project>.supabase.co
API Endpoint: https://<project>.supabase.co/rest/v1
```

### Production
```
Base URL: https://stumarketvn.com
Supabase URL: https://<project>.supabase.co
API Endpoint: https://<project>.supabase.co/rest/v1
```

### Required Headers

All requests must include:

```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
apikey: <SUPABASE_PUBLISHABLE_KEY>
```

### Environment Variables

```env
# Frontend
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGci...

# Backend (Edge Functions)
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
SEPAY_API_KEY=<api-key>
AI_API_KEY=<google-gemini-key>
```

---

## API Conventions

### Request Format

```typescript
// Standard query request
const { data, error } = await supabase
  .from('items')
  .select('*')
  .eq('status', 'active')
  .limit(20);
```

### Response Format

All responses follow this structure:

```json
{
  "data": [...],           // Array of records or single record
  "error": null,          // Null if successful, error object if failed
  "status": 200,
  "statusText": "OK"
}
```

### Error Response Format

```json
{
  "code": "PGRST116",
  "message": "The result of the query is empty",
  "details": "Table contains no rows",
  "hint": null
}
```

---

## Endpoints by Module

---

## Authentication Module

### POST /auth/v1/token

**Description**: OAuth authentication endpoint

**Method**: `POST`

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "provider": "google" | "github" | "microsoft" | "apple",
  "redirect_uri": "https://yourdomain.com/callback"
}
```

**Response** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "rpt_...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "student@hust.edu.vn",
    "user_metadata": {
      "name": "Nguyễn Văn Minh"
    }
  }
}
```

---

## Users Module

### GET /rest/v1/profiles

**Description**: Get all user profiles (accessible to authenticated users)

**Method**: `GET`

**Query Parameters**:
```
select=id,name,email,university,avatar_url,balance,bio,avg_rating,total_sales
eq.role=user&eq.status=active
limit=50&offset=0
```

**Example**:
```typescript
const { data: profiles, error } = await supabase
  .from('profiles')
  .select('id, name, email, university, avatar_url, avg_rating, total_sales')
  .limit(20);
```

**Response** (200 OK):
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Nguyễn Văn Minh",
    "email": "minh@hust.edu.vn",
    "university": "ĐH Bách Khoa Hà Nội",
    "avatar_url": "https://supabase.co/images/avatar.png",
    "balance": 2500000,
    "bio": "Sinh viên năm 2, yêu thích các sản phẩm công nghệ",
    "avg_rating": 4.8,
    "total_sales": 45,
    "created_at": "2026-01-15T08:30:00Z"
  }
]
```

---

### GET /rest/v1/profiles/:id

**Description**: Get a specific user profile

**Method**: `GET`

**URL Parameters**:
```
id: string (UUID)
```

**Example**:
```typescript
const { data: profile, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', 'user-uuid')
  .single();
```

**Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Nguyễn Văn Minh",
  "email": "minh@hust.edu.vn",
  "phone": "0901234567",
  "university": "ĐH Bách Khoa Hà Nội",
  "avatar_url": "https://supabase.co/images/avatar.png",
  "location": "Hà Nội",
  "balance": 2500000,
  "bio": "Sinh viên năm 2, yêu thích các sản phẩm công nghệ",
  "avg_rating": 4.8,
  "total_sales": 45,
  "created_at": "2026-01-15T08:30:00Z",
  "updated_at": "2026-05-11T14:22:00Z"
}
```

---

### PATCH /rest/v1/profiles/:id

**Description**: Update user profile

**Method**: `PATCH`

**URL Parameters**:
```
id: string (UUID)
```

**Request Body**:
```json
{
  "name": "Nguyễn Văn Minh Updated",
  "bio": "Updated bio",
  "avatar_url": "https://new-avatar-url.com/image.jpg"
}
```

**Example**:
```typescript
const { data: updated, error } = await supabase
  .from('profiles')
  .update({
    name: 'New Name',
    bio: 'Updated bio'
  })
  .eq('id', 'user-uuid')
  .select();
```

**Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Nguyễn Văn Minh Updated",
  "bio": "Updated bio",
  "updated_at": "2026-05-11T15:30:00Z"
}
```

---

### GET /rest/v1/profiles/:id/statistics

**Description**: Get seller statistics

**Method**: `GET`

**URL Parameters**:
```
id: string (UUID)
```

**Example**:
```typescript
const { data: stats, error } = await supabase
  .from('profiles')
  .select('total_sales, avg_rating')
  .eq('id', 'user-uuid')
  .single();
```

**Response** (200 OK):
```json
{
  "total_sales": 45,
  "avg_rating": 4.8,
  "total_items_sold": 156,
  "total_revenue": 125000000,
  "response_rate": 98.5
}
```

---

## Products/Items Module

### GET /rest/v1/items

**Description**: Get all items (with filters and pagination)

**Method**: `GET`

**Query Parameters**:
```
select=id,title,price,image_url,location,category,created_at,views_count,quantity
status=eq.active&location=ilike.%Hà%
order=created_at.desc&limit=20&offset=0
```

**Example**:
```typescript
const { data: items, error } = await supabase
  .from('items')
  .select('id, title, price, image_url, location, category')
  .eq('status', 'active')
  .gte('quantity', 1)
  .order('created_at', { ascending: false })
  .limit(20);
```

**Response** (200 OK):
```json
[
  {
    "id": "item-uuid-1",
    "title": "MacBook Air M1 2020 - Còn bảo hành",
    "price": 15500000,
    "image_url": "https://supabase.co/images/item.jpg",
    "location": "Hà Nội",
    "category": "Điện tử",
    "views_count": 234,
    "quantity": 1,
    "created_at": "2026-05-10T10:30:00Z"
  },
  {
    "id": "item-uuid-2",
    "title": "Giày Nike Air Force 1 size 42",
    "price": 950000,
    "image_url": "https://supabase.co/images/item2.jpg",
    "location": "Huế",
    "category": "Quần áo",
    "views_count": 201,
    "quantity": 1,
    "created_at": "2026-05-09T14:15:00Z"
  }
]
```

---

### GET /rest/v1/items?search=keyword

**Description**: Search items by keyword

**Method**: `GET`

**Query Parameters**:
```
search=laptop
category=Điện tử
price_min=1000000
price_max=20000000
location=Hà Nội
order=created_at.desc&limit=20
```

**Example**:
```typescript
const { data: items, error } = await supabase
  .from('items')
  .select('*')
  .ilike('title', '%laptop%')
  .gte('price', 1000000)
  .lte('price', 20000000)
  .order('created_at', { ascending: false })
  .limit(20);
```

**Response** (200 OK):
```json
[
  {
    "id": "item-uuid",
    "title": "MacBook Air M1 2020",
    "description": "Máy đẹp 98%, full phụ kiện",
    "price": 15500000,
    "image_url": "https://...",
    "location": "Hà Nội",
    "district": "Cầu Giấy",
    "ward": "Dịch Vọng",
    "category": "Điện tử",
    "quantity": 1,
    "views_count": 234,
    "created_at": "2026-05-10T10:30:00Z"
  }
]
```

---

### GET /rest/v1/items/:id

**Description**: Get item detail

**Method**: `GET`

**URL Parameters**:
```
id: string (UUID)
```

**Example**:
```typescript
const { data: item, error } = await supabase
  .from('items')
  .select('*')
  .eq('id', 'item-uuid')
  .single();
```

**Response** (200 OK):
```json
{
  "id": "item-uuid",
  "user_id": "seller-uuid",
  "title": "MacBook Air M1 2020 - Còn bảo hành",
  "description": "MacBook Air M1 8GB/256GB, pin cycle 120, còn bảo hành Apple đến tháng 6/2026. Máy đẹp 98%, full phụ kiện.",
  "price": 15500000,
  "image_url": "https://supabase.co/images/item.jpg",
  "location": "Hà Nội",
  "district": "Cầu Giấy",
  "ward": "Dịch Vọng",
  "address_detail": "Số 1 Dại Cồ Việt",
  "category": "Điện tử",
  "quantity": 1,
  "status": "active",
  "views_count": 234,
  "is_featured": true,
  "created_at": "2026-05-10T10:30:00Z",
  "updated_at": "2026-05-11T12:00:00Z"
}
```

---

### POST /rest/v1/items

**Description**: Create a new item listing

**Method**: `POST`

**Authentication**: Required (JWT)

**Request Body**:
```json
{
  "title": "MacBook Air M1 2020",
  "description": "Máy đẹp 98%, full phụ kiện",
  "price": 15500000,
  "category": "Điện tử",
  "location": "Hà Nội",
  "district": "Cầu Giấy",
  "ward": "Dịch Vọng",
  "address_detail": "Số 1 Dại Cồ Việt",
  "quantity": 1,
  "image_url": "https://supabase.co/storage/v1/object/public/items/item.jpg"
}
```

**Example**:
```typescript
const { data: newItem, error } = await supabase
  .from('items')
  .insert({
    title: 'MacBook Air M1',
    description: 'Great condition',
    price: 15500000,
    category: 'Điện tử',
    location: 'Hà Nội',
    quantity: 1,
    user_id: user.id
  })
  .select();
```

**Response** (201 Created):
```json
{
  "id": "new-item-uuid",
  "user_id": "user-uuid",
  "title": "MacBook Air M1 2020",
  "price": 15500000,
  "status": "active",
  "created_at": "2026-05-11T15:30:00Z"
}
```

---

### PATCH /rest/v1/items/:id

**Description**: Update an item listing

**Method**: `PATCH`

**URL Parameters**:
```
id: string (UUID)
```

**Authentication**: Required (JWT, only by item owner or admin)

**Request Body**:
```json
{
  "title": "MacBook Air M1 2020 - Updated",
  "price": 15000000,
  "quantity": 0,
  "status": "sold"
}
```

**Example**:
```typescript
const { data: updated, error } = await supabase
  .from('items')
  .update({
    price: 15000000,
    title: 'MacBook Air M1 2020 - Updated',
    quantity: 0,
    status: 'sold'
  })
  .eq('id', 'item-uuid')
  .select();
```

**Response** (200 OK):
```json
{
  "id": "item-uuid",
  "title": "MacBook Air M1 2020 - Updated",
  "price": 15000000,
  "quantity": 0,
  "status": "sold",
  "updated_at": "2026-05-11T16:00:00Z"
}
```

---

### DELETE /rest/v1/items/:id

**Description**: Delete an item listing

**Method**: `DELETE`

**URL Parameters**:
```
id: string (UUID)
```

**Authentication**: Required (JWT, only by item owner or admin)

**Example**:
```typescript
const { error } = await supabase
  .from('items')
  .delete()
  .eq('id', 'item-uuid');
```

**Response** (204 No Content):
```
(Empty body)
```

---

### POST /rest/v1/storage/v1/object/public/items

**Description**: Upload item image

**Method**: `POST`

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: image/jpeg (or appropriate mime type)
```

**Example**:
```typescript
const file = new File([imageData], 'item.jpg', { type: 'image/jpeg' });
const { data, error } = await supabase.storage
  .from('items')
  .upload(`public/${Date.now()}.jpg`, file, { upsert: false });
```

**Response** (200 OK):
```json
{
  "id": "upload-id",
  "path": "public/1715510400000.jpg",
  "fullPath": "items/public/1715510400000.jpg"
}
```

---

## Orders Module

### GET /rest/v1/orders

**Description**: Get orders (filtered by buyer/seller)

**Method**: `GET`

**Query Parameters**:
```
eq.buyer_id=user-uuid        (for buyer's orders)
eq.seller_id=user-uuid       (for seller's orders)
eq.status=pending            (filter by status)
order=created_at.desc&limit=50
```

**Example**:
```typescript
// Get buyer's orders
const { data: orders, error } = await supabase
  .from('orders')
  .select('*')
  .eq('buyer_id', userId)
  .order('created_at', { ascending: false });

// Get seller's orders
const { data: sellerOrders, error } = await supabase
  .from('orders')
  .select('*')
  .eq('seller_id', userId)
  .order('created_at', { ascending: false });
```

**Response** (200 OK):
```json
[
  {
    "id": "order-uuid",
    "buyer_id": "buyer-uuid",
    "seller_id": "seller-uuid",
    "item_id": "item-uuid",
    "quantity": 1,
    "total_price": 15500000,
    "payment_method": "sepay",
    "delivery_method": "express",
    "status": "confirmed",
    "recipient_name": "Nguyễn Văn Minh",
    "recipient_phone": "0901234567",
    "recipient_address": "Số 1 Dại Cồ Việt, Hà Nội",
    "message": "Giao sáng nếu được",
    "shipped_at": null,
    "created_at": "2026-05-11T10:00:00Z",
    "updated_at": "2026-05-11T10:30:00Z"
  }
]
```

---

### GET /rest/v1/orders/:id

**Description**: Get order detail

**Method**: `GET`

**URL Parameters**:
```
id: string (UUID)
```

**Example**:
```typescript
const { data: order, error } = await supabase
  .from('orders')
  .select('*')
  .eq('id', 'order-uuid')
  .single();
```

**Response** (200 OK):
```json
{
  "id": "order-uuid",
  "buyer_id": "buyer-uuid",
  "seller_id": "seller-uuid",
  "item_id": "item-uuid",
  "quantity": 1,
  "total_price": 15500000,
  "payment_method": "sepay",
  "delivery_method": "express",
  "recipient_name": "Nguyễn Văn Minh",
  "recipient_phone": "0901234567",
  "recipient_address": "Số 1 Dại Cồ Việt, Hà Nội",
  "message": "Giao sáng nếu được",
  "shipping_address_id": null,
  "status": "pending",
  "shipped_at": null,
  "created_at": "2026-05-11T10:00:00Z",
  "updated_at": "2026-05-11T10:00:00Z"
}
```

---

### POST /rest/v1/orders

**Description**: Create a new order

**Method**: `POST`

**Authentication**: Required (JWT)

**Request Body**:
```json
{
  "item_id": "item-uuid",
  "quantity": 1,
  "payment_method": "sepay",
  "delivery_method": "express",
  "recipient_name": "Nguyễn Văn Minh",
  "recipient_phone": "0901234567",
  "recipient_address": "Số 1 Dại Cồ Việt, Hà Nội",
  "message": "Giao sáng nếu được"
}
```

**Example**:
```typescript
const { data: newOrder, error } = await supabase
  .from('orders')
  .insert({
    item_id: 'item-uuid',
    buyer_id: userId,
    quantity: 1,
    payment_method: 'sepay',
    delivery_method: 'express',
    recipient_name: 'Nguyễn Văn Minh',
    recipient_phone: '0901234567',
    recipient_address: 'Số 1 Dại Cồ Việt, Hà Nội'
  })
  .select();
```

**Response** (201 Created):
```json
{
  "id": "new-order-uuid",
  "item_id": "item-uuid",
  "buyer_id": "buyer-uuid",
  "seller_id": "seller-uuid",
  "quantity": 1,
  "total_price": 15500000,
  "status": "pending",
  "created_at": "2026-05-11T15:30:00Z"
}
```

---

### PATCH /rest/v1/orders/:id

**Description**: Update order status

**Method**: `PATCH`

**URL Parameters**:
```
id: string (UUID)
```

**Authentication**: Required (JWT, seller only)

**Request Body**:
```json
{
  "status": "confirmed",
  "shipped_at": "2026-05-11T16:00:00Z"
}
```

**Valid Status Values**:
```
pending     -> Initial state
confirmed   -> Seller confirmed
processing  -> Preparing shipment
shipped     -> Item shipped
delivered   -> Delivered
cancelled   -> Order cancelled
```

**Example**:
```typescript
const { data: updated, error } = await supabase
  .from('orders')
  .update({
    status: 'confirmed',
    shipped_at: new Date().toISOString()
  })
  .eq('id', 'order-uuid')
  .select();
```

**Response** (200 OK):
```json
{
  "id": "order-uuid",
  "status": "confirmed",
  "shipped_at": "2026-05-11T16:00:00Z",
  "updated_at": "2026-05-11T16:01:00Z"
}
```

---

## Payments & Transactions Module

### GET /rest/v1/transactions

**Description**: Get user's transaction history

**Method**: `GET`

**Query Parameters**:
```
eq.user_id=user-uuid
eq.status=success
order=created_at.desc&limit=50
```

**Example**:
```typescript
const { data: transactions, error } = await supabase
  .from('transactions')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(50);
```

**Response** (200 OK):
```json
[
  {
    "id": "transaction-uuid",
    "user_id": "user-uuid",
    "amount": 15500000,
    "type": "deposit",
    "status": "success",
    "payment_method": "bank_transfer",
    "transaction_code": "sepay-txn-123456",
    "reference_code": "NAPTIEN<user8chars>",
    "bank_brand": "VCB",
    "description": "Nạp tiền vào ví",
    "created_at": "2026-05-11T10:00:00Z",
    "updated_at": "2026-05-11T10:05:00Z"
  }
]
```

---

### POST /functions/v1/sepay-webhook

**Description**: SePay payment webhook endpoint (handles payment confirmations)

**Method**: `POST`

**Authentication**: Required (SePay API Key in Authorization header)

**Headers**:
```
Authorization: ApiKey <SEPAY_API_KEY>
Content-Type: application/json
```

**Request Body** (from SePay):
```json
{
  "id": "sepay-transaction-id",
  "transactionCode": "sepay-txn-123456",
  "accountNumber": "1234567890",
  "referenceCode": "NAPTIEN<userId8Chars>",
  "amount": 15500000,
  "description": "Nạp tiền StuMarket",
  "transactionDate": "2026-05-11T10:00:00Z",
  "bankBrand": "VCB"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Transaction processed successfully"
}
```

**Webhook Flow**:
1. SePay sends payment confirmation
2. System validates HMAC signature
3. Extracts user ID from reference code
4. Records transaction in database
5. Updates user balance
6. Sends confirmation email

---

### GET /rest/v1/profiles/:id/balance

**Description**: Get user's wallet balance

**Method**: `GET`

**URL Parameters**:
```
id: string (UUID)
```

**Example**:
```typescript
const { data: profile, error } = await supabase
  .from('profiles')
  .select('balance')
  .eq('id', userId)
  .single();
```

**Response** (200 OK):
```json
{
  "id": "user-uuid",
  "balance": 2500000,
  "name": "Nguyễn Văn Minh"
}
```

---

## Favorites Module

### GET /rest/v1/favorites

**Description**: Get user's favorite items

**Method**: `GET`

**Query Parameters**:
```
eq.user_id=user-uuid
select=id,item_id,created_at,items(id,title,price,image_url)
```

**Example**:
```typescript
const { data: favorites, error } = await supabase
  .from('favorites')
  .select(`
    id,
    item_id,
    created_at,
    items (
      id,
      title,
      price,
      image_url,
      location,
      category
    )
  `)
  .eq('user_id', userId);
```

**Response** (200 OK):
```json
[
  {
    "id": "favorite-uuid",
    "item_id": "item-uuid",
    "created_at": "2026-05-10T12:00:00Z",
    "items": {
      "id": "item-uuid",
      "title": "MacBook Air M1",
      "price": 15500000,
      "image_url": "https://...",
      "location": "Hà Nội",
      "category": "Điện tử"
    }
  }
]
```

---

### POST /rest/v1/favorites

**Description**: Add item to favorites

**Method**: `POST`

**Authentication**: Required (JWT)

**Request Body**:
```json
{
  "item_id": "item-uuid",
  "user_id": "user-uuid"
}
```

**Example**:
```typescript
const { data: favorite, error } = await supabase
  .from('favorites')
  .insert({
    item_id: 'item-uuid',
    user_id: userId
  })
  .select();
```

**Response** (201 Created):
```json
{
  "id": "favorite-uuid",
  "item_id": "item-uuid",
  "user_id": "user-uuid",
  "created_at": "2026-05-11T15:30:00Z"
}
```

---

### DELETE /rest/v1/favorites?item_id=uuid&user_id=uuid

**Description**: Remove item from favorites

**Method**: `DELETE`

**Query Parameters**:
```
item_id=item-uuid
user_id=user-uuid
```

**Example**:
```typescript
const { error } = await supabase
  .from('favorites')
  .delete()
  .eq('item_id', 'item-uuid')
  .eq('user_id', userId);
```

**Response** (204 No Content):
```
(Empty body)
```

---

## Ratings & Reviews Module

### GET /rest/v1/ratings

**Description**: Get ratings for a seller

**Method**: `GET`

**Query Parameters**:
```
eq.seller_id=seller-uuid
select=id,rating,comment,rater_id,created_at,profiles(name,avatar_url)
order=created_at.desc&limit=20
```

**Example**:
```typescript
const { data: ratings, error } = await supabase
  .from('ratings')
  .select(`
    id,
    rating,
    comment,
    created_at,
    profiles (
      id,
      name,
      avatar_url
    )
  `)
  .eq('seller_id', sellerId)
  .order('created_at', { ascending: false });
```

**Response** (200 OK):
```json
[
  {
    "id": "rating-uuid",
    "rating": 5,
    "comment": "Máy đẹp, giao hàng nhanh, bán hàng uy tín",
    "created_at": "2026-05-10T14:30:00Z",
    "profiles": {
      "id": "rater-uuid",
      "name": "Trần Thị Linh",
      "avatar_url": "https://..."
    }
  },
  {
    "id": "rating-uuid-2",
    "rating": 4,
    "comment": "Hàng tốt, giao nhanh",
    "created_at": "2026-05-09T10:00:00Z",
    "profiles": {
      "id": "rater-uuid-2",
      "name": "Phạm Văn Tú",
      "avatar_url": "https://..."
    }
  }
]
```

---

### POST /rest/v1/ratings

**Description**: Create a new rating/review

**Method**: `POST`

**Authentication**: Required (JWT)

**Request Body**:
```json
{
  "seller_id": "seller-uuid",
  "rater_id": "user-uuid",
  "rating": 5,
  "comment": "Máy đẹp, giao hàng nhanh, bán hàng uy tín"
}
```

**Example**:
```typescript
const { data: newRating, error } = await supabase
  .from('ratings')
  .insert({
    seller_id: 'seller-uuid',
    rater_id: userId,
    rating: 5,
    comment: 'Great seller!'
  })
  .select();
```

**Response** (201 Created):
```json
{
  "id": "rating-uuid",
  "seller_id": "seller-uuid",
  "rater_id": "user-uuid",
  "rating": 5,
  "comment": "Máy đẹp, giao hàng nhanh, bán hàng uy tín",
  "created_at": "2026-05-11T15:30:00Z"
}
```

---

## AI Chat Module

### POST /functions/v1/ai-chat

**Description**: AI-powered chat endpoint with product search capability

**Method**: `POST`

**Authentication**: Required (JWT)

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body**:
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Tìm laptop gần FPT Hà Nội giá dưới 20 triệu"
    }
  ]
}
```

**Example**:
```typescript
const { data, error } = await fetch(
  `${SUPABASE_URL}/functions/v1/ai-chat`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'user',
          content: 'Tìm laptop gần FPT Hà Nội giá dưới 20 triệu'
        }
      ]
    })
  }
).then(r => r.json());
```

**Response** (200 OK):
```json
{
  "role": "assistant",
  "content": "Đây là các laptop tìm được trên StuMarket:\n\n- [MacBook Air M1 2020](/item/item-uuid-1) — 15,500,000₫ — Hà Nội\n- [Lenovo ThinkPad L14 Gen 2](/item/item-uuid-2) — 12,000,000₫ — Hà Nội\n- [Dell Inspiron 15 3000](/item/item-uuid-3) — 8,500,000₫ — Hà Nội\n\nBạn có muốn xem chi tiết sản phẩm nào không?"
}
```

**AI Tools** (used internally):

| Tool | Description | Parameters |
|------|-------------|-----------|
| `search_products` | Search marketplace items | query, location, max_price, limit |

**Rate Limiting**: 
- 10 requests/minute per user
- 402 status if quota exceeded

---

## Admin Operations Module

### GET /rest/v1/profiles?role=admin

**Description**: Get admin access (role-based)

**Method**: `GET`

**Authentication**: Required (JWT, admin only)

**Example**:
```typescript
const { data: isAdmin, error } = await supabase
  .rpc('has_role', {
    _user_id: userId,
    _role: 'admin'
  });
```

---

### DELETE /rest/v1/items/:id (Admin)

**Description**: Delete item (admin override)

**Method**: `DELETE`

**Authentication**: Required (JWT, admin only)

**Example**:
```typescript
const { error } = await supabase
  .from('items')
  .delete()
  .eq('id', 'item-uuid');
```

**Response** (204 No Content):
```
(Empty body)
```

---

## Webhooks Module

### SePay Payment Webhook

**Endpoint**: `POST /functions/v1/sepay-webhook`

**Description**: Receives payment confirmations from SePay

**Signature Verification**: HMAC SHA256

```
Authorization: ApiKey <SEPAY_API_KEY>
```

**Payload** (from SePay):
```json
{
  "id": "sepay-txn-id",
  "transactionCode": "sepay-123456",
  "accountNumber": "1234567890",
  "referenceCode": "NAPTIEN<user8chars>",
  "amount": 15500000,
  "description": "Payment description",
  "transactionDate": "2026-05-11T10:00:00Z",
  "bankBrand": "VCB"
}
```

**Processing Flow**:
```
SePay Payment → Webhook Endpoint
    ↓
Verify API Key & Signature
    ↓
Extract User ID from Reference Code
    ↓
Check for Duplicates
    ↓
Create Transaction Record
    ↓
Update User Balance
    ↓
Send Confirmation Email
    ↓
Return 200 OK
```

---

## Error Handling

### Standard Error Responses

**400 Bad Request** - Invalid parameters
```json
{
  "code": "INVALID_REQUEST",
  "message": "Invalid request parameters",
  "details": "Missing required field: title"
}
```

**401 Unauthorized** - Missing or invalid authentication
```json
{
  "code": "UNAUTHORIZED",
  "message": "JWT expired or invalid",
  "details": "Provide a valid Authorization header"
}
```

**403 Forbidden** - Insufficient permissions
```json
{
  "code": "FORBIDDEN",
  "message": "You don't have permission to perform this action",
  "details": "Only item owner can edit"
}
```

**404 Not Found** - Resource not found
```json
{
  "code": "NOT_FOUND",
  "message": "Resource not found",
  "details": "Item with id 'xxx' does not exist"
}
```

**409 Conflict** - Duplicate or constraint violation
```json
{
  "code": "CONFLICT",
  "message": "Constraint violation",
  "details": "A favorite for this item already exists"
}
```

**429 Too Many Requests** - Rate limit exceeded
```json
{
  "code": "RATE_LIMITED",
  "message": "Too many requests",
  "details": "Try again in 60 seconds"
}
```

**500 Internal Server Error** - Server error
```json
{
  "code": "INTERNAL_ERROR",
  "message": "An unexpected error occurred",
  "details": "Please try again later or contact support"
}
```

### Error Handling Example

```typescript
try {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('id', itemId);

  if (error) {
    console.error('Error:', error.message);
    if (error.code === 'PGRST116') {
      // Item not found
      redirectTo404();
    } else if (error.code === '42P01') {
      // Table doesn't exist
      handleServerError();
    }
  }

  return data;
} catch (err) {
  console.error('Unexpected error:', err);
  handleServerError();
}
```

---

## Rate Limiting

### Rate Limit Rules

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/auth/v1/*` | 100 | 1 hour |
| `/rest/v1/*` | 1000 | 1 hour |
| `/functions/v1/ai-chat` | 10 | 1 minute |
| `/functions/v1/sepay-webhook` | Unlimited | - |
| File uploads | 50 MB/file, 1 GB/day | Per user |

### Rate Limit Headers

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1715431200
```

### Handling Rate Limits

```typescript
async function apiCallWithRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429) {
        const resetTime = parseInt(error.headers['X-RateLimit-Reset']);
        const delay = resetTime - Date.now();
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}
```

---

## Pagination

### Cursor-Based Pagination

All list endpoints support pagination via `limit` and `offset`:

```typescript
// Get first 20 items
const { data: page1 } = await supabase
  .from('items')
  .select('*')
  .limit(20)
  .offset(0);

// Get next 20 items
const { data: page2 } = await supabase
  .from('items')
  .select('*')
  .limit(20)
  .offset(20);
```

### Pagination Example

```typescript
const PAGE_SIZE = 20;
let currentPage = 0;
let hasMore = true;

async function loadMore() {
  const offset = currentPage * PAGE_SIZE;
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(PAGE_SIZE + 1)
    .offset(offset);

  if (data && data.length > PAGE_SIZE) {
    hasMore = true;
    setItems([...items, ...data.slice(0, PAGE_SIZE)]);
  } else {
    hasMore = false;
    setItems([...items, ...data]);
  }

  currentPage++;
}
```

---

## Status Codes & Responses

### HTTP Status Codes

| Code | Meaning | Scenario |
|------|---------|----------|
| 200 | OK | Successful GET/PATCH |
| 201 | Created | Successful POST (resource created) |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid parameters |
| 401 | Unauthorized | Missing/invalid JWT |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate/constraint violation |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal server error |
| 502 | Bad Gateway | Service unavailable |
| 503 | Service Unavailable | Maintenance/overload |

---

## Real-time Subscriptions

### Subscribe to Item Changes

```typescript
const subscription = supabase
  .from('items')
  .on('*', payload => {
    if (payload.eventType === 'INSERT') {
      console.log('New item:', payload.new);
    } else if (payload.eventType === 'UPDATE') {
      console.log('Updated item:', payload.new);
    } else if (payload.eventType === 'DELETE') {
      console.log('Deleted item:', payload.old);
    }
  })
  .subscribe();

// Cleanup
subscription.unsubscribe();
```

### Subscribe to Order Status Changes

```typescript
const subscription = supabase
  .from(`orders:seller_id=eq.${userId}`)
  .on('UPDATE', payload => {
    console.log('Order status changed:', payload.new.status);
  })
  .subscribe();
```

---

## Code Examples

### Complete User Registration & Profile

```typescript
// 1. Sign up with OAuth
const { data, error: signUpError } = await supabase.auth.signInWithOAuth({
  provider: 'google'
});

// 2. Create user profile
const { data: profile, error: profileError } = await supabase
  .from('profiles')
  .insert({
    id: user.id,
    name: user.user_metadata?.name,
    email: user.email,
    university: 'ĐH Bách Khoa Hà Nội'
  })
  .select()
  .single();
```

### Complete Product Listing Workflow

```typescript
// 1. Upload image
const file = new File([imageData], 'item.jpg');
const { data: uploadData } = await supabase.storage
  .from('items')
  .upload(`public/${Date.now()}.jpg`, file);

// 2. Create item
const { data: item } = await supabase
  .from('items')
  .insert({
    title: 'MacBook Air M1',
    price: 15500000,
    image_url: uploadData.fullPath,
    user_id: userId
  })
  .select()
  .single();

// 3. Mark as featured (admin only)
await supabase
  .from('items')
  .update({ is_featured: true })
  .eq('id', item.id);
```

### Complete Payment Workflow

```typescript
// 1. Create order
const { data: order } = await supabase
  .from('orders')
  .insert({
    item_id: itemId,
    buyer_id: userId,
    total_price: item.price
  })
  .select()
  .single();

// 2. Initialize SePay payment (manual implementation required)
// Redirect to SePay payment portal

// 3. Handle webhook (automatic on SePay confirmation)
// Webhook updates transaction record and order status
```

---

## Versioning

**Current API Version**: `v1`

**Endpoint Format**: `/rest/v1/<resource>`

**Version Support**:
- `v1`: Current (May 2026+)
- Deprecation: 12-month notice before removal

**Version Header** (optional):
```
API-Version: v1
```

---

## Deprecated Endpoints

None currently. This documentation represents the current state of the API.

---

## References & Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase REST API](https://supabase.com/docs/reference/javascript)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)
- [OAuth 2.0 Specification](https://tools.ietf.org/html/rfc6749)

---

## Support & Contact

For API support:
- **Email**: api-support@stumarket.vn
- **Documentation**: https://docs.stumarket.vn
- **Discord**: https://discord.gg/stumarket
- **GitHub Issues**: https://github.com/stumarket/api/issues

---

**Document Status**: Active  
**Last Updated**: May 11, 2026  
**Next Review**: June 11, 2026
