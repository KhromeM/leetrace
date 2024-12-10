import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import { createQuestionFromMarkdown } from "../utils/markdown";

const ContentBlock = ({ block }) => {
	if (block.type === "text") {
		return (
			<div className="mb-8 font-serif leading-relaxed whitespace-pre-line text-[#cccccc]">
				<ReactMarkdown
					components={{
						h1: ({ children }) => (
							<h1 className="text-3xl font-bold mb-4 text-[#cccccc]">
								{children}
							</h1>
						),
						h2: ({ children }) => (
							<h2 className="text-2xl font-bold mb-3 text-[#cccccc]">
								{children}
							</h2>
						),
						h3: ({ children }) => (
							<h3 className="text-xl font-bold mb-2 text-[#cccccc]">
								{children}
							</h3>
						),
						p: ({ children }) => (
							<p className="mb-4 whitespace-pre-line text-[#cccccc]">
								{children}
							</p>
						),
						a: ({ children, href }) => (
							<a
								href={href}
								className="text-blue-400 hover:text-blue-300"
								target="_blank"
								rel="noopener noreferrer"
							>
								{children}
							</a>
						),
						ul: ({ children }) => (
							<ul className="list-disc ml-6 mb-4 space-y-2 text-[#cccccc]">
								{children}
							</ul>
						),
						ol: ({ children }) => (
							<ol className="list-decimal ml-6 mb-4 space-y-2 text-[#cccccc]">
								{children}
							</ol>
						),
						li: ({ children }) => (
							<li className="text-[#cccccc]">{children}</li>
						),
						strong: ({ children }) => (
							<strong className="font-bold text-[#cccccc]">{children}</strong>
						),
						em: ({ children }) => (
							<em className="italic text-[#cccccc]">{children}</em>
						),
						// Inline code
						code: ({ node, inline, className, children, ...props }) => {
							const match = /language-(\w+)/.exec(className || "");
							return !inline && match ? (
								<SyntaxHighlighter
									language={match[1]}
									style={dracula}
									PreTag="div"
									className="rounded-md my-4"
									showLineNumbers={true}
									customStyle={{
										margin: 0,
										background: "#1e1e1e",
									}}
									{...props}
								>
									{String(children).replace(/\n$/, "")}
								</SyntaxHighlighter>
							) : (
								<code
									className="bg-[#2d2d2d] px-1.5 py-0.5 rounded text-sm font-mono text-[#cccccc]"
									{...props}
								>
									{children}
								</code>
							);
						},
						// Code blocks
						pre: ({ children }) => (
							<pre className="bg-[#1e1e1e] rounded-lg my-4 overflow-x-auto">
								{children}
							</pre>
						),
						blockquote: ({ children }) => (
							<blockquote className="border-l-4 border-[#2d2d2d] pl-4 italic my-4 text-[#cccccc]">
								{children}
							</blockquote>
						),
						// Tables
						table: ({ children }) => (
							<div className="overflow-x-auto my-4">
								<table className="min-w-full divide-y divide-[#2d2d2d]">
									{children}
								</table>
							</div>
						),
						thead: ({ children }) => (
							<thead className="bg-[#2d2d2d]">{children}</thead>
						),
						tbody: ({ children }) => (
							<tbody className="divide-y divide-[#2d2d2d] bg-[#1e1e1e]">
								{children}
							</tbody>
						),
						tr: ({ children }) => <tr>{children}</tr>,
						th: ({ children }) => (
							<th className="px-6 py-3 text-left text-xs font-medium text-[#cccccc] uppercase tracking-wider">
								{children}
							</th>
						),
						td: ({ children }) => (
							<td className="px-6 py-4 whitespace-nowrap text-sm text-[#cccccc]">
								{children}
							</td>
						),
					}}
				>
					{block.content.replace(/\\n/g, "\n")}
				</ReactMarkdown>
			</div>
		);
	} else if (block.type === "image") {
		let maxWidth;
		switch (block.aspectRatio) {
			case "portrait":
				maxWidth = "max-w-md";
				break;
			case "square":
				maxWidth = "max-w-lg";
				break;
			default:
				maxWidth = "max-w-2xl";
		}

		return (
			<figure className={`my-8 mx-auto ${maxWidth}`}>
				<div className="relative w-full">
					<img
						src={block.src}
						alt={block.caption}
						className="w-full h-auto rounded-lg"
					/>
				</div>
				{block.caption && (
					<figcaption className="text-center text-sm text-[#8a8a8a] mt-2">
						{block.caption}
					</figcaption>
				)}
			</figure>
		);
	}
	return null;
};

const Question = (markdown) => {
	const content = createQuestionFromMarkdown(markdown);
	return (
		<div className="space-y-4">
			{content.map((block, idx) => (
				<ContentBlock key={idx} block={block} />
			))}
		</div>
	);
};

export default Question;
