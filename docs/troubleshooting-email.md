# Email Troubleshooting Guide

## Common Email Issues and Solutions

### Issue 1: SMTP Connection Successful but Emails Not Sending

**Symptoms:**
- Console shows "SMTP is ready to send emails"
- Connection established successfully
- But emails are not being delivered

**Solutions:**

#### For Gmail Users:

1. **Use App Password (Required)**
   - Gmail no longer supports "Less secure app access"
   - You MUST use an App Password
   - Steps:
     1. Go to your Google Account: https://myaccount.google.com/
     2. Enable 2-Step Verification (if not already enabled)
     3. Go to App Passwords: https://myaccount.google.com/apppasswords
     4. Generate a new App Password for "Mail"
     5. Use this 16-character password in your `.env` file

2. **Check Your .env File**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com  # Full email address
   SMTP_PASS=your-16-char-app-password  # App Password, not regular password
   SMTP_SECURE=false
   ```

3. **Verify Email Format**
   - `SMTP_USER` must be your full email address
   - Example: `john.doe@gmail.com` (not just `john.doe`)

#### For Other Email Providers:

**Outlook/Hotmail:**
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
SMTP_SECURE=false
```

**Yahoo:**
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
SMTP_SECURE=false
```

**Custom SMTP Server:**
```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-password
SMTP_SECURE=false
```

---

### Issue 2: Authentication Error (EAUTH)

**Error Message:**
```
Error Code: EAUTH
Error: Invalid login
```

**Solutions:**

1. **For Gmail:**
   - ✅ Use App Password (not regular password)
   - ✅ Enable 2-Step Verification
   - ✅ Verify email address is correct

2. **For Other Providers:**
   - Check if username/password is correct
   - Some providers require full email as username
   - Some providers require just the username part

3. **Test Credentials:**
   ```bash
   # Test with a simple Node.js script
   node -e "
   const nodemailer = require('nodemailer');
   const transporter = nodemailer.createTransport({
     host: 'smtp.gmail.com',
     port: 587,
     secure: false,
     auth: {
       user: 'your-email@gmail.com',
       pass: 'your-app-password'
     }
   });
   transporter.verify((err, success) => {
     if (err) console.error('Error:', err);
     else console.log('Success!');
   });
   "
   ```

---

### Issue 3: Connection Timeout (ETIMEDOUT)

**Error Message:**
```
Error Code: ETIMEDOUT
Error: Connection timeout
```

**Solutions:**

1. **Check Firewall:**
   - Ensure port 587 or 465 is not blocked
   - Check if your network allows SMTP connections

2. **Try Different Port:**
   ```env
   # Try port 465 with SSL
   SMTP_PORT=465
   SMTP_SECURE=true
   ```

3. **Check Internet Connection:**
   - Verify you have internet access
   - Try pinging the SMTP server

4. **VPN/Proxy Issues:**
   - Some VPNs block SMTP connections
   - Try disabling VPN temporarily

---

### Issue 4: Emails Going to Spam

**Solutions:**

1. **Add SPF Record:**
   - Add SPF record to your domain DNS
   - Example: `v=spf1 include:_spf.google.com ~all`

2. **Add DKIM:**
   - Set up DKIM signing for your domain
   - This helps with email deliverability

3. **Use Professional Email Service:**
   - Consider using services like:
     - SendGrid
     - Mailgun
     - AWS SES
     - Resend

---

### Issue 5: "Less Secure App Access" Error

**Error Message:**
```
Error: Username and Password not accepted
```

**Solution:**
- Gmail no longer supports "Less secure app access"
- You MUST use App Passwords
- Follow the steps in Issue 1

---

## Step-by-Step Gmail Setup

### 1. Enable 2-Step Verification
1. Go to: https://myaccount.google.com/security
2. Click on "2-Step Verification"
3. Follow the setup process
4. Verify with your phone

### 2. Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" as the app
3. Select "Other (Custom name)" as the device
4. Enter "Job Portal Backend" as the name
5. Click "Generate"
6. Copy the 16-character password (no spaces)

### 3. Update .env File
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=abcd efgh ijkl mnop  # The 16-char app password (remove spaces)
SMTP_SECURE=false
```

### 4. Restart Server
```bash
npm start
```

### 5. Test Email
Try registering a new user and check if the email is received.

---

## Testing Email Configuration

### Test Script

Create a file `test-email.js`:

```javascript
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

console.log('Testing SMTP connection...');
console.log('Host:', process.env.SMTP_HOST);
console.log('Port:', process.env.SMTP_PORT);
console.log('User:', process.env.SMTP_USER);

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error code:', error.code);
  } else {
    console.log('✅ Connection successful!');
    
    // Try sending a test email
    transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER, // Send to yourself
      subject: 'Test Email',
      text: 'This is a test email from Job Portal Backend',
    })
    .then(info => {
      console.log('✅ Test email sent!');
      console.log('Message ID:', info.messageId);
    })
    .catch(err => {
      console.error('❌ Failed to send test email:', err.message);
    });
  }
});
```

Run the test:
```bash
node test-email.js
```

---

## Alternative Email Services

If Gmail continues to cause issues, consider using professional email services:

### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-username
SMTP_PASS=your-mailgun-password
```

### AWS SES
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-aws-access-key
SMTP_PASS=your-aws-secret-key
```

---

## Debug Mode

To enable detailed logging, update `utils/email-verification.js`:

```javascript
transporter = nodemailer.createTransport({
  // ... other config
  debug: true,  // Enable debug mode
  logger: true, // Enable logger
});
```

This will show detailed SMTP communication in the console.

---

## Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| EAUTH | Authentication failed | Use App Password for Gmail |
| ECONNECTION | Connection failed | Check network/firewall |
| ETIMEDOUT | Connection timeout | Check port/network |
| EENVELOPE | Invalid email address | Check email format |
| EMESSAGE | Message rejected | Check email content |

---

## Still Having Issues?

1. **Check Server Logs:**
   - Look for detailed error messages
   - Check the console output

2. **Verify Environment Variables:**
   ```bash
   # Check if variables are loaded
   node -e "require('dotenv').config(); console.log(process.env.SMTP_USER);"
   ```

3. **Test with Different Email:**
   - Try with a different email provider
   - Test with a different email address

4. **Check Email Provider Status:**
   - Gmail: https://www.google.com/appsstatus
   - Outlook: https://status.office.com/

5. **Contact Support:**
   - Check email provider documentation
   - Review error logs for specific error codes
