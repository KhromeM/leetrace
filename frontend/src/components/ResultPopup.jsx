import { MatchResultMessage } from './MatchResult';

export const ResultPopup = ({ result, user, onClose }) => {
    if (!result) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-[#282828] rounded-lg shadow border border-[#3e3e3e] p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6 text-[#cccccc]">
                    Match Complete!
                </h2>
                <div className="space-y-4 mb-8">
                    {result.result === "timeout" ? (
                        <div>
                            <div className="text-center py-8 text-yellow-400">
                                <h1 className="text-6xl font-bold mb-4">TIME'S UP</h1>
                            </div>
                            <p className="text-xl text-center text-[#cccccc] mb-4">
                                ⌛ Time's up! Both players lose rating points.
                            </p>
                            <p className="text-lg text-red-400 font-medium text-center">
                                Rating change: -15
                            </p>
                        </div>
                    ) : (
                        <div>
                            <MatchResultMessage
                                winner={result.winner}
                                userId={user.uid}
                                endReason={result.endReason}
                            />
                            <p className={`text-lg font-medium text-center ${
                                result.winner === user.uid ? "text-green-400" : "text-red-400"
                            }`}>
                                Rating change: {result.winner === user.uid ? "+" : ""}
                                {result.winner === user.uid
                                    ? Math.abs(result.player1RatingChange >= 0
                                        ? result.player1RatingChange
                                        : result.player2RatingChange)
                                    : -Math.abs(result.player1RatingChange < 0
                                        ? result.player1RatingChange
                                        : result.player2RatingChange)}
                            </p>
                        </div>
                    )}
                </div>

                {result.winningSolution && (
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold mb-3 text-[#cccccc]">
                            Winning Solution:
                        </h3>
                        <pre className="bg-[#1e1e1e] p-6 rounded whitespace-pre-wrap text-[#cccccc] border border-[#3e3e3e] font-mono">
                            {result.winningSolution}
                        </pre>
                    </div>
                )}

                <div className="flex gap-4 mt-8">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-[#2cbb5d] text-white px-6 py-2 rounded hover:bg-[#227d3f] font-medium"
                    >
                        Continue Coding
                    </button>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="flex-1 bg-[#3e3e3e] text-white px-6 py-2 rounded hover:bg-[#4e4e4e] font-medium"
                    >
                        Back to Matchmaking
                    </button>
                </div>
            </div>
        </div>
    );
};