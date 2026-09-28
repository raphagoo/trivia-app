# Trivia App — Project Guidelines

## Tech Stack

- **Frontend**: Vue 3 (Options API + Composition API), Vuetify 4, Vue Router 5, Vuex 4
- **Build**: Vite 8, TypeScript 7
- **Testing**: Cypress 15 (E2E), Jest 30 (unit)
- **Linting**: ESLint 10 + `eslint-plugin-vue` 10, Prettier
- **Styling**: SCSS/Sass, Vuetify components, `@mdi/font` icons
- **HTTP**: Axios with interceptors for auth token refresh
- **Realtime**: Socket.IO client for game rooms
- **Other**: `sweetalert2` for modals, `check-password-strength` for registration, `vuex-persistedstate` for state persistence

## Architecture

```
src/
├── App.vue                  # Root component (v-app shell with Header + router-view)
├── main.ts                  # App entry — mounts Vue with router, store, vuetify
├── router.ts                # Vue Router config (/, /authentication, /room/:roomId)
├── socket.ts                # Socket.IO client instance
├── components/
│   ├── Header.vue           # Top bar with user info / login link
│   └── Quizz.vue            # Quiz gameplay component (countdown, questions, answers)
├── views/
│   ├── Home.vue             # Room list + create/join room
│   ├── Room.vue             # Room lobby + quiz setup (host controls)
│   └── Authentication.vue   # Login / Register with password strength
├── store/
│   ├── index.ts             # Vuex store with persisted state
│   ├── user.module.ts       # User auth (register, login, guest, logout, token refresh)
│   ├── room.module.ts       # Room management (CRUD, join, leave, quiz lifecycle)
│   └── tag.module.ts        # Trivia category tags from external API
├── interfaces/
│   ├── apiInterface.ts      # Axios instance with auth interceptors
│   ├── apiTriviaInterface.ts# Axios instance for trivia API
│   └── consoleLogger.ts     # Configurable log level wrapper
├── types/
│   └── index.d.ts           # Shared TypeScript types (Room, User, Question, etc.)
└── styles/
    └── _variables.scss      # Vuetify SCSS variables
```

## Key Conventions

### Vue Components
- Use **Options API** with `defineComponent()` for components (Home.vue, Header.vue, etc.)
- Use `vue-class-component` style: `data()`, `computed`, `methods`, `mounted`, `beforeUnmount`
- Composition API (`setup()`, `ref`, `onMounted`) is used only in `Room.vue` and `Quizz.vue` for child component refs
- Component names use lowercase-kebab-case in templates (e.g. `<router-view>`, `<vue-countdown>`)

### Vuex Store
- Namespaced modules (`user`, `room`, `tag`)
- Actions return Promises for chaining (e.g., `createGuestUser().then(() => createRoom(...))`)
- State includes typed interfaces from `src/types/index.d.ts`
- Persisted via `vuex-persistedstate`

### Routing
- Routes: `/` (Home), `/authentication`, `/room/:roomId`
- Catch-all redirects to `/`
- Navigation guard is present but auth redirect is commented out

### API / Auth
- Axios request interceptor attaches Bearer token from `localStorage`
- Axios response interceptor handles 401 → token refresh via `/user/refresh`
- Tokens stored in `localStorage`: `token`, `refreshToken`
- Guest users created via `POST /user/guest`

### Socket.IO
- Global socket instance in `src/socket.ts` connecting to the backend API URL
- Events: `create_room`, `join_room`, `leave_room`, `started_game`, `end_game`, `generate_quizz`, `check_answer`, `next_question`
- Listeners registered in `mounted()` and cleaned up in `beforeUnmount()`

### Styling
- Vuetify components with utility classes (`bg-grey`, `bg-blue`, `bg-success`, etc.)
- Custom styles use `<style scoped>` in Vue SFCs
- Vuetify 4 theming with Material Design Icons (`@mdi/font`)

### Editor / Formatting
- No semicolons, single quotes (Prettier: `--no-semi --single-quote`)
- Indent: 4 spaces

## Build & Test Commands

```bash
npm install          # Install dependencies
npm start            # Start Vite dev server
npm run build        # Production build
npm run lint         # ESLint check (no auto-fix)
npm run prettier     # Format with Prettier
npm test             # Cypress E2E tests (headless)
npm run test-interactive  # Cypress interactive mode
```

## Known Constraints

- `typescript@^7.0.2` is incompatible with `@typescript-eslint/*` (peer range `<6.1.0`, no compatible or canary build exists as of 2026-09). This is not just a peer-dep warning: TS7's package only exports `version`/`versionMajorMinor` from its main entry, so the legacy TS Compiler API that `typescript-estree` depends on (`ts.Extension`, `ts.createProgram`, etc.) is gone, and `@typescript-eslint/parser`/`eslint-plugin` crash on load. **`npm run lint` is currently broken** and the `build (20.x)` CI check fails on its Lint step. `vue-tsc --noEmit` also fails on TS7 (unrelated `ERR_PACKAGE_PATH_NOT_EXPORTED` on `typescript/lib/tsc`), though it isn't wired into any npm script or CI check. Fixing this requires either downgrading `typescript` below `6.1.0` or waiting for upstream `@typescript-eslint` support for TS7. `legacy-peer-deps=true` in `.npmrc` only suppresses the install-time warning, it does not make the tools work together.
- `vue-socket.io-extended` is on an alpha release (`5.0.0-alpha.5`); the stable `latest` tag is a lower version (`4.2.0`).
- Backend API expected at `VITE_NODE_API_URL` env var, trivia API at `VITE_TRIVIA_API_URL`.
