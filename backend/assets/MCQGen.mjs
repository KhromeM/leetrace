import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod.mjs";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const mcqSchema = z.object({
	mcqs: z.array(
		z.object({
			question: z.string(),
			options: z.array(z.string()),
			explanation: z.string(),
			answer: z.enum(["a", "b", "c", "d"]),
			topics: z.array(z.string()).optional(),
		})
	),
});
const validationSchema = z.object({
	answers: z.array(
		z.object({
			explanation: z.string(),
			answer: z.enum(["a", "b", "c", "d"]),
		})
	),
});

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

const TOPICS = [
	"Array",
	"Backtracking",
	"Binary Indexed Tree",
	"Binary Search",
	"Binary Search Tree",
	"Bit Manipulation",
	"Breadth-First Search",
	"Combinatorics",
	"Concurrency",
	"Database",
	"Depth-First Search",
	"Design",
	"Divide and Conquer",
	"Dynamic Programming",
	"Game Theory",
	"Graph",
	"Greedy",
	"Hash Table",
	"Heap",
	"Linked List",
	"Math",
	"Matrix",
	"Minimax",
	"OrderedMap",
	"Prefix Sum",
	"Probability",
	"Queue",
	"Random",
	"Recursion",
	"Segment Tree",
	"Shell",
	"Simulation",
	"Sliding Window",
	"Sort",
	"SQL",
	"Stack",
	"String",
	"Topological Sort",
	"Tree",
	"Trie",
	"Two Pointers",
	"Union Find",
].join('", "');

async function generateMCQs(question) {
	const prompt = `You are an expert in Data Structures and Algorithms. Create multiple choice questions (MCQs) that deeply test algorithmic understanding. Generate questions based on difficulty, with most being complex implementation questions.

    Question Count by Difficulty:
    - Easy (rating 1000-1400): 2 MCQs
      • 1 basic concept questions
      • 1 intermediate implementation question
    - Medium (1400-2000): 2-4 MCQs
      • 2-4 complex implementation questions
    - Hard (2000-3000): 3-5 MCQs
      • 3-5 complex implementation questions
    
    Complex Question Types (prioritize these for medium/hard problems):
    

1. Implementation Analysis and Bug Spotting
Example:
"Given this solution for finding the longest palindromic substring:
\`\`\`python
def longestPalindrome(s):
    longest = ''
    for i in range(len(s)):
        # Expand around center for odd length
        left, right = i, i
        while left >= 0 and right < len(s) and s[left] == s[right]:
            if right - left > len(longest):  # BUG: Should be right - left + 1
                longest = s[left:right]
            left -= 1
            right += 1
        
        # Even length palindromes
        left, right = i, i+1
        while left >= 0 and right < len(s) and s[left] == s[right]:
            if right - left > len(longest):
                longest = s[left:right]
            left -= 1
            right += 1
    return longest
\`\`\`
Which line contains the bug and why does it still pass many test cases?"

Options:
a) if right - left > len(longest): because it compares length with index difference
b) longest = s[left:right]: because it slices incorrectly
c) while left >= 0 and right < len(s): because it checks bounds in wrong order
d) left, right = i, i: because it starts from wrong indices

2. Solution Comparison and Trade-offs
Example:
"Given these three solutions for finding the kth largest element:
A) QuickSelect algorithm
B) Heap-based solution
C) Sorting-based solution

Which combination of input characteristics would make solution B perform better than both A and C?"

Options:
a) Large array size (n > 10⁶), k is close to n/2, elements are randomly distributed
b) Small array size (n < 10³), k is very small (k < 10), many duplicates present
c) Medium array size (10⁴ < n < 10⁵), k is close to n, elements are nearly sorted
d) Large array size (n > 10⁶), k is very small (k < 100), elements are roughly sorted

3. Missing Line Completion
Example:
"In this solution for merge intervals, which line should replace the ??? to correctly merge overlapping intervals?
\`\`\`python
def merge(intervals):
    if not intervals:
        return []
    
    intervals.sort(key=lambda x: x[0])
    merged = [intervals[0]]
    
    for interval in intervals[1:]:
        if ???:
            merged[-1][1] = max(merged[-1][1], interval[1])
        else:
            merged.append(interval)
    return merged
\`\`\`"

Options:
a) interval[0] <= merged[-1][1]
b) interval[0] <= merged[-1][1] + 1
c) interval[0] - merged[-1][1] <= 1
d) merged[-1][1] >= interval[0]

4. Optimization Modifications
Example:
"Given this O(n) solution that uses extra space, what single modification would make it work in-place while maintaining the same time complexity?"

Options:
a) Replace the visited array with bit manipulation on the original array
b) Use two pointers instead of a hash set
c) Modify the input array to store both original and processed values
d) Change the iteration direction to avoid extra storage

5. Tricky Complexity Analysis
Example:
"Analyze the time and space complexity of this recursive solution, considering both the recursion stack and memoization:
\`\`\`python
@lru_cache(None)
def solve(s, i, j):
    if i >= j:
        return 0
    if s[i] == s[j]:
        return solve(s, i+1, j-1)
    return 1 + min(solve(s, i+1, j), solve(s, i, j-1))
\`\`\`"

Options:
a) Time: O(2^n), Space: O(n) - the memoization reduces time to O(n²)
b) Time: O(n²), Space: O(n²) - due to memoization storing all subproblems
c) Time: O(n²), Space: O(n) - memoization reuses space but stack grows linearly
d) Time: O(n²), Space: O(n²) - both recursion stack and cache grow quadratically

    
    For basic concept questions (1 per set):
    - Core algorithmic concepts
    - Time/space complexity of straightforward implementations
    - Appropriate data structure selection
    - Common edge cases
    
    Requirements for all questions:
    1. Each MCQ must have:
       - Clear question focusing on algorithmic understanding
       - 4 plausible options (make wrong answers reasonably tempting)
       - Detailed explanation of the correct answer
       - Topic tags from the provided list
       - Code snippets where relevant
    
    2. For implementation questions:
       - Show real code (not pseudocode)
       - Include line numbers for bug spotting
       - Make bugs subtle but identifiable
       - Ensure wrong options are plausible implementations
    
    3. For complexity questions:
       - Include hidden factors that affect complexity
       - Consider both time and space
       - Account for all auxiliary space usage
    
    Return format:
    {
      "mcqs": [
        {
          "question": string,
          "options": [string, string, string, string],
          "explanation": string,
          "answer": "a" | "b" | "c" | "d",
          "topics": string[]
        }
      ]
    }
    
    The provided question is:
    `;

	try {
		return await openai.beta.chat.completions.parse({
			model: "gpt-4o",
			messages: [
				{ role: "system", content: prompt },
				{ role: "user", content: JSON.stringify(question) },
			],
			temperature: 0,
			response_format: zodResponseFormat(mcqSchema, "mcqSchema"),
		});
	} catch (error) {
		console.error("Error generating MCQs:", error);
		return null;
	}
}

