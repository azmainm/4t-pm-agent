"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeneratePlanTool = void 0;
const common_1 = require("@nestjs/common");
let GeneratePlanTool = class GeneratePlanTool {
    definition = {
        type: 'function',
        function: {
            name: 'generate_sprint_plan',
            description: 'Call this when you have gathered and analyzed all context and are ready to output the final sprint plan. Pass the complete structured sprint plan JSON.',
            parameters: {
                type: 'object',
                properties: {
                    plan: {
                        type: 'object',
                        description: 'The complete sprint plan JSON matching the required output schema',
                    },
                },
                required: ['plan'],
            },
        },
    };
};
exports.GeneratePlanTool = GeneratePlanTool;
exports.GeneratePlanTool = GeneratePlanTool = __decorate([
    (0, common_1.Injectable)()
], GeneratePlanTool);
//# sourceMappingURL=generate-plan.tool.js.map