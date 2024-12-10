import express from "express";
import expressWs from "express-ws";
import { db, FieldValue } from "../firebase.mjs";
import {
	getRandomQuestion,
	getQuestionFromSlug,
} from "../services/questions.mjs";
import { calculateEloChange } from "../utils/elo.mjs";
import { verifyUserSolution } from "../services/ai.mjs";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();
expressWs(router);

const activeConnections = new Map();
let matchmakingPool = new Set();
const alreadyPaired = new Set();

const MAX_RATING_DIFF = 300;
const MAX_WAIT_TIME = 60000;
const MATCHMAKING_INTERVAL = 2000;

const handleMatchEnd = async (matchId, winnerId, reason, solution = null) => {
	const matchRef = db.collection("matches").doc(matchId);
	const match = (await matchRef.get()).data();

	if (match.status !== "active") return;

	const player1 = match.players[0];
	const player2 = match.players[1];

	const player1Ws = activeConnections.get(player1.id);
	const player2Ws = activeConnections.get(player2.id);

	const player1Ref = db.collection("users").doc(player1.id);
	let player1Doc = (await player1Ref.get()).data();

	const player2Ref = db.collection("users").doc(player2.id);
	let player2Doc = (await player2Ref.get()).data();

	const isPlayer1Winner = player1.id === winnerId;
	const { ratingChange: player1Delta } = calculateEloChange(
		player1.rating,
		player2.rating,
		isPlayer1Winner
	);
	const { ratingChange: player2Delta } = calculateEloChange(
		player2.rating,
		player1.rating,
		!isPlayer1Winner
	);

	const batch = db.batch();

	const matchUpdate = {
		status: "completed",
		winner: winnerId,
		player1RatingChange: player1Delta,
		player2RatingChange: player2Delta,
		endTime: Date.now(),
		endReason: reason,
	};

	if (solution) {
		matchUpdate.winningSolution = solution;
	}
	batch.update(matchRef, matchUpdate);

	batch.update(db.collection("users").doc(player1.id), {
		rating: player1.rating + player1Delta,
		matches: FieldValue.arrayUnion({
			question: match.question,
			date: Date.now(),
			matchId,
			score: match.player1Score,
			isWin: player1.id == winnerId,
			opponentName: player2Doc.name,
			opponentPhotoURL: player2Doc.photoURL,
		}),
	});

	batch.update(db.collection("users").doc(player2.id), {
		rating: player2.rating + player2Delta,
		matches: FieldValue.arrayUnion({
			question: match.question,
			date: Date.now(),
			matchId,
			score: match.player2Score,
			isWin: player2.id == winnerId,
			opponentName: player1Doc.name,
			opponentPhotoURL: player1Doc.photoURL,
		}),
	});

	await batch.commit();
	player1Ws?.close();
	player2Ws?.close();
};

const startMatch = async (matchId, player1Ws, player2Ws) => {
	try {
		const question = await getRandomQuestion();
		const now = Date.now();

		const matchUpdate = {
			status: "active",
			question: question.slug,
			startTime: now,
			timeoutAt: now + 10 * 60 * 1000 + 3000, // 10 minutes
			player1Score: 0,
			player2Score: 0,
		};

		await db.collection("matches").doc(matchId).update(matchUpdate);

		const startMsg = JSON.stringify({
			type: "MATCH_START",
			question: question,
			match: { id: matchId, ...matchUpdate },
		});

		if (player1Ws?.readyState === 1) player1Ws.send(startMsg);
		if (player2Ws?.readyState === 1) player2Ws.send(startMsg);

		// No winner after timeout
		setTimeout(async () => {
			const matchRef = db.collection("matches").doc(matchId);
			const matchData = (await matchRef.get()).data();

			if (matchData.status === "active") {
				await handleMatchEnd(matchId, null, "timeout");
			}
		}, 5 * 60 * 1000);
	} catch (error) {
		console.error("Error starting match:", error);
	}
};

// add match to db and start countdown
const handleMatch = async (player1, player2) => {
	try {
		const match = {
			id: uuidv4(),
			players: [
				{
					id: player1.user_id,
					rating: player1.rating,
					name: player1.name,
				},
				{
					id: player2.user_id,
					rating: player2.rating,
					name: player2.name,
				},
			],
			status: "countdown",
			startTime: Date.now(),
		};

		await db.collection("matches").doc(match.id).set(match);

		const player1Ws = activeConnections.get(player1.user_id);
		const player2Ws = activeConnections.get(player2.user_id);

		const matchFoundMsg = JSON.stringify({
			type: "MATCH_FOUND",
			match,
		});

		if (player1Ws?.readyState === 1) player1Ws.send(matchFoundMsg);
		if (player2Ws?.readyState === 1) player2Ws.send(matchFoundMsg);

		let countdown = 5; // change countdown
		const countdownInterval = setInterval(() => {
			const countdownMsg = {
				type: "MATCH_COUNTDOWN",
				countdown,
			};

			if (player1Ws?.readyState === 1)
				player1Ws.send(
					JSON.stringify({
						...countdownMsg,
						opponentName: player2.name,
						opponentPhotoURL: player2.photoURL,
					})
				);
			if (player2Ws?.readyState === 1)
				player2Ws.send(
					JSON.stringify({
						...countdownMsg,
						opponentName: player1.name,
						opponentPhotoURL: player1.photoURL,
					})
				);

			countdown--;

			if (countdown <= 0) {
				clearInterval(countdownInterval);
				startMatch(match.id, player1Ws, player2Ws);
			}
		}, 1000);
	} catch (error) {
		console.error("Error handling match:", error);
	}
};

