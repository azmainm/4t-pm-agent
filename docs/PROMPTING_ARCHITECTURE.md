# PM Agent - Prompting Architecture

## Overview

The PM Agent uses GPT-5-nano with a **multi-pass prompting strategy** to handle large context windows and generate high-quality outputs. This document explains the complete prompting lifecycle.

---

## Prompting Lifecycle

### **1. Daily Ingestion (Mon-Fri)**

**Single Prompt - Direct Summarization**

```
WHEN: Every business day at 2 PM PST
INPUT: Standup transcript (5-10KB text)
OUTPUT: Structured daily summary JSON
```

**Prompt:**
```
You are analyzing a daily standup transcript. Extract and structure the following:

1. Overall Summary: High-level summary of the day's standup
2. Action Items: Specific tasks or action items mentioned
3. Decisions: Key decisions made during standup
4. Blockers: Issues or blockers raised
5. Per-Person Summary: For each person, summarize:
   - What they worked on
   - What they're working on next
   - Any blockers they mentioned
6. Upcoming Work: NEW tasks, features, or plans discussed for current or future sprints:
   - If someone mentions "I'll work on X", "We need to build Y", "Let's do Z next sprint" → capture it
   - Mark status: planned|started|completed_in_current_sprint
   - Mark targetSprint: current|next
   - Include priority if mentioned (high|medium|low)

Return ONLY a JSON object matching this schema:
{
  "overallSummary": "string",
  "actionItems": ["string"],
  "decisions": ["string"],
  "blockers": ["string"],
  "perPersonSummary": [
    {
      "name": "string",
      "summary": "string",
      "nextSteps": ["string"],
      "blockers": ["string"]
    }
  ],
  "upcomingWork": [
    {
      "task": "Description of new task discussed",
      "owner": "Person assigned (if mentioned)",
      "status": "planned|started|completed_in_current_sprint",
      "targetSprint": "current|next",
      "priority": "high|medium|low (if mentioned)"
    }
  ]
}

Transcript:
[FULL TRANSCRIPT TEXT]
```

**API Call:**
- Model: `gpt-5-nano`
- Max Tokens: 2000
- Response Format: `json_object`
- Temperature: 1 (default)

**Output Processing:**
1. Extract JSON from Responses API nested structure
2. Parse and validate against schema
3. Map `perPersonSummary` fields (person→name, progressItems→summary, commitments→nextSteps)
4. Save to MongoDB `dailySummaries` collection including `upcomingWork` array

**What gets captured in upcomingWork:**
- New features/tasks discussed for current or upcoming sprints
- Status tracking: Did they just mention it (planned), already start it (started), or finish it in the same standup (completed_in_current_sprint)?
- This helps Pass 1 of sprint planning identify what new work was discussed vs what's already done

---

### **2. Sprint Plan Generation (Friday)**

**Multi-Pass Strategy - 4 Prompts**

Sprint planning uses **4 sequential prompts** to handle large context (~20-30KB) and ensure comprehensive analysis.

---

#### **Pass 1: Analyze Daily Summaries**

```
WHEN: First pass
INPUT: Last 10 daily summaries (~5KB)
OUTPUT: Textual analysis
```

**Prompt:**
```
Analyze these daily standup summaries and extract:

1. WHAT WAS COMPLETED: List specific tasks/features each person completed
2. WHO WORKED ON WHAT: For each person, what projects/areas they focused on
3. BLOCKERS: Unresolved blockers or challenges that need to continue
4. ACTION ITEMS: Pending action items that weren't completed yet

Be specific about task names and assignees. This will be used to verify what from the previous sprint plan was actually completed.

Summaries:
[10 DAILY SUMMARIES WITH DATES]

Date: 2026-02-03
Overall: Team discussed storage options...
Action Items: Research CDN costs, Test Bunny CDN
Decisions: Use bucket-based storage
Blockers: Azure permissions needed
Per Person:
  - Azmain: Working on PM bot (Next: Deploy to Azure)
  - Shafkat: Testing CRM integration (Next: E2E tests)
Upcoming Work Discussed:
  - Build admin dashboard for PM agent (Owner: Azmain, Status: planned, Sprint: next, Priority: high)
  - Migrate to Bunny CDN (Owner: Shafkat, Status: started, Sprint: current)
...
[REPEAT FOR 10 DAYS]
```

