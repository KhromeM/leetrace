import React, { useState, useEffect } from "react";
import { db } from "../firebase/config";
import {
	collection,
	query,
	orderBy,
	limit,
	onSnapshot,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

export const Leaderboard = () => {
	const [topPlayers, setTopPlayers] = useState([]);
	const [loading, setLoading] = useState(true);
	const { user } = useAuth();

	useEffect(() => {
		const q = query(
			collection(db, "users"),
			orderBy("rating", "desc"),
			limit(20)
		);

		const unsubscribe = onSnapshot(q, (snapshot) => {
			const players = snapshot.docs.map((doc, index) => ({
				id: doc.id,
				rank: index + 1,
				...doc.data(),
			}));
			setTopPlayers(players);
			setLoading(false);
		});

		return () => unsubscribe();
	}, []);

	if (loading) {
		return (
			<div className="max-w-2xl mx-auto p-4 sm:p-6 text-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
			</div>
		);
	}

	return (
		<div className="max-w-2xl mx-auto p-4 sm:p-6">
			<h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-[#cccccc]">Top Players</h2>

			<div className="bg-[#282828] shadow-lg rounded-lg overflow-hidden border border-[#3e3e3e]">
				<div className="grid grid-cols-4 bg-[#1e1e1e] p-3 sm:p-4 font-semibold border-b border-[#3e3e3e] text-sm sm:text-base">
					<div className="text-[#cccccc]">Rank</div>
					<div className="col-span-2 text-[#cccccc]">Player</div>
					<div className="text-right text-[#cccccc]">Rating</div>
				</div>

				{topPlayers.map((player) => (
					<div
						key={player.id}
						className={`grid grid-cols-4 p-3 sm:p-4 border-b border-[#3e3e3e] hover:bg-[#2d2d2d] text-sm sm:text-base ${
							player.id === user?.uid ? "bg-[#1e1e1e]" : ""
						}`}
					>
						<div className="flex items-center text-[#cccccc]">
							{player.rank === 1 && "🥇"}
							{player.rank === 2 && "🥈"}
							{player.rank === 3 && "🥉"}
							{player.rank > 3 && player.rank}
						</div>
						<div className="col-span-2 flex items-center text-[#cccccc] min-w-0">
							<img
								src={player.photoURL}
								alt=""
								className="w-6 h-6 rounded-full mr-2 flex-shrink-0"
								onError={(e) => {
									e.target.src = "/default-avatar.png";
								}}
							/>
							<span className="truncate">
								{player.name}
								{player.id === user?.uid && " (You)"}
							</span>
						</div>
						<div className="text-right font-mono text-[#cccccc]">
							{player.rating || 1000}
						</div>
					</div>
				))}
			</div>

			{/* Stats Section */}
			<div className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:gap-4">
				<div className="bg-[#282828] p-3 sm:p-4 rounded-lg shadow border border-[#3e3e3e]">
					<h3 className="text-xs sm:text-sm font-semibold text-[#8a8a8a] mb-1">
						Total Players
					</h3>
					<p className="text-xl sm:text-2xl font-bold text-[#cccccc]">
						{topPlayers.length}
					</p>
				</div>
				<div className="bg-[#282828] p-3 sm:p-4 rounded-lg shadow border border-[#3e3e3e]">
					<h3 className="text-xs sm:text-sm font-semibold text-[#8a8a8a] mb-1">
						Your Rank
					</h3>
					<p className="text-xl sm:text-2xl font-bold text-[#cccccc]">
						{topPlayers.find((p) => p.id === user?.uid)?.rank || "-"}
					</p>
				</div>
			</div>
		</div>
	);
};