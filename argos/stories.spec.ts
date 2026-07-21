import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { test } from '@playwright/test';
import { argosScreenshot } from '@argos-ci/playwright';

interface StoryIndex {
  entries: Record<
    string,
    { id: string; title: string; name: string; type: string }
  >;
}

interface ChromaticParameters {
  disableSnapshot?: boolean;
  disable?: boolean;
  delay?: number;
  viewports?: number[];
}

const indexPath = fileURLToPath(
  new URL('../storybook_dist/index.json', import.meta.url),
);
const index = JSON.parse(readFileSync(indexPath, 'utf-8')) as StoryIndex;

// `ARGOS_ONLY=components-live-label--localised,...` narrows a local run to the
// stories being investigated instead of the whole index.
const only = process.env.ARGOS_ONLY?.split(',').map(s => s.trim());

const stories = Object.values(index.entries).filter(
  entry => entry.type === 'story' && (!only || only.includes(entry.id)),
);

// The width Chromatic uses when a story pins no viewport of its own.
const DEFAULT_VIEWPORT = { width: 1280, height: 900 };

for (const story of stories) {
  test(`${story.title} › ${story.name}`, async ({ page }) => {
    // `.storybook/preview.tsx` calls `forceVisible()` from react-lazyload when
    // `isChromatic()` is true, so without this flag every lazily mounted promo
    // stays blank here while it is captured in the current runs.
    const storyUrl = `/iframe.html?id=${story.id}&viewMode=story&chromatic=true`;

    // Storybook 10 tracks renders in `storyRenders` rather than exposing a
    // single `currentRender`, and the array can hold a previous render that is
    // still unmounting, so look this story up by id.
    const waitForRender = async () => {
      await page.waitForFunction(
        id =>
          (
            window as unknown as {
              __STORYBOOK_PREVIEW__?: {
                storyRenders?: { id?: string; phase?: string }[];
              };
            }
          ).__STORYBOOK_PREVIEW__?.storyRenders?.some(
            render =>
              render.id === id &&
              (render.phase === 'completed' || render.phase === 'finished'),
          ) === true,
        id,
      );
    };

    const readChromaticParameters = async () =>
      await page.evaluate(
        id =>
          (
            window as unknown as {
              __STORYBOOK_PREVIEW__?: {
                storyRenders?: {
                  id?: string;
                  story?: {
                    parameters?: { chromatic?: ChromaticParameters };
                  };
                }[];
              };
            }
          ).__STORYBOOK_PREVIEW__?.storyRenders?.find(
            render => render.id === id,
          )?.story?.parameters?.chromatic ?? null,
        id,
      );

    const id = story.id;

    await page.setViewportSize(DEFAULT_VIEWPORT);
    await page.goto(storyUrl);
    await waitForRender();

    const parameters = await readChromaticParameters();

    // Stories that opt out of snapshots today keep opting out.
    test.skip(
      parameters?.disableSnapshot === true || parameters?.disable === true,
      'story opts out of snapshots (chromatic parameter)',
    );

    // A story that pins its own `chromatic: { viewports: [...] }` is captured
    // at those widths and nowhere else, same as today.
    const viewports = parameters?.viewports?.length
      ? parameters.viewports
      : [DEFAULT_VIEWPORT.width];

    for (const width of viewports) {
      if (width !== DEFAULT_VIEWPORT.width || viewports.length > 1) {
        await page.setViewportSize({ width, height: DEFAULT_VIEWPORT.height });
        await page.goto(storyUrl);
        await waitForRender();
      }

      // `preview.tsx` sets `chromatic: { delay: 5000 }` globally and a few
      // stories raise it; honour whatever the story asks for so the capture
      // lands at the same moment it does today.
      if (parameters?.delay) {
        await page.waitForTimeout(parameters.delay);
      }

      // Reith and the Noto faces are preloaded in `previewHead`, and a capture
      // taken before they land measures the fallback font.
      await page.evaluate(async () => await document.fonts.ready);

      // `fonts.ready` says the faces are loaded, not that the text already on
      // screen has been rasterised with them. A one-pixel round trip on the
      // viewport forces the layout and the repaint before the capture.
      await page.setViewportSize({ width: width + 1, height: DEFAULT_VIEWPORT.height });
      await page.setViewportSize({ width, height: DEFAULT_VIEWPORT.height });

      // Carousels and scrolling lists can settle on an arbitrary offset: pin
      // every scroll position before capturing.
      await page.evaluate(() => {
        for (const el of Array.from(document.querySelectorAll('*'))) {
          if (el.scrollLeft !== 0) el.scrollLeft = 0;
          if (el.scrollTop !== 0) el.scrollTop = 0;
        }
      });

      // Some stories exist to show a persistent loading state and stay
      // `aria-busy` for as long as they are mounted. Read that off the DOM
      // rather than guessing from the story name.
      const staysBusy = await page.evaluate(
        () => document.querySelector('[aria-busy="true"]') !== null,
      );

      const name = viewports.length > 1 ? `${id}-${width}` : id;

      // Capture the body rather than the viewport: its box is exactly the
      // rendered story (50px tall for a Live Label story, 472px for Billboard),
      // which keeps a small change from being diluted in empty canvas. Portals
      // mount into the body, so overlays stay in frame.
      await argosScreenshot(page, name, {
        element: 'body',
        stabilize: { waitForAriaBusy: !staysBusy },
      });
    }
  });
}
