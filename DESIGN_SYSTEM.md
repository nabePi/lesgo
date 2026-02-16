# LesGo Design System

> Comprehensive design system for LesGo - Indonesian Private Tutoring Marketplace
> Generated with UI/UX Pro Max intelligence

---

## 1. Design Philosophy

### Core Identity
LesGo is a **trust-focused marketplace** connecting parents with verified tutors. The design must convey:
- **Trust & Safety**: Parents are entrusting their children's education
- **Professionalism**: Quality tutors, verified credentials
- **Accessibility**: Easy to use for busy parents
- **Warmth**: Education is personal and caring

### Design Pattern: Marketplace + Trust
- **Primary CTA**: Search bar (reduce friction to find tutors)
- **Trust Signals**: Verification badges, ratings, credentials
- **Visual Hierarchy**: Search → Tutor Cards → Booking → Payment

---

## 2. Color System

### Primary Palette (Education + Trust)

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| **Primary** | Deep Indigo | `#4F46E5` | Brand color, headers, key actions |
| **Secondary** | Soft Indigo | `#818CF8` | Hover states, accents, secondary buttons |
| **CTA** | Success Green | `#22C55E` | Primary buttons, success states, booking |
| **Background** | Cool White | `#F8FAFC` | Page background, cards |
| **Surface** | Pure White | `#FFFFFF` | Cards, modals, elevated surfaces |
| **Text Primary** | Dark Slate | `#0F172A` | Headlines, important text |
| **Text Secondary** | Slate | `#475569` | Body text, descriptions |
| **Text Muted** | Light Slate | `#94A3B8` | Placeholder, disabled text |
| **Border** | Light Gray | `#E2E8F0` | Card borders, dividers |
| **Error** | Rose | `#F43F5E` | Error states, validation |
| **Warning** | Amber | `#F59E0B` | Warnings, pending states |

### Semantic Colors

```css
/* Status Colors */
--status-pending: #F59E0B;      /* Amber - Waiting for payment */
--status-paid: #3B82F6;         /* Blue - Paid, needs confirmation */
--status-confirmed: #22C55E;    /* Green - Confirmed booking */
--status-completed: #10B981;    /* Emerald - Session completed */
--status-cancelled: #EF4444;    /* Red - Cancelled/declined */

/* Verification */
--verified-badge: #10B981;      /* Emerald - Verified tutor */
--unverified-badge: #94A3B8;    /* Gray - Unverified */
```

### Color Usage Rules

1. **Primary Actions**: Use CTA Green (`#22C55E`) for main CTAs ("Cari Guru", "Bayar", "Terima")
2. **Secondary Actions**: Use Primary Indigo (`#4F46E5`) for secondary actions
3. **Trust Elements**: Use Emerald (`#10B981`) for verification badges
4. **Text Contrast**: Always maintain 4.5:1 contrast ratio minimum
5. **Hover States**: Lighten by 10% or add opacity

---

## 3. Typography System

### Font Family

**Primary Recommendation**: Modern Professional (Poppins + Open Sans)

```css
/* Google Fonts Import */
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap');

/* Tailwind Config */
fontFamily: {
  heading: ['Poppins', 'sans-serif'],
  body: ['Open Sans', 'sans-serif'],
}
```

