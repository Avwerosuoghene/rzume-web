---
name: Article Generator - Technical Content Creation from Git Commits
description: Analyzes git commits and project implementations to generate technical articles matching the project's writing style, with online research capabilities for accuracy
tags: [documentation, articles, content, git, research, technical-writing]
---

# Article Generator Skill

This skill analyzes code changes from git commits, suggests relevant article topics, and generates comprehensive technical articles that match your established writing style. It includes online research capabilities to ensure technical accuracy and validity.

## Overview

The Article Generator skill operates in three modes:
- **Commit Analysis**: Analyzes git commits to identify article-worthy implementations
- **Topic Suggestion**: Proposes article topics based on code changes
- **Article Generation**: Creates full technical articles with research-backed content
- **Style Matching**: Maintains consistency with existing article writing style

## Writing Philosophy

### Educational First
- Teach concepts clearly and progressively
- Use real-world examples from the project
- Break down complex topics into digestible sections
- Provide practical, actionable knowledge

### Conversational Tone
- Friendly and approachable language
- Engage readers with relatable scenarios
- Use analogies and metaphors for complex concepts
- Encourage learning with positive reinforcement

### Technical Accuracy
- Research topics thoroughly before writing
- Verify code examples and best practices
- Include references to official documentation
- Fact-check all technical claims

### Practical Focus
- Step-by-step tutorials
- Working code examples
- "Bad" vs "Good" pattern comparisons
- Real implementation from the project

## Workflow Phases

### Phase 1: Commit Analysis

#### 1.1 Analyze Git Changes
**Objective**: Identify significant implementations from commits

**Git Commands to Execute**:
```bash
# Get commit details
git log -1 <commit-hash> --stat

# Get detailed diff
git show <commit-hash>

# Get commit message and metadata
git log -1 <commit-hash> --pretty=format:"%h - %an, %ar : %s%n%b"

# Get list of changed files
git diff-tree --no-commit-id --name-only -r <commit-hash>

# Get file changes with context
git show <commit-hash> --unified=10
```

**Information to Extract**:
- [ ] What was implemented (feature, pattern, optimization)
- [ ] Technologies/frameworks used
- [ ] Problem being solved
- [ ] Implementation approach
- [ ] Files modified (components, services, configs)
- [ ] Patterns applied (architectural, design patterns)
- [ ] Best practices demonstrated
- [ ] Complexity level (beginner, intermediate, advanced)

**Deliverable**: Commit analysis report

#### 1.2 Categorize Implementation Type
**Objective**: Classify the type of implementation for article focus

**Implementation Categories**:
- **Architecture Patterns**: State management, service layers, component architecture
- **Angular Features**: Standalone components, signals, control flow, dependency injection
- **Performance Optimizations**: OnPush detection, lazy loading, bundle optimization
- **Testing Strategies**: Unit tests, E2E tests, integration tests
- **Security Implementations**: Authentication, authorization, XSS prevention
- **UI/UX Patterns**: Responsive design, accessibility, animations
- **DevOps/Deployment**: Docker, CI/CD, cloud deployment
- **Third-Party Integrations**: APIs, libraries, external services
- **Code Quality**: Refactoring, clean code, design patterns
- **Developer Tools**: Build optimization, debugging, tooling

**Deliverable**: Implementation category and scope

#### 1.3 Assess Article Potential
**Objective**: Determine if the implementation warrants an article

**Criteria for Article-Worthy Content**:
- ✅ Solves a common developer problem
- ✅ Demonstrates best practices or patterns
- ✅ Introduces new technology or approach
- ✅ Has educational value for the community
- ✅ Contains reusable knowledge
- ✅ Showcases interesting implementation details
- ✅ Addresses performance or security concerns
- ✅ Provides step-by-step learning opportunity

**Red Flags (Not Article-Worthy)**:
- ❌ Simple bug fixes without learning value
- ❌ Minor styling changes
- ❌ Configuration tweaks
- ❌ Routine maintenance tasks
- ❌ Project-specific business logic

