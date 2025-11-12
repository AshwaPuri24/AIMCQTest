# AI-Powered MCQ Test Platform - Design Guidelines

## Design System Foundation

**Approach:** Material Design + modern productivity tools (Linear, Notion)  
**Principles:** Clarity first, progressive disclosure, trust/professionalism, focus mode

---

## Typography

**Fonts:**
- **UI/Body:** Inter (Google Fonts) or system fallback
- **Code:** JetBrains Mono

**Scale:**
```
Hero: text-5xl/6xl font-bold
Page Titles: text-4xl font-bold
Sections: text-2xl font-semibold
Cards: text-xl font-semibold
Body: text-base leading-relaxed
Labels: text-sm font-medium
Captions: text-xs
```

---

## Layout & Spacing

**Spacing Units:** 2, 4, 6, 8, 12, 16, 20, 24
- Micro (gaps): 2, 4
- Components: 6, 8
- Sections: 12, 16, 20, 24

**Containers:**
- Landing: max-w-7xl
- App pages: max-w-6xl
- Content/tests: max-w-4xl
- Narrow content: max-w-3xl

**Grids:**
- Dashboard cards: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Stat cards: `grid-cols-2 md:grid-cols-4`

---

## Page Layouts

### Landing Page (6-8 sections)

**Hero (min-h-[600px]):**
- Split: 60% content / 40% image (desktop)
- Components: Headline, subheadline, dual CTAs, trust badges
- Include platform screenshot or AI-themed visual

**Features (py-20):**
- 3-column grid with icon, title, description, screenshot
- Subtle hover elevation

**How It Works (py-20):**
- 4-step horizontal flow with numbered icons and arrows

**Social Proof (py-16):**
- 3-column testimonial cards (avatar, quote, name/role)

**Footer:**
- 4-column links + newsletter signup

### Authentication (Login/Register)

- Split: 50% form / 50% illustration (desktop)
- Form: max-w-md centered card with rounded-xl
- Include: Logo, title (text-3xl), password strength (register), social auth divider
- Stack vertically on mobile

### Dashboard

**Header (h-16, sticky):**
- Logo | Navigation tabs | Profile + notifications

**Layout:**
- Sidebar (lg:w-64, hidden mobile): Nav + quick stats
- Main: Stats cards (4-col) + test history

**Test History:**
- Desktop: Table (Name, Date, Score, Grade, Actions)
- Mobile: Stacked cards
- "Generate New Test" CTA (top right)

### Test Generation Form

- Centered card (max-w-2xl), space-y-6
- Fields: Company, Subject (dropdown), Difficulty (radio + icons), Questions (number input), Context (textarea with char count)
- Actions: "Generate Test" (primary) + "Save Draft" (secondary)

### Active Test

**Header (sticky):**
- Title | Question counter | Timer (prominent countdown)
- Exit/Save buttons (secondary)

**Content (max-w-3xl centered):**
- Question card: Number badge, text (text-lg), code blocks
- 4 full-width option buttons with radio indicators
- Visual feedback for selection

**Navigation:**
- Previous/Next buttons
- Question grid navigator (answered/unanswered states)
- Submit button on last question (requires confirmation modal)

**Timer:** Pulse effect when <10% time remains

### Results

**Summary:**
- Large score: text-6xl font-bold (e.g., "85/100")
- Grade badge, message, actions (Retake, View All, Share)

**Breakdown:**
- Accordion per question: Text, user answer, correct answer, AI reasoning
- Green checkmarks (correct) / red X (incorrect)

**Chart:** Bar chart for topic/difficulty distribution

---

## Component Specifications

### Buttons
```
Primary: rounded-lg px-6 py-3 font-semibold shadow-sm
Secondary: rounded-lg px-6 py-3 font-semibold border-2
Image Overlay: backdrop-blur-md bg-opacity-80
Hover: scale-105 or shadow increase
```

### Cards
```
Standard: rounded-xl shadow-md p-6/8 subtle-border
Hover: shadow-lg transition
Stat Cards: rounded-lg p-4 compact
```

### Form Inputs
```
Text/Email/Password: rounded-lg border-2 px-4 py-3 focus:ring-2
Textareas: min-h-[120px]
Radio/Checkbox: Custom styled, min 44px tap target
```

### Navigation
```
Top Nav: Horizontal links, hover underline, font-medium
Sidebar: Vertical stack, icon+text, active indicator bar
Tabs: Underline with smooth slide animation
```

### Modals
```
Container: max-w-lg/2xl rounded-2xl shadow-2xl centered
Backdrop: bg-opacity-50 backdrop-blur-sm
Close: Absolute top-right icon button
```

### Data Display
```
Tables: Striped rows, hover state, rounded corners, stack on mobile
Progress: rounded-full h-2/3 smooth transitions
Badges: rounded-full px-3 py-1 text-xs font-semibold
Avatars: rounded-full w-8 to w-12
```

### Feedback
```
Alerts: rounded-lg p-4 border-l-4 with icon and close
Toasts: Fixed position, slide-in, auto-dismiss
Loading: Spinner or skeleton screens
Form Errors: Shake animation
```

---

## Images & Visuals

**Hero:** Platform screenshot or AI-themed visual (40% width desktop, right side)  
**Features:** Small screenshots (200-300px) in cards with device frames  
**Auth:** Abstract illustrations (study/achievement themes, 50% width left side)  
**Testimonials:** Circular avatars w-12 to w-16  
**Empty States:** Centered illustrations with encouraging copy

---

## Animations (Functional Only)

```
Page transitions: Fade 100-200ms
Button hover: scale-105 or shadow increase
Modals: Fade + scale
Timer: Pulse when <10% remaining
```

**Avoid:** Parallax, scroll-triggered, complex micro-interactions

---

## Responsive Breakpoints

```
Mobile-first
md: 768px (tablet)
lg: 1024px (desktop)
xl: 1280px (large)
```

**Key Adaptations:**
- Hero: Stack vertically (text first, image below)
- Dashboard sidebar: Hamburger menu on mobile
- Tables → Cards on mobile
- Reduce padding, stack timer/counter on mobile

---

## Accessibility

- Min 44px tap targets for interactive elements
- focus:ring-2 on all inputs
- Clear visual feedback for selected states
- Readable contrast ratios
- Semantic HTML with proper headings

---

**Every element serves functional purpose. Prioritize clarity, maintain professional trust, minimize distractions during active tests.**