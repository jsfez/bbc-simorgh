---
name: convert-webcore-component
description: A skill that converts components imported from webcore into more simorgh-like components, following the established coding standards and patterns.
---

# Convert Webcore Component Skill

This skill helps convert webcore-style React components (that use `@emotion/styled` or `styled-components`) into the Simorgh coding standard which uses Emotion's `css` prop pattern.

## Key Conversion Patterns

### 1. Styling Approach

**Before (webcore style using `styled`):**
```jsx
import styled from '@emotion/styled';

const StyledWrapper = styled.div`
  display: flex;
  padding: 16px;
  @media (min-width: 600px) {
    padding: 24px;
  }
`;

const Component = () => <StyledWrapper>Content</StyledWrapper>;
```

**After (Simorgh style using `css` prop):**
```jsx
/** @jsxImportSource @emotion/react */
import styles from './index.styles';

const Component = () => <div css={styles.wrapper()}>Content</div>;
```

### 2. Creating index.styles.ts Files

Create a consolidated styles file with object styles:

```typescript
import { css } from '@emotion/react';
import pixelsToRem from '../../utilities/pixelsToRem';

export default {
  wrapper: () =>
    css({
      display: 'flex',
      padding: `${pixelsToRem(16)}rem`,
      [`@media (min-width: ${pixelsToRem(600)}rem)`]: {
        padding: `${pixelsToRem(24)}rem`,
      },
    }),
  
  // Style with parameters
  title: (isLarge?: boolean) =>
    css({
      fontSize: isLarge ? '2rem' : '1rem',
    }),
    
  // Style using theme (when needed)
  container: ({ mq, palette }: Theme) =>
    css({
      backgroundColor: palette.WHITE,
      [mq.GROUP_3_MIN_WIDTH]: {
        padding: '1rem',
      },
    }),
};
```

### 3. Converting Dynamic Styles

**Before:**
```jsx
const Button = styled.div`
  padding-${({ alignment }) => alignment === 'left' ? 'right' : 'left'}: 12px;
`;
```

**After:**
```typescript
// In index.styles.ts
button: (alignment: 'left' | 'right') =>
  css({
    ...(alignment === 'left'
      ? { paddingInlineEnd: `${pixelsToRem(12)}rem` }
      : { paddingInlineStart: `${pixelsToRem(12)}rem` }),
  }),
```

## Key Rules

1. **Always add JSX pragma** when using css prop:
   ```jsx
   /** @jsxImportSource @emotion/react */
   ```

2. **Use logical CSS properties** for LTR/RTL support:
   - `paddingInlineStart` instead of `padding-left`
   - `marginBlockEnd` instead of `margin-bottom`
   - `borderInlineStart` instead of `border-left`

3. **Use mobile-first media queries** with `min-width`

4. **Use `pixelsToRem` utility** for pixel-to-rem conversion

5. **Group styles by component area** in the styles file with clear comments

6. **Export GRID_AREAS constants** from styles if used in multiple components:
   ```typescript
   export const GRID_AREAS = {
     homeText: 'home_text',
     awayText: 'away_text',
   } as const;
   ```

7. **Style functions always return `css()` call**, even with no parameters:
   ```typescript
   wrapper: () => css({ display: 'flex' }),
   ```

8. **Use arrays for composable styles**:
   ```typescript
   keyEventsHome: () => [
     baseStyles,
     css({ textAlign: 'end' }),
   ],
   ```

## File Structure

After conversion, a components directory should look like:

```
components/
├── index.styles.ts      # Consolidated styles
├── ComponentA.jsx       # Uses css prop with styles import
├── ComponentB.jsx       # Uses css prop with styles import
└── sub-component/
    └── index.js         # Uses ../index.styles or own styles
```

## Reference Examples

See these existing Simorgh components for reference:
- [src/app/components/Billboard/index.styles.ts](src/app/components/Billboard/index.styles.ts)
- [src/app/components/MediaLoader/index.styles.ts](src/app/components/MediaLoader/index.styles.ts)
- [src/app/components/Pagination/index.styles.ts](src/app/components/Pagination/index.styles.ts)

## Pre-Conversion Checklist

Before converting a webcore component, audit its imports for dependencies that may not exist in Simorgh:

