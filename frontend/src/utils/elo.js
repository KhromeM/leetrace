const K = 32;

export const calculateWinProbability = (playerRating, opponentRating) => {
	return (1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400))) * 100;
};

export const calculatePotentialRatingChange = (
	playerRating,
	opponentRating
) => {
	const expectedScore =
		calculateWinProbability(playerRating, opponentRating) / 100;

	const winChange = Math.round(K * (1 - expectedScore));
	const lossChange = Math.round(K * (0 - expectedScore));

	return { winChange, lossChange };
};

export const calculateEloChange = (playerRating, opponentRating, playerWon) => {
	const { winChange, lossChange } = calculatePotentialRatingChange(
		playerRating,
		opponentRating
	);

	const ratingChange = playerWon ? winChange : lossChange;
	const newRating = Math.max(100, playerRating + ratingChange);

	return {
		ratingChange,
		newRating,
	};
};
