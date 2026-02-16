import { Model } from 'mongoose';
import { SprintPlan } from '../schemas/sprint-plan.schema.js';
export declare class SprintPlanRepository {
    private readonly sprintPlanModel;
    constructor(sprintPlanModel: Model<SprintPlan>);
    create(data: Partial<SprintPlan>): Promise<SprintPlan>;
    findLatest(): Promise<SprintPlan | null>;
    findByDateRange(startDate: Date, endDate: Date): Promise<SprintPlan | null>;
    updateStatus(id: string, status: SprintPlan['status'], updates?: Partial<SprintPlan>): Promise<SprintPlan | null>;
    updateOnedriveFile(id: string, fileId: string, fileName: string): Promise<SprintPlan | null>;
    updateJiraIssues(id: string, jiraIssueKeys: string[]): Promise<SprintPlan | null>;
    updatePlanData(id: string, planData: SprintPlan['planData']): Promise<SprintPlan | null>;
    findById(id: string): Promise<SprintPlan | null>;
    findAll(limit?: number): Promise<SprintPlan[]>;
}
