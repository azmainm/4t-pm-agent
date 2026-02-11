"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FetchSummariesTool = void 0;
const common_1 = require("@nestjs/common");
let FetchSummariesTool = class FetchSummariesTool {
    definition = {
        type: 'function',
        function: {
            name: 'fetch_sprint_summaries',
            description: 'Fetches daily standup summaries from the last N days. Returns per-person progress, action items, decisions, and blockers extracted from each standup transcript.',
            parameters: {
                type: 'object',
                properties: {
                    daysBack: {
                        type: 'number',
                        description: 'Number of days to look back (default: 14 for a full sprint)',
                    },
                },
                required: [],
            },
        },
    };
};
exports.FetchSummariesTool = FetchSummariesTool;
exports.FetchSummariesTool = FetchSummariesTool = __decorate([
    (0, common_1.Injectable)()
], FetchSummariesTool);
//# sourceMappingURL=fetch-summaries.tool.js.map