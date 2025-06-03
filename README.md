# INTERNSHIP PROJECT 01: BUILDING A CENTRALIZED ACCOUNT MANAGEMENT & AUTHENTICATION SYSTEM (IDENTITY SERVER)

This project aims to build a centralized account management and authentication system, utilizing the Identity Server architecture.

## I. Technologies Used

*   **Database:**
    *   MongoDB
*   **Backend:**
    *   ASP.NET Core (6.0)
*   **Frontend:**
    *   Webpack
    *   React
    *   MUI (Material UI)

## II. Requirements

### 1. Backend:

*   Initialize configuration and deploy Identity Server on an ASP.NET Core 6.0 server, storing data in MongoDB.
*   Enable account registration, email account verification, password recovery (forgot password), and two-factor authentication (2FA).
*   Allow users to update their account information and enable/disable 2FA.
*   Allow administrators to:
    *   Create accounts.
    *   Lock/unlock accounts.
    *   Delete accounts.
*   Configure the system to allow website authentication using Google accounts (Google external login).

### 2. Frontend:

*   **Client Project Initialization:**
    *   Webpack configuration.
    *   React setup.
    *   Material UI (MUI) setup.
*   **UI Implementation:**
    *   Account registration.
    *   UI for prompting email verification after registration.
    *   UI for displaying successful email verification.
    *   Login.
    *   UI for OTP input (for 2FA).
    *   Forgot password (Enter email to receive password reset token).
    *   UI for notification of successful password reset email dispatch.
    *   Password reset UI.
    *   UI for notification of successful password reset.
    *   **User Account Management:**
        *   Avatar upload.
        *   User profile update.
    *   **Account Security Management:**
        *   Change password.
        *   Enable/disable 2FA.
    *   **Admin Panel UI:**
        *   Account list with statuses.
        *   Account details view.
        *   Create new account (form/interface).
