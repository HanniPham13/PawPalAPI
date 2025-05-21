# PawPal Frontend

This is the frontend application for PawPal, a social media platform for pet lovers. The application is built using Vue.js 3 with TypeScript, Vite, Pinia for state management, and Tailwind CSS for styling.

## Features

- User authentication (register, login, email verification, password reset)
- Social feed with posts from followed users
- Like, comment, and save posts
- Follow/unfollow other users
- Real-time messaging
- Responsive design for all devices

## Technologies

- **Vue.js 3** - Progressive JavaScript framework
- **TypeScript** - JavaScript with syntax for types
- **Vite** - Next generation frontend tooling
- **Pinia** - State management
- **Vue Router** - Official router for Vue.js
- **Tailwind CSS** - Utility-first CSS framework
- **GSAP** - Animation library

## Setup and Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
VITE_API_URL=http://localhost:3000
```

## Project Structure

- `src/components` - Reusable Vue components
- `src/views` - Vue components that represent pages
- `src/store` - Pinia state management stores
- `src/router` - Vue Router configuration
- `src/assets` - Static assets like images and styles
- `src/utils` - Utility functions and helpers

## Connecting to the Backend

The frontend is configured to connect to the backend API at `http://localhost:3000` by default. You can change this in the `.env` file or in `vite.config.ts` for development proxying.

## Authentication

The application uses JWT (JSON Web Tokens) for authentication. When a user logs in, the token is stored in localStorage and attached to all subsequent API requests via Axios interceptors.

## UI Components

The application uses custom UI components built with Tailwind CSS and enhanced with GSAP animations for a smooth user experience.
