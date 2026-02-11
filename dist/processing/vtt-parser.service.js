"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VttParserService = void 0;
const common_1 = require("@nestjs/common");
let VttParserService = class VttParserService {
    parse(vttContent) {
        const lines = vttContent.split('\n');
        const rawSegments = [];
        let currentStartTime = '';
        let currentEndTime = '';
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            const timestampMatch = line.match(/(\d{2}:\d{2}:\d{2}\.\d{3})\s+-->\s+(\d{2}:\d{2}:\d{2}\.\d{3})/);
            if (timestampMatch) {
                currentStartTime = timestampMatch[1];
                currentEndTime = timestampMatch[2];
                continue;
            }
            if (!line ||
                line === 'WEBVTT' ||
                line.startsWith('NOTE') ||
                /^\d+$/.test(line)) {
                continue;
            }
            if (currentStartTime) {
                const speakerMatch = line.match(/^<v\s+([^>]+)>(.+)$/);
                let speaker;
                let text;
                if (speakerMatch) {
                    speaker = speakerMatch[1].trim();
                    text = speakerMatch[2].replace(/<\/v>/, '').trim();
                }
                else {
                    const colonMatch = line.match(/^([^:]+):\s*(.+)$/);
                    if (colonMatch && colonMatch[1].length < 50) {
                        speaker = colonMatch[1].trim();
                        text = colonMatch[2].trim();
                    }
                    else {
                        speaker = 'Unknown';
                        text = line;
                    }
                }
                rawSegments.push({
                    speaker,
                    text,
                    startTime: currentStartTime,
                    endTime: currentEndTime,
                });
                currentStartTime = '';
            }
        }
        const mergedSegments = this.mergeConsecutiveSegments(rawSegments);
        const participants = [
            ...new Set(mergedSegments
                .map((s) => s.speaker)
                .filter((s) => s !== 'Unknown')),
        ];
        return { segments: mergedSegments, participants };
    }
    mergeConsecutiveSegments(segments) {
        if (segments.length === 0)
            return [];
        const merged = [{ ...segments[0] }];
        for (let i = 1; i < segments.length; i++) {
            const current = segments[i];
            const last = merged[merged.length - 1];
            if (current.speaker === last.speaker) {
                last.text += ' ' + current.text;
                last.endTime = current.endTime;
            }
            else {
                merged.push({ ...current });
            }
        }
        return merged;
    }
};
exports.VttParserService = VttParserService;
exports.VttParserService = VttParserService = __decorate([
    (0, common_1.Injectable)()
], VttParserService);
//# sourceMappingURL=vtt-parser.service.js.map