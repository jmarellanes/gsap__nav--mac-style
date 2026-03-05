/**
 * Creates a GSAP-based animation driver with reduced-motion support.
 * @param {{
 *   gsap: {
 *     killTweensOf: (element: HTMLElement, props: string) => void
 *     to: (element: HTMLElement, vars: Record<string, string | number>) => void
 *   }
 *   motion: unknown
 * }} options
 */
export function createMotionDriver(options) {
  const { gsap } = options;

  function prefersReducedMotion() {
    if (typeof window.matchMedia !== "function") {
      return false;
    }

    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /**
   * Resolves tween duration with immediate and reduced motion support.
   * @param {number} duration
   * @param {boolean} immediate
   * @returns {number} Resolved duration in seconds.
   */
  function resolveDuration(duration, immediate) {
    if (immediate || prefersReducedMotion()) {
      return 0;
    }

    return duration;
  }

  /**
   * Runs a GSAP tween with overwrite-safe behavior for selected properties.
   * @param {HTMLElement} element
   * @param {Record<string, string | number>} vars
   * @param {{ duration: number, ease: string, immediate?: boolean, killProps: string[] }} tweenOptions
   */
  function tweenElement(element, vars, tweenOptions) {
    const {
      duration,
      ease,
      immediate = false,
      killProps,
    } = tweenOptions;

    gsap.killTweensOf(element, killProps.join(","));
    gsap.to(element, {
      ...vars,
      duration: resolveDuration(duration, immediate),
      ease,
      overwrite: "auto",
    });
  }

  return {
    tweenElement,
  };
}
