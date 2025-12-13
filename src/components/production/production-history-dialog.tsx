"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { History, Loader2, Undo2 } from "lucide-react";
import type { ProductionLogWithItems } from "@/actions/production";
import { undoProduction } from "@/actions/production";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

type ProductionHistoryDialogProps = {
  logs: ProductionLogWithItems[];
};

export function ProductionHistoryDialog({
  logs,
}: ProductionHistoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [undoLogId, setUndoLogId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleUndo = () => {
    if (!undoLogId) return;

    startTransition(async () => {
      try {
        await undoProduction(undoLogId);
        toast.success("Production undone. Stock restored.");
        setUndoLogId(null);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to undo production",
        );
      }
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <History />
            History
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Production History</DialogTitle>
          </DialogHeader>

          {logs.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              No production history yet.
            </p>
          ) : (
            <div className="max-h-[400px] overflow-x-hidden overflow-y-auto pr-2">
              <div className="space-y-3">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="bg-muted/50 flex items-center justify-between gap-3 rounded-lg p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">
                        {log.recipeName} × {parseFloat(log.quantity)}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {formatDistanceToNow(new Date(log.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setUndoLogId(log.id)}
                      disabled={isPending}
                    >
                      <Undo2 />
                      Undo
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!undoLogId} onOpenChange={() => setUndoLogId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Undo Production?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore the deducted inventory stock. This action cannot
              be reversed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUndo} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" />
                  Undoing...
                </>
              ) : (
                "Undo Production"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
