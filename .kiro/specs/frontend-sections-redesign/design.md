# Design Document: Frontend Sections Redesign

## Overview

This design describes the visual modernization of all 25 section components within a single file (`resources/js/Components/Sections/SectionRenderer.jsx`). The redesign enhances visual hierarchy, micro-interactions, glassmorphism effects, and animation sophistication while maintaining full backward compatibility with existing props/settings interfaces.

**Key constraints:**
- All changes confined to `SectionRenderer.jsx` (~1511 lines)
- No new dependencies — uses existing Tailwind CSS, Framer Motion, react-icons, and react-compare-slider
- Props/data interfaces remain unchanged
- CSS theme variables from FrontendLayout (`--section-accent`, `--navbar-color`, `--section-bg-light/dark`, `--section-text-light/dark`) continue to be used

## Architecture

The file maintains its current architecture:

```
SectionRenderer.jsx
├── Imports (react, framer-motion, react-icons, react-compare-slider, inertia)
├── Utility functions (htmlToPlainText, normalizeGoogleMapsEmbedUrl, formatPrice)
├── Animation wrappers (FadeIn, StaggerChildren, StaggerItem, AnimatedStatValue)
├── Main export: SectionRenderer (type router + wrapper logic)
└── 25 section components (Hero, Slider, About, Journey, Values, etc.)
```

### Design System Tokens (enforced via Tailwind classes)

| Token | Resting | Hover/Active |
|-------|---------|--------------|
| Border radius (cards) | `rounded-2xl` | — |
| Border radius (containers) | `rounded-3xl` | — |
| Shadow (cards resting) | `shadow-sm` | `shadow-xl` |
| Shadow (elevated) | `shadow-lg` | `shadow-2xl` |
| Section padding | `py-16 sm:py-20 lg:py-24` | — |
| Card hover lift | — | `hover:-translate-y-1.5` |
| Glassmorphism | `bg-white/10 backdrop-blur-md border-white/20` | — |
| Accent glow | `shadow-[0_0_20px_var(--section-accent,#6366f1)/25]` | — |

### Animation Enhancement Strategy

The existing `FadeIn`, `StaggerChildren`, and `StaggerItem` wrappers are enhanced:

1. **FadeIn** — Add configurable direction (`up`, `left`, `right`, `scale`) via optional `direction` prop (default: `up` for backward compat)
2. **StaggerChildren** — Reduce stagger delay from 0.1 to 0.08 for snappier feel
3. **StaggerItem** — Add a `scale` variant option for cards that zoom in slightly
4. **AnimatedStatValue** — Add optional easing options, keep existing logic intact
5. **New: GlassCard** — A reusable wrapper applying glassmorphism styling (backdrop-blur, translucent bg, border)

All animation wrappers maintain their existing API; new props are optional with sensible defaults.

## Components and Interfaces

### Shared Animation Wrappers (Enhanced)

```jsx
// Enhanced FadeIn - backward compatible, new optional 'direction' prop
function FadeIn({ children, className = '', delay = 0, direction = 'up' })

// Enhanced StaggerChildren - faster stagger timing
function StaggerChildren({ children, className = '' })

// Enhanced StaggerItem - optional scale variant
function StaggerItem({ children, className = '', variant = 'slide' })

// NEW: GlassCard wrapper for glassmorphism effect
function GlassCard({ children, className = '', intensity = 'medium' })
// intensity: 'light' | 'medium' | 'strong'
```

### Section Components (Unchanged Interface)

Every section component retains its exact function signature:
- `Hero({ settings })`
- `Slider({ settings, data })`
- `AboutHero({ settings })`
- `About({ settings })`
- `Journey({ settings })`
- `Values({ settings })`
- `Expertise({ settings })`
- `Services({ settings, data })`
- `Products({ settings, data })`
- `BookingService({ settings })`
- `SellLaptop({ settings })`
- `Stats({ settings })`
- `Testimonials({ settings, data })`
- `Gallery({ settings, data })`
- `ImageCompare({ settings })`
- `CTA({ settings })`
- `FAQ({ settings })`
- `Contact({ settings, data })`
- `BlogList({ settings, articles })`
- `RichText({ settings })`
- `Pricing({ settings })`
- `Team({ settings, data })`
- `Location({ settings })`
- `GoogleReviews({ settings })`
- `Generic({ settings })`

### Redesign Approach Per Section Group

#### Group 1: Hero + Slider
- **Hero**: More dramatic gradient mesh background, enhanced floating badges with stronger glassmorphism, CTA buttons with hover glow effects, improved highlight badges with subtle pulse
- **Slider**: Crossfade transition between slides, more sophisticated overlay gradient (multi-stop), enhanced navigation controls with glassmorphism pill, auto-play indicator

