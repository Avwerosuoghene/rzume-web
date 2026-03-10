---
trigger: glob
globs: ["**/*.scss", "**/*.css"]
description: SCSS and styling standards for the application
---

# Styling Standards

## SCSS Architecture

### File Organization
```
src/app/styles/
├── variables.scss      # Theme variables (colors, spacing, etc.)
├── fonts.scss         # Typography system
└── mixins.scss        # Reusable SCSS mixins
```

### Theme Variables
Always use theme variables from `src/app/styles/variables.scss`

```scss
// Import theme variables
@import 'src/app/styles/variables';

.component {
  color: $text-primary;
  background: $background-light;
  border-color: $border-color;
}
```

### Available Variables

#### Colors
```scss
// Primary colors
$primary-green: #4CAF50;
$primary-green-light: #81C784;
$primary-green-dark: #388E3C;

// Background colors
$background-white: #FFFFFF;
$background-light: #F5F5F5;
$background-dark: #333333;

// Text colors
$text-primary: #333333;
$text-secondary: #666666;
$text-disabled: #999999;

// Status colors
$error-color: #f44336;
$success-color: #4CAF50;
$warning-color: #FF9800;
$info-color: #2196F3;

// Border colors
$border-color: #E0E0E0;
$border-color-dark: #BDBDBD;
```

#### Spacing
```scss
$spacing-xs: 0.25rem;   // 4px
$spacing-sm: 0.5rem;    // 8px
$spacing-md: 1rem;      // 16px
$spacing-lg: 1.5rem;    // 24px
$spacing-xl: 2rem;      // 32px
$spacing-2xl: 3rem;     // 48px
```

## Typography System

### Font Variables
Import from `src/app/styles/fonts.scss`

```scss
@import 'src/app/styles/fonts';

.heading {
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
}
```

### Font Sizes
```scss
$font-size-xs: 10px;
$font-size-sm: 12px;
$font-size-base: 14px;
$font-size-lg: 16px;
$font-size-xl: 18px;
$font-size-2xl: 20px;
$font-size-3xl: 24px;
$font-size-4xl: 28px;
$font-size-5xl: 32px;
$font-size-6xl: 48px;
```

### Font Weights
```scss
$font-weight-light: 300;
$font-weight-regular: 400;
$font-weight-medium: 500;
$font-weight-semibold: 600;
$font-weight-bold: 700;
$font-weight-extrabold: 800;
```

### Typography Mixins
```scss
// Display/Hero text
@include font-display;

// Headings
@include font-heading;

// Body text
@include font-body;

// Caption/small text
@include font-caption;
```

## Responsive Design

### Mobile-First Approach (Required)
Always write styles mobile-first, then add tablet and desktop overrides

```scss
.component {
  // Mobile styles (default, 0-598px)
  padding: 1rem;
  font-size: 14px;
  
  // Tablet (599px and up)
  @media (min-width: 599px) {
    padding: 1.5rem;
    font-size: 16px;
  }
  
  // Desktop (950px and up)
  @media (min-width: 950px) {
    padding: 2rem;
    font-size: 18px;
  }
}
```

### Breakpoints
```scss
// Mobile: 0-598px (default, no media query needed)
// Tablet: 599px+
@media (min-width: 599px) { }

// Desktop: 950px+
@media (min-width: 950px) { }
```

### Responsive Mixins
```scss
// Create reusable responsive mixins
@mixin respond-to($breakpoint) {
  @if $breakpoint == tablet {
    @media (min-width: 599px) { @content; }
  }
  @if $breakpoint == desktop {
    @media (min-width: 950px) { @content; }
  }
}

// Usage
.component {
  padding: 1rem;
  
  @include respond-to(tablet) {
    padding: 1.5rem;
  }
  
  @include respond-to(desktop) {
    padding: 2rem;
  }
}
```

## Component Styling

### Component Scoping
Use `:host` for component-level styles

```scss
:host {
  display: block;
  padding: $spacing-md;
  
  &.compact {
    padding: $spacing-sm;
  }
  
  &.full-width {
    width: 100%;
  }
}
```

### BEM Methodology (Optional but Recommended)
```scss
.card {
  // Block
  background: $background-white;
  border-radius: 8px;
  
  &__header {
    // Element
    padding: $spacing-md;
    border-bottom: 1px solid $border-color;
  }
  
  &__body {
    // Element
    padding: $spacing-md;
  }
  
  &--highlighted {
    // Modifier
    border: 2px solid $primary-green;
  }
}
```

