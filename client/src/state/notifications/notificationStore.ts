import { create } from "zustand";

export type NotificationKind = "info" | "success" | "error";

export type Notification = {
  id: string;
  kind: NotificationKind;
  message: string;
};

type NotificationStore = {
  notification: Notification | null;
  notify: (message: string, kind?: NotificationKind) => void;
  clearNotification: () => void;
};

export const useNotificationStore = create<NotificationStore>((set) => ({
  notification: null,
  notify: (message, kind = "info") =>
    set({
      notification: {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        kind,
        message,
      },
    }),
  clearNotification: () => set({ notification: null }),
}));
