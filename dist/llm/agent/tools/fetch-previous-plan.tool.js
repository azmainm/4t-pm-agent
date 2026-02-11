"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FetchPreviousPlanTool = void 0;
const common_1 = require("@nestjs/common");
let FetchPreviousPlanTool = class FetchPreviousPlanTool {
    definition = {
        type: 'function',
        function: {
            name: 'fetch_previous_sprint_plan',
            description: 'Fetches the previous sprint plan document text. Use this to understand what was planned, compare against what was actually done, and follow the same output format.',
            parameters: {
                type: 'object',
                properties: {},
                required: [],
            },
        },
    };
};
exports.FetchPreviousPlanTool = FetchPreviousPlanTool;
exports.FetchPreviousPlanTool = FetchPreviousPlanTool = __decorate([
    (0, common_1.Injectable)()
], FetchPreviousPlanTool);
//# sourceMappingURL=fetch-previous-plan.tool.js.map