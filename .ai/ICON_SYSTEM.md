# ICON SYSTEM — computer-store-admin

## Primary: Heroicons

The preferred icon library is `@heroicons/react` (already installed).

```tsx
// Outline — default for all UI icons
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
<ShoppingCartIcon className="w-5 h-5 text-slate-600" />

// Solid — active states, important actions, emphasis
import { HeartIcon } from '@heroicons/react/24/solid';
<HeartIcon className="w-5 h-5 text-red-500" />
```

Sizing convention:
- `w-4 h-4` → small (badge, tight spacing)
- `w-5 h-5` → default (buttons, nav items, table actions)
- `w-6 h-6` → large (section headers, stat card icons)

## Secondary: react-icons

`react-icons` is also installed and may be used for icons not available in Heroicons (e.g., brand icons, specific tech icons).

```tsx
import { FaGooglePay } from 'react-icons/fa';
<FaGooglePay className="w-5 h-5" />
```

## Rules

- Prefer Heroicons for all general UI icons
- Use `react-icons` only when Heroicons doesn't have the specific icon
- Never paste raw `<svg>` code inline
- Never import from Font Awesome, Lucide, or Material Icons packages
- Always use Tailwind sizing classes (`w-* h-*`), never inline `style`
