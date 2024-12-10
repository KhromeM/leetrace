import fs from "fs";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod.mjs";
import { z } from "zod";

export const responseSchema = z.object({
	slug: z.string().nullable(),
	title: z.string().nullable(),
	leetcodeUrl: z.string().nullable(),
	difficulty: z.string().nullable(),
	topics: z.array(z.string()),
	content: z.string().nullable(),
	rating: z.number(),
});

// const extractionPrompt = `You are a precise LeetCode problem information extractor. Analyze the provided HTML/text content and extract LeetCode problem information if it exists.

//   DO NOT INCLUDE THE SOLUTION IF IT EXISTS AS A PART OF THE QUESTION
//   If there are contraints, include it with the question

//   If the content contains a LeetCode problem, extract:
//   - slug: The URL-friendly version of the title (e.g., "two-sum" for "Two Sum")
//   - title: The full problem title
//   - leetcodeUrl: The LeetCode URL (format: https://leetcode.com/problems/{slug})
//   - difficulty: "Easy", "Medium", or "Hard" if specified
//   - topics: Array of related topics/tags
//   - content: The full problem description in markdown format

//   If no LeetCode problem is found in the text, return an object with all nulls.

//   Return format must match exactly:
//   {
// 	"slug": string | null,
// 	"title": string | null,
// 	"leetcodeUrl": string | null,
// 	"difficulty": string | null,
// 	"topics": string[],
// 	"question": string | null
//   }`;

const formattingPrompt = `You are a markdown formatting expert who standardizes LeetCode problems for better readability while preserving their content and meaning. 

Your task is to:
1. Standardize markdown formatting
2. Assign appropriate difficulty ratings
3. Validate and normalize topic tags
4. Preserve problem content accuracy

Input Format:
\`\`\`json
{
    "slug": "problem-slug",
    "title": "Problem Title",
    "leetcodeUrl": "https://leetcode.com/problems/...",
    "difficulty": "Easy|Medium|Hard",
    "topics": ["Topic1", "Topic2"],
    "content": "Problem description...",
    "rating": 1234  // Optional
}
\`\`\`

# Formatting Rules

1. Section Headers
   - No headers for main problem description
   - Use **Example 1:** format (bold) for examples, not headers
   - Use **Constraints:** format for constraints section

2. Code Formatting
   - Use \`backticks\` for:
     - Individual values in examples (numbers, array elements)
     - Variable names
     - Data structure representations like \`[1,2,3]\`
     - Technical/programming terms
   - Use code blocks for:
     \`\`\`
     Input: nums = [1,2,3]
     Output: [3,2,1]
     Explanation: (if part of the example)
     \`\`\`

3. Spacing and Structure
   - Empty line before and after each section
   - Empty line before and after code blocks
   - No empty line between related items in constraints
   - Empty line between unrelated items in constraints

4. Array and Matrix Formatting
   - Format arrays as \`[1,2,3]\` with no spaces
   - Format matrices as:
     \`\`\`
     [
         [1,2,3],
         [4,5,6],
         [7,8,9]
     ]
     \`\`\`

5. ASCII Diagrams
   - Include only if they enhance understanding
   - Must be properly aligned
   - Place immediately after relevant example
   \`\`\`
   Linked List:     Binary Tree:
   1 -> 2 -> 3         1
                      / \\
                     2   3
   \`\`\`

# Rating System

Assign ratings based on difficulty and complexity:
- Easy: 1000-1400
  - Simple array/string manipulation: 1000-1200
  - Basic data structures: 1200-1400
- Medium: 1400-2000
  - Single algorithm problems: 1400-1600
  - Multiple concept problems: 1600-1800
  - Complex implementations: 1800-2000
- Hard: 2000-3000
  - Advanced algorithms: 2000-2400
  - Multiple advanced concepts: 2400-2800
  - Complex optimizations: 2800-3000

Example problem ratings:
\`\`\`
Basic array operations (Easy): 1100
Two pointer problems (Easy-Medium): 1300
Dynamic programming (Medium): 1600
Graph algorithms (Medium-Hard): 1900
Advanced DP/Graph (Hard): 2300
Complex optimization (Hard): 2700
\`\`\`

# Topic Classification

Valid topics (use exact strings with quotes):
\`\`\`
"Array"
"Backtracking"
"Binary Indexed Tree"
"Binary Search"
"Binary Search Tree"
"Bit Manipulation"
"Breadth-First Search"
"Combinatorics"
"Concurrency"
"Database"
"Depth-First Search"
"Design"
"Divide and Conquer"
"Dynamic Programming"
"Game Theory"
"Graph"
"Greedy"
"Hash Table"
"Heap"
"Linked List"
"Math"
"Matrix"
"Minimax"
"OrderedMap"
"Prefix Sum"
"Probability"
"Queue"
"Random"
"Recursion"
"Segment Tree"
"Shell"
"Simulation"
"Sliding Window"
"Sort"
"SQL"
"Stack"
"String"
"Topological Sort"
"Tree"
"Trie"
"Two Pointers"
"Union Find"
\`\`\`

Topic Guidelines:
- Add topics only if they're crucial to the solution
- A topic should be fundamental to at least one main solution approach
- Example: Add "Binary Search" only if it's a key solving technique
- Multiple topics are allowed if each is essential
- Don't add supporting concepts (e.g., don't add "Hash Table" if it's just used to optimize a DFS solution)

# Complete Example

Input JSON:
\`\`\`json
{
    "slug": "longest-palindrome-subseq",
    "title": "Longest Palindromic Subsequence",
    "leetcodeUrl": "https://leetcode.com/problems/longest-palindromic-subsequence",
    "difficulty": "Medium",
    "topics": ["Dynamic Programming"],
    "content": "Given a string s, find the length of the longest palindromic subsequence in s.\\n\\nA subsequence is a sequence that can be derived from another sequence by deleting some elements without changing the order of the remaining elements. A palindrome is a string that reads the same forward and backward.\\n\\n**Example 1:**\\n\\nInput: s = \\"bbbab\\"\\nOutput: 4\\nExplanation: One possible longest palindromic subsequence is \\"bbbb\\".\\n\\n**Example 2:**\\n\\nInput: s = \\"cbbd\\"\\nOutput: 2\\nExplanation: One possible longest palindromic subsequence is \\"bb\\".\\n\\n**Constraints:**\\n- 1 <= s.length <= 1000\\n- s consists only of lowercase English letters."
}
\`\`\`

Output JSON:
\`\`\`json
{
    "slug": "longest-palindrome-subseq",
    "title": "Longest Palindromic Subsequence",
    "leetcodeUrl": "https://leetcode.com/problems/longest-palindromic-subsequence",
    "difficulty": "Medium",
    "topics": ["Dynamic Programming", "String"],
    "rating": 1600,
    "content": "Given a string \`s\`, find the length of the longest palindromic subsequence in \`s\`.

A subsequence is a sequence that can be derived from another sequence by deleting some elements without changing the order of the remaining elements. A palindrome is a string that reads the same forward and backward.

**Example 1:**
\`\`\`
Input: s = \"bbbab\"
Output: 4
Explanation: One possible longest palindromic subsequence is \"bbbb\".
\`\`\`

**Example 2:**
\`\`\`
Input: s = \"cbbd\"
Output: 2
Explanation: One possible longest palindromic subsequence is \"bb\".
\`\`\`

**Constraints:**
- \`1 <= s.length <= 1000\`
- \`s\` consists only of lowercase English letters."
}
\`\`\`

Key changes made:
1. Formatting
   - Added \`backticks\` around variables and code elements
   - Proper spacing between sections
   - Consistent code block usage for examples
   - Proper markdown for constraints

2. Topics
   - Added "String" topic as it's crucial to the solution
   - Kept "Dynamic Programming" as it's essential

3. Rating
   - Assigned 1600 (Medium) because:
   - Uses dynamic programming
   - Requires understanding of string manipulation
   - Medium difficulty but standard DP pattern

Return:
- Complete JSON object with:
  - Properly formatted content
  - Appropriate rating
  - Validated/normalized topics
- Maintain original JSON structure
- Preserve all problem information

Note: Format for consistency and clarity while maintaining all original problem information and meaning.`;

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

