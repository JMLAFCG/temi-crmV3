# Enable Leaked Password Protection

## Manual Configuration Required

The leaked password protection feature must be enabled manually in your Supabase Dashboard. This cannot be automated via SQL migrations.

## Steps to Enable

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Navigate to: **Authentication** → **Settings** → **Password Protection**
4. Enable the option: **"Check for compromised passwords"**
5. Save the settings

## What This Does

- Prevents users from using passwords that have been compromised in data breaches
- Checks against the HaveIBeenPwned.org database
- Significantly improves account security
- No performance impact on your application

## Benefits

- Protects users from using commonly breached passwords
- Reduces risk of credential stuffing attacks
- Industry best practice for authentication security
- Free feature provided by Supabase

---

**Status**: Manual action required by admin
**Priority**: High - Security enhancement
