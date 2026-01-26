---
project_name: 'GreenPrj'
user_name: 'Kevin'
date: '2026-01-26'
sections_completed: ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'quality_rules', 'workflow_rules', 'anti_patterns']
status: 'complete'
rule_count: 50+
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

### Android Platform

- **Language**: Kotlin
- **Database**: Room 2.8.4 (latest stable, Nov 2025)
- **Dependency Injection**: Hilt (Dagger for Android)
- **Architecture**: Clean Architecture + MVVM
- **UI Framework**: Material Design Components
- **Async**: Kotlin Coroutines + Flow
- **Build Tool**: Gradle

### Web Platform

- **Language**: TypeScript + React
- **Build Tool**: Vite
- **UI Framework**: Material UI (MUI)
- **State Management**: Zustand
- **Database**: IndexedDB 3.0 + idb library
- **Routing**: React Router DOM

### Security & Encryption

- **Data Encryption**: AES-256-GCM
- **Password Hashing**: bcrypt (cost factor 12)
- **Key Derivation**: PBKDF2 with SHA-256 (100,000+ iterations)

### Smart Recognition Services

- **OCR**: PaddleOCR (Android) / Tesseract.js (Web)
- **Speech Recognition**: VOSK (Android) / Vosk-Browser (Web)
- **SMS Parsing**: Custom implementation

### Critical Version Constraints

- **Room**: Must use 2.8.4 or compatible version
- **IndexedDB**: Use idb library for Promise-based API
- **bcrypt**: Cost factor must be 12 (Android: bcrypt-kotlin, Web: bcryptjs)
- **PBKDF2**: Minimum 100,000 iterations for key derivation

## Critical Implementation Rules

### Language-Specific Rules

#### Kotlin (Android)

**Configuration Requirements:**
- Use Kotlin Coroutines for all async operations
- Use Flow for reactive data streams
- Prefer `suspend` functions over callbacks
- Use `data class` for entities and models

**Import/Export Patterns:**
- Use explicit imports, avoid wildcard imports
- Group imports: stdlib, Android, third-party, project

**Error Handling Patterns:**
- Use sealed classes for error types: `sealed class AppError`
- Use `Result<T>` or `Flow<Result<T>>` for error handling
- Never throw exceptions in ViewModel, use Flow error handling

**Coroutines Best Practices:**
- Use `viewModelScope` in ViewModels
- Use `lifecycleScope` in Fragments/Activities
- Always use `Dispatchers.IO` for database operations
- Use `Dispatchers.Main` for UI updates

**Data Class Rules:**
- Always use `data class` for entities
- Use `copy()` for immutable updates
- Never mutate data class properties directly

#### TypeScript/JavaScript (Web)

**Configuration Requirements:**
- TypeScript strict mode enabled
- Use explicit return types for functions
- Prefer `interface` over `type` for object shapes
- Use `const` assertions for literal types

**Import/Export Patterns:**
- Use named exports, avoid default exports for components
- Group imports: React, third-party, Material UI, project
- Use absolute imports with path aliases if configured

**Error Handling Patterns:**
- Use `try-catch` for async operations
- Always handle Promise rejections
- Use error boundaries for React components
- Return error objects instead of throwing

**Async/Await Patterns:**
- Always use `async/await` over Promise chains
- Use `Promise.all()` for parallel operations
- Handle errors with try-catch in async functions

**Type Safety Rules:**
- Never use `any` type, use `unknown` if type is truly unknown
- Use type guards for runtime type checking
- Define interfaces for all data models
- Use union types for discriminated unions

### Framework-Specific Rules

#### React (Web)

**Hooks Usage:**
- Use custom hooks for business logic (`useAccounting`, `useStatistics`)
- Keep hooks focused on single responsibility
- Use `useMemo` and `useCallback` for performance optimization
- Never call hooks conditionally

**Component Structure:**
- Functional components only, no class components
- Use TypeScript interfaces for props
- Extract complex logic to custom hooks
- Keep components small and focused

**State Management:**
- Use Zustand for global state
- Use `useState` for local component state
- Use `immer` with Zustand for immutable updates
- Never mutate state directly

**Performance Rules:**
- Use `React.memo` for expensive components
- Use `useMemo` for expensive calculations
- Use `useCallback` for event handlers passed to children
- Lazy load routes with `React.lazy()`

#### Android (MVVM + Clean Architecture)

**ViewModel Rules:**
- ViewModels must extend `ViewModel` or use `viewModel()`
- Use `StateFlow` or `Flow` for state exposure
- Never hold references to Views (Activities/Fragments)
- Use `LiveData` only if necessary for legacy code

