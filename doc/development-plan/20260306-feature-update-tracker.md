# Feature Design: Update Tracker (Content Freshness Tracking)

> 各ツールの公式更新を追跡し、コンテンツの鮮度をユーザー・管理者の両方に可視化する機能。

---

## 1. Feature Overview

**Feature Name:** Update Tracker
**Purpose:** 学習コンテンツが公式ツールの最新バージョンにどの程度追従しているかを追跡・表示する
**Target Users:** 全ユーザー（閲覧）、管理者（更新管理）
**Platforms:** Web + Mobile

### 1.1 解決する課題

| 課題 | 現状 | Update Tracker 導入後 |
|------|------|----------------------|
| コンテンツが古いか分からない | ユーザーに伝える手段がない | Freshness Score でリアルタイム表示 |
| どのレッスンが影響を受けるか不明 | 管理者が手動で全レッスンを確認 | バージョン変更と影響レッスンが自動マッピング |
| 更新作業の優先順位が立てにくい | 感覚的に判断 | Breaking change 優先の構造化されたキュー |
| ユーザーの信頼性 | コンテンツの鮮度が不透明 | "92% up-to-date" がアプリの信頼性を担保 |

### 1.2 対象ツール

| tool_slug | Display Name | Check Source |
|-----------|-------------|-------------|
| `claude-code` | Claude Code | npm: `@anthropic-ai/claude-code` |
| `codex` | Codex CLI | npm: `@openai/codex` |
| `github-copilot` | GitHub Copilot | GitHub Blog Changelog RSS |
| `gemini` | Gemini CLI | npm / Google AI Blog RSS |

---

## 2. Screen Design

### 2.1 Screen Map

```
├── Update Tracker                          ← ボトムナビ or サイドバーに追加
│   ├── Freshness Overview (全ツール横断)
│   │   ├── Overall Freshness Score
│   │   ├── Tool Cards (ツールごとの鮮度サマリー)
│   │   └── Recent Updates Timeline
│   │
│   ├── Tool Detail (ツール別詳細)
│   │   ├── Version Info Header
│   │   ├── Update Timeline (バージョンカード一覧)
│   │   └── Affected Lessons List
│   │
│   └── Update Detail (個別バージョン詳細)
│       ├── Release Summary
│       ├── Change List
│       ├── Affected Module/Lesson Links
│       └── Official Changelog Link
│
├── [Admin] Update Management               ← 管理者専用
│   ├── Version Registration
│   ├── Impact Mapping Editor
│   └── Freshness Check Trigger
```

### 2.2 Freshness Overview 画面

全ツールの鮮度を一覧で表示するメイン画面。