### Nesting Guidelines
- Maximum 3 levels of nesting
- Avoid over-specific selectors
- Use meaningful class names

```scss
// Good
.card {
  .header {
    .title {
      font-size: $font-size-lg;
    }
  }
}

// Bad - too deeply nested
.card {
  .wrapper {
    .container {
      .header {
        .title {
          font-size: $font-size-lg;
        }
      }
    }
  }
}
```

## Layout Patterns

### Flexbox
```scss
.flex-container {
  display: flex;
  gap: $spacing-md;
  
  &--column {
    flex-direction: column;
  }
  
  &--center {
    justify-content: center;
    align-items: center;
  }
  
  &--space-between {
    justify-content: space-between;
  }
}
```

### Grid
```scss
.grid-container {
  display: grid;
  gap: $spacing-md;
  
  // Mobile: 1 column
  grid-template-columns: 1fr;
  
  // Tablet: 2 columns
  @media (min-width: 599px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  // Desktop: 3 columns
  @media (min-width: 950px) {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

## Form Styling

### Input Fields
```scss
.form-input {
  width: 100%;
  padding: $spacing-sm $spacing-md;
  border: 1px solid $border-color;
  border-radius: 4px;
  font-size: $font-size-base;
  
  &:focus {
    outline: none;
    border-color: $primary-green;
    box-shadow: 0 0 0 3px rgba($primary-green, 0.1);
  }
  
  &:disabled {
    background: $background-light;
    color: $text-disabled;
    cursor: not-allowed;
  }
  
  &.error {
    border-color: $error-color;
  }
}
```

### Floating Labels
```scss
.form-field {
  position: relative;
  
  .label {
    position: absolute;
    top: 50%;
    left: $spacing-md;
    transform: translateY(-50%);
    transition: all 0.2s ease;
    pointer-events: none;
    color: $text-secondary;
  }
  
  .input:focus + .label,
  .input:not(:placeholder-shown) + .label {
    top: 0;
    font-size: $font-size-xs;
    background: $background-white;
    padding: 0 $spacing-xs;
  }
}
```

## Animations and Transitions

### Transition Standards
```scss
.component {
  // Use consistent timing functions
  transition: all 0.3s ease;
  
  // Or specific properties
  transition: 
    opacity 0.3s ease,
    transform 0.3s ease;
}
```

### Common Animations
```scss
// Fade in
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

// Slide in
@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

// Usage
.animated {
  animation: fadeIn 0.3s ease;
}
```

## Utility Classes

### Spacing Utilities
```scss
.mt-1 { margin-top: $spacing-xs; }
.mt-2 { margin-top: $spacing-sm; }
.mt-3 { margin-top: $spacing-md; }
.mt-4 { margin-top: $spacing-lg; }

.p-1 { padding: $spacing-xs; }
.p-2 { padding: $spacing-sm; }
.p-3 { padding: $spacing-md; }
.p-4 { padding: $spacing-lg; }
```

### Text Utilities
```scss
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

.text-bold { font-weight: $font-weight-bold; }
.text-light { font-weight: $font-weight-light; }

.text-primary { color: $text-primary; }
.text-secondary { color: $text-secondary; }
.text-error { color: $error-color; }
.text-success { color: $success-color; }
```

## Best Practices

### Performance
- ✅ Avoid expensive selectors (e.g., `*`, `[attribute]`)
- ✅ Minimize use of `!important`
- ✅ Use CSS containment when appropriate
- ✅ Optimize animations (use `transform` and `opacity`)

### Maintainability
- ✅ Use variables for all colors and spacing
- ✅ Keep selectors simple and readable
- ✅ Comment complex styles
- ✅ Group related styles together
- ✅ Use consistent naming conventions

### Accessibility
- ✅ Ensure sufficient color contrast (WCAG AA)
- ✅ Don't rely solely on color for information
- ✅ Make interactive elements clearly visible
- ✅ Provide focus indicators
- ✅ Support keyboard navigation

### Anti-Patterns to Avoid
- ❌ Inline styles in HTML
- ❌ Overly specific selectors
- ❌ Magic numbers (use variables)
- ❌ Duplicate code (use mixins)
- ❌ Deep nesting (max 3 levels)
- ❌ Global styles that affect components
