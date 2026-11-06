import { describe, it, expect } from 'vitest';
import { CLOZE_QUESTIONS, TOTAL_CLOZE_QUESTIONS, getQuestionsByWeek } from '../src/cloze/clozeData.js';
import { checkBlankAnswer, evaluateBatch, evaluateQuestion, getBatches, normalizeAnswer, filterAndSortQuestions } from '../src/cloze/clozeEvaluator.js';
import { STUDY_TOPICS } from '../src/study/studyData.js';
import { ClozeStorage } from '../src/cloze/clozeStorage.js';
import type { ClozeQuestion, ClozeBlank } from '../src/cloze/clozeTypes.js';

describe('Adversarial Gate 2: Comprehensive Empirical Verification & Stress Harness', () => {

  // =========================================================================
  // SECTION 1: QUESTION BANK AUTHENTICITY & INVENTORY AUDIT
  // =========================================================================
  describe('Section 1: Question Bank Authenticity & Inventory Audit', () => {
    it('Empirical Check 1.1: Exact inventory count is 180 questions', () => {
      expect(CLOZE_QUESTIONS.length).toBe(180);
      expect(TOTAL_CLOZE_QUESTIONS).toBe(180);
    });

    it('Empirical Check 1.2: Question IDs are strictly unique across the entire bank', () => {
      const seenIds = new Set<string>();
      const duplicates: string[] = [];
      for (const q of CLOZE_QUESTIONS) {
        if (seenIds.has(q.id)) {
          duplicates.push(q.id);
        }
        seenIds.add(q.id);
      }
      expect(duplicates, `Found duplicate IDs: ${duplicates.join(', ')}`).toEqual([]);
      expect(seenIds.size).toBe(180);
    });

    it('Empirical Check 1.3: Week coverage spans 1 to 7 with >=24 questions per week (24 for W1-W5, 30 for W6-W7 with classroom photos)', () => {
      const countsByWeek: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
      const expectedByWeek: Record<number, number> = { 1: 24, 2: 24, 3: 24, 4: 24, 5: 24, 6: 30, 7: 30 };
      
      for (const q of CLOZE_QUESTIONS) {
        expect(q.week, `Question ${q.id} has invalid week ${q.week}`).toBeGreaterThanOrEqual(1);
        expect(q.week, `Question ${q.id} has invalid week ${q.week}`).toBeLessThanOrEqual(7);
        countsByWeek[q.week]++;
      }

      for (let w = 1; w <= 7; w++) {
        expect(countsByWeek[w], `Week ${w} question count`).toBeGreaterThanOrEqual(20);
        expect(countsByWeek[w], `Week ${w} should have ${expectedByWeek[w]} questions`).toBe(expectedByWeek[w]);
        
        // Also verify getQuestionsByWeek helper
        const weekQs = getQuestionsByWeek(w);
        expect(weekQs.length).toBe(expectedByWeek[w]);
        expect(weekQs.every(q => q.week === w)).toBe(true);
      }
    });

    it('Empirical Check 1.4: Slide citation audit — all slide numbers in [1, 40] with high dispersion', () => {
      const invalidSlideCitations: Array<{ id: string; slide: number; week: number }> = [];
      const slidesPerWeek: Record<number, Set<number>> = { 1: new Set(), 2: new Set(), 3: new Set(), 4: new Set(), 5: new Set(), 6: new Set(), 7: new Set() };

      for (const q of CLOZE_QUESTIONS) {
        if (typeof q.slideNumber !== 'number' || q.slideNumber < 1 || q.slideNumber > 40 || !Number.isInteger(q.slideNumber)) {
          invalidSlideCitations.push({ id: q.id, slide: q.slideNumber, week: q.week });
        } else {
          slidesPerWeek[q.week].add(q.slideNumber);
        }
      }

      expect(invalidSlideCitations, `Invalid slide citations: ${JSON.stringify(invalidSlideCitations)}`).toEqual([]);

      // Verify that questions are not all citing a single slide (dispersion check: at least 8 distinct slides per week)
      for (let w = 1; w <= 7; w++) {
        expect(
          slidesPerWeek[w].size,
          `Week ${w} slide citation variety is too low (${slidesPerWeek[w].size} distinct slides)`
        ).toBeGreaterThanOrEqual(8);
      }
    });

    it('Empirical Check 1.5: Content authenticity — source sentences, topics, and explanations', () => {
      for (const q of CLOZE_QUESTIONS) {
        expect(q.sourceSentence.trim().length, `Q ${q.id} source sentence too short`).toBeGreaterThan(15);
        expect(q.topic.trim().length, `Q ${q.id} topic too short`).toBeGreaterThan(3);
        expect(q.explanation.trim().length, `Q ${q.id} explanation too short`).toBeGreaterThan(15);
        expect(q.weekTitle, `Q ${q.id} weekTitle mismatch`).toContain(`Week ${q.week}`);

        // Ensure not dummy placeholder strings
        expect(q.sourceSentence.toLowerCase()).not.toContain('lorem ipsum');
        expect(q.sourceSentence.toLowerCase()).not.toContain('placeholder');
        expect(q.sourceSentence.toLowerCase()).not.toContain('todo');
        expect(q.explanation.toLowerCase()).not.toContain('todo');
      }
    });
  });

  // =========================================================================
  // SECTION 2: TEMPLATE TOKEN BIJECTION & ADVERSARIAL PARSING
  // =========================================================================
  describe('Section 2: Template Token Bijection & Adversarial Parsing', () => {
    it('Empirical Check 2.1: Strict bijection between {{blankId}} template tokens and blank definitions', () => {
      const placeholderRegex = /\{\{([a-zA-Z0-9_-]+)\}\}/g;
      const brokenSyntaxRegex = /\{[^{}]*\}|\{\{[^}]*$/g;

      for (const q of CLOZE_QUESTIONS) {
        // 1. Template must contain at least one valid token
        const matches = [...q.template.matchAll(placeholderRegex)];
        expect(matches.length, `Q ${q.id} has no {{token}} in template: "${q.template}"`).toBeGreaterThanOrEqual(1);

        const templateTokenIds = matches.map(m => m[1]);
        const blankIds = q.blanks.map(b => b.id);

        // 2. Token count must equal blank definitions count
        expect(templateTokenIds.length, `Q ${q.id} token count mismatch with blanks count`).toBe(q.blanks.length);

        // 3. Every blank ID must appear in template
        for (const bId of blankIds) {
          expect(templateTokenIds, `Q ${q.id} blank id "${bId}" not in template`).toContain(bId);
        }

        // 4. Every template token must have corresponding blank definition
        for (const tId of templateTokenIds) {
          expect(blankIds, `Q ${q.id} template token "${tId}" not in blanks`).toContain(tId);
        }

        // 5. Blank IDs must be distinct within question
        const uniqueBlankIds = new Set(blankIds);
        expect(uniqueBlankIds.size, `Q ${q.id} has duplicate blank IDs`).toBe(blankIds.length);

        // 6. Adversarial check for malformed curly braces (e.g. single braces, unclosed braces)
        // Clean out valid {{token}} occurrences and test if stray '{' or '}' remain
        const cleanedTemplate = q.template.replace(/\{\{[a-zA-Z0-9_-]+\}\}/g, '');
        expect(cleanedTemplate.includes('{{'), `Q ${q.id} has unclosed '{{' in template: "${q.template}"`).toBe(false);
        expect(cleanedTemplate.includes('}}'), `Q ${q.id} has stray '}}' in template: "${q.template}"`).toBe(false);
        expect(cleanedTemplate.includes('{'), `Q ${q.id} has stray '{' in template: "${q.template}"`).toBe(false);
        expect(cleanedTemplate.includes('}'), `Q ${q.id} has stray '}' in template: "${q.template}"`).toBe(false);
      }
    });

    it('Empirical Check 2.2: Reconstructed template with target answers contains zero residual tokens', () => {
      for (const q of CLOZE_QUESTIONS) {
        let reconstructed = q.template;
        for (const blank of q.blanks) {
          reconstructed = reconstructed.replace(`{{${blank.id}}}`, blank.targetAnswer);
        }
        expect(reconstructed.includes('{{'), `Q ${q.id} reconstructed string contains '{{': "${reconstructed}"`).toBe(false);
        expect(reconstructed.includes('}}'), `Q ${q.id} reconstructed string contains '}}': "${reconstructed}"`).toBe(false);
        expect(reconstructed.length).toBeGreaterThan(q.template.length - (q.blanks.length * 6));
      }
    });
  });

  // =========================================================================
  // SECTION 3: ANSWER SPACE & EVALUATOR ROBUSTNESS
  // =========================================================================
  describe('Section 3: Answer Space & Evaluator Robustness', () => {
    it('Empirical Check 3.1: All 168 questions have valid targetAnswers and acceptedAnswers', () => {
      for (const q of CLOZE_QUESTIONS) {
        for (const blank of q.blanks) {
          expect(blank.targetAnswer.trim().length, `Q ${q.id} blank ${blank.id} targetAnswer empty`).toBeGreaterThan(0);
          expect(blank.acceptedAnswers.length, `Q ${q.id} blank ${blank.id} acceptedAnswers empty`).toBeGreaterThanOrEqual(1);

          // Canonical target answer must be acceptable
          expect(
            checkBlankAnswer(blank.targetAnswer, blank),
            `Q ${q.id} targetAnswer "${blank.targetAnswer}" failed evaluation`
          ).toBe(true);

          // All accepted answers must pass
          for (const ans of blank.acceptedAnswers) {
            expect(
              checkBlankAnswer(ans, blank),
              `Q ${q.id} acceptedAnswer "${ans}" failed evaluation`
            ).toBe(true);
          }
        }
      }
    });

    it('Empirical Check 3.2: Adversarial normalization — case insensitivity, trailing punctuation, whitespace', () => {
      for (const q of CLOZE_QUESTIONS) {
        for (const blank of q.blanks) {
          const target = blank.targetAnswer;

          // Upper case
          expect(checkBlankAnswer(target.toUpperCase(), blank), `Q ${q.id} upper failed: ${target}`).toBe(true);
          // Lower case
          expect(checkBlankAnswer(target.toLowerCase(), blank), `Q ${q.id} lower failed: ${target}`).toBe(true);
          // Whitespace padding
          expect(checkBlankAnswer(`   ${target}   `, blank), `Q ${q.id} padding failed: ${target}`).toBe(true);
          // Trailing punctuation
          expect(checkBlankAnswer(`${target}.`, blank), `Q ${q.id} trailing period failed: ${target}`).toBe(true);
          expect(checkBlankAnswer(`${target},`, blank), `Q ${q.id} trailing comma failed: ${target}`).toBe(true);
          // Mixed quotes/brackets if single word
          if (!target.includes(' ') && target.length > 2) {
            expect(checkBlankAnswer(`"${target}"`, blank), `Q ${q.id} quoted failed: ${target}`).toBe(true);
          }
        }
      }
    });

    it('Empirical Check 3.3: Adversarial rejection — empty, whitespace, and corrupt strings', () => {
      const corruptInputs = [
        '',
        '   ',
        '\t\n',
        'INCORRECT_RANDOM_ANSWER_12345',
        'undefined',
        'null',
        '!!!???...',
        '---\\\\///'
      ];

      for (const q of CLOZE_QUESTIONS.slice(0, 30)) { // Sample 30 questions
        for (const blank of q.blanks) {
          for (const bad of corruptInputs) {
            expect(
              checkBlankAnswer(bad, blank),
              `Q ${q.id} blank ${blank.id} falsely accepted corrupt input: "${bad}"`
            ).toBe(false);
          }
        }
      }
    });

    it('Empirical Check 3.4: Explicit target answer containment in acceptedAnswers', () => {
      const missingTargets: Array<{ qId: string; bId: string; target: string; accepted: string[] }> = [];
      for (const q of CLOZE_QUESTIONS) {
        for (const blank of q.blanks) {
          const hasTarget = blank.acceptedAnswers.some(
            a => a.toLowerCase() === blank.targetAnswer.toLowerCase()
          );
          if (!hasTarget) {
            missingTargets.push({
              qId: q.id,
              bId: blank.id,
              target: blank.targetAnswer,
              accepted: blank.acceptedAnswers
            });
          }
        }
      }
      expect(
        missingTargets,
        `Blanks where targetAnswer is missing from acceptedAnswers: ${JSON.stringify(missingTargets)}`
      ).toEqual([]);
    });

    it('Empirical Check 3.5: Multi-blank question analysis and atomic scoring integrity', () => {
      const multiBlankQuestions = CLOZE_QUESTIONS.filter(q => q.blanks.length > 1);
      // Log / verify multi-blank questions
      for (const q of multiBlankQuestions) {
        // If all blanks correct -> evaluation passes
        const allCorrectAnswers: Record<string, string> = {};
        for (const b of q.blanks) {
          allCorrectAnswers[b.id] = b.targetAnswer;
        }
        const fullEval = evaluateQuestion(q, allCorrectAnswers);
        expect(fullEval.isCorrect).toBe(true);

        // If one blank is omitted/incorrect -> evaluation fails atomically
        const partialAnswers = { ...allCorrectAnswers };
        delete partialAnswers[q.blanks[0].id];
        const partialEval = evaluateQuestion(q, partialAnswers);
        expect(partialEval.isCorrect).toBe(false);
      }
    });
  });

  // =========================================================================
  // SECTION 4: 20-QUESTION BATCHING & EVALUATOR INVARIANTS
  // =========================================================================
  describe('Section 4: 20-Question Batching & Evaluator Invariants', () => {
    it('Empirical Check 4.1: Batching math for 180 questions at batch size 20', () => {
      const batches = getBatches(CLOZE_QUESTIONS, 20);
      expect(batches.length).toBe(9); // 180 / 20 = 9

      // All 9 batches have 20 questions
      for (let i = 0; i < 9; i++) {
        expect(batches[i].batchIndex).toBe(i);
        expect(batches[i].startIndex).toBe(i * 20);
        expect(batches[i].endIndex).toBe((i + 1) * 20);
        expect(batches[i].questions.length).toBe(20);
      }

      // Total questions verified
      const totalInBatches = batches.reduce((sum, b) => sum + b.questions.length, 0);
      expect(totalInBatches).toBe(180);
    });

    it('Empirical Check 4.2: evaluateBatch scoring accuracy across batches', () => {
      const batches = getBatches(CLOZE_QUESTIONS, 20);
      const batch0 = batches[0].questions;

      // Perfect score
      const perfectAnswers: Record<string, string> = {};
      for (const q of batch0) {
        for (const b of q.blanks) {
          perfectAnswers[`${q.id}_${b.id}`] = b.targetAnswer;
        }
      }
      const perfectRes = evaluateBatch(batch0, perfectAnswers);
      expect(perfectRes.totalQuestions).toBe(20);
      expect(perfectRes.correctQuestions).toBe(20);
      expect(perfectRes.percent).toBe(100);
      expect(perfectRes.isPassing).toBe(true);

      // Zero score
      const zeroRes = evaluateBatch(batch0, {});
      expect(zeroRes.totalQuestions).toBe(20);
      expect(zeroRes.correctQuestions).toBe(0);
      expect(zeroRes.percent).toBe(0);
      expect(zeroRes.isPassing).toBe(false);
    });

    it('Empirical Check 4.3: Random shuffle preserves all 180 questions without loss or duplicate', () => {
      const shuffled = filterAndSortQuestions(CLOZE_QUESTIONS, {
        week: 'all',
        sortOrder: 'random',
        shuffleSeed: 42
      });

      expect(shuffled.length).toBe(180);
      const originalIds = new Set(CLOZE_QUESTIONS.map(q => q.id));
      const shuffledIds = new Set(shuffled.map(q => q.id));
      expect(shuffledIds.size).toBe(180);
      expect(shuffledIds).toEqual(originalIds);
      
      // Ensure it is actually shuffled (not identical order)
      expect(shuffled.map(q => q.id)).not.toEqual(CLOZE_QUESTIONS.map(q => q.id));
    });
  });

  // =========================================================================
  // SECTION 5: CURRICULUM SPINE & BACKWARD COMPATIBILITY
  // =========================================================================
  describe('Section 5: Curriculum Spine & Backward Compatibility Invariants', () => {
    it('Empirical Check 5.1: STUDY_TOPICS schema maintains 15 sequential topics', () => {
      expect(STUDY_TOPICS.length).toBe(15);

      STUDY_TOPICS.forEach((topic, idx) => {
        expect(topic.number, `Topic at index ${idx} number mismatch`).toBe(idx + 1);
        expect(topic.subLessons.length, `Topic ${topic.number} has insufficient sublessons`).toBeGreaterThanOrEqual(3);
        expect(topic.title.length, `Topic ${topic.number} title empty`).toBeGreaterThan(3);
        expect(topic.shortTitle.length).toBeGreaterThan(0);
        expect(topic.badge.length).toBeGreaterThan(0);
        expect(topic.mindMap.x).toBeGreaterThan(0);
        expect(topic.mindMap.y).toBeGreaterThan(0);
      });
    });

    it('Empirical Check 5.2: Primary vs Secondary category separation (R1)', () => {
      // Topics 1..7: Primary (1-to-1 Weeks 1..7)
      for (let i = 0; i < 7; i++) {
        const topic = STUDY_TOPICS[i];
        expect(topic.category, `Topic ${topic.number} category`).toBe('primary');
        expect(topic.weekNumber, `Topic ${topic.number} weekNumber`).toBe(i + 1);
        expect(topic.weekLabel, `Topic ${topic.number} weekLabel`).toBe(`Week ${i + 1}`);
      }

      // Topics 8..15: Secondary (Geçen Yıl)
      for (let i = 7; i < 15; i++) {
        const topic = STUDY_TOPICS[i];
        expect(topic.category, `Topic ${topic.number} category`).toBe('secondary');
        expect(topic.weekLabel, `Topic ${topic.number} weekLabel`).toBe('Geçen Yıl');
      }
    });

    it('Empirical Check 5.3: Bilingual sublesson completeness (R2)', () => {
      let totalSubLessons = 0;
      for (const topic of STUDY_TOPICS) {
        for (const sub of topic.subLessons) {
          totalSubLessons++;
          // Turkish content
          expect(sub.title.length, `Sublesson ${sub.id} Turkish title missing`).toBeGreaterThan(2);
          expect(sub.theoryHtml.length, `Sublesson ${sub.id} Turkish theory missing`).toBeGreaterThan(50);
          expect(sub.summary.length, `Sublesson ${sub.id} Turkish summary missing`).toBeGreaterThan(10);

          // English content
          expect(sub.titleEn, `Sublesson ${sub.id} English title missing`).toBeDefined();
          expect(sub.titleEn!.length, `Sublesson ${sub.id} English title empty`).toBeGreaterThan(2);
          expect(sub.theoryHtmlEn, `Sublesson ${sub.id} English theory missing`).toBeDefined();
          expect(sub.theoryHtmlEn!.length, `Sublesson ${sub.id} English theory too short`).toBeGreaterThan(50);
          expect(sub.summaryEn, `Sublesson ${sub.id} English summary missing`).toBeDefined();
          expect(sub.summaryEn!.length, `Sublesson ${sub.id} English summary too short`).toBeGreaterThan(10);
        }
      }
      expect(totalSubLessons).toBe(45); // 15 topics * 3 sublessons = 45
    });
  });

  // =========================================================================
  // SECTION 6: STORAGE PERSISTENCE & FAULT INJECTION STRESS
  // =========================================================================
  describe('Section 6: Storage Persistence & Fault Injection Stress', () => {
    it('Empirical Check 6.1: ClozeStorage persistence roundtrip across 168 questions', () => {
      ClozeStorage.clear();
      expect(Object.keys(ClozeStorage.getAnswers()).length).toBe(0);

      // Save sample answers across weeks 1..7
      for (let w = 1; w <= 7; w++) {
        const q = getQuestionsByWeek(w)[0];
        ClozeStorage.saveAnswer(q.id, q.blanks[0].id, q.blanks[0].targetAnswer);
      }

      const answers = ClozeStorage.getAnswers();
      expect(Object.keys(answers).length).toBe(7);

      // Save batch scores
      ClozeStorage.saveBatchScore(0, 20, 20);
      ClozeStorage.saveBatchScore(1, 15, 20);

      const scores = ClozeStorage.getBatchScores();
      expect(scores[0].percent).toBe(100);
      expect(scores[1].percent).toBe(75);

      ClozeStorage.clear();
      expect(Object.keys(ClozeStorage.getAnswers()).length).toBe(0);
      expect(Object.keys(ClozeStorage.getBatchScores()).length).toBe(0);
    });

    it('Empirical Check 6.2: Fault injection / Synthetic mutation rejection oracle', () => {
      // Test that if we intentionally inject mutations into student answers,
      // the evaluator never produces a false pass.
      const sampleBatch = CLOZE_QUESTIONS.slice(0, 20);
      for (const q of sampleBatch) {
        for (const b of q.blanks) {
          // Mutate target by prepending 'MUTATED_'
          const mutatedAnswer = `MUTATED_${b.targetAnswer}`;
          expect(checkBlankAnswer(mutatedAnswer, b)).toBe(false);

          // Mutate target by appending nonsense characters
          const corruptedAnswer = `${b.targetAnswer}_CORRUPT`;
          expect(checkBlankAnswer(corruptedAnswer, b)).toBe(false);
        }
      }
    });
  });
});
