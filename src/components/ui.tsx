"use client";
import { ButtonHTMLAttributes, ReactNode, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { statusLabel, Status, Role, Locale } from "@/lib/model";
export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  return (
    <button className={"button " + variant + " " + className} {...props} />
  );
}
export function StatusBadge({
  status,
  role,
  locale,
}: {
  status: Status;
  role: Role;
  locale: Locale;
}) {
  const tone =
    status === "APPROVED"
      ? "green"
      : status === "COMPLETED"
        ? "gray"
        : status === "CANCELLED"
          ? "red"
          : ["REVISED", "ADJUSTED"].includes(status)
            ? "orange"
            : status === "PENDING_APPROVAL" && role !== "REQUESTER"
              ? "purple"
              : "blue";
  return (
    <span className={"badge " + tone}>
      <span className="badge-dot" />
      {statusLabel(status, role, locale)}
    </span>
  );
}
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  drawer = false,
  closeLabel = "Close",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  drawer?: boolean;
  closeLabel?: string;
}) {
  const returnFocus = useRef<HTMLElement | null>(null);
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content
          className={drawer ? "modal-content drawer" : "modal-content"}
          onOpenAutoFocus={() => {
            returnFocus.current =
              document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;
          }}
          onCloseAutoFocus={(event) => {
            if (returnFocus.current?.isConnected) {
              event.preventDefault();
              returnFocus.current.focus();
            }
          }}
        >
          <div className="modal-heading">
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Close className="icon-button" aria-label={closeLabel}>
              <XMarkIcon />
            </Dialog.Close>
          </div>
          <Dialog.Description
            className={description ? "modal-description" : "sr-only"}
          >
            {description ?? title}
          </Dialog.Description>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
