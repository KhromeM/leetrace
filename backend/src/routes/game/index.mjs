import express from "express";
import expressWs from "express-ws";
import { db } from "../../firebase.mjs";
import { getQuestionFromSlug } from "../../services/questions.mjs";
import { verifyUserSolution } from "../../services/ai.mjs";
import { activeConnections, matchmakingPool } from "./state.mjs";
import { handleMatchEnd, handleDisconnectSurrender } from "./match-end-handler.mjs";
import { startMatchmaking } from "./matchmaking.mjs";

const router = express.Router();
expressWs(router);

// Start the matchmaking system
startMatchmaking();

export default async function (ws, req) {
    const user = {
        ...req._fbUser,
        joinedAt: Date.now(),
    };

    if (activeConnections.has(user.user_id)) {
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