**API Call:**
- Model: `gpt-5-nano`
- Max Tokens: 2000
- Response Format: Plain text (no JSON)

**Output:** Natural language analysis stored in memory

---

#### **Pass 2: Analyze Teams Messages**

```
WHEN: Second pass
INPUT: Last 14 days of Teams messages (~10-15KB)
OUTPUT: Textual analysis
```

Teams messages are **chunked** because they exceed context limits:
- Messages split into chunks of 50 messages each
- Each chunk analyzed separately
- Results combined

**Prompt (for each chunk):**
```
Analyze these Teams messages (chunk 1/3) and extract:

1. NEW WORK MENTIONED: Any new features, tasks, or projects discussed for future sprints
2. CURRENT WORK STATUS: Updates on ongoing tasks (progress, blockers, completion status)
3. DECISIONS MADE: Decisions that affect sprint planning (priorities, tech choices, scope changes)
4. WORK ASSIGNMENTS: Who is assigned to work on what (new or ongoing)
5. PRIORITY INDICATORS: Any explicit mentions of priority, urgency, or client requests
6. CLIENT WORK: Tasks related to client projects or client requests (note if new client or existing)
7. BUGS/ISSUES: Bug fixes or issues from clients that need addressing

Pay attention to context about priorities, client work, and task status.

Messages:
[2026-02-03T10:23:00Z] Azmain: We should use Bunny CDN for audio delivery
[2026-02-03T10:25:00Z] Doug: Agreed, let's test it this week
[2026-02-03T11:14:00Z] Shafkat: Need CRM credentials to continue testing
...
[REPEAT FOR 50 MESSAGES]
```

**API Call (per chunk):**
- Model: `gpt-5-nano`
- Max Tokens: 1500
- Response Format: Plain text

**Output:** Analyses from all chunks concatenated into one summary

---

#### **Pass 3: Analyze Previous Sprint Plan**

```
WHEN: Third pass
INPUT: Previous sprint plan DOCX (~5-8KB text)
OUTPUT: Textual analysis
```

**Prompt:**
```
You must CROSS-REFERENCE the previous sprint plan with daily standup summaries to identify what was actually completed vs what's still pending or partially complete.

PREVIOUS SPRINT PLAN:
[FULL TEXT FROM DOCX FILE]

Sprint Definition Summary: 02/01/2026-02/15/2026

Sprint Goals:
- Finalize storage architecture
- Deploy PM agent to Azure
...

Owner-by-Owner Task Breakdown:

Azmain Morshed:
Task 1: Deploy PM Agent
Description: Set up Azure deployment...
Points: 3
Priority: high
...

DAILY SUMMARIES (What actually happened):
[10 SUMMARIES WITH DATES AND PER-PERSON ACCOMPLISHMENTS]

INSTRUCTIONS:
1. For EACH task in the previous sprint plan, check if it appears in the daily summaries
2. Create three lists:
   - COMPLETED TASKS: Tasks from previous plan that were fully finished (with evidence from summaries)
   - PARTIALLY COMPLETE: Tasks that were worked on but not finished (mention what's done and what's remaining)
   - NOT STARTED/PENDING: Tasks from previous plan NOT mentioned at all (must carry forward to next sprint)
3. For each incomplete task (partial or pending), note:
   - Who it was originally assigned to
   - What percentage is done (if partially complete)
   - What remains to be done

Be thorough - every task from the previous plan must be categorized as completed, partially complete, or pending.
```

**API Call:**
- Model: `gpt-5-nano`
- Max Tokens: 2000
- Response Format: Plain text

**Output:** Previous sprint review analysis

---

#### **Pass 4: Generate Final Sprint Plan**

