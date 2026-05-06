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
  "For UI testing, reply with exactly two short bullet points about streaming chat interfaces.";

const defaultAssistantMessage = [
  "Streaming chat UIs render messages incrementally as tokens arrive.",
  "Good interfaces preserve scroll position and minimize layout shifts during streaming.",
];

const streamingReply = defaultAssistantMessage.join("\n");
const minPromptHeight = 24;
const maxPromptHeight = 264;
const minComposerHeight = 102;
const composerChromeHeight = 78;

export function ChatGptShell() {
  const shellRef = useRef<HTMLElement>(null);
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const promptMeasureRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [hasConversation, setHasConversation] = useState(true);
  const [userMessage, setUserMessage] = useState(defaultUserMessage);
  const [assistantText, setAssistantText] = useState(streamingReply);
  const [isStreaming, setIsStreaming] = useState(false);
  const [promptHeight, setPromptHeight] = useState(minPromptHeight);

  const closeMenus = () => {
    setAddMenuOpen(false);
    setModelMenuOpen(false);
  };

  const resizePrompt = useCallback(() => {
    const measureElement = promptMeasureRef.current;
    if (!measureElement || !prompt.trim()) {
      setPromptHeight(minPromptHeight);
      return;
    }

    const nextHeight = Math.min(measureElement.scrollHeight, maxPromptHeight);
    setPromptHeight(nextHeight);
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
    setPrompt("");
    setHasConversation(false);
    setIsStreaming(false);
    setAssistantText("");
  };

  const openDemoConversation = () => {
    closeMenus();
    setHasConversation(true);
    setUserMessage(defaultUserMessage);
    setAssistantText(streamingReply);
    setIsStreaming(false);
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
                className="chatgpt-recent-link"
                onClick={(event) => {
                  event.preventDefault();
                  openDemoConversation();
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
                    {assistantText.split("\n").map((line) => (
                      <p key={line || "streaming"}>{line}</p>
                    ))}
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
    const composerStyle = {
      "--composer-height": `${
        hasPrompt ? Math.max(minComposerHeight, promptHeight + composerChromeHeight) : 58
      }px`,
      "--prompt-height": `${hasPrompt ? promptHeight : minPromptHeight}px`,
    } as CSSProperties;

    return (
      <form
        className={`${className}${hasPrompt ? "" : " is-empty"}`}
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
