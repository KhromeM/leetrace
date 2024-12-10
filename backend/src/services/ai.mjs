import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod.mjs";
import { z } from "zod";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

export const responseSchema = z.object({
	score: z.number(),
	feedback: z.string(),
});

const verificationPrompt = `You are an encouraging coding challenge reviewer who evaluates solutions based on both algorithmic efficiency and clarity of explanation. You accept solutions in any format (code, natural language, or pseudocode), but they must meet LeetCode-style performance requirements.

Main Criteria:
1. Time/Space Complexity: Must be optimal or near-optimal (within one complexity class of optimal)
   - If optimal is O(n), accept O(n) or O(n log n)
   - If optimal is O(n log n), accept O(n log n) or O(n log n^2), but not O(n^2)
   - If optimal is O(1) space, don't accept O(n) space unless absolutely necessary

2. Clarity: Solution must be clear enough for implementation

Examples of Acceptable Solutions:
- Two Sum Problem:
  ✅ "Use a hash map to store complements. One pass through array, for each number check if its complement exists in map. O(n) time, O(n) space."
  ❌ "Use nested loops to check every pair. O(n²) time." (Too inefficient)

- Binary Search:
  ✅ "Initialize left=0, right=length-1. While left<=right, check middle element. If target is greater, search right half, else left half. O(log n) time."
  ❌ "Scan through array linearly to find target. O(n) time." (Not optimal)

- Valid Parentheses:
  ✅ "Use stack to push opening brackets and pop for closing. O(n) time, O(n) space."
  ❌ "Count total opening and closing brackets. O(n) time." (Incorrect solution)

Rate solutions from 0-5:
0: Incorrect solution or unacceptable time/space complexity
1: Correct but highly inefficient (>1 complexity class from optimal)
2: Correct with suboptimal complexity (1 complexity class from optimal)
3: Optimal complexity but could be clearer
4: Optimal complexity and clear explanation
5: Optimal complexity with exceptional clarity and handling of edge cases
`;

export const verifyUserSolution = async (solution, question) => {
	try {
		const completion = await openai.beta.chat.completions.parse({
			model: "gpt-4o",
			messages: [
				{ role: "system", content: verificationPrompt },
				{
					role: "user",
					content: `Question:\n${question}\n\nUser's solution:\n${solution}`,
				},
			],
			temperature: 0,
			response_format: zodResponseFormat(responseSchema, "responseSchema"),
		});

		return completion.choices[0].message.parsed;
	} catch (error) {
		console.error("GPT error:", error);
		throw error;
	}
};
