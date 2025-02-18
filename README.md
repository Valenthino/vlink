# Link Shortener Web App

This is a simple link-shortening web app built with:

- **Next.js** (frontend & backend API routes)
- **TypeScript**
- **Tailwind CSS**
- **Docker**
- **Supabase** (as the database)
- **Cloudflare** (use externally for DNS/CDN)

## Features

- Enter a URL to generate a short link.
- API route that creates and stores a unique slug in Supabase.
- Dynamic routing to look up and redirect to the original URL.
- Containerized with Docker for easy deployment.

## Setup

1. **Supabase Setup:**
   - Create a new project on [Supabase](https://supabase.com/).
   - Create a table named `links` with at least these columns:
     - `slug` (text, unique)
     - `url` (text)
     - *(Optional)* `created_at` (timestamp with default value)

2. **Environment Variables:**
   Create a `.env.local` file in the project root with:
