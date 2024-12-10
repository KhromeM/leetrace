import { useAuth } from "../context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { doc, onSnapshot } from "firebase/firestore";

export const Navbar = () => {
	const { user, signInWithGoogle } = useAuth();
	const location = useLocation();
	const [userRating, setUserRating] = useState(null);

	useEffect(() => {
		if (user) {
			const unsubscribe = onSnapshot(doc(db, "users", user.uid), (doc) => {
				if (doc.exists()) {
					setUserRating(doc.data().rating);
				}
			});
			return () => unsubscribe();
		}
	}, [user]);

	const navLinks = [
		{ path: "/", label: "Play" },
		{ path: "/leaderboard", label: "Leaderboard" },
		{ path: "/history", label: "History" },
	];

	return (
		<nav className="bg-[#1e1e1e] border-b border-[#3e3e3e]">
			<div className="max-w-7xl mx-auto px-4">
				<div className="flex justify-between h-16">
					<div className="flex items-center">
						<Link to="/" className="flex-shrink-0 flex items-center">
							<span className="text-xl font-bold text-[#cccccc]">LeetRace</span>
						</Link>
						<div className="ml-10 flex space-x-4">
							{navLinks.map((link) => (
								<Link
									key={link.path}
									to={link.path}
									className={`px-3 py-2 rounded-md text-sm font-medium ${
										location.pathname === link.path
											? "bg-[#2d2d2d] text-white"
											: "text-[#8a8a8a] hover:bg-[#2d2d2d] hover:text-white"
									}`}
								>
									{link.label}
								</Link>
							))}
						</div>
					</div>
					<div className="flex items-center">
						{!user ? (
							<button
								onClick={signInWithGoogle}
								className="bg-[#2cbb5d] hover:bg-[#227d3f] text-white px-4 py-2 rounded-md text-sm font-medium"
							>
								Sign in with Google
							</button>
						) : (
							<div className="flex items-center space-x-4">
								<img
									src={user.photoURL}
									alt="Profile"
									className="h-8 w-8 rounded-full"
								/>
								<div className="text-sm">
									<div className="font-medium text-[#cccccc]">
										{user.displayName}
									</div>
									<div className="text-[#8a8a8a]">
										Rating: {userRating || "---"}
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</nav>
	);
};
