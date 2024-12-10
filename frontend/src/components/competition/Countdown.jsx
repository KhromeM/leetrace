export const Countdown = ({ countdown, opponent }) => {
	return (
		<div className="max-w-2xl mx-auto p-6">
			<div className="bg-[#282828] rounded-lg shadow border border-[#3e3e3e] p-8">
				<div className="text-center mb-6">
					<h2 className="text-2xl font-bold text-[#cccccc] mb-4">
						Match Starting In
					</h2>
					<div className="text-6xl font-mono font-bold text-[#2cbb5d] mb-6">
						{countdown ?? "..."}
					</div>
				</div>

				<div className="flex items-center justify-center border-t border-[#3e3e3e] pt-6">
					<div className="text-center">
						<div className="text-lg font-medium text-[#cccccc] mb-2">
							Opponent Found:
						</div>
						<div className="flex items-center justify-center space-x-3">
							<img
								src={opponent?.opponentPhotoURL || "/default-avatar.png"}
								alt={opponent?.opponentName}
								className="w-12 h-12 rounded-full border-2 border-[#3e3e3e]"
							/>
							<span className="text-lg text-[#cccccc]">
								{opponent?.opponentName || "Loading..."}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
