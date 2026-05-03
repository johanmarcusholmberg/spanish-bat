# Overview

This project, "Murciélingo," is a pnpm monorepo for a Spanish language learning application built with TypeScript. It aims to provide an engaging and effective learning experience through interactive lessons, grammar explanations, conversation practice, vocabulary building, and spaced repetition. The application supports both web and mobile platforms, focusing on user progress tracking, personalized learning paths, and an integrated subscription model for premium features. The business vision is to become a leading platform for Spanish acquisition, leveraging modern web and AI technologies, with ambitions to expand into a comprehensive multi-language learning ecosystem.

# User Preferences

I want iterative development and detailed explanations.

# System Architecture

The project is structured as a pnpm workspace monorepo using TypeScript 5.9.

**Core Technologies:**
- **Monorepo**: pnpm workspaces
- **Language**: TypeScript
- **Backend**: Node.js 24, Express 5
- **Database**: PostgreSQL with Drizzle ORM
- **Validation**: Zod (v4), `drizzle-zod`
- **Build**: esbuild (API server)

**UI/UX Decisions:**
- **Frontend Framework**: React + Vite (web), Expo/React Native (mobile)
- **CSS**: Tailwind CSS v3 (postcss) with custom design tokens
- **Authentication UI**: Managed by Clerk components
- **Design Principles**: Clean, intuitive interface with clear progress indicators and engaging elements.
- **Color Scheme**: Defined with custom design tokens.
- **Fonts**: Sourced from Google Fonts.

**Technical Implementations & Feature Specifications:**

- **Authentication**: Utilizes Clerk for email/password, Google OAuth, and Apple OAuth. Includes robust admin authentication with TOTP enforcement, invitation-driven onboarding, and an audit log system. Production keys and webhook secrets are securely managed.
- **API Design**: RESTful API built with Express, secured with Clerk JWT verification middleware.
- **Database Schema**: Comprehensive schema for user profiles, progress, streaks, vocabulary, spaced repetition, and subscriptions.
- **Subscription Model**: Supports Free/Premium tiers using a shared `@workspace/subscription` package, integrating with Stripe for web and RevenueCat for mobile. Features granular access control based on subscription status and provides localized paywall copy.
- **AI Integration**: Leverages OpenAI via Replit AI Integrations proxy for features like translation and conversational practice. AI-generated practice items are stored, approved, and filtered for PII.
- **Weak-Spot Tracking**: Identifies and prioritizes subskills for practice based on user performance.
- **Level Check**: A non-blocking assessment system (`@workspace/level-check`) to evaluate proficiency and recommend next steps.
- **Spaced Repetition System (SRS)**: An SM-2-lite based scheduler (`lib/practice/src/srs.ts`) optimizes review timing for effective learning.
- **Mobile Development**: Uses Expo and React Native for a consistent cross-platform experience, with Expo Router for navigation and platform-specific adaptations.
- **Learning UX**: Features a "Session-First" approach with a "Today" screen as the post-login destination, emphasizing the "Echo Steps" strip (See → Hear → Echo → Build → Use) and guided practice. Shared learning logic is encapsulated in the `@workspace/learning-coach` package, including state models, mistake tracking, and AI practice interfaces.
- **Persistence**: Shared, framework-agnostic persistence services (e.g., `sessionStorageService`, `learningCacheService`, `notificationPreferenceService`) are used across web and mobile for features like resuming sessions, caching, and notification management.

# External Dependencies

- **Authentication**: Clerk
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Payment Processing (Web)**: Stripe
- **Payment Processing (Mobile)**: RevenueCat
- **AI Services**: OpenAI (via Replit AI Integrations proxy)
- **CSS Framework**: Tailwind CSS
- **Fonts**: Google Fonts