# API Setup Guide

Complete step-by-step guide for setting up all required APIs and credentials.

## 1. Azure AD App Registration (Microsoft Graph)

### Step 1.1: Create App Registration

1. Go to [Azure Portal](https://portal.azure.com) → Azure Active Directory → App registrations
2. Click **New registration**
3. Fill in:
   - **Name**: `Sprint Planning Agent`
   - **Supported account types**: Single tenant
   - **Redirect URI**: Leave blank for now
4. Click **Register**

### Step 1.2: Configure API Permissions

1. In your new app, go to **API permissions**
2. Click **Add a permission** → **Microsoft Graph** → **Application permissions**
3. Add these permissions:
   - `Calendars.Read`
   - `OnlineMeetings.Read.All`
   - `OnlineMeetingTranscript.Read.All`
   - `ChannelMessage.Read.All`
   - `Chat.Read`
   - `Files.ReadWrite.All`
4. Click **Grant admin consent for [Your Organization]**
   - **Important**: You need Global Admin or Application Admin role
   - Wait for all permissions to show green checkmarks

### Step 1.3: Create Client Secret

1. Go to **Certificates & secrets**
2. Click **New client secret**
3. Description: `Sprint Agent Secret`
4. Expires: Choose duration (recommend 12-24 months)
5. Click **Add**
6. **Copy the Value immediately** - you won't see it again!

### Step 1.4: Get Required IDs

**Tenant ID**:
- In app overview page, copy **Directory (tenant) ID**

**Client ID**:
- In app overview page, copy **Application (client) ID**

**Target User ID**:
- Go to Azure AD → Users → find the user whose calendar/meetings to access
- Click on user → copy **Object ID**
- This should be a user who attends the standup meetings

---

## 2. MongoDB Atlas Setup

### Step 2.1: Create Cluster

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Sign in or create account
3. Click **Build a Database**
4. Choose **M0 Free** tier (or higher for production)
5. Pick a cloud provider and region (choose closest to your server)
6. Cluster name: `sprint-agent-cluster`
7. Click **Create**

### Step 2.2: Configure Network Access

1. Go to **Network Access** in left sidebar
2. Click **Add IP Address**
3. For development: **Allow Access from Anywhere** (0.0.0.0/0)
4. For production: Add your server's IP address

### Step 2.3: Create Database User

1. Go to **Database Access**
2. Click **Add New Database User**
3. Authentication Method: **Password**
4. Username: `sprint-agent`
5. Password: Generate a strong password and save it
6. Database User Privileges: **Atlas admin** (or custom `readWrite` to specific DB)
7. Click **Add User**

### Step 2.4: Get Connection String

1. Go to **Database** → Click **Connect** on your cluster
2. Choose **Connect your application**
3. Driver: **Node.js**
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Add database name at the end: `mongodb+srv://.../?retryWrites=true&w=majority/sprint_agent`

---

## 3. OpenAI API Setup

### Step 3.1: Get API Key

1. Go to [OpenAI Platform](https://platform.openai.com)
2. Sign in or create account
3. Go to **API keys** in left sidebar
4. Click **Create new secret key**
5. Name: `Sprint Planning Agent`
6. Copy the key immediately
7. **Important**: Verify you have access to GPT-5-nano model
   - Check models page or documentation
   - If not available, use `gpt-4-turbo` or `gpt-4o` as fallback

---

## 4. Jira Cloud Setup

### Step 4.1: Create API Token

1. Go to [Atlassian Account Settings](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Click **Create API token**
3. Label: `Sprint Planning Agent`
4. Copy the token immediately

### Step 4.2: Get Jira Details

**Jira Host**:
- Your Jira domain: `your-company.atlassian.net`

**Email**:
- The email address of your Atlassian account

**Project Key**:
- Go to your Jira project
- The key is in the URL: `https://your-company.atlassian.net/browse/PROJ`
- Copy the key (e.g., `PROJ`)

**Board ID**:
- Go to your Scrum/Kanban board
- URL will be: `.../jira/software/c/projects/PROJ/boards/123`
- Copy the number `123`

### Step 4.3: Get Team Member Jira Account IDs

For each team member:
1. Go to Jira → People (or Project → People)
2. Click on the person
3. URL will show: `.../jira/people/5f7a8b9c0d1e2f3g4h5i6j7k`
4. Copy the ID after `/people/`
5. Add to roster config with their name

Example roster JSON:
```json
[
  {
    "name": "Azmain Morshed",
    "jiraAccountId": "5f7a8b9c0d1e2f3g4h5i6j7k",
    "role": "Lead"
  },
  {
    "name": "Shafkat Kabir",
    "jiraAccountId": "6a8b9c0d1e2f3g4h5i6j7k8l",
    "role": "Dev"
  }
]
```

---

## 5. Microsoft Teams Webhook

### Step 5.1: Create Incoming Webhook

1. In Teams, go to the channel where you want notifications
2. Click **...** → **Connectors** → **Incoming Webhook**
3. Name: `Sprint Agent Alerts`
4. Upload an icon (optional)
5. Click **Create**
6. Copy the webhook URL

---

## 6. Microsoft OneDrive Folder Setup

### Step 6.1: Create Folder Structure

1. In OneDrive, create folder structure:
   ```
   /4Trades/
     /01 Business Operations/
       /Meetings & Planning/
         /Sprints & Weekly Plans/
           - (your sprint plan files will go here)
           /Archive/
             - (old sprint plans will be moved here)
   ```

### Step 6.2: Get Folder IDs

**Method 1: Using Graph Explorer**
1. Go to [Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer)
2. Sign in with the target user account
3. Run: `GET /me/drive/root/children`
4. Navigate folders until you find your target folder
5. Copy the `id` field

**Method 2: Using Browser**
1. Open OneDrive in browser
2. Navigate to "Sprints & Weekly Plans" folder
3. URL will be: `...onedrive.aspx?id=%2Fpersonal%2F...%2FDocuments%2F4Trades%2F...&view=0`
4. The ID is encoded in the URL - use Graph Explorer method for cleaner ID

**Easier Method: Use the App**
Once the app is running, you can use this endpoint to find folder IDs:
```bash
curl -H "x-api-key: YOUR_KEY" http://localhost:3000/api/onedrive/list-folders
```

---

## 7. Microsoft Teams Configuration

### Step 7.1: Get Team ID

1. Open Teams in browser
2. Go to your team
3. Click **...** → **Get link to team**
4. URL contains team ID: `...groupId=a1b2c3d4-e5f6-...`
5. Copy the GUID after `groupId=`

### Step 7.2: Get Channel IDs

1. Open channel in Teams web
2. URL will be: `...?threadId=19%3A...%40thread.tacv2&ctx=channel`
3. The part after `threadId=` is the channel ID
4. Decode the URL encoding (or use Graph Explorer)
5. Collect IDs for all channels you want to monitor

**Easier Method: Use Graph Explorer**
```
GET /teams/{team-id}/channels
```

### Step 7.3: Get Chat IDs

**For group chats**:
```
GET /me/chats
```
Filter by chat type and participants.

---

## 8. Fill in .env File

Now populate your `.env` file with all collected values:

```bash
# Application
NODE_ENV=development
PORT=3000
API_KEY=generate-a-strong-random-key-here

# Azure AD
AZURE_TENANT_ID=your-tenant-id-from-step-1
AZURE_CLIENT_ID=your-client-id-from-step-1
AZURE_CLIENT_SECRET=your-client-secret-from-step-1
GRAPH_TARGET_USER_ID=your-target-user-id-from-step-1

# MongoDB
MONGODB_URI=your-connection-string-from-step-2
MONGODB_DB_NAME=sprint_agent

# OpenAI
OPENAI_API_KEY=your-openai-key-from-step-3
OPENAI_MODEL=gpt-5-nano
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# Jira
JIRA_HOST=your-company.atlassian.net
JIRA_EMAIL=your-email@company.com
JIRA_API_TOKEN=your-jira-token-from-step-4
JIRA_PROJECT_KEY=PROJ
JIRA_BOARD_ID=123

# Teams
TEAMS_WEBHOOK_URL=your-webhook-url-from-step-5
TEAMS_TEAM_ID=your-team-id-from-step-7
TEAMS_CHANNEL_IDS=channel-id-1,channel-id-2
TEAMS_CHAT_IDS=chat-id-1,chat-id-2
TEAMS_STANDUP_SUBJECT_FILTER=Daily Standup

# OneDrive
ONEDRIVE_SPRINT_PLANS_FOLDER_ID=your-folder-id-from-step-6
ONEDRIVE_ARCHIVE_FOLDER_ID=your-archive-folder-id-from-step-6

# Team Roster
TEAM_ROSTER=[{"name":"Azmain Morshed","jiraAccountId":"5f7a...","role":"Lead"}]
```

---

## 9. Verify Setup

### Step 9.1: Test Graph API Access

```bash
npm run start:dev
curl http://localhost:3000/health
```

Should return `200 OK` with health status.

### Step 9.2: Test Manual Ingestion

```bash
curl -X POST -H "x-api-key: YOUR_API_KEY" http://localhost:3000/api/ingestion/run
```

Check logs for any errors.

### Step 9.3: Test Sprint Plan Generation

```bash
curl -X POST -H "x-api-key: YOUR_API_KEY" http://localhost:3000/api/sprint-plan/generate
```

---

## Troubleshooting

**Graph API 401 Unauthorized**: Check client ID/secret/tenant ID are correct.

**Graph API 403 Forbidden**: Admin consent not granted - ask your IT admin.

**MongoDB connection failed**: Check network access whitelist and connection string.

**OpenAI API error**: Verify API key and check you have credits/usage limits.

**Jira authentication failed**: Ensure email + API token are correct (not password!).

**Transcripts not found**: Enable transcription in Teams admin center first.

---

You're all set! The agent is now configured and ready to run.
