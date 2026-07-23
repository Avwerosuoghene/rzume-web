---
name: material-ui
description: >-
  Select and wire up Angular Material components in rzume_web. Use when adding a
  component that needs a Material module not yet imported anywhere, deciding which
  Material component fits a UI need, or touching the app's Material theme. Use for
  which-component/module decisions — for how a component consuming Material should be
  declared use /angular-patterns, for accessibility/contrast requirements use
  /web-design-guidelines.
argument-hint: "[describe the UI element or Material module question]"
---

# Material UI — rzume_web

This app uses Angular Material 18 with the **prebuilt `azure-blue` theme**
(`@angular/material/prebuilt-themes/azure-blue.css`, wired in `angular.json`) — there is no custom
Sass theming pipeline or design-token layer. Don't introduce one without checking with the user;
that's a bigger architectural change than a normal component task.

## Adding a Material module

All Material modules used anywhere in the app are re-exported from one place:
`src/app/core/modules/material-modules.ts`. Currently included: `MatFormFieldModule`,
`MatInputModule`, `MatIconModule`, `MatDialogModule`, `MatButtonModule`, `MatCheckboxModule`,
`MatMenuModule`, `MatProgressBarModule`, `MatDatepickerModule`, `MatSelectModule`.

If the Material component you need isn't in that list:

1. Import the module in `material-modules.ts`
2. Add it to the `AngularMaterialModules` array
3. Components already importing `AngularMaterialModules` (see `/angular-patterns`) pick it up
   automatically — no per-component import needed once it's in the barrel

```ts
// material-modules.ts
import { MatTooltipModule } from '@angular/material/tooltip';
// ...
export const AngularMaterialModules: readonly any[] = [
  MatFormFieldModule, MatInputModule, /* ... */, MatTooltipModule
];
```

Note: this barrel is typed `readonly any[]`, which is a **pre-existing exception** to the project's
`no-explicit-any` ESLint rule (see `/typescript-standards`) — it predates this skill and isn't
something to "fix" incidentally while doing unrelated work, but don't copy the `any` typing into
new code elsewhere.

## Picking a component

There's no internal design-system CLI here (unlike a company-maintained component library) — go
straight to the [Angular Material docs](https://material.angular.dev) for the component's API,
then confirm the module isn't already covered by an existing entry in `AngularMaterialModules`
before adding a new import.

Common existing usages in this repo to match style with:
- Forms: `MatFormFieldModule` + `MatInputModule` for text fields, `MatSelectModule` for dropdowns,
  `MatCheckboxModule` for booleans, `MatDatepickerModule` for dates
- Dialogs: `MatDialogModule` — see `confirm-delete-modal`, `info-dialog`, `policy-dialog`,
  `feedback-dialog` for existing dialog component shape to follow
- Menus: `MatMenuModule`
- Loading/progress: `MatProgressBarModule`, plus the app's own `global-circular-loader` component
  for full-view loading states — check that before reaching for a raw Material spinner

## What this skill does NOT cover

- **How the component class/decorator around the Material usage should be structured** →
  `/angular-patterns`
- **Contrast, touch targets, keyboard operability** → `/web-design-guidelines`
