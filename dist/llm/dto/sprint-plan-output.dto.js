"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SprintPlanOutputSchema = void 0;
const zod_1 = require("zod");
exports.SprintPlanOutputSchema = zod_1.z.object({
    sprintDateRange: zod_1.z.object({
        start: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        end: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    }),
    primaryGoals: zod_1.z.array(zod_1.z.string()).min(1),
    notes: zod_1.z.array(zod_1.z.string()),
    ownerBreakdown: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string(),
        focuses: zod_1.z.array(zod_1.z.object({
            focusName: zod_1.z.string(),
            goal: zod_1.z.string(),
            tasks: zod_1.z.array(zod_1.z.object({
                title: zod_1.z.string(),
                description: zod_1.z.string(),
                points: zod_1.z.number().int().min(1).max(5),
                priority: zod_1.z.enum(['high', 'medium', 'low']),
                acceptanceCriteria: zod_1.z.array(zod_1.z.string()).min(1),
            })),
        })),
    })),
    pointsRubric: zod_1.z.record(zod_1.z.string(), zod_1.z.string()),
});
//# sourceMappingURL=sprint-plan-output.dto.js.map