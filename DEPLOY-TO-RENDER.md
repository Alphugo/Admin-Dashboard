# Deploy Kina Resort System to Render

## Step-by-Step Deployment Guide

### Prerequisites
- ✅ Your code is already on GitHub: `https://github.com/Alphugo/Admin-Dashboard.git`
- ✅ You have a Supabase account and database set up
- ✅ You have a Render account (sign up at https://render.com if needed)

---

## Step 1: Create New Web Service on Render

1. Go to **Render Dashboard**: https://dashboard.render.com
2. Click **"New +"** button (top right)
3. Select **"Web Service"**
4. Connect your GitHub account if not already connected
5. Select your repository: **`Alphugo/Admin-Dashboard`**
6. Click **"Connect"**

---

## Step 2: Configure the Service

Fill in the following settings:

### Basic Settings:
- **Name**: `kina-resort-dashboard` (or any name you prefer)
- **Region**: Choose closest to you (e.g., `Singapore` or `Oregon`)
- **Branch**: `main`
- **Root Directory**: Leave empty (uses root)
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### Environment Variables (IMPORTANT):

Click **"Add Environment Variable"** and add each of these:

```
SUPABASE_URL=your_supabase_project_url_here
SUPABASE_KEY=your_supabase_anon_key_here
SESSION_SECRET=your-random-secret-key-change-this
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
NODE_ENV=production
PORT=10000
```

**How to get Supabase credentials:**
1. Go to your Supabase Dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy **Project URL** → Paste as `SUPABASE_URL`
5. Copy **anon public** key → Paste as `SUPABASE_KEY`

**How to get Gmail App Password:**
1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Go to App Passwords
4. Generate new app password for "Mail"
5. Copy the 16-character password → Paste as `SMTP_PASSWORD`

---

## Step 3: Deploy

1. Click **"Create Web Service"**
2. Render will:
   - Clone your repository
   - Run `npm install`
   - Start your server with `npm start`
3. Wait 5-10 minutes for first deployment
4. Watch the build logs for any errors

---

## Step 4: Verify Deployment

1. Once deployed, Render will give you a URL like:
   ```
   https://kina-resort-dashboard.onrender.com
   ```

2. Test the application:
   - Visit the URL
   - You should see the login page
   - Try logging in with your admin account

---

## Step 5: Update Supabase Settings (Important!)

After deployment, you need to update Supabase to allow requests from your Render URL:

1. Go to **Supabase Dashboard** → Your Project → **Settings** → **API**
2. Scroll down to **"Allowed URLs"** or **"CORS"**
3. Add your Render URL:
   ```
   https://your-app-name.onrender.com
   ```

---

## Troubleshooting

### Build Fails:
- Check build logs in Render dashboard
- Verify all dependencies are in `package.json`
- Check Node.js version compatibility

### 401 Unauthorized Error:
- Verify `SUPABASE_URL` and `SUPABASE_KEY` are correct
- Check Supabase API key hasn't expired
- Verify Supabase CORS settings include your Render URL

### Database Connection Error:
- Double-check `SUPABASE_URL` format (should be like `https://xxxxx.supabase.co`)
- Verify `SUPABASE_KEY` is the anon/public key (not service_role key)

### Email Not Sending:
- Verify Gmail App Password is correct (16 characters, no spaces)
- Check `SMTP_USER` is your full Gmail address
- Enable "Less secure app access" if App Password doesn't work

---

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Your Supabase project URL | `https://xxxxx.supabase.co` |
| `SUPABASE_KEY` | Supabase anon/public API key | `eyJhbGci...` |
| `SESSION_SECRET` | Secret for session encryption | `my-random-secret-key-123` |
| `SMTP_HOST` | Email server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | Email server port | `587` |
| `SMTP_USER` | Your email address | `yourname@gmail.com` |
| `SMTP_PASSWORD` | Gmail App Password | `abcd efgh ijkl mnop` |
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port (Render sets this automatically) | `10000` |

---

## Free Tier Limitations

Render's free tier has some limitations:
- ⚠️ **Spins down after 15 minutes of inactivity**
- ⚠️ **First request after spin-down takes ~30 seconds** (cold start)
- ⚠️ **Limited to 750 hours/month** (enough for most use cases)
- ✅ **Free SSL certificate included**
- ✅ **Custom domain support**

**Tip**: To prevent spin-down, you can use a service like UptimeRobot to ping your site every 5 minutes.

---

## Post-Deployment Checklist

- [ ] Service is running and accessible
- [ ] Login page loads correctly
- [ ] Can log in with admin account
- [ ] Can create new bookings
- [ ] Can view existing bookings
- [ ] Email notifications are working
- [ ] Supabase database is accessible
- [ ] All environment variables are set correctly

---

## Need Help?

If deployment fails:
1. Check Render build logs for error messages
2. Verify all environment variables are set correctly
3. Make sure your Supabase database is accessible
4. Check that all npm dependencies install successfully

