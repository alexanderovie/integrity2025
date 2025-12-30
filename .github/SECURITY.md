# 🔒 Security Policy

## Supported Versions

We actively support security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 16.1.x  | :white_check_mark: |
| < 16.1  | :x:                |

## Reporting a Vulnerability

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via one of the following methods:

### Email
Send an email to: **security@integritycleansolutions.com**

### Process
1. Include a detailed description of the vulnerability
2. Include steps to reproduce (if applicable)
3. Include potential impact assessment
4. We will respond within **48 hours**
5. We will provide updates on the fix timeline

### What to Expect
- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 7 days
- **Fix Timeline**: Depends on severity
- **Public Disclosure**: After fix is deployed (with your permission)

## Security Best Practices

### For Contributors
- Never commit secrets, API keys, or credentials
- Use `.env.local` for local development (not committed)
- Review `.env.example` for required variables
- Report security issues immediately

### For Users
- Keep dependencies updated
- Use environment variables for all secrets
- Enable 2FA on all accounts
- Regularly rotate API keys and tokens

## Known Security Measures

- ✅ Private repository
- ✅ Environment variables for all secrets
- ✅ `.gitignore` configured for sensitive files
- ✅ No hardcoded credentials
- ✅ Regular dependency updates

## Security Updates

We regularly update dependencies to patch security vulnerabilities. Check `package.json` for current versions.

---

**Last Updated:** December 2025
