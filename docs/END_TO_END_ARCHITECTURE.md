# PM Agent - End-to-End Architecture

**Last Updated:** February 10, 2026  
**Version:** 1.0.0  
**Purpose:** Complete system architecture showing all components, data flows, and integrations

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Component Architecture](#component-architecture)
3. [Data Flow Diagrams](#data-flow-diagrams)
4. [Daily Ingestion Flow](#daily-ingestion-flow)
5. [Weekly Sprint Plan Flow](#weekly-sprint-plan-flow)
6. [Approval Flow](#approval-flow)
7. [Database Schema](#database-schema)
8. [External Integrations](#external-integrations)
9. [Security & Authentication](#security--authentication)
10. [Deployment Architecture](#deployment-architecture)

---

## System Overview

### Purpose

The PM Agent automates sprint planning by:
1. Ingesting daily standup transcripts
2. Generating intelligent summaries
3. Creating comprehensive sprint plans
4. Facilitating approval workflows
5. Creating Jira tasks automatically

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        TRIGGER LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  GitHub Actions (Cron)  │  Manual API Calls  │  Admin Panel     │
└────────────┬─────────────────────┬──────────────────────┬────────┘
             │                     │                      │
             v                     v                      v
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                    PM Agent API (NestJS)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Ingestion   │  │ Sprint Plan  │  │  Approval    │          │
│  │  Service     │  │  Service     │  │  Service     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└────────────┬─────────────────────┬──────────────────────┬────────┘
             │                     │                      │
             v                     v                      v
┌─────────────────────────────────────────────────────────────────┐
│                      PROCESSING LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   OpenAI     │  │  Multi-Pass  │  │    DOCX      │          │
│  │  GPT-5-Nano  │  │   Analysis   │  │  Generator   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└────────────┬─────────────────────┬──────────────────────┬────────┘
             │                     │                      │
             v                     v                      v
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   MongoDB    │  │   MongoDB    │  │   OneDrive   │          │
│  │ standuptickets│  │ sprint_agent │  │  (Azure)     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└────────────┬─────────────────────┬──────────────────────┬────────┘
             │                     │                      │
             v                     v                      v
┌─────────────────────────────────────────────────────────────────┐
│                    INTEGRATION LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │     Jira     │  │    Teams     │  │  MS Graph    │          │
│  │     API      │  │   Webhook    │  │     API      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### Backend (PM Agent API)

**Technology:** NestJS (TypeScript)  
**Runtime:** Node.js 20+  
**Port:** 3000

#### Modules

```
src/
├── app.module.ts              # Root module
├── main.ts                    # Application entry point
│
├── ingestion/                 # Daily transcript ingestion
│   ├── ingestion.controller.ts
│   ├── ingestion.service.ts
│   └── ingestion.module.ts
│
├── sprint-plan/               # Sprint plan generation & approval
│   ├── sprint-plan.controller.ts
│   ├── sprint-plan.service.ts
│   └── sprint-plan.module.ts
│
├── llm/                       # AI/LLM services
│   ├── openai.service.ts      # GPT-5-nano integration
│   ├── summarization.service.ts
│   └── agent/
│       ├── react-agent.service.ts
│       ├── prompts/
│       └── tools/
│
├── database/                  # MongoDB integration
│   ├── repositories/
│   └── schemas/
│
├── graph/                     # Microsoft Graph API
│   ├── onedrive.service.ts
│   ├── teams-channel.service.ts
│   └── teams-chat.service.ts
│
├── jira/                      # Jira integration
│   └── jira.service.ts
│
├── docx/                      # Document generation
│   └── docx-generator.service.ts
│
└── notification/              # Teams notifications
    └── notification.service.ts
```

### Frontend (Admin Panel)

**Technology:** Next.js 14 (TypeScript)  
**UI Framework:** Tailwind CSS + shadcn/ui  
**Deployment:** Vercel

#### Pages

```
src/app/dashboard/
└── sprint-plan-approval/
    └── page.tsx              # Sprint plan review & approval
```

### Automation

**Technology:** GitHub Actions  
**Triggers:** Cron schedules

```
.github/workflows/
├── daily-ingestion.yml       # Weekdays 2 PM PST
└── weekly-sprint-plan.yml    # Fridays 2 PM PST
```

---

## Data Flow Diagrams

### Overall System Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│ 1. DAILY FLOW (Weekdays 2 PM PST)                                   │
└──────────────────────────────────────────────────────────────────────┘
                                   
  GitHub Actions         PM Agent API          standuptickets DB
       │                      │                       │
       │  POST /ingestion/run │                       │
       ├─────────────────────>│                       │
       │                      │  Query transcripts    │
       │                      ├──────────────────────>│
       │                      │<──────────────────────┤
       │                      │   transcript_data     │
       │                      │                       │
       │                      │                       │
       │                  OpenAI API           sprint_agent DB
       │                      │                       │
       │                      │  Summarize (GPT-5)    │
       │                      ├──────────────────────>│
       │                      │<──────────────────────┤
       │                      │    Summary JSON       │
       │                      │                       │
       │                      │  Save dailySummaries  │
       │                      ├──────────────────────>│
       │                      │<──────────────────────┤
       │<─────────────────────┤                       │
       │    Success Response  │                       │


┌──────────────────────────────────────────────────────────────────────┐
│ 2. WEEKLY FLOW (Fridays 2 PM PST)                                   │
└──────────────────────────────────────────────────────────────────────┘

  GitHub Actions         PM Agent API          sprint_agent DB
       │                      │                       │
       │ POST /sprint-plan/gen│                       │
       ├─────────────────────>│                       │
       │                      │  Fetch 10 summaries   │
       │                      ├──────────────────────>│
       │                      │<──────────────────────┤
       │                      │                       │
       │                  MS Graph API        Teams Messages
       │                      │                       │
       │                      │  Fetch messages (14d) │
       │                      ├──────────────────────>│
       │                      │<──────────────────────┤
       │                      │                       │
       │                   OneDrive           Previous Plan
       │                      │                       │
       │                      │  Download plan.docx   │
       │                      ├──────────────────────>│
       │                      │<──────────────────────┤
       │                      │                       │
       │                  OpenAI API          4 LLM Passes
       │                      │                       │
       │                      │  Multi-pass analysis  │
       │                      ├──────────────────────>│
       │                      │<──────────────────────┤
       │                      │    Sprint plan JSON   │
       │                      │                       │
       │                      │  Generate DOCX        │
       │                      │  (internal)           │
       │                      │                       │
       │                   OneDrive           Upload
       │                      │                       │
       │                      │  Upload new plan      │
       │                      ├──────────────────────>│
       │                      │  Archive old files    │
       │                      ├──────────────────────>│
       │                      │                       │
       │                      │  Save sprintPlans     │
       │                      ├──────────────────────>│
       │                      │<──────────────────────┤
       │                      │                       │
       │                  Teams Webhook       Notification
       │                      │                       │
       │                      │  Send notification    │
       │                      ├──────────────────────>│
       │<─────────────────────┤                       │
       │    Success + Plan ID │                       │


┌──────────────────────────────────────────────────────────────────────┐
│ 3. APPROVAL FLOW (Manual via Admin Panel)                           │
└──────────────────────────────────────────────────────────────────────┘

   Admin Panel           PM Agent API          sprint_agent DB
       │                      │                       │
       │  GET /sprint-plan/list                       │
       ├─────────────────────>│                       │
       │                      │  Query sprintPlans    │
       │                      ├──────────────────────>│
       │                      │<──────────────────────┤
       │<─────────────────────┤  Plans array          │
       │  Display plans       │                       │
       │                      │                       │
       │  [User clicks Approve]                       │
       │                      │                       │
       │  POST /sprint-plan/approve                   │
       ├─────────────────────>│                       │
       │                      │  Get plan by ID       │
       │                      ├──────────────────────>│
       │                      │<──────────────────────┤
       │                      │  Plan data            │
       │                      │                       │
       │                   Jira API           Create Tasks
       │                      │                       │
       │                      │  Create issues        │
       │                      ├──────────────────────>│
       │                      │  Assign to sprint     │
       │                      ├──────────────────────>│
       │                      │  Assign to team       │
       │                      ├──────────────────────>│
       │                      │<──────────────────────┤
       │                      │  Issue keys           │
       │                      │                       │
       │                      │  Update plan status   │
       │                      ├──────────────────────>│
       │                      │<──────────────────────┤
       │                      │                       │
       │                  Teams Webhook       Success
       │                      │                       │
       │                      │  Send success msg     │
       │                      ├──────────────────────>│
       │<─────────────────────┤                       │
       │  Success + Jira keys │                       │
```

---

## Daily Ingestion Flow

### Detailed Steps

```
START: GitHub Actions Trigger (Weekdays 2 PM PST)
  │
  ├─> POST /api/ingestion/run
  │   Headers: { x-api-key: "***" }
  │
  ├─> IngestionController.runIngestion()
  │     │
  │     ├─> IngestionService.runDailyIngestion()
  │     │     │
  │     │     ├─> Step 1: Create AgentRun record
  │     │     │     Database: sprint_agent.agentRuns
  │     │     │     Data: { runId, runType: "ingestion", status: "running" }
  │     │     │
  │     │     ├─> Step 2: Fetch Today's Transcript
  │     │     │     Database: standuptickets.transcripts
  │     │     │     Query: { date: today }
  │     │     │     Result: { transcript_data: [...], participants: [...] }
  │     │     │
  │     │     ├─> Step 3: Check for Existing Summary
  │     │     │     Database: sprint_agent.dailySummaries
  │     │     │     Query: { date: today }
  │     │     │     If exists: Return early (skip generation)
  │     │     │
  │     │     ├─> Step 4: Generate Summary with GPT-5-nano
  │     │     │     │
  │     │     │     ├─> OpenaiService.chatCompletion()
  │     │     │     │     API: https://api.openai.com/v1/responses
  │     │     │     │     Model: gpt-5-nano
  │     │     │     │     Input: Transcript segments (47KB)
  │     │     │     │     Prompt: SUMMARIZATION_PROMPT
  │     │     │     │     Duration: ~12 seconds
  │     │     │     │
  │     │     │     └─> Response: Structured JSON
  │     │     │           {
  │     │     │             overallSummary: "...",
  │     │     │             perPersonSummary: [...],
  │     │     │             actionItems: [...],
  │     │     │             decisions: [...],
  │     │     │             blockers: [...],
  │     │     │             keyTopics: [...]
  │     │     │           }
  │     │     │
  │     │     ├─> Step 5: Save Summary to Database
  │     │     │     Database: sprint_agent.dailySummaries
  │     │     │     Document: { date, transcriptId, ...summary }
  │     │     │     Size: <1KB
  │     │     │
  │     │     ├─> Step 6: Update AgentRun Status
  │     │     │     Database: sprint_agent.agentRuns
  │     │     │     Update: { status: "completed", steps: [...] }
  │     │     │
  │     │     └─> Return: { success: true, runId, summaryGenerated: true }
  │     │
  │     └─> Return HTTP 201 with result
  │
  └─> GitHub Actions: Check response, log result
```

### Data Transformations

**Input (Transcript):**
```javascript
{
  transcript_data: [
    { speaker: "Doug", timestamp: "00:00:15", text: "..." },
    { speaker: "Azmain", timestamp: "00:01:30", text: "..." },
    // ... 521 more segments
  ],
  duration: "47:25",
  participants: ["Doug", "Azmain", "Shafkat", "Faiyaz"]
}
```

**Output (Summary):**
```javascript
{
  date: ISODate("2026-02-09"),
  transcriptId: "698a324c7593a06fcdb1f98c",
  overallSummary: "3-paragraph summary...",
  actionItems: [
    "Fayaz to perform cost/benefit analysis",
    "Shafkat to research call forwarding",
    // ... more items
  ],
  decisions: [
    "Use CDN for audio delivery",
    "Set business hours for call routing"
  ],
  blockers: [
    "Unclear call-forwarding capabilities",
    "Access issues to CRM files"
  ],
  perPersonSummary: [
    {
      name: "Doug Whitewolff",
      summary: "Worked on referrals and storage options...",
      nextSteps: ["Report back with recommendation", ...]
    },
    // ... 3 more people
  ],
  keyTopics: ["Storage", "Telephony", "CRM", "Automation"],
  generatedAt: ISODate("2026-02-10T10:22:23.842Z")
}
```

---

## Weekly Sprint Plan Flow

### Detailed Steps

```
START: GitHub Actions Trigger (Fridays 2 PM PST)
  │
  ├─> POST /api/sprint-plan/generate
  │
  ├─> SprintPlanController.generateSprintPlan()
  │     │
  │     ├─> SprintPlanService.generateSprintPlan()
  │     │     │
  │     │     ├─> Step 1: Create AgentRun
  │     │     │     Database: sprint_agent.agentRuns
  │     │     │     Data: { runId, runType: "sprint_plan" }
  │     │     │
  │     │     ├─> Step 2: Fetch Last 10 Daily Summaries
  │     │     │     Database: sprint_agent.dailySummaries
  │     │     │     Query: Sort by date DESC, limit 10
  │     │     │     Result: Array of 10 summaries
  │     │     │     Duration: ~0.3 seconds
  │     │     │
  │     │     ├─> Step 3: Fetch Teams Messages (Last 14 Days)
  │     │     │     │
  │     │     │     ├─> TeamsChannelService.getChannelMessages()
  │     │     │     │     API: MS Graph /teams/{id}/channels
  │     │     │     │     Permission: ChannelSettings.Read.All
  │     │     │     │     Result: List of channels
  │     │     │     │
  │     │     │     ├─> For each channel:
  │     │     │     │     API: MS Graph /teams/{id}/channels/{id}/messages
  │     │     │     │     Permission: ChannelMessage.Read.All
  │     │     │     │     Filter: createdDateTime >= (today - 14 days)
  │     │     │     │     Result: ~50-100 messages
  │     │     │     │
  │     │     │     └─> TeamsChatService.getChatMessages()
  │     │     │           API: MS Graph /me/chats
  │     │     │           Result: ~8 chats with messages
  │     │     │
  │     │     ├─> Step 4: Download Previous Sprint Plan
  │     │     │     API: MS Graph /me/drive/items/{folderId}/children
  │     │     │     Filter: *.docx files
  │     │     │     Sort: Most recent first
  │     │     │     Download: Latest .docx file
  │     │     │     Parse: Extract text with mammoth
  │     │     │     Result: Previous plan text
  │     │     │
  │     │     ├─> Step 5: Multi-Pass LLM Analysis
  │     │     │     │
  │     │     │     ├─> Pass 1: Analyze Daily Summaries
  │     │     │     │     Input: 10 summaries concatenated
  │     │     │     │     Prompt: Extract patterns, goals, blockers
  │     │     │     │     Output: Structured analysis
  │     │     │     │     Duration: ~15 seconds
  │     │     │     │
  │     │     │     ├─> Pass 2: Analyze Teams Messages
  │     │     │     │     Input: Teams messages (chunked if >50)
  │     │     │     │     Prompt: Extract decisions, discussions
  │     │     │     │     Output: Key themes and decisions
  │     │     │     │     Duration: ~20 seconds
  │     │     │     │
  │     │     │     ├─> Pass 3: Analyze Previous Plan
  │     │     │     │     Input: Previous sprint plan text
  │     │     │     │     Prompt: Extract completed/incomplete tasks
  │     │     │     │     Output: Carryover analysis
  │     │     │     │     Duration: ~10 seconds
  │     │     │     │
  │     │     │     └─> Pass 4: Generate Final Sprint Plan
  │     │     │           Input: Results from passes 1-3
  │     │     │           Prompt: SPRINT_PLAN_PROMPT
  │     │     │           Output: Complete sprint plan JSON
  │     │     │           Duration: ~30 seconds
  │     │     │           Total: ~75 seconds
  │     │     │
  │     │     ├─> Step 6: Generate DOCX Document
  │     │     │     Service: DocxGeneratorService
  │     │     │     Input: Sprint plan JSON
  │     │     │     Output: Binary .docx file
  │     │     │     Format:
  │     │     │       - Title page with sprint dates
  │     │     │       - Goals and notes sections
  │     │     │       - Owner breakdown tables
  │     │     │       - Task details with acceptance criteria
  │     │     │     Duration: ~2 seconds
  │     │     │
  │     │     ├─> Step 7: Upload to OneDrive
  │     │     │     API: MS Graph /me/drive/items/{folderId}
  │     │     │     Method: Upload session for large files
  │     │     │     Filename: Sprint_{date}_Plan_v1.0.docx
  │     │     │     Result: File ID and web URL
  │     │     │     Duration: ~3 seconds
  │     │     │
  │     │     ├─> Step 8: Archive Old Files
  │     │     │     Query: List .docx and .md files in Sprint Plans folder
  │     │     │     Filter: Files older than new plan
  │     │     │     Action: Move to Archive folder
  │     │     │     Result: N files archived
  │     │     │
  │     │     ├─> Step 9: Save to Database
  │     │     │     Database: sprint_agent.sprintPlans
  │     │     │     Document: {
  │     │     │       sprintStartDate,
  │     │     │       sprintEndDate,
  │     │     │       planData: { goals, notes, ownerBreakdown },
  │     │     │       onedriveFileId,
  │     │     │       onedriveFileName,
  │     │     │       status: "generated"
  │     │     │     }
  │     │     │
  │     │     ├─> Step 10: Send Teams Notification
  │     │     │     API: Teams Incoming Webhook
  │     │     │     Message: "Sprint plan generated! Please review..."
  │     │     │     Link: Admin panel URL
  │     │     │     Duration: ~1 second
  │     │     │
  │     │     └─> Return: { success: true, runId, sprintPlanId }
  │     │
  │     └─> Return HTTP 201 with result
  │
  └─> GitHub Actions: Check response, notify team
```

### Context Window Management

**Challenge:** GPT-5-nano has 128K token limit, but we might have:
- 10 daily summaries × ~1K tokens = 10K tokens
- Teams messages × ~20 tokens each × 100 = 2K tokens
- Previous plan ~5K tokens
- Total: ~17K tokens input + ~4K tokens output = 21K tokens

**Solution:** Multi-pass analysis
- Each pass stays under 30K tokens
- Outputs are structured and compact
- Final pass only uses summarized inputs

---

## Approval Flow

### Detailed Steps

```
START: User Opens Admin Panel
  │
  ├─> Navigate to /dashboard/sprint-plan-approval
  │
  ├─> Frontend: GET /api/sprint-plan/list
  │     │
  │     ├─> SprintPlanController.listSprintPlans()
  │     │     │
  │     │     └─> SprintPlanService.listSprintPlans()
  │     │           Database: sprint_agent.sprintPlans
  │     │           Query: Sort by createdAt DESC, limit 20
  │     │           Transform: Calculate totalTasks, format dates
  │     │           Return: Array of plan summaries
  │     │
  │     └─> Response: { success: true, data: [...] }
  │
  ├─> Frontend: Display plans in table
  │     - Status badges (Draft, Pending, Approved, Archived)
  │     - Sprint dates, task counts
  │     - Action buttons (Details, Approve)
  │
  ├─> User clicks "Details" button
  │     Modal shows:
  │     - Primary goals
  │     - Notes
  │     - Statistics
  │     - OneDrive file name
  │     - Existing Jira issues (if approved)
  │
  ├─> User clicks "Approve" button
  │     │
  │     ├─> Confirmation dialog appears
  │     │     Message: "This will create Jira tasks..."
  │     │
  │     ├─> User confirms
  │     │
  │     └─> Frontend: POST /api/sprint-plan/approve
  │           Body: { sprintPlanId: "..." }
  │
  ├─> SprintPlanController.approveSprintPlan()
  │     │
  │     ├─> SprintPlanService.approveAndCreateJiraTasks()
  │     │     │
  │     │     ├─> Step 1: Get Sprint Plan from DB
  │     │     │     Database: sprint_agent.sprintPlans
  │     │     │     Query: findById(sprintPlanId)
  │     │     │
  │     │     ├─> Step 2: Extract Tasks
  │     │     │     Parse planData.ownerBreakdown
  │     │     │     For each owner → for each focus → for each task
  │     │     │     Result: Flat array of task objects
  │     │     │
  │     │     ├─> Step 3: Get Active Jira Sprint
  │     │     │     API: Jira REST /board/{id}/sprint
  │     │     │     Filter: state = "active"
  │     │     │     Result: Active sprint ID
  │     │     │
  │     │     ├─> Step 4: Create Jira Issues
  │     │     │     │
  │     │     │     └─> For each task:
  │     │     │           API: Jira REST /issue
  │     │     │           Body: {
  │     │     │             fields: {
  │     │     │               project: { key: "TDS" },
  │     │     │               summary: task.title,
  │     │     │               description: task.description,
  │     │     │               issuetype: { name: "Task" },
  │     │     │               assignee: { accountId: "..." },
  │     │     │               customfield_10016: task.points,
  │     │     │               priority: { name: task.priority }
  │     │     │             }
  │     │     │           }
  │     │     │           Result: Issue key (e.g., "TDS-123")
  │     │     │
  │     │     ├─> Step 5: Add Issues to Sprint
  │     │     │     API: Jira REST /sprint/{id}/issue
  │     │     │     Body: { issues: ["TDS-123", "TDS-124", ...] }
  │     │     │
  │     │     ├─> Step 6: Update Sprint Plan Status
  │     │     │     Database: sprint_agent.sprintPlans
  │     │     │     Update: {
  │     │     │       status: "approved",
  │     │     │       approvedAt: new Date(),
  │     │     │       jiraIssueKeys: ["TDS-123", ...]
  │     │     │     }
  │     │     │
  │     │     ├─> Step 7: Send Teams Notification
  │     │     │     API: Teams Webhook
  │     │     │     Message: "Sprint plan approved! N tasks created."
  │     │     │     Links: Jira sprint board URL
  │     │     │
  │     │     └─> Return: {
  │     │           success: true,
  │     │           jiraIssueKeys: [...],
  │     │           issueCount: N
  │     │         }
  │     │
  │     └─> Return HTTP 200 with result
  │
  ├─> Frontend: Show success toast
  │     Message: "Sprint plan approved and Jira tasks created!"
  │
  └─> Frontend: Refresh sprint plans list
        Plan now shows:
        - Status: "Approved"
        - Jira issue badges
        - Approval timestamp
```

---

## Database Schema

### sprint_agent Database

#### Collection: dailySummaries

```javascript
{
  _id: ObjectId,
  date: ISODate,                    // Date of standup (midnight UTC)
  transcriptId: String,             // Reference to standuptickets.transcripts
  overallSummary: String,           // 3-paragraph summary
  actionItems: [String],            // List of action items
  decisions: [String],              // List of decisions made
  blockers: [String],               // List of blockers mentioned
  perPersonSummary: [               // Per-person breakdown
    {
      name: String,                 // Person's name
      summary: String,              // What they worked on
      nextSteps: [String]           // Their commitments
    }
  ],
  keyTopics: [String],              // Main topics discussed
  generatedAt: ISODate              // When summary was generated
}

Indexes:
- date: 1 (unique)
- generatedAt: -1
```

**Average Size:** 800-1000 bytes  
**Growth Rate:** 1 document per weekday = ~22/month

#### Collection: sprintPlans

```javascript
{
  _id: ObjectId,
  sprintStartDate: ISODate,
  sprintEndDate: ISODate,
  planData: {
    sprintDateRange: {
      start: String,
      end: String
    },
    primaryGoals: [String],
    notes: [String],
    ownerBreakdown: [
      {
        name: String,
        focuses: [
          {
            focusName: String,
            goal: String,
            tasks: [
              {
                title: String,
                description: String,
                points: Number,
                priority: String,
                acceptanceCriteria: [String]
              }
            ]
          }
        ]
      }
    ]
  },
  onedriveFileId: String,
  onedriveFileName: String,
  status: String,                   // "draft" | "generated" | "approved" | "archived"
  approvedAt: ISODate,
  jiraIssueKeys: [String],
  extractedText: String,            // Cached text from DOCX
  createdAt: ISODate,               // Auto-generated by timestamps: true
  updatedAt: ISODate                // Auto-generated by timestamps: true
}

Indexes:
- sprintStartDate: -1
- status: 1
- createdAt: -1
```

**Average Size:** 5-10 KB  
**Growth Rate:** 1 document per week = ~4/month

#### Collection: agentRuns

```javascript
{
  _id: ObjectId,
  runId: String,                    // UUID
  runType: String,                  // "ingestion" | "sprint_plan"
  startedAt: ISODate,
  completedAt: ISODate,
  status: String,                   // "running" | "completed" | "failed"
  steps: [
    {
      stepName: String,
      startedAt: ISODate,
      completedAt: ISODate,
      success: Boolean,
      metadata: Mixed
    }
  ],
  error: String,
  metadata: Mixed
}

Indexes:
- runId: 1 (unique)
- runType: 1, startedAt: -1
- status: 1
```

**Average Size:** 500-2000 bytes  
**Growth Rate:** ~26 runs/month (22 daily + 4 weekly)

### standuptickets Database (Read-Only)

#### Collection: transcripts

```javascript
{
  _id: ObjectId,
  transcript_data: [
    {
      speaker: String,
      timestamp: String,
      text: String
    }
  ],
  created_at: ISODate,
  duration: String,
  participants: [String]
}

Access: READ ONLY
```

---

## External Integrations

### 1. OpenAI API

**Purpose:** GPT-5-nano for summarization and planning

**Endpoints Used:**
- `POST /v1/responses` - Responses API for gpt-5-nano

**Authentication:** Bearer token (API key)

**Request Format:**
```javascript
{
  model: "gpt-5-nano",
  input: "Combined prompt + content",
  max_output_tokens: 4000,
  reasoning: { effort: "minimal" }
}
```

**Response Format:**
```javascript
{
  id: "resp_...",
  output: [
    { type: "reasoning", summary: [] },
    {
      type: "message",
      content: [
        { type: "output_text", text: "..." }
      ]
    }
  ],
  usage: { input_tokens: N, output_tokens: M }
}
```

**Rate Limits:** As per OpenAI tier
**Cost:** ~$0.02 per ingestion, ~$0.08 per sprint plan

### 2. Microsoft Graph API

**Purpose:** Teams messages, OneDrive files, Calendar

**Endpoints Used:**
- `GET /teams/{id}/channels` - List channels
- `GET /teams/{id}/channels/{id}/messages` - Get messages
- `GET /me/chats` - List chats
- `GET /me/chats/{id}/messages` - Get chat messages
- `GET /me/drive/items/{id}/children` - List OneDrive files
- `POST /me/drive/items/{id}/content` - Upload files
- `PATCH /me/drive/items/{id}` - Move files

**Authentication:** OAuth 2.0 with Azure AD
- Client credentials flow (application permissions)
- Access token refresh handled by MSAL

**Required Permissions:**
- `Files.ReadWrite.All` - OneDrive access
- `Chat.Read.All` - Read chat messages
- `ChannelMessage.Read.All` - Read channel messages
- `ChannelSettings.Read.All` - List channels ⚠️ **REQUIRED, NOT GRANTED YET**

### 3. Jira API

**Purpose:** Task creation, sprint management

**Endpoints Used:**
- `GET /rest/agile/1.0/board/{id}/sprint` - Get sprints
- `POST /rest/api/3/issue` - Create issue
- `POST /rest/agile/1.0/sprint/{id}/issue` - Add to sprint
- `GET /rest/api/3/project/{key}` - Get project details

**Authentication:** Basic Auth (email + API token)

**Issue Creation:**
```javascript
{
  fields: {
    project: { key: "TDS" },
    summary: "Task title",
    description: "Task description",
    issuetype: { name: "Task" },
    assignee: { accountId: "..." },
    customfield_10016: 5,          // Story points
    priority: { name: "High" }
  }
}
```

### 4. Teams Webhook

**Purpose:** Notifications

**Format:** Adaptive Card JSON
**Triggers:**
- Sprint plan generated
- Sprint plan approved
- Errors during processing

**Example:**
```javascript
{
  "@type": "MessageCard",
  "summary": "Sprint plan generated",
  "sections": [{
    "activityTitle": "New sprint plan ready for review",
    "facts": [
      { "name": "Sprint", "value": "Feb 14 - Feb 28" },
      { "name": "Tasks", "value": "23" }
    ]
  }],
  "potentialAction": [{
    "@type": "OpenUri",
    "name": "Review Plan",
    "targets": [{ "os": "default", "uri": "..." }]
  }]
}
```

---

## Security & Authentication

### API Authentication

**Method:** API Key in header
**Header:** `x-api-key: team-sec-41205-2026-pm`
**Validation:** ApiKeyGuard (NestJS)
**Scope:** All endpoints except health check

### Azure AD Authentication

**Flow:** Client Credentials (MSAL)
**Tenant:** Organization Azure AD
**Permissions:** Application permissions (not delegated)
**Token Refresh:** Automatic via MSAL library

### Database Security

**Connection:** MongoDB Atlas with TLS
**Authentication:** Username/password
**Network:** IP whitelist + VPC peering (recommended)
**Encryption:** At rest (Atlas default)

### Secrets Management

**Development:** `.env` file (gitignored)
**Production:** Environment variables or Azure Key Vault
**GitHub Actions:** Repository secrets

**Required Secrets:**
- `MONGODB_URI`
- `OPENAI_API_KEY`
- `AZURE_CLIENT_SECRET`
- `JIRA_API_TOKEN`
- `API_KEY`
- `TEAMS_WEBHOOK_URL`

---

## Deployment Architecture

### Option A: Azure Container Apps (Recommended)

```
┌─────────────────────────────────────────────────────────────────┐
│                        AZURE CLOUD                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────┐         ┌──────────────────────┐      │
│  │  Container Registry │         │  Container App Env   │      │
│  │                     │────────>│                      │      │
│  │  pm-agent:latest    │         │  ┌────────────────┐ │      │
│  └─────────────────────┘         │  │   pm-agent     │ │      │
│                                   │  │   (replicas)   │ │      │
│                                   │  └────────────────┘ │      │
│                                   └──────────────────────┘      │
│                                             │                    │
│                                             │                    │
│  ┌─────────────────────┐                   │                    │
│  │   Key Vault         │<──────────────────┘                    │
│  │   (Secrets)         │                                        │
│  └─────────────────────┘                                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
          │                          │                    │
          v                          v                    v
    MongoDB Atlas            OpenAI API           MS Graph API
```

**Benefits:**
- Auto-scaling
- Azure AD integration
- Managed certificates
- Built-in monitoring

### Option B: Railway/Render

```
┌─────────────────────────────────────────────────────────────────┐
│                     Railway/Render                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                      PM Agent                            │   │
│  │                                                          │   │
│  │  - Auto-deploy from GitHub                              │   │
│  │  - Environment variables from dashboard                 │   │
│  │  - HTTPS with auto cert                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
          │                          │                    │
          v                          v                    v
    MongoDB Atlas            OpenAI API           MS Graph API
```

**Benefits:**
- Simple setup
- GitHub integration
- Automatic deploys
- Lower cost

### Option C: Scheduled GitHub Actions

```
┌─────────────────────────────────────────────────────────────────┐
│                        GitHub                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────┐         ┌──────────────────────┐      │
│  │   Cron Schedule     │────────>│   GitHub Actions     │      │
│  │   (2 PM PST)        │         │   Runner             │      │
│  └─────────────────────┘         │                      │      │
│                                   │  1. Checkout code    │      │
│                                   │  2. npm install      │      │
│                                   │  3. npm build        │      │
│                                   │  4. Run service      │      │
│                                   └──────────────────────┘      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
          │                          │                    │
          v                          v                    v
    MongoDB Atlas            OpenAI API           MS Graph API
```

**Benefits:**
- Free
- No server management
- Secure (secrets in GitHub)

**Limitations:**
- No manual API calls
- 6-hour timeout per workflow
- Admin panel can't call API directly

---

## Monitoring & Observability

### Logging

**Library:** Pino (structured JSON logs)
**Levels:** DEBUG, INFO, WARN, ERROR
**Format:** JSON with timestamps and context

**Log Locations:**
- **Azure:** Application Insights
- **Railway/Render:** Dashboard logs
- **GitHub Actions:** Workflow run logs

### Metrics

**Key Metrics:**
- Request duration (p50, p95, p99)
- Success/failure rates
- OpenAI API latency
- Database query times
- Document generation time

### Alerts

**Triggers:**
- Daily ingestion failure
- Sprint plan generation failure
- Database connection errors
- OpenAI API errors

**Notifications:** Teams webhook

---

## Performance Characteristics

### Daily Ingestion

- **Duration:** 15-20 seconds
- **OpenAI API:** 12 seconds
- **Database:** 2-3 seconds
- **Total:** ~18 seconds

### Sprint Plan Generation

- **Duration:** 2-3 minutes
- **Fetch data:** 5-10 seconds
- **LLM analysis:** 75 seconds (4 passes)
- **DOCX generation:** 2 seconds
- **OneDrive upload:** 3 seconds
- **Total:** ~2 minutes

### Database Queries

- **List sprint plans:** <300ms
- **Fetch summaries:** <500ms
- **Save documents:** <200ms

---

## Scalability

### Current Capacity

- **Team size:** 5-10 people
- **Daily ingestions:** 22/month
- **Sprint plans:** 4/month
- **Database size:** <100 MB/year

### Scaling Considerations

**Horizontal Scaling:**
- Increase container replicas (1 → 3)
- Add load balancer
- Enable MongoDB sharding

**Vertical Scaling:**
- Increase CPU/memory (0.5 → 1.0 vCPU)
- Use faster MongoDB tier
- Add Redis caching layer

**When to Scale:**
- Multiple teams (>50 people)
- Multiple projects concurrently
- Real-time requirements

---

## Disaster Recovery

### Backup Strategy

**MongoDB:**
- Automated daily backups (Atlas)
- Point-in-time recovery available
- Cross-region replication

**OneDrive:**
- Built-in versioning
- Recycle bin retention (30 days)

### Recovery Procedures

**Database Loss:**
1. Restore from MongoDB Atlas backup
2. Verify data integrity
3. Resume operations

**Application Failure:**
1. Check logs for errors
2. Restart container/service
3. If persists, rollback to previous deployment

**Azure AD Token Expiry:**
1. MSAL automatically refreshes
2. Manual refresh: Restart application
3. Reauthorize if needed

---

## Cost Breakdown

### Monthly Costs (Estimated)

| Service | Cost |
|---------|------|
| Azure Container Apps | $10-20 |
| MongoDB Atlas (Free Tier) | $0 |
| OpenAI API (GPT-5-nano) | $0.76 |
| Azure AD (Included) | $0 |
| Jira API (Included) | $0 |
| Teams (Included) | $0 |
| **Total** | **$11-21/month** |

### Alternative: GitHub Actions Only

| Service | Cost |
|---------|------|
| GitHub Actions (Free Tier) | $0 |
| MongoDB Atlas (Free Tier) | $0 |
| OpenAI API (GPT-5-nano) | $0.76 |
| **Total** | **$0.76/month** |

---

## Future Enhancements

### Planned Features

1. **Dashboard Analytics**
   - Sprint velocity tracking
   - Blocker trends analysis
   - Team productivity metrics

2. **Enhanced AI**
   - Predictive story point estimation
   - Automatic task prioritization
   - Risk assessment

3. **Integrations**
   - Slack support
   - GitHub issue sync
   - Linear integration

4. **Automation**
   - Auto-assignment based on skills
   - Dependency detection
   - Sprint retrospective generation

---

## Conclusion

The PM Agent system provides end-to-end automation for sprint planning, from daily standup ingestion to Jira task creation. The architecture is designed for reliability, scalability, and maintainability.

**Key Strengths:**
- Modular design with clear separation of concerns
- Comprehensive error handling and logging
- Multiple deployment options
- Cost-effective operation
- Extensible for future enhancements

**Current Status:** Ready for deployment after Azure AD permission is added.