async function validateMCQs(mcqs, question) {
	const prompt = `You are a genius computer science student taking a quiz about Data Structures and Algorithms.
These MCQs are based on this original LeetCode question:

${question.title}

${question.content}

Answer the following multiple choice questions. For each question:
1. Think through your reasoning considering:
   - The key DSA concepts involved
   - Why certain options would or wouldn't work
   - Complexity and optimization implications
   - Potential edge cases
2. After your explanation for each question, provide your answer as a single letter (a, b, c, or d)

${mcqs
	.map(
		(mcq, i) => `
Question ${i + 1}: ${mcq.question}

Options:
a) ${mcq.options[0]}
b) ${mcq.options[1]}
c) ${mcq.options[2]}
d) ${mcq.options[3]}
`
	)
	.join("\n")}`;

	try {
		const response = await openai.beta.chat.completions.parse({
			model: "gpt-4o",
			messages: [{ role: "user", content: prompt }],
			temperature: 0,
			response_format: zodResponseFormat(validationSchema, "validationSchema"),
		});

		const validatedAnswers = response.choices[0].message.parsed.answers;
		return mcqs.map((mcq, i) => ({
			...mcq,
			isValid: validatedAnswers[i].answer === mcq.answer,
		}));
	} catch (error) {
		console.error("Error validating MCQs:", error);
		return mcqs.map((mcq) => ({ ...mcq, isValid: false }));
	}
}

async function processBatches(data, batchSize = 50) {
	for (let i = 0; i < data.length; i += batchSize) {
		const batch = data.slice(i, i + batchSize);
		const batchResults = await Promise.all(
			batch.map(async (question) => {
				const mcqResult = await generateMCQs(question);
				if (!mcqResult?.choices?.[0]?.message?.parsed?.mcqs) {
					console.log(`Skipping ${question.slug} - failed to generate MCQs`);
					return question;
				}
				const mcqs = mcqResult.choices[0].message.parsed.mcqs;
				question.MCQs = mcqs;

				// let validatedMCQs = await validateMCQs(mcqs, question);

				// const finalMCQs = validatedMCQs
				// 	.filter((mcq) => mcq.isValid)
				// 	.map(({ isValid, ...mcq }) => mcq); // Remove isValid flag from final output
				// if (!finalMCQs) {
				// 	console.log(`Failed to validate questions for  ${question.slug}`);
				// }
				return question;
			})
		);

		console.log(
			"Finished batch " +
				(i / batchSize + 1) +
				"/" +
				Math.ceil(data.length / batchSize)
		);
	}

	return data;
}

async function main() {
	try {
		const questionsFile = await fs.readFile(
			path.join(__dirname, "questions3.json"),
			"utf-8"
		);
		const questions = JSON.parse(questionsFile).slice(0, 100);
		await processBatches(questions);

		await fs.writeFile(
			path.join(__dirname, "mcqs.json"),
			JSON.stringify(questions, null, 2),
			"utf-8"
		);

		console.log("MCQ generation complete!");
	} catch (error) {
		console.error("Error processing questions:", error);
	}
}

// Run the script
main().catch(console.error);
