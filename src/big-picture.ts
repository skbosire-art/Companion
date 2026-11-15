// Big picture: which bigger life goals a person's skill stamps add up to.
//
// SAMPLE RULES written by the team. There is no AI and no backend here yet.
// Later, the API (services/api) can replace `bigPictureFor` with a real AI
// prompt, for example POST /big-picture { stampedSkillIds } -> BigPicture[].
// Keep the same shapes and the screens will not need to change.
//
// Plain-language rules for every string (the AI prompt must follow them too):
// - Short sentences of 12 words or fewer.
// - A gentle suggestion, never a task. The person stays in control.
// - Words only, no symbols, so Read to me sounds natural.
// - Never guide stoves, ovens, heaters or medication. Say "ask your support person".

export interface GoalStep {
  text: string
  /** The skill this step uses. Shows "You have this stamp" when earned. */
  skillId?: string
  /** A step a support person helps with, like the oven. Never guided. */
  askForHelp?: boolean
}

export interface GoalRule {
  id: string
  /** Every one of these skills needs a stamp before the goal is suggested. */
  skillIds: string[]
  /** The goal as a title. */
  title: string
  /** The card's heading, a gentle suggestion: "You can now host Thanksgiving, if you want." */
  headline: string
  /** A short name for buttons: "Back to your Thanksgiving idea". */
  shortName: string
  /** What the goal is, as a short phrase: "hosting a holiday meal". */
  skillsFor: string
  /** Small steps for "Show me how". */
  steps: GoalStep[]
}

/** A goal the person's stamps add up to, with the words to show and read aloud. */
export interface BigPicture {
  goal: GoalRule
  /** "You baked a cake, cooked pasta, shopped for groceries, and washed dishes." */
  whatYouDid: string[]
  /** The card's version, at most 4 skills. */
  cardWhatYouDid: string[]
  /** "These are the skills for hosting friends and family." */
  because: string
}

/** How each skill sounds in "You ..." sentences. */
const DID: Record<string, string> = {
  bake_cake: "baked a cake",
  stovetop_cooking: "cooked pasta",
  grocery_shopping: "shopped for groceries",
  grocery_list: "made a grocery list",
  dishes: "washed dishes",
  laundry: "used a washing machine",
  light_rail_to_work: "rode the light rail",
  cafe_self_order: "ordered at a café screen",
}

/** Biggest goals first. The card shows the first one the person has earned. */
export const GOAL_RULES: GoalRule[] = [
  {
    id: "host_thanksgiving",
    // Listed in this order on the card: dishes, cake, pasta, groceries.
    skillIds: ["dishes", "bake_cake", "stovetop_cooking", "grocery_shopping"],
    title: "Host Thanksgiving for friends and family",
    headline: "You can now host Thanksgiving, if you want.",
    shortName: "Thanksgiving",
    skillsFor: "hosting friends and family",
    steps: [
      { text: "Pick a day. Invite the people you love." },
      { text: "Make a grocery list for the meal.", skillId: "grocery_list" },
      { text: "Shop for the food.", skillId: "grocery_shopping" },
      { text: "Cook pasta for the main dish.", skillId: "stovetop_cooking" },
      { text: "Bake a cake for dessert.", skillId: "bake_cake" },
      { text: "Ask your support person to help with the oven.", askForHelp: true },
      { text: "Wash the dishes when everyone goes home.", skillId: "dishes" },
    ],
  },
  {
    id: "run_your_home",
    skillIds: ["laundry", "dishes", "stovetop_cooking"],
    title: "Run your own home",
    headline: "You can now run your own home, if you want.",
    shortName: "home",
    skillsFor: "running your own home",
    steps: [
      { text: "Pick one day each week for laundry.", skillId: "laundry" },
      { text: "Wash the dishes after each meal.", skillId: "dishes" },
      { text: "Cook a simple dinner a few nights a week.", skillId: "stovetop_cooking" },
      { text: "Make a weekly chore chart with someone you trust." },
    ],
  },
  {
    id: "weekly_shopping",
    skillIds: ["light_rail_to_work", "grocery_shopping"],
    title: "Do your weekly shopping on your own",
    headline: "You can now shop each week on your own, if you want.",
    shortName: "shopping",
    skillsFor: "shopping on your own",
    steps: [
      { text: "Make your grocery list at home.", skillId: "grocery_list" },
      { text: "Ride the light rail to the store.", skillId: "light_rail_to_work" },
      { text: "Buy the food on your list.", skillId: "grocery_shopping" },
      { text: "Ride the light rail home with your bags.", skillId: "light_rail_to_work" },
    ],
  },
]

