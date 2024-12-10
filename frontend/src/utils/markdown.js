export const createQuestionFromMarkdown = (text) => {
	const markdownText = text.markdown;
	// console.log(markdownText);
	const sections = markdownText.split("---\n");
	let frontmatter = {};
	let content = markdownText;

	if (sections.length > 1) {
		const frontmatterLines = sections[1].split("\n");
		frontmatterLines.forEach((line) => {
			const [key, ...valueParts] = line.split(":");
			if (key && valueParts.length) {
				const value = valueParts.join(":").trim();
				frontmatter[key.trim()] = value.replace(/^["'](.*)["']$/, "$1");
			}
		});
		content = sections.slice(2).join("---\n").trim();
	}

	const blocks = [];
	const contentSections = content.split("\n\n");

	contentSections.forEach((section) => {
		if (section.startsWith("![")) {
			const matches = section.match(/!\[(.*?)\]\((.*?)\)(\{(.*?)\})?/);
			if (matches) {
				blocks.push({
					type: "image",
					src: matches[2],
					caption: matches[1],
					aspectRatio: matches[4] || "landscape",
				});
			}
		} else {
			blocks.push({
				type: "text",
				content: section,
			});
		}
	});

	return blocks;
};
