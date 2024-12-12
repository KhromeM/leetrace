import { resultMessages } from '../utils/resultMessages';

export const SolutionResultModal = ({ isOpen, onClose, isCorrect, score }) => {
    if (!isOpen) return null;

    const messages = isCorrect ? resultMessages.wins : resultMessages.losses;
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-[#282828] rounded-lg shadow border border-[#3e3e3e] p-6 max-w-lg w-full">
                <div className="text-center mb-6">
                    <div className="text-2xl font-bold mb-4">
                        {isCorrect ? (
                            <span className="text-green-400">Solution Accepted!</span>
                        ) : (
                            <span className="text-red-400">Solution Incorrect</span>
                        )}
                    </div>
                    <p className="text-lg text-[#cccccc] mb-2">{randomMessage}</p>
                    {!isCorrect && score !== undefined && (
                        <p className="text-sm text-[#8a8a8a]">Score: {score}/3</p>
                    )}
                </div>
                <div className="flex justify-center">
                    <button
                        onClick={onClose}
                        className="bg-[#3e3e3e] hover:bg-[#4e4e4e] text-white px-6 py-2 rounded-md text-sm font-medium"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
};