### Check for @bbc/web-components imports
Webcore components often import from `@bbc/web-components/`. These are React components (not just styling) that need to be converted first:
- `Carousel` - horizontal scrollable container with heading
- `Heading` - has equivalent at `src/app/components/Heading/`
- Others - check on a case-by-case basis

### Check for @bbc/web-gel-layouts imports
- `Wrap` - provides GEL-compliant padding/margins. Replace with div + theme spacings.
- `Grid` components - may need custom CSS Grid implementation

### Check for @bbc/web-gel-foundations imports
These are typically design tokens that can be replaced:
- `SPACING_*` → Use theme `spacings` (HALF, FULL, DOUBLE, TRIPLE, QUADRUPLE, QUINTUPLE, SEXTUPLE)
- `GROUP_*` → Use theme `mq` media queries (GROUP_1_MIN_WIDTH, GROUP_2_MIN_WIDTH, etc.)
- `fontScale*`, `fontStandard` → Use theme typography via Text/Heading components
- `createSize` → Use `pixelsToRem()` utility

**If a component dependency is missing, stop the conversion and request it be imported first.**

## Common Mistakes to Avoid

1. **Don't mix styled components and css prop** in the same file
2. **Don't forget the JSX pragma** when using css prop
3. **Don't use physical CSS properties** like `left`, `right` for directional layouts
4. **Don't hardcode pixel values** - use `pixelsToRem()`
5. **Don't use `max-width` media queries** when `min-width` would work
6. **Don't pass dynamic props to styled components** - it generates new classes
7. **Don't proceed with conversion if @bbc/web-components dependencies are missing** - they need to be converted first



---
name: migrate-emotion-to-css-modules
description: A skill that converts Emotion-based styling to SCSS CSS modules, using the ThemeProviderSCSSModules token system
---

# Migrate Emotion to CSS Modules Skill

This skill helps convert components from Emotion's `css` prop pattern (or `@emotion/styled`) to SCSS CSS Modules using the project's established `ThemeProviderSCSSModules` system.

## Reference Examples

These components demonstrate the completed migration pattern:
- [src/app/components/ArticleLinksBlock/](src/app/components/ArticleLinksBlock/) - Full migration with nested components
- [src/app/components/ArticleLinksBlock/Promo/](src/app/components/ArticleLinksBlock/Promo/) - Shows dark UI, Opera Mini, and media query patterns
- [src/app/components/Curation/Subhead/](src/app/components/Curation/Subhead/) - Simple component example

## File Structure Best Practices

**Key principle: Each component folder gets its own `index.module.scss`**

Do NOT create one shared styles file for multiple components. Instead, colocate styles with each component:

```
ComponentFolder/
├── index.module.scss    # Styles ONLY for this component
├── index.styles.tsx     # KEEP: Original Emotion styles (for reference)
├── index.tsx            # Imports ./index.module.scss
├── index.test.tsx
└── SubComponent/
    ├── index.module.scss  # Separate styles for SubComponent
    ├── index.styles.tsx
    └── index.tsx          # Imports ./index.module.scss (its own)
```

**Why separate files?**
- Better code organization and maintainability
- Easier to find styles for a specific component
- Prevents style file bloat
- Enables tree-shaking of unused styles
- Follows CSS Modules philosophy of scoped, component-specific styles

## Key Migration Patterns

### 1. Import Changes

**Before (Emotion):**
```jsx
/** @jsxImportSource @emotion/react */
import styles from './index.styles';

// In component
<div css={styles.wrapper({ mq, spacings })}>
```

**After (CSS Modules):**
```jsx
import styles from './index.module.scss';

// In component
<div className={styles.wrapper}>
```

### 2. Theme Token Access

**Before (Emotion - destructures from Theme):**
```typescript
wrapper: ({ mq, spacings, palette, fontSizes, fontVariants }: Theme) =>
  css({ ... })
```

**After (SCSS - imports from themeTokens):**
```scss
@use '@scss/themeTokens' as theme;

.wrapper {
  // Use theme.$ prefix for variables
}
```

### 3. Spacing Values

| Emotion | SCSS |
|---------|------|
| `spacings.HALF` | `theme.$spacings-half` |
| `spacings.FULL` | `theme.$spacings-full` |
| `spacings.DOUBLE` | `theme.$spacings-double` |
| `spacings.TRIPLE` | `theme.$spacings-triple` |
| `spacings.QUADRUPLE` | `theme.$spacings-quadruple` |
| `spacings.QUINTUPLE` | `theme.$spacings-quintuple` |
| `spacings.SEXTUPLE` | `theme.$spacings-sextuple` |

