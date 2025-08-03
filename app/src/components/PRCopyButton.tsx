"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useExercisePRQuery } from "@/lib/queries/useExercisePRQuery";
import { PRSet } from "@/lib/types/record";

interface PRCopyButtonProps {
  exerciseId: number | undefined;
  onCopySets: (sets: PRSet[]) => void;
  disabled?: boolean;
}

export function PRCopyButton({ exerciseId, onCopySets, disabled = false }: PRCopyButtonProps) {
  const { data: prData, isLoading } = useExercisePRQuery(exerciseId);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!exerciseId || !prData?.pr) {
    return null;
  }

  const handleCopy = () => {
    if (prData.pr && prData.pr.sets) {
      onCopySets(prData.pr.sets);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000); // Hide success message after 2 seconds
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleCopy}
      disabled={disabled || isLoading}
      className="flex items-center gap-2"
    >
      {showSuccess ? (
        <>
          <Check className="h-4 w-4" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          Copy PR Sets
        </>
      )}
    </Button>
  );
} 