**Deliverable**: Article potential assessment (Yes/No with reasoning)

### Phase 2: Topic Suggestion

#### 2.1 Generate Article Topics
**Objective**: Propose 3-5 article topic options

**Topic Template**:
```markdown
## Article Topic Suggestion #[N]

**Title**: [Catchy, descriptive title]

**Target Audience**: [Beginner/Intermediate/Advanced]

**Estimated Length**: [800-1500 / 1500-3000 / 3000+ words]

**Key Concepts Covered**:
- Concept 1
- Concept 2
- Concept 3

**Learning Outcomes**:
- What readers will learn
- Skills they'll gain
- Problems they can solve

**Unique Angle**:
What makes this article different or valuable

**Code Examples**:
- Example 1: [Description]
- Example 2: [Description]

**Research Topics**:
- Topic 1 to research
- Topic 2 to research
```

**Topic Naming Patterns** (from existing articles):
- "Understanding [Concept] in [Technology]"
- "Step-by-Step Guide: [Task]"
- "[Technology] [Feature/Pattern]"
- "Exploring [Concept]: [Comparison]"
- "[Task] on [Platform]"

**Deliverable**: 3-5 article topic suggestions

#### 2.2 User Selection
**Objective**: Get user approval on topic and scope

**Present to User**:
```markdown
# Article Topic Suggestions

Based on commit [hash]: [commit message]

I've identified [N] potential article topics:

1. **[Title 1]** (Target: [Audience], Length: [Words])
   - [Brief description]
   - Key concepts: [List]

2. **[Title 2]** (Target: [Audience], Length: [Words])
   - [Brief description]
   - Key concepts: [List]

[Continue for all suggestions]

**Recommendation**: I suggest Topic #[N] because [reasoning]

Would you like me to proceed with one of these topics? 
Or would you prefer a different angle?
```

**User Response Options**:
- Approve a suggested topic
- Request modifications to a topic
- Suggest a different angle
- Decline article generation

**Deliverable**: Approved article topic and scope

### Phase 3: Research & Preparation

#### 3.1 Online Research
**Objective**: Gather accurate, up-to-date information

**Research Areas**:
1. **Official Documentation**
   - Angular docs (angular.io)
   - TypeScript docs (typescriptlang.org)
   - RxJS docs (rxjs.dev)
   - Library-specific documentation

2. **Best Practices**
   - Angular style guide
   - Industry standards (OWASP, W3C)
   - Performance benchmarks
   - Security guidelines

3. **Current Trends**
   - Latest framework versions
   - Deprecated features
   - New APIs and features
   - Community recommendations

4. **Code Examples**
   - Official examples
   - Community patterns
   - Real-world implementations
   - Anti-patterns to avoid

**Research Process**:
```markdown
For each key concept:
1. Search official documentation
2. Verify current best practices
3. Find authoritative sources
4. Check for recent updates
5. Validate code examples
6. Note any caveats or gotchas
```

**Sources to Prioritize**:
- Official framework documentation
- MDN Web Docs
- GitHub repositories (official)
- Stack Overflow (verified answers)
- Tech blogs (Google, Microsoft, etc.)
- Conference talks and presentations

**Deliverable**: Research notes with sources

#### 3.2 Code Example Preparation
**Objective**: Create working, tested code examples

**Example Types**:
1. **Before/After Comparisons**
   ```typescript
   // ❌ BAD: [Why it's bad]
   [problematic code]
   
   // ✅ GOOD: [Why it's good]
   [improved code]
   ```

2. **Step-by-Step Implementations**
   ```typescript
   // Step 1: [Description]
   [code]
   
   // Step 2: [Description]
   [code]
   ```

3. **Complete Working Examples**
   ```typescript
   // Full implementation
   [complete code with context]
   ```

4. **Real Project Examples**
   - Extract from actual commit
   - Simplify for clarity
   - Add explanatory comments
   - Ensure it's runnable

