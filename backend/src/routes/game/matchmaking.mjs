import { handleMatch } from "./match-handler.mjs";
import {
    matchmakingPool,
    alreadyPaired,
    MAX_RATING_DIFF,
    MAX_WAIT_TIME,
    MATCHMAKING_INTERVAL
} from "./state.mjs";

export const startMatchmaking = () => {
    setInterval(async () => {
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
};