```
WHEN: Fourth pass (final)
INPUT: All 3 analyses combined (~8-10KB)
OUTPUT: Structured sprint plan JSON
```

**Prompt:**
```
You are a sprint planning agent. Generate a comprehensive 2-week sprint plan.

Team Members: Azmain Morshed (Lead), Shafkat Kabir (Dev), Faiyaz Rahman (Dev)
Sprint Period: 2026-02-15 to 2026-03-01

Generate the next sprint plan by following these steps:

# Daily Summaries Analysis (What got done + Who worked on what)
[ANALYSIS FROM PASS 1]

WHAT WAS COMPLETED:
- Storage architecture finalized (Azmain)
- CRM API integration completed (Shafkat)
...

WHO WORKED ON WHAT:
- Azmain: PM bot, storage architecture
- Shafkat: CRM integration, testing
...

# Teams Messages Analysis (New work + Status updates + Priorities)
[ANALYSIS FROM PASS 2]

NEW WORK MENTIONED:
- Client X requested new dashboard feature (high priority)
- Bug in existing client Y system needs fix
...

CURRENT WORK STATUS:
- Azure deployment 60% complete, waiting for permissions
...

PRIORITY INDICATORS:
- Client X work flagged as urgent
- Bug fix needed by end of week
...

# Previous Sprint Plan Cross-Reference (Completed vs Partially Complete vs Pending)
[ANALYSIS FROM PASS 3]

COMPLETED TASKS:
- Storage research (Azmain) - Evidence: mentioned in Feb 3, Feb 4 summaries
...

PARTIALLY COMPLETE:
- Azure deployment (Azmain) - 60% done, remaining: DNS setup, monitoring
...

NOT STARTED/PENDING:
- CRM credential provisioning (Shafkat) - blocked, must carry forward
...

SPRINT PLANNING RULES:
1. CARRY FORWARD: All incomplete tasks (pending OR partially complete) from previous sprint MUST be included in the new sprint
   - If partially complete, update the description to note what's done and what remains
   - Assign to the same person who was working on it
2. ADD NEW WORK: Include new tasks from Teams/standup discussions
3. ASSIGN CORRECTLY: Assign tasks to people based on:
   - Who worked on related items in daily summaries
   - Who was originally assigned to carry-forward tasks
   - Who was mentioned in Teams for new work
4. PRIORITIZE TASKS:
   - HIGH priority: Client work (new or existing), bug fixes, client requests, or tasks explicitly mentioned as urgent/high priority
   - MEDIUM priority: Internal company tasks, refactoring, technical debt
   - Do NOT base priority on whether task is new or pending - base it on the nature of the work

IMPORTANT: You MUST respond with ONLY a JSON object (no markdown, no text).

Generate the sprint plan with:
1. Primary Goals (3-5 bullet points) - focus on completing incomplete tasks + high-priority new work
2. Notes section - MUST include Previous Sprint Review (what completed, what partially complete with %, what pending)
3. Owner breakdown with tasks for EACH person: Azmain Morshed, Shafkat Kabir, Faiyaz Rahman - ensure ALL incomplete tasks are included

JSON Schema:
{
  "sprintDateRange": { "start": "2026-02-15", "end": "2026-03-01" },
  "primaryGoals": ["string"],
  "notes": ["Previous Sprint Review: [completed, partially complete %, pending]", "other"],
  "ownerBreakdown": [
    {
      "name": "Full Name",
      "focuses": [
        {
          "focusName": "Project Name",
          "goal": "Goal description",
          "tasks": [
            {
              "title": "Task title",
              "description": "What to build (if partially complete, note what's done and what remains)",
              "points": 1-5,
              "priority": "high",
              "acceptanceCriteria": ["criterion"]
            }
          ]
        }
      ]
    }
  ]
}
```

**API Call:**
- Model: `gpt-5-nano`
- Max Tokens: 4000
- Response Format: `json_object`
- Temperature: 1 (default)

**Output Processing:**
1. Extract JSON from Responses API
2. Add points rubric to plan
3. Save to MongoDB
4. Generate DOCX document
5. Upload to OneDrive

---

