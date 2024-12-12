import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/config";
import { doc, onSnapshot } from "firebase/firestore";
import Question from "../Question";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from '../../config';

const MatchCard = ({ match }) => {
	const { user } = useAuth();
	const [showDetails, setShowDetails] = useState(false);
	const [questionDetails, setQuestionDetails] = useState(null);
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const isWin = match.score >= 3;
	const isLoss = !isWin;

	const fetchQuestionDetails = async () => {
		if (!showDetails || questionDetails || !user) return;
		const idToken = await user.getIdToken();

		setLoading(true);
		try {
			const response = await fetch(
				`${BACKEND_URL}/question?slug=${match.question}&token=${idToken}`
			);
			if (!response.ok) throw new Error("Failed to fetch question");
			const data = await response.json();
			setQuestionDetails(data);
		} catch (error) {
			console.error("Error fetching question:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchQuestionDetails();
	}, [showDetails]);

	return (
		<div
			className={`bg-[#282828] rounded-lg shadow border border-[#3e3e3e] mb-4 ${
				isWin
					? "border-l-4 border-l-green-500"
					: isLoss
					? "border-l-4 border-l-red-500"
					: ""
			}`}
		>
			<div
				className="p-4 cursor-pointer flex justify-between items-center"
				onClick={() => navigate(`/history/${match.matchId}`)}
			>
				<div className="flex-1">
					<h3 className="text-lg font-medium text-[#cccccc] mb-1">
						{match.question}
					</h3>
					<p className="text-sm text-[#8a8a8a]">
						{new Date(match.date).toLocaleString()}
					</p>
				</div>

				<div className="flex items-center gap-6">
					<div
						className={`text-lg font-medium ${
							isWin
								? "text-green-400"
								: isLoss
								? "text-red-400"
								: "text-[#cccccc]"
						}`}
					>
						{isWin ? "Victory" : isLoss ? "Defeat" : "N/A"}
					</div>

					<div className="text-right">
						<div className="flex items-center gap-2">
							<img
								src={match.opponentPhotoURL}
								alt={match.opponentName}
								className="w-6 h-6 rounded-full"
							/>
							<span className="text-[#cccccc]">{match.opponentName}</span>
						</div>
						{/* <p className="text-sm">
							<span className="text-[#8a8a8a]">Rating: </span>
							<span className="text-[#cccccc]">{match.rating}</span>
						</p> */}
					</div>
				</div>
			</div>

			{showDetails && (
				<div className="border-t border-[#3e3e3e] p-4">
					{loading ? (
						<div className="flex justify-center py-8">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2cbb5d]"></div>
						</div>
					) : questionDetails ? (
						<div className="bg-[#1e1e1e] rounded p-4">
							<Question markdown={questionDetails.content} />
						</div>
					) : (
						<p className="text-[#8a8a8a]">Failed to load question details</p>
					)}
				</div>
			)}
		</div>
	);
};

export const MatchHistory = () => {
	const [matches, setMatches] = useState([]);
	const [loading, setLoading] = useState(true);
	const { user } = useAuth();

	useEffect(() => {
		if (!user) return;

		const unsubscribe = onSnapshot(doc(db, "users", user.uid), (doc) => {
			if (doc.exists()) {
				const userData = doc.data();
				const sortedMatches = [...(userData.matches || [])].sort(
					(a, b) => b.date - a.date
				);
				setMatches(sortedMatches);
			}
			setLoading(false);
		});

		return () => unsubscribe();
	}, [user]);

	if (loading) {
		return (
			<div className="max-w-4xl mx-auto p-6 text-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2cbb5d] mx-auto"></div>
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto p-6">
			<h2 className="text-2xl font-bold mb-6 text-[#cccccc]">Match History</h2>

			{matches.length === 0 ? (
				<p className="text-[#8a8a8a] text-center">No matches found.</p>
			) : (
				<div>
					{matches.map((match, index) => (
						<MatchCard key={match.matchId || index} match={match} />
					))}
				</div>
			)}
		</div>
	);
};