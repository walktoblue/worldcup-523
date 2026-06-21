---
name: Pro Sports Archive
colors:
  surface: '#0f131f'
  surface-dim: '#0f131f'
  surface-bright: '#353946'
  surface-container-lowest: '#0a0e1a'
  surface-container-low: '#171b28'
  surface-container: '#1b1f2c'
  surface-container-high: '#262a37'
  surface-container-highest: '#313442'
  on-surface: '#dfe2f3'
  on-surface-variant: '#c4c6d5'
  inverse-surface: '#dfe2f3'
  inverse-on-surface: '#2c303d'
  outline: '#8e909e'
  outline-variant: '#434653'
  surface-tint: '#b4c5ff'
  primary: '#b4c5ff'
  on-primary: '#002a77'
  primary-container: '#003da5'
  on-primary-container: '#98b1ff'
  inverse-primary: '#2d58bf'
  secondary: '#e9c349'
  on-secondary: '#3c2f00'
  secondary-container: '#af8d11'
  on-secondary-container: '#342800'
  tertiary: '#c0c5df'
  on-tertiary: '#2a3044'
  tertiary-container: '#3f455a'
  on-tertiary-container: '#adb3cc'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#033ea6'
  secondary-fixed: '#ffe088'
  secondary-fixed-dim: '#e9c349'
  on-secondary-fixed: '#241a00'
  on-secondary-fixed-variant: '#574500'
  tertiary-fixed: '#dce1fc'
  tertiary-fixed-dim: '#c0c5df'
  on-tertiary-fixed: '#151b2e'
  on-tertiary-fixed-variant: '#40465b'
  background: '#0f131f'
  on-background: '#dfe2f3'
  surface-variant: '#313442'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  stat-xl:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 40px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
---

## Brand & Style

The design system is engineered for a premium, high-fidelity sports archive experience. It targets enthusiasts and researchers seeking an authoritative historical record of the World Cup. The emotional response is one of "Cinematic Legacy"—evoking the gravity of sports history through a high-contrast, dark-mode environment reminiscent of high-end broadcasting suites and premium streaming platforms.

The style is **Corporate Modern with a Cinematic edge**. It prioritizes high legibility and data density while using "FIFA Blue" and "Gold" as focal points for achievement and prestige. The interface uses deep depth through tonal layering rather than aggressive shadows, creating a focused, immersive environment that puts the historical content center stage.

## Colors

This design system utilizes a tiered navy hierarchy to create depth without sacrificing the "True Dark" aesthetic required for cinematic immersion.

- **Background (#0A0E1A):** The base canvas. Used for the lowest level of the interface.
- **Surface/Cards (#151B2E):** The secondary layer. Used for all container elements, cards, and navigation bars to provide subtle contrast against the background.
- **Primary (#003DA5):** Action color. Reserved for primary buttons, active states, and brand-identifying accents.
- **Highlights/Stats (#D4AF37):** Prestige color. Used exclusively for champions, trophies, record-breaking statistics, and gold-standard achievements.
- **Typography:** Headings must be Pure White (#FFFFFF) to punch through the dark background. Body text uses a muted light gray (Slate 400) to reduce eye strain and establish a clear visual hierarchy.

## Typography

The typography relies on **Inter** for its neutral, systematic, and highly legible characteristics. To achieve the "Broadcasting" feel, we use heavy weights (Bold and Extra Bold) for headlines and statistics.

- **Display & Headlines:** Use tighter letter-spacing and heavy weights to mimic sports news tickers and overlays.
- **Statistics:** A specialized `stat-xl` role is defined for big-number data points, always rendered in Gold.
- **Labels:** Use uppercase with increased letter-spacing for category tags and metadata labels to ensure they are distinct from body copy.

## Layout & Spacing

The design system employs a **12-column fluid grid** for desktop and a **4-column grid** for mobile. 

- **Grid Logic:** Use a 24px gutter to maintain a sense of airiness and luxury between dense data blocks.
- **Rhythm:** All spacing (padding, margins) must be multiples of 4px. Use 16px (md) as the default padding for cards and 24px (lg) for section vertical spacing.
- **Data Density:** In statistical tables, vertical padding can be reduced to 12px to allow for more rows to be visible above the fold.
- **Responsive Behavior:** On mobile devices, side margins shrink to 16px, and multi-column cards reflow into a single-column stack.

## Elevation & Depth

This design system uses **Tonal Layering** instead of physical shadows to maintain a sleek, modern digital feel. 

- **Level 0 (Background):** #0A0E1A - Used for the main app canvas.
- **Level 1 (Surface):** #151B2E - Used for cards, navigation bars, and secondary sections.
- **Level 2 (Interaction):** Subtle 1px inner borders (stroke) using #FFFFFF at 10% opacity are used on Level 1 surfaces to provide edge definition against the background.
- **Overlays:** Modals and dropdowns use a slightly lighter navy (#1F263E) with a 24px background blur (backdrop-filter) to separate them from the primary interface layers.

## Shapes

The shape language is precise and disciplined.

- **Cards & Buttons:** 8px (rounded-md) is the standard. This provides a professional balance between friendly and technical.
- **Chips/Filters:** Full pill-shape (999px) is used to distinguish interactive tags from structural card elements.
- **Media:** 16:9 containers for video must follow the 8px corner radius.
- **Avatars:** Player profiles are always strictly circular (50% radius) with a 2px Gold border for "Legend" status players or a 2px Blue border for active players.

## Components

### Buttons
- **Primary:** Solid FIFA Blue (#003DA5) with White text. 8px radius. Bold uppercase labels.
- **Secondary:** Outlined with 1px FIFA Blue border.
- **Ghost:** No background, white text, used for less prominent actions.

### Statistical Cards
- Feature a `stat-xl` Gold number as the primary focal point.
- Labels sit below the number in `label-md` uppercase gray text.
- Background uses the Surface color (#151B2E).

### Data Tables
- **Header:** Darker than the surface (#0A0E1A) with 1px bottom border in FIFA Blue.
- **Rows:** Alternating background colors (Surface vs a slightly lighter #1C2336) to improve horizontal scanning.
- **Text:** Right-aligned for numerical data; left-aligned for player/team names.

### Chips & Tags
- Pill-shaped. 
- **Active:** FIFA Blue background.
- **Inactive:** Surface color with a subtle 1px border.

### Input Fields
- Dark background (#0A0E1A), 8px radius, 1px border (#1F263E).
- Focus state: Border changes to FIFA Blue with a subtle outer glow.

### Video Containers
- Fixed 16:9 aspect ratio.
- Play button overlay: Semi-transparent circle with a blur effect and white play icon centered.