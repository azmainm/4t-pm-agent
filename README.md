# PM Agent - Automated Sprint Planning System

> Intelligent sprint planning automation that transforms daily standup transcripts into comprehensive sprint plans with seamless Jira integration.

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=flat&logo=openai&logoColor=white)](https://openai.com/)

---

## 🎯 Overview

PM Agent automates the entire sprint planning workflow for software development teams:

1. **Daily Ingestion** (Mon-Fri) - Reads standup transcripts, generates AI-powered summaries
2. **Sprint Plan Generation** (Fridays) - Creates comprehensive 2-week sprint plans
3. **Admin Approval** - Review and approve via web interface
4. **Jira Integration** - Automatically creates and assigns tasks

**Result:** Sprint planning reduced from hours to minutes, with better context and consistency.

---

## ✨ Features

### Core Capabilities
- 🤖 **AI-Powered Summarization** - GPT-5-nano generates daily standup summaries
- 📊 **Intelligent Sprint Planning** - Multi-pass analysis of summaries, Teams messages, and previous plans
- 📝 **Document Management** - Generates DOCX files, uploads to OneDrive, archives old plans
- ✅ **Jira Integration** - Creates tasks with assignees, story points, and acceptance criteria
- 💬 **Teams Notifications** - Sends approval requests and confirmations
- 🎨 **Admin Panel** - Web interface for reviewing and approving sprint plans

### Technical Features
- 🔄 **Automated Scheduling** - GitHub Actions triggers daily/weekly workflows
- 🗄️ **MongoDB Storage** - Persistent data for summaries and sprint plans
- 🔐 **Microsoft Graph API** - Reads Teams messages, manages OneDrive files
- 📊 **Structured Logging** - Pino logger with request tracing
- 🛡️ **API Key Auth** - Secure endpoint protection

---

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Standup        │────▶│   PM Agent       │────▶│   Sprint Plan   │
│  Transcripts    │     │   (NestJS API)   │     │   (MongoDB)     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ├──▶ GPT-5-nano (Summarization)
                               ├──▶ Teams (Read messages)
                               ├──▶ OneDrive (Documents)
                               └──▶ Jira (Create tasks)

┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  GitHub Actions │────▶│   Triggers       │────▶│  Admin Panel    │
│  (Scheduled)    │     │   (Webhooks)     │     │  (Approval)     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

**Data Flow:**
1. Daily standup transcript → Read from MongoDB
2. GPT-5-nano → Generate summary
3. Summary → Save to MongoDB
4. Friday → Analyze last 10 summaries + Teams messages + previous plan
5. GPT-5-nano → Generate sprint plan
6. OneDrive → Upload DOCX, archive old files
7. Teams → Send notification
8. Admin → Approve plan
9. Jira → Create tasks automatically

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Azure AD app registration (for Teams/OneDrive)
- Jira Cloud account
- OpenAI API key

### Installation

```bash
# Clone repository
git clone <your-repo-url>
cd pm-agent

# Install dependencies
npm install

# Copy environment template
cp .env.template .env
# Edit .env with your credentials

# Build
npm run build

# Start
npm start
```

The API will be available at `http://localhost:3000`

### Verify Setup

```bash
# Check health
curl http://localhost:3000/api/health

# Test daily ingestion
curl -X POST -H "x-api-key: your-api-key" http://localhost:3000/api/ingestion/run

# Test sprint plan generation
curl -X POST -H "x-api-key: your-api-key" http://localhost:3000/api/sprint-plan/generate
```

---

## 📋 API Endpoints

### Ingestion
- `POST /api/ingestion/run` - Run daily ingestion

### Sprint Planning
- `POST /api/sprint-plan/generate` - Generate sprint plan
- `GET /api/sprint-plan/list` - List all sprint plans
- `POST /api/sprint-plan/approve` - Approve sprint plan

### Health
- `GET /api/health` - Health check

**Authentication:** All endpoints require `x-api-key` header.

---

## ⚙️ Configuration

### Environment Variables

See `.env.template` for all required variables:

- **Azure AD**: Tenant ID, Client ID, Client Secret
- **MongoDB**: Connection strings for both databases
- **OpenAI**: API key and model selection
- **Jira**: Host, email, API token, project key
- **Teams**: Webhook URL, team ID
- **OneDrive**: Folder IDs for sprint plans and archive
- **Team Roster**: JSON array of team members with Jira IDs

### Team Roster Format

```json
[
  {
    "name": "John Doe",
    "jiraAccountId": "712020:...",
    "role": "Lead"
  }
]
```

---

## 🔄 Automated Workflows

### Daily Ingestion (Mon-Fri @ 2 PM PST)

GitHub Action triggers → Calls `/api/ingestion/run`

**What it does:**
1. Fetches latest standup transcript from MongoDB
2. Generates summary using GPT-5-nano
3. Saves summary to `sprint_agent` database
4. Logs completion

### Weekly Sprint Plan (Fri @ 2 PM PST)

GitHub Action triggers → Calls `/api/sprint-plan/generate`

**What it does:**
1. Fetches last 10 daily summaries
2. Reads Teams channel messages (last 14 days)
3. Downloads previous sprint plan from OneDrive
4. Runs multi-pass GPT-5-nano analysis
5. Generates comprehensive sprint plan
6. Creates DOCX document
7. Uploads to OneDrive, archives old files
8. Saves plan to MongoDB
9. Sends Teams notification for approval

### Manual Approval (After Notification)

Admin opens web panel → Reviews plan → Clicks "Approve"

**What it does:**
1. Creates Jira tasks for all plan items
2. Assigns tasks to team members
3. Sets task status to "TO DO"
4. Adds tasks to active sprint
5. Sends Teams confirmation
6. Updates plan status to "approved"

---

## 📦 Tech Stack

### Backend
- **Framework**: NestJS 10
- **Language**: TypeScript
- **Runtime**: Node.js 18+

### Database
- **Primary**: MongoDB Atlas
- **Schema**: Mongoose ODM
- **Collections**: `dailySummaries`, `sprintPlans`, `agentRuns`

### AI/LLM
- **Provider**: OpenAI
- **Model**: GPT-5-nano (Responses API)
- **Use Cases**: Summarization, sprint plan generation

### Integrations
- **Microsoft Graph API**: Teams messages, OneDrive files
- **Jira Cloud API**: Task creation, sprint management
- **Teams Webhooks**: Notifications

### DevOps
- **CI/CD**: GitHub Actions
- **Hosting**: Render.com (or Railway, Azure)
- **Logging**: Pino structured JSON logs

---

## 📚 Documentation

- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Deploy to Render with GitHub Actions
- **[API Setup](./docs/API_SETUP_GUIDE.md)** - Detailed API configuration
- **[Architecture](./docs/END_TO_END_ARCHITECTURE.md)** - Complete system design
- **[Test Results](./docs/TEST_RESULTS.md)** - Comprehensive testing documentation
- **[Test Evidence](./docs/DETAILED_TEST_EVIDENCE.md)** - Step-by-step verification

---

## 🚢 Deployment

### Quick Deploy to Render

1. **Create Web Service on Render**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Add all environment variables from `.env`

2. **Setup GitHub Actions**
   - Add secrets: `PM_AGENT_API_URL`, `PM_AGENT_API_KEY`
   - Enable workflows in Actions tab

3. **Test**
   - Manually trigger "Daily Ingestion" workflow
   - Verify logs show success

**See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed instructions.**

---

## 🧪 Testing

### Run Tests

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Manual Testing

```bash
# Test daily ingestion
npm run test:ingestion

# Test sprint plan generation
npm run test:sprint-plan
```

---

## 🛠️ Development

### Project Structure

```
src/
├── auth/              # MS Graph authentication
├── common/            # Shared utilities, guards, filters
├── config/            # Configuration modules
├── database/          # MongoDB repositories and schemas
├── docx/              # DOCX generation service
├── graph/             # Microsoft Graph API services
├── ingestion/         # Daily ingestion logic
├── jira/              # Jira integration
├── llm/               # OpenAI services, agent logic
├── notification/      # Teams notification service
├── sprint-plan/       # Sprint planning service
└── main.ts            # Application entry point
```

### Code Style

- ESLint + Prettier configured
- Run `npm run lint` before committing
- Run `npm run format` to auto-fix

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Commit changes
git add .
git commit -m "feat: your feature description"

# Push and create PR
git push origin feature/your-feature
```

---

## 🐛 Troubleshooting

### Common Issues

**MongoDB connection fails:**
- Verify connection strings in `.env`
- Check MongoDB Atlas IP whitelist (allow all: `0.0.0.0/0`)
- Ensure network access is enabled

**Azure AD authentication fails:**
- Verify tenant ID, client ID, client secret
- Check API permissions are granted and admin consented
- Ensure `ChannelSettings.Read.All` and `Files.ReadWrite.All` are added

**Jira task creation fails:**
- Verify Jira account ID format in team roster
- Check project key and board ID are correct
- Ensure API token has write permissions

**GPT-5-nano responses are invalid:**
- Check API key is valid
- Verify model name is exactly `gpt-5-nano`
- Check OpenAI API rate limits

---

## 📝 License

Proprietary - 4Trades.ai

---

## 👥 Team

- **Azmain Morshed** - Lead Developer
- **Shafkat Kabir** - Developer
- **Faiyaz Rahman** - Developer

---

## 🆘 Support

For issues or questions:
1. Check [documentation](./docs/)
2. Review [test results](./docs/TEST_RESULTS.md)
3. Check Render logs for errors
4. Contact team lead

---

**Built with ❤️ by 4Trades.ai**
