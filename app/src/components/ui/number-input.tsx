import * as React from "react";
import { cn } from "@/lib/utils";

interface NumberInputProps extends Omit<React.ComponentProps<"input">, "type"> {
  step?: number | string;
  min?: number | string;
  max?: number | string;
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, min, max, ...props }, ref) => {
    // Convert string props to numbers, always use step=1
    const stepValue = 1; // Always use 1 as step
    const minValue = typeof min === "string" ? parseFloat(min) : min;
    const maxValue = typeof max === "string" ? parseFloat(max) : max;

    return (
      <input
        type="number"
        ref={ref}
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className,
        )}
        step={stepValue}
        min={minValue}
        max={maxValue}
        {...props}
      />
    );
  },
);

NumberInput.displayName = "NumberInput";

export { NumberInput };

