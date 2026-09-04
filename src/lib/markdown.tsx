import { Fragment, type ReactNode } from "react";
import { safeHref } from "./sanitize";

function inline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const token = m[0];
    if (token.startsWith("**")) parts.push(<strong key={k++}>{token.slice(2, -2)}</strong>);
    else if (token.startsWith("`")) parts.push(<code key={k++} className="font-mono text-[0.9em] text-cyan">{token.slice(1, -1)}</code>);
    else {
      const mm = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (mm) {
        const href = safeHref(mm[2]);
        if (href) {
          const external = href.startsWith("http");
          parts.push(
            <a
              key={k++}
              href={href}
              className="underline decoration-line underline-offset-2 hover:text-signal"
              {...(external ? { rel: "noopener noreferrer", target: "_blank" } : {})}
            >
              {mm[1]}
            </a>,
          );
        } else {
          parts.push(mm[1]);
        }
      }
    }
    last = m.index + token.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export function Markdown({ source }: { source: string }) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      blocks.push(<h2 key={key++} className="mt-8 font-serif text-2xl tracking-tight text-fg first:mt-0">{line.slice(3)}</h2>);
      i++;
      continue;
    }
    if (line.startsWith("### ")) {
      blocks.push(<h3 key={key++} className="mt-6 text-lg font-medium text-fg">{line.slice(4)}</h3>);
      i++;
      continue;
    }
    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2));
        i++;
      }
      blocks.push(
        <ul key={key++} className="mt-3 list-disc space-y-1 pl-5 text-mute">
          {items.map((it, idx) => <li key={idx}>{inline(it)}</li>)}
        </ul>,
      );
      continue;
    }
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ""));
        i++;
      }
      blocks.push(
        <ol key={key++} className="mt-3 list-decimal space-y-1 pl-5 text-mute">
          {items.map((it, idx) => <li key={idx}>{inline(it)}</li>)}
        </ol>,
      );
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !lines[i].startsWith("#") && !lines[i].startsWith("- ") && !/^\d+\.\s/.test(lines[i])) {
      para.push(lines[i]);
      i++;
    }
    blocks.push(<p key={key++} className="mt-3 text-[15px] leading-relaxed text-mute">{inline(para.join(" "))}</p>);
  }
  return <Fragment>{blocks}</Fragment>;
}