```
┌─────────────────────────────────────────────────────────┐
│  Update Tracker                                         │
│                                                         │
│  ┌─────────────────────────────────────────────────────┐│
│  │  Overall Content Freshness                          ││
│  │                                                     ││
│  │  ████████████████████████░░░░  92%                  ││
│  │                                                     ││
│  │  4 tools tracked  |  Last checked: 2026-03-05       ││
│  └─────────────────────────────────────────────────────┘│
│                                                         │
│  ┌──────────────────────┐  ┌──────────────────────────┐ │
│  │  Claude Code         │  │  Codex CLI               │ │
│  │  ██████████░░  95%   │  │  ████████░░░░  88%       │ │
│  │  v1.0.32 (latest)    │  │  v0.5.2 (latest)         │ │
│  │  Content: v1.0.30    │  │  Content: v0.5.0          │ │
│  │  2 updates pending   │  │  3 updates pending        │ │
│  └──────────────────────┘  └──────────────────────────┘ │
│                                                         │
│  ┌──────────────────────┐  ┌──────────────────────────┐ │
│  │  GitHub Copilot      │  │  Gemini CLI              │ │
│  │  ████████████  100%  │  │  ██████████░░  90%       │ │
│  │  2026-03 (latest)    │  │  v0.3.1 (latest)         │ │
│  │  Content: 2026-03    │  │  Content: v0.3.0          │ │
│  │  Up to date          │  │  1 update pending         │ │
│  └──────────────────────┘  └──────────────────────────┘ │
│                                                         │
│  ── Recent Updates ──────────────────────────────────── │
│                                                         │
│  ┌─────────────────────────────────────────────────────┐│
│  │  Mar 1  Claude Code v1.0.32                         ││
│  │         Hooks async callback support                ││
│  │         Module 8 Lesson 3  [Pending]                ││
│  ├─────────────────────────────────────────────────────┤│
│  │  Feb 25 Codex CLI v0.5.2                            ││
│  │         New sandbox mode options                    ││
│  │         Module 6 Lesson 2  [Updated]                ││
│  ├─────────────────────────────────────────────────────┤│
│  │  Feb 20 Claude Code v1.0.31                         ││
│  │         /init command new flags                     ││
│  │         Module 3 Lesson 4  [Updated]                ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

### 2.3 Tool Detail 画面

特定ツールの更新履歴と影響レッスンの詳細。

```
┌─────────────────────────────────────────────────────────┐
│  < Back    Claude Code Updates                          │
│                                                         │
│  ┌─────────────────────────────────────────────────────┐│
│  │  Current Status                                     ││
│  │                                                     ││
│  │  Official:   v1.0.32  (2026-03-01)                  ││
│  │  Content:    v1.0.30                                ││
│  │  Freshness:  ████████████████░░░░  95%              ││
│  │  Pending:    2 updates                              ││
│  │                                                     ││
│  │  [View Official Changelog]                          ││
│  └─────────────────────────────────────────────────────┘│
│                                                         │
│  ── Version Timeline ────────────────────────────────── │
│                                                         │
│  ● v1.0.32  2026-03-01                         [!]     │
│  │  Hooks async callback support                       │
│  │  ┌─────────────────────────────────────────────┐    │
│  │  │  Affected Lessons:                          │    │
│  │  │  ├── Module 8 / Lesson 3: PreToolUse/       │    │
│  │  │  │   PostToolUse          [Pending]         │    │
│  │  │  └── Module 8 / Lesson 4: Security          │    │
│  │  │      Patterns             [Pending]         │    │
│  │  └─────────────────────────────────────────────┘    │
│  │                                                      │
│  ● v1.0.31  2026-02-20                         [!]     │
│  │  /init command: --template flag added               │
│  │  ┌─────────────────────────────────────────────┐    │
│  │  │  Affected Lessons:                          │    │
│  │  │  └── Module 3 / Lesson 4: /init Command     │    │
│  │  │                           [In Progress]     │    │
│  │  └─────────────────────────────────────────────┘    │
│  │                                                      │
│  ● v1.0.30  2026-02-10                                 │
│  │  MCP hot-reload, Permission mode UI changes         │
│  │  ┌─────────────────────────────────────────────┐    │
│  │  │  Affected Lessons:                          │    │
│  │  │  ├── Module 2 / Lesson 4: Permissions       │    │
│  │  │  │                        [Updated]         │    │
│  │  │  └── Module 9 / Lesson 2: MCP Config        │    │
│  │  │                           [Updated]         │    │
│  │  └─────────────────────────────────────────────┘    │
│  │                                                      │
│  ● v1.0.28  2026-01-15                                 │
│  │  (Content baseline version)                         │
│  │                                                      │
│  ...                                                    │
└─────────────────────────────────────────────────────────┘
```

### 2.4 Update Detail 画面

個別バージョンの変更詳細。

```
┌─────────────────────────────────────────────────────────┐
│  < Back    Claude Code v1.0.32                          │
│                                                         │
│  Released: 2026-03-01                                   │
│  Type: Feature Addition                                 │
│  Breaking Changes: No                                   │
│                                                         │
│  ── Summary ─────────────────────────────────────────── │
│                                                         │
│  Hooks now support async callbacks, allowing            │
│  PreToolUse and PostToolUse hooks to perform            │
│  asynchronous operations before returning results.      │
│                                                         │
│  ── Changes ─────────────────────────────────────────── │
│                                                         │
│  - [NEW] Async callback support in Hooks                │
│  - [NEW] `await` keyword in hook scripts                │
│  - [CHANGED] Hook timeout default: 5s -> 30s           │
│                                                         │
│  ── Affected Lessons ────────────────────────────────── │
│                                                         │
│  ┌─────────────────────────────────────────────────────┐│
│  │  Module 8: Hooks                                    ││
│  │                                                     ││
│  │  ├── Lesson 3: PreToolUse / PostToolUse             ││
│  │  │   Status: [Pending]                              ││
│  │  │   Impact: Hook examples need async syntax        ││
│  │  │   [Go to Lesson ->]                              ││
│  │  │                                                  ││
│  │  └── Lesson 4: Security Patterns                    ││
│  │      Status: [Pending]                              ││
│  │      Impact: Security hook timeout change           ││
│  │      [Go to Lesson ->]                              ││
│  └─────────────────────────────────────────────────────┘│
│                                                         │
│  ── Official Links ──────────────────────────────────── │
│                                                         │
│  [Changelog]  [Documentation]  [GitHub Release]         │
│                                                         │
│  ── Content Update Status ───────────────────────────── │
│                                                         │
│  Last reviewed: --                                      │
│  Updated by: --                                         │
│  [Admin: Mark as Updated]                               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 2.5 [Admin] Update Management 画面

