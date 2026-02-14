# Learnixo - Design Documentation

## Design Philosophy

Learnixo follows a modern, clean, and professional design approach focused on creating an optimal learning environment. The design prioritizes clarity, accessibility, and user engagement while maintaining a sophisticated aesthetic.

---

## Design Principles

### 1. Clarity First
- Clean, uncluttered interfaces
- Clear visual hierarchy
- Intuitive navigation
- Consistent patterns across the platform

### 2. Learning-Focused
- Distraction-free environments
- Emphasis on content over decoration
- Comfortable reading and coding experience
- Minimal cognitive load

### 3. Professional Aesthetic
- Modern, market-ready appearance
- Polished UI components
- Smooth animations and transitions
- Attention to detail

### 4. Accessibility
- High contrast ratios
- Keyboard navigation support
- Screen reader compatibility
- Responsive design for all devices

---

## Color Palette

### Primary Colors
```css
/* Dark Theme (Primary) */
--bg-primary: #0f172a      /* Slate 900 - Main background */
--bg-secondary: #1e293b    /* Slate 800 - Cards, panels */
--bg-tertiary: #334155     /* Slate 700 - Hover states */

/* Accent Colors */
--accent-cyan: #06b6d4     /* Cyan 500 - Primary actions */
--accent-indigo: #6366f1   /* Indigo 500 - Secondary actions */
--accent-purple: #a855f7   /* Purple 500 - Special features */

/* Text Colors */
--text-primary: #f1f5f9    /* Slate 100 - Main text */
--text-secondary: #cbd5e1  /* Slate 300 - Secondary text */
--text-muted: #94a3b8      /* Slate 400 - Muted text */

/* Status Colors */
--success: #10b981         /* Green 500 - Success states */
--warning: #f59e0b         /* Amber 500 - Warnings */
--error: #ef4444           /* Red 500 - Errors */
--info: #3b82f6            /* Blue 500 - Information */
```

### Usage Guidelines
- **Cyan**: Primary CTAs, links, active states
- **Indigo**: Headers, important UI elements
- **Purple**: AI features, special functionality
- **Green**: Success messages, completion indicators
- **Red**: Errors, delete actions
- **Amber**: Warnings, caution states

---

## Typography

### Font Stack
```css
/* Primary Font */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
             'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 
             'Helvetica Neue', sans-serif;

/* Code Font */
font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 
             'source-code-pro', monospace;
```

### Type Scale
```css
/* Headings */
--text-4xl: 2.25rem   /* 36px - Page titles */
--text-3xl: 1.875rem  /* 30px - Section headers */
--text-2xl: 1.5rem    /* 24px - Card headers */
--text-xl: 1.25rem    /* 20px - Subheadings */
--text-lg: 1.125rem   /* 18px - Large body */

/* Body */
--text-base: 1rem     /* 16px - Default body */
--text-sm: 0.875rem   /* 14px - Small text */
--text-xs: 0.75rem    /* 12px - Captions */
```

### Font Weights
- **Light (300)**: Subtle text, decorative
- **Regular (400)**: Body text, descriptions
- **Medium (500)**: Emphasized text
- **Semibold (600)**: Subheadings, labels
- **Bold (700)**: Headings, important text

---

## Spacing System

### Base Unit: 4px (0.25rem)

```css
/* Spacing Scale */
--space-1: 0.25rem   /* 4px */
--space-2: 0.5rem    /* 8px */
--space-3: 0.75rem   /* 12px */
--space-4: 1rem      /* 16px */
--space-5: 1.25rem   /* 20px */
--space-6: 1.5rem    /* 24px */
--space-8: 2rem      /* 32px */
--space-10: 2.5rem   /* 40px */
--space-12: 3rem     /* 48px */
--space-16: 4rem     /* 64px */
```

### Usage
- **Tight (4-8px)**: Related elements, inline spacing
- **Normal (12-16px)**: Component padding, list items
- **Relaxed (20-24px)**: Section spacing, card padding
- **Loose (32-48px)**: Page sections, major divisions

---

## Component Design

### Buttons

#### Primary Button
```css
background: linear-gradient(to right, #06b6d4, #3b82f6);
color: white;
padding: 0.75rem 1.5rem;
border-radius: 0.5rem;
font-weight: 600;
transition: all 0.3s ease;
```

#### Secondary Button
```css
background: transparent;
border: 2px solid #06b6d4;
color: #06b6d4;
padding: 0.75rem 1.5rem;
border-radius: 0.5rem;
```

#### Icon Button
```css
background: rgba(6, 182, 212, 0.1);
color: #06b6d4;
padding: 0.5rem;
border-radius: 0.5rem;
```

### Cards
```css
background: #1e293b;
border-radius: 1rem;
padding: 1.5rem;
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
border: 1px solid rgba(255, 255, 255, 0.1);
```

### Input Fields
```css
background: #0f172a;
border: 2px solid #334155;
border-radius: 0.5rem;
padding: 0.75rem 1rem;
color: #f1f5f9;
transition: border-color 0.3s ease;

/* Focus State */
border-color: #06b6d4;
outline: none;
box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.1);
```

### Code Blocks
```css
background: #0f172a;
border: 1px solid #334155;
border-radius: 0.5rem;
padding: 1rem;
font-family: monospace;
overflow-x: auto;
```

---

## Layout Structure

### Page Layout
```
┌─────────────────────────────────────┐
│           Header (Fixed)            │
├──────┬──────────────────────────────┤
│      │                              │
│ Side │      Main Content            │
│ bar  │      (Scrollable)            │
│      │                              │
│      │                              │
└──────┴──────────────────────────────┘
```

### Grid System
- **12-column grid** for flexible layouts
- **Responsive breakpoints**:
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px
  - Wide: > 1280px

