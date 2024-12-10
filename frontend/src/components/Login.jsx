import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const Login = () => {
	const { user, signInWithGoogle } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (user) {
			navigate("/");
		}
	}, [user, navigate]);

	return (
		<div className="min-h-[80vh] flex items-center justify-center">
			<div className="bg-white p-8 rounded-lg shadow-lg text-center">
				<h1 className="text-2xl font-bold mb-6">Welcome to LeetRace</h1>
				<p className="mb-6 text-gray-600">Sign in to start competing!</p>
				<button
					onClick={signInWithGoogle}
					className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors"
				>
					Sign in with Google
				</button>
			</div>
		</div>
	);
};
