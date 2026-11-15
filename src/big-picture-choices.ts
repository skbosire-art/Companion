// What the person chose on the Big picture card. Stored only on this device.
// "Not now" puts an idea away; it is never shown as a task or a reminder.
import { useSyncExternalStore } from "react"

const KEY = "companion/big-picture-not-now"

interface Choices {
  /** Goal ids the person said "Not now" to. */
  notNow: string[]
  /** True right after "Not now", so a new idea does not pop up straight away. */
  restingThisVisit: boolean
  /** The goal "Show me how" opened. */
  openGoalId: string | null
  /** Set when "Practice this" started a practice from a goal plan. */
  practiceFromGoalId: string | null
}

const listeners = new Set<() => void>()
let state: Choices = {
  notNow: (() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) ?? "[]") as string[]
    } catch {
      return []
    }
  })(),
  restingThisVisit: false,
  openGoalId: null,
  practiceFromGoalId: null,
}

function set(next: Partial<Choices>) {
  state = { ...state, ...next }
  listeners.forEach((listener) => listener())
}

export function useBigPictureChoices() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => state,
  )
}

export const getBigPictureChoices = () => state

export function sayNotNow(goalId: string) {
  const notNow = [...new Set([...state.notNow, goalId])]
  localStorage.setItem(KEY, JSON.stringify(notNow))
  set({ notNow, restingThisVisit: true })
}

/** Hide the card until the person leaves My Skills, without saving anything (demo mode). */
export const restForThisVisit = () => set({ restingThisVisit: true })

/** Leaving My Skills ends the visit; the next idea can show next time. */
export const endVisit = () => set({ restingThisVisit: false })

export const openGoal = (goalId: string) => set({ openGoalId: goalId })

/** "Practice this" from a goal plan, so the practice can lead back to it. */
export const practiceFromGoal = (goalId: string) =>
  set({ openGoalId: goalId, practiceFromGoalId: goalId })

/** The practice is no longer tied to a goal plan. */
export const clearPracticeFromGoal = () => set({ practiceFromGoalId: null })
