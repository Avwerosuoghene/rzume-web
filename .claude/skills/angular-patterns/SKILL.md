---
name: angular-patterns
description: >-
  Shape Angular components in rzume_web — standalone component declaration, change
  detection strategy, Material module imports, folder/barrel structure, and when to
  split a component. Use when deciding how to declare a component, whether it needs
  OnPush, how to bring in Angular Material modules, or where a new component's files
  should live. Use for component shape decisions — for RxJS/state decisions use
  /rxjs-state-patterns, for which Material component to use use /material-ui, for
  TypeScript naming/typing use /typescript-standards.
argument-hint: "[component name or describe the shape question]"
---

# Angular Patterns — component shape for rzume_web

Use this for **how a component should be structured**, not what it renders or how state flows through it.

## Component declaration

Every component is standalone. Declare `standalone: true` explicitly even though it's the
Angular 18 default — every existing component in this repo does this, so match it:

```ts
@Component({
  selector: 'app-job-list-toolbar',
  standalone: true,
  imports: [AngularMaterialModules, CustomSearchInputComponent, FilterDropdownComponent],
  templateUrl: './job-list-toolbar.component.html',
  styleUrl: './job-list-toolbar.component.scss'
})
export class JobListToolbarComponent { ... }
```

Class name: `<Name>Component`. File name: kebab-case with `.component.ts` suffix. Template/style
files are separate (`templateUrl`/`styleUrl`), not inline — no `template:`/`styles:` in this repo.

## Importing Angular Material

Never import individual `Mat*Module`s directly into a component. Use the grouped barrels in
`core/modules/`:

```ts
import { AngularMaterialModules } from '../../core/modules';

@Component({
  imports: [AngularMaterialModules, /* other standalone components */],
  ...
})
```

`imports: [...]` accepts nested arrays (Angular flattens them), which is what makes
`AngularMaterialModules` — itself an array of `Mat*Module`s — work as a single entry. See
`/material-ui` for how to add a new Material module to that barrel when one isn't in it yet.

## Change detection: `OnPush` is selective, not universal

Only ~16% of components in this repo use `ChangeDetectionStrategy.OnPush` today. It shows up on:
- **Route/page-level components** — `dashboard`, `jobs`, `roles`, `header`, `main`
- **Heavier reusable components** — `job-card-list`, `custom-table`, `feedback-dialog`,
  `feedback-button`, `policy-dialog`

Simpler presentational components (toolbars, stat displays that just emit `@Output()` events)
generally don't have it. When creating a new component, add `OnPush` if it's a route/page
component or something rendering a non-trivial list/table — otherwise it's fine to omit, matching
the existing majority. Don't add it reflexively to every new component; that's not what this
codebase actually does.

## `@Input()` / `@Output()`

Plain `@Input()` / `@Output()` decorators (this repo predates or doesn't use the newer
`input()`/`output()` function-based APIs — don't introduce them without checking with the user
first, since it would be a new pattern for the codebase, not a continuation of an existing one):

```ts
@Input() statHighLights: Array<StatHighlight & { displayValue?: number }> = [];
@Output() filterChange = new EventEmitter<JobApplicationFilter>();
```

## Folder and barrel structure

```
components/
  job-list-toolbar/
    job-list-toolbar.component.ts
    job-list-toolbar.component.html
    job-list-toolbar.component.scss
  filter-dropdown/
    filter-dropdown.component.ts
    index.ts          ← barrel, re-exports the component
```

Most components that are consumed from outside their own folder have an `index.ts` barrel
(`export * from './x.component'`) — check the sibling folder for one before importing via a deep
relative path. Not every component has one (e.g. `job-list-toolbar` doesn't), so this isn't an
absolute rule — but prefer adding one for any component another feature will need to import.

`src/app/shared/components/` exists but is currently empty — it's reserved for components meant
to be shared across features, not yet populated. Don't assume anything lives there.

## When to split a component

Split when:
- The component mixes multiple independent concerns (e.g. a dialog with its own form validation
  logic that could stand alone)
- A sub-tree has its own state/lifecycle worth isolating
- A piece is reused in more than one place

There's no repo-wide line-count rule observed — use judgment, and prefer extracting a service
(see `/rxjs-state-patterns`) over a new sub-component when what's actually growing is business
logic rather than markup.

## What this skill does NOT cover

- **State, subscriptions, `BehaviorSubject` services** → `/rxjs-state-patterns`
- **Which Material component/module to use** → `/material-ui`
- **TypeScript naming, strict-mode conventions, model organization** → `/typescript-standards`
- **Accessibility, breakpoints, dark/light mode** → `/web-design-guidelines`
