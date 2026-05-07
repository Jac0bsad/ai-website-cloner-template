"use client";

import {
  ArrowUp,
  Bot,
  ChevronDown,
  ChevronRight,
  CircleDashed,
  Copy,
  Folder,
  Globe2,
  ImagePlus,
  Menu,
  MessageCircle,
  Mic,
  MoreHorizontal,
  PanelLeftClose,
  Paperclip,
  Plus,
  RotateCcw,
  Search,
  Share,
  SquarePen,
  Square,
  Telescope,
  ThumbsDown,
  ThumbsUp,
  Upload,
} from "lucide-react";
import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { ChatMenuItem, ChatSidebarItem } from "@/types/chatgpt";

const recentChats = [
  "Product roadmap notes",
  "Cover image direction",
  "Agent workflow review",
  "Python CLI options",
  "Saved messages access",
  "GitHub Actions intro",
  "Service restart plan",
  "Portfolio allocation notes",
  "New chat",
  "Path.resolve() method",
  "LEFT JOIN result analysis",
  "Code execution flow",
  "Revenue model draft",
  "Financing plan review",
  "FastAPI long connections",
  "Kafka consumer assignment",
  "Async library selection",
  "FastAPI concurrency model",
];

const sidebarItems: ChatSidebarItem[] = [
  { label: "New chat", icon: SquarePen, active: true },
  { label: "Search chats", icon: Search },
  { label: "Projects", icon: Folder },
  { label: "Codex", icon: Bot },
  { label: "More", icon: MoreHorizontal },
];

const addMenuItems: ChatMenuItem[] = [
  { label: "Add photos & files", icon: Paperclip },
  { label: "Recent files", icon: Upload, trailing: true },
  { label: "Create image", icon: ImagePlus, separatorBefore: true },
  { label: "Deep research", icon: Telescope },
  { label: "Web search", icon: Globe2 },
  { label: "More", icon: MoreHorizontal, trailing: true },
  { label: "Projects", icon: Folder, trailing: true, separatorBefore: true },
];

const defaultUserMessage =
  "Give me a markdown content to demonstrate how the md content is rendered.";

const defaultAssistantMessage = [
  "# Markdown Rendering Demo",
  "",
  "## Text styles",
  "**Bold text**, *italic text*, ~~strikethrough~~, and `inline code`.",
  "",
  "> This is a blockquote.",
  "",
  "---",
  "",
  "## Lists",
  "- Apple",
  "- Banana",
  "- Cherry",
  "",
  "1. First step",
  "2. Second step",
  "3. Third step",
  "",
  "- [x] Write markdown",
  "- [ ] Render preview",
  "",
  "## Link",
  "[OpenAI](https://www.openai.com)",
  "",
  "## Code block",
  "```ts",
  "const greet = (name: string) => `Hello, ${name}`;",
  "```",
  "",
  "## Table",
  "| Name | Language | Experience |",
  "| --- | --- | --- |",
  "| Alice | Python | 5 years |",
  "| Bob | TypeScript | 3 years |",
];

const streamingReply = defaultAssistantMessage.join("\n");
const minPromptHeight = 24;
const maxPromptHeight = 264;
const minComposerHeight = 102;
const composerChromeHeight = 78;
const compactLayoutQuery = "(max-width: 720px)";