## Dynamic Context Window Management

### **Problem:**
GPT-5-nano has limited context window. Sprint planning needs:
- 10 daily summaries (~5KB)
- Teams messages (~15KB)
- Previous plan (~8KB)
- Total: ~28KB - too large for single prompt

### **Solution: Multi-Pass Architecture**

**Pass 1-3: Context Reduction**
- Each pass analyzes one data source separately
- Outputs are natural language summaries (compressed)
- 3 analyses combined = ~8KB (fits in final prompt)

**Pass 4: Final Generation**
- Takes compressed analyses as input
- Has room for detailed instructions and schema
- Generates complete structured output

**Benefits:**
- ✅ Handles unlimited input data (via chunking)
- ✅ Each pass focuses on specific context
- ✅ Final pass has clean, compressed context
- ✅ Better quality than single massive prompt

---

## Data Flow Summary

```
Daily Ingestion:
Transcript (MongoDB) → [1 Prompt] → Summary JSON → Save to MongoDB

Sprint Plan Generation:
┌─ Daily Summaries (MongoDB) → [Prompt 1] → Analysis A ─┐
├─ Teams Messages (Graph API) → [Prompt 2] → Analysis B ─┤
├─ Previous Plan (OneDrive)   → [Prompt 3] → Analysis C ─┤
└─────────────────────────────────────────────────────────┴─→ [Prompt 4]
                                                               ↓
                                                         Sprint Plan JSON
                                                               ↓
                                    ┌──────────────────────────┼──────────────────────┐
                                    ↓                          ↓                      ↓
                              Save to MongoDB          Generate DOCX          Upload OneDrive
```

---

## Context Sizes

| Component | Size | Handling |
|-----------|------|----------|
| Daily Transcript | 5-10KB | Single prompt |
| 10 Daily Summaries | ~5KB | Single prompt (Pass 1) |
| Teams Messages | 10-15KB | Chunked (50 msgs/chunk) → Multiple prompts (Pass 2) |
| Previous Plan | 5-8KB | Single prompt (Pass 3) |
| Final Generation | 8-10KB input | Single prompt (Pass 4) |

---

## Prompt Evolution

### **What Gets Passed Forward:**

```
Pass 1 Output (Analysis A):
  "WHAT WAS COMPLETED:
   - Storage architecture finalized (Azmain)
   - CRM integration completed (Shafkat)
   - Bunny CDN migration done (Shafkat) - was in upcomingWork, now completed
   
   WHO WORKED ON WHAT:
   - Azmain: PM bot deployment, storage decisions
   - Shafkat: CRM testing, API integration, CDN migration
   
   NEW WORK PLANNED (from upcomingWork in summaries):
   - Admin dashboard for PM agent (Azmain, planned for next sprint, high priority)
   - Payment portal improvements (Shafkat, started current sprint)
   
   BLOCKERS: Azure permissions still needed
   ACTION ITEMS: DNS setup pending, monitoring dashboard needed"

Pass 2 Output (Analysis B):  
  "NEW WORK MENTIONED:
   - Client X dashboard feature (high priority, new client)
   - Bug fix for existing Client Y system
   
   CURRENT WORK STATUS:
   - Azure deployment 60% complete
   - CRM integration fully done
   
   PRIORITY INDICATORS:
   - Client X work flagged as urgent
   - Bug fix needed by Friday
   
   CLIENT WORK:
   - Client X: New dashboard (high priority)
   - Client Y: Bug fix (high priority)"

Pass 3 Output (Analysis C):
  "COMPLETED TASKS:
   - Storage research (Azmain) - Mentioned Feb 3, Feb 4
   - CRM integration (Shafkat) - Completed Feb 5
   
   PARTIALLY COMPLETE:
   - Azure deployment (Azmain) - 60% done
     Remaining: DNS setup, monitoring dashboard, final testing
   
   NOT STARTED/PENDING:
   - Documentation updates (All team) - Not mentioned, carry forward
   
   Original Assignees: Same as above"

Pass 4 Input:
  Analysis A + Analysis B + Analysis C + Sprint Rules + Priority Rules + Schema
  → Generates complete sprint plan with:
     - Carried forward incomplete tasks (partial + pending)
     - New client work (high priority)
     - Correct assignees based on who worked on what
```

