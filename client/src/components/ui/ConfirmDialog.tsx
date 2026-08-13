import CommonButton from "./buttons/CommonButton";
import Modal from "./Modal";

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
    <Modal
      onClose={onCancel}
      width="sm"
      label={title}
      title={<h3 className="text-lg font-semibold text-ink">{title}</h3>}
    >
      <p className="text-sm text-dim">{message}</p>
      <div className="flex justify-end gap-3">
        <CommonButton onClick={onCancel} variant="secondary" size="sm">
          {cancelLabel}
        </CommonButton>
        <CommonButton onClick={onConfirm} variant="decline" size="sm">
          {confirmLabel}
        </CommonButton>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
