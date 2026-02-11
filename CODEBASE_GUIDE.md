# Burrow - Codebase Guide

A neighbor-to-neighbor item borrowing/lending platform built with **Next.js 16 (App Router)**, **Supabase** (auth + database), and **shadcn/ui**.

---

## Project Structure Overview

```
app/                        # Next.js App Router pages (each folder = a URL route)
components/                 # Reusable UI components
lib/supabase/               # Supabase client configuration (3 files)
middleware.ts               # Route protection (runs before every page load)
scripts/                    # SQL migration scripts for the database
public/                     # Static assets (images like burrow-mascot.jpg)
```

---

## Pages (Routes)

Each file in `app/` maps to a URL. These are **Server Components** by default (they run on the server and can query Supabase directly).

| File | URL | Auth Required? | What It Does |
|---|---|---|---|
| `app/page.tsx` | `/` | No | **Home page.** Shows hero section, "How It Works", featured items (latest 4 available), and values section. Fetches items + reviews from Supabase. |
| `app/browse/page.tsx` | `/browse` | No | **Browse all items.** Fetches all available items with categories and review stats, passes them to `<BrowseItems>` for client-side filtering/sorting. |
| `app/items/[id]/page.tsx` | `/items/{uuid}` | No | **Item detail page.** Fetches a single item by ID with its category, owner profile, and reviews. Shows the `<RentRequestForm>` sidebar. Returns 404 if item not found. |
| `app/list-item/page.tsx` | `/list-item` | **Yes** | **List a new item.** Fetches categories, renders `<ListItemForm>`. Redirects to login if not authenticated. |
| `app/my-listings/page.tsx` | `/my-listings` | **Yes** | **Manage your listings.** Shows all items you own with edit/delete options and pending request counts. Uses `<ListingCard>`. |
| `app/requests/page.tsx` | `/requests` | **Yes** | **Unified requests hub.** Two tabs: "Borrowing" (requests you sent) and "Lending" (requests others sent for your items). Owners can approve/decline with `<RequestActions>`. |
| `app/my-rentals/page.tsx` | `/my-rentals` | **Yes** | **Your rental requests.** Shows all borrow requests you've made with their status (pending/approved/rejected). |
| `app/profile/page.tsx` | `/profile` | **Yes** | **Edit your profile.** Loads or creates your profile record, renders `<ProfileForm>` to edit display name, bio, location, university, etc. |
| `app/auth/login/page.tsx` | `/auth/login` | No | **Login form.** Email + password sign-in using Supabase Auth. |
| `app/auth/sign-up/page.tsx` | `/auth/sign-up` | No | **Sign up form.** Email + password + display name. Sends confirmation email. |
| `app/auth/sign-up-success/page.tsx` | `/auth/sign-up-success` | No | **Success message** after sign-up telling user to check their email. |
| `app/auth/error/page.tsx` | `/auth/error` | No | **Auth error page** for failed authentication flows. |

---

## Components

These are the custom components (not the shadcn/ui library ones in `components/ui/`).

| File | Type | What It Does |
|---|---|---|
| `components/site-header.tsx` | Client | **Global navigation bar.** Shows logo, nav links (Home, Browse, Requests), and auth state (sign in/up buttons or user dropdown menu with links to profile, listings, etc.). |
| `components/item-card.tsx` | Client | **Item preview card.** Used on home page and browse page. Shows image, title, price/day, category badge, condition badge, location, and rating. Links to `/items/{id}`. Exports the `ItemCardData` TypeScript interface. |
| `components/browse-items.tsx` | Client | **Browse page content.** Receives all items + categories as props. Handles client-side search, category filtering, condition filtering, and sorting (newest/price/rating). |
| `components/search-filters.tsx` | Client | **Search bar + sort/condition dropdowns.** Used inside `<BrowseItems>`. |
| `components/category-filter.tsx` | Client | **Category chip selector.** Horizontal scrollable list of category buttons. Used inside `<BrowseItems>`. |
| `components/rent-request-form.tsx` | Client | **"Request to Borrow" form.** Shown on item detail page. Picks start/end dates, calculates total price, sends message. Inserts into `rental_requests` table. Shows "Sign in to borrow" if not logged in. |
| `components/list-item-form.tsx` | Client | **"List an Item" form.** Title, description, category, condition, price, location, image URL. Inserts into `items` table. |
| `components/listing-card.tsx` | Client | **Owner's listing card.** Used on My Listings page. Shows item preview with View, Edit, and Delete buttons, plus pending request count. |
| `components/edit-item-dialog.tsx` | Client | **Edit item modal.** Dialog form to update an existing item's details. Updates the `items` table. |
| `components/delete-item-dialog.tsx` | Client | **Delete item confirmation.** Alert dialog that deletes an item from the `items` table. |
| `components/request-actions.tsx` | Client | **Approve/Decline buttons.** Used on the Lending tab of the Requests page. Lets owners approve or reject pending borrow requests, optionally with a response message. Updates `rental_requests` table. |
| `components/profile-form.tsx` | Client | **Profile editor.** Form to update display name, full name, bio, phone, avatar URL, location, university. Upserts into `profiles` table. |
| `components/theme-provider.tsx` | Client | **Theme wrapper.** (Currently not actively used in layout, but available.) |