### Container Widths
```css
--container-sm: 640px
--container-md: 768px
--container-lg: 1024px
--container-xl: 1280px
--container-2xl: 1536px
```

---

## Page-Specific Designs

### Home Page
- **Hero Section**: Large heading with gradient text, CTA buttons
- **Features Grid**: 3-column layout showcasing key features
- **Statistics**: 4-column metrics display
- **Testimonials**: Carousel with user feedback
- **Pricing**: 3-tier pricing cards
- **Footer**: Links, social media, newsletter signup

### Dashboard
- **Top Bar**: Welcome message, notifications, profile
- **Stats Cards**: 4-column grid with key metrics
- **Activity Calendar**: Heatmap visualization
- **Skill Chart**: Radar chart for skill levels
- **Quick Actions**: 3-column grid of action cards
- **Recent Activity**: List of recent items

### AI Learnixo
- **Full-screen Chat**: Maximized conversation area
- **Message Bubbles**: 
  - User: Right-aligned, cyan gradient
  - AI: Left-aligned, slate background
- **Input Area**: Fixed bottom with send button
- **Markdown Rendering**: 
  - Headers in indigo
  - Code blocks with syntax highlighting
  - Lists with custom bullets

### Playground
- **Split View**: 
  - Left: Code editor (60%)
  - Right: Output/Preview (40%)
- **Top Bar**: Language selector, run button, AI features
- **Editor**: Monaco editor with theme matching
- **Output**: Console-style display with ANSI colors

### Code Editor
- **Simple Layout**: Full-width editor
- **Top Controls**: Language selector, theme toggle
- **Preview Panel**: Toggle for HTML/CSS preview
- **Clean Interface**: Minimal distractions

### Learning Page
- **Three-Column Layout**:
  - Left: Course navigation (20%)
  - Center: Video/Content (50%)
  - Right: Code editor (30%)
- **Tabbed Interface**: Transcript, Resources, AI Tutor
- **Progress Bar**: Visual lesson completion

---

## Animations & Transitions

### Timing Functions
```css
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### Common Animations
```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide Up */
@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Scale In */
@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
```

### Hover Effects
- **Buttons**: Scale(1.05), brightness increase
- **Cards**: Lift with shadow, border glow
- **Links**: Color transition, underline animation
- **Icons**: Rotate, color change

---

## Iconography

### Icon Library
- **Primary**: Lucide React icons
- **Style**: Outline style, 24px default
- **Colors**: Match text colors, accent on hover

### Common Icons
- **Navigation**: Home, Book, Code, Play, Settings
- **Actions**: Plus, Edit, Trash, Save, Download
- **Status**: Check, X, Alert, Info
- **AI**: Sparkles, Brain, Lightbulb, Robot

---

## Responsive Design

### Mobile (< 640px)
- Single column layouts
- Collapsible sidebar
- Stacked navigation
- Full-width components
- Touch-friendly targets (44px minimum)

### Tablet (640px - 1024px)
- Two-column layouts
- Persistent sidebar (collapsible)
- Horizontal navigation
- Optimized spacing

### Desktop (> 1024px)
- Multi-column layouts
- Fixed sidebar
- Expanded navigation
- Maximum content width
- Hover interactions

---

## Dark Theme (Primary)

### Background Layers
```css
/* Layer 1 - Base */
background: #0f172a;

/* Layer 2 - Elevated */
background: #1e293b;

/* Layer 3 - Highest */
background: #334155;
```

### Overlay Effects
```css
/* Subtle overlay */
background: rgba(255, 255, 255, 0.05);

/* Modal backdrop */
background: rgba(0, 0, 0, 0.75);

/* Hover overlay */
background: rgba(6, 182, 212, 0.1);
```

---

## Accessibility Features

### Focus Indicators
```css
outline: 2px solid #06b6d4;
outline-offset: 2px;
```

### Color Contrast
- **Text on dark**: Minimum 7:1 ratio
- **Interactive elements**: Minimum 4.5:1 ratio
- **Large text**: Minimum 3:1 ratio

### Screen Reader Support
- Semantic HTML elements
- ARIA labels and roles
- Skip navigation links
- Descriptive alt text

---

## Loading States

### Skeleton Screens
```css
background: linear-gradient(
  90deg,
  #1e293b 0%,
  #334155 50%,
  #1e293b 100%
);
animation: shimmer 2s infinite;
```

### Spinners
- Circular spinner for page loads
- Inline spinner for button actions
- Progress bars for file uploads

---

## Error States

### Error Messages
```css
background: rgba(239, 68, 68, 0.1);
border-left: 4px solid #ef4444;
color: #fca5a5;
padding: 1rem;
border-radius: 0.5rem;
```

### Empty States
- Friendly illustrations
- Clear messaging
- Action buttons to resolve
- Helpful suggestions

---

## Success States

### Success Messages
```css
background: rgba(16, 185, 129, 0.1);
border-left: 4px solid #10b981;
color: #6ee7b7;
padding: 1rem;
border-radius: 0.5rem;
```

### Completion Indicators
- Checkmarks with animation
- Progress celebrations
- Badge awards
- Confetti effects

---

## Design Tools & Resources

### Design System
- Tailwind CSS utility classes
- Custom CSS variables
- Reusable React components
- Storybook for component library

### Assets
- SVG icons (Lucide React)
- Optimized images (WebP format)
- Custom illustrations
- Brand logos

---

## Brand Guidelines

### Logo Usage
- Minimum size: 120px width
- Clear space: 20px on all sides
- Dark background preferred
- No distortion or rotation

### Voice & Tone
- Professional yet approachable
- Educational and supportive
- Clear and concise
- Encouraging and positive

---

**Version**: 1.0.0  
**Last Updated**: February 14, 2026  
**Design Status**: Production Ready
