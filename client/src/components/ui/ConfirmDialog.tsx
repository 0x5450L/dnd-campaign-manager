import CommonButton from "./buttons/CommonButton";

type ConfirmDialogProps = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onCancel}
    >
      <div
        className="bg-surface border border-rule rounded-xl p-6 max-w-sm w-full mx-4 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-ink">{title}</h3>
        <p className="text-sm text-dim">{message}</p>
        <div className="flex gap-3 justify-end">
          <CommonButton onClick={onCancel} variant="secondary" size="sm">
            {cancelLabel}
          </CommonButton>
          <CommonButton onClick={onConfirm} variant="decline" size="sm">
            {confirmLabel}
          </CommonButton>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
