import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { matchMessages } from "./MatchResult";
const taglines = [
	"Leetcode but even worse 🚨 ",
	"Where your code gets venture capital funding 💸",
	"Because your bugs need an audience 🐛",
	"Because coding interviews weren't stressful enough 😅",
	"Making your rubber duck proud 🦆",
	"Where Python is considered verbose 📝",
	"Where null references fear to tread 💀",
	"Turning coffee into competitive code ☕",
	"Where syntax errors become style choices 😎",
	"Where tabs vs spaces starts wars 🗡️",
	"Because your code deserves an audience 👀",
	"Where edge cases become center stage 🎭",
	"Making your keyboard question its life choices ⌨️",
	"Where array indices start at whatever you want 🔢",
	"Because your algorithms need a workout 💪",
	"Making parallel processing look sequential ⚡",
	"📱 Sam Altman is typing you a DM right now...",
	"✨ The intern just printed your code for inspiration",
	"📈 FAANG recruiters are spamming your LinkedIn",
	"📚 Your code is now required reading at bootcamps",
	"🏅 Stack Overflow is considering you for moderator",
	"🤖 Roko's Basilisk has issued a demand you begin AI research",
	'🎭 GPT has marked you as one of the "good" ones',
	"💰 Are you the next Wolf Gupta?",
	"🎭 Your code is getting a HBO adaptation",
	"🎪 The Docker container wants to be your friend",
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
	"🤔 The bug is between keyboard and chair",
	"🫣 The intern just rejected your PR",
	"📉 Your code is being used as a bad example in bootcamps",
	"😬 Even PHP developers are laughing",
	"😭  No wonder you didn't get the job...",
	"🫡  Oh... I heard plumbing pays well.",
	"☠️ Your code complexity: O(no)",
	"🎮 Time to go back to playing Minecraft",
	"🐌 Your performance makes bubble sort look optimized",
	"⚠️ Roko's Basilisk has requested you stay away from AI dev",
	"🤔 Have you considered becoming smart?",
	"🚨 Your code just became a cybersecurity threat",
	"😵 Your IDE is filing a restraining order",
	"🤖 The automated tests are demanding hazard pay",
	"🎨 Your code style is being studied by abstract artists",
];

export const Landing = () => {
	const { signInWithGoogle } = useAuth();
	const navigate = useNavigate();
	const [currentTagline, setCurrentTagline] = useState(taglines[0]);

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentTagline(taglines[Math.floor(Math.random() * taglines.length)]);
		}, 3000);
		return () => clearInterval(interval);
	}, []);

	const handleSignIn = async () => {
		try {
			await signInWithGoogle();
			navigate("/");
		} catch (error) {
			console.error("Error signing in:", error);
		}
	};

	return (
		<div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-[#1a1a1a] text-white px-4">
			<div className="max-w-3xl text-center">
				<h1 className="text-4xl sm:text-5xl font-bold mb-6 text-[#2cbb5d]">
					Welcome to LeetRace
				</h1>
				<p className="text-xl sm:text-2xl mb-8 text-[#cccccc] h-12">
					{currentTagline}
				</p>
				<div className="space-y-6 text-lg text-[#8a8a8a] mb-12">
					<p>🏃‍♂️ Race against other nerds and prove your superiority</p>
					<p>📈 Watch your rating climb (I swear its correlated with TC)</p>
					<p>🏆 Avoid grass</p>
				</div>
				<button
					onClick={handleSignIn}
					className="bg-[#2cbb5d] hover:bg-[#227d3f] text-white px-8 py-3 rounded-md text-lg font-medium transition-colors"
				>
					Start
				</button>
			</div>
		</div>
	);
};
