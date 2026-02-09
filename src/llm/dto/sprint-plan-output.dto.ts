import { z } from 'zod';

export const SprintPlanOutputSchema = z.object({
  sprintDateRange: z.object({
    start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }),
  primaryGoals: z.array(z.string()).min(1),
  notes: z.array(z.string()),
  ownerBreakdown: z.array(
    z.object({
      name: z.string(),
      focuses: z.array(
        z.object({
          focusName: z.string(),
          goal: z.string(),
          tasks: z.array(
            z.object({
              title: z.string(),
              description: z.string(),
              points: z.number().int().min(1).max(5),
              priority: z.enum(['high', 'medium', 'low']),
              acceptanceCriteria: z.array(z.string()).min(1),
            }),
          ),
        }),
      ),
    }),
  ),
  pointsRubric: z.record(z.string(), z.string()),
});

export type SprintPlanOutput = z.infer<typeof SprintPlanOutputSchema>;
