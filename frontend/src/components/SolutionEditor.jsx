import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";

export const SolutionEditor = ({
	onSubmit,
	isSubmitting,
	matchId,
	readOnly = false,
	initialSolution = "",
}) => {
	const [solution, setSolution] = useState(initialSolution);

	useEffect(() => {
		if (matchId) {
			const savedSolution = localStorage.getItem(`solution-${matchId}`);
			if (savedSolution) {
				setSolution(savedSolution);
			}
		}
	}, [matchId]);

	const handleChange = (value) => {
		setSolution(value);
		if (matchId) {
			localStorage.setItem(`solution-${matchId}`, value);
		}
	};

	const handleSubmit = () => {
		onSubmit?.(solution);
	};

	return (
		<div className="bg-[#282828] rounded-lg shadow p-6">
			<h2 className="text-xl font-bold mb-4 text-white">
				{readOnly ? "Your Solution" : "Write Your Solution"}
			</h2>
			<div className="mb-4">
				<ul className="space-y-1 text-sm text-gray-300">
					<li>Write in python or psuedocode or natural language</li>
					<li>Make sure to handle all edge cases</li>
					<li>Should be optimal or near optimal</li>
				</ul>
			</div>
			<div className="h-[calc(90vh-400px)] mb-4 border border-[#3e3e3e] rounded-lg overflow-hidden">
				<Editor
					height="100%"
					defaultLanguage="python"
					value={solution}
					onChange={handleChange}
					theme="vs-dark"
					options={{
						minimap: { enabled: false },
						lineNumbers: "on",
						fontSize: 14,
						wordWrap: "on",
						padding: { top: 10 },
						readOnly: readOnly,
						quickSuggestions: {
							other: true,
							comments: true,
							strings: false,
						},
						suggestOnTriggerCharacters: true,
						parameterHints: { enabled: true },
						suggest: {
							enabled: !readOnly,
							showWords: true,
							showSnippets: true,
							showMethods: true,
							showFunctions: true,
							showConstructors: true,
							showFields: true,
							showVariables: true,
							showClasses: true,
							showModules: true,
							showProperties: true,
							showOperators: true,
							showValues: true,
							showConstants: true,
							showKeywords: true,
							showReferences: true,
							insertMode: "insert",
							filterGraceful: true,
							snippetsPreventQuickSuggestions: false,
							localityBonus: true,
							shareSuggestSelections: true,
							showDeprecated: false,
							matchOnWordStartOnly: false,
						},
						wordBasedSuggestions: true,
						wordBasedSuggestionsOnlySameLanguage: true,
						acceptSuggestionOnTab: true,
						acceptSuggestionOnEnter: "on",
						tabCompletion: "on",
						autoIndent: "full",
						formatOnPaste: true,
						formatOnType: true,
						renderWhitespace: "selection",
						rulers: [80],
						bracketPairColorization: { enabled: true },
						autoClosingBrackets: "always",
						autoClosingQuotes: "always",
						autoSurround: "quotes",
						guides: {
							bracketPairs: true,
							indentation: true,
							highlightActiveIndentation: true,
							highlightActiveBracketPair: true,
						},
					}}
				/>
			</div>
			{!readOnly && (
				<button
					onClick={handleSubmit}
					disabled={isSubmitting}
					className={`w-full py-2 px-4 rounded-lg ${
						isSubmitting
							? "bg-gray-600 cursor-not-allowed"
							: "bg-green-600 hover:bg-green-700 text-white"
					}`}
				>
					{isSubmitting ? "Submitting..." : "Submit Solution"}
				</button>
			)}
		</div>
	);
};
