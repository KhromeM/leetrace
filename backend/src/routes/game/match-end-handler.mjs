import { db, FieldValue } from "../../firebase.mjs";
import { activeConnections } from "./state.mjs";
import { calculateEloChange } from "../../utils/elo.mjs";

export const handleMatchEnd = async (matchId, winnerId, reason, solution = null) => {
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

export const handleDisconnectSurrender = async (userId) => {
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