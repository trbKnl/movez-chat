import { z } from 'zod'

export const GameTextsSchema = z.object({
  topicAssignment: z.string(),
  topicQuestion: z.string(),
  overviewImposterAssignmentDislike: z.string(),
  overviewImposterAssignmentLike: z.string(),
  overviewPlayerAssignment: z.string(),
  chatScreenYouLike: z.string(),
  chatScreenYouDislike: z.string(),
  chatScreenPlayerLike: z.string(),
  chatScreenPlayerDislike: z.string(),
})

export type GameTexts = z.infer<typeof GameTextsSchema >;

export const gameTextsSports: GameTexts = {
  topicAssignment: "You will talk about sports",
  topicQuestion: "Do you like doing sports?",
  overviewImposterAssignmentDislike: "Make the others believe that you like sports",
  overviewImposterAssignmentLike: "Make the others believe that you don't like sports",
  overviewPlayerAssignment: "Who is the imposter, and is lying about their feelings toward sports?",
  chatScreenYouLike: "You say that you like sports",
  chatScreenYouDislike: "You say that you don't like sports",
  chatScreenPlayerLike: "<PLAYER> says they like sports",
  chatScreenPlayerDislike: "<PLAYER> says they don't like sports",
}

