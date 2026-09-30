function getAboutStoryEntryDirection(stage) {
  const scroller = stage.closest("[data-home-scroll-container]");
  if (!scroller) return "forward";

  const scrollerTop = scroller.getBoundingClientRect().top;
  const stageTop = stage.getBoundingClientRect().top;

  return stageTop < scrollerTop ? "reverse" : "forward";
}

function connectAboutDirectionalScrollGate(
  stage,
  direction,
  {
    windowTarget = window,
  } = {},
) {
  const scroller = stage.closest("[data-home-scroll-container]");
  if (!scroller) return () => {};

  let touchStartY = null;

  const preventScroll = (event) => {
    event.preventDefault();
    event.stopPropagation?.();
  };

  const handleWheel = (event) => {
    const movingThroughStory =
      direction === "reverse" ? event.deltaY < 0 : event.deltaY > 0;

    if (movingThroughStory) preventScroll(event);
  };

  const handleTouchStart = (event) => {
    touchStartY = event.touches?.[0]?.clientY ?? null;
  };

  const handleTouchMove = (event) => {
    const currentY = event.touches?.[0]?.clientY;
    if (touchStartY === null || !Number.isFinite(currentY)) return;

    const movingThroughStory =
      direction === "reverse"
        ? currentY > touchStartY
        : currentY < touchStartY;

    if (movingThroughStory) {
      preventScroll(event);
      return;
    }

    touchStartY = currentY;
  };

  const clearTouch = () => {
    touchStartY = null;
  };

  const scrollerRect = scroller.getBoundingClientRect();
  const stageRect = stage.getBoundingClientRect();
  const stageTop =
    scroller.scrollTop + stageRect.top - scrollerRect.top;

  const keepStoryAtBoundary = () => {
    const crossedBoundary =
      direction === "reverse"
        ? scroller.scrollTop < stageTop - 1
        : scroller.scrollTop > stageTop + 1;

    if (crossedBoundary) scroller.scrollTop = stageTop;
  };

  if (Math.abs(scroller.scrollTop - stageTop) > 1) {
    scroller.scrollTop = stageTop;
  }

  scroller.addEventListener("scroll", keepStoryAtBoundary, {
    passive: true,
  });
  scroller.addEventListener("wheel", handleWheel, {
    passive: false,
    capture: true,
  });
  scroller.addEventListener("touchstart", handleTouchStart, {
    passive: true,
    capture: true,
  });
  scroller.addEventListener("touchmove", handleTouchMove, {
    passive: false,
    capture: true,
  });
  scroller.addEventListener("touchend", clearTouch, true);
  scroller.addEventListener("touchcancel", clearTouch, true);
  windowTarget.addEventListener("blur", clearTouch);

  return () => {
    scroller.removeEventListener("scroll", keepStoryAtBoundary);
    scroller.removeEventListener("wheel", handleWheel, true);
    scroller.removeEventListener("touchstart", handleTouchStart, true);
    scroller.removeEventListener("touchmove", handleTouchMove, true);
    scroller.removeEventListener("touchend", clearTouch, true);
    scroller.removeEventListener("touchcancel", clearTouch, true);
    windowTarget.removeEventListener("blur", clearTouch);
  };
}

export {
  connectAboutDirectionalScrollGate,
  getAboutStoryEntryDirection,
};