---

## Supabase Configuration (lib/supabase/)

Three files handle the Supabase connection. **You never need to edit these** unless changing auth behavior.

| File | Used Where | Purpose |
|---|---|---|
| `lib/supabase/server.ts` | Server Components (pages) | Creates a Supabase client that can read/write cookies on the server. Used in every `page.tsx` to fetch data and check auth. |
| `lib/supabase/client.ts` | Client Components (`"use client"`) | Creates a Supabase client for the browser. Used in forms and interactive components to insert/update data. |
| `lib/supabase/middleware.ts` | `middleware.ts` | Refreshes the auth session on every request and redirects unauthenticated users away from protected routes. |

**Environment variables** (set automatically by the Supabase integration):
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous/public key

---

## Middleware (middleware.ts)

Runs **before every page load** (except static files/images). Does two things:

1. **Refreshes the Supabase auth session** so the user stays logged in across requests.
2. **Protects routes** - redirects to `/auth/login` if an unauthenticated user tries to access `/list-item`, `/my-rentals`, or `/my-listings`.

If you want to protect a new route, add its path to the `protectedPaths` array in `lib/supabase/middleware.ts`.

---

## Database Schema

All tables live in the `public` schema of your Supabase PostgreSQL database. The full schema is defined in `scripts/004-clean-schema.sql`.

### Tables

#### 1. `profiles`
Stores user profile info. **Auto-created** when a user signs up (via a database trigger).

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | References `auth.users(id)`. Same as the Supabase auth user ID. |
| `display_name` | text | Public name shown on listings/requests. |
| `full_name` | text | Real name, only shared with confirmed borrowers/lenders. |
| `bio` | text | Short self-description. |
| `phone_number` | text | Optional contact number. |
| `avatar_url` | text | URL to profile picture. |
| `location` | text | Neighborhood/area. |
| `university` | text | School name (builds trust). |
| `created_at` | timestamptz | Auto-set on creation. |
| `updated_at` | timestamptz | Updated by the profile form. |

**RLS policies:** Anyone can read all profiles. Users can only insert/update/delete their own.

#### 2. `categories`
Reference table for item categories. Pre-seeded with 11 categories.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | Auto-generated. |
| `name` | text | Display name (e.g., "Textbooks", "Electronics"). |
| `slug` | text (unique) | URL-friendly name (e.g., "textbooks", "electronics"). |
| `icon` | text | Lucide icon name (e.g., "BookOpen", "Laptop"). |

**Current categories:** Calculators, Party Decorations, Halloween Costumes, Textbooks, Electronics, Sports Equipment, Kitchen Appliances, Furniture, Tools, Outdoor, Other.

**RLS policies:** Anyone can read. No insert/update/delete for regular users.

#### 3. `items`
The main listings table. Each row is one item available for borrowing.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | Auto-generated. |
| `owner_id` | uuid (FK) | References `auth.users(id)`. The user who listed this item. |
| `category_id` | uuid (FK) | References `categories(id)`. |
| `title` | text | Item name. |
| `description` | text | Detailed description. |
| `price_per_day` | numeric(10,2) | Daily rental price. |
| `location` | text | Pickup location. |
| `condition` | text | One of: `like-new`, `good`, `fair`, `worn`. |
| `image_url` | text | URL to item photo. |
| `is_available` | boolean | Whether the item can be borrowed (default: true). |
| `created_at` | timestamptz | Auto-set. |
| `updated_at` | timestamptz | Updated on edits. |

**RLS policies:** Anyone can read all items. Users can only insert/update/delete items where they are the `owner_id`.

#### 4. `rental_requests`
Tracks borrow requests between users.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | Auto-generated. |
| `item_id` | uuid (FK) | References `items(id)`. |
| `borrower_id` | uuid (FK) | The user requesting to borrow. |
| `owner_id` | uuid (FK) | The item's owner (denormalized for easy querying). |
| `start_date` | date | Requested start date. |
| `end_date` | date | Requested end date. |
| `message` | text | Borrower's message to the owner. |
| `owner_response` | text | Owner's reply when approving/declining. |
| `status` | text | One of: `pending`, `approved`, `rejected`, `completed`, `cancelled`. |
| `created_at` | timestamptz | Auto-set. |
| `updated_at` | timestamptz | Updated when status changes. |

