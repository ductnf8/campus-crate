# Student Thrift Hub (StuMarket)

[![Vite](https://img.shields.io/badge/Vite-FFD62E?logo=vite&logoColor=000000)](https://vitejs.dev/) [![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=000000)](https://react.dev/) [![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=ffffff)](https://www.typescriptlang.org/) [![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=ffffff)](https://supabase.com/) [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=ffffff)](https://tailwindcss.com/) [![License](https://img.shields.io/badge/license-Unlicensed-lightgrey)]()

## Description

Student Thrift Hub is a student-first peer-to-peer marketplace for buying and selling secondhand goods. Built as a modern React + Supabase application, it provides a full shopping experience with authentication, listings, cart and checkout, seller dashboards, admin moderation, wallet deposits, and an AI chat assistant.

## Tagline

A Vietnamese student marketplace for safe, simple, and smart secondhand trading.

---

## Key Features

- 🛍️ Marketplace browsing with search, category filtering, and location-based discovery
- 🧑‍🎓 Email and Google OAuth authentication with user profiles and role-based flows
- 🛒 Persistent cart and checkout workflow with shipping address management
- 💳 Wallet deposit integration via SePay webhook processing
- 🧾 Order creation, seller fulfillment, and order history tracking
- ⭐ Seller ratings, favorites, and buyer reviews
- 🧠 AI chat assistant powered by Supabase Edge Function and Gemini-style prompts
- 🛠️ Admin panel for moderation, user oversight, and ad management
- 🔧 Tailwind CSS + shadcn UI component library for polished UX

---

## Tech Stack

| Frontend | Backend / Services | UI / Styling | Utilities |
|---|---|---|---|
| React 18 | Supabase (PostgreSQL, Auth, Edge Functions) | Tailwind CSS | Zod
| TypeScript | Supabase Functions | shadcn/ui + Radix | React Query
| Vite | Supabase Realtime | Framer Motion | React Hook Form
| React Router | Deno (Edge Functions) | Sonner notifications | Lucide icons

---

## Demo / Screenshot

> Placeholder for demo video or screenshot

![Demo screenshot placeholder](https://via.placeholder.com/1200x600.png?text=Student+Thrift+Hub+Demo)

---

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/<your-org>/student-thrift-hub.git
cd student-thrift-hub
```

### 2. Install dependencies

The project uses `bun` and a Bun lockfile, but you can also install with npm.

```bash
bun install
# or
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root and add the required variables.

```env
VITE_SUPABASE_URL=https://your-supabase-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

For Supabase Edge Functions and webhook processing, set these on your Supabase project or local environment:

```env
SUPABASE_URL=https://your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
AI_API_KEY=your-openrouter-or-ai-provider-key
AI_API_URL=https://openrouter.ai/api/v1/chat/completions
AI_MODEL=google/gemini-2.5-flash
SEPAY_API_KEY=your-sepay-webhook-key
```

### 4. Start the development server

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Environment Variables

### Frontend

- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` — Supabase public key used by the browser

### Backend / Supabase Functions

- `SUPABASE_URL` — Supabase project URL for edge functions
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key for privileged database operations
- `AI_API_KEY` — AI provider key for the `ai-chat` function
- `AI_API_URL` — Optional AI API endpoint (defaults to OpenRouter)
- `AI_MODEL` — AI model name (defaults to `google/gemini-2.5-flash`)
- `SEPAY_API_KEY` — Shared secret for SePay webhook authentication

> Note: Do not commit `.env` to source control.

---

## Project Structure

```text
student-thrift-hub/
├── public/                     # Static assets
├── src/                        # Frontend source code
│   ├── assets/                 # Images and media
│   ├── components/             # Reusable UI components
│   ├── hooks/                  # Custom React hooks
│   ├── integrations/           # Supabase and third-party integrations
│   ├── lib/                    # Helpers, constants, and data
│   ├── pages/                  # Route pages and screens
│   └── test/                   # Tests and test setup
├── supabase/                   # Supabase functions and migrations
│   ├── functions/              # Serverless edge functions
│   └── migrations/             # Database schema changes
├── bun.lockb                   # Bun lockfile
├── package.json                # npm / Bun scripts and dependencies
├── tsconfig.json               # TypeScript config
├── vite.config.ts              # Vite config
├── tailwind.config.ts          # Tailwind config
├── postcss.config.js           # PostCSS config
└── SRS.md / PROJECT_OVERVIEW.md# Documentation files
```

---

## How to Run

### Development

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

### Testing

```bash
npm run test
npm run test:watch
```

---

## API Documentation

### Supabase Edge Functions

#### `ai-chat`
- Endpoint: `POST /functions/v1/ai-chat`
- Description: Handles AI chat requests and routes them through the AI provider.
- Request body:
  - `messages` — array of message objects `{ role: 'user' | 'assistant', content: string }`
- Response body:
  - `content` — AI-generated reply text
  - `error` — optional error message

#### `sepay-webhook`
- Endpoint: `POST /functions/v1/sepay-webhook`
- Description: Receives SePay webhook payloads and credits user wallets.
- Headers:
  - `Authorization: Bearer <SEPAY_API_KEY>`
- Payload: SePay transfer event object

### Supabase Database

The frontend interacts with Supabase tables such as:
- `profiles`
- `items`
- `orders`
- `shipping_addresses`
- `transactions`
- `favorites`
- `ads`

Custom RPC functions used by the project include:
- `has_role`
- `search_items_for_ai`
- `find_profile_by_id_prefix`

> For detailed API behavior and schema, refer to `supabase/migrations` and `supabase/functions`.

---

## Contributing

Thank you for contributing! To help maintain quality:

1. Fork the repository
2. Create a feature branch
3. Follow TypeScript and Tailwind conventions
4. Run linting and tests before submitting
5. Open a pull request with a clear description

### Recommended workflow

```bash
git checkout -b feature/your-feature
npm install
npm run lint
npm run test
```

### Notes

- Use consistent commit messages
- Keep changes scoped and well-documented
- Add tests for new behavior when possible

---

## License

No license is currently specified for this repository. Add a `LICENSE` file if you intend to publish or share the project under an open-source license.

---

## Contact / Authors

- **Project:** Student Thrift Hub (StuMarket)
- **Location:** `d:\WebstormProjects\student-thrift-hub`
- **Author / Maintainer:** Add your name and contact details here
- **Documentation:** See `PROJECT_OVERVIEW.md` and `SRS.md` for architecture and requirements

---

## Additional Notes

This repository is designed for a modern student-focused marketplace with Vietnamese-language UX and Supabase-powered backend services. It is production-ready for frontend development and local Supabase integration, and includes edge functions for AI chat and SePay payment handling.
