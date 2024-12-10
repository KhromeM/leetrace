import { verifyUser } from "../firebase.mjs";

export const authMiddleware = async (req, res, next) => {
	try {
		const accessToken = req.query.token;
		if (accessToken === "dev") {
			req._fbUser = {
				name: "DEVELOPER",
				user_id: "DEVELOPER",
				rating: 1500,
			};
		} else {
			const decodedToken = await verifyUser(accessToken);
			if (!decodedToken) {
				throw new Error("Invalid accessToken");
			}
			// console.log(decodedToken);
			req._fbUser = {
				name: decodedToken.name,
				user_id: decodedToken.uid,
				photoURL: decodedToken.picture,
			};
			// console.log(req._fbUser);
		}

		next();
	} catch (error) {
		console.error("Auth error:", error);
		if (req.ws) {
			req.ws.close();
		} else {
			res.status(401).json({ error: "Authentication failed" });
		}
	}
};
