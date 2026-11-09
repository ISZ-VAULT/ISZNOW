import ReactMarkdown from "react-markdown";

/** Renders generated Markdown as a paper-like sheet. (Puppeteer will print this in the next phase.) */
export function DocumentView({ content, rtl }: { content: string; rtl?: boolean }) {
  return (
    <div
      dir={rtl ? "rtl" : "ltr"}
      className="doc-content mx-auto min-h-[400px] max-w-3xl rounded-lg border bg-white p-8 shadow-sm"
    >
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