管理者がバージョン情報の登録・影響マッピングを行う画面。

```
┌─────────────────────────────────────────────────────────┐
│  [Admin] Update Management                              │
│                                                         │
│  ── Register New Version ────────────────────────────── │
│                                                         │
│  Tool:     [Claude Code      v]                         │
│  Version:  [_________________]                          │
│  Date:     [YYYY-MM-DD_______]                          │
│  Summary:  [_________________________________]          │
│  Breaking: [ ] Yes  [x] No                              │
│  URL:      [_________________________________]          │
│                                                         │
│  Affected Modules/Lessons:                              │
│  ┌─────────────────────────────────────────────────────┐│
│  │  [x] Module 8 - Hooks                              ││
│  │      [x] Lesson 3: PreToolUse/PostToolUse          ││
│  │      [x] Lesson 4: Security Patterns               ││
│  │      [ ] Lesson 1: What are Hooks                   ││
│  │      [ ] Lesson 2: Hook Configuration               ││
│  │  [ ] Module 9 - MCP Servers                         ││
│  │  [ ] Module 3 - CLAUDE.md Master                    ││
│  │  ...                                                ││
│  └─────────────────────────────────────────────────────┘│
│                                                         │
│  [Register Version]                                     │
│                                                         │
│  ── Pending Updates Queue ───────────────────────────── │
│                                                         │
│  Priority  Tool         Version  Lessons  Status        │
│  ──────────────────────────────────────────────────────  │
│  [!!]      Claude Code  v1.0.32  2        Pending       │
│  [!!]      Codex CLI    v0.5.2   1        In Progress   │
│  [!]       Claude Code  v1.0.31  1        In Progress   │
│  [.]       Gemini CLI   v0.3.1   1        Pending       │
│                                                         │
│  ── Manual Check ────────────────────────────────────── │
│                                                         │
│  [Check All Tools Now]  Last: 2026-03-05 09:00 UTC      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Platform-Specific UX

### 3.1 Web

| 要素 | 実装 |
|------|------|
| ナビゲーション | サイドバーに "Update Tracker" リンク追加 |
| Tool Detail | Timeline を縦スクロールで表示。左に Timeline、右に Affected Lessons の2カラム |
| Admin UI | Web のみ提供。管理者はダッシュボードからバージョン登録・ステータス更新 |
| キーボード操作 | `J/K` で Timeline 上下移動、`Enter` で Detail 展開 |

### 3.2 Mobile

| 要素 | 実装 |
|------|------|
| ナビゲーション | ボトムタブの "More" メニュー内、または Home Dashboard のウィジェットからアクセス |
| Tool Cards | 横スワイプのカルーセルで4ツール切り替え |
| Timeline | 縦スクロール1カラム。カードタップで Affected Lessons を展開 |
| プッシュ通知 | 新バージョン検出時・コンテンツ更新完了時に通知 |

### 3.3 プラットフォーム共通コンポーネント

| Component | 説明 |
|-----------|------|
| `FreshnessBar` | プログレスバー (0-100%) + 色分け (green/yellow/red) |
| `VersionCard` | バージョン番号・日付・サマリー・ステータスバッジ |
| `StatusBadge` | `Updated` (green) / `In Progress` (blue) / `Pending` (yellow) / `Outdated` (red) |
| `AffectedLessonList` | 影響レッスンのリンクリスト + ステータス |
| `ToolSelector` | タブ or カルーセルでツール切り替え |

---

## 4. Database Schema

### 4.1 New Tables

```
tool_tracking_config (ツール追跡設定 — 管理者が設定)
├── id (PK, uuid)
├── tool_slug (string, unique)             # claude-code, codex, github-copilot, gemini
├── display_name (string)                  # "Claude Code", "Codex CLI", etc.
├── current_content_version (string)       # コンテンツが対応済みのバージョン
├── check_source_type (string)             # npm | github_release | rss
├── check_source_identifier (string)       # package name or RSS URL
├── changelog_url (string)                 # 公式 Changelog URL
├── documentation_url (string)             # 公式 Documentation URL
├── last_checked_at (timestamp)
├── created_at (timestamp)
└── updated_at (timestamp)

