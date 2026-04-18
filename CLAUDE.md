# File: computer-store-admin/CLAUDE.md

This is computer-store-admin — Back-office Admin Dashboard.
Tech: Next.js 16 App Router + TypeScript + TailwindCSS + Recharts.
Shared UI: @computer-store/ui (shared with computer-store-frontend).

START EVERY SESSION BY:
1. Reading .ai/CODING_RULES.md
2. Reading .ai/SYSTEM_ARCHITECTURE.md (role auth + data freshness rules)
3. Reading .ai/AI_DEVELOPMENT_GUIDE.md
4. Checking node_modules/@computer-store/ui/src/components/

CRITICAL: Admin pages must NEVER be ISR/cached. Always fresh data.
CRITICAL: All pages in (dashboard)/ need role-based auth protection.
CRITICAL: Use DataTable from "@computer-store/ui" for all tables.

# graphify
This project has a graphify knowledge graph at graphify-out/.

Rules:

Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
After modifying code files in this session, run graphify update . to keep the graph current (AST-only, no API cost)