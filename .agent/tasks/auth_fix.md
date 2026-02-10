# Backend Authentication & Registration Fix

The registration endpoint (`/api/auth/register`) is returning a 500 Internal Server Error. This task focuses on diagnosing the root cause, fixing the backend logic/database schema, and ensuring the frontend authentication flow works seamlessly.

## 1. Diagnosis
- [ ] **Capture Traceback**: Read the backend terminal logs to identify the specific exception causing the 500 error.
- [ ] **Inspect Database Schema**: Verify the `users` table columns match the SQLAlchemy model using a script.
- [ ] **Verify Database Connection**: Ensure the app is connecting to the expected database file.

## 2. Remediation
- [ ] **Fix Database/Model Mismatch**: Apply necessary migrations or schema updates based on findings.
- [ ] **Fix Code Logic**: Correct any issues in `crud.user.create` or `routers.auth.register_user`.
- [ ] **Verify Hashing**: Ensure password hashing is stable (already verified, but double-check in context).

## 3. Verification
- [ ] **Test Registration**: Successfully register a new user via API.
- [ ] **Test Login**: Successfully login with the new user and receive a JWT.
- [ ] **Frontend Integration**: Verify the Navbar updates to show the user's state after login.

## 4. Frontend Polish
- [ ] **Navbar Auth State**: Ensure Login/Signup buttons toggle correctly.
- [ ] **Activity Logging**: re-enable activity logging once core auth is stable.