#### Group 2: About Sections (AboutHero, About, Journey, Values, Expertise)
- **AboutHero**: Subtle parallax-inspired offset on scroll, gradient overlay on image, decorative geometric accents
- **About**: Decorative accent line, dot pattern background element, staggered text/image entrance
- **Journey**: Stat cards with glassmorphism, animated gradient borders on hover, enhanced counter animation
- **Values**: Larger icons with gradient backgrounds, hover gradient-border effect, more generous spacing
- **Expertise**: Sophisticated dark gradient background with radial patterns, decorative image frame, staggered bullet animation

#### Group 3: Services + Products
- **Services**: Card redesign with subtle gradient backgrounds, distinctive glow border on hover, improved sub-service layout with cleaner separators
- **Products**: E-commerce-inspired card with prominent image, floating discount badge with gradient, image zoom + overlay on hover, enhanced price display

#### Group 4: Forms (BookingService, SellLaptop, Contact)
- **BookingService**: Enhanced card-based layout with stronger visual separation, animated focus states with floating labels feel, celebratory success animation (checkmark + confetti-like motion)
- **SellLaptop**: Mirror BookingService design pattern for consistency
- **Contact**: Stronger glassmorphism on form card, modernized contact info cards with icon glow, map with decorative frame

#### Group 5: Content Sections (Stats, Testimonials, Gallery, ImageCompare, CTA, FAQ, BlogList, RichText)
- **Stats**: Multi-gradient background with mesh pattern, glassmorphism stat cards, larger typography, subtle pulse on values
- **Testimonials**: Cards with more depth (layered shadows), decorative quote marks, smoother fade transitions, subtle card rotation effect
- **Gallery**: Hover overlay with caption + zoom icon, subtle glow border, consistent rounded corners
- **ImageCompare**: Decorative frame with gradient border, enhanced label badges with glassmorphism
- **CTA**: More vibrant gradient with animated decorative orbs, button with pulsing glow
- **FAQ**: Smoother accordion with animated height, rotating chevron icon, accent highlight on open state
- **BlogList**: Card with image overlay gradient on hover, clearer typography hierarchy, category pill badges
- **RichText**: Refined prose styling with accent-colored links, better heading spacing

#### Group 6: Utility Sections (Pricing, Team, Location, GoogleReviews, Generic)
- **Pricing**: Featured plan with gradient border glow, hover elevation, clearer visual distinction
- **Team**: Larger photos (rounded-2xl), hover overlay with social icons, name card with subtle glass effect
- **Location**: Refined icon cards with colored glow, modern map frame, enhanced Instagram CTA
- **GoogleReviews**: Consistent section heading styling, subtle decorative frame for embed
- **Generic**: Minimal but consistent styling matching design system

## Data Models

No data model changes. All section data flows through the existing `section.settings` and `section.data` objects as defined by the Page Builder backend.

## Error Handling

- All sections gracefully handle missing/empty settings (existing behavior preserved)
- Image loading failures fall back to placeholder UI (existing behavior preserved)
- Empty data arrays result in hidden sections (existing behavior preserved)
- Animation wrapper failures are non-blocking (Framer Motion handles gracefully)

## Testing Strategy

**Why Property-Based Testing does NOT apply:**
This feature is a pure UI rendering redesign. It changes CSS classes, Tailwind utilities, and Framer Motion animation props. There are no data transformations, parsers, serializers, or business logic being modified. The inputs and outputs are visual renders, which are not amenable to universal property assertions.

**Recommended testing approach:**

1. **Visual regression testing** (manual):
   - Compare before/after screenshots of each section type
   - Verify responsive behavior at mobile (375px), tablet (768px), and desktop (1440px) breakpoints
   - Verify dark/light section color overrides still apply correctly

2. **Functional spot checks** (manual):
   - Form submissions (BookingService, SellLaptop, Contact) continue working
   - WhatsApp redirect links generate correctly
   - Slider navigation (prev/next/dots) works
   - Testimonials auto-play and manual navigation work
   - FAQ accordion opens/closes smoothly
   - Image compare slider functions properly

3. **Accessibility checks**:
   - Verify aria-labels remain on interactive elements
   - Check color contrast ratios on new gradient backgrounds
   - Verify `prefers-reduced-motion` is respected by new animations

4. **Build verification**:
   - `npm run build` completes without errors after each batch of changes
   - No console warnings/errors in browser dev tools
