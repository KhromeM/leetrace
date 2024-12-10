import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWebSocket } from "../context/WebSocketContext";

export const MatchMaking = () => {
	const [status, setStatus] = useState("idle");
	const navigate = useNavigate();
	const { isConnected, isMatchmaking, startMatchmaking, cancelMatchmaking } =
		useWebSocket();

	return (
		<div className="p-6 max-w-2xl mx-auto">
			<div
				className={`
			${isMatchmaking ? "animate-pulse" : ""}
			p-6 rounded-lg bg-[#282828] border border-[#3e3e3e]
		  `}
			>
				<h2 className="text-xl font-bold mb-4 text-[#cccccc]">
					{!isMatchmaking && "Ready to compete"}
					{isMatchmaking && "Searching for opponent..."}
				</h2>
				{!isMatchmaking ? (
					<button
						onClick={startMatchmaking}
						className="bg-[#2cbb5d] text-white px-4 py-2 rounded hover:bg-[#227d3f]"
					>
						Find Match
					</button>
				) : (
					<button
						onClick={cancelMatchmaking}
						className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
					>
						Cancel
					</button>
				)}
			</div>
		</div>
	);
};
