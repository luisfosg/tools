import {
  Root,
  Portal,
  Overlay,
  Trigger,
  Content,
  Title,
  Description,
  Cancel,
  Action,
} from "@radix-ui/react-alert-dialog";

export default function ConfirmDialog({
  trigger,
  title,
  description,
  onConfirm,
  confirmLabel = "Eliminar",
  cancelLabel = "Cancelar",
  variant = "danger",
}: {
  trigger: React.ReactNode;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
}) {
  const confirmBg =
    variant === "danger"
      ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
      : "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500";

  return (
    <Root>
      <Trigger asChild>{trigger}</Trigger>
      <Portal>
        <Overlay className="fixed inset-0 z-50 bg-black/40 transition-all duration-200 data-[state=open]:opacity-100 data-[state=closed]:opacity-0" />
        <Content className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl ring-1 ring-gray-100 transition-all duration-200 data-[state=open]:scale-100 data-[state=open]:opacity-100 data-[state=closed]:scale-95 data-[state=closed]:opacity-0">
          <Title className="text-lg font-bold text-gray-800">{title}</Title>
          {description && (
            <Description className="mt-2 text-sm text-gray-500">
              {description}
            </Description>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <Cancel asChild>
              <button
                type="button"
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
              >
                {cancelLabel}
              </button>
            </Cancel>
            <Action asChild>
              <button
                type="button"
                onClick={onConfirm}
                className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${confirmBg}`}
              >
                {confirmLabel}
              </button>
            </Action>
          </div>
        </Content>
      </Portal>
    </Root>
  );
}
