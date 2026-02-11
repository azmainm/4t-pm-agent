"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocxGeneratorService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_pino_1 = require("nestjs-pino");
const docx_1 = require("docx");
let DocxGeneratorService = class DocxGeneratorService {
    logger;
    constructor(logger) {
        this.logger = logger;
        this.logger.setContext('DocxGeneratorService');
    }
    async generate(plan) {
        this.logger.info({
            dateRange: plan.sprintDateRange,
            ownerCount: plan.ownerBreakdown.length,
        }, 'Generating .docx sprint plan');
        const children = [];
        const startDate = this.formatDate(plan.sprintDateRange.start);
        const endDate = this.formatDate(plan.sprintDateRange.end);
        children.push(new docx_1.Paragraph({
            heading: docx_1.HeadingLevel.HEADING_1,
            children: [
                new docx_1.TextRun({
                    text: `Sprint Definition Summary: ${startDate}-${endDate}`,
                    bold: true,
                    size: 28,
                }),
            ],
        }));
        children.push(new docx_1.Paragraph({}));
        children.push(new docx_1.Paragraph({
            heading: docx_1.HeadingLevel.HEADING_2,
            children: [new docx_1.TextRun({ text: 'Sprint Goals', bold: true })],
        }));
        children.push(new docx_1.Paragraph({}));
        children.push(new docx_1.Paragraph({
            children: [
                new docx_1.TextRun({
                    text: 'Primary Goals for the Sprint',
                    bold: true,
                    italics: true,
                }),
            ],
        }));
        children.push(new docx_1.Paragraph({}));
        for (const goal of plan.primaryGoals) {
            children.push(new docx_1.Paragraph({
                children: [new docx_1.TextRun({ text: goal })],
                bullet: { level: 0 },
            }));
        }
        children.push(new docx_1.Paragraph({}));
        children.push(new docx_1.Paragraph({
            children: [new docx_1.TextRun({ text: 'Notes:', bold: true, size: 24 })],
        }));
        children.push(new docx_1.Paragraph({}));
        for (const note of plan.notes) {
            children.push(new docx_1.Paragraph({
                children: [new docx_1.TextRun({ text: note })],
            }));
        }
        children.push(new docx_1.Paragraph({}));
        children.push(new docx_1.Paragraph({
            heading: docx_1.HeadingLevel.HEADING_2,
            children: [
                new docx_1.TextRun({ text: 'Owner-by-Owner Task Breakdown', bold: true }),
            ],
        }));
        children.push(new docx_1.Paragraph({}));
        for (const owner of plan.ownerBreakdown) {
            children.push(new docx_1.Paragraph({
                heading: docx_1.HeadingLevel.HEADING_3,
                children: [new docx_1.TextRun({ text: owner.name, bold: true })],
            }));
            children.push(new docx_1.Paragraph({}));
            let focusIndex = 1;
            for (const focus of owner.focuses) {
                children.push(new docx_1.Paragraph({
                    children: [
                        new docx_1.TextRun({
                            text: `Focus ${focusIndex}: ${focus.focusName}`,
                            bold: true,
                        }),
                    ],
                }));
                children.push(new docx_1.Paragraph({
                    children: [
                        new docx_1.TextRun({ text: `Goal: ${focus.goal}`, italics: true }),
                    ],
                }));
                children.push(new docx_1.Paragraph({}));
                let taskIndex = 1;
                for (const task of focus.tasks) {
                    children.push(new docx_1.Paragraph({
                        children: [
                            new docx_1.TextRun({
                                text: `Task ${taskIndex}: ${task.title}`,
                                bold: true,
                            }),
                        ],
                    }));
                    children.push(new docx_1.Paragraph({
                        children: [
                            new docx_1.TextRun({
                                text: `Points: ${task.points}`,
                            }),
                            new docx_1.TextRun({ text: '  ' }),
                            new docx_1.TextRun({
                                text: `Priority: ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}`,
                            }),
                        ],
                    }));
                    children.push(new docx_1.Paragraph({
                        children: [
                            new docx_1.TextRun({
                                text: 'What to do: ',
                                bold: true,
                            }),
                            new docx_1.TextRun({ text: task.description }),
                        ],
                    }));
                    children.push(new docx_1.Paragraph({}));
                    children.push(new docx_1.Paragraph({
                        children: [
                            new docx_1.TextRun({ text: 'Acceptance Criteria:', bold: true }),
                        ],
                    }));
                    for (const criterion of task.acceptanceCriteria) {
                        children.push(new docx_1.Paragraph({
                            children: [new docx_1.TextRun({ text: `[ ] ${criterion}` })],
                            indent: { left: 720 },
                        }));
                    }
                    children.push(new docx_1.Paragraph({}));
                    taskIndex++;
                }
                focusIndex++;
            }
        }
        children.push(new docx_1.Paragraph({
            children: [
                new docx_1.TextRun({ text: 'POINTS RUBRIC:', bold: true, size: 24 }),
            ],
        }));
        children.push(new docx_1.Paragraph({}));
        for (const [points, description] of Object.entries(plan.pointsRubric)) {
            children.push(new docx_1.Paragraph({
                children: [new docx_1.TextRun({ text: `${points} = ${description}` })],
            }));
        }
        const doc = new docx_1.Document({
            sections: [{ children }],
        });
        const buffer = await docx_1.Packer.toBuffer(doc);
        this.logger.info({ sizeBytes: buffer.byteLength }, '.docx sprint plan generated');
        return Buffer.from(buffer);
    }
    formatDate(dateStr) {
        const [year, month, day] = dateStr.split('-');
        return `${month}/${day}/${year.slice(2)}`;
    }
};
exports.DocxGeneratorService = DocxGeneratorService;
exports.DocxGeneratorService = DocxGeneratorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [nestjs_pino_1.PinoLogger])
], DocxGeneratorService);
//# sourceMappingURL=docx-generator.service.js.map