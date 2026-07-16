import { TextBlock } from "../inputs/TextBlock";
import { useSheet, useSheetActions } from "@/state/sheet";

export const NotesBlock = () => {
  const notes = useSheet((s) => s.notes);
  const { setSharedField } = useSheetActions();

  return (
    <TextBlock title="Notes" value={notes} onChange={(v) => setSharedField("notes", v)} />
  );
};
