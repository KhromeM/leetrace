import Question from "./Question";

export const QuestionDisplay = ({ question }) => {
	return (
		<div className="bg-[#1e1e1e] rounded-lg overflow-hidden h-[calc(100vh-280px)]">
			<div className="p-6 h-full overflow-y-auto">
				<h2 className="text-xl font-bold mb-4 text-[#cccccc]">
					{question.title}
				</h2>
				<div className="overflow-x-auto">
					<Question markdown={question.content} />
				</div>
				{question.leetcodeUrl && (
					<a
						href={question.leetcodeUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="text-blue-400 hover:text-blue-300 mt-4 block"
					>
						View on LeetCode
					</a>
				)}
			</div>
		</div>
	);
};
