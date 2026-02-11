"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FetchMessagesTool = void 0;
const common_1 = require("@nestjs/common");
let FetchMessagesTool = class FetchMessagesTool {
    definition = {
        type: 'function',
        function: {
            name: 'fetch_teams_messages',
            description: 'Fetches Teams channel and chat messages from the last N days. Returns sender, content, timestamp, and source channel/chat.',
            parameters: {
                type: 'object',
                properties: {
                    daysBack: {
                        type: 'number',
                        description: 'Number of days to look back (default: 14)',
                    },
                },
                required: [],
            },
        },
    };
};
exports.FetchMessagesTool = FetchMessagesTool;
exports.FetchMessagesTool = FetchMessagesTool = __decorate([
    (0, common_1.Injectable)()
], FetchMessagesTool);
//# sourceMappingURL=fetch-messages.tool.js.map