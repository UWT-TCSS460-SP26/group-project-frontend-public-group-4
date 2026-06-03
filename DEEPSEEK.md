# Reviews delete task

- When the user wants to delete a review, a pop up should appear.
- The popup should contain the message: "are you sure you want to delete this review? Deleted content cannot be recovered."
- The popup should also contain a "cancel" and "delete" button
- add this popup in all places where a user can delete a review, which should be in the detail page and the profile page.

# User story 1

As a team, we want our consumer app to present a single, coherent visual identity across every view so that a user moving between sign-in, browse, search, detail, profile, and About never feels like they jumped to a different product.¶
This is the sprint story. Walk the app end-to-end and name your design system out loud: the typography scale (how many sizes, where each one is used), the spacing system (a 4px or 8px grid? MUI's spacing tokens?), the color palette (primary, secondary, surface, text, error — and what each one means in your app), the button hierarchy (primary / secondary / tertiary / text), the card and list patterns, the empty / loading / error states. Pick a set of components and reuse them at every call site; if a view is rolling its own, that's the work.

Sprint 7's bar was intentional, not perfect — this sprint's bar is finished. By the end of the week, nothing on any view should look like it was thrown together for that view only. If two pages use cards, they should look like the same card. If two routes have an empty state, the empty state should look and read like it came from the same hand. If two buttons mean the same thing, they should be the same button.

If you're on MUI, lean on the theme — extend it, don't fight it. Tokens for color, typography, spacing, and shape propagate everywhere they're referenced; changing one value should change the whole app. If you're hand-rolling, factor out the shared components and import them everywhere instead of restyling at every call site.
