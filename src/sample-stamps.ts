// Maya's sample My Skills stamps for November 2024. Sample data only: there is
// no backend yet. Every screen that counts stamps or works out the big picture
// reads from here, so the numbers always match.
import type { Stamp } from "./shared"

export const SAMPLE_STAMPS: Stamp[] = [
  // Laundry: learned at First Place, then used in three homes.
  { kind: "with_prompt", skillId: "laundry", earnedAt: "2024-11-02T10:00:00Z" },
  { kind: "on_my_own", skillId: "laundry", earnedAt: "2024-11-09T10:00:00Z" },
  {
    kind: "new_place",
    skillId: "laundry",
    place: "My Apartment",
    earnedAt: "2024-11-16T10:00:00Z",
  },
  // Cooking
  { kind: "with_prompt", skillId: "stovetop_cooking", earnedAt: "2024-11-04T18:00:00Z" },
  { kind: "on_my_own", skillId: "stovetop_cooking", earnedAt: "2024-11-18T18:00:00Z" },
  { kind: "with_prompt", skillId: "bake_cake", earnedAt: "2024-11-21T15:00:00Z" },
  // Cleaning
  { kind: "with_prompt", skillId: "dishes", earnedAt: "2024-11-05T19:00:00Z" },
  { kind: "on_my_own", skillId: "dishes", earnedAt: "2024-11-19T19:00:00Z" },
  // Shopping
  { kind: "on_my_own", skillId: "grocery_list", earnedAt: "2024-11-11T09:00:00Z" },
  { kind: "with_prompt", skillId: "grocery_shopping", earnedAt: "2024-11-11T11:00:00Z" },
  { kind: "on_my_own", skillId: "grocery_shopping", earnedAt: "2024-11-25T11:00:00Z" },
  {
    kind: "new_place",
    skillId: "cafe_self_order",
    place: "Uptown Coffee",
    earnedAt: "2024-11-23T08:30:00Z",
  },
  // Getting around
  { kind: "with_prompt", skillId: "light_rail_to_work", earnedAt: "2024-11-06T08:00:00Z" },
  { kind: "on_my_own", skillId: "light_rail_to_work", earnedAt: "2024-11-20T08:00:00Z" },
]

/** Each skill that has at least one stamp, in the order it was first earned. */
export function stampedSkillIds(stamps: Stamp[] = SAMPLE_STAMPS): string[] {
  const sorted = [...stamps].sort((a, b) => a.earnedAt.localeCompare(b.earnedAt))
  return [...new Set(sorted.map((stamp) => stamp.skillId))]
}