**Code Example Checklist**:
- [ ] Code is syntactically correct
- [ ] Follows project coding standards
- [ ] Includes necessary imports
- [ ] Has explanatory comments
- [ ] Demonstrates the concept clearly
- [ ] Shows both right and wrong approaches
- [ ] Is properly formatted
- [ ] Uses realistic variable names

**Deliverable**: Prepared code examples

#### 3.3 Outline Creation
**Objective**: Structure the article logically

**Article Structure Template**:
```markdown
# [Article Title]

## Tags
#tag1 #tag2 #tag3 #tag4

## Introduction (100-200 words)
- Hook: Engaging opening
- Problem statement
- What readers will learn
- Why it matters

## [Section 1: Concept Overview] (200-400 words)
- Define the concept
- Explain the context
- Why it's important
- Common use cases

## [Section 2: Understanding the Basics] (300-500 words)
- Core principles
- Key terminology
- How it works
- Simple examples

## [Section 3: Implementation] (400-800 words)
- Step-by-step guide
- Code examples
- Best practices
- Common pitfalls

## [Section 4: Advanced Topics] (Optional, 300-500 words)
- Advanced patterns
- Optimization techniques
- Edge cases
- Real-world scenarios

## [Section 5: Practical Example] (300-600 words)
- Complete working example
- Explanation of each part
- How to use it
- Expected results

## Conclusion (100-150 words)
- Recap key points
- Encourage practice
- Next steps
- Positive closing

## References (Optional)
- Official documentation links
- Additional resources
```

**Deliverable**: Detailed article outline

### Phase 4: Article Generation

#### 4.1 Write Introduction
**Objective**: Hook readers and set expectations

**Introduction Formula**:
1. **Hook** (1-2 sentences)
   - Relatable scenario or question
   - Engaging statement about the topic
   
2. **Problem Statement** (2-3 sentences)
   - What challenge developers face
   - Why it's important to solve
   
3. **Article Promise** (2-3 sentences)
   - What readers will learn
   - What they'll be able to do after
   
4. **Transition** (1 sentence)
   - Lead into first section

**Style Examples from Existing Articles**:
```markdown
"Picture this: you're creating a really cool app, and everything 
looks great and works smoothly. However, unexpectedly, bugs start 
appearing like uninvited guests at a party."

"Closures might seem puzzling at first, but they're actually a 
powerful tool in JavaScript. Think of them as hidden treasures 
that help make JavaScript work its magic."

"Dealing with data in different formats is a routine task when 
working with C#. JSON (JavaScript Object Notation) is a widely 
used format for sharing data."
```

**Deliverable**: Engaging introduction

#### 4.2 Write Main Content
**Objective**: Deliver educational content clearly

**Writing Guidelines**:

**Tone & Voice**:
- Conversational and friendly
- Use "you" and "we" pronouns
- Avoid overly formal language
- Encourage and support the reader
- Use analogies and metaphors

**Sentence Structure**:
- Mix short and medium sentences
- Avoid overly complex sentences
- Use active voice
- Break up long paragraphs

**Explanations**:
- Start simple, build complexity
- Define technical terms
- Use examples immediately after concepts
- Relate to familiar concepts

**Code Presentation**:
```markdown
Let's take a look at an example. Consider this TypeScript code snippet:

[code block]

In this example, [explain what's happening]. The [key concept] 
allows us to [benefit]. Notice how [important detail].
```

**Transitions Between Sections**:
- "Now that we understand [X], let's explore [Y]"
- "Moving on to [topic]..."
- "With this foundation, we can now [next step]"
- "Let's see how this works in practice"

**Common Phrases** (from existing articles):
- "Let's dive into..."
- "Here's how to..."
- "It's time to..."
- "Now, let's..."
- "Picture this..."
- "Think of it as..."
- "In simple terms..."
- "The key thing to remember..."

**Deliverable**: Main article content

#### 4.3 Add Code Examples
**Objective**: Illustrate concepts with working code

**Code Block Format**:
```markdown
[Brief setup or context]

```typescript
// Code with inline comments
[code implementation]
```

[Explanation of what the code does]
[Why this approach is good/bad]
[Key points to notice]
```

