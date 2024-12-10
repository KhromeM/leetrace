import fs from "fs";
const questionsTxt = await fs.readFileSync("assets/questions3.json", {
	encoding: "utf-8",
});
let questions = JSON.parse(questionsTxt);
const questionsMap = {};
questions.forEach((q) => (questionsMap[q.slug] = q));
questions = questions.filter((q) => !q.topics?.includes("SQL"));

export const getRandomQuestion = async () => {
	try {
		const easies = questions.filter((q) => q.rating <= 1500);
		const randomQuestion = easies[Math.floor(Math.random() * easies.length)];
		return randomQuestion;
	} catch (error) {
		console.error("Error getting random question:", error);
		throw error;
	}
};

export const getQuestionFromSlug = (slug) => {
	return questionsMap[slug];
};
