// Content Seeder — imports educational content from doc/contents/ into the database.
//
// Usage: npx tsx scripts/seed-content.ts
//
// Reads:
//   - doc/contents/<contentType>/module-XX-<name>/README.md   -> modules table
//   - doc/contents/<contentType>/module-XX-<name>/lesson-*.md  -> lessons table
//   - doc/contents/<contentType>/module-XX-<name>/quiz.json    -> quizzes + quiz_questions tables
//
// Uses Prisma upsert for idempotent execution.

import { PrismaClient } from '@prisma/client';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const prisma = new PrismaClient();
const __dirname = import.meta.dirname ?? path.dirname(fileURLToPath(import.meta.url));
const CONTENTS_DIR = path.resolve(__dirname, '../../doc/contents');

interface ModuleMeta {
  number: number;
  title: string;
  description: string;
  estimatedMinutes: number;
}

// Format A: claudecode (top-level difficulty/points, questionType/questionText/correctAnswer)
// Format B: external (per-question difficulty/points, type/question/correct_answer)
interface QuizDataRaw {
  title: string;
  difficulty?: string;
  points?: number;
  description?: string;
  passing_score?: number;
  questions: Record<string, unknown>[];
}

interface NormalizedQuestion {
  questionType: string;
  questionText: string;
  codeSnippet: string | null;
  options: unknown;
  correctAnswer: unknown;
  explanation: string;
}

function normalizeQuiz(raw: QuizDataRaw): {
  title: string;
  difficulty: string;
  points: number;
  questions: NormalizedQuestion[];
} {
  const isFormatB = raw.questions[0] && ('type' in raw.questions[0] || 'question' in raw.questions[0]);

  const questions: NormalizedQuestion[] = raw.questions.map((q) => {
    if (isFormatB) {
      return {
        questionType: (q.type as string) ?? 'multiple_choice',
        questionText: (q.question as string) ?? '',
        codeSnippet: (q.code_snippet as string) ?? (q.codeSnippet as string) ?? null,
        options: q.options,
        correctAnswer: q.correct_answer ?? q.correctAnswer,
        explanation: (q.explanation as string) ?? '',
      };
    }
    return {
      questionType: (q.questionType as string) ?? 'multiple_choice',
      questionText: (q.questionText as string) ?? '',
      codeSnippet: (q.codeSnippet as string) ?? null,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: (q.explanation as string) ?? '',
    };
  });

  // For format B: derive quiz-level difficulty/points from questions
  const difficulty = raw.difficulty ?? (questions.length > 0 ? 'medium' : 'easy');
  const points = raw.points ?? questions.reduce((sum, _q, i) => sum + ((raw.questions[i].points as number) ?? 10), 0);

  return { title: raw.title, difficulty, points, questions };
}

