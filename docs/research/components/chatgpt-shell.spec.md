# ChatGptShell Specification

## Overview
- **Target file:** `src/components/ChatGptShell.tsx`
- **Screenshots:**
  - `docs/design-references/chatgpt-chat-current.png`
  - `docs/design-references/local-chatgpt-clone-sidebar.png`
  - `docs/design-references/chatgpt-chat-model-menu.png`
  - `docs/design-references/chatgpt-chat-attach-menu.png`
- **Interaction model:** click-driven sidebar, add-menu, and model-menu states
- **Streaming model:** local simulated streaming with a thinking dot, stop button, incremental text reveal, and final response actions

## DOM Structure
- Root full-viewport shell
- Collapsed rail always present
- Expanded sidebar conditionally visible
- Main content region
  - top-right temporary-chat control
  - centered intro stack
    - heading
    - composer
      - add button
      - textarea-like prompt input
      - model button
      - microphone button
      - voice button
      - optional popovers
  - conversation stack when a chat is active
    - top-right share/options controls
    - user bubble
    - assistant response block or thinking dot
    - response action row
    - bottom composer dock

## Computed/Observed Styles

### Root
- background: rgb(255, 255, 255)
- color: rgb(13, 13, 13)
- minHeight: 100vh
- font: system sans similar to Arial / ui-sans

### Collapsed rail
- width: 52px
- border-right: 1px solid rgb(236, 236, 236)
- icon buttons: 32px square, transparent default, pale gray hover
- avatar: 24px circle, blue background, white initials

### Expanded sidebar
- width: 260px
- background: rgb(249, 249, 249)
- border-right: 1px solid rgb(236, 236, 236)
- nav item height: 36px
- nav active background: rgb(236, 236, 236)
- body text: 14px, black
- secondary text: 12px, rgb(111, 111, 111)

### Center content
- heading: 24px, weight 400, line-height approximately 32px
- desktop vertical position: slightly above center, around 36% viewport height
- composer width: 770px desktop, responsive max 88vw

### Composer
- empty height: approximately 58px as a compact one-row pill
- typed short-input height: approximately 102px as a two-row composer
- max-height: approximately 354px when the prompt is very long
- border: 1px solid rgb(213, 213, 213)
- border-radius: approximately 28px
- background: white
- box-shadow: 0 18px 50px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.12)
- layout: two rows; text editor on top, tool/action row pinned to the bottom
- prompt text: 16px, 24px line-height
- placeholder: rgb(154, 154, 154), 16px
- long input behavior: editor grows with content until the card reaches max height; then the editor area scrolls internally while add/model/mic/send controls remain fixed on the bottom row
- empty-state title behavior: `Ready when you are.` remains position-stable while composer expands below it

### Conversation
- message column width: 770px desktop
- user bubble background: rgb(244, 244, 244)
- user bubble border radius: 21px
- message font size: 16px
- message line height: 24-28px
- assistant action color: rgb(111, 111, 111)

## States & Behaviors

### Sidebar expanded
- **Trigger:** click "Open sidebar" or "Close sidebar"
- **State A:** 52px rail only
- **State B:** 260px sidebar plus main content shifted by 260px on desktop
- **Transition:** quick layout transition, about 200ms ease

### Add menu
- **Trigger:** click plus button
- **Panel:** 230px wide, 12px radius, white, border #dedede, shadow
- **Items:** Add photos & files, Recent files, Create image, Deep research, Web search, More, Projects

### Model menu
- **Trigger:** click "Instant" pill
- **Panel:** 130px wide, 16px radius, white, border #dedede, shadow
- **Items:** Latest - 5.5, Instant, Thinking, Configure...

### Streaming reply
- **Trigger:** submit a non-empty composer prompt
- **State A:** prompt is visible in the composer and the send arrow is black
- **State B:** user bubble appears at top of chat column, composer clears and docks to the bottom, send arrow changes to a stop square
- **State C:** assistant side shows a black thinking dot
- **State D:** assistant text appears incrementally with a small cursor
- **State E:** stop button returns to voice button and response action icons appear

### Long prompt composer growth
- **Trigger:** typing or pasting enough prompt content to exceed the current editor height
- **State A (short input):** composer remains roughly 102px tall; text appears on the top row and controls remain on the bottom row
- **State B (medium input):** composer expands vertically, preserving the same rounded card and bottom action row
- **State C (overflow input):** composer clamps at roughly 354px tall; textarea/contenteditable region scrolls internally with a thin gray scrollbar; bottom controls remain visible and fixed
- **State D (empty input):** composer returns to the compact 58px pill, with plus on the left and model/mic/voice controls on the right
- **Growth transition:** typing or pasting content that increases the composer height snaps immediately with no height animation.
- **Reverse transition:** deleting long content animates the composer and editor height back toward the compact empty state.
- **Implementation approach:** hidden measurement layer calculates prompt height; React stores the previous composer height, marks each resize as growing or shrinking, and only applies the 180ms cubic-bezier height transition while shrinking.

## Assets
- No raster page assets required.
- Icons implemented with `lucide-react`.

## Text Content
- Ready when you are.
- What's on your mind today?
- Ask anything
- Instant
- Add photos & files
- Recent files
- Create image
- Deep research
- Web search
- More
- Projects
- ChatGPT
- New chat
- Search chats
- Recents
- Codex
- Share
- ChatGPT can make mistakes. Check important info. See Cookie Preferences.

## Responsive Behavior
- Desktop: expanded sidebar pushes content; composer remains centered in remaining space.
- Tablet/mobile: collapsed rail stays 52px. Expanded sidebar overlays above main content with fixed width.
- Composer clamps to available width and keeps icon controls fixed-size.
