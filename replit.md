# Overview

This project is a pnpm monorepo for "Murciélingo", a Spanish learning application. It's built with TypeScript and aims to provide an engaging and effective language learning experience. The application features include interactive lessons, grammar explanations, conversation practice, vocabulary building, and spaced repetition for optimal learning. It targets both web and mobile platforms, with a strong focus on user progress tracking, personalized learning paths, and an integrated subscription model for premium features.

The business vision is to create a leading platform for Spanish language acquisition, leveraging modern web and AI technologies to offer a highly personalized and adaptive learning journey. The project's ambition is to expand into multiple languages and become a comprehensive learning ecosystem.

# User Preferences

I want iterative development and detailed explanations.

# System Architecture

The project is structured as a pnpm workspace monorepo.

**Core Technologies:**
- **Monorepo**: pnpm workspaces
- **Language**: TypeScript 5.9
- **Backend**: Node.js 24, Express 5
- **Database**: PostgreSQL with Drizzle ORM
- **Validation**: Zod (v4), `drizzle-zod`
- **Build**: esbuild (API server)

**UI/UX Decisions:**
- **Frontend Framework**: React + Vite (web), Expo/React Native (mobile)
- **CSS**: Tailwind CSS v3 (postcss) with custom design tokens.
- **Authentication UI**: Managed by Clerk components and UI flows.
- **Design Principles**: Focus on a clean, intuitive interface with clear progress indicators and engaging elements for language learning.
- **Color Scheme**: Defined in `index.css` with custom design tokens.
- **Fonts**: Sourced from Google Fonts.

**Technical Implementations & Feature Specifications:**

- **Authentication**: Utilizes Clerk for email/password, Google OAuth, and Apple OAuth.
- **API Design**: RESTful API built with Express, secured with Clerk JWT verification middleware.
- **Database Schema**: Comprehensive schema covering user profiles, progress, streaks, vocabulary, spaced repetition, and a detailed subscription system.
- **Subscription Model**: Implemented with a flexible `SubscriptionModel` supporting Free/Premium tiers, managed through a shared `@workspace/subscription` package. Integrates with Stripe for web and RevenueCat for mobile in-app purchases.
- **AI Integration**: Uses OpenAI via Replit AI Integrations proxy for features like translation and conversational practice.
- **Weak-Spot Tracking**: A shared mechanism to identify and prioritize subskills needing practice based on user performance (accuracy, confidence, repetition).
- **Level Check**: A non-blocking assessment system (`@workspace/level-check`) to evaluate user proficiency (e.g., A1, A2) and recommend next steps.
- **Persisted Practice Items Library**: AI-generated practice items are stored in a database, approved, and reused, reducing redundancy and improving content quality. Includes PII filtering for AI-generated content.
- **Spaced Repetition System (SRS)**: An SM-2-lite based scheduler implemented in `lib/practice/src/srs.ts` to optimize review timing for vocabulary and concepts. It integrates with user practice statistics and guides daily review recommendations.
- **Mobile Development**: Uses Expo and React Native, ensuring a consistent experience with the web app, with specific adaptations for mobile platform features (e.g., RevenueCat for subscriptions). Mobile routing is handled by Expo Router.

# External Dependencies

- **Authentication**: Clerk (`@clerk/react`, `@clerk/express`)
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Payment Processing (Web)**: Stripe SDK
- **Payment Processing (Mobile)**: RevenueCat (`react-native-purchases`)
- **AI Services**: OpenAI (accessed via Replit AI Integrations proxy)
- **CSS Framework**: Tailwind CSS
- **Fonts**: Google Fonts