**Repository Pattern:**
- Repositories must implement domain interfaces
- Use suspend functions for async operations
- Return `Flow` or `Result` types
- Handle errors in Repository layer

**Dependency Injection:**
- Use Hilt for all dependency injection
- Annotate with `@HiltViewModel`, `@Inject`, etc.
- Provide dependencies through modules
- Never use manual dependency injection

**Navigation:**
- Use Navigation Components for navigation
- Pass data through Safe Args
- Never pass Activities/Fragments as parameters

### Testing Rules

**Test Organization:**
- Co-locate test files with source files
- Android: `AccountEntryTest.kt` next to `AccountEntry.kt`
- Web: `account-entry.test.tsx` next to `account-entry.tsx`

**Test Structure:**
- Use descriptive test names: `test("should encrypt data when saving")`
- Follow Arrange-Act-Assert pattern
- Mock external dependencies (database, services)
- Test error cases, not just happy paths

**Mock Usage:**
- Android: Use MockK for mocking
- Web: Use Vitest/Jest mocks
- Mock at the boundary (Repository, Service)
- Don't mock data classes or simple utilities

**Test Coverage Requirements:**
- Minimum 80% coverage for core functions
- Focus on business logic, not getters/setters
- Test encryption/decryption flows
- Test error handling paths

### Code Quality & Style Rules

**Naming Conventions:**
- **Database**: snake_case (tables, columns)
- **Android Code**: PascalCase (classes), camelCase (functions/variables)
- **Web Code**: PascalCase (components), camelCase (functions/variables), kebab-case (files)
- **JSON Fields**: camelCase (cross-platform consistency)

**Code Organization:**
- Android: Clean Architecture layers (data/domain/presentation)
- Web: Feature-based organization (features/accounting/)
- Shared code in `common/` or `utils/`
- Never mix concerns across layers

**Documentation Requirements:**
- Document all public functions/classes
- Use KDoc (Android) or JSDoc (Web) comments
- Document complex business logic
- Include examples for non-obvious usage

**Linting/Formatting:**
- Android: Use ktlint for code formatting
- Web: Use ESLint + Prettier
- Run linters before committing
- Fix all linting errors, no warnings allowed

### Development Workflow Rules

**Git/Repository Rules:**
- Use descriptive commit messages
- Follow conventional commits format if adopted
- Create feature branches for new features
- Keep commits atomic and focused

**Code Review Requirements:**
- All code must be reviewed before merge
- Check for architectural pattern compliance
- Verify encryption/security implementations
- Ensure cross-platform consistency

### Critical Don't-Miss Rules

**Anti-Patterns to Avoid:**

❌ **Never mix naming conventions:**
- Don't use snake_case in Kotlin code
- Don't use camelCase in database columns
- Don't mix date formats (always use ISO 8601)

❌ **Never mutate state directly:**
- Android: Always use `copy()` for data classes
- Web: Always use immutable updates with Zustand/Immer
- Never modify arrays/objects in place

❌ **Never skip encryption:**
- All sensitive data must be encrypted before storage
- Never store passwords in plain text
- Always use Repository layer for encryption

❌ **Never bypass Repository layer:**
- Always access database through Repository
- Never call DAO directly from ViewModel/Service
- Repository handles encryption/decryption

**Edge Cases to Handle:**

- **Empty data**: Always handle empty lists/arrays gracefully
- **Network errors**: Handle offline scenarios (local-first architecture)
- **Permission denial**: Gracefully handle permission denial on Android
- **Large datasets**: Use pagination for large data lists
- **Date/timezone**: Always use ISO 8601 format, handle timezone correctly

**Security Rules:**

- **Password validation**: Minimum 6 characters, support letters/numbers/special chars
- **Session timeout**: 30 minutes inactivity auto-logout
- **Encryption keys**: Never store encryption keys, derive from user password
- **Data export**: Optionally encrypt exported data files

**Performance Gotchas:**

- **Database queries**: Always use indexes for frequent queries
- **Encryption operations**: Use async encryption/decryption, implement caching
- **Statistics calculation**: Cache calculation results, recalculate on data changes
- **Image processing**: Compress images before storage (OCR results)

---

## Usage Guidelines

**For AI Agents:**

- Read this file before implementing any code
- Follow ALL rules exactly as documented
- When in doubt, prefer the more restrictive option
- Update this file if new patterns emerge during implementation
- Pay special attention to cross-platform consistency rules
- Always verify encryption/security implementations

**For Humans:**

- Keep this file lean and focused on agent needs
- Update when technology stack changes
- Review quarterly for outdated rules
- Remove rules that become obvious over time
- Add new rules when patterns emerge that agents might miss

**Last Updated:** 2026-01-26
