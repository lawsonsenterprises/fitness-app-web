# Apple Sign In Setup Guide

Complete setup guide for implementing Apple Sign In with Supabase authentication.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Issues Encountered & Solutions](#issues-encountered--solutions)
- [Step-by-Step Setup Guide](#step-by-step-setup-guide)
- [Redirect URLs Configuration](#redirect-urls-configuration)
- [Troubleshooting](#troubleshooting)
- [Security Best Practices](#security-best-practices)
- [Additional Resources](#additional-resources)

---

## Prerequisites

Before starting, ensure you have:

- An active Apple Developer account (£79/year)
- Access to the Supabase Dashboard for your project
- Your production domain configured (e.g., syncedmomentum.com)
- Node.js installed locally for key generation

---

## Issues Encountered & Solutions

### Issue 1: No Services ID on Apple Developer Site

**Problem:** Apple Sign In for web applications requires a Services ID, which is different from an App ID used for iOS apps.

**Solution:**

1. Navigate to [Apple Developer Portal](https://developer.apple.com/account)
2. Go to **Certificates, Identifiers & Profiles**
3. Select **Identifiers** from the sidebar
4. Click the **+** button to create a new identifier
5. Select **Services IDs** (not App IDs)
6. Click **Continue**

**Identifier Format:**
```
com.yourdomain.webapp.auth
```

Example for Synced Momentum:
```
com.syncedmomentum.webapp.auth
```

**Important:** The Services ID becomes your OAuth Client ID in Supabase.

---

### Issue 2: Supabase Settings Configuration

**Problem:** Supabase requires specific Apple credentials that aren't immediately obvious.

**Solution:**

Navigate to your Supabase Dashboard → **Authentication** → **Providers** → **Apple**

Required fields:

| Field | Description | Where to Find |
|-------|-------------|---------------|
| **Services ID** | Your Services ID identifier | Apple Developer Portal → Identifiers → Services IDs |
| **Team ID** | Your Apple Developer Team ID | Apple Developer Portal → Membership (top right of account page) |
| **Key ID** | The ID of your .p8 signing key | Apple Developer Portal → Keys (shown when key is created) |
| **Private Key** | The contents of your .p8 file | Downloaded .p8 file (see Issue 3) |

---

### Issue 3: Private Key Generation (JWT from .p8)

**Problem:** Apple requires a private key for server-to-server authentication, provided as a .p8 file.

**Solution:**

#### Step 1: Create a Key in Apple Developer Portal

1. Go to [Apple Developer Portal](https://developer.apple.com/account)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Select **Keys** from the sidebar
4. Click the **+** button to create a new key
5. Enter a key name (e.g., "Supabase Auth Key")
6. Enable **Sign in with Apple**
7. Click **Configure** next to Sign in with Apple
8. Select your primary App ID (this links the key to your app)
9. Click **Save**, then **Continue**, then **Register**

#### Step 2: Download the .p8 File

**CRITICAL:** You can only download the .p8 file **once**. Store it securely immediately.

1. After registering, click **Download**
2. Save the file (named like `AuthKey_XXXXXXXXXX.p8`)
3. Note the **Key ID** displayed on screen (you'll need this)

#### Step 3: Extract the Private Key

The .p8 file contains the private key in PEM format. Open the file to view its contents:

```bash
cat AuthKey_XXXXXXXXXX.p8
```

The contents will look like:
```
-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...
...multiple lines of base64...
-----END PRIVATE KEY-----
```

#### Step 4: Add to Supabase

1. Go to Supabase Dashboard → **Authentication** → **Providers** → **Apple**
2. Toggle **Enable Sign in with Apple**
3. Paste the **entire contents** of the .p8 file into the **Private Key** field, including:
   - `-----BEGIN PRIVATE KEY-----`
   - All the base64 content
   - `-----END PRIVATE KEY-----`
4. Fill in the other fields (Services ID, Team ID, Key ID)
5. Click **Save**

---

## Step-by-Step Setup Guide

### 1. Create an App ID (if not already done)

1. Apple Developer Portal → **Identifiers** → **+**
2. Select **App IDs** → **Continue**
3. Select **App** → **Continue**
4. Enter description and Bundle ID
5. Enable **Sign in with Apple** capability
6. Click **Continue** → **Register**

### 2. Create a Services ID

1. Apple Developer Portal → **Identifiers** → **+**
2. Select **Services IDs** → **Continue**
3. Enter description (e.g., "Synced Momentum Web Auth")
4. Enter identifier (e.g., `com.syncedmomentum.webapp.auth`)
5. Click **Continue** → **Register**

### 3. Configure the Services ID

1. Find your Services ID in the list and click on it
2. Enable **Sign in with Apple**
3. Click **Configure**
4. Select your primary App ID
5. Add your domains and redirect URLs (see next section)
6. Click **Save** → **Continue** → **Save**

### 4. Generate the Signing Key

Follow the steps in [Issue 3](#issue-3-private-key-generation-jwt-from-p8) above.

### 5. Configure Supabase

1. Go to Supabase Dashboard → **Authentication** → **Providers** → **Apple**
2. Enable the provider
3. Enter your credentials:
   - **Services ID:** `com.syncedmomentum.webapp.auth`
   - **Team ID:** Your 10-character Team ID
   - **Key ID:** The Key ID from your .p8 key
   - **Private Key:** Full contents of the .p8 file
4. Save changes

### 6. Test the Integration

**Local Development:**
```bash
npm run dev
```
Navigate to your login page and click "Sign in with Apple".

**Production:**
Deploy to your production environment and test the full flow.

---

## Redirect URLs Configuration

### Apple Developer Portal Settings

In your Services ID configuration, add these domains and return URLs:

**Domains:**
```
syncedmomentum.com
www.syncedmomentum.com
localhost
```

**Return URLs:**
```
https://your-project-ref.supabase.co/auth/v1/callback
```

Find your callback URL in Supabase Dashboard → **Authentication** → **URL Configuration**.

### Supabase Dashboard Settings

Navigate to **Authentication** → **URL Configuration**:

**Site URL:**
```
https://syncedmomentum.com
```

**Redirect URLs (add all of these):**
```
https://syncedmomentum.com/**
https://www.syncedmomentum.com/**
http://localhost:3000/**
https://*.vercel.app/**
```

### Environment-Specific URLs

| Environment | URL Pattern |
|-------------|-------------|
| Production | `https://syncedmomentum.com` |
| Staging | `https://staging.syncedmomentum.com` |
| Vercel Previews | `https://*.vercel.app` |
| Local Development | `http://localhost:3000` |

---

## Troubleshooting

### Error: `invalid_client`

**Cause:** The Services ID doesn't match or the private key is incorrect.

**Solution:**
1. Verify the Services ID in Supabase matches exactly (case-sensitive)
2. Ensure the private key includes the full PEM format with headers
3. Check the Team ID is correct (found on Apple Developer membership page)

### Error: `invalid_request`

**Cause:** The redirect URI isn't configured correctly.

**Solution:**
1. Verify the callback URL is added to Apple Developer Portal
2. Check Supabase redirect URLs include your domain
3. Ensure no trailing slashes cause mismatches

### Error: `unauthorized_client`

**Cause:** The key isn't properly linked to the Services ID.

**Solution:**
1. Re-configure the signing key in Apple Developer Portal
2. Ensure the key is associated with the correct App ID
3. Verify Sign in with Apple is enabled on the Services ID

### Callback Failures

**Symptoms:** User authenticates with Apple but isn't redirected back to the app.

**Solution:**
1. Check browser console for errors
2. Verify the Supabase callback URL is correct
3. Ensure cookies are enabled (required for auth flow)
4. Check for CORS issues in network tab

### Key Not Working After Download

**Cause:** The .p8 file can only be downloaded once.

**Solution:**
1. If you've lost the key, you must create a new one
2. Revoke the old key in Apple Developer Portal
3. Generate a new key and update Supabase settings

---

## Security Best Practices

### Never Commit .p8 Files

Add to your `.gitignore`:
```gitignore
# Apple Sign In keys
*.p8
AuthKey_*.p8
```

### Store Keys Securely

- Use a password manager for .p8 files
- Store in encrypted cloud storage as backup
- Limit access to team members who need it
- Document which keys are active and their purposes

### Rotate Keys Periodically

1. Create a new key in Apple Developer Portal
2. Update Supabase with the new key
3. Test the authentication flow
4. Revoke the old key after confirming the new one works

**Recommended rotation schedule:** Every 12 months or after team member changes.

### Monitor Failed Authentication Attempts

1. Check Supabase logs regularly: **Dashboard** → **Logs** → **Auth**
2. Set up alerts for unusual patterns
3. Review failed attempts for potential issues

### Environment Variables

Never hardcode credentials. Use environment variables:

```env
# .env.local (never commit this file)
APPLE_TEAM_ID=XXXXXXXXXX
APPLE_KEY_ID=XXXXXXXXXX
APPLE_SERVICES_ID=com.yourapp.webapp.auth
```

---

## Additional Resources

### Official Documentation

- [Apple Sign In Web Setup](https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_js)
- [Apple Developer Portal](https://developer.apple.com/account)
- [Supabase Apple Auth Guide](https://supabase.com/docs/guides/auth/social-login/auth-apple)
- [Apple Human Interface Guidelines - Sign in with Apple](https://developer.apple.com/design/human-interface-guidelines/sign-in-with-apple)

### Useful Tools

- [JWT.io](https://jwt.io/) - Decode and verify JWTs
- [Apple App Site Association Validator](https://branch.io/resources/aasa-validator/)

### Support Channels

- [Supabase Discord](https://discord.supabase.com/)
- [Apple Developer Forums](https://developer.apple.com/forums/)
- [Stack Overflow - Sign in with Apple](https://stackoverflow.com/questions/tagged/sign-in-with-apple)

---

## Checklist

Before going live, verify:

- [ ] App ID created with Sign in with Apple enabled
- [ ] Services ID created and configured
- [ ] Signing key generated and .p8 file secured
- [ ] All credentials entered in Supabase
- [ ] Production domain added to Apple Developer Portal
- [ ] Callback URL configured correctly
- [ ] Redirect URLs set in Supabase
- [ ] Local development tested
- [ ] Production deployment tested
- [ ] .p8 file stored securely (not in repo)
- [ ] Team members briefed on key security

---

*Last updated: December 2024*
