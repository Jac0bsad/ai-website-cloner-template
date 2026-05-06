# ChatGPT Chat Page Behaviors

Target: `https://chatgpt.com/` authenticated empty-chat screen.

## Captured States
- Default/collapsed rail: `docs/design-references/chatgpt-chat-current.png`
- Expanded sidebar: `docs/design-references/local-chatgpt-clone-sidebar.png`
- Model menu: `docs/design-references/chatgpt-chat-model-menu.png`
- Add-files menu: `docs/design-references/chatgpt-chat-attach-menu.png`

## Interaction Sweep
- Sidebar toggle: click-driven. Collapsed state is a 52px left rail with four icon buttons and a bottom avatar. Expanded state is a 260px pale sidebar with ChatGPT title, primary nav, recents list, and account footer. Main content shifts right rather than overlaying at desktop width.
- Add-files menu: click-driven popover anchored below the plus button. White panel, 230px wide, 12px radius, thin border, soft shadow. Contains vertical actions and separators.
- Model menu: click-driven popover anchored below the "Instant" pill. White panel, about 130px wide, 16px radius, thin border, soft shadow. Contains muted "Latest - 5.5", "Instant", "Thinking", separator, and "Configure...".
- Composer: static until text entry. Rounded pill, white background, light gray border, soft shadow. Hover/active controls use pale gray circular fills.
- Voice control: black circular button with white waveform.
- Existing conversation state: top-right Share and more controls appear, the composer moves to a bottom fixed dock, and a small disclaimer appears below the composer.
- Sent user message: right-aligned rounded light-gray bubble, max width roughly 540px, 16px text, 24px line height.
- Assistant response: plain text column aligned to the left side of the chat column; response actions appear below completion.
- Streaming process: after send, the user bubble appears immediately, the composer clears and docks at the bottom, the send button becomes a stop button, and the assistant area first shows a single black thinking dot. Text then appears incrementally; response action icons are hidden until streaming completes.
- Scroll: empty chat page has no meaningful vertical content scroll. Expanded sidebar recents scroll independently when content overflows.
- Responsive: at the captured narrow viewport the main shell keeps the compact rail and centers the composer. On wider viewport, expanded sidebar shifts the main content. Mobile should hide expanded sidebar content behind an overlay-like drawer.

## Privacy Handling
The live sidebar contained private conversation titles. The implementation preserves visual rhythm with representative local mock titles instead of committing those private titles.
