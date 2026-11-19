# Hostinger Deployment Guide for Good Eco Solutions RVSF

This Next.js application is configured and ready for 1-click deployment on Hostinger via GitHub.

---

### Step 1: Push Code to GitHub
Ensure all changes are committed and pushed to your GitHub repository:
```bash
git add .
git commit -m "Configure Hostinger deployment, RVSF QR scanner badge and 1HR response time"
git push origin WebRevert
```

---

### Step 2: Configure Hostinger Node.js Application
1. Log in to **Hostinger hPanel**.
2. Navigate to **Websites** -> Click **Manage** on `goodecosolutions.in`.
3. In the left sidebar, look for **Node.js** (or **Advanced > Git / Node.js**).
4. Configure the settings:
   - **Node.js Version**: Select `Node.js 20.x` or `22.x`
   - **Application Root**: `/` (or your domain directory)
   - **Application Startup File**: `server.js` (or leave default `npm start`)
   - **Application Mode**: `Production`

---

### Step 3: Git Auto-Deployment on Push
1. In Hostinger hPanel under **Git**:
   - **Repository URL**: `https://github.com/your-username/ScrapPartEcom.git`
   - **Branch**: `WebRevert` (or `main`)
   - **Install / Build Commands**:
     ```bash
     npm install
     npm run build
     ```
2. Enable **Auto-Deployment / Webhook** so any `git push` automatically redeploys the site.

---

### Step 4: Environment Variables
In Hostinger under **Node.js Environment Variables** or create a `.env` file in the project root:
- Copy the variables from `.env.example`:
  - `NODE_ENV=production`
  - `JWT_SECRET=...`
  - `FIREBASE_PROJECT_ID=...`
  - `FIREBASE_CLIENT_EMAIL=...`
  - `FIREBASE_PRIVATE_KEY=...`
  - `AQUASMS_*` credentials

---

### Step 5: Start / Restart the Application
Click **Start** (or **Restart**) in Hostinger Node.js panel.
The website will be live at `https://goodecosolutions.in`.

