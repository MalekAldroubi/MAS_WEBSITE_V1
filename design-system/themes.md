# MAS color themes

The website uses one shared semantic palette in `styles.css`. Page markup should
never be duplicated to test a new color set.

## Original

Use `?theme=original` on any website URL to select and remember the approved
baseline palette.

| Role | Token | Original value |
| --- | --- | --- |
| Primary dark | `--color-primary` | `#30231b` |
| Primary hover | `--color-primary-hover` | `#433126` |
| Accent / CTA | `--color-accent` | `#b66d35` |
| Background | `--color-background` | `#fcfaf6` |
| Alternate background | `--color-background-alt` | `#f6f2eb` |
| Highlight | `--color-highlight` | `#dec59f` |
| Secondary | `--color-secondary` | `#28514e` |
| Text | `--color-text` | `#28231f` |
| Muted text | `--color-text-muted` | `#756c65` |
| Border | `--color-border` | `#ddd5ca` |
| White / on-dark | `--color-white` | `#fff` |

Add each future palette as a `[data-theme="theme-name"]` block that overrides
these semantic tokens. The legacy aliases below the semantic tokens exist so the
current interface remains unchanged while themes are introduced incrementally.

## Blue option

Use `?theme=blue` on any website URL, or select Blue from the temporary Colors
menu in the header. The selection persists while navigating between pages.

| Brand color | Hex | Website role |
| --- | --- | --- |
| Navy Blue | `#0D2C4D` | Primary dark surfaces and foreground text |
| Royal Blue | `#1E5AA8` | Accent, links, controls, and CTAs |
| Silver | `#C0C6CE` | Borders, dividers, and decorative highlights |
| Arctic White | `#F5F8FB` | Main page background |

Supporting tints such as muted text and hover colors are derived from these four
brand colors to preserve readable contrast. The blue logo asset maps its original
dark structure to Navy, copper accents to Royal Blue, and gold details to Silver.

## Green option

Use `?theme=green` on any website URL, or select Green from the temporary Colors
menu in the header. The selection persists while navigating between pages.

| Brand color | Hex | Website role |
| --- | --- | --- |
| Forest Green | `#0B5D4B` | Primary dark surfaces and foreground text |
| Emerald Green | `#18A67A` | Accent, links, controls, and CTAs |
| Silver | `#D6D9DD` | Borders, dividers, and decorative highlights |
| Pure White | `#FFFFFF` | Main page background |

The green logo maps its dark structure to Forest Green, accent details to
Emerald Green, and metallic details to Silver. Supporting tints are derived from
the supplied palette for readable text, hover states, and layered dark surfaces.