// Matchmaking
setInterval(async () => {
	console.log(matchmakingPool);
	let matchmakingQueue = Array.from(matchmakingPool);
	try {
		matchmakingQueue.sort((a, b) => a.rating - b.rating);
		alreadyPaired.clear();

		for (let i = 0; i < matchmakingQueue.length - 1; i++) {
			const player1 = matchmakingQueue[i];
			const player2 = matchmakingQueue[i + 1];

			if (alreadyPaired.has(player1.user_id)) {
				continue;
			}

			const ratingDiff = Math.abs(player1.rating - player2.rating);
			const player1TimeInQueue = Date.now() - player1.joinedAt;
			const player2TimeInQueue = Date.now() - player2.joinedAt;

			const longerWaitTime = Math.max(player1TimeInQueue, player2TimeInQueue);
			const adjustedMaxDiff = Math.max(
				MAX_RATING_DIFF,
				MAX_RATING_DIFF * (1 + longerWaitTime / MAX_WAIT_TIME)
			);

			if (ratingDiff <= adjustedMaxDiff) {
				alreadyPaired.add(player1.user_id);
				alreadyPaired.add(player2.user_id);
				await handleMatch(player1, player2);
			}
		}

		matchmakingPool = new Set(
			matchmakingQueue.filter((player) => !alreadyPaired.has(player.user_id))
		);
	} catch (error) {
		console.error("Error in matchmaking interval:", error);
	}
}, MATCHMAKING_INTERVAL);

const handleDisconnectSurrender = async (userId) => {
	try {
		const matchesRef = db.collection("matches");
		const matchSnapshot = await matchesRef
			.where("status", "==", "active")
			.where("players", "array-contains", { id: userId })
			.limit(1)
			.get();

		if (!matchSnapshot.empty) {
			const match = matchSnapshot.docs[0];
			const matchData = match.data();
			const winner = matchData.players.find((p) => p.id !== userId);
			await handleMatchEnd(match.id, winner.id, "disconnect");
		}
	} catch (error) {
		console.error("Error handling disconnect surrender:", error);
	}
};

export default async function (ws, req) {
	const user = {
		...req._fbUser,
		joinedAt: Date.now(),
	};

	if (activeConnections.has(user.user_id)) {
		// maybe reploace with the new connection ?
		console.log("User already has active connection");
		ws.close();
		return;
	}

	const userRef = db.collection("users").doc(user.user_id);
	let userDoc = await userRef.get();
	if (!userDoc.exists) {
		await userRef.set({
			name: user.name,
			rating: 1000,
			matches: [],
			photoURL: user.photoURL,
		});
		userDoc = await userRef.get();
	}

	user.rating = userDoc.data().rating;

	activeConnections.set(user.user_id, ws);
	matchmakingPool.add(user);

	ws.on("message", async (msg) => {
		try {
			const data = JSON.parse(msg);

			switch (data.type) {
				case "VERIFY_SOLUTION": {
					const matchDoc = await db
						.collection("matches")
						.doc(data.matchId)
						.get();
					if (!matchDoc.exists || matchDoc.data().status !== "active") {
						ws.send(
							JSON.stringify({
								type: "ERROR",
								message: "Invalid match",
							})
						);
						return;
					}

					const match = matchDoc.data();
					const questionBody = await getQuestionFromSlug(match.question);
					const result = await verifyUserSolution(data.solution, questionBody);

					const isPlayer1 = match.players[0].id === user.user_id;
					const scoreField = isPlayer1 ? "player1Score" : "player2Score";
					const solutionField = isPlayer1
						? "player1Solution"
						: "player2Solution";

					await db
						.collection("matches")
						.doc(data.matchId)
						.update({
							[scoreField]: result.score,
							[solutionField]: data.solution,
						});

					if (result.score >= 3) {
						await handleMatchEnd(
							data.matchId,
							user.user_id,
							"solution",
							data.solution
						);
					} else {
						ws.send(
							JSON.stringify({
								type: "SOLUTION_DENIED",
								...result,
							})
						);
					}
					break;
				}

				case "SURRENDER": {
					const match = (
						await db.collection("matches").doc(data.matchId).get()
					).data();
					const winner = match.players.find((p) => p.id !== user.user_id);
					await handleMatchEnd(data.matchId, winner.id, "surrender");
					break;
				}
			}
		} catch (error) {
			console.error("WebSocket message error:", error);
			ws.send(
				JSON.stringify({
					type: "ERROR",
					message: "Internal server error",
				})
			);
		}
	});

	ws.on("close", async () => {
		console.log(`User ${user.user_id} disconnected`);
		await handleDisconnectSurrender(user.user_id);
		activeConnections.delete(user.user_id);
		matchmakingPool.delete(user);
	});
}