**Before/After Pattern**:
```markdown
**Current Approach (Problematic)**:
```typescript
// ❌ BAD: [Reason]
[problematic code]
```

**Improved Approach**:
```typescript
// ✅ GOOD: [Reason]
[better code]
```

This improved version [explain benefits].
```

**Step-by-Step Pattern**:
```markdown
**Step 1: [Action]**

[Explanation]

```typescript
[code for step 1]
```

**Step 2: [Action]**

[Explanation]

```typescript
[code for step 2]
```
```

**Deliverable**: Article with integrated code examples

#### 4.4 Write Conclusion
**Objective**: Reinforce learning and encourage action

**Conclusion Formula**:
1. **Recap** (2-3 sentences)
   - Summarize key concepts covered
   - Highlight main takeaways
   
2. **Encouragement** (1-2 sentences)
   - Positive reinforcement
   - Acknowledge learning journey
   
3. **Next Steps** (1-2 sentences)
   - What to practice
   - Where to go next
   
4. **Closing** (1 sentence)
   - Uplifting final thought

**Style Examples**:
```markdown
"Hooray, you're a bug-busting champion! Your tests have triumphed, 
and success is on your side. Great job!"

"In the world of coding, closures are like tiny allies that enhance 
the adaptability and efficiency of your functions."

"As you continue to grow your expertise in asynchronous programming, 
you'll gain a deeper appreciation for how Promises and Observables 
contribute to creating powerful and seamless user experiences."
```

**Deliverable**: Compelling conclusion

#### 4.5 Add Tags and Metadata
**Objective**: Categorize and optimize discoverability

**Tag Format** (from existing articles):
```markdown
# [Article Title]
#
tag1
#
tag2
#
tag3
#
tag4
```

**Tag Categories**:
- **Technology**: #angular, #typescript, #javascript, #rxjs
- **Topic**: #webdev, #programming, #tutorial, #learning
- **Skill Level**: #beginners, #intermediate, #advanced
- **Content Type**: #tutorial, #guide, #tips, #bestpractices

**Tag Selection Rules**:
- Use 3-5 tags
- Include primary technology
- Include "webdev" or "programming"
- Include content type
- Include skill level if appropriate

**Deliverable**: Tagged article

### Phase 5: Quality Assurance

#### 5.1 Technical Accuracy Review
**Objective**: Verify all technical content is correct

**Verification Checklist**:
- [ ] All code examples are syntactically correct
- [ ] TypeScript types are accurate
- [ ] Angular patterns follow v18 standards
- [ ] Best practices are current (not outdated)
- [ ] No deprecated APIs or features
- [ ] Framework versions are correct
- [ ] External links work
- [ ] Code examples are tested (if possible)

**Research Verification**:
- Cross-reference with official docs
- Check publication dates of sources
- Verify claims with multiple sources
- Update any outdated information

**Deliverable**: Accuracy verification report

#### 5.2 Style Consistency Check
**Objective**: Ensure article matches existing writing style

**Style Checklist**:
- [ ] Conversational and friendly tone
- [ ] Uses analogies and metaphors
- [ ] Has engaging introduction
- [ ] Includes step-by-step explanations
- [ ] Uses "Bad" vs "Good" code comparisons
- [ ] Has encouraging conclusion
- [ ] Proper tag format
- [ ] Consistent heading structure
- [ ] Appropriate use of emojis (minimal)
- [ ] Clear code explanations

**Compare Against**:
- `@/articles/jasmine_unit_testing.md`
- `@/articles/rxjs_reactive_programming.md`
- `@/articles/understanding_closures.md`

**Deliverable**: Style consistency report

#### 5.3 Readability Review
**Objective**: Ensure article is easy to read and understand

**Readability Metrics**:
- Sentence length: 15-25 words average
- Paragraph length: 3-5 sentences
- Heading frequency: Every 200-400 words
- Code example frequency: Every 300-500 words
- Technical jargon: Defined on first use

