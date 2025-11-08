import {
  cleanCardSnippet,
  createDescription,
  createPlainText,
  createSearchContent,
  extractFirstSentence,
} from "@/lib/content-utils";

describe("content utils", () => {
  it("strips markdown and html to create plain text", () => {
    const raw = `
# Heading

Paragraph with **bold** text, a [link](https://alexbon.com), and some \`inline code\`.

> Blockquote

![Alt](image.png)
`;
    expect(createPlainText(raw)).toBe("Heading Paragraph with bold text, a link, and some inline code. Blockquote");
  });

  it("creates description within limit with ellipsis when truncated", () => {
    const text = "a".repeat(100);
    const description = createDescription(text, 20);
    expect(description.endsWith("...")).toBe(true);
    expect(description.length).toBeLessThanOrEqual(20);
  });

  it("falls back to original description when within the limit", () => {
    const text = "Short blurb";
    expect(createDescription(text, 160)).toBe(text);
  });

  it("extracts first sentence when punctuation present", () => {
    const text = "First sentence. Second sentence! Third?";
    expect(extractFirstSentence(text)).toBe("First sentence.");
  });

  it("returns trimmed text when there is no sentence punctuation", () => {
    expect(extractFirstSentence("No punctuation here")).toBe("No punctuation here");
  });

  it("cleans card snippets by removing html and whitespace", () => {
    const snippet = `<p>Hello <strong>world</strong></p><script>alert("x")</script>`;
    expect(cleanCardSnippet(snippet)).toBe("Hello world");
  });

  it("creates search content capped at 5000 characters", () => {
    const raw = "a".repeat(6000);
    const searchContent = createSearchContent(raw);
    expect(searchContent.length).toBe(5000);
  });
});