tool_versions (ツールの公式バージョン履歴)
├── id (PK, uuid)
├── tool_slug (string, FK → tool_tracking_config.tool_slug)
├── version (string)                       # "1.0.32" or "2026-03" (Copilot)
├── release_date (date)
├── summary (text)                         # 変更概要
├── changes (json)                         # [{type: "new"|"changed"|"fixed"|"deprecated", description: "..."}]
├── changelog_url (string, nullable)       # この特定バージョンのリリースノート URL
├── breaking_changes (boolean, default false)
├── is_processed (boolean, default false)  # 管理者が影響マッピング済みか
├── created_at (timestamp)
└── updated_at (timestamp)

  UNIQUE(tool_slug, version)

content_update_impacts (バージョンとレッスンの影響マッピング)
├── id (PK, uuid)
├── tool_version_id (uuid, FK → tool_versions.id)
├── module_id (integer, FK → modules.id)
├── lesson_id (integer, FK → lessons.id, nullable)  # null = モジュール全体に影響
├── impact_description (text, nullable)              # "Hook examples need async syntax"
├── status (string)                                  # not_affected | pending | in_progress | updated
├── priority (string)                                # critical | high | normal | low
├── reviewed_at (timestamp, nullable)
├── reviewed_by (uuid, FK → users.id, nullable)
├── notes (text, nullable)                           # 管理者メモ
├── created_at (timestamp)
└── updated_at (timestamp)

  UNIQUE(tool_version_id, module_id, lesson_id)
```

### 4.2 ER Diagram

```
tool_tracking_config          tool_versions               content_update_impacts
┌───────────────────┐        ┌────────────────────┐      ┌──────────────────────┐
│ id (PK)           │        │ id (PK)            │      │ id (PK)              │
│ tool_slug (UQ)    │◄───────│ tool_slug (FK)     │      │ tool_version_id (FK) │──► tool_versions
│ display_name      │   1:N  │ version            │  1:N │ module_id (FK)       │──► modules
│ current_content_  │        │ release_date       │◄─────│ lesson_id (FK)       │──► lessons
│   version         │        │ summary            │      │ impact_description   │
│ check_source_type │        │ changes (json)     │      │ status               │
│ check_source_     │        │ changelog_url      │      │ priority             │
│   identifier      │        │ breaking_changes   │      │ reviewed_at          │
│ changelog_url     │        │ is_processed       │      │ reviewed_by (FK)     │──► users
│ documentation_url │        │ created_at         │      │ notes                │
│ last_checked_at   │        │ updated_at         │      │ created_at           │
│ created_at        │        └────────────────────┘      │ updated_at           │
│ updated_at        │                                     └──────────────────────┘
└───────────────────┘
```

### 4.3 Existing Tables との関連

```
modules (既存)                   lessons (既存)
┌──────────────┐                ┌──────────────┐
│ id (PK)      │◄───────────────│ module_id    │
│ number       │                │ id (PK)      │
│ title        │                │ title        │
│ ...          │                │ ...          │
└──────────────┘                └──────────────┘
       ▲                               ▲
       │                               │
       └───── content_update_impacts ──┘
```

### 4.4 Prisma Schema

```prisma
model ToolTrackingConfig {
  id                     String   @id @default(uuid())
  toolSlug               String   @unique @map("tool_slug")
  displayName            String   @map("display_name")
  currentContentVersion  String   @map("current_content_version")
  checkSourceType        String   @map("check_source_type")    // npm | github_release | rss
  checkSourceIdentifier  String   @map("check_source_identifier")
  changelogUrl           String   @map("changelog_url")
  documentationUrl       String   @map("documentation_url")
  lastCheckedAt          DateTime? @map("last_checked_at")
  createdAt              DateTime @default(now()) @map("created_at")
  updatedAt              DateTime @updatedAt @map("updated_at")

  versions ToolVersion[]

  @@map("tool_tracking_config")
}

