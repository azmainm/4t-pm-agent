# Sprint Planning Agent

Autonomous agent that ingests Teams meeting transcripts, channel/chat messages, and the previous sprint plan across a 2-week sprint cycle to generate sprint plans and developer tasks.

## Features

- **Daily Ingestion (Mon-Fri at 2 PM PST)**
  - Fetches daily standup transcripts from Teams
  - Pulls Teams channel and chat messages (last 14 days)
  - Generates AI summaries of each standup using GPT-5-nano
  - Stores everything in MongoDB for sprint analysis

- **Weekly Sprint Plan Generation (Wednesday 10 PM PST)**
  - Loads 2 weeks of data: 8 transcripts + messages + previous sprint plan
  - Uses GPT-5-nano with ReAct agent pattern to analyze and generate plan
  - Compares actual work vs. previous sprint plan
  - Generates structured Word document with:
    - Sprint goals
    - Per-person task breakdown with points and acceptance criteria
    - Previous sprint review (completed/not completed/extra work)
  - Uploads to OneDrive and archives previous plan
  - Creates approval workflow via Teams notification
  - Auto-creates Jira tasks upon approval

## Architecture

Built with NestJS (TypeScript) following a clean, modular architecture:

```
src/
├── config/          # Configuration (Azure, OpenAI, Jira, Teams, OneDrive)
├── database/        # MongoDB schemas & repositories
├── auth/            # MS Graph authentication (MSAL)
├── graph/           # MS Graph API connectors (Calendar, Transcripts, Teams, OneDrive)
├── processing/      # VTT parsing, docx parsing, context building, embeddings
├── llm/             # OpenAI integration, summarization, ReAct agent
├── docx/            # Word document generation
├── jira/            # Jira REST API integration
├── notification/    # Teams webhook notifications
├── ingestion/       # Daily ingestion orchestration
├── sprint-plan/     # Sprint plan generation orchestration
└── common/          # Guards, interceptors, filters, utilities
```

## Prerequisites

1. **Azure AD App Registration**
   - Required MS Graph permissions:
     - `Calendars.Read`
     - `OnlineMeetings.Read.All`
     - `OnlineMeetingTranscript.Read.All`
     - `ChannelMessage.Read.All`
     - `Chat.Read`
     - `Files.ReadWrite`
   - Admin consent required for application permissions

2. **MongoDB Atlas Cluster**
   - Free tier works for development
   - Database name: `sprint_agent`

3. **OpenAI API Key**
   - Access to GPT-5-nano model

4. **Jira Cloud Account**
   - API token for issue creation
   - Project key and board ID

5. **Teams Webhook URL**
   - For error alerts and sprint plan notifications

6. **OneDrive Folder IDs**
   - Sprint plans folder ID
   - Archive folder ID

## Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.template .env

# Fill in .env with your credentials (see .env.template)

# Run in development mode
npm run start:dev

# Build for production
npm run build

# Start production
npm run start:prod
```

## Environment Variables

See `.env.template` for all required variables. Key sections:

- **Azure/MS Graph**: Tenant ID, Client ID, Client Secret, Target User ID
- **MongoDB**: Connection URI and database name
- **OpenAI**: API key and model name (gpt-5-nano)
- **Jira**: Host, email, API token, project key, board ID
- **Teams**: Webhook URL, team ID, channel IDs, chat IDs, standup subject filter
- **OneDrive**: Sprint plans folder ID, archive folder ID
- **Team Roster**: JSON array of team members with Jira account IDs

## API Endpoints

All endpoints require API key authentication via `x-api-key` header.

### Health Check (Public)
```bash
GET /health
```

### Trigger Daily Ingestion
```bash
POST /api/ingestion/run
Headers: x-api-key: <your-api-key>
```

### Generate Sprint Plan
```bash
POST /api/sprint-plan/generate
Headers: x-api-key: <your-api-key>
```

### Approve Sprint Plan & Create Jira Tasks
```bash
POST /api/sprint-plan/approve
Headers: x-api-key: <your-api-key>
Body: { "sprintPlanId": "<sprint-plan-id>" }
```

## Scheduling

For production deployment, set up cron jobs or scheduled tasks:

### Option 1: GitHub Actions
```yaml
# .github/workflows/daily-ingestion.yml
on:
  schedule:
    - cron: '0 22 * * 1-5'  # 2 PM PST (UTC+8)

# .github/workflows/sprint-plan.yml
on:
  schedule:
    - cron: '0 6 * * 4'  # 10 PM PST Wednesday (UTC+8)
```

### Option 2: Server Cron
```bash
# Daily ingestion at 2 PM PST
0 14 * * 1-5 curl -X POST -H "x-api-key: $API_KEY" https://your-domain/api/ingestion/run

# Sprint plan at 10 PM PST Wednesday
0 22 * * 3 curl -X POST -H "x-api-key: $API_KEY" https://your-domain/api/sprint-plan/generate
```

### Option 3: Add to NestJS app
Uncomment scheduler module in `app.module.ts` and use `@Cron()` decorators.

## Deployment

### Option 1: Render.com
1. Connect GitHub repo
2. Select "Web Service"
3. Build command: `npm install && npm run build`
4. Start command: `npm run start:prod`
5. Add environment variables from `.env.template`
6. Use paid tier to avoid cold starts for cron triggers

### Option 2: Azure App Service
1. Create App Service (Node.js)
2. Deploy via GitHub Actions or Azure CLI
3. Configure environment variables in App Settings
4. Set up Application Insights for monitoring

### Option 3: Docker
```bash
docker build -t pm-agent .
docker run -p 3000:3000 --env-file .env pm-agent
```

## Monitoring & Observability

- **Structured logging**: Pino JSON logs with request IDs
- **Agent runs**: Every execution stored in `agentRuns` collection with step-by-step timing
- **Teams alerts**: Failed runs automatically notify via webhook
- **Key metrics**: LLM token usage, API call counts, execution duration

## Development

```bash
# Run tests
npm test

# Run e2e tests
npm run test:e2e

# Lint and format
npm run lint
npm run format

# Type check
npm run build
```

## Troubleshooting

**Transcripts not available**: Wait 4+ hours after standup for Teams to process transcripts.

**Graph API 403 errors**: Verify admin consent is granted for all required permissions.

**Context too large**: Ensure daily summarization is working. Check `dailySummary` field in transcripts.

**Jira creation fails**: Verify team member names match Jira account IDs in roster config.

## License

MIT

## Support

For issues or questions, contact your team's dev lead or create an issue in the repo.
