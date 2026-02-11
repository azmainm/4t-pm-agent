"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchContextTool = void 0;
const common_1 = require("@nestjs/common");
let SearchContextTool = class SearchContextTool {
    definition = {
        type: 'function',
        function: {
            name: 'search_context',
            description: 'Performs a semantic search across all stored context (transcripts, messages, sprint plans) to find specific information. Use this when you need details about a specific topic, person, or project.',
            parameters: {
                type: 'object',
                properties: {
                    query: {
                        type: 'string',
                        description: 'The search query describing what information you need',
                    },
                    limit: {
                        type: 'number',
                        description: 'Maximum number of results to return (default: 10)',
                    },
                },
                required: ['query'],
            },
        },
    };
};
exports.SearchContextTool = SearchContextTool;
exports.SearchContextTool = SearchContextTool = __decorate([
    (0, common_1.Injectable)()
], SearchContextTool);
//# sourceMappingURL=search-context.tool.js.map