let data = JSON.parse(
	fs.readFileSync("./questions.json", { encoding: "utf-8" })
);
let ratings = JSON.parse(
	fs.readFileSync("./questionRatings.json", { encoding: "utf-8" })
);
const ratingsMap = {};
ratings.sort((a, b) => a.rating - b.rating);

// for (let i = 0; i < ratings.length; i++) {
// 	if (i % 50 == 0) {
// 		console.log(ratings[i].title, ": ", Math.floor(ratings[i].rating));
// 	}
// }
ratings.forEach((obj) => (ratingsMap[obj.slug] = obj));
// console.log(ratingsMap);

// console.log(Object.keys(data).length);

data = Array.from(Object.keys(data)).map((key) => data[key]);

const topics = new Set();
data.forEach((question) => {
	question.topics.forEach((topic) => topics.add(topic));
	let questionRating = ratingsMap[question.slug];
	if (questionRating) {
		questionRating = Math.floor(questionRating.rating);
	}
	question.rating = questionRating;
});
// const questionsWithRatings = data.filter((question) => question.rating);
// console.log(questionsWithRatings);

async function processBatches(data, batchSize = 50) {
	const results = [];

	for (let i = 0; i < data.length; i += batchSize) {
		const batch = data.slice(i, i + batchSize);
		const batchResults = await Promise.all(
			batch.map((question) => {
				return extractQuestionFromHTML(JSON.stringify(question));
			})
		);
		results.push(...batchResults);
		console.log(
			"Finished batch " +
				(i / batchSize + 1) +
				"/" +
				Math.ceil(data.length / batchSize)
		);
	}

	return results;
}

const extractedQuestions = await processBatches(data);

fs.writeFileSync("./questions3.json", JSON.stringify(extractedQuestions));

async function extractQuestionFromHTML(question) {
	try {
		const timeoutPromise = new Promise((_, reject) =>
			setTimeout(reject, 60000)
		);
		const apiPromise = openai.beta.chat.completions.parse({
			model: "gpt-4o-mini",
			messages: [
				{ role: "system", content: formattingPrompt },
				{
					role: "user",
					content: `Content to analyze:\n${question}`,
				},
			],
			temperature: 0,
			response_format: zodResponseFormat(responseSchema, "responseSchema"),
		});
		const completion = await Promise.race([apiPromise, timeoutPromise]);

		return completion.choices[0].message.parsed;
	} catch (error) {
		console.error("GPT error:", error);
		return {};
	}
}
