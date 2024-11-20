# ListingLab 🏠

AI-powered real estate content generator that creates personalized content from listing data. Built with modern tech stack and designed for easy AWS deployment.

## ⚠️ Important Notice

This is a proof-of-concept application and is not intended for commercial use due to potential copyright and data licensing restrictions with real estate listing data. Use for testing and demonstration purposes only.

## 🚀 Features

- **AI Content Generation**: Leverages Google Gemini to create:
  - Blog posts
  - Social media updates
  - Marketing emails
  - Listing descriptions

- **Automated Listing Updates**: Uses Inngest cron functions to scan for new listings 3x daily in subscribed cities

- **Data Visualization**:
  - Mortgage calculators
  - Property appreciation forecasts
  - Market trend analysis

- **Property Dashboard**:
  - ZIP code-based property viewing
  - At-a-glance market insights
  - Comprehensive listing details

- **Subscription Management**:
  - ZIP code-based subscriptions
  - Recurring monthly payments via Stripe
  - User access control

## 🛠️ Tech Stack

- **Frontend**: 
  - Next.js
  - TypeScript
  - Tailwind CSS

- **Backend**:
  - tRPC for type-safe APIs
  - Clerk for authentication
  - Turso (SQLite) for data storage
  - Drizzle for type-safe database queries

- **Infrastructure**:
  - SST for AWS deployment
  - Inngest for scheduled tasks
  - Stripe for payment processing

## 🌟 Key Features

- Type-safe from database to frontend using TypeScript and tRPC
- Secure authentication and user management with Clerk
- Automated listing updates with Inngest cron jobs
- Easy deployment to AWS using SST
- ZIP code-based subscription model
- Real-time property market insights

## 🚧 Current Status

This application is currently in proof-of-concept stage and requires:
- Additional testing
- Bug fixes
- Data licensing considerations
- Production hardening

## 📝 Notes

- The application uses real estate listing data which may have licensing restrictions
- Intended as a demonstration of technical capabilities
- Not currently suitable for commercial deployment
- Requires proper data licensing agreements for production use

## 💻 Development

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Run development server
pnpm dev
```

## 🔑 Environment Variables

Check `.env.example` for the required environment variables.