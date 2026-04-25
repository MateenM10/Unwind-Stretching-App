# Product Requirements Document
## Stretch App — Guided Stretching for Everyday Moments

**Version:** 1.0  
**Last Updated:** April 2026  
**Platform:** iOS & Android (React Native + Expo)  
**Status:** In Development

---

## 1. Overview

### 1.1 Product Summary
Stretch App is a mobile application that guides users through simple, position-based stretching routines designed to fit into everyday moments — work breaks, study sessions, or time in front of the TV. The app removes all friction from stretching by letting users start a session in seconds, from wherever they already are.

### 1.2 Problem Statement
Most people know they should stretch more, but dedicated workout apps feel like too much commitment. There's no lightweight, habit-friendly option that meets users where they are — on the couch, at their desk, or on the floor — without requiring special equipment or a dedicated time block.

### 1.3 Solution
A dead-simple guided stretching app that:
- Starts with one question: *where are you right now?*
- Serves stretches that match the user's current position
- Learns user preferences over time (favourites & skips)
- Encourages consistency through streaks and progress tracking

### 1.4 Target Audience
General public — anyone who sits, works, studies, or watches TV. No fitness experience required.

---

## 2. Goals & Success Metrics

| Goal | Metric |
|------|--------|
| Drive daily usage | 40%+ Day-7 retention |
| Keep sessions short & accessible | Average session length 5–10 min |
| Build habits | 30%+ of users maintain a 7-day streak within first month |
| Personalise over time | 60%+ of users favourite or skip at least one stretch |

---

## 3. User Flow

```
App Open
   │
   ▼
Position Picker Screen
   │  (Couch / Standing / Lying Down / All 3)
   ▼
Stretch Session Screen
   │  (One stretch at a time, with timer)
   │  ← User can ❤️ Favourite or ⏭ Skip each stretch
   ▼
Session Complete Screen
   │  (Streak update + summary)
   ▼
Home (or exit)
```

---

## 4. Features

### 4.1 Position Picker (MVP — Commit #2)
The first screen users see every time they open the app.

**Requirements:**
- Display 3 position options: 🛋️ Couch, 🧍 Standing, 🛏️ Lying Down
- Allow single or multi-select
- Include an "All 3" shortcut button
- "Start Stretching" CTA appears only after at least one selection
- Selection persists for the duration of the session, not between sessions

---

### 4.2 Stretch Session Screen (Commit #3)
Guides the user through a sequence of stretches one at a time.

**Requirements:**
- Show stretch name, description, and illustration (or icon)
- Display a countdown timer per stretch (default: 30 seconds)
- Show progress indicator (e.g. "Stretch 3 of 8")
- **Favourite button (❤️):** Marks stretch — increases future frequency
- **Skip button (⏭):** Skips stretch — decreases future frequency
- Smooth transition animation between stretches
- Audio cue (optional chime) when timer ends

---

### 4.3 Stretch Library
A curated set of stretches per position category.

**Requirements:**
- Minimum 10 stretches per position category (30 total at launch)
- Each stretch has: name, target muscle group, duration, position tag(s), difficulty (easy/medium)
- Stretches can belong to multiple position categories (e.g. a neck roll works for both Couch and Standing)
- Library is hardcoded at launch; dynamic/remote content is a future milestone

---

### 4.4 Adaptive Frequency (Smart Shuffle)
The app learns what the user likes and adjusts the stretch order accordingly.

**Requirements:**
- Each stretch has a weight score (default: 1.0)
- Favourite → weight increases by 0.2 (capped at 2.0)
- Skip → weight decreases by 0.2 (floored at 0.2)
- Session order is weighted-random based on scores
- Weights stored locally using AsyncStorage

---

### 4.5 Reminders (Commit #4)
Push notifications to encourage regular stretching.

**Requirements:**
- User can set 1–3 daily reminder times
- Default suggestion: "Every 2 hours during work hours"
- Notification copy is friendly and varies (not the same message every time)
- User can disable reminders at any time from settings

---

### 4.6 Streaks
Tracks consecutive days the user completes at least one session.

**Requirements:**
- Streak increments once per calendar day upon session completion
- Streak resets to 0 if user misses a full day
- Streak displayed on home/session complete screen
- Milestone celebrations at 3, 7, 14, 30 days (simple animation)

---

### 4.7 Progress Tracking
A simple overview of the user's history.

**Requirements:**
- Total sessions completed
- Total stretch time (in minutes)
- Current and longest streak
- Most used position
- Most favourited stretches (top 3)
- Weekly bar chart of sessions per day
- Data stored locally; no account/login required at launch

---

### 4.8 Session Complete Screen
Shown at the end of every session.

**Requirements:**
- Congratulatory message
- Summary: stretches completed, time spent
- Current streak display
- "Go again" and "Done" buttons

---

## 5. Design Principles

- **Zero friction** — the app should be usable in under 5 seconds from open
- **Calm & minimal** — dark background, soft purple accent, no visual clutter
- **No account required** — all data is local; privacy first
- **Accessible** — large tap targets, readable fonts, works one-handed

---

## 6. Technical Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native (Expo) |
| Navigation | Expo Router |
| Local Storage | AsyncStorage |
| Notifications | Expo Notifications |
| Animations | React Native Reanimated |
| Version Control | Git + GitHub |

---

## 7. Phased Roadmap

### Phase 1 — MVP (Current)
- Position picker screen
- Basic stretch session with timer
- Hardcoded stretch library

### Phase 2 — Personalisation
- Favourite / skip with adaptive weighting
- Streaks + session complete screen
- Reminders

### Phase 3 — Progress & Polish
- Progress tracking dashboard
- Onboarding screen
- Animations & transitions
- App icon + splash screen

### Phase 4 — Future Consideration
- iCloud / Google sync for cross-device data
- Custom routine builder
- Apple Health / Google Fit integration
- Stretch packs (e.g. "After Running", "Desk Worker")

---

## 8. Out of Scope (v1.0)
- User accounts or social features
- Video demonstrations
- Paid / subscription model
- Android-only or iOS-only specific features
- AI-generated routines

---

## 9. Open Questions
- Should the timer be pauseable mid-stretch?
- Should skipped stretches reappear in the same session or only future sessions?
- What is the minimum session length? (Can a user do just 1 stretch?)