**Readability Checklist**:
- [ ] Clear section headings
- [ ] Logical flow between sections
- [ ] Smooth transitions
- [ ] No overly complex sentences
- [ ] Technical terms explained
- [ ] Examples support concepts
- [ ] Conclusion summarizes well

**Deliverable**: Readability assessment

#### 5.4 Final Polish
**Objective**: Perfect the article before delivery

**Polish Tasks**:
1. **Grammar & Spelling**
   - Run spell check
   - Check grammar
   - Fix typos
   
2. **Formatting**
   - Consistent code block formatting
   - Proper markdown syntax
   - Correct heading hierarchy
   - Proper list formatting
   
3. **Links & References**
   - Verify all links work
   - Add missing references
   - Format links consistently
   
4. **Code Formatting**
   - Consistent indentation
   - Proper syntax highlighting
   - Clear comments
   - Realistic examples

**Deliverable**: Polished, publication-ready article

### Phase 6: Delivery

#### 6.1 Generate Article File
**Objective**: Create the article markdown file

**File Naming Convention**:
- Use snake_case
- Descriptive name
- Technology prefix if applicable
- Examples:
  - `angular_standalone_components.md`
  - `rxjs_state_management.md`
  - `implementing_onpush_detection.md`

**File Location**:
```
/articles/[article-name].md
```

**Deliverable**: Article markdown file

#### 6.2 Create Article Summary
**Objective**: Provide overview for user review

**Summary Template**:
```markdown
# Article Generation Complete

## Article Details
- **Title**: [Article Title]
- **File**: `/articles/[filename].md`
- **Target Audience**: [Beginner/Intermediate/Advanced]
- **Word Count**: [Approximate count]
- **Tags**: [List of tags]

## Content Overview
### Sections Covered:
1. [Section 1 name] - [Brief description]
2. [Section 2 name] - [Brief description]
3. [Section 3 name] - [Brief description]

### Key Concepts:
- [Concept 1]
- [Concept 2]
- [Concept 3]

### Code Examples:
- [Number] code examples
- [Number] before/after comparisons
- [Number] step-by-step implementations

## Research Sources:
- [Source 1]
- [Source 2]
- [Source 3]

## Next Steps:
1. Review the article at `/articles/[filename].md`
2. Make any desired edits
3. Publish to your preferred platform
4. Share with the community!

## Suggested Improvements (Optional):
- [Suggestion 1]
- [Suggestion 2]
```

**Deliverable**: Article summary

## Integration with Project

### Reference Project Standards
- `@/.windsurf/rules/angular-core-standards.md`: Angular patterns
- `@/.windsurf/rules/code-quality.md`: Code standards
- `@/AGENTS.md`: Project architecture

### Analyze Existing Articles
```bash
# Read existing articles for style reference
ls articles/
cat articles/jasmine_unit_testing.md
cat articles/rxjs_reactive_programming.md
```

### Use Git for Commit Analysis
```bash
# Analyze specific commit
git show <commit-hash>

# Get recent commits
git log --oneline -10

# Get commits by author
git log --author="<name>" --oneline

# Get commits in date range
git log --since="2 weeks ago" --oneline
```

### Research Online
Use `search_web` and `read_url_content` tools to:
- Verify technical accuracy
- Find official documentation
- Check best practices
- Validate code examples
- Research new topics

## Usage Examples

### Example 1: Generate Article from Commit

**User Request**:
```
Generate an article based on commit abc123
```

**Agent Process**:
1. Analyze commit abc123
2. Identify: "Implemented OnPush change detection across components"
3. Suggest topics:
   - "Mastering OnPush Change Detection in Angular"
   - "Performance Optimization with OnPush Strategy"
   - "Understanding Angular Change Detection Strategies"
4. User selects topic #1
5. Research OnPush best practices
6. Generate article with examples from the commit
7. Deliver polished article

### Example 2: Suggest Articles from Recent Work

**User Request**:
```
Analyze the last 5 commits and suggest article topics
```

**Agent Process**:
1. Analyze last 5 commits
2. Identify patterns:
   - RxJS state management implementation
   - Responsive design patterns
   - Testing strategy improvements
