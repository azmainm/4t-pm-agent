import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from 'docx';
import type { SprintPlanOutput } from '../llm/dto/sprint-plan-output.dto.js';

@Injectable()
export class DocxGeneratorService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext('DocxGeneratorService');
  }

  async generate(plan: SprintPlanOutput): Promise<Buffer> {
    this.logger.info(
      {
        dateRange: plan.sprintDateRange,
        ownerCount: plan.ownerBreakdown.length,
      },
      'Generating .docx sprint plan',
    );

    const children: Paragraph[] = [];

    // Header: Sprint Definition Summary
    const startDate = this.formatDate(plan.sprintDateRange.start);
    const endDate = this.formatDate(plan.sprintDateRange.end);
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [
          new TextRun({
            text: `Sprint Definition Summary: ${startDate}-${endDate}`,
            bold: true,
            size: 28,
          }),
        ],
      }),
    );
    children.push(new Paragraph({}));

    // Sprint Goals
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun({ text: 'Sprint Goals', bold: true })],
      }),
    );
    children.push(new Paragraph({}));
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Primary Goals for the Sprint',
            bold: true,
            italics: true,
          }),
        ],
      }),
    );
    children.push(new Paragraph({}));

    for (const goal of plan.primaryGoals) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: goal })],
          bullet: { level: 0 },
        }),
      );
    }
    children.push(new Paragraph({}));

    // Notes
    children.push(
      new Paragraph({
        children: [new TextRun({ text: 'Notes:', bold: true, size: 24 })],
      }),
    );
    children.push(new Paragraph({}));

    for (const note of plan.notes) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: note })],
        }),
      );
    }
    children.push(new Paragraph({}));

    // Owner-by-Owner Task Breakdown
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [
          new TextRun({ text: 'Owner-by-Owner Task Breakdown', bold: true }),
        ],
      }),
    );
    children.push(new Paragraph({}));

    for (const owner of plan.ownerBreakdown) {
      // Owner Name
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          children: [new TextRun({ text: owner.name, bold: true })],
        }),
      );
      children.push(new Paragraph({}));

      let focusIndex = 1;
      for (const focus of owner.focuses) {
        // Focus header
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Focus ${focusIndex}: ${focus.focusName}`,
                bold: true,
              }),
            ],
          }),
        );
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `Goal: ${focus.goal}`, italics: true }),
            ],
          }),
        );
        children.push(new Paragraph({}));

        let taskIndex = 1;
        for (const task of focus.tasks) {
          // Task header
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `Task ${taskIndex}: ${task.title}`,
                  bold: true,
                }),
              ],
            }),
          );

          // Points and Priority
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `Points: ${task.points}`,
                }),
                new TextRun({ text: '  ' }),
                new TextRun({
                  text: `Priority: ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}`,
                }),
              ],
            }),
          );

          // Description
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: 'What to do: ',
                  bold: true,
                }),
                new TextRun({ text: task.description }),
              ],
            }),
          );
          children.push(new Paragraph({}));

          // Acceptance Criteria
          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: 'Acceptance Criteria:', bold: true }),
              ],
            }),
          );

          for (const criterion of task.acceptanceCriteria) {
            children.push(
              new Paragraph({
                children: [new TextRun({ text: `[ ] ${criterion}` })],
                indent: { left: 720 },
              }),
            );
          }
          children.push(new Paragraph({}));

          taskIndex++;
        }
        focusIndex++;
      }
    }

    // Points Rubric
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'POINTS RUBRIC:', bold: true, size: 24 }),
        ],
      }),
    );
    children.push(new Paragraph({}));

    for (const [points, description] of Object.entries(plan.pointsRubric)) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `${points} = ${description}` })],
        }),
      );
    }

    const doc = new Document({
      sections: [{ children }],
    });

    const buffer = await Packer.toBuffer(doc);

    this.logger.info(
      { sizeBytes: buffer.byteLength },
      '.docx sprint plan generated',
    );

    return Buffer.from(buffer);
  }

  private formatDate(dateStr: string): string {
    const [year, month, day] = dateStr.split('-');
    return `${month}/${day}/${year.slice(2)}`;
  }
}
