# Overview

This is a full-stack e-commerce application called "SoleStyle" that specializes in premium footwear. The application features a React frontend with TypeScript, an Express.js backend, and PostgreSQL database with Drizzle ORM. It includes multi-language support (English, Arabic, Kurdish), authentication via Replit Auth, shopping cart functionality, order management, and an admin panel for product/category/brand management.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Framework**: Tailwind CSS with shadcn/ui component library for consistent design
- **Routing**: Wouter for client-side routing with protected routes based on authentication
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Form Handling**: React Hook Form with Zod validation for type-safe form validation
- **Internationalization**: Custom i18n implementation supporting English, Arabic, and Kurdish with RTL support

## Backend Architecture
- **Framework**: Express.js with TypeScript running in ESM mode
- **Authentication**: Replit Auth with OpenID Connect for user authentication and session management
- **API Design**: RESTful API endpoints with role-based access control (admin vs regular users)
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Error Handling**: Centralized error handling with proper HTTP status codes and JSON responses

## Database Architecture
- **Database**: PostgreSQL with Neon serverless driver for connection pooling
- **ORM**: Drizzle ORM with TypeScript for type-safe database operations
- **Schema Design**: Relational schema with tables for users, products, categories, brands, cart items, orders, and sessions
- **Multi-language Support**: Products and categories store names in multiple languages (English, Arabic, Kurdish)

## Key Design Patterns
- **Monorepo Structure**: Client, server, and shared code organized in separate directories
- **Shared Types**: Common TypeScript types and Zod schemas in `/shared` for type safety across frontend and backend
- **Component Composition**: Reusable UI components following shadcn/ui patterns
- **Custom Hooks**: React hooks for authentication, mobile detection, and toast notifications
- **Repository Pattern**: Storage abstraction layer in server for database operations

## Authentication & Authorization
- **Replit Auth Integration**: Uses OpenID Connect for secure authentication
- **Session Management**: Server-side sessions stored in PostgreSQL with automatic cleanup
- **Role-based Access**: Admin users have additional permissions for product/category/brand management
- **Protected Routes**: Frontend routes protected based on authentication status

## Cart & Order Management
- **Shopping Cart**: Persistent cart stored in database linked to authenticated users
- **Product Variants**: Support for different shoe sizes and quantities
- **Order Processing**: Complete order workflow with customer information collection
- **Admin Dashboard**: Order management and product inventory tracking

# External Dependencies

## Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless driver for database connectivity
- **drizzle-orm**: Type-safe ORM for database operations with PostgreSQL dialect
- **@tanstack/react-query**: Server state management and caching for React

## UI & Styling
- **@radix-ui/***: Comprehensive set of accessible UI primitives for React components
- **tailwindcss**: Utility-first CSS framework for styling
- **class-variance-authority**: Utility for creating variant-based component APIs
- **lucide-react**: Icon library providing consistent iconography

## Authentication & Session
- **openid-client**: OpenID Connect client for Replit Auth integration
- **passport**: Authentication middleware for Express.js
- **connect-pg-simple**: PostgreSQL session store for Express sessions

## Form & Validation
- **react-hook-form**: Performant form library with minimal re-renders
- **@hookform/resolvers**: Resolvers for integrating Zod validation with React Hook Form
- **zod**: TypeScript-first schema validation library

## Development & Build Tools
- **vite**: Fast build tool and development server for React
- **tsx**: TypeScript execution environment for Node.js
- **esbuild**: Fast JavaScript bundler for production builds
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay for Replit environment