**Example:**
```typescript
// Emotion
padding: `${spacings.DOUBLE}rem ${spacings.TRIPLE}rem`,
```
```scss
// SCSS
padding: #{theme.$spacings-double} #{theme.$spacings-triple};
```

### 4. Palette Colors

| Emotion | SCSS |
|---------|------|
| `palette.WHITE` | `theme.$palette-white` |
| `palette.BLACK` | `theme.$palette-black` |
| `palette.GREY_2` | `theme.$palette-grey-2` |
| `palette.GREY_6` | `theme.$palette-grey-6` |
| `palette.GREY_7` | `theme.$palette-grey-7` |
| `palette.GREY_8` | `theme.$palette-grey-8` |
| `palette.SHADOW` | `theme.$palette-shadow` |
| `palette.POSTBOX` | `theme.$palette-postbox` |

**Example:**
```typescript
// Emotion
color: palette.GREY_8,
backgroundColor: palette.WHITE,
```
```scss
// SCSS
color: theme.$palette-grey-8;
background-color: theme.$palette-white;
```

### 5. Media Queries

| Emotion | SCSS |
|---------|------|
| `mq.GROUP_1_MIN_WIDTH` | `@media (min-width: #{theme.$mediaQueries-group-1-min-width-bp})` |
| `mq.GROUP_2_MIN_WIDTH` | `@media (min-width: #{theme.$mediaQueries-group-2-min-width-bp})` |
| `mq.GROUP_3_MIN_WIDTH` | `@media (min-width: #{theme.$mediaQueries-group-3-min-width-bp})` |
| `mq.GROUP_4_MIN_WIDTH` | `@media (min-width: #{theme.$mediaQueries-group-4-min-width-bp})` |
| `mq.GROUP_5_MIN_WIDTH` | `@media (min-width: #{theme.$mediaQueries-group-5-min-width-bp})` |
| `mq.FORCED_COLOURS` | `@media #{theme.$mediaQueries-forced-colours}` |

**Example:**
```typescript
// Emotion
[mq.GROUP_4_MIN_WIDTH]: {
  padding: `0 ${spacings.DOUBLE}rem`,
},
```
```scss
// SCSS
@media (min-width: #{theme.$mediaQueries-group-4-min-width-bp}) {
  padding: 0 #{theme.$spacings-double};
}
```

### 6. Font Sizes (GEL Typography)

**Before (Emotion spreads fontSizes object):**
```typescript
...fontSizes.pica,
...fontSizes.brevier,
...fontSizes.longPrimer,
```

**After (SCSS uses mixin):**
```scss
@include theme.fontSizes-gel-font-size(pica);
@include theme.fontSizes-gel-font-size(brevier);
@include theme.fontSizes-gel-font-size(long-primer);
```

Note: Use kebab-case for multi-word font sizes (longPrimer → long-primer, doublePica → double-pica).

### 7. Font Variants

| Emotion | SCSS |
|---------|------|
| `fontVariants.sansRegular` | `@include theme.fontVariants-gel-font-variant('sans-regular')` |
| `fontVariants.sansBold` | `@include theme.fontVariants-gel-font-variant('sans-bold')` |
| `fontVariants.serifRegular` | `@include theme.fontVariants-gel-font-variant('serif-regular')` |
| `fontVariants.serifMedium` | `@include theme.fontVariants-gel-font-variant('serif-medium')` |
| `fontVariants.serifBold` | `@include theme.fontVariants-gel-font-variant('serif-bold')` |

**Example:**
```typescript
// Emotion
...fontVariants.serifBold,
```
```scss
// SCSS
@include theme.fontVariants-gel-font-variant('serif-bold');
```

### 8. Pixels to Rem

**Before (Emotion):**
```typescript
import pixelsToRem from '#app/utilities/pixelsToRem';
padding: `${pixelsToRem(12)}rem`,
```

**After (SCSS):**
```scss
padding: #{theme.pixelsToRem-px-to-rem(12)};
```

### 9. Dark UI Handling

**Before (Emotion - uses isDarkUi boolean from Theme):**
```typescript
wrapper: ({ isDarkUi, palette }: Theme) =>
  css({
    color: isDarkUi ? palette.GREY_2 : palette.GREY_8,
    backgroundColor: isDarkUi ? palette.GREY_7 : palette.WHITE,
  }),
```

