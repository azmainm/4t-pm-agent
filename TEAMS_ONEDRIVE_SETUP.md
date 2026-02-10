# Teams & OneDrive Setup - Step by Step

## PART 1: Teams Webhook

**What it's for:** Agent sends you notifications in Teams (sprint plan ready, errors, approval needed)

### Steps:

1. Open Teams → Go to your channel (e.g., "4Trades Product Manager")
2. Click **...** at top of channel → Select **Workflows**
3. Search for **"Post to a channel when a webhook request is received"**
4. Click **Next**
5. Select your Team and Channel → Click **Add workflow**
6. Copy the webhook URL that appears
7. Put it in `.env` as `TEAMS_WEBHOOK_URL`

---

## PART 2: Team ID and Channel IDs

**What they're for:** Agent fetches messages from these channels to understand what team discussed

### Get Team ID:

1. Open Teams in browser (not desktop app)
2. Go to your team
3. Click **...** next to team name → **Get link to team**
4. URL will be: `https://teams.microsoft.com/l/team/19%3A...%40thread.tacv2/conversations?groupId=abc123-def456-...&tenantId=...`
5. Copy the GUID after `groupId=` → That's your `TEAMS_TEAM_ID`

### Get Channel IDs:

1. In same team, go to each channel you want to monitor
2. Click **...** next to channel name → **Get link to channel**
3. URL will have `threadId=19%3A...%40thread.tacv2`
4. Copy the part after `threadId=` → URL decode it (paste in urldecoder.org)
5. You'll get something like `19:abc123@thread.tacv2` → That's one channel ID
6. Repeat for each channel
7. Put all IDs in `.env` as `TEAMS_CHANNEL_IDS=id1,id2,id3`

**Example:**
```
TEAMS_TEAM_ID=a1b2c3d4-e5f6-7890-abcd-ef1234567890
TEAMS_CHANNEL_IDS=19:abc123def456@thread.tacv2,19:xyz789ghi012@thread.tacv2
```

---

## PART 3: OneDrive Folder IDs

**What they're for:** Agent uploads sprint plan docs here and moves old ones to Archive

### Method 1: Using the App (Easiest)

1. Fill in your `.env` with everything else first
2. Leave OneDrive IDs blank for now
3. Run: `npm run start:dev`
4. Open browser: `http://localhost:3000/api/onedrive/list-folders` (with API key header)
5. Find your folder IDs in the response

### Method 2: Using Graph Explorer (Manual)

1. Go to: https://developer.microsoft.com/en-us/graph/graph-explorer
2. Sign in with Doug's account (the target user)
3. Run this query:
   ```
   GET /me/drive/root:/4Trades/01 Business Operations/Meetings & Planning/Sprints & Weekly Plans:/children
   ```
4. Response shows all files/folders in that directory
5. Find the folder named "Archive" → Copy its `id` field
6. The parent folder's ID can be obtained by running:
   ```
   GET /me/drive/root:/4Trades/01 Business Operations/Meetings & Planning/Sprints & Weekly Plans
   ```
7. Copy the `id` from response

**Put in .env:**
```
ONEDRIVE_SPRINT_PLANS_FOLDER_ID=parent-folder-id-here
ONEDRIVE_ARCHIVE_FOLDER_ID=archive-folder-id-here
```

### Method 3: Using Browser (Quick but Messy)

1. Open OneDrive in browser
2. Navigate to your sprint plans folder
3. Right-click folder → **Details**
4. In URL bar, look for a long ID string
5. This method is unreliable - use Method 1 or 2 instead

---

## PART 4: Chat IDs (Optional - Can Skip for Now)

**What they're for:** Fetch messages from group chats (separate from channels)

**To get:**
1. Open group chat in Teams web
2. URL has `?chatId=19:abc...`
3. Copy the ID after `chatId=`
4. Add to `.env` as `TEAMS_CHAT_IDS=id1,id2`

**For now:** Leave this empty in .env: `TEAMS_CHAT_IDS=`

---

## Summary of What Goes in .env

```bash
# Teams
TEAMS_WEBHOOK_URL=https://your-company.webhook.office.com/webhookb2/abc123...
TEAMS_TEAM_ID=a1b2c3d4-e5f6-7890-abcd-ef1234567890
TEAMS_CHANNEL_IDS=19:abc123@thread.tacv2,19:xyz789@thread.tacv2
TEAMS_CHAT_IDS=
TEAMS_STANDUP_SUBJECT_FILTER=Daily Standup

# OneDrive
ONEDRIVE_SPRINT_PLANS_FOLDER_ID=01ABC123DEF456GHI789
ONEDRIVE_ARCHIVE_FOLDER_ID=01ZYX987WVU654TSR321
```