**Alternative for Indonesian Market**: Inter (excellent Latin character support)

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
```

### Type Scale

| Element | Font | Size | Weight | Line Height | Letter Spacing |
|---------|------|------|--------|-------------|----------------|
| **H1** | Poppins | 36px (2.25rem) | 700 | 1.2 | -0.02em |
| **H2** | Poppins | 30px (1.875rem) | 600 | 1.3 | -0.01em |
| **H3** | Poppins | 24px (1.5rem) | 600 | 1.4 | 0 |
| **H4** | Poppins | 20px (1.25rem) | 600 | 1.4 | 0 |
| **H5** | Poppins | 18px (1.125rem) | 500 | 1.5 | 0 |
| **Body Large** | Open Sans | 18px (1.125rem) | 400 | 1.6 | 0 |
| **Body** | Open Sans | 16px (1rem) | 400 | 1.6 | 0 |
| **Body Small** | Open Sans | 14px (0.875rem) | 400 | 1.5 | 0 |
| **Caption** | Open Sans | 12px (0.75rem) | 400 | 1.4 | 0.01em |
| **Button** | Poppins | 16px (1rem) | 600 | 1 | 0.01em |
| **Label** | Open Sans | 14px (0.875rem) | 500 | 1.4 | 0 |

### Typography Rules

1. **Maximum Line Length**: 65-75 characters for body text
2. **Minimum Size**: 16px for body text on mobile
3. **Line Height**: 1.5-1.75 for body text (readability)
4. **Heading Hierarchy**: Clear visual distinction between levels
5. **Indonesian Text**: Ensure proper rendering of accented characters

---

## 4. Component Library

### 4.1 Buttons

**Primary Button (CTA)**
```tsx
// Green CTA for main actions
<Button className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200">
  Cari Guru
</Button>
```

**Secondary Button (Indigo)**
```tsx
// Indigo for secondary actions
<Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200">
  Lihat Profil
</Button>
```

**Outline Button**
```tsx
// For less prominent actions
<Button variant="outline" className="border-2 border-slate-200 hover:border-indigo-600 hover:text-indigo-600 text-slate-700 font-medium px-4 py-2 rounded-lg transition-all duration-200">
  Batal
</Button>
```

**Ghost Button**
```tsx
// For subtle actions
<Button variant="ghost" className="text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 font-medium px-4 py-2 rounded-lg transition-colors duration-200">
  Kembali
</Button>
```

**Button States**
- Default: Full color
- Hover: Darken 10% or add shadow
- Active: Scale down slightly (transform: scale(0.98))
- Disabled: Opacity 50%, cursor not-allowed
- Loading: Show spinner, disable interaction

### 4.2 Cards

**Tutor Card**
```tsx
<div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
  {/* Card content */}
</div>
```

**Card Variants**
- Default: White background, slate border, subtle shadow
- Hover: Elevated shadow, slight border color change
- Selected: Indigo border, indigo background tint
- Featured: Yellow/amber accent border

### 4.3 Forms

**Input Field**
```tsx
<div className="space-y-2">
  <Label className="text-sm font-medium text-slate-700">Label</Label>
  <Input
    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
    placeholder="Placeholder text"
  />
  <p className="text-sm text-red-500">Error message</p>
</div>
```

**Form Patterns**
- Always use Label with htmlFor
- Show error messages below input
- Use focus ring for keyboard navigation
- Red border for invalid state
- Green checkmark for valid state

### 4.4 Badges

**Verification Badge**
```tsx
<span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
  <CheckCircle className="w-3 h-3" />
  Terverifikasi
</span>
```

**Status Badges**
```tsx
// Pending - Amber
<span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
  Menunggu
</span>

// Confirmed - Green
<span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
  Dikonfirmasi
</span>

// Cancelled - Red
<span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
  Dibatalkan
