import katex from "katex";

// Splits on $$...$$ (block) and $...$ (inline) math delimiters, rendering
// each math segment through KaTeX and leaving everything else as plain text.
// Authors just type LaTeX inline in the question/option text, e.g.
// "Solve $x^2 + 3x = 0$ for x." — no separate math editor needed.
function renderSegments(text: string) {
  const parts = text.split(/(\$\$[^$]+\$\$|\$[^$]+\$)/g);

  return parts.map((part, i) => {
    if (part.startsWith("$$") && part.endsWith("$$")) {
      const html = safeRender(part.slice(2, -2), true);
      return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />;
    }
    if (part.startsWith("$") && part.endsWith("$") && part.length > 1) {
      const html = safeRender(part.slice(1, -1), false);
      return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />;
    }
    return <span key={i}>{part}</span>;
  });
}

function safeRender(latex: string, displayMode: boolean) {
  try {
    return katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
      output: "html",
    });
  } catch {
    return latex;
  }
}

export function MathText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  return (
    <span className={`whitespace-pre-line ${className}`}>
      {renderSegments(text)}
    </span>
  );
}
