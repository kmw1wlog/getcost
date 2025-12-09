# Design Guidelines: Professional Data Marketplace

## Design Approach

**Hybrid Reference-Based System**: Drawing from enterprise SaaS platforms (Stripe, Linear, AWS Marketplace) with emphasis on trust, professionalism, and data clarity. This is a B2B platform requiring credibility signals and efficient information architecture.

## Core Design Principles

1. **Enterprise Trust**: Professional aesthetic that signals reliability and data integrity
2. **Information Clarity**: Clean, scannable layouts for technical specifications
3. **Conversion-Focused**: Clear purchase paths with minimal friction
4. **Technical Authority**: Design language that speaks to data professionals

## Typography

**Font Stack**: 
- Primary: Inter (via Google Fonts) - clean, professional, excellent for data
- Monospace: JetBrains Mono - for dataset specifications, API examples, technical details

**Hierarchy**:
- H1: 3xl to 4xl, font-semibold (page titles, dataset names)
- H2: 2xl, font-semibold (section headers)
- H3: xl, font-medium (subsections, feature titles)
- Body: base, font-normal (descriptions, specifications)
- Technical/Specs: sm, font-mono (dataset details, pricing)
- Small/Meta: sm, font-medium (labels, timestamps, status indicators)

## Layout System

**Spacing Primitives**: Use Tailwind units of 4, 6, 8, 12, 16, 20, 24
- Component padding: p-6 to p-8
- Section spacing: py-16 to py-24
- Card spacing: p-6
- Element gaps: gap-6 to gap-8

**Container Strategy**:
- Max width: max-w-6xl for content areas
- Full-width sections with inner containers
- Asymmetric sidebar layout: 320px fixed sidebar + flexible content area

## Page Structure

### Main Layout
**Vertical Navigation Sidebar** (Fixed, left side):
- Width: 320px
- Contains company branding at top
- Three prominent dataset cards stacked vertically (gap-6)
- Each card includes: dataset icon/badge, expert-level name, brief description, price indicator, "Purchase" CTA
- Bottom section: support contact, documentation link

**Main Content Area** (Right side, scrollable):
- Hero section introducing the data marketplace value proposition
- Dataset detail section (when selected)
- Trust indicators: client logos, security certifications, data samples
- Footer with legal, privacy, terms

### Dataset Cards (Vertical Menu)
Each card structure:
- Icon/visual identifier at top
- Dataset name (H2 level, technical naming convention)
- 2-3 line description of data scope
- Key metrics badge (e.g., "2.5M records", "99.9% accuracy")
- Prominent "Purchase Dataset" button
- Subtle hover state with elevated shadow

### Dataset Detail View
When dataset selected:
- Large dataset name header with category badge
- Split layout: Left column (technical specifications, schema preview, sample data table) + Right column (pricing card with CTA, delivery details, license terms)
- Tabbed interface: Overview / Schema / Sample / Documentation
- Data table preview with monospace font
- Purchase card always visible (sticky on scroll)

## Component Library

### Navigation
- Fixed sidebar navigation with smooth scroll behavior
- Active state indicator for selected dataset
- Breadcrumb trail in main content header

### Cards
- Elevated cards with subtle border
- 8px border radius
- Hover: slight elevation increase with shadow
- Dataset cards: p-6, vertical layout, centered content

### Buttons
**Primary CTA** (Purchase/Payment buttons):
- Large size: px-8 py-4
- Full width on mobile, auto-width on desktop
- Prominent styling with strong contrast
- Include payment security icon

**Secondary**:
- px-6 py-3
- Outline variant for documentation, support links

### Forms & Payment Modal
**Payment Flow Modal**:
- Centered overlay (max-w-md)
- Steps: 1) Contact Info → 2) Payment Method → 3) Confirmation
- Phone number input (for PayApp SMS)
- Radio buttons for cash receipt type (personal/business)
- Business number input (conditional)
- Clear price summary sidebar
- Trust badges near payment button

### Data Display
**Specification Tables**:
- Alternating row backgrounds for readability
- Monospace font for technical values
- Left-aligned labels, right-aligned values
- Copy button for API endpoints, dataset IDs

**Sample Data Tables**:
- Fixed header on scroll
- Monospace for data values
- Compact row spacing
- Horizontal scroll for wide tables

### Trust Elements
- Security badge cluster (SSL, encryption, compliance certifications)
- Client logo grid (if applicable)
- Data update timestamp indicators
- Live status indicators for API availability

## Images

**Hero Section**: 
Professional illustration or abstract data visualization representing secure data infrastructure. Dimensions: 1920x600px, positioned as background with overlay gradient for text readability.

**Dataset Icons**: 
Custom iconography or high-quality illustrations representing each dataset type (e.g., financial data = graph/chart icon, location data = map pin network, user behavior = analytics dashboard). Size: 64x64px per icon.

**Trust Badges**: 
Security certification logos, payment provider logos (PayApp), data compliance badges. Actual logos, not placeholders.

## Animations

Minimal, purposeful motion:
- Smooth sidebar hover states (150ms ease)
- Modal fade-in (200ms)
- Button hover lift (transform: translateY(-2px))
- Loading spinner for payment processing
- Success checkmark animation on purchase completion

No scroll-triggered animations or parallax effects - maintain professional, stable interface.

## Critical UX Flows

1. **Purchase Path**: Dataset card click → Detail view → Purchase button → Payment modal → Phone entry → Payment link generation → Confirmation
2. **Payment Modal**: Auto-focus on phone input, real-time validation, clear error states, loading state during API calls
3. **Receipt Flow**: Conditional business number field, clear type selection (radio buttons), automatic issuance after payment confirmation

## Accessibility

- High contrast text (WCAG AA minimum)
- Focus indicators on all interactive elements
- Keyboard navigation through dataset cards
- Screen reader labels for payment steps
- Error messages with clear recovery paths