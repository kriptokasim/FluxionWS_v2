
"use client";

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
import { Textarea } from "../ui/textarea";
import { useState } from "react";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

interface HumanApprovalModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  draftText: string;
  onApprove: (approvedText: string) => void;
  onReject: () => void;
  isPending: boolean;
}

export function HumanApprovalModal({ 
  isOpen, 
  onOpenChange, 
  draftText, 
  onApprove, 
  onReject,
  isPending,
}: HumanApprovalModalProps) {
    const [editedText, setEditedText] = useState(draftText);

    const handleApprove = () => {
        onApprove(editedText);
    }
  
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Human Approval Required</AlertDialogTitle>
          <AlertDialogDescription>
            Please review and edit the draft below. Approve to continue the flow, or reject to stop.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
            <Textarea 
                defaultValue={draftText}
                onChange={(e) => setEditedText(e.target.value)}
                className="h-64 text-sm"
                disabled={isPending}
            />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onReject} disabled={isPending}>Reject</AlertDialogCancel>
          <Button onClick={handleApprove} disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Approve & Continue
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
