import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SprintPlan } from '../schemas/sprint-plan.schema.js';

@Injectable()
export class SprintPlanRepository {
  constructor(
    @InjectModel(SprintPlan.name, 'sprint_agent')
    private readonly sprintPlanModel: Model<SprintPlan>,
  ) {}

  async create(data: Partial<SprintPlan>): Promise<SprintPlan> {
    const plan = new this.sprintPlanModel(data);
    return plan.save();
  }

  async findLatest(): Promise<SprintPlan | null> {
    return this.sprintPlanModel
      .findOne()
      .sort({ sprintStartDate: -1 })
      .exec();
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<SprintPlan | null> {
    return this.sprintPlanModel
      .findOne({
        sprintStartDate: { $gte: startDate },
        sprintEndDate: { $lte: endDate },
      })
      .exec();
  }

  async updateStatus(
    id: string,
    status: SprintPlan['status'],
    updates?: Partial<SprintPlan>,
  ): Promise<SprintPlan | null> {
    return this.sprintPlanModel
      .findByIdAndUpdate(
        id,
        { status, ...updates },
        { new: true },
      )
      .exec();
  }

  async updateOnedriveFile(
    id: string,
    fileId: string,
    fileName: string,
  ): Promise<SprintPlan | null> {
    return this.sprintPlanModel
      .findByIdAndUpdate(
        id,
        { onedriveFileId: fileId, onedriveFileName: fileName },
        { new: true },
      )
      .exec();
  }

  async updateJiraIssues(
    id: string,
    jiraIssueKeys: string[],
  ): Promise<SprintPlan | null> {
    return this.sprintPlanModel
      .findByIdAndUpdate(
        id,
        { jiraIssueKeys },
        { new: true },
      )
      .exec();
  }

  async updatePlanData(
    id: string,
    planData: SprintPlan['planData'],
  ): Promise<SprintPlan | null> {
    return this.sprintPlanModel
      .findByIdAndUpdate(id, { planData }, { new: true })
      .exec();
  }

  async findById(id: string): Promise<SprintPlan | null> {
    return this.sprintPlanModel.findById(id).exec();
  }

  async findAll(limit = 20): Promise<SprintPlan[]> {
    return this.sprintPlanModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }
}
