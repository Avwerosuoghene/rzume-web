---
name: Create Angular Component
description: Generate a new Angular component with all necessary files and tests
tags: [angular, component, generation]
---

# Create Angular Component Skill

This skill generates a complete Angular component following project standards.

## Steps

1. **Determine Component Type**
   - Ask: Is this a page component (smart/container) or presentation component (dumb)?
   - Page components go in `src/app/pages/`
   - Presentation components go in `src/app/components/`

2. **Create Component Files**
   - Generate component TypeScript file with:
     - Standalone component decorator
     - OnPush change detection strategy
     - Proper imports
     - Input/Output decorators if needed
     - OnDestroy implementation with cleanup
   
3. **Create Template File**
   - Use modern control flow (`@if`, `@for`, `@switch`)
   - Add semantic HTML structure
   - Include accessibility attributes
   - Add data-testid attributes for testing

4. **Create Styles File**
   - Use component-scoped SCSS
   - Import theme variables
   - Follow mobile-first responsive design
   - Use `:host` for component-level styles

5. **Create Test File**
   - Set up TestBed configuration
   - Mock all service dependencies
   - Test component creation
   - Test inputs/outputs
   - Test user interactions
   - Test error states

6. **Update Barrel Exports**
   - Add component to appropriate `index.ts` file
   - Ensure proper export structure

## Template

### Component TypeScript
```typescript
import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-component-name',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './component-name.component.html',
  styleUrl: './component-name.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComponentNameComponent implements OnDestroy {
  private destroy$ = new Subject<void>();
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### Component Template
```html
<div class="component-container">
  @if (isLoading) {
    <app-loader />
  } @else {
    <div class="content">
      <!-- Component content -->
    </div>
  }
</div>
```

### Component Styles
```scss
@import 'src/app/styles/variables';
@import 'src/app/styles/fonts';

:host {
  display: block;
  padding: $spacing-md;
}

.component-container {
  // Component styles
}
```

### Component Test
```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentNameComponent } from './component-name.component';

describe('ComponentNameComponent', () => {
  let component: ComponentNameComponent;
  let fixture: ComponentFixture<ComponentNameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentNameComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentNameComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

## Checklist

- [ ] Component uses standalone architecture
- [ ] OnPush change detection enabled
- [ ] Proper OnDestroy implementation
- [ ] Modern control flow in template
- [ ] Mobile-first responsive styles
- [ ] Unit tests created
- [ ] Exported in index.ts
- [ ] Follows naming conventions

## Quality Gate Checkpoint

Before finalizing component, request quality gate review:

```
@quality-gate Please review my component implementation

**Component**: [ComponentName]
**Type**: [Page/Presentation]
**Location**: [File path]

**Features Implemented:**
- [Feature 1]
- [Feature 2]

**Testing:**
- Unit tests: [coverage %]
- Test scenarios: [list]

**Concerns:**
- [Any concerns or questions]
```

**Next Steps:**
- Address quality gate feedback
- Get approval before integration
