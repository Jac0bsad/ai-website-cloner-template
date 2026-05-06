# ChatGPT Chat Page Topology

## Sections
1. **Collapsed Sidebar Rail**
   - Fixed left rail, 52px wide.
   - Icon-only actions: ChatGPT/home, new chat, search, recents.
   - Bottom avatar.
   - Interaction model: click-driven expansion.

2. **Expanded Sidebar**
   - Fixed left panel, 260px wide.
   - Header row with "ChatGPT" and close control.
   - Primary navigation list.
   - Recents heading and scrolling conversation list.
   - Account footer.
   - Interaction model: click-driven collapse.

3. **Top Utility**
   - Tiny dotted-circle/temporary-chat control at top right.
   - Static visual in clone.

4. **Empty Chat Center**
   - Centered headline "Ready when you are."
   - Composer directly beneath the headline.
   - Interaction model: composer typing, add-menu toggle, model-menu toggle.

5. **Composer Popovers**
   - Add-files menu anchored from plus button.
   - Model picker anchored from "Instant" pill.
   - Interaction model: click-driven menus.

6. **Conversation Content**
   - Top-right share/options header.
   - Center chat column with right-aligned user bubble and left-aligned assistant answer.
   - Assistant action row after response completion.
   - Bottom composer dock with disclaimer.
   - Interaction model: send prompt triggers simulated streaming.

## Page Layout
- Full viewport white background.
- Left navigation is fixed.
- Main area fills remaining width and uses flex centering.
- Composer width is clamped: about 770px desktop, 88vw at smaller widths.
- In conversation state, the composer is fixed to the bottom and the message column scrolls behind it.
