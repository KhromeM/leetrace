import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export const matchMessages = {
	wins: [
		"💸 Your code just got venture capital funding",
		"📱 Sam Altman is typing you a DM right now...",
		"✨ The intern just printed your code for inspiration",
		"👑 Your variable names are being studied by scholars",
		"📝 Your code read like poetry",
		"✅ Victory! Your code passed all test cases, including life itself",
		"📈 FAANG recruiters are spamming your LinkedIn",
		"🏺 Your commit messages belong in a museum",
		"🧩 You won! Your neural networks are showing",
		"📚 Your code is now required reading at bootcamps",
		"⚡ Victory! You just downloaded more skill points",
		"🌟 Victory! ChatGPT just asked for your autograph",
		"🏅 Stack Overflow is considering you for moderator",
		"✨ Your PR got merged without any comments",
		"🤖 Roko's Basilisk has issued a demand you begin AI research",
		'🎭 GPT has marked you as one of the "good" ones',
		"💰 Are you the next Wolf Gupta?",
		"🎓 Stanford just added your solution to their curriculum",
		"🌟 Prettier refused to change your perfect code",
		"🔮 Your debug logs read like Shakespeare",
		"🎸 Your code review is being used as ASMR",
		"🎭 Your code is getting a HBO adaptation",
		"🎪 The microservices are forming a cult around your code",
		"🎪 The Docker container wants to be your friend",
	],
	surrenders: [
		"🫠 Your algorithms called - they're taking a mental health day",
		"💔 Your IDE just filed for emotional damage",
		"😵‍💫 JavaScript has more promises than you",
		"🪦 Error 404: Determination not found",
		"📸 Your Git history will remember this moment",
		"⬇️ You've been demoted to HTML developer",
		"😩 npm install motivation --save",
		"😭 Even WordPress developers are judging you",
		"⛔ Your Stack Overflow privileges are under review",
		"🫥 Your code review: 'Needs more backbone'",
		"🆘 sudo apt-get install confidence",
		"🏃‍♂️ git commit -m 'Giving up for now, brb'",
		"😶 The intern is offering you mentorship",
		"🫡 Guess you ain't built for this",
		"😵 Your IDE just enabled extra training wheels",
		"😭 Your keyboard is requesting a transfer",
		"🫨 A bootcamper is offering to show you the ropes",
	],

	losses: [
		"🤔 The bug is between keyboard and chair",
		"🫣 The intern just rejected your PR",
		"📉 Your code is being used as a bad example in bootcamps",
		"🤪 You lost! Your code just uninstalled itself in protest",
		"😬 Even PHP developers are laughing",
		"😭  No wonder you didn't get the job...",
		"🫡  Oh... I heard plumbing pays well.",
		"☠️ Your code complexity: O(no)",
		"😩 You lost! Your compiler is filing for emotional support",
		"🎮 Time to go back to playing Minecraft",
		"🐌 Your performance made bubble sort look optimized",
		"⚠️ Roko's Basilisk has requested you stay away from AI dev",
		"🤔 Have you considered becoming smart?",
		"🚨 Your code just became a cybersecurity threat",
		"😵 Your IDE is filing a restraining order",
		"🤖 The automated tests are demanding hazard pay",
		"🎨 Your code style is being studied by abstract artists",
	],
};

export const MatchResultMessage = ({ winner, userId, endReason }) => {
	const [message, setMessage] = useState("");

	useEffect(() => {
		if (winner === userId) {
			setMessage(
				matchMessages.wins[
					Math.floor(Math.random() * matchMessages.wins.length)
				]
			);
		} else if (endReason === "surrender") {
			setMessage(
				matchMessages.surrenders[
					Math.floor(Math.random() * matchMessages.surrenders.length)
				]
			);
		} else {
			setMessage(
				matchMessages.losses[
					Math.floor(Math.random() * matchMessages.losses.length)
				]
			);
		}
	}, [winner, userId, endReason]);

	return (
		<>
			<div
				className={`text-center py-8 ${
					winner === userId ? "text-green-400" : "text-red-400"
				}`}
			>
				<h1 className="text-6xl font-bold mb-4">
					{winner === userId
						? endReason === "surrender"
							? "OPPONENT SURRENDERED"
							: "VICTORY"
						: endReason === "surrender"
						? "SURRENDERED"
						: "DEFEAT"}
				</h1>
			</div>
			<p className="text-xl text-center text-[#cccccc] mb-4">{message}</p>
		</>
	);
};

export const MatchResult = ({ result, user }) => {
	const navigate = useNavigate();

	return (
		<div className="max-w-4xl mx-auto p-6">
			<div className="bg-[#282828] rounded-lg shadow border border-[#3e3e3e] p-8">
				<h2 className="text-2xl font-bold mb-6 text-[#cccccc]">
					Match Complete!
				</h2>
				<div className="space-y-4 mb-8">
					{result.result === "timeout" ? (
						<div>
							<div className="text-center py-8 text-yellow-400">
								<h1 className="text-6xl font-bold mb-4">TIME'S UP</h1>
							</div>
							<p className="text-xl text-center text-[#cccccc] mb-4">
								⌛ Time's up! Both players lose rating points.
							</p>
							<p className="text-lg text-red-400 font-medium text-center">
								Rating change: -15
							</p>
						</div>
					) : (
						<div>
							<MatchResultMessage
								winner={result.winner}
								userId={user.uid}
								endReason={result.endReason}
							/>
							<p
								className={`text-lg font-medium text-center ${
									result.winner === user.uid ? "text-green-400" : "text-red-400"
								}`}
							>
								Rating change: {result.winner === user.uid ? "+" : ""}
								{result.winner === user.uid
									? Math.abs(
											result.player1RatingChange >= 0
												? result.player1RatingChange
												: result.player2RatingChange
									  )
									: -Math.abs(
											result.player1RatingChange < 0
												? result.player1RatingChange
												: result.player2RatingChange
									  )}
							</p>
						</div>
					)}
				</div>

				{result.winningSolution && (
					<div className="mt-8">
						<h3 className="text-lg font-semibold mb-3 text-[#cccccc]">
							Winning Solution:
						</h3>
						<pre className="bg-[#1e1e1e] p-6 rounded whitespace-pre-wrap text-[#cccccc] border border-[#3e3e3e] font-mono">
							{result.winningSolution}
						</pre>
					</div>
				)}

				<button
					onClick={() => navigate("/")}
					className="mt-8 bg-[#2cbb5d] text-white px-6 py-2 rounded hover:bg-[#227d3f] font-medium w-full"
				>
					Back to Matchmaking
				</button>
			</div>
		</div>
	);
};
