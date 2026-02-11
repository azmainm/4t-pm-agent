"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildUserPrompt = buildUserPrompt;
function buildUserPrompt(context) {
    return `Based on the following context from the last 2 weeks, generate a comprehensive sprint plan for the upcoming sprint.

Start by using the available tools to fetch:
1. Daily standup summaries
2. Teams messages
3. The previous sprint plan

Then analyze all the data and generate the sprint plan.

Here is the assembled context to get you started:

${context}

Now use the tools to gather any additional detail you need, then generate the sprint plan.`;
}
//# sourceMappingURL=sprint-plan-prompt.js.map