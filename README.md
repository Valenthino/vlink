# Link Shortener Web App

This is a simple link-shortening web app built with:

- **Next.js** (frontend & backend API routes)
- **TypeScript**
- **Tailwind CSS**
- **Docker**
- **MongoDB** (as the database)
- **Cloudflare** (use externally for DNS/CDN)

## Features

- Enter a URL to generate a short link.
- API route that creates and stores a unique slug in MongoDB.
- Dynamic routing to look up and redirect to the original URL.
- Containerized with Docker for easy deployment.

## Setup

1. **MongoDB Setup:**
   - Create a MongoDB Atlas account or use a local MongoDB instance
   - Create a new database and get your connection string
   - The app will automatically create the required collections

2. **Environment Variables:**
   Create a `.env.local` file in the project root with:
   ```
   MONGODB_URI=your_mongodb_connection_string
   ```

3. **Local Development:**
   ```bash
   npm install
   npm run dev
   ```

4. **Docker Deployment:**
   ```bash
   docker build -t link-shortener .
   docker run -p 3000:3000 link-shortener
   ```

## Database Schema

The MongoDB database uses the following collections:

### urls
- `_id`: ObjectId (automatically generated)
- `slug`: String (unique)
- `longUrl`: String
- `createdAt`: Date
- `visits`: Number (optional, for analytics)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License.