function parseModuleReadme(content: string, dirName: string): ModuleMeta {
  const lines = content.split('\n');
  const title = lines.find((l) => l.startsWith('# '))?.replace('# ', '').trim() ?? 'Untitled';

  let number = 0;
  let description = '';
  let estimatedMinutes = 15;

  // Format A: YAML frontmatter between ---
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (frontmatterMatch) {
    const fm = frontmatterMatch[1];
    const numberMatch = fm.match(/number:\s*(\d+)/);
    const descMatch = fm.match(/description:\s*(.+)/);
    const timeMatch = fm.match(/estimatedMinutes:\s*(\d+)/);

    if (numberMatch) number = parseInt(numberMatch[1], 10);
    if (descMatch) description = descMatch[1].trim();
    if (timeMatch) estimatedMinutes = parseInt(timeMatch[1], 10);
  }

  // Format B: blockquote metadata (> **モジュール番号:** 1)
  if (number === 0) {
    const numMatch = content.match(/モジュール番号[：:]\s*\*{0,2}\s*(\d+)/);
    if (numMatch) number = parseInt(numMatch[1], 10);
  }
  if (!description) {
    // Extract from ## モジュール概要 section
    const overviewMatch = content.match(/##\s*モジュール概要\s*\n+([\s\S]*?)(?=\n##|\n---|\Z)/);
    if (overviewMatch) description = overviewMatch[1].trim().split('\n')[0];
  }
  if (estimatedMinutes === 15) {
    const timeMatch = content.match(/所要時間[：:]\s*約?(\d+)/);
    if (timeMatch) estimatedMinutes = parseInt(timeMatch[1], 10);
  }

  // Fallback: extract number from directory name (module-01-xxx -> 1)
  if (number === 0) {
    const dirMatch = dirName.match(/module-(\d+)/);
    if (dirMatch) number = parseInt(dirMatch[1], 10);
  }

  return { number, title, description, estimatedMinutes };
}

async function seedModule(moduleDir: string, contentType: string) {
  const readmePath = path.join(moduleDir, 'README.md');
  if (!fs.existsSync(readmePath)) {
    console.warn(`  Skipping ${moduleDir}: no README.md`);
    return;
  }

  const readmeContent = fs.readFileSync(readmePath, 'utf-8');
  const meta = parseModuleReadme(readmeContent, path.basename(moduleDir));

  console.log(`  Module ${meta.number}: ${meta.title}`);

  // Upsert module using compound unique key (contentType, number)
  const module = await prisma.module.upsert({
    where: {
      contentType_number: { contentType, number: meta.number },
    },
    update: {
      title: meta.title,
      description: meta.description,
      estimatedMinutes: meta.estimatedMinutes,
      isPublished: true,
    },
    create: {
      contentType,
      number: meta.number,
      title: meta.title,
      description: meta.description,
      estimatedMinutes: meta.estimatedMinutes,
      isPublished: true,
    },
  });

  // Import lessons
  const lessonFiles = fs
    .readdirSync(moduleDir)
    .filter((f) => f.startsWith('lesson-') && f.endsWith('.md'))
    .sort();

  for (let i = 0; i < lessonFiles.length; i++) {
    const lessonPath = path.join(moduleDir, lessonFiles[i]);
    const content = fs.readFileSync(lessonPath, 'utf-8');
    const titleMatch = content.match(/^# (.+)/m);
    const title = titleMatch?.[1] ?? lessonFiles[i].replace('.md', '');
    const order = i + 1;

    await prisma.lesson.upsert({
      where: { moduleId_order: { moduleId: module.id, order } },
      update: { title, contentMd: content, isPublished: true },
      create: {
        moduleId: module.id,
        order,
        title,
        contentMd: content,
        lessonType: 'tutorial',
        isPublished: true,
      },
    });

    console.log(`    Lesson ${order}: ${title}`);
  }

  // Import quiz
  const quizPath = path.join(moduleDir, 'quiz.json');
  if (fs.existsSync(quizPath)) {
    const raw: QuizDataRaw = JSON.parse(fs.readFileSync(quizPath, 'utf-8'));
    const quizData = normalizeQuiz(raw);

    const quizId = `quiz-${contentType}-module-${meta.number}`;
    const quiz = await prisma.quiz.upsert({
      where: { id: quizId },
      update: {
        title: quizData.title,
        difficulty: quizData.difficulty,
        points: quizData.points,
      },
      create: {
        id: quizId,
        moduleId: module.id,
        title: quizData.title,
        difficulty: quizData.difficulty,
        points: quizData.points,
      },
    });

    // Delete existing questions and re-create
    await prisma.quizQuestion.deleteMany({ where: { quizId: quiz.id } });

    for (let i = 0; i < quizData.questions.length; i++) {
      const q = quizData.questions[i];
      await prisma.quizQuestion.create({
        data: {
          quizId: quiz.id,
          questionType: q.questionType,
          questionText: q.questionText,
          codeSnippet: q.codeSnippet,
          options: q.options as never,
          correctAnswer: q.correctAnswer as never,
          explanation: q.explanation,
          order: i + 1,
        },
      });
    }

    console.log(`    Quiz: ${quizData.title} (${quizData.questions.length} questions)`);
  }
}

async function main() {
  console.log('Content Seeder starting...');
  console.log(`Reading from: ${CONTENTS_DIR}`);

  if (!fs.existsSync(CONTENTS_DIR)) {
    console.log('Contents directory does not exist yet. Creating...');
    fs.mkdirSync(CONTENTS_DIR, { recursive: true });
    console.log('Done. Add content files and run again.');
    return;
  }

  // Iterate content type subdirectories (claudecode, gemini, etc.)
  const contentTypeDirs = fs
    .readdirSync(CONTENTS_DIR)
    .filter((d) => {
      const fullPath = path.join(CONTENTS_DIR, d);
      return fs.statSync(fullPath).isDirectory() && !d.startsWith('.');
    })
    .sort();

  if (contentTypeDirs.length === 0) {
    console.log('No content type directories found. Add directories like claudecode/, gemini/ to doc/contents/');
    return;
  }

  for (const contentTypeSlug of contentTypeDirs) {
    const ctDir = path.join(CONTENTS_DIR, contentTypeSlug);
    const moduleDirs = fs
      .readdirSync(ctDir)
      .filter((d) => d.startsWith('module-'))
      .sort()
      .map((d) => path.join(ctDir, d));

    if (moduleDirs.length === 0) {
      console.log(`\n[${contentTypeSlug}] No modules found, skipping.`);
      continue;
    }

    console.log(`\n[${contentTypeSlug}] Seeding ${moduleDirs.length} modules...`);
    for (const dir of moduleDirs) {
      await seedModule(dir, contentTypeSlug);
    }
  }

  console.log('\nContent seeding complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
