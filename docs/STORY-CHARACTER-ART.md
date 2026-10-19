# Story character art — brief and workflow

The story screens show portraits of four characters in nine moods. Until real art
exists, the app shows a plain nameplate circle (a letter on a coloured disc); it never shows a
broken image. Drop finished files into `public/story/<slug>/<mood>.png` and they appear
automatically (a missing mood falls back to that character's `neutral.png`).

| Character | Folder | Role |
|---|---|---|
| Pip | `public/story/pip/` | Young recruit; impulsive, funny, learns by getting it wrong |
| Warden Vale | `public/story/vale/` | Head of the Order; calm, dry, never panics; mentor |
| Archivist Ines | `public/story/ines/` | Keeper of the Golden Ledger; warm, wise (chapter 8 only) |
| The Broker | `public/story/broker/` | Hidden villain behind the Gray Fog; patient, smooth, never raises his voice |

Moods (file names): `neutral`, `content`, `happy`, `worried`, `surprised`, `determined`, `proud`, `sly`, `sad`.
Minimum useful set: `neutral`, `happy`, `worried`, `determined` for Pip and Vale.
Ines and the Broker are only needed in a few scenes: `neutral` plus the moods used in `src/config/chapters.ts` and `src/config/cityStory.ts` (search for `Archivist Ines` / `The Broker`).

## Match the existing avatars (this is the whole point)

The 12 avatars in `public/avatars/` are one consistent style. Describe that style in every prompt:

> Graphic-novel character portrait, shoulders-up, facing the viewer. Bold clean black outlines, flat colours with soft cel shading, semi-realistic proportions, expressive eyes. Plain flat background. No text, no watermark, no frame.

Use the SAME generator for the story characters as for the avatars (Gemini). Mixing generators
produces visibly different line weights and faces; consistency matters more than which tool is "best".

## Workflow (per character)

1. **Master image.** Generate one neutral portrait from the character description below. Regenerate until it is right.
2. **Variations.** In the same chat, attach the master image and ask for each mood:
   *"Same character, same outfit, same lighting and style. Only change the expression to: worried (brows pulled up in the middle, small frown). Keep the head the same size and in the same position. Plain flat background."*
3. **Background.** Ask for a plain, flat, single-colour background (e.g. solid light grey). Do NOT ask for a
   "transparent background": the generator draws a fake checkerboard into the picture. Transparency is done afterwards.
4. **Size.** Square, 1024 x 1024 is fine; they are shrunk to 512 x 512.
5. **Watermark.** The free tier adds a small sparkle in the bottom-right corner. Leave room around the figure so it can be removed.
6. **Hand-over.** Save the raw images in `D:\SpendXP Main\story-art-raw\` named `pip-neutral.png`, `pip-happy.png`, `vale-worried.png`, etc.,
   and ask for them to be cleaned. Cleaning = remove the background and stray specks, remove the sparkle, resize to 512, rename into place.

## Character briefs (adjust freely; keep them clearly different from each other and from the 12 avatars)

- **Pip** — a bright, restless young recruit, about 12–14. Round-ish face, messy hair with one tuft, freckles, big expressive eyes, a teal scarf or collar. Always looks like he is about to say something.
- **Warden Vale** — a calm, composed man in his 50s. Silver-streaked swept-back hair, small round glasses, a high deep-green collar with gold trim. Dry half-smile. Authority without sternness.
- **Archivist Ines** — a warm woman in her 60s. White hair in a bun, rectangular glasses, small gold earrings, a burgundy collar. Kind, precise.
- **The Broker** — never fully human-looking: a pale, smooth mask-like face inside a deep dark hood, hollow dark eyes with a faint grey glint, a thin patient smile. Unsettling but not gory; this is a children's app.

## Mood notes (so the expressions read clearly at small size)

- `neutral` calm, relaxed brows  - `content` eyes softly closed, gentle smile  - `happy` open smile, raised brows
- `worried` brows pulled up in the middle, small frown, maybe a sweat drop  - `surprised` wide eyes, raised brows, small round mouth
- `determined` brows angled down toward the nose, firm mouth  - `proud` closed-eye smile, chin slightly up
- `sly` one brow raised, half-lidded eyes, smirk  - `sad` brows up in the middle, downturned mouth

## Free AI image tools — notes (verify current terms before shipping; they change often)

- Stay with **Gemini** for consistency with the avatars. Its free images carry a visible sparkle and an invisible SynthID mark; commercial-use wording is more restrictive than some alternatives, so read Google's current terms.
- **Leonardo AI** — good character consistency; free daily tokens; reviewers disagree on whether free outputs carry commercial rights, and free creations are public by default.
- **Ideogram** — free tier reportedly allows commercial use but outputs are public by default.
- **Adobe Firefly** — the clearest licensing (trained on licensed content); only about 25 free generations a month.
- **Microsoft Designer / Copilot** — generous free use; character consistency is weak.
- **Krea** — free plan reportedly has no commercial rights.
- **Self-hosted FLUX / Stable Diffusion** — free but needs technical skill and a GPU.
- Whatever you use: AI-generated art has an uncertain copyright status in many countries, so keep the prompts and the generation dates, and avoid prompts that name real people or existing characters.
