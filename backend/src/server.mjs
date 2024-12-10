import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { authMiddleware } from "./middleware/auth.mjs";
import gameRouter from "./routes/game.mjs";
import expressWs from "express-ws";
import { getQuestionFromSlug } from "./services/questions.mjs";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
const wsInstance = expressWs(app);

app.use((req, res, next) => {
	if (req.path === "/health") return next();
	authMiddleware(req, res, next);
});
app.get("/health", (req, res) => {
	res.json({ status: "ok" });
});

app.get("/question", async (req, res) => {
	const { slug } = req.query;
	console.log("QUESTION: ", slug);
	if (!slug) {
		return res.status(400).json({ error: "Question slug is required" });
	}

	try {
		const question = await getQuestionFromSlug(slug);

		if (!question) {
			return res.status(404).json({ error: "Question not found" });
		}

		res.json(question);
		console.log(question);
	} catch (error) {
		console.error("Error in /question endpoint:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});
app.ws("/game", gameRouter);

const PORT = 3000 || process.env.PORT;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});