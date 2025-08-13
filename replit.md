# Replit.md

## Overview

This is a full-stack invoice generation application built with React on the frontend and Express.js on the backend. The application allows users to create, manage, and generate professional invoices with company information, line items, tax calculations, and various export options. It features a modern UI built with shadcn/ui components and uses PostgreSQL with Drizzle ORM for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React SPA**: Single-page application using React with TypeScript
- **Routing**: Client-side routing implemented with Wouter for lightweight navigation
- **State Management**: React Query (TanStack Query) for server state management and caching
- **Form Handling**: React Hook Form with Zod validation for type-safe form validation
- **UI Framework**: shadcn/ui component library built on Radix UI primitives with Tailwind CSS styling
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Express.js API**: RESTful API server handling invoice and company operations
- **Database Layer**: Drizzle ORM with PostgreSQL for type-safe database operations
- **Memory Storage**: In-memory storage implementation as fallback/development option
- **API Routes**: CRUD operations for companies, invoices, and invoice items
- **Middleware**: Express middleware for JSON parsing, logging, and error handling

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for schema definition and query building
- **Schema Management**: Drizzle Kit for migrations and schema synchronization
- **Session Storage**: PostgreSQL-based session storage using connect-pg-simple

### Database Schema Design
- **Companies Table**: Stores business information (name, contact details, tax rates)
- **Invoices Table**: Main invoice records with status tracking and totals
- **Invoice Items Table**: Line items with quantity, pricing, and calculated totals
- **Users Table**: Authentication and user management (prepared for future use)

### Authentication and Authorization
- **Session-based Authentication**: Express sessions with PostgreSQL storage
- **Password Security**: Prepared for bcrypt hashing (implementation pending)
- **User Management**: Database schema supports user accounts and authentication

### Development Environment
- **Development Server**: Vite dev server with HMR for frontend development
- **API Development**: tsx for TypeScript execution in development
- **Error Handling**: Runtime error overlay integration for development debugging
- **Build Process**: Separate frontend (Vite) and backend (esbuild) build pipelines

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL serverless driver for database connectivity
- **drizzle-orm**: Type-safe ORM for PostgreSQL database operations
- **drizzle-kit**: CLI tools for schema migrations and database management
- **express**: Node.js web framework for API server
- **react**: Frontend UI library with TypeScript support
- **@tanstack/react-query**: Server state management and data fetching

### UI and Styling Dependencies
- **@radix-ui/***: Headless UI component primitives for accessible components
- **tailwindcss**: Utility-first CSS framework for styling
- **class-variance-authority**: Utility for creating type-safe component variants
- **lucide-react**: Icon library for consistent iconography

### Development and Build Tools
- **vite**: Frontend build tool and development server
- **tsx**: TypeScript execution environment for Node.js
- **esbuild**: Fast bundler for backend production builds
- **typescript**: Type checking and compilation
- **@replit/vite-plugin-cartographer**: Replit-specific development tools

### Form and Validation Libraries
- **react-hook-form**: Performant form library with minimal re-renders
- **@hookform/resolvers**: Integration adapters for validation libraries
- **zod**: TypeScript-first schema validation library
- **drizzle-zod**: Integration between Drizzle ORM and Zod validation

### Utility Libraries
- **date-fns**: Date manipulation and formatting utilities
- **clsx**: Conditional className utility
- **embla-carousel-react**: Carousel component for UI interactions
- **cmdk**: Command palette component for enhanced UX