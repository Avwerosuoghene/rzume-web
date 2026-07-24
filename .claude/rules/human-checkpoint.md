# Human Checkpoint

Any skill in the feature-implementation chain (`architect`, `figma-feature-plan`, `write-tests`,
`implement`, `quality-gate`, `code-review`) MUST stop and ask the user directly — via a real
question, not a guess, not a silent default, not picking "the most likely" option — when it hits
one of these:

- **`architect`**: the solution-options comparison has no clear winner, or two+ options tie on
  risk/effort with no obvious tiebreaker from existing codebase conventions
- **`figma-feature-plan`**: a Figma element (component, token, icon) has no existing Angular
  Material component or app convention to map to — this is a Gap, not a guess
- **`write-tests`**: the acceptance criteria in the feature spec are ambiguous enough that two
  different tests could reasonably be written for the same criterion
- **`implement`**: a failing test can only be made to pass by violating a Tier 1 convention
  (`/angular-patterns`, `/rxjs-state-patterns`, `/material-ui`, `/typescript-standards`,
  `/web-design-guidelines`) — don't silently break the convention, and don't silently rewrite the
  test to dodge the conflict either
- **`quality-gate`**: a BLOCKER finding survives a second revision attempt
- **Any skill**: before a destructive or irreversible action — overwriting an existing vault note
  or repo file that already has content, force-push, deleting a branch, running a release/publish
  command, or a dependency change that requires a full clean reinstall (see the `ajv`/`uuid`
  override incident in `/linting-standards` for why this last one matters here specifically)

## How to ask

Prefer a direct, specific question over a vague "should I proceed?" — state the fork in the road
and the options, the same way `architect`'s own options doc does. If the environment supports a
structured question tool, use it; otherwise ask in plain text and wait.

## What this is not

This is not a blanket "ask before every action" rule — it would make the pipeline useless if every
step needed sign-off. It fires only at the specific conditions listed above, where a wrong silent
guess is expensive to unwind (wrong architecture, wrong component mapping, a broken convention
baked into merged code) rather than places where a reasonable default is genuinely fine.
