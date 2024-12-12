import { useAuth } from "../context/AuthContext";

export const ProtectedRoute = ({ children }) => {
	const { user, loading } = useAuth();

	if (loading) {
		return (
			<div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2cbb5d]"></div>
			</div>
		);
	}

	return typeof children === 'function' ? children({ user }) : (user ? children : null);
};