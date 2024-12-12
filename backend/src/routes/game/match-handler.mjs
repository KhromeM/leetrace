import { v4 as uuidv4 } from "uuid";
import { db } from "../../firebase.mjs";
import { getRandomQuestion } from "../../services/questions.mjs";
import { activeConnections } from "./state.mjs";
import { handleMatchEnd } from "./match-end-handler.mjs";

export const startMatch = async (matchId, player1Ws, player2Ws) => {
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

export const handleMatch = async (player1, player2) => {
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