3. Suggest 3-5 article topics
4. Wait for user selection

### Example 3: Generate Article with Research

**User Request**:
```
Write an article about the SearchStateService implementation, 
research RxJS best practices
```

**Agent Process**:
1. Analyze SearchStateService code
2. Research RxJS BehaviorSubject patterns online
3. Find official RxJS documentation
4. Gather best practices from Angular docs
5. Create article with researched content
6. Include verified code examples
7. Add references to sources

## Article Templates

### Tutorial Article Template
```markdown
# [How to Do Something in Technology]
#
technology
#
webdev
#
tutorial
#
learning

[Engaging introduction with problem statement]

## Understanding [Concept]
[Explain the concept clearly]

## Prerequisites
- Requirement 1
- Requirement 2

## Step 1: [First Step]
[Explanation]

```typescript
[code]
```

## Step 2: [Second Step]
[Explanation]

```typescript
[code]
```

## Step 3: [Third Step]
[Explanation]

```typescript
[code]
```

## Putting It All Together
[Complete example]

```typescript
[full code]
```

## Conclusion
[Recap and encouragement]
```

### Concept Explanation Template
```markdown
# Understanding [Concept] in [Technology]
#
technology
#
programming
#
learning

[Hook readers with relatable scenario]

## What is [Concept]?
[Simple explanation with analogy]

## How [Concept] Works
[Technical explanation]

```typescript
[example]
```

## Use Cases of [Concept]
### Use Case 1: [Name]
[Explanation]

```typescript
[example]
```

### Use Case 2: [Name]
[Explanation]

```typescript
[example]
```

## Best Practices
- Practice 1
- Practice 2

## Common Pitfalls
[What to avoid]

## Conclusion
[Wrap up with encouragement]
```

### Comparison Article Template
```markdown
# [Technology A] vs [Technology B]: [Context]
#
technology
#
webdev
#
comparison

[Introduction explaining the comparison]

## Understanding [Technology A]
[Explanation]

```typescript
[example]
```

## Understanding [Technology B]
[Explanation]

```typescript
[example]
```

## Key Differences
| Feature | Technology A | Technology B |
|---------|-------------|--------------|
| [Feature 1] | [Detail] | [Detail] |
| [Feature 2] | [Detail] | [Detail] |

## When to Use [Technology A]
- Scenario 1
- Scenario 2

## When to Use [Technology B]
- Scenario 1
- Scenario 2

## Choosing the Right Tool
[Guidance on selection]

## Conclusion
[Summary and recommendation]
```

## Best Practices

### Research
- ✅ Always verify with official documentation
- ✅ Check multiple authoritative sources
- ✅ Ensure information is current
- ✅ Test code examples when possible
- ✅ Cite sources for complex topics

### Writing
- ✅ Start with a hook
- ✅ Use conversational tone
- ✅ Explain before showing code
- ✅ Use analogies for complex concepts
- ✅ Include practical examples
- ✅ End with encouragement

### Code Examples
- ✅ Show both bad and good approaches
- ✅ Add explanatory comments
- ✅ Use realistic variable names
- ✅ Include necessary imports
- ✅ Keep examples focused
- ✅ Test for syntax errors

### Quality
- ✅ Proofread thoroughly
- ✅ Check all links
- ✅ Verify code examples
- ✅ Match existing style
- ✅ Ensure technical accuracy

## Checklist

### Pre-Generation
- [ ] Commit analyzed
- [ ] Implementation type identified
- [ ] Article potential assessed
- [ ] Topic suggested and approved
- [ ] Research completed
- [ ] Outline created

### Generation
- [ ] Introduction written
- [ ] Main content written
- [ ] Code examples added
- [ ] Conclusion written
- [ ] Tags added

### Quality Assurance
- [ ] Technical accuracy verified
- [ ] Style consistency checked
- [ ] Readability reviewed
- [ ] Final polish completed
- [ ] File created
- [ ] Summary provided

---

**This skill ensures high-quality, technically accurate, and engaging technical articles that match your established writing style and provide real value to the developer community.**