**After (SCSS - uses data attribute selector):**
```scss
.wrapper {
  color: theme.$palette-grey-8;
  background-color: theme.$palette-white;

  // Dark UI override
  :global([data-is-dark-ui='true']) & {
    color: theme.$palette-grey-2;
    background-color: theme.$palette-grey-7;
  }
}
```

### 10. Opera Mini Handling

**Before (Emotion):**
```typescript
import { OPERA_MINI_CLASSNAME } from '#app/lib/utilities/addOperaMiniClassScript';

[`.${OPERA_MINI_CLASSNAME} &`]: {
  display: 'block',
},
```

**After (SCSS):**
```scss
// Opera Mini overrides
:global(.is-opera-mini) & {
  display: block;
}
```

### 11. Pseudo-elements and States

**Before (Emotion):**
```typescript
'&:hover, &:focus': {
  textDecoration: 'underline',
},
'&:visited': {
  color: palette.GREY_6,
},
'&::before': {
  content: '""',
  position: 'absolute',
},
```

**After (SCSS):**
```scss
&:hover,
&:focus {
  text-decoration: underline;
}

&:visited {
  color: theme.$palette-grey-6;
}

&::before {
  content: '';
  position: absolute;
}
```

### 12. Dynamic Styles with Parameters

If a style function takes parameters for conditional styling, you have options:

**Option A: Multiple classes (preferred for simple cases)**
```scss
.alignment-home {
  text-align: end;
}

.alignment-away {
  text-align: start;
}
```
```jsx
<div className={alignment === 'home' ? styles.alignmentHome : styles.alignmentAway}>
```

**Option B: CSS custom properties (for more complex cases)**
```scss
.item {
  padding-inline-start: var(--padding-start, 0);
  padding-inline-end: var(--padding-end, 0);
}
```
```jsx
<div 
  className={styles.item}
  style={{ 
    '--padding-start': alignment === 'home' ? '12px' : '0',
    '--padding-end': alignment === 'away' ? '12px' : '0' 
  }}
>
```

**Option C: Conditional class composition**
```jsx
import clsx from 'clsx';

<div className={clsx(styles.item, { [styles.isHome]: alignment === 'home' })}>
```

## Migration Checklist

1. [ ] Create `index.module.scss` file **in the same folder as the component** (not shared)
2. [ ] Add `@use '@scss/themeTokens' as theme;` at the top
3. [ ] Convert each style function to a CSS class
4. [ ] Update component imports: `import styles from './index.module.scss'`
5. [ ] Remove `/** @jsxImportSource @emotion/react */` pragma if present
6. [ ] Replace `css={styles.foo()}` with `className={styles.foo}`
7. [ ] Handle conditional/dynamic styles appropriately
8. [ ] Update tests for snapshot changes (class names will change)
9. [ ] Keep `.styles.tsx` file for reference until migration is verified
10. [ ] Test dark UI mode if applicable
11. [ ] Test RTL languages if component uses directional styles
12. [ ] Repeat for each subcomponent folder (each gets its own `index.module.scss`)

## Common Mistakes to Avoid

1. **Don't create one shared styles file for multiple components** - Each component folder should have its own `index.module.scss`
2. **Don't import individual SCSS files** - Use `@use '@scss/themeTokens' as theme;` which aggregates all tokens
3. **Don't forget SCSS interpolation** for variables: `#{theme.$spacings-double}` not `theme.$spacings-double`
4. **Don't use camelCase in SCSS property names**: `background-color` not `backgroundColor`
5. **Don't forget to kebab-case font size names**: `long-primer` not `longPrimer`
6. **Don't mix `css` prop and `className`** in the same element
7. **Don't forget `:global()` wrapper** for global class selectors like `[data-is-dark-ui='true']`
8. **Don't use `content: ""` in SCSS** - use `content: ''` (single quotes)
9. **Don't forget the `&` parent selector** when nesting dark UI overrides

## SCSS Module Path Alias

The project uses `@scss/` as an alias to the ThemeProviderSCSSModules directory. This is configured in the build system.

```scss
// RECOMMENDED: Use themeTokens which aggregates all tokens
@use '@scss/themeTokens' as theme;

// NOT RECOMMENDED: Individual imports (use only when you need specific utilities)
// @use '@scss/px-to-rem' as *;
```