model ToolVersion {
  id              String   @id @default(uuid())
  toolSlug        String   @map("tool_slug")
  version         String
  releaseDate     DateTime @map("release_date") @db.Date
  summary         String   @db.Text
  changes         Json     @default("[]")
  changelogUrl    String?  @map("changelog_url")
  breakingChanges Boolean  @default(false) @map("breaking_changes")
  isProcessed     Boolean  @default(false) @map("is_processed")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  tool    ToolTrackingConfig  @relation(fields: [toolSlug], references: [toolSlug])
  impacts ContentUpdateImpact[]

  @@unique([toolSlug, version])
  @@map("tool_versions")
}

model ContentUpdateImpact {
  id                String   @id @default(uuid())
  toolVersionId     String   @map("tool_version_id")
  moduleId          Int      @map("module_id")
  lessonId          Int?     @map("lesson_id")
  impactDescription String?  @map("impact_description") @db.Text
  status            String   @default("pending")  // not_affected | pending | in_progress | updated
  priority          String   @default("normal")   // critical | high | normal | low
  reviewedAt        DateTime? @map("reviewed_at")
  reviewedBy        String?  @map("reviewed_by")
  notes             String?  @db.Text
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  toolVersion ToolVersion @relation(fields: [toolVersionId], references: [id])
  module      Module      @relation(fields: [moduleId], references: [id])
  lesson      Lesson?     @relation(fields: [lessonId], references: [id])
  reviewer    User?       @relation(fields: [reviewedBy], references: [id])

  @@unique([toolVersionId, moduleId, lessonId])
  @@map("content_update_impacts")
}
```

---

## 5. API Endpoints

### 5.1 Public Endpoints (All Users)

```
GET /api/updates/summary
  Response:
  {
    "overallFreshness": 92,
    "lastChecked": "2026-03-05T09:00:00Z",
    "tools": [
      {
        "toolSlug": "claude-code",
        "displayName": "Claude Code",
        "freshness": 95,
        "latestVersion": "1.0.32",
        "contentVersion": "1.0.30",
        "pendingUpdates": 2
      },
      ...
    ]
  }

GET /api/updates/:toolSlug
  Response:
  {
    "tool": {
      "toolSlug": "claude-code",
      "displayName": "Claude Code",
      "currentContentVersion": "1.0.30",
      "changelogUrl": "https://...",
      "documentationUrl": "https://...",
      "lastCheckedAt": "2026-03-05T09:00:00Z"
    },
    "versions": [
      {
        "id": "uuid",
        "version": "1.0.32",
        "releaseDate": "2026-03-01",
        "summary": "Hooks async callback support",
        "changes": [
          {"type": "new", "description": "Async callback support in Hooks"},
          {"type": "changed", "description": "Hook timeout default: 5s -> 30s"}
        ],
        "breakingChanges": false,
        "impacts": [
          {
            "moduleId": 8,
            "moduleTitle": "Hooks",
            "lessonId": 3,
            "lessonTitle": "PreToolUse / PostToolUse",
            "status": "pending",
            "priority": "high",
            "impactDescription": "Hook examples need async syntax"
          }
        ]
      },
      ...
    ]
  }

GET /api/updates/:toolSlug/versions/:versionId
  Response: Single version detail with full impact list

GET /api/updates/recent
  Query: ?limit=10
  Response: Recent updates across all tools, sorted by release_date desc
```

### 5.2 Admin Endpoints (Authenticated + Admin Role)

```
POST /api/admin/updates/versions
  Body:
  {
    "toolSlug": "claude-code",
    "version": "1.0.32",
    "releaseDate": "2026-03-01",
    "summary": "Hooks async callback support",
    "changes": [...],
    "breakingChanges": false,
    "changelogUrl": "https://..."
  }
  Response: Created ToolVersion

POST /api/admin/updates/versions/:versionId/impacts
  Body:
  {
    "impacts": [
      {
        "moduleId": 8,
        "lessonId": 3,
        "impactDescription": "Hook examples need async syntax",
        "priority": "high"
      }
    ]
  }
  Response: Created ContentUpdateImpact[]

PATCH /api/admin/updates/impacts/:impactId
  Body:
  {
    "status": "updated",         // pending -> in_progress -> updated
    "notes": "Updated async examples in step 3"
  }
  Response: Updated ContentUpdateImpact

