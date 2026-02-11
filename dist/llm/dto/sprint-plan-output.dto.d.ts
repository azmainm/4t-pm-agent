import { z } from 'zod';
export declare const SprintPlanOutputSchema: z.ZodObject<{
    sprintDateRange: z.ZodObject<{
        start: z.ZodString;
        end: z.ZodString;
    }, z.core.$strip>;
    primaryGoals: z.ZodArray<z.ZodString>;
    notes: z.ZodArray<z.ZodString>;
    ownerBreakdown: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        focuses: z.ZodArray<z.ZodObject<{
            focusName: z.ZodString;
            goal: z.ZodString;
            tasks: z.ZodArray<z.ZodObject<{
                title: z.ZodString;
                description: z.ZodString;
                points: z.ZodNumber;
                priority: z.ZodEnum<{
                    low: "low";
                    medium: "medium";
                    high: "high";
                }>;
                acceptanceCriteria: z.ZodArray<z.ZodString>;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    pointsRubric: z.ZodRecord<z.ZodString, z.ZodString>;
}, z.core.$strip>;
export type SprintPlanOutput = z.infer<typeof SprintPlanOutputSchema>;
