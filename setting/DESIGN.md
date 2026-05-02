---
name: Connect Design System
colors:
  surface: '#f3fcef'
  surface-dim: '#d3ddd0'
  surface-bright: '#f3fcef'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#edf6e9'
  surface-container: '#e7f1e4'
  surface-container-high: '#e2ebde'
  surface-container-highest: '#dce5d8'
  on-surface: '#151e16'
  on-surface-variant: '#3c4a3d'
  inverse-surface: '#2a332a'
  inverse-on-surface: '#eaf3e6'
  outline: '#6c7b6b'
  outline-variant: '#bbcbb9'
  surface-tint: '#006d2f'
  primary: '#006d2f'
  on-primary: '#ffffff'
  primary-container: '#25d366'
  on-primary-container: '#005523'
  inverse-primary: '#3de273'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#93492e'
  on-tertiary: '#ffffff'
  tertiary-container: '#ffa07e'
  on-tertiary-container: '#78351b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#66ff8e'
  primary-fixed-dim: '#3de273'
  on-primary-fixed: '#002109'
  on-primary-fixed-variant: '#005322'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#ffdbcf'
  tertiary-fixed-dim: '#ffb59b'
  on-tertiary-fixed: '#380d00'
  on-tertiary-fixed-variant: '#763319'
  background: '#f3fcef'
  on-background: '#151e16'
  surface-variant: '#dce5d8'
typography:
  h1:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  h2:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  timestamp:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-padding: 1rem
  bubble-gap-same: 0.125rem
  bubble-gap-different: 0.75rem
  avatar-size-sm: 2.5rem
  avatar-size-md: 3.5rem
  gutter: 1rem
---

## Brand & Style
The design system bridges the utilitarian efficiency of WhatsApp with the expressive, fluid nature of Messenger. It targets a global audience that values speed, reliability, and emotional connection. The UI evokes a sense of "trustworthy vibrancy"—feeling professional enough for business but soft enough for personal life.

The aesthetic follows a **Corporate / Modern** approach with a lean toward **Minimalism**. It utilizes generous whitespace, clear visual hierarchies, and a high-clarity interface. The style relies on subtle depth cues and soft geometry rather than heavy decorative elements, ensuring the conversation remains the focal point.

## Colors
The palette is built on high-utility greens and blues. 
- **Primary:** Used for key actions, brand identity, and online indicators in light mode.
- **Secondary:** Acts as the high-contrast anchor for outgoing messages in dark mode.
- **Surface Strategy:** In light mode, backgrounds are cool-toned neutrals to reduce eye strain. In dark mode, the system shifts to a deep navy palette to maintain depth and prevent the "true black" smearing effect on OLED screens.
- **Status Colors:** Online indicators use a vibrant emerald, while destructive actions or high-priority unread counts utilize a classic urgent red.

## Typography
This design system utilizes **Inter** for its exceptional legibility at small sizes, which is critical for chat bubbles. The typographic scale is compact to maximize the amount of information visible on screen without feeling cluttered. 

- **Headlines:** Reserved for screen titles (e.g., "Chats", "Settings").
- **Body Text:** Optimized for message bubbles with a comfortable 1.5x line height.
- **Labels:** Used for timestamps and metadata, employing a slightly lighter weight or reduced opacity to create secondary hierarchy.

## Layout & Spacing
The layout follows a **Fluid Grid** model optimized for mobile-first interactions. A 4px baseline grid ensures vertical rhythm.

- **Conversation Flow:** Messaging threads use "clustered spacing." Messages from the same sender have minimal vertical gaps, while messages from different senders use a larger gap to signify a change in the "turn" of the conversation.
- **Safe Areas:** Horizontal margins are strictly maintained at 16px to prevent text from touching the edge of the device or the edge of the chat container.

## Elevation & Depth
Depth is conveyed through **Ambient Shadows** and **Tonal Layers**. 
- **Surface Level 0:** The main background (#F5F7FB / #0F172A).
- **Surface Level 1:** Navigation bars and input areas, using a subtle blur and a 1px border for separation.
- **Surface Level 2:** Message bubbles and cards. In light mode, these feature a very soft, diffused shadow (0px 2px 4px rgba(0,0,0,0.05)) to lift them slightly off the background.
- **Surface Level 3:** Overlays, menus, and bottom sheets, which use a more pronounced shadow to indicate they are the top-most interactive layer.

## Shapes
The shape language is defined by **Rounded** geometry. 
- **Standard Radius:** 16px for primary containers and message bubbles.
- **Adaptive Bubbles:** To mimic the Messenger/WhatsApp feel, messages in a cluster use "smart corners." The corner of a bubble adjacent to another message from the same sender should have its radius reduced to 4px to visually group the content.
- **Interactive Elements:** Buttons and input fields use a consistent 12px-16px radius to match the bubble language.

## Components

### Message Bubbles
- **Incoming:** White in light mode, Dark Slate (#1E293B) in dark mode. Aligned left.
- **Outgoing:** WhatsApp Green (#25D366) in light mode, Blue (#2563EB) in dark mode. Aligned right. Text is black for green bubbles and white for blue bubbles to ensure accessibility.

### Unread Badges
- Circular containers with a solid red (#EF4444) background.
- Typography: 11px Bold white text, centered.
- Positioned on the right side of chat list items.

### Online Status Indicators
- 12px circles with a 2px white "ring" border to separate them from the avatar image.
- **Online:** Solid green (#22C55E).
- **Away/Idle:** Solid amber or simple gray outline.

### Input Fields
- "Pill-shaped" or highly rounded text inputs.
- Background: Pure white (Light) or Navy (Dark).
- Prefix/Suffix icons for attachments, emojis, and voice notes should use a neutral gray.

### Buttons
- Primary buttons use the brand green with bold white text. 
- Shadow: Soft bottom-heavy shadow to imply "pressability."