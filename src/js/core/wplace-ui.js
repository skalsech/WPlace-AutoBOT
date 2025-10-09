/**
 * @fileoverview Handles direct UI interactions with the WPlace page (DOM manipulation).
 *               Separated from API logic to improve modularity.
 */

class WPlaceUI {
  /**
   * Closes the paint menu if it is currently open.
   *
   * The method locates the close button within the paint panel by searching for an SVG path
   * unique to the close icon. If found, it dispatches a synthetic click event and waits briefly
   * for the UI to update.
   *
   * @async
   * @returns {Promise<void>} Resolves when the close action has been attempted.
   */
  async closePaintMenu() {
    const closeBtnPath =
      'm256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z';

    const closeBtn = document
      .querySelector(
        `div.absolute.bottom-0.left-0.z-50.w-full button svg path[d="${closeBtnPath}"]`
      )
      ?.closest('button');

    if (closeBtn) {
      const clickEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
      });
      closeBtn.dispatchEvent(clickEvent);
      await new Promise((resolve) => setTimeout(resolve, 250));
    } else {
      console.warn(
        '   Close button for paint menu not found (menu might be already closed or structure changed).'
      );
    }
  }

  /**
   * Forces a refresh of map tiles by temporarily overriding the document visibility state.
   *
   * This method simulates a visibility change to trigger a redraw with reload of tiles currently visible on the canvas.
   * It works by overriding `document.hidden` to always return `false`, dispatching a
   * `visibilitychange` event, and restoring the original state afterward.
   *
   * If the paint menu was open before the refresh, it will be closed automatically afterward
   * via {@link WPlaceUI#closePaintMenu closePaintMenu()}.
   *
   * @async
   * @returns {Promise<void>} Resolves when the tile refresh process is completed.
   */
  async forceRefreshCanvas() {
    const paintButtonContainer = document.querySelector(
      'div.absolute.bottom-3.left-1\\/2.z-30.-translate-x-1\\/2'
    );

    let menuWasOpen = false;

    if (!paintButtonContainer) {
      menuWasOpen = true;
    } else {
      const paintButton = paintButtonContainer.querySelector(
        'button.btn.btn-primary.btn-lg.sm\\:btn-xl'
      );
      if (paintButton) {
        const clickEvent = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true,
        });
        paintButton.dispatchEvent(clickEvent);
        await new Promise((resolve) => setTimeout(resolve, 100));
      } else {
        menuWasOpen = true;
        console.error('Paint button not found inside container.');
      }
    }
    if (menuWasOpen) {
      const originalHiddenDescriptor = Object.getOwnPropertyDescriptor(
        Document.prototype,
        'hidden'
      );
      Object.defineProperty(document, 'hidden', {
        get() {
          return false;
        },
        configurable: true,
      });
      document.dispatchEvent(new Event('visibilitychange'));
      if (originalHiddenDescriptor) {
        Object.defineProperty(document, 'hidden', originalHiddenDescriptor);
      }
    } else {
      await this.closePaintMenu();
    }
  }
}

export const wplaceUI = new WPlaceUI();
