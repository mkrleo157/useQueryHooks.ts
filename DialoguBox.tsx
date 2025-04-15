import React, { ReactNode } from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import Button from "./Button";
import { FaXmark } from "react-icons/fa6";

const dialogVariants = cva("relative z-50", {
  variants: {
    variant: {
      default: "bg-white",
      gray: "bg-gray-50",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

interface DialogBackdropProps {
  onClick: () => void;
}

interface DialogPanelProps {
  variant?: "default" | "gray";
  className?: string;
  children: ReactNode;
  width?: string; // Allow width customization
}

interface DialogTitleProps {
  children: ReactNode;
  className?: string;
}

const DialogBackdrop: React.FC<DialogBackdropProps> = ({ onClick }) => (
  <div
    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
    onClick={onClick}
  />
);

const DialogPanel: React.FC<DialogPanelProps> = ({
  variant,
  className,
  children,
  width = "sm:max-w-md", // Default width if not provided
}) => (
  <div
    className={cn(
      dialogVariants({ variant, className }),
      `relative transform transition-all rounded-lg px-4 py-5 shadow-xl  ${width}`,
    )}
  >
    {children}
  </div>
);

const DialogTitle: React.FC<DialogTitleProps> = ({ children, className }) => (
  <h3
    className={`text-lg font-semibold text-gray-900 text-center ${className}`}
  >
    {children}
  </h3>
);

const Dialog: React.FC<DialogProps> = ({ open, onClose, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <DialogBackdrop onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

interface DialogPopupProps {
  title: string | React.ReactNode;
  content: string | React.ReactNode;
  onClose: () => void;
  open: boolean;
  variant?: "default" | "gray";
  className?: string;
  width?: string; // Allow width customization in DialogPopup
}

const DialogPopup: React.FC<DialogPopupProps> = ({
  title,
  content,
  onClose,
  open,
  variant,
  className,
  width,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogPanel variant={variant} className={className} width={width}>
        <div className="flex flex-row  items-center justify-between container">
          <DialogTitle className="text-left">{title}</DialogTitle>

          <Button variant="secondary" size="sm" type="button" onClick={onClose} className="absolute top-1 right-1">
            <span className="sr-only">Close panel</span>
            <FaXmark aria-hidden="true" className="h-5 w-7" />
          </Button>
        </div>

        <div className="mt-2 container mb-7">
          <p className="text-sm text-gray-500">{content}</p>
        </div>
      </DialogPanel>
    </Dialog>
  );
};

export default DialogPopup;