</span>
```

### 4.5 Subject Selector Chips

```tsx
<div className="flex flex-wrap gap-2">
  {SUBJECTS.map((subject) => (
    <button
      key={subject}
      onClick={() => onChange(subject)}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
        value === subject
          ? 'bg-indigo-600 text-white shadow-md'
          : 'bg-white text-slate-700 border border-slate-200 hover:border-indigo-400 hover:text-indigo-600'
      }`}
    >
      {subject}
    </button>
  ))}
</div>
```

---

## 5. Layout Patterns

### 5.1 Page Structure

**Mobile-First Layout**
```
┌─────────────────────────────────────┐
│  Navbar (fixed, floating)           │
├─────────────────────────────────────┤
│                                     │
│  Content Area                       │
│  - max-w-2xl mx-auto                │
│  - px-4 padding                     │
│  - space-y-6 between sections       │
│                                     │
├─────────────────────────────────────┤
│  Bottom Navigation (mobile)         │
└─────────────────────────────────────┘
```

### 5.2 Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Tight spacing, icon gaps |
| `space-2` | 8px | Related elements |
| `space-3` | 12px | Form elements |
| `space-4` | 16px | Default padding |
| `space-6` | 24px | Section gaps |
| `space-8` | 32px | Major sections |
| `space-12` | 48px | Page sections |

### 5.3 Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| Mobile | < 640px | Single column, full-width cards |
| Tablet | 640-1024px | Two columns for lists |
| Desktop | > 1024px | Max-width container, centered |

---

## 6. Animation & Interaction

### 6.1 Timing

| Animation | Duration | Easing |
|-----------|----------|--------|
| Button hover | 200ms | ease-out |
| Card hover | 200ms | ease-out |
| Modal open | 300ms | cubic-bezier(0.4, 0, 0.2, 1) |
| Page transition | 300ms | ease-in-out |
| Loading spinner | 800ms | linear (infinite) |
| Skeleton pulse | 2000ms | ease-in-out (infinite) |

### 6.2 Micro-interactions

**Button Hover**
```css
.button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
```

**Card Hover**
```css
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}
```

**Focus States**
```css
.input:focus {
  ring: 2px;
  ring-color: #4F46E5;
  ring-offset: 2px;
}
```

### 6.3 Loading States

**Skeleton Screen**
```tsx
<div className="animate-pulse space-y-4">
  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
</div>
```

**Spinner**
```tsx
<Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
```

---

## 7. Page-Specific Guidelines

### 7.1 Landing Page (Home)

**Structure**
1. **Hero Section**: Search-focused with prominent search bar
2. **Popular Subjects**: Horizontal scrollable chips
3. **How It Works**: 3-step process (Cari → Pesan → Belajar)
4. **Featured Tutors**: Carousel of top-rated tutors
5. **Trust Signals**: Verification, ratings, safety badges
6. **CTA Section**: "Daftar sebagai Guru" for tutors

**Hero Search Bar**
```tsx
<div className="relative max-w-2xl mx-auto">
  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
  <Input
    className="w-full pl-12 pr-32 py-4 text-lg rounded-full border-2 border-slate-200 focus:border-indigo-500 shadow-lg"
    placeholder="Cari mata pelajaran..."
  />
  <Button className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-full">
    Cari
  </Button>
</div>
```

### 7.2 Search Results Page

**Layout**
- Sticky search bar at top
- Filter chips (subjects, price range, distance)
- Tutor cards in vertical stack
- Distance badge on each card
- Sort options (distance, price, rating)

**Tutor Card Structure**
```
┌─────────────────────────────────────┐
│  [Avatar]  Name          [Verified] │
│            ★ 4.5 (12 reviews)       │
│            📍 2.3 km                │
├─────────────────────────────────────┤
│  Matematika • Fisika • Kimia        │
├─────────────────────────────────────┤
│  Rp 150.000/jam    [Lihat Profil]   │
└─────────────────────────────────────┘
```

### 7.3 Tutor Profile Page

**Layout**
- Large avatar + verification badge
- Name, rating, review count
- Bio section
- Subjects (chips)
- Location (map preview)
- Reviews section
- Sticky booking CTA at bottom

### 7.4 Booking Form

**Form Structure**
1. Subject input (dropdown or chips)
2. Date picker
3. Time picker
4. Duration slider (1-4 hours)
5. Address textarea
6. Price breakdown card
7. Submit button

**Price Breakdown**
```
┌─────────────────────────────────────┐
│  Rincian Biaya                      │
├─────────────────────────────────────┤
│  Tarif per jam    Rp 150.000        │
│  Durasi           2 jam             │
│  ─────────────────────────────────  │
│  Total            Rp 300.000        │
│  (Termasuk biaya platform)          │
└─────────────────────────────────────┘
```

### 7.5 Tutor Dashboard

**Layout**
- Earnings cards (balance, total earned)
- Booking requests list
- Each booking card shows:
  - Subject
  - Parent name
  - Date & time
  - Location
  - Status badge
  - Accept/Decline buttons (when status = paid)

---

## 8. Accessibility Guidelines

### 8.1 WCAG 2.1 AA Compliance

**Color Contrast**
- Normal text: 4.5:1 minimum
- Large text: 3:1 minimum
- UI components: 3:1 minimum

**Focus Management**
- Visible focus ring on all interactive elements
- Focus trap in modals
- Skip to main content link

**Screen Readers**
- Descriptive alt text for images
- aria-label for icon-only buttons
- Proper heading hierarchy (h1 → h2 → h3)

**Touch Targets**
- Minimum 44x44px for interactive elements
- Adequate spacing between touch targets

### 8.2 Keyboard Navigation

```tsx
// Ensure keyboard accessibility
<button
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
  tabIndex={0}
  className="focus:ring-2 focus:ring-indigo-500 focus:outline-none"
>
  Action
</button>
```

---

## 9. Iconography

### Icon Library: Lucide React

**Core Icons**
| Purpose | Icon | Import |
|---------|------|--------|
| Search | Search | `lucide-react` |
| Location | MapPin | `lucide-react` |
| Star/Rating | Star | `lucide-react` |
| Check | CheckCircle | `lucide-react` |
| Calendar | Calendar | `lucide-react` |
| Clock | Clock | `lucide-react` |
| User | User | `lucide-react` |
| Phone | Phone | `lucide-react` |
| Email | Mail | `lucide-react` |
| Money | Wallet | `lucide-react` |
| Loading | Loader2 | `lucide-react` |
| Arrow | ChevronRight | `lucide-react` |
| Close | X | `lucide-react` |
| Menu | Menu | `lucide-react` |

### Icon Usage Rules
1. **Size**: Default 20px (w-5 h-5), large 24px (w-6 h-6), small 16px (w-4 h-4)
2. **Color**: Inherit from parent text color
3. **Stroke Width**: Default 2px
4. **No Emojis**: Always use SVG icons, never emojis

---

## 10. Anti-Patterns to Avoid

### Visual Design
- ❌ Generic purple/pink gradients (overused AI look)
- ❌ No credentials or trust signals
- ❌ Inconsistent spacing
- ❌ Poor contrast ratios

### Interaction
- ❌ Emojis as icons
- ❌ No hover feedback
- ❌ Missing cursor-pointer
- ❌ Layout shift on hover (scale transforms)

### Forms
- ❌ Inputs without labels
- ❌ No error feedback
- ❌ Disabled buttons without explanation
- ❌ No loading states

### Mobile
- ❌ Touch targets < 44px
- ❌ Horizontal scroll
- ❌ Fixed elements covering content
- ❌ Text too small (< 16px)

---

## 11. Implementation Checklist

### Before Development
- [ ] Install required shadcn components
- [ ] Set up Tailwind config with custom colors/fonts
- [ ] Import Google Fonts in layout
- [ ] Set up Lucide icons

### During Development
- [ ] Use semantic HTML
- [ ] Implement focus states
- [ ] Add loading states
- [ ] Test keyboard navigation
- [ ] Check color contrast

### Before Delivery
- [ ] No emojis as icons
- [ ] All clickable elements have cursor-pointer
- [ ] Hover states with smooth transitions
- [ ] Light mode text contrast 4.5:1 minimum
- [ ] Focus states visible
- [ ] Responsive at 375px, 768px, 1024px, 1440px
- [ ] Test on real devices

---

## 12. Quick Reference

### Tailwind Classes

```css
/* Buttons */
.btn-primary: bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200
.btn-secondary: bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200
.btn-outline: border-2 border-slate-200 hover:border-indigo-600 hover:text-indigo-600 text-slate-700 font-medium px-4 py-2 rounded-lg transition-all duration-200

/* Cards */
.card: bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-200
.card-selected: bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500

/* Forms */
.input: w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200
.input-error: border-red-500 focus:ring-red-500 focus:border-red-500
.label: text-sm font-medium text-slate-700

/* Text */
.text-primary: text-slate-900
.text-secondary: text-slate-600
.text-muted: text-slate-400

/* Status Badges */
.badge-verified: bg-emerald-100 text-emerald-700
.badge-pending: bg-amber-100 text-amber-700
.badge-confirmed: bg-emerald-100 text-emerald-700
.badge-cancelled: bg-red-100 text-red-700
```

---

*This design system should be followed for all new UI development in the LesGo project.*
