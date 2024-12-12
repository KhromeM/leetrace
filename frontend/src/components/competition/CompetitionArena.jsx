import { useState, useEffect } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useWebSocket } from "../../context/WebSocketContext";
import { db } from "../../firebase/config";
import { doc, onSnapshot } from "firebase/firestore";
import { QuestionDisplay } from "../QuestionDisplay";
import { SolutionEditor } from "../SolutionEditor";
import { MatchStats } from "../MatchStats";
import { ResultPopup } from "../ResultPopup";
import { SolutionResultModal } from "../SolutionResultModal";
import { Countdown } from "./Countdown";

export const CompetitionArena = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const { user } = useAuth();
	const { ws, sendMessage, currentMatch } = useWebSocket();
	const [match, setMatch] = useState(currentMatch);
	const [solution, setSolution] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [result, setResult] = useState(null);
	const [matchStatus, setMatchStatus] = useState("countdown");
	const [countdown, setCountdown] = useState(null);
	const [question, setQuestion] = useState(null);
	const [opponent, setOpponent] = useState(null);
	const [showResult, setShowResult] = useState(false);
	const [showSolutionResult, setShowSolutionResult] = useState(false);
	const [solutionResult, setSolutionResult] = useState({ isCorrect: false, score: 0 });

	useEffect(() => {
		if (!match) {
			if (!currentMatch) {
				console.log("BACK TO HOME", ws, match);
				navigate("/");
			}
			return;
		}

		const handleMessage = (event) => {
			const data = JSON.parse(event.data);

			switch (data.type) {
				case "MATCH_COUNTDOWN":
					setCountdown(data.countdown);
					setOpponent({
						opponentName: data.opponentName,
						opponentPhotoURL: data.opponentPhotoURL,
					});
					break;

				case "MATCH_START":
					setMatchStatus("active");
					setQuestion(data.question);
					setMatch((prevMatch) => ({
						...prevMatch,
						...data.match,
					}));
					break;

				case "SOLUTION_DENIED":
					setIsSubmitting(false);
					setSolutionResult({ isCorrect: false, score: data.score });
					setShowSolutionResult(true);
					break;
			}
		};

		ws.addEventListener("message", handleMessage);

		const unsubscribe = onSnapshot(doc(db, "matches", match.id), (doc) => {
			const matchData = doc.data();
			if (matchData.status === "completed") {
				console.log("MATCH COMPLETED");
				setMatchStatus("completed");
				setResult(matchData);
				setShowResult(true);
			}
			setMatch(matchData);
		});

		return () => {
			unsubscribe();
			ws.removeEventListener("message", handleMessage);
		};
	}, [match?.id, navigate, currentMatch]);

	// Recover solution from local storage on initial load
	useEffect(() => {
		if (match?.id) {
			const savedSolution = localStorage.getItem(`solution-${match.id}`);
			if (savedSolution) {
				setSolution(savedSolution);
			}
		}
	}, [match?.id]);

	if (!match) {
		return <Navigate to="/" />;
	}

	if (matchStatus === "countdown") {
		return <Countdown countdown={countdown} opponent={opponent} />;
	}

	return (
		<>
			<div className="max-w-6xl mx-auto p-6">
				{(matchStatus === "active" || matchStatus === "completed") && question ? (
					<>
						<MatchStats
							match={match}
							currentUserId={user.uid}
							question={question}
							onSurrender={() => {
								sendMessage({
									type: "SURRENDER",
									matchId: match.id,
								});
							}}
						/>

						<div className="grid md:grid-cols-2 gap-6">
							<QuestionDisplay question={question} />
							<SolutionEditor
								onSubmit={(solution) => {
									console.log(solution);
									setIsSubmitting(true);
									sendMessage({
										type: "VERIFY_SOLUTION",
										matchId: match.id,
										solution,
									});
								}}
								isSubmitting={isSubmitting}
								matchId={match.id}
								initialSolution={solution}
							/>
						</div>
					</>
				) : (
					<div className="text-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
					</div>
				)}
			</div>

			{showResult && (
				<ResultPopup 
					result={result} 
					user={user} 
					onClose={() => setShowResult(false)} 
				/>
			)}

			<SolutionResultModal
				isOpen={showSolutionResult}
				onClose={() => setShowSolutionResult(false)}
				isCorrect={solutionResult.isCorrect}
				score={solutionResult.score}
			/>
		</>
	);
};