PATCH /api/admin/updates/tools/:toolSlug
  Body:
  {
    "currentContentVersion": "1.0.32"   // Bump content version after all impacts resolved
  }
  Response: Updated ToolTrackingConfig

POST /api/admin/updates/check
  Description: Trigger manual version check for all tools
  Response:
  {
    "results": [
      {"toolSlug": "claude-code", "latestVersion": "1.0.32", "isNew": true},
      {"toolSlug": "codex", "latestVersion": "0.5.2", "isNew": false},
      ...
    ]
  }
```

### 5.3 Zod Schemas

```typescript
import { z } from 'zod';

// ── Request Schemas ────────────────────────────

export const CreateToolVersionSchema = z.object({
  toolSlug: z.enum(['claude-code', 'codex', 'github-copilot', 'gemini']),
  version: z.string().min(1),
  releaseDate: z.string().date(),
  summary: z.string().min(1).max(500),
  changes: z.array(z.object({
    type: z.enum(['new', 'changed', 'fixed', 'deprecated', 'removed']),
    description: z.string().min(1),
  })),
  breakingChanges: z.boolean().default(false),
  changelogUrl: z.string().url().optional(),
});

export const CreateImpactsSchema = z.object({
  impacts: z.array(z.object({
    moduleId: z.number().int().positive(),
    lessonId: z.number().int().positive().optional(),
    impactDescription: z.string().optional(),
    priority: z.enum(['critical', 'high', 'normal', 'low']).default('normal'),
  })).min(1),
});

export const UpdateImpactStatusSchema = z.object({
  status: z.enum(['not_affected', 'pending', 'in_progress', 'updated']),
  notes: z.string().optional(),
});

// ── Response Schemas ───────────────────────────

export const FreshnessSummarySchema = z.object({
  overallFreshness: z.number().min(0).max(100),
  lastChecked: z.string().datetime(),
  tools: z.array(z.object({
    toolSlug: z.string(),
    displayName: z.string(),
    freshness: z.number().min(0).max(100),
    latestVersion: z.string(),
    contentVersion: z.string(),
    pendingUpdates: z.number(),
  })),
});
```

---

## 6. Freshness Score Calculation

### 6.1 Per-Tool Freshness

```typescript
function calculateToolFreshness(
  totalLessons: number,
  impactsByStatus: { pending: number; inProgress: number; updated: number }
): number {
  const { pending, inProgress } = impactsByStatus;
  const affectedNotResolved = pending + inProgress;

  if (totalLessons === 0) return 100;

  const freshness = Math.round(
    ((totalLessons - affectedNotResolved) / totalLessons) * 100
  );

  return Math.max(0, Math.min(100, freshness));
}
```

### 6.2 Overall Freshness

```typescript
function calculateOverallFreshness(
  toolScores: { toolSlug: string; freshness: number; lessonCount: number }[]
): number {
  const totalLessons = toolScores.reduce((sum, t) => sum + t.lessonCount, 0);
  if (totalLessons === 0) return 100;

  const weightedSum = toolScores.reduce(
    (sum, t) => sum + t.freshness * t.lessonCount,
    0
  );

  return Math.round(weightedSum / totalLessons);
}
```

### 6.3 Freshness Color Thresholds

| Range | Color | Label |
|-------|-------|-------|
| 90-100% | Green | Excellent |
| 70-89% | Yellow | Good |
| 50-69% | Orange | Needs Attention |
| 0-49% | Red | Outdated |

---

## 7. Backend: Auto-Check Service

### 7.1 Version Checker

```typescript
// apps/api/src/services/version-checker.ts

interface VersionCheckResult {
  toolSlug: string;
  latestVersion: string;
  isNew: boolean;
}

async function checkNpmVersion(packageName: string): Promise<string> {
  const res = await fetch(`https://registry.npmjs.org/${packageName}/latest`);
  const data = await res.json();
  return data.version;
}

async function checkGitHubRelease(repo: string): Promise<string> {
  const res = await fetch(
    `https://api.github.com/repos/${repo}/releases/latest`,
    { headers: { Accept: 'application/vnd.github.v3+json' } }
  );
  const data = await res.json();
  return data.tag_name.replace(/^v/, '');
}

