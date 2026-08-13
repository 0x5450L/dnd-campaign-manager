let lockCount = 0;
let restoredOverflow = "";

export const lockBodyScroll = () => {
  if (lockCount === 0) {
    restoredOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  lockCount += 1;

  return () => {
    lockCount -= 1;
    if (lockCount === 0) {
      document.body.style.overflow = restoredOverflow;
    }
  };
};
