import * as React from "react";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NumberInputProps extends Omit<React.ComponentProps<"input">, "type"> {
  step?: number | string;
  min?: number | string;
  max?: number | string;
  onValueChange?: (value: string) => void;
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, min, max, onValueChange, ...props }, ref) => {
    // Convert string props to numbers, always use step=1
    const stepValue = 1; // Always use 1 as step
    const minValue = typeof min === "string" ? parseFloat(min) : min;
    const maxValue = typeof max === "string" ? parseFloat(max) : max;

    const getCurrentValue = () => {
      const numValue = parseFloat(props.value as string);
      return isNaN(numValue) ? minValue || 0 : numValue;
    };

    const handleIncrement = () => {
      const currentValue = getCurrentValue();
      const newValue = currentValue + stepValue;
      if (maxValue === undefined || newValue <= maxValue) {
        const newValueString = newValue.toString();
        onValueChange?.(newValueString);
      }
    };

    const handleDecrement = () => {
      const currentValue = getCurrentValue();
      const newValue = currentValue - stepValue;
      if (minValue === undefined || newValue >= minValue) {
        const newValueString = newValue.toString();
        onValueChange?.(newValueString);
      }
    };

    const currentValue = getCurrentValue();

    return (
      <div className="relative flex items-center">
        {/* Minus button on the left */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 w-9 rounded-r-none border-r-0"
          onClick={handleDecrement}
          disabled={minValue !== undefined && currentValue <= minValue}
        >
          <Minus className="h-4 w-4" />
        </Button>

        {/* Input field in the middle */}
        <input
          type="number"
          ref={ref}
          className={cn(
            "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm text-center",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            "rounded-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
            className,
          )}
          value={props.value}
          onChange={(e) => onValueChange?.(e.target.value)}
          step={stepValue}
          min={minValue}
          max={maxValue}
          {...props}
        />

        {/* Plus button on the right */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 w-9 rounded-l-none border-l-0"
          onClick={handleIncrement}
          disabled={maxValue !== undefined && currentValue >= maxValue}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    );
  },
);

NumberInput.displayName = "NumberInput";

export { NumberInput };
