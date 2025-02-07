import { z } from "zod";

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
});

export type GameTexts = z.infer<typeof GameTextsSchema>;

export const gameTextsSports: GameTexts = {
	topicAssignment: "This game will be about football.",
	topicQuestion: "Do you like watching football?",
	overviewImposterAssignmentDislike:
		"Make others believe that you like watching football",
	overviewImposterAssignmentLike:
		"Make others believe that you don't like watching football",
	overviewPlayerAssignment:
		"Who is the imposter, and is lying about their feelings toward football?",
	chatScreenYouLike: "You say that you like watching football",
	chatScreenYouDislike: "You say that you don't like watching football",
	chatScreenPlayerLike: "<PLAYER> says they like watching football",
	chatScreenPlayerDislike: "<PLAYER> says they don't like watching football",
};
