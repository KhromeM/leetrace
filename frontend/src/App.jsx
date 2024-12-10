import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { WebSocketProvider } from "./context/WebSocketContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Navbar } from "./components/Navbar";
import { MatchMaking } from "./components/MatchMaking";
import { CompetitionArena } from "./components/competition/CompetitionArena";
import { Leaderboard } from "./components/Leaderboard";
import { MatchHistory } from "./components/history/MatchHistory";
import { MatchReview } from "./components/history/MatchReview";

export default function App() {
	return (
		<AuthProvider>
			<Router>
				<WebSocketProvider>
					<div className="min-h-screen bg-[#1a1a1a]">
						<Navbar />
						<Routes>
							<Route
								path="/"
								element={
									<ProtectedRoute>
										<MatchMaking />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/compete"
								element={
									<ProtectedRoute>
										<CompetitionArena />
									</ProtectedRoute>
								}
							/>
							<Route path="/leaderboard" element={<Leaderboard />} />
							<Route
								path="/history"
								element={
									<ProtectedRoute>
										<MatchHistory />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/history/:matchId"
								element={
									<ProtectedRoute>
										<MatchReview />
									</ProtectedRoute>
								}
							/>
						</Routes>
					</div>
				</WebSocketProvider>
			</Router>
		</AuthProvider>
	);
}
