# computer-store-admin — CLAUDE.md

Back-office Admin Dashboard. Next.js 16 App Router · TypeScript · TailwindCSS v4 · Recharts.
Port: 3001 | Backend: NestJS port 4000 | Auth: NextAuth.js JWT + RBAC

## START EVERY SESSION BY:
1. Reading `.ai/CODING_RULES.md`
2. Reading `.ai/SYSTEM_ARCHITECTURE.md` (role auth + data freshness)
3. Reading `.ai/AI_DEVELOPMENT_GUIDE.md` (task recipes)

## MOCK DATA RULE

**Never modify mock data files** — any file named `_mock.ts`, `_mock_*.ts`, or exporting `MOCK_*` constants.
Mock files are temporary placeholders that will be deleted when real API integration is complete.

- Integration fixes go in `src/services/<module>.service.ts` only
- If a service returns mock data, replace it with a real `apiFetch` call — do not patch the mock
- Never add `categoryId`, `brandIds`, or other fields to mock objects to silence type errors

---

## CRITICAL RULES
- Admin pages NEVER use ISR/cache — always `export const dynamic = "force-dynamic"`
- Every page in `(dashboard)/` needs role-based auth (middleware.ts + useRoleGuard)
- `@computer-store/ui` is NOT installed — import UI from `src/components/ui/` (local)
- DataTable: `import { DataTable } from "@/src/components/admin/DataTable"`
- All forms: react-hook-form + Zod (schemas in `src/lib/validators/`)
- Destructive actions: always wrap in `ConfirmDialog`
- Violet (`accent-600`, `#1E1B4B`) only in AdminSidebar + AdminHeader
- All monetary values: `formatVND()` from `src/lib/format.ts`
- All UI text: Vietnamese

## KEY FILES
- `.ai/FEATURE_SPEC.md` — AD-01…AD-17 screen specs + API endpoints
- `.ai/COMPONENT_GUIDELINES.md` — DataTable, StatCard, form code patterns
- `.ai/DESIGN_SYSTEM.md` — color tokens, typography, layout
- `.ai/FOLDER_STRUCTURE.md` — where to place new files
- `.ai/API_CONTRACT.md` — backend endpoint reference

## Reading .docx Files
Both `pandoc` (preferred) and `python-docx` are installed. Use a **single Bash call** — never chain multiple commands.

```bash
# PREFERRED — pandoc: renders tables as clean markdown tables (best for DB design docs)
pandoc "path/to/file.docx" -t markdown --wrap=none

# Headings only — use first on large documents to get an outline, then target sections
pandoc "path/to/file.docx" -t markdown --wrap=none | grep "^#"

# Fallback — python-docx: plain text only, tables lose formatting
python -c "
import docx, sys
doc = docx.Document(sys.argv[1])
for p in doc.paragraphs:
    if p.text.strip(): print(p.text)
for t in doc.tables:
    for row in t.rows:
        print(' | '.join(c.text.strip() for c in row.cells if c.text.strip()))
" "path/to/file.docx"
```

## graphify
Knowledge graph at `graphify-out/` (18k-line JSON, AST-only).
- To find a specific file/function: `grep -A5 '"label": "TargetName"' graphify-out/graph.json`
- DO NOT read the full `graph.json` — too large, consumes entire context window
- DO NOT read `GRAPH_REPORT.md` — mostly noise (285 communities, most empty)
- For architecture/codebase questions → read `.ai/` docs instead
- After modifying code: run `graphify update .` to refresh the graph (AST-only, no API cost)