export function ChatGptShell() {
  const shellRef = useRef<HTMLElement>(null);
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const promptMeasureRef = useRef<HTMLDivElement>(null);
  const composerHeightRef = useRef(58);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [activeRecentChat, setActiveRecentChat] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [hasConversation, setHasConversation] = useState(false);
  const [userMessage, setUserMessage] = useState(defaultUserMessage);
  const [assistantText, setAssistantText] = useState(streamingReply);
  const [isStreaming, setIsStreaming] = useState(false);
  const [promptHeight, setPromptHeight] = useState(minPromptHeight);
  const [composerHeight, setComposerHeight] = useState(58);
  const [composerResizeDirection, setComposerResizeDirection] = useState<
    "growing" | "shrinking" | "unchanged"
  >("unchanged");

  const closeMenus = () => {
    setAddMenuOpen(false);
    setModelMenuOpen(false);
  };

  const resizePrompt = useCallback(() => {
    const measureElement = promptMeasureRef.current;
    const hasPromptText = Boolean(prompt.trim());
    const nextPromptHeight =
      measureElement && hasPromptText
        ? Math.min(measureElement.scrollHeight, maxPromptHeight)
        : minPromptHeight;
    const nextComposerHeight =
      !hasPromptText || nextPromptHeight <= minPromptHeight
        ? 58
        : Math.max(minComposerHeight, nextPromptHeight + composerChromeHeight);
    const previousComposerHeight = composerHeightRef.current;

    composerHeightRef.current = nextComposerHeight;
    setComposerResizeDirection(
      nextComposerHeight > previousComposerHeight
        ? "growing"
        : nextComposerHeight < previousComposerHeight
          ? "shrinking"
          : "unchanged",
    );
    setPromptHeight(nextPromptHeight);
    setComposerHeight(nextComposerHeight);
  }, [prompt]);

  useLayoutEffect(() => {
    resizePrompt();
  }, [hasConversation, resizePrompt]);

  useEffect(() => {
    if (!isStreaming) return;

    setAssistantText("");
    let interval: number | undefined;
    const startDelay = window.setTimeout(() => {
      let index = 0;
      interval = window.setInterval(() => {
        index += 2;
        setAssistantText(streamingReply.slice(0, index));

        if (index >= streamingReply.length) {
          window.clearInterval(interval);
          setIsStreaming(false);
        }
      }, 42);
    }, 850);

    return () => {
      window.clearTimeout(startDelay);
      if (interval) window.clearInterval(interval);
    };
  }, [isStreaming]);

  useEffect(() => {
    if (!addMenuOpen && !modelMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest(".chatgpt-popover-anchor")) return;

      closeMenus();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenus();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [addMenuOpen, modelMenuOpen]);

  const startNewChat = () => {
    closeMenus();
    setActiveRecentChat(null);
    setPrompt("");
    setHasConversation(false);
    setIsStreaming(false);
    setAssistantText("");
  };

  const openDemoConversation = (chatTitle?: string) => {
    closeMenus();
    setActiveRecentChat(chatTitle ?? null);
    setHasConversation(true);
    setUserMessage(defaultUserMessage);
    setAssistantText(streamingReply);
    setIsStreaming(false);
    if (window.matchMedia(compactLayoutQuery).matches) {
      setSidebarOpen(false);
    }
  };

  const submitPrompt = () => {
    const trimmed = prompt.trim();
    if (!trimmed) return;

    closeMenus();
    setUserMessage(trimmed);
    setPrompt("");
    setHasConversation(true);
    setIsStreaming(true);
  };

  const stopStreaming = () => {
    setAssistantText((current) => current || "Streaming chat UIs render messages incrementally");
    setIsStreaming(false);
  };

  return (
    <main ref={shellRef} className="chatgpt-shell">
      <aside className="chatgpt-rail" aria-label="Sidebar">
        <button
          className="chatgpt-rail-button"
          aria-label="Open sidebar"
          onClick={() => setSidebarOpen(true)}
        >
          {sidebarOpen ? <Bot size={20} /> : <Menu size={22} />}
        </button>
        <button className="chatgpt-rail-button" aria-label="New chat" onClick={startNewChat}>
          <SquarePen size={20} />
        </button>
        <button className="chatgpt-rail-button" aria-label="Search chats">
          <Search size={20} />
        </button>
        <button className="chatgpt-rail-button" aria-label="Recents">
          <MessageCircle size={20} />
        </button>
        <button className="chatgpt-avatar chatgpt-rail-avatar" aria-label="Open profile menu">
          JL
        </button>
      </aside>

      <aside
        className={sidebarOpen ? "chatgpt-sidebar is-open" : "chatgpt-sidebar"}
        aria-label="Chat history"
      >
        <div className="chatgpt-sidebar-header">
          <span className="chatgpt-sidebar-title">ChatGPT</span>
          <button
            className="chatgpt-icon-button"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
          >
            <PanelLeftClose size={18} />
          </button>
        </div>

        <nav className="chatgpt-sidebar-nav" aria-label="Primary">
          {sidebarItems.map((item) => (
            <button
              key={item.label}
              className={item.active ? "chatgpt-sidebar-item is-active" : "chatgpt-sidebar-item"}
              onClick={item.label === "New chat" ? startNewChat : undefined}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <section className="chatgpt-recents" aria-labelledby="recents-heading">
          <h2 id="recents-heading">Recents</h2>
          <div className="chatgpt-recents-list">
            {recentChats.map((chat) => (
              <a
                key={chat}
                href="#"
                className={
                  activeRecentChat === chat
                    ? "chatgpt-recent-link is-active"
                    : "chatgpt-recent-link"
                }
                aria-current={activeRecentChat === chat ? "page" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  openDemoConversation(chat);
                }}
              >
                {chat}
              </a>
            ))}
          </div>
        </section>

        <button className="chatgpt-account" aria-label="Jacob Lee, open profile menu">
          <span className="chatgpt-avatar">JL</span>
          <span>
            <strong>Jacob Lee</strong>
            <small>Personal account</small>
          </span>
        </button>
      </aside>

      <section className={sidebarOpen ? "chatgpt-main sidebar-open" : "chatgpt-main"}>
        {hasConversation ? (
          <>
            <header className="chatgpt-chat-header">
              <button className="chatgpt-share-button" type="button">
                <Share size={17} />
                Share
              </button>
              <button className="chatgpt-header-more" aria-label="Open conversation options">
                <MoreHorizontal size={20} />
              </button>
            </header>

            <div className="chatgpt-conversation">
              <article className="chatgpt-message-row user">
                <div className="chatgpt-user-bubble">{userMessage}</div>
              </article>

              <article className="chatgpt-message-row assistant">
                {isStreaming && assistantText.length === 0 ? (
                  <div className="chatgpt-thinking-dot" aria-label="ChatGPT is thinking" />
                ) : (
                  <div className="chatgpt-assistant-block">
                    <MarkdownResponse markdown={assistantText} />
                    {isStreaming ? <span className="chatgpt-stream-cursor" /> : null}
                  </div>
                )}
                {!isStreaming && assistantText ? (
                  <div className="chatgpt-response-actions" aria-label="Response actions">
                    <button aria-label="Copy response">
                      <Copy size={18} />
                    </button>
                    <button aria-label="Good response">
                      <ThumbsUp size={18} />
                    </button>
                    <button aria-label="Bad response">
                      <ThumbsDown size={18} />
                    </button>
                    <button aria-label="Share">
                      <Share size={18} />
                    </button>
                    <button aria-label="Regenerate">
                      <RotateCcw size={17} />
                    </button>
                    <button aria-label="More actions">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                ) : null}
              </article>
            </div>

            <div className="chatgpt-composer-dock">
              {renderComposer("chatgpt-composer is-docked", submitPrompt, stopStreaming, isStreaming)}
              <p className="chatgpt-disclaimer">
                ChatGPT can make mistakes. Check important info. <a href="#">See Cookie Preferences.</a>
              </p>
            </div>
          </>
        ) : (
          <>
            <button className="chatgpt-temp" aria-label="Turn on temporary chat">
              <CircleDashed size={19} />
            </button>
            <div className="chatgpt-center">
              <h1>Ready when you are.</h1>
              {renderComposer("chatgpt-composer", submitPrompt, stopStreaming, isStreaming)}
            </div>
          </>
        )}
      </section>
    </main>
  );

  function renderComposer(
    className: string,
    onSubmitPrompt: () => void,
    onStopStreaming: () => void,
    streaming: boolean,
  ) {
    const hasPrompt = Boolean(prompt.trim());
    const isCompact = !hasPrompt || promptHeight <= minPromptHeight;
    const composerStyle = {
      "--composer-height": `${composerHeight}px`,
      "--prompt-height": `${hasPrompt ? promptHeight : minPromptHeight}px`,
    } as CSSProperties;
    const resizeClass =
      composerResizeDirection === "shrinking" ? " is-shrinking" : " is-growing";

    return (
      <form
        className={`${className}${hasPrompt ? "" : " is-empty"}${isCompact ? " is-compact" : ""}${resizeClass}`}
        style={composerStyle}
        onSubmit={(event) => {
          event.preventDefault();
          onSubmitPrompt();
        }}
      >
        <label className="sr-only" htmlFor="chatgpt-prompt">
          Chat with ChatGPT
        </label>
        <textarea
          ref={promptRef}
          id="chatgpt-prompt"
          value={prompt}
          placeholder="Ask anything"
          rows={1}
          onChange={(event) => setPrompt(event.target.value)}
          onFocus={closeMenus}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              onSubmitPrompt();
            }
          }}
        />
        <div ref={promptMeasureRef} className="chatgpt-prompt-measure" aria-hidden="true">
          {prompt ? `${prompt}\n` : ""}
        </div>

        <div className="chatgpt-popover-anchor chatgpt-add-anchor">
          <button
            type="button"
            className={addMenuOpen ? "chatgpt-add-button is-active" : "chatgpt-add-button"}
            aria-label="Add files and more"
            onClick={() => {
              setModelMenuOpen(false);
              setAddMenuOpen((open) => !open);
            }}
          >
            <Plus size={22} />
          </button>
          {addMenuOpen ? <MenuPanel className="chatgpt-add-menu" items={addMenuItems} /> : null}
        </div>

        <div className="chatgpt-composer-actions">
          <div className="chatgpt-popover-anchor">
            <button
              type="button"
              className={modelMenuOpen ? "chatgpt-model-button is-active" : "chatgpt-model-button"}
              aria-label="Instant"
              onClick={() => {
                setAddMenuOpen(false);
                setModelMenuOpen((open) => !open);
              }}
            >
              Instant
              <ChevronDown size={14} />
            </button>
            {modelMenuOpen ? (
              <div className="chatgpt-model-menu" role="menu">
                <button className="chatgpt-menu-muted" type="button">
                  Latest - 5.5
                </button>
                <button type="button">Instant</button>
                <button type="button">Thinking</button>
                <span className="chatgpt-menu-separator" />
                <button type="button">Configure...</button>
              </div>
            ) : null}
          </div>

          <button type="button" className="chatgpt-mic" aria-label="Start dictation">
            <Mic size={18} />
          </button>
          {streaming ? (
            <button
              type="button"
              className="chatgpt-stop"
              aria-label="Stop streaming"
              onClick={onStopStreaming}
            >
              <Square size={13} fill="currentColor" />
            </button>
          ) : prompt.trim() ? (
            <button type="submit" className="chatgpt-send" aria-label="Send prompt">
              <ArrowUp size={19} />
            </button>
          ) : (
            <button type="button" className="chatgpt-voice" aria-label="Start Voice">
              <span className="chatgpt-waveform" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
                <span />
              </span>
            </button>
          )}
        </div>
      </form>
    );
  }
}

