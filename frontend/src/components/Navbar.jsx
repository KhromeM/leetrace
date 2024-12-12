import { useAuth } from "../context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { auth } from "../firebase/config";
import { signOut as firebaseSignOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { Menu, X } from "lucide-react";

export const Navbar = () => {
	const { user, signInWithGoogle } = useAuth();
	const location = useLocation();
	const [userRating, setUserRating] = useState(null);
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const handleSignOut = async () => {
		try {
			await firebaseSignOut(auth);
		} catch (error) {
			console.error("Error signing out:", error);
		}
	};

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
						{/* Desktop Navigation */}
						<div className="hidden md:flex ml-10 space-x-4">
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
							<div className="hidden md:flex items-center space-x-4">
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
								<button
									onClick={handleSignOut}
									className="bg-[#3e3e3e] hover:bg-[#4e4e4e] text-white px-4 py-2 rounded-md text-sm font-medium ml-4"
								>
									Log Out
								</button>
							</div>
						)}
						
						{/* Mobile menu button */}
						<div className="flex md:hidden ml-4">
							<button
								onClick={() => setIsMenuOpen(!isMenuOpen)}
								className="text-[#cccccc] hover:text-white"
							>
								{isMenuOpen ? (
									<X className="h-6 w-6" />
								) : (
									<Menu className="h-6 w-6" />
								)}
							</button>
						</div>
					</div>
				</div>

				{/* Mobile menu */}
				<div className={`md:hidden ${isMenuOpen ? "block" : "hidden"}`}>
					<div className="px-2 pt-2 pb-3 space-y-1">
						{navLinks.map((link) => (
							<Link
								key={link.path}
								to={link.path}
								onClick={() => setIsMenuOpen(false)}
								className={`block px-3 py-2 rounded-md text-base font-medium ${
									location.pathname === link.path
										? "bg-[#2d2d2d] text-white"
										: "text-[#8a8a8a] hover:bg-[#2d2d2d] hover:text-white"
								}`}
							>
								{link.label}
							</Link>
						))}
						{user && (
							<>
								<div className="flex items-center space-x-4 px-3 py-2">
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
								<button
									onClick={() => {
										handleSignOut();
										setIsMenuOpen(false);
									}}
									className="w-full px-3 py-2 mt-1 text-left rounded-md text-base font-medium bg-[#3e3e3e] hover:bg-[#4e4e4e] text-white"
								>
									Log Out
								</button>
							</>
						)}
					</div>
				</div>
			</div>
		</nav>
	);
};