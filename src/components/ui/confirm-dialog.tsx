import * as DialogPrimitive from "@radix-ui/react-dialog"
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  variant?: "default" | "destructive"
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title = "Confirmar ação",
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  variant = "destructive",
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className={cn(
            "fixed z-50 grid w-full gap-4 border bg-background shadow-lg duration-200",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            // Mobile: tamanho compacto, centralizado, não ocupa 100% da tela
            "left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]",
            "max-w-[calc(100vw-2rem)] w-full",
            "rounded-lg",
            "p-5",
            "max-h-[90vh] overflow-y-auto",
            // Desktop: tamanho fixo compacto
            "sm:max-w-md",
            // Animações
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
            "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"
          )}
        >
          <DialogHeader>
            <div className="flex items-start gap-4">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                variant === "destructive" ? "bg-destructive/10" : "bg-primary/10"
              }`}>
                <AlertTriangle className={`h-5 w-5 ${
                  variant === "destructive" ? "text-destructive" : "text-primary"
                }`} />
              </div>
              <div className="flex-1 space-y-2">
                <DialogTitle className="text-left">{title}</DialogTitle>
                <DialogDescription className="text-left">
                  {description}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              {cancelText}
            </Button>
            <Button
              type="button"
              variant={variant}
              onClick={handleConfirm}
              className="w-full sm:w-auto"
            >
              {confirmText}
            </Button>
          </DialogFooter>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
}