/** Opening line, so the card sounds like a friendly AI noticed something. */
export const NOTICED = "I looked at your stamps. I noticed something."
/** Always said with a suggestion. */
export const YOUR_CHOICE = "This is just an idea. You decide."
/** Ends the card, after "These are the skills for ...". */
export const IF_INTERESTED = "Try it only if you are interested."

/**
 * DEMO SETTING. While set, the card always shows this goal: it never moves on
 * to another idea, and "Not now" only hides it until you leave My Skills.
 * Set to null for the normal behaviour ("Not now" puts the idea away).
 */
export const DEMO_PINNED_GOAL: string | null = "host_thanksgiving"
export const CLOSING = "You are building a more independent life."

const MAX_WORDS = 12
/** The card lists at most this many skills, so it stays short. */
const MAX_CARD_SKILLS = 4
const wordCount = (sentence: string) => sentence.split(/\s+/).filter(Boolean).length

function joinList(items: string[]) {
  if (items.length <= 1) return items.join("")
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`
}

/**
 * "You baked a cake, cooked pasta, and washed dishes." Split into more
 * sentences ("You also ...") when one would be longer than 12 words.
 */
export function whatYouDid(skillIds: string[]): string[] {
  const phrases = skillIds.map((id) => DID[id]).filter(Boolean)
  const sentences: string[] = []
  let current: string[] = []
  const sentence = (items: string[]) =>
    `${sentences.length ? "You also" : "You"} ${joinList(items)}.`
  for (const phrase of phrases) {
    if (current.length && wordCount(sentence([...current, phrase])) > MAX_WORDS) {
      sentences.push(sentence(current))
      current = []
    }
    current.push(phrase)
  }
  if (current.length) sentences.push(sentence(current))
  return sentences
}

/** Every goal these stamps add up to, biggest first. */
export function bigPictureFor(stampedSkillIds: string[]): BigPicture[] {
  const earned = new Set(stampedSkillIds)
  return GOAL_RULES.filter((goal) => goal.skillIds.every((id) => earned.has(id))).map(
    (goal) => ({
      goal,
      whatYouDid: whatYouDid(goal.skillIds),
      cardWhatYouDid: whatYouDid(goal.skillIds.slice(0, MAX_CARD_SKILLS)),
      because: `These are the skills for ${goal.skillsFor}.`,
    }),
  )
}

/** The words for "What your stamps add up to" in the monthly summary. */
export function stampsAddUpTo(stampedSkillIds: string[]): string[] {
  const [first, ...others] = bigPictureFor(stampedSkillIds)
  if (!first) return []
  return [
    ...first.whatYouDid,
    first.because,
    ...others.map((other) => `You also have the skills for ${other.goal.skillsFor}.`),
    CLOSING,
  ]
}

/** Everything the card says, in order, for Read to me. */
export function cardReadAloud(picture: BigPicture) {
  return [
    "Big picture.",
    NOTICED,
    ...picture.cardWhatYouDid,
    picture.goal.headline,
    picture.because,
    IF_INTERESTED,
  ].join(" ")
}

/** Sentences longer than 12 words. Used to check rule wording (and AI output later). */
export function longSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => wordCount(sentence) > MAX_WORDS)
}

if (import.meta.env?.DEV) {
  const all = GOAL_RULES.flatMap((goal) => [
    goal.title,
    goal.headline,
    ...goal.steps.map((step) => step.text),
    ...bigPictureFor(goal.skillIds).flatMap((p) => [
      ...p.whatYouDid,
      ...p.cardWhatYouDid,
      p.because,
    ]),
  ])
  const tooLong = all.flatMap(longSentences)
  if (tooLong.length) console.warn("Big picture wording over 12 words:", tooLong)
}
