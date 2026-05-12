# computer-store-admin — CLAUDE.md

Back-office Admin Dashboard. Next.js 16 App Router · TypeScript · TailwindCSS v4 · Recharts.
Port: 3001 | Backend: NestJS port 4000 | Auth: NextAuth.js JWT + RBAC

---

## BẮT BUỘC KHI IMPLEMENT

- Không được phép xóa toàn bộ file rồi viết lại.
- Không được phép xóa toàn bộ nội dung file rồi viết lại.
- Không được phép implement lại toàn bộ file nếu chỉ có một phần sai cần sửa.
- Chỉ sửa đúng phần bị sai hoặc phần cần bổ sung, theo hướng chỉnh sửa tối thiểu và chính xác.
- Mọi nội dung hiển thị cho người dùng phải dùng tiếng Việt có dấu.
- Comments, tên biến, tên hàm, tên kiểu dữ liệu, và code phải dùng tiếng Anh.
- Cấm sử dụng tiếng Việt không dấu trong nội dung hiển thị cho người dùng.

---

## START EVERY SESSION BY:
1. Reading `.ai/CODING_RULES.md`
2. Reading `.ai/SYSTEM_ARCHITECTURE.md` (role auth + data freshness)
3. Reading `.ai/AI_DEVELOPMENT_GUIDE.md` (task recipes)

## CRITICAL RULES
- Admin pages NEVER use ISR/cache — always `export const dynamic = "force-dynamic"`
- Every page in `(dashboard)/` needs role-based auth (middleware.ts + useRoleGuard)
- `@computer-store/ui` is NOT installed — import UI from `src/components/ui/` (local)
- DataTable: `import { DataTable } from "@/src/components/admin/DataTable"`
- All forms: react-hook-form + Zod (schemas in `src/lib/validators/`)
- Destructive actions: always wrap in `ConfirmDialog`
- Navy/Blue theme: sidebar bg `#0F172A`, active items `blue-600` (`#2563EB`)
- All monetary values: `formatVND()` from `src/lib/format.ts`
- All UI text: Vietnamese

## KEY FILES
- `.ai/FEATURE_SPEC.md` — AD-01…AD-17 screen specs + API endpoints
- `.ai/COMPONENT_GUIDELINES.md` — DataTable, StatCard, form code patterns
- `.ai/DESIGN_SYSTEM.md` — color tokens, typography, layout
- `.ai/FOLDER_STRUCTURE.md` — where to place new files
- `.ai/API_CONTRACT.md` — backend endpoint reference
