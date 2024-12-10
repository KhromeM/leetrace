import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import admin from "firebase-admin";

const SA = await import(
	"../leetrace95-firebase-adminsdk-rpp61-e51707e757.json",
	{
		assert: { type: "json" },
	}
);
const serviceAccount = SA.default;

export const app = admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});

export const db = getFirestore(app);
export const auth = getAuth(app);
export const FieldValue = admin.firestore.FieldValue;

export const verifyUser = async (idToken) => {
	try {
		return await auth.verifyIdToken(idToken);
	} catch {
		return null;
	}
};