function MenuPanel({ items, className }: { items: ChatMenuItem[]; className: string }) {
  return (
    <div className={className} role="menu">
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          className={item.separatorBefore ? "has-separator" : undefined}
        >
          {item.icon ? <item.icon size={18} /> : null}
          <span>{item.label}</span>
          {item.trailing ? <ChevronRight size={16} /> : null}
        </button>
      ))}
    </div>
  );
}

type MarkdownInlineToken =
  | {
      kind: "text";
      value: string;
    }
  | {
      kind: "code";
      value: string;
    }
  | {
      kind: "strong";
      value: string;
    }
  | {
      kind: "emphasis";
      value: string;
    }
  | {
      kind: "delete";
      value: string;
    }
  | {
      kind: "link";
      href: string;
      value: string;
    };

type MarkdownBlock =
  | {
      kind: "paragraph";
      text: string;
    }
  | {
      kind: "heading";
      level: 1 | 2 | 3 | 4;
      text: string;
    }
  | {
      kind: "blockquote";
      text: string;
    }
  | {
      kind: "separator";
    }
  | {
      kind: "unordered-list";
      items: MarkdownListItem[];
    }
  | {
      kind: "ordered-list";
      items: MarkdownListItem[];
    }
  | {
      kind: "code";
      language?: string;
      text: string;
    }
  | {
      kind: "table";
      headers: string[];
      rows: string[][];
    };