**RLS policies:** Users can only see requests where they are the `borrower_id` or `owner_id`. Borrowers can insert requests. Both borrowers and owners can update (borrowers to cancel, owners to approve/reject).

#### 5. `reviews`
Item reviews left by borrowers.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | Auto-generated. |
| `item_id` | uuid (FK) | References `items(id)`. |
| `reviewer_id` | uuid (FK) | The user who wrote the review. |
| `rating` | integer | 1-5 stars (enforced by CHECK constraint). |
| `comment` | text | Review text. |
| `created_at` | timestamptz | Auto-set. |

**RLS policies:** Anyone can read all reviews. Users can only insert/update/delete their own reviews.

### Database Trigger

When a new user signs up via Supabase Auth, a trigger automatically creates a row in `profiles` with:
- `id` = the auth user's ID
- `display_name` = the `display_name` from sign-up metadata, or the part before `@` in their email

This is defined as the `handle_new_user()` function + `on_auth_user_created` trigger in the schema.

---

## Data Flow Examples

### User signs up
1. User fills out `app/auth/sign-up/page.tsx` form
2. `supabase.auth.signUp()` is called (client-side)
3. Supabase creates a row in `auth.users`
4. The `on_auth_user_created` trigger fires and creates a `profiles` row
5. User gets a confirmation email, clicks link, is redirected to `/`

### User lists an item
1. User goes to `/list-item` (middleware checks they're logged in)
2. `app/list-item/page.tsx` fetches categories from Supabase, passes to `<ListItemForm>`
3. User fills out the form and submits
4. `<ListItemForm>` calls `supabase.from("items").insert(...)` (client-side)
5. RLS ensures `owner_id` matches the logged-in user

### Someone requests to borrow
1. Visitor browses `/browse`, clicks an item card -> goes to `/items/{id}`
2. `app/items/[id]/page.tsx` fetches the item, owner profile, and reviews (server-side)
3. `<RentRequestForm>` is rendered in the sidebar
4. User picks dates, writes a message, submits
5. Form calls `supabase.from("rental_requests").insert(...)` (client-side)

### Owner responds to a request
1. Owner goes to `/requests`, clicks "Lending" tab
2. `app/requests/page.tsx` fetches all rental_requests where `owner_id` = current user
3. For pending requests, `<RequestActions>` shows Approve/Decline buttons
4. Owner clicks a button -> `supabase.from("rental_requests").update({ status: "approved" })` (client-side)

---

## SQL Scripts (scripts/)

These are migration scripts that set up the database. They've already been run - you don't need to run them again.

| File | What It Does |
|---|---|
| `004-clean-schema.sql` | **The main/current schema.** Creates all 5 tables, RLS policies, the signup trigger, and seeds the 11 categories. This is the one that was actually executed. |
| `001-create-schema.sql` | Earlier version of the schema (superseded by 004). |
| `001_create_tables.sql` | Earlier version of table creation (superseded by 004). |
| `002_profile_trigger.sql` | Earlier version of the signup trigger (superseded by 004). |
| `002-add-owner-response.sql` | Added the `owner_response` column (now included in 004). |

If you need to modify the database, create a new script like `005-your-change.sql` and run it through v0 or the Supabase SQL editor.

---

## Key Patterns

### Server vs Client Components
- **Pages** (`page.tsx` files) are Server Components - they fetch data directly from Supabase using the server client
- **Interactive components** (forms, buttons, filters) are Client Components marked with `"use client"` - they use the browser client for mutations

### Auth Flow
- Every page calls `supabase.auth.getUser()` to check if someone is logged in
- The `user` object (or `null`) is passed as a prop to `<SiteHeader>` to show the right navigation
- Protected pages redirect to `/auth/login` if `user` is null
- The middleware handles session refresh and also redirects for protected routes

### How Items Link Together
- `ItemCard` links to `/items/${item.id}` (the detail page)
- `ListingCard` also links to `/items/${item.id}` and provides Edit/Delete
- The item detail page uses the `[id]` URL parameter to fetch from Supabase

---

## Common Edits

### Add a new page
1. Create `app/your-route/page.tsx`
2. If it needs auth protection, add the path to `protectedPaths` in `lib/supabase/middleware.ts`
3. Add a link in `components/site-header.tsx` if it should appear in the nav

### Add a new database column
1. Create a new SQL script in `scripts/` (e.g., `005-add-column.sql`)
2. Run it via the Supabase SQL Editor or v0
3. Update the relevant component/page to use the new column

### Add a new category
Run this SQL in the Supabase SQL Editor:
```sql
INSERT INTO public.categories (name, slug, icon) VALUES ('Your Category', 'your-category', 'LucideIconName');
```

### Change which routes require login
Edit the `protectedPaths` array in `lib/supabase/middleware.ts`.
