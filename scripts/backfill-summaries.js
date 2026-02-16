#!/usr/bin/env node

/**
 * Backfill Daily Summaries Script
 * 
 * Generates summaries for Feb 12-13, 2026 (only if missing).
 * Run with: node scripts/backfill-summaries.js
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../dist/app.module.js';
import { DailySummaryRepository } from '../dist/database/repositories/daily-summary.repository.js';
import { StandupTicketsRepository } from '../dist/database/repositories/standup-tickets.repository.js';
import { SummarizationService } from '../dist/llm/summarization.service.js';
import { Model } from 'mongoose';

async function backfillSummaries() {
  console.log('🚀 Starting summary backfill: Generate Feb 12-13, 2026 (if missing)...\n');

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const summaryRepo = app.get(DailySummaryRepository);
  const transcriptRepo = app.get(StandupTicketsRepository);
  const summarizationService = app.get(SummarizationService);

  // Generate dates from Feb 12 to Feb 13, 2026 (business days only)
  const businessDays = [];
  const startDate = new Date('2026-02-12T00:00:00Z');
  const endDate = new Date('2026-02-13T23:59:59Z');

  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      businessDays.push(new Date(currentDate));
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  console.log(`📅 Generating summaries for ${businessDays.length} business days (Feb 12-13, 2026)\n`);

  let summariesCreated = 0;
  let summariesSkipped = 0;
  let transcriptsMissing = 0;

  for (const date of businessDays) {
    const dateStr = date.toISOString().split('T')[0];
    console.log(`📆 ${dateStr}`);

    // Check if summary already exists
    const existingSummary = await summaryRepo.findByDate(date);
    if (existingSummary) {
      console.log(`   ⏭️  Summary already exists, skipping\n`);
      summariesSkipped++;
      continue;
    }

    // Find transcript for this date
    const transcript = await transcriptRepo.findByDate(date);
    if (!transcript) {
      console.log(`   ⚠️  No transcript found\n`);
      transcriptsMissing++;
      continue;
    }

    console.log(`   📄 Found transcript: ${transcript._id}`);
    console.log(`   🤖 Generating summary...`);

    try {
      // Ensure transcript_data is an array
      const transcriptData = Array.isArray(transcript.transcript_data) 
        ? transcript.transcript_data 
        : [];

      // Generate summary (matching ingestion service format)
      const summary = await summarizationService.summarizeTranscript({
        segments: transcriptData.map((seg) => ({
          speaker: seg.speaker,
          timestamp: seg.timestamp,
          text: seg.text,
        })),
        participants: [...new Set(transcriptData.map(seg => seg.speaker))],
      });

      // Save to database
      await summaryRepo.create({
        date,
        transcriptId: transcript._id.toString(),
        overallSummary: summary.overallSummary,
        actionItems: summary.actionItems,
        decisions: summary.decisions,
        blockers: summary.blockers,
        perPersonSummary: summary.perPersonSummary,
        upcomingWork: summary.upcomingWork || [],
      });

      console.log(`   ✅ Summary created`);
      console.log(`      Action items: ${summary.actionItems.length}`);
      console.log(`      Decisions: ${summary.decisions.length}`);
      console.log(`      Blockers: ${summary.blockers.length}`);
      console.log(`      Upcoming Work: ${summary.upcomingWork.length}\n`);
      summariesCreated++;

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}\n`);
    }
  }

  console.log('========================================');
  console.log('📊 BACKFILL SUMMARY');
  console.log('========================================');
  console.log(`✅ Summaries created: ${summariesCreated}`);
  console.log(`⏭️  Summaries skipped (already exist): ${summariesSkipped}`);
  console.log(`⚠️  Transcripts missing: ${transcriptsMissing}`);
  console.log(`📈 Total coverage: ${summariesCreated}/${businessDays.length} days`);
  console.log('========================================\n');

  await app.close();
  process.exit(0);
}

backfillSummaries().catch((error) => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
