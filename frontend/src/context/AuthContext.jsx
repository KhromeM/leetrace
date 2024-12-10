import React, { createContext, useState, useContext, useEffect } from "react";
import { auth } from "../firebase/config";
import {
	onAuthStateChanged,
	signInWithPopup,
	GoogleAuthProvider,
} from "firebase/auth";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			setUser(user);
			setLoading(false);
		});

		return unsubscribe;
	}, []);

	const signInWithGoogle = async () => {
		const provider = new GoogleAuthProvider();
		try {
			const result = await signInWithPopup(auth, provider);
			return result.user;
		} catch (error) {
			console.error("Auth error:", error);
			throw error;
		}
	};

	return (
		<AuthContext.Provider value={{ user, signInWithGoogle, loading }}>
			{!loading && children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);
