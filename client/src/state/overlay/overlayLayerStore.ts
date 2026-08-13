import { create } from "zustand";

type OverlayLayerStore = {
  layers: string[];
  push: (id: string) => void;
  pop: (id: string) => void;
};

export const useOverlayLayerStore = create<OverlayLayerStore>((set) => ({
  layers: [],
  push: (id) =>
    set((state) =>
      state.layers.includes(id) ? state : { layers: [...state.layers, id] },
    ),
  pop: (id) => set((state) => ({ layers: state.layers.filter((layer) => layer !== id) })),
}));

export const isTopLayer = (id: string) => {
  const { layers } = useOverlayLayerStore.getState();
  return layers[layers.length - 1] === id;
};
