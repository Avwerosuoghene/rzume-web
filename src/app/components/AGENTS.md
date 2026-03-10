# Component Development Guidelines

When working with components in this directory:

## Component Architecture
- All components must be **standalone** (no NgModules)
- Use `ChangeDetectionStrategy.OnPush` for all components
- Components in this directory are **presentation/dumb components**
- They should receive data via `@Input` and emit events via `@Output`
- Avoid direct service dependencies (use dependency injection sparingly)

## File Structure
Each component folder should contain:
- `component-name.component.ts` - Component logic
- `component-name.component.html` - Template
- `component-name.component.scss` - Styles
- `component-name.component.spec.ts` - Unit tests

## Component Pattern
```typescript
@Component({
  selector: 'app-component-name',
  standalone: true,
  imports: [CommonModule, AngularMaterialModules],
  templateUrl: './component-name.component.html',
  styleUrl: './component-name.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComponentNameComponent {
  @Input({ required: true }) data!: DataType;
  @Output() action = new EventEmitter<ActionType>();
}
```

## Reusability Guidelines
- Keep components generic and configurable
- Use configuration objects for complex inputs
- Implement `ControlValueAccessor` for form components
- Export components through `index.ts` barrel file

## Styling
- Use component-scoped SCSS
- Follow mobile-first responsive design
- Use theme variables from `src/app/styles/variables.scss`
- Apply typography mixins from `src/app/styles/fonts.scss`

## Testing
- Write unit tests for all components
- Test input/output behavior
- Mock Angular Material components
- Test responsive behavior when applicable
