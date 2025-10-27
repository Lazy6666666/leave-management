# Frontend - Leave Management System

This directory contains the frontend for the Leave Management System, a Next.js application designed for internal use with plans for external deployment. It provides the user interface for employees and managers to interact with the system.

## Project Purpose

The primary goal of this application is to streamline the process of requesting and managing leave. Key features include:

*   **Leave Requests**: Employees can submit requests for various types of leave.
*   **Leave Balance**: Users can view their remaining leave balances.
*   **Request Status**: Track the status of submitted requests (pending, approved, denied).
*   **Manager Dashboard**: Managers have a dedicated view to approve or deny leave requests from their team.

## Getting Started

Follow these instructions to get the development environment up and running.

### Prerequisites

*   Node.js (v18 or later)
*   npm (or yarn/pnpm)

### Setup and Installation

1.  **Navigate to the Frontend Directory**
    ```bash
    cd frontend
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**
    Create a `.env.local` file in the `frontend` directory. This file will store your Supabase credentials.
    ```
    NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    ```
    *Note: These credentials connect the frontend to your hosted Supabase instance.*

4.  **Run the Development Server**
    ```bash
    npm run dev
    ```

The application should now be running on [http://localhost:3000](http://localhost:3000).

## Testing

The project is configured with both unit and end-to-end tests.

*   **Unit Tests**: Run the unit tests using Vitest:
    ```bash
    npm test
    ```

*   **End-to-End Tests**: Run the E2E tests using Playwright:
    ```bash
    npm run test:e2e
    ```

## Deployment

The easiest way to deploy this Next.js application is with the [Vercel Platform](https://vercel.com/new). For more details, refer to the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).
