# Responsive panel requirements

Every future plugin panel must react to its own container dimensions, using container queries or an equivalent scoped mechanism. Do not infer panel width from a device name or browser width. Declare minimum usable dimensions and show a meaningful compact state below them.

Core owns authored Desktop, Tablet and Mobile layouts. Panel identity, configuration, data, permission checks and actions are shared across layouts. Reflow content and controls; do not simply shrink a desktop interface. Preserve inputs, selection and in-flight work when a panel moves or its container resizes. Do not issue duplicate mutations on resize. Visibility is presentation, never authorization.

Provide touch-sized controls, keyboard operation, and non-drag alternatives for essential gestures. Follow Core theme tokens, skeleton loading and performance requirements. Avoid refetching solely because the layout changes.

Test narrow, medium and wide containers, including loading, empty, denied and error states; long content; keyboard and touch; portrait/landscape; and folded → unfolded → folded continuity. Consult https://developer.apple.com/iphone-duo/ and its current linked guidance, applying Safari/web behavior rather than assuming native APIs exist on the web. Record emulated and physical-device evidence separately.

This records vNext design requirements. The panel registration contract will be proven with the first actual plugin; it does not add a core-v0 runtime API.