---

## API Response Handling

### **GPT-5-nano Responses API Structure:**

```json
{
  "output": [
    {
      "type": "reasoning",
      "summary": []
    },
    {
      "type": "message",
      "content": [
        {
          "type": "output_text",
          "text": "{\"overallSummary\": \"...\"}"
        }
      ]
    }
  ]
}
```

**Extraction Logic:**
1. Find object with `type: "message"`
2. Navigate to `content` array
3. Find object with `type: "output_text"`
4. Extract `text` field
5. Parse as JSON (for JSON prompts) or return as string (for text prompts)

---

## Quality Controls

### **Output Validation:**

**Daily Summaries:**
- Schema validation with Zod
- Required fields: overallSummary, actionItems, decisions, blockers
- Per-person summaries validated for structure

**Sprint Plans:**
- Validates sprintDateRange, primaryGoals, notes
- Ensures all team members appear in ownerBreakdown
- Checks task structure (title, description, points, priority, acceptanceCriteria)

### **Error Handling:**

- Invalid JSON → Retry not implemented (fails fast, logs error)
- Missing fields → Validation error, workflow stops
- API failures → Logged, error notification sent to Teams

---

## Token Usage

**Typical Run:**

| Operation | Input Tokens | Output Tokens | Total |
|-----------|-------------|---------------|-------|
| Daily Summary | ~1,200 | ~400 | ~1,600 |
| Pass 1 (Summaries) | ~1,500 | ~600 | ~2,100 |
| Pass 2 (Messages, 3 chunks) | ~4,500 | ~1,800 | ~6,300 |
| Pass 3 (Previous Plan) | ~2,000 | ~700 | ~2,700 |
| Pass 4 (Final Plan) | ~6,200 | ~1,800 | ~8,000 |
| **Sprint Plan Total** | **~14,200** | **~4,900** | **~19,100** |

**Cost (GPT-5-nano):**
- Daily summary: ~$0.002
- Sprint plan: ~$0.019
- Monthly cost: ~$0.12 (22 business days × daily + 4 Fridays × sprint)

---

## Key Design Decisions

### **Why Multi-Pass?**
- Single prompt would hit context limits with all data
- Separate analyses allow focused extraction per data source
- Compressed analyses provide better final context

### **Why No Tool Calling?**
- GPT-5-nano Responses API doesn't support tool calling
- Direct JSON generation is simpler and faster
- Schema provided in prompt ensures structure

### **Why Text Responses for Passes 1-3?**
- Flexible output format (not constrained by schema)
- Natural language easier for LLM to reason about task completion
- Final pass combines into structured JSON

### **Why Cross-Reference in Pass 3?**
- Avoids guessing what's complete vs pending
- Provides concrete evidence from daily summaries
- Handles partially complete tasks (not just done/not done)
- Ensures accurate carry-forward of incomplete work

### **Why Chunking for Teams Messages?**
- Messages can exceed 15KB for active teams
- 50 messages per chunk keeps context manageable
- Each chunk analyzed separately, results merged

---

## Example: Complete Friday Flow

**9:00 AM - System Wakes Up**

**9:01 AM - Pass 1: Daily Summaries**
- Fetch 10 summaries from MongoDB
- Prompt: "Analyze these summaries..."
- Response: "Key accomplishments: Storage decisions finalized..."
- Duration: ~8 seconds

**9:02 AM - Pass 2: Teams Messages**
- Fetch 294 messages from Teams (last 14 days)
- Split into 6 chunks (50 msgs each)
- 6 prompts: "Analyze messages chunk 1/6..."
- Responses combined: "Important discussions: CDN selection..."
- Duration: ~45 seconds

**9:03 AM - Pass 3: Previous Plan Cross-Reference**
- Download DOCX from OneDrive
- Convert to text with mammoth
- Combine with daily summaries
- Prompt: "Cross-reference previous plan with summaries..."
- Response: "COMPLETED: Storage research (evidence: Feb 3,4). PARTIALLY COMPLETE: Azure deploy 60% (remaining: DNS, monitoring). PENDING: Documentation..."
- Duration: ~12 seconds

**9:04 AM - Pass 4: Final Plan**
- Combine all 3 analyses
- Prompt: "Generate sprint plan based on analyses..."
- Response: Full JSON with goals, notes, tasks for 3 people
- Duration: ~15 seconds

**9:05 AM - Post-Processing**
- Validate JSON schema
- Add points rubric
- Save to MongoDB
- Generate DOCX (10KB)
- Upload to OneDrive
- Archive old files
- Send Teams notification

**Total Duration: ~3 minutes**

---

## Actual Prompts in Code

### **Summarization Prompt:**
Location: `src/llm/summarization.service.ts`
```typescript
const prompt = buildSummarizationPrompt(transcript);
// Returns the prompt shown in "Daily Ingestion" section above
```

### **Multi-Pass Prompts:**
Location: `src/sprint-plan/sprint-plan.service.ts`

```typescript
// Pass 1
const summariesAnalysis = await this.analyzeSummaries(last10Summaries, runId);

// Pass 2
const messagesAnalysis = await this.analyzeMessages(allMessages, runId);

// Pass 3  
const previousPlanAnalysis = await this.analyzePreviousPlan(previousPlanText, runId);

// Pass 4
const sprintPlanOutput = await this.generateFinalPlan(
  summariesAnalysis,
  messagesAnalysis, 
  previousPlanAnalysis,
  runId
);
```

---

## Memory and State

### **No Persistent Memory:**
- Each prompt is stateless
- Context comes from MongoDB/Graph API
- No conversation history maintained

### **Data Sources:**
- **Daily Summaries**: MongoDB `dailySummaries` collection
- **Teams Messages**: Microsoft Graph API (real-time)
- **Previous Plan**: OneDrive (latest DOCX file)
- **Transcripts**: MongoDB `standuptickets` database (read-only)

### **Output Storage:**
- **Summaries**: MongoDB `dailySummaries` collection
- **Sprint Plans**: MongoDB `sprintPlans` collection  
- **DOCX Files**: OneDrive "Sprint Plans" folder
- **Old Files**: OneDrive "Archive" folder
- **Agent Runs**: MongoDB `agentRuns` collection (audit log)

---

## Optimization Strategies

### **Token Efficiency:**
- ✅ Chunking prevents wasted tokens on context exceeding limits
- ✅ Text responses for analysis passes (no JSON overhead)
- ✅ Only final pass generates structured JSON
- ✅ Compressed analyses reduce redundant information

### **Quality Improvements:**
- ✅ Each pass focuses on specific data source
- ✅ Natural language analyses easier for LLM to reason about
- ✅ Final pass has clear, compressed context
- ✅ Schema provided ensures consistent output format

### **Error Recovery:**
- ⚠️ No retry logic (fails fast)
- ✅ Detailed logging for debugging
- ✅ Error notifications to Teams
- ✅ Failed runs logged in `agentRuns` collection

---

## Future Enhancements

**Potential Improvements:**
- Add retry logic for failed LLM calls
- Implement prompt caching for repeated context
- Add human feedback loop for plan refinement
- Store intermediate analyses for debugging
- Implement A/B testing of prompt variations

---

## Summary

**Prompting Strategy:**
- **1 prompt** for daily summaries (simple, direct)
- **4 prompts** for sprint plans (multi-pass, context reduction)
- **No tool calling** (direct JSON generation)
- **Dynamic chunking** for large message sets

**Key Innovation:**
Multi-pass architecture allows handling unlimited context while staying within token limits, producing higher quality outputs than single massive prompts.

**Total LLM Calls Per Week:**
- Daily: 5 calls (Mon-Fri)
- Sprint: ~10 calls (3 message chunks + 4 main passes)
- **Weekly Total: ~15 LLM calls**
