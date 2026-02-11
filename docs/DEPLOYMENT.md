# Deployment Guide

## Prerequisites

- GitHub account with repository access
- Render.com account (free tier works)
- Environment variables from `.env` file

---

## Deploy to Render

### 1. Create Web Service

1. Go to [render.com](https://render.com) and sign in
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Select the `pm-agent` repository

### 2. Configure Service

**Basic Settings:**
- **Name**: `pm-agent` (or your choice)
- **Region**: Oregon (or closest to you)
- **Branch**: `main`
- **Build Command**: 
  ```bash
  npm install && npm run build
  ```
- **Start Command**:
  ```bash
  npm start
  ```

### 3. Environment Variables

Click **Environment** → **Add Environment Variable**

Copy ALL variables from your `.env` file:

```env
NODE_ENV=production
PORT=3000
API_KEY=your-api-key

AZURE_TENANT_ID=...
AZURE_CLIENT_ID=...
AZURE_CLIENT_SECRET=...
GRAPH_TARGET_USER_ID=...

MONGODB_URI=...
MONGODB_DB_NAME=sprint_agent
STANDUPTICKETS_MONGODB_URI=...

OPENAI_API_KEY=...
OPENAI_MODEL=gpt-5-nano
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

JIRA_HOST=...
JIRA_EMAIL=...
JIRA_API_TOKEN=...
JIRA_PROJECT_KEY=TDS
JIRA_BOARD_ID=1

TEAMS_WEBHOOK_URL=...
TEAMS_TEAM_ID=...
TEAMS_STANDUP_SUBJECT_FILTER=Stand-Up

ONEDRIVE_SPRINT_PLANS_FOLDER_ID=...
ONEDRIVE_ARCHIVE_FOLDER_ID=...

TEAM_ROSTER=[{"name":"...","jiraAccountId":"...","role":"..."}]
```

### 4. Deploy

1. Click **Create Web Service**
2. Wait 2-3 minutes for deployment
3. **Note your app URL**: `https://pm-agent-xxxx.onrender.com`

---

## Setup GitHub Actions

### 1. Add Repository Secrets

Go to **GitHub Repository → Settings → Secrets and variables → Actions**

Add two secrets:

**Secret 1:**
- Name: `PM_AGENT_API_URL`
- Value: Your Render URL (e.g., `https://pm-agent-xxxx.onrender.com`)

**Secret 2:**
- Name: `PM_AGENT_API_KEY`  
- Value: Same as `API_KEY` in your `.env` file

### 2. Enable Workflows

1. Go to **Actions** tab
2. Find "Daily Ingestion" workflow → Enable
3. Find "Weekly Sprint Plan Generation" workflow → Enable

### 3. Test Workflows

**Test Daily Ingestion:**
1. Actions → "Daily Ingestion"
2. Click **Run workflow** → **Run workflow**
3. Wait ~30 seconds
4. Check logs for success ✅

**Test Sprint Plan:**
1. Actions → "Weekly Sprint Plan Generation"  
2. Click **Run workflow** → **Run workflow**
3. Wait ~3 minutes
4. Check Teams for notification
5. Approve in admin panel

---

## Automated Schedule

Once deployed, the system runs automatically:

**Monday-Friday at 2 PM PST:**
- Daily ingestion runs
- Reads transcript, generates summary
- Saves to MongoDB

**Friday at 2 PM PST:**
- Sprint plan generation runs
- Generates plan, uploads to OneDrive
- Sends Teams notification
- **You approve in admin panel**
- System creates Jira tasks

---

## Verify Deployment

1. **Health Check**: Visit `https://your-render-url.onrender.com/api/health`
2. **GitHub Actions**: Check workflows are enabled
3. **Manual Test**: Trigger daily ingestion workflow
4. **Check Logs**: Render dashboard → Logs tab

---

## Troubleshooting

### Render app won't start
- Check Logs tab in Render dashboard
- Verify all environment variables are set
- Ensure MongoDB connection strings are correct

### GitHub Actions fail
- Verify secrets are set correctly in GitHub
- Check Render app is accessible
- View workflow logs for details

### API timeouts
- Render free tier spins down after 15min inactivity
- First request takes ~1 minute to wake up
- Consider upgrading to paid tier for always-on

---

## Update Deployed App

Push changes to GitHub `main` branch:

```bash
git add .
git commit -m "Update PM agent"
git push origin main
```

Render automatically:
1. Detects the push
2. Rebuilds the app
3. Redeploys (~2-3 minutes)

---

## Cost

**Render Free Tier:**
- ✅ Sufficient for this use case
- ⚠️ Spins down after 15min inactivity  
- ⚠️ 750 hours/month limit

**Render Starter ($7/month):**
- Always-on (recommended for production)
- No spin-down delays