type MarkdownListItem = {
  checked?: boolean;
  text: string;
};

function MarkdownResponse({ markdown }: { markdown: string }) {
  const blocks = parseMarkdown(markdown);

  return (
    <div className="chatgpt-assistant-markdown">
      {blocks.map((block, index) => {
        if (block.kind === "heading") {
          const HeadingTag = `h${block.level}` as const;
          return <HeadingTag key={`h-${index}`}>{renderInlineMarkdown(block.text)}</HeadingTag>;
        }

        if (block.kind === "blockquote") {
          return <blockquote key={`quote-${index}`}>{renderInlineMarkdown(block.text)}</blockquote>;
        }

        if (block.kind === "separator") {
          return <hr key={`hr-${index}`} />;
        }

        if (block.kind === "unordered-list") {
          return (
            <ul key={`ul-${index}`}>
              {block.items.map((item, itemIndex) => (
                <li
                  key={`${item.text}-${itemIndex}`}
                  className={item.checked !== undefined ? "task-list-item" : undefined}
                >
                  {item.checked !== undefined ? (
                    <input checked={item.checked} disabled type="checkbox" />
                  ) : null}
                  <span>{renderInlineMarkdown(item.text)}</span>
                </li>
              ))}
            </ul>
          );
        }

        if (block.kind === "ordered-list") {
          return (
            <ol key={`ol-${index}`}>
              {block.items.map((item, itemIndex) => (
                <li key={`${item.text}-${itemIndex}`}>{renderInlineMarkdown(item.text)}</li>
              ))}
            </ol>
          );
        }

        if (block.kind === "code") {
          return (
            <pre key={`code-${index}`}>
              {block.language ? <span className="code-language">{block.language}</span> : null}
              <code>{block.text}</code>
            </pre>
          );
        }

        if (block.kind === "table") {
          return (
            <div className="chatgpt-markdown-table-wrap" key={`table-${index}`}>
              <table>
                <thead>
                  <tr>
                    {block.headers.map((header) => (
                      <th key={header}>{renderInlineMarkdown(header)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, rowIndex) => (
                    <tr key={`row-${rowIndex}`}>
                      {row.map((cell, cellIndex) => (
                        <td key={`${cell}-${cellIndex}`}>{renderInlineMarkdown(cell)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        return <p key={`p-${index}`}>{renderInlineMarkdown(block.text)}</p>;
      })}
    </div>
  );
}

function parseMarkdown(markdown: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  const paragraphLines: string[] = [];
  const lines = markdown.split("\n");
  let listType: "unordered-list" | "ordered-list" | null = null;
  let listItems: MarkdownListItem[] = [];
  let codeLines: string[] = [];
  let codeLanguage: string | undefined;
  let inCodeBlock = false;

  const flushParagraph = () => {
    if (!paragraphLines.length) return;
    blocks.push({ kind: "paragraph", text: paragraphLines.join(" ") });
    paragraphLines.length = 0;
  };

  const flushList = () => {
    if (!listType || !listItems.length) return;
    blocks.push({ kind: listType, items: listItems });
    listType = null;
    listItems = [];
  };

  const flushCode = () => {
    blocks.push({ kind: "code", language: codeLanguage, text: codeLines.join("\n") });
    codeLines = [];
    codeLanguage = undefined;
  };

  const parseTableCells = (line: string) =>
    line
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((cell) => cell.trim());

  const isTableSeparator = (line: string) =>
    /^(\|\s*)?:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(line.trim());

  const readTable = (startIndex: number) => {
    const headers = parseTableCells(lines[startIndex]);
    const rows: string[][] = [];
    let nextIndex = startIndex + 2;

    while (nextIndex < lines.length && lines[nextIndex].includes("|") && lines[nextIndex].trim()) {
      rows.push(parseTableCells(lines[nextIndex]));
      nextIndex += 1;
    }

    return { block: { kind: "table", headers, rows } as MarkdownBlock, nextIndex };
  };

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      flushParagraph();
      flushList();

      if (inCodeBlock) {
        flushCode();
      } else {
        codeLanguage = trimmed.slice(3).trim() || undefined;
      }

      inCodeBlock = !inCodeBlock;
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    if (
      lineIndex + 1 < lines.length &&
      trimmed.includes("|") &&
      isTableSeparator(lines[lineIndex + 1])
    ) {
      flushParagraph();
      flushList();
      const table = readTable(lineIndex);
      blocks.push(table.block);
      lineIndex = table.nextIndex - 1;
      continue;
    }

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      blocks.push({
        kind: "heading",
        level: headingMatch[1].length as 1 | 2 | 3 | 4,
        text: headingMatch[2],
      });
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushParagraph();
      flushList();
      blocks.push({ kind: "separator" });
      continue;
    }

    const blockquoteMatch = trimmed.match(/^>\s?(.+)$/);
    if (blockquoteMatch) {
      flushParagraph();
      flushList();
      blocks.push({ kind: "blockquote", text: blockquoteMatch[1] });
      continue;
    }

    const unorderedMatch = trimmed.match(/^[-*]\s+(.+)$/);
    if (unorderedMatch) {
      flushParagraph();
      if (listType !== "unordered-list") flushList();
      listType = "unordered-list";
      const taskMatch = unorderedMatch[1].match(/^\[(x|X|\s)]\s+(.+)$/);
      listItems.push(
        taskMatch
          ? { checked: taskMatch[1].toLowerCase() === "x", text: taskMatch[2] }
          : { text: unorderedMatch[1] },
      );
      continue;
    }

    const orderedMatch = trimmed.match(/^\d+[.)]\s+(.+)$/);
    if (orderedMatch) {
      flushParagraph();
      if (listType !== "ordered-list") flushList();
      listType = "ordered-list";
      listItems.push({ text: orderedMatch[1] });
      continue;
    }

    flushList();
    paragraphLines.push(trimmed);
  }

  if (inCodeBlock && codeLines.length) flushCode();
  flushParagraph();
  flushList();

  return blocks;
}

function renderInlineMarkdown(text: string): ReactNode[] {
  const tokens = tokenizeInlineMarkdown(text);

  return tokens.map((token, index) => {
    if (token.kind === "code") {
      return <code key={`${token.value}-${index}`}>{token.value}</code>;
    }

    if (token.kind === "strong") {
      return <strong key={`${token.value}-${index}`}>{token.value}</strong>;
    }

    if (token.kind === "emphasis") {
      return <em key={`${token.value}-${index}`}>{token.value}</em>;
    }

    if (token.kind === "delete") {
      return <del key={`${token.value}-${index}`}>{token.value}</del>;
    }

    if (token.kind === "link") {
      return (
        <a href={token.href} key={`${token.href}-${index}`} rel="noreferrer" target="_blank">
          {token.value}
        </a>
      );
    }

    return token.value;
  });
}

function tokenizeInlineMarkdown(text: string): MarkdownInlineToken[] {
  const tokens: MarkdownInlineToken[] = [];
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|~~[^~]+~~|\*[^*\s][^*]*\*|\[[^\]]+]\([^)]+\))/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text))) {
    if (match.index > cursor) {
      tokens.push({ kind: "text", value: text.slice(cursor, match.index) });
    }

    const value = match[0];
    if (value.startsWith("`")) {
      tokens.push({ kind: "code", value: value.slice(1, -1) });
    } else if (value.startsWith("**")) {
      tokens.push({ kind: "strong", value: value.slice(2, -2) });
    } else if (value.startsWith("~~")) {
      tokens.push({ kind: "delete", value: value.slice(2, -2) });
    } else if (value.startsWith("*")) {
      tokens.push({ kind: "emphasis", value: value.slice(1, -1) });
    } else {
      const linkMatch = value.match(/^\[([^\]]+)]\(([^)]+)\)$/);
      if (linkMatch) {
        tokens.push({ kind: "link", value: linkMatch[1], href: linkMatch[2] });
      } else {
        tokens.push({ kind: "text", value });
      }
    }

    cursor = match.index + value.length;
  }

  if (cursor < text.length) {
    tokens.push({ kind: "text", value: text.slice(cursor) });
  }

  return tokens;
}
