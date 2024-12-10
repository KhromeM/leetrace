import { useState, useEffect } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useWebSocket } from "../../context/WebSocketContext";
import { db } from "../../firebase/config";
import { doc, onSnapshot } from "firebase/firestore";
import { QuestionDisplay } from "../QuestionDisplay";
import { SolutionEditor } from "../SolutionEditor";
import { MatchStats } from "../MatchStats";
import { MatchResult } from "../MatchResult";
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

	useEffect(() => {
		if (!match) {
			console.log("BACK TO HOME", ws, match);
			navigate("/");
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
					alert(`Solution not accepted.`);
					break;

				// case "SOLUTION_VERIFIED":
				// 	setIsSubmitting(false);
				// 	alert(`Solution accepted!\n ${data.feedback}`);
				// 	break;
			}
		};

		ws.addEventListener("message", handleMessage);

		const unsubscribe = onSnapshot(doc(db, "matches", match.id), (doc) => {
			const matchData = doc.data();
			if (matchData.status === "completed") {
				console.log("MATCH COMPLETED");
				setMatchStatus("completed");
				setResult(matchData);
			}
			setMatch(matchData);
		});

		return () => {
			unsubscribe();
			ws.removeEventListener("message", handleMessage);
		};
	}, [match?.id, navigate]);

	if (!match) {
		return <Navigate to="/" />;
	}

	if (matchStatus === "countdown") {
		return <Countdown countdown={countdown} opponent={opponent} />;
	}

	if (matchStatus === "completed") {
		return <MatchResult result={result} user={user} match={match} />;
	}

	if (matchStatus === "active" && question) {
		return (
			<div className="max-w-6xl mx-auto p-6">
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
					/>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-2xl mx-auto p-6 text-center">
			<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
		</div>
	);
};
