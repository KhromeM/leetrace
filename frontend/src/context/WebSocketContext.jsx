import {
	createContext,
	useContext,
	useEffect,
	useRef,
	useState,
	useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { BACKEND_WS_URL } from '../config';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
	const { user } = useAuth();
	const [isConnected, setIsConnected] = useState(false);
	const ws = useRef(null);
	const navigate = useNavigate();
	const [isMatchmaking, setIsMatchmaking] = useState(false);
	const [currentMatch, setCurrentMatch] = useState(null);

	const handleMessage = useCallback(
		(event) => {
			const data = JSON.parse(event.data);
			// console.log(data);

			switch (data.type) {
				case "MATCH_FOUND":
					setIsMatchmaking(false);
					setCurrentMatch(data.match);
					navigate("/compete");
					// window.location.href = "/compete";
					break;
				case "ERROR":
					console.error("WS Error:", data.message);
					break;
			}
		},
		[navigate]
	);

	const connect = useCallback(async () => {
		if (!user || ws.current) return;

		const idToken = await user.getIdToken();
		ws.current = new WebSocket(`${BACKEND_WS_URL}/game?token=${idToken}`);

		ws.current.onopen = () => {
			console.log("WebSocket connected");
			setIsConnected(true);
		};

		ws.current.onmessage = handleMessage;

		ws.current.onclose = () => {
			console.log("WebSocket disconnected");
			setIsConnected(false);
			ws.current = null;
			setIsMatchmaking(false);
		};

		ws.current.onerror = (error) => {
			console.error("WebSocket error:", error);
			ws.current = null;
			setIsMatchmaking(false);
		};
	}, [user, handleMessage]);

	const startMatchmaking = useCallback(async () => {
		if (!isConnected) {
			await connect();
		}
		setIsMatchmaking(true);
	}, [connect, isConnected]);

	const disconnect = () => {
		console.log("DISCONNECTING");
		if (ws.current) {
			ws.current.close();
			ws.current = null;
			setIsConnected(false);
			setIsMatchmaking(false);
		}
	};

	const cancelMatchmaking = useCallback(() => {
		disconnect();
	}, [disconnect]);

	useEffect(() => {
		if (!user) {
			disconnect();
		}
	}, [user]);

	const sendMessage = (message) => {
		if (ws.current?.readyState === 1) {
			ws.current.send(JSON.stringify(message));
		}
	};

	return (
		<WebSocketContext.Provider
			value={{
				isConnected,
				isMatchmaking,
				startMatchmaking,
				cancelMatchmaking,
				sendMessage,
				currentMatch,
				ws: ws.current,
			}}
		>
			{children}
		</WebSocketContext.Provider>
	);
};

export const useWebSocket = () => {
	const context = useContext(WebSocketContext);
	if (!context) {
		throw new Error("useWebSocket must be used within a WebSocketProvider");
	}
	return context;
};