import { useEffect, useId, useRef } from "react";
import { isTopLayer, useOverlayLayerStore } from "@/state/overlay/overlayLayerStore";
import { lockBodyScroll } from "@/utils/bodyScrollLock";

type OverlayLayerOptions = {
  enabled?: boolean;
  lockScroll?: boolean;
};

export const useOverlayLayer = (
  onEscape: () => void,
  { enabled = true, lockScroll = false }: OverlayLayerOptions = {},
) => {
  const id = useId();
  const push = useOverlayLayerStore((s) => s.push);
  const pop = useOverlayLayerStore((s) => s.pop);
  const depth = useOverlayLayerStore((s) => s.layers.indexOf(id));
  const escapeRef = useRef(onEscape);

  useEffect(() => {
    escapeRef.current = onEscape;
  });

  useEffect(() => {
    if (!enabled) return;
    push(id);
    return () => pop(id);
  }, [enabled, id, push, pop]);

  useEffect(() => {
    if (!enabled || !lockScroll) return;
    return lockBodyScroll();
  }, [enabled, lockScroll]);

  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !isTopLayer(id)) return;
      escapeRef.current();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, id]);

  return { depth: Math.max(depth, 0) };
};
