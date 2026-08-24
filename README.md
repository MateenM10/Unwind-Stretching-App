# Unwind

A calm, minimal stretching app that guides you through a short session — voice cues, breathing prompts, a streak to keep you coming back — and then gets out of your way.

I built Unwind to get properly hands-on with React Native, and because most stretching apps I tried were either bloated with subscriptions and social features, or so bare-bones they felt like a glorified stopwatch. It's a portfolio project, not a commercial app, but I tried to build it like it mattered — including going back and fixing real bugs I found once I actually started using it instead of just writing it.

---

## Screenshots

| Home | Session | Library |
|------|---------|---------|
| ![Home](docs/screenshots/home.png) | ![Session](docs/screenshots/session.png) | ![Library](docs/screenshots/library.png) |

| Progress | Settings | Onboarding |
|----------|----------|------------|
| ![Progress](docs/screenshots/progress.png) | ![Settings](docs/screenshots/settings.png) | ![Onboarding](docs/screenshots/onboarding.png) |

---

## What it does

- **Adaptive stretch selection** — sessions lean toward stretches you favourite and away from ones you skip, using a proper weighted-random algorithm rather than a fixed rotation.
- **Voice-guided sessions** — spoken stretch names, halfway/wrap-up cues, and "breathe in / breathe out" prompts synced to the timer.
- **Position + body-part filtering** — pick where you are (couch, standing, lying down) and what you want to target, and the session is built from a library of 50+ stretches matching both.
- **Streak tracking** — daily streaks, a 7-day activity chart, session history, and milestone badges, all saved locally.
- **Haptic feedback** on selections, transitions, and completion.
- **Favouriting & feedback loop** — heart a stretch or mark "not for me" mid-session, which directly feeds the weighting above.
- **Daily reminders** with custom time slots, via local push notifications.

Everything works offline, no account, no backend — it's all local storage.

---

## Tech

React Native + Expo (Expo Router, TypeScript), `react-native-reanimated` for the animated timer and onboarding carousel, `expo-speech` for voice, `expo-haptics` for feedback, `expo-notifications` for reminders, and `@react-native-async-storage/async-storage` for everything that persists. Icons are Ionicons throughout — no emoji anywhere in the UI, which took an actual pass to enforce consistently.

---

## How it's put together

```
app/
├── (tabs)/        Home, Library, Progress, Settings — the tab bar
├── session.tsx    Active stretch session: timer, voice cues, feedback
├── bodypart.tsx   Muscle-group picker
├── onboarding.tsx First-launch parallax carousel
└── complete.tsx   Post-session summary + streak celebration
components/        Reusable UI — timers, buttons, modals, animated numbers
utils/
├── stretches.ts   The stretch data set (50+ entries)
├── weights.ts     Weighted-shuffle algorithm + favourites/weight persistence
├── streaks.ts     Streak calculation, session history, weekly chart data
├── reminders.ts   Local notification scheduling
└── theme.ts       Shared design tokens — colors, gradients, shared styles
```

A few things worth pointing out:

The weighting algorithm in `utils/weights.ts` is a pure function — give it a stretch list and a weights map, it gives back a shuffled list. No side effects, easy to reason about, easy to test.

Colors, gradients, and shared component styles all live in `utils/theme.ts`. The palette is a warm cream/caramel rather than the cold, high-contrast look most fitness apps default to — a deliberate choice to make a few minutes of stretching feel calm instead of like a workout.

Session state (`app/session.tsx`) is the most complex file in the app by far — it's juggling a countdown timer, voice narration, breathing-cue timing, and pause/resume, all at once. It went through a few real rewrites as I found bugs in it.

---

## Running it

```bash
git clone https://github.com/MateenM10/unwind.git
cd unwind
npm install
npx expo start
```

Scan the QR code with Expo Go, or press `i` for the iOS Simulator. No API keys or setup needed — everything's local.

---

## What I learned

Most of what I got out of this was the gap between "it runs" and "it's actually correct" — a few bugs only showed up once I used the app repeatedly instead of just reading the code.

The weighted shuffle wasn't actually weighted. The original sort comparator had an operator-precedence bug — `Math.random() - 0.5 / totalWeight` instead of `(Math.random() - 0.5) / totalWeight` — so favourited stretches were barely more likely to show up than anything else. I rewrote it using Efraimidis–Spirakis weighted sampling: give each stretch a key of `random^(1/weight)` and sort by that. Small algorithm, but getting it wrong the first time was a good reminder to actually verify behavior, not just that code compiles.

React Native's native animation driver only supports `transform` and `opacity`. My onboarding screen's dot indicators originally animated `width` directly, which throws at runtime the moment the driving value is on the native thread. Swapped it for a `scaleX` transform on a fixed-width dot instead — which, as a side effect, also fixed a subtle layout shift the original version had.

I also had a stale-closure bug in the voice toggle: turning voice guidance on called a function that checked a state variable from inside the same handler that had *just* set that state, so it silently read the old value and no-op'd. Fixed it by mirroring the toggle into a ref that's always current instead of relying on the render closure.

And I cut a feature that was already partly built: I generated a couple of proof-of-concept stretch animations with an AI video tool, but they came out with the tool's watermark baked into the video, so I pulled them rather than ship branded content in something meant to look like a finished product. The wiring for animations is still in the code — it just gracefully skips the section when a stretch doesn't have one — so it's a one-line addition to bring real animations back later.

---

## Development notes

I used AI tools (Claude) as a pair-programming assistant on this — mostly for debugging (several of the bugs above I found *because* I was walking through the app screen-by-screen with it), talking through naming and branding decisions, and repetitive refactors like removing emoji and cleaning up types. Every product decision, the feature scope, and what got cut were mine; I reviewed and understood everything that went in. Felt worth being upfront about, since it's how I actually work.

---

## Things I'd add next

- A real animation library, generated cleanly without any tool watermarks
- Dark mode
- Automated tests for the weighted-shuffle algorithm and streak logic — both are pure functions and would be easy to cover
- Empty states for the Library tab when no favourites exist yet
- Testing on a physical Android device (the config is there, just unverified)

---

_Built with React Native & Expo._
