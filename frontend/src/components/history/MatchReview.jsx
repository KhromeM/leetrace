import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { QuestionDisplay } from "../QuestionDisplay";
import { SolutionEditor } from "../SolutionEditor";
import { MatchStats } from "../MatchStats";
import { db } from "../../firebase/config";
import { doc, onSnapshot } from "firebase/firestore";

export const MatchReview = () => {
	const { matchId } = useParams();
	const navigate = useNavigate();
	const { user } = useAuth();
	const [match, setMatch] = useState(null);
	const [question, setQuestion] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [solution, setSolution] = useState("");

	useEffect(() => {
		let unsubscribe;

		const fetchMatchDetails = async () => {
			if (!user || !matchId) return;

			try {
				// Get stored solution if any
				const storedSolution = localStorage.getItem(`solution-${matchId}`);
				if (storedSolution) {
					setSolution(storedSolution);
				}

				// Subscribe to match document
				unsubscribe = onSnapshot(
					doc(db, "matches", matchId),
					async (docSnapshot) => {
						if (docSnapshot.exists()) {
							const matchData = docSnapshot.data();
							setMatch(matchData);

							// Fetch question details
							if (matchData.question) {
								const idToken = await user.getIdToken();
								// const response = await fetch(
								// 	`http://localhost:3000/question?slug=${matchData.question}&token=${idToken}`
								// );
								const response = await fetch(
									`https://backend-bitter-log-4782.fly.dev/question?slug=${matchData.question}&token=${idToken}`
								);

								if (!response.ok) throw new Error("Failed to fetch question");
								const questionData = await response.json();
								setQuestion(questionData);
							}
						} else {
							setError("Match not found");
						}
						setLoading(false);
					},
					(error) => {
						console.error("Error fetching match:", error);
						setError("Failed to load match");
						setLoading(false);
					}
				);
			} catch (error) {
				console.error("Error in fetchMatchDetails:", error);
				setError(error.message);
				setLoading(false);
			}
		};

		fetchMatchDetails();

		return () => {
			if (unsubscribe) {
				unsubscribe();
			}
		};
	}, [matchId, user]);

	if (loading) {
		return (
			<div className="max-w-6xl mx-auto p-6">
				<div className="flex items-center justify-center min-h-[60vh]">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2cbb5d]"></div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="max-w-6xl mx-auto p-6">
				<div className="bg-[#282828] rounded-lg shadow p-6 text-center">
					<p className="text-red-400 mb-4">{error}</p>
					<button
						onClick={() => navigate("/history")}
						className="bg-[#2cbb5d] text-white px-4 py-2 rounded hover:bg-[#227d3f]"
					>
						Back to History
					</button>
				</div>
			</div>
		);
	}

	if (!match || !question) {
		return (
			<div className="max-w-6xl mx-auto p-6">
				<div className="bg-[#282828] rounded-lg shadow p-6 text-center">
					<p className="text-[#cccccc] mb-4">Match not found</p>
					<button
						onClick={() => navigate("/history")}
						className="bg-[#2cbb5d] text-white px-4 py-2 rounded hover:bg-[#227d3f]"
					>
						Back to History
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-6xl mx-auto p-6">
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-xl font-bold text-[#cccccc]">Match Review</h2>
				<button
					onClick={() => navigate("/history")}
					className="text-[#cccccc] hover:text-white"
				>
					Back to History
				</button>
			</div>

			<MatchStats match={match} currentUserId={user.uid} question={question} />

			<div className="grid md:grid-cols-2 gap-6">
				<QuestionDisplay question={question} />
				<SolutionEditor
					matchId={matchId}
					readOnly={true}
					initialSolution={solution}
				/>
			</div>
		</div>
	);
};
