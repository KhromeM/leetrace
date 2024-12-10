import { useState, useEffect } from "react";
import {
	calculateWinProbability,
	calculatePotentialRatingChange,
} from "../utils/elo";

export const MatchStats = ({ match, currentUserId, question, onSurrender }) => {
	const [timeLeft, setTimeLeft] = useState(null);

	useEffect(() => {
		const updateTimeLeft = () => {
			if (match?.timeoutAt) {
				const now = Date.now();
				const remaining = Math.max(0, match.timeoutAt - now);
				setTimeLeft(Math.floor(remaining / 1000));
			}
		};

		const timer = setInterval(updateTimeLeft, 1000);
		updateTimeLeft();

		return () => clearInterval(timer);
	}, [match?.timeoutAt]);

	const player = match.players.find((p) => p.id === currentUserId);
	const opponent = match.players.find((p) => p.id !== currentUserId);

	const winChance = calculateWinProbability(player.rating, opponent.rating);
	const { winChange, lossChange } = calculatePotentialRatingChange(
		player.rating,
		opponent.rating
	);

	const getTimeColor = (seconds) => {
		if (seconds === null) return "text-white";
		if (seconds > 150) return "text-green-400";
		if (seconds > 60) return "text-yellow-400";
		return "text-red-400";
	};

	const formatTime = (seconds) => {
		if (seconds === null) return "--:--";
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	const getDifficultyColor = (difficulty) => {
		switch (difficulty?.toLowerCase()) {
			case "easy":
				return "text-green-400";
			case "medium":
				return "text-yellow-400";
			case "hard":
				return "text-red-400";
			default:
				return "text-gray-400";
		}
	};

	const handleSurrender = () => {
		if (
			window.confirm(
				"Are you sure you want to surrender? This will count as a loss."
			)
		) {
			onSurrender();
		}
	};

	return (
		<div className="bg-[#282828] rounded-lg shadow p-3 mb-4">
			<div className="flex flex-wrap items-start justify-between gap-4 text-sm">
				<div className="flex flex-wrap gap-4 md:gap-8">
					<div className="w-24">
						<div className="text-gray-400">Time Left</div>
						<div className={`font-mono ${getTimeColor(timeLeft)} font-bold`}>
							{formatTime(timeLeft)}
						</div>
					</div>
					<div className="w-24">
						<div className="text-gray-400">Your Rating</div>
						<div className="font-mono text-white">{player.rating}</div>
					</div>
					<div className="w-24">
						<div className="text-gray-400">Opponent Rating</div>
						<div className="font-mono text-white">{opponent.rating}</div>
					</div>
					<div className="w-24">
						<div className="text-gray-400">Win Probability</div>
						<div className="font-mono text-white">{winChance.toFixed(1)}%</div>
					</div>
					<div className="w-32">
						<div className="text-gray-400">Potential Change</div>
						<div className="font-mono">
							<span className="text-green-400">+{winChange}</span> /
							<span className="text-red-400">{lossChange}</span>
						</div>
					</div>
					{question && (
						<>
							<div className="w-24">
								<div className="text-gray-400">Question Rating</div>
								<div className="font-mono text-white">
									{question.rating || "N/A"}
								</div>
							</div>
							<div className="w-24">
								<div className="text-gray-400">Difficulty</div>
								<div
									className={`font-medium ${getDifficultyColor(
										question.difficulty
									)}`}
								>
									{question.difficulty || "N/A"}
								</div>
							</div>
						</>
					)}
				</div>
				{onSurrender && (
					<button
						onClick={handleSurrender}
						className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-medium"
					>
						Forfeit
					</button>
				)}
			</div>
		</div>
	);
};