async function checkAllTools(
  configs: ToolTrackingConfig[]
): Promise<VersionCheckResult[]> {
  const results: VersionCheckResult[] = [];

  for (const config of configs) {
    let latestVersion: string;

    switch (config.checkSourceType) {
      case 'npm':
        latestVersion = await checkNpmVersion(config.checkSourceIdentifier);
        break;
      case 'github_release':
        latestVersion = await checkGitHubRelease(config.checkSourceIdentifier);
        break;
      default:
        continue;
    }

    const existingVersion = await prisma.toolVersion.findUnique({
      where: { toolSlug_version: { toolSlug: config.toolSlug, version: latestVersion } },
    });

    results.push({
      toolSlug: config.toolSlug,
      latestVersion,
      isNew: !existingVersion,
    });
  }

  return results;
}
```

### 7.2 Cron Job (GitHub Actions or Node Cron)

```yaml
# .github/workflows/check-tool-versions.yml
name: Check Tool Versions
on:
  schedule:
    - cron: '0 9 * * 1,4'   # Mon & Thu 9:00 UTC
  workflow_dispatch:

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger version check
        run: |
          curl -X POST "${{ secrets.API_URL }}/api/admin/updates/check" \
            -H "Authorization: Bearer ${{ secrets.ADMIN_API_KEY }}" \
            -H "Content-Type: application/json"
```

---

## 8. Notification Integration

### 8.1 Notification Types

| Event | notification.type | Recipients | Channel |
|-------|------------------|-----------|---------|
| New tool version detected | `tool_version_new` | Admin only | In-App + Email |
| Content update completed | `content_updated` | Users who completed affected module | In-App + Push |
| Content outdated warning | `content_outdated` | Admin only | In-App + Email |

### 8.2 User-Facing Notifications

```
"Module 8 (Hooks) が Claude Code v1.0.32 に対応しました。
 新しい async callback の内容が追加されています。"
 [レッスンを見る]
```

---

## 9. Integration with Existing Features

### 9.1 Home Dashboard

```
┌─────────────────────────────────────────┐
│  Home                                   │
│                                         │
│  ┌─────────────────────────────────────┐│
│  │  Content Freshness  92%  [Details]  ││  ← NEW widget
│  │  ████████████████████░░░            ││
│  │  2 updates pending across 4 tools   ││
│  └─────────────────────────────────────┘│
│                                         │
│  (existing: Progress Overview, etc.)    │
└─────────────────────────────────────────┘
```

### 9.2 Lesson View

レッスン上部にバージョンタグを表示:

```
┌─────────────────────────────────────────┐
│  Lesson: PreToolUse / PostToolUse       │
│                                         │
│  [Updated for v1.0.30]     ← green tag  │
│  or                                     │
│  [Update pending: v1.0.32] ← yellow tag │
│                                         │
│  (lesson content...)                    │
└─────────────────────────────────────────┘
```

### 9.3 Module List

モジュールカードに鮮度インジケーター追加:

```
┌──────────────────────┐
│  Module 8: Hooks     │
│  ★★☆ 中級            │
│  4 Lessons           │
│  ● 95% fresh         │  ← green/yellow/red dot
└──────────────────────┘
```

---

## 10. Content Importer Integration

`scripts/seed-content.ts` に Update Tracker 初期データ投入を追加。

```typescript
// scripts/seed-update-tracker.ts

const TOOL_CONFIGS = [
  {
    toolSlug: 'claude-code',
    displayName: 'Claude Code',
    currentContentVersion: '1.0.28',
    checkSourceType: 'npm',
    checkSourceIdentifier: '@anthropic-ai/claude-code',
    changelogUrl: 'https://docs.anthropic.com/en/docs/claude-code/changelog',
    documentationUrl: 'https://docs.anthropic.com/en/docs/claude-code',
  },
  {
    toolSlug: 'codex',
    displayName: 'Codex CLI',
    currentContentVersion: '0.1.0',
    checkSourceType: 'github_release',
    checkSourceIdentifier: 'openai/codex',
    changelogUrl: 'https://github.com/openai/codex/releases',
    documentationUrl: 'https://github.com/openai/codex',
  },
  {
    toolSlug: 'github-copilot',
    displayName: 'GitHub Copilot',
    currentContentVersion: '2026-02',
    checkSourceType: 'rss',
    checkSourceIdentifier: 'https://github.blog/changelog/label/copilot/feed/',
    changelogUrl: 'https://docs.github.com/en/copilot/about-github-copilot/whats-new-in-github-copilot',
    documentationUrl: 'https://docs.github.com/en/copilot',
  },
  {
    toolSlug: 'gemini',
    displayName: 'Gemini CLI',
    currentContentVersion: '0.1.0',
    checkSourceType: 'npm',
    checkSourceIdentifier: '@anthropic-ai/claude-code', // TODO: replace with actual package
    changelogUrl: 'https://ai.google.dev/gemini-api/docs',
    documentationUrl: 'https://ai.google.dev/gemini-api/docs',
  },
];

async function seedToolTracking() {
  for (const config of TOOL_CONFIGS) {
    await prisma.toolTrackingConfig.upsert({
      where: { toolSlug: config.toolSlug },
      update: config,
      create: config,
    });
  }
}
```

---

## 11. Development Phase

This feature is added to **Phase 3: Advanced**.

```
Phase 3: Advanced (existing items + new)
  ...
  - [ ] Update Tracker: DB schema + migration
  - [ ] Update Tracker: Admin API (version registration, impact mapping)
  - [ ] Update Tracker: Public API (summary, tool detail, recent updates)
  - [ ] Update Tracker: Auto-check service (npm/GitHub version polling)
  - [ ] Update Tracker: Freshness Overview screen (Web)
  - [ ] Update Tracker: Tool Detail screen (Web)
  - [ ] Update Tracker: Admin Management screen (Web)
  - [ ] Update Tracker: Home Dashboard widget integration
  - [ ] Update Tracker: Lesson View version tag
  - [ ] Update Tracker: Mobile screens
  - [ ] Update Tracker: Push notification on content update
```

---

## 12. Shared Types

```typescript
// packages/shared-types/src/update-tracker.ts

export type ToolSlug = 'claude-code' | 'codex' | 'github-copilot' | 'gemini';

export type ChangeType = 'new' | 'changed' | 'fixed' | 'deprecated' | 'removed';

export type ImpactStatus = 'not_affected' | 'pending' | 'in_progress' | 'updated';

export type ImpactPriority = 'critical' | 'high' | 'normal' | 'low';

export interface ToolFreshness {
  toolSlug: ToolSlug;
  displayName: string;
  freshness: number;
  latestVersion: string;
  contentVersion: string;
  pendingUpdates: number;
}

export interface FreshnessSummary {
  overallFreshness: number;
  lastChecked: string;
  tools: ToolFreshness[];
}

export interface ToolVersionChange {
  type: ChangeType;
  description: string;
}

export interface ToolVersionDetail {
  id: string;
  version: string;
  releaseDate: string;
  summary: string;
  changes: ToolVersionChange[];
  breakingChanges: boolean;
  changelogUrl: string | null;
  impacts: VersionImpact[];
}

export interface VersionImpact {
  id: string;
  moduleId: number;
  moduleTitle: string;
  lessonId: number | null;
  lessonTitle: string | null;
  status: ImpactStatus;
  priority: ImpactPriority;
  impactDescription: string | null;
}

export interface ToolDetail {
  tool: {
    toolSlug: ToolSlug;
    displayName: string;
    currentContentVersion: string;
    changelogUrl: string;
    documentationUrl: string;
    lastCheckedAt: string | null;
  };
  versions: ToolVersionDetail[];
}
```

---

## 13. Screen Map (Updated)

```
├── Auth
│   ├── Login
│   └── Account Linking
│
├── Home (Dashboard)
│   ├── Progress Overview
│   ├── Current Module Card
│   ├── Streak Counter
│   ├── Content Freshness Widget            ← NEW
│   ├── Recent Achievements
│   └── [Mobile] Notification Bell
│
├── Learn (Modules)
│   ├── Module List (+ freshness indicator)  ← UPDATED
│   ├── Module Detail
│   │   ├── Lesson List
│   │   ├── Lesson View (+ version tag)      ← UPDATED
│   │   └── Lesson Complete
│   └── Module Complete
│
├── Update Tracker                           ← NEW
│   ├── Freshness Overview
│   ├── Tool Detail
│   └── Update Detail
│
├── [Admin] Update Management                ← NEW
│   ├── Version Registration
│   ├── Impact Mapping Editor
│   └── Freshness Check Trigger
│
├── Quiz
├── Playground
├── [Mobile] Notifications
├── Profile
├── Subscription
└── Settings
```
