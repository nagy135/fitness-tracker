import * as React from "react";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NumberInputProps extends Omit<React.ComponentProps<"input">, "type"> {
  step?: number | string;
  min?: number | string;
  max?: number | string;
  onValueChange?: (value: string) => void;
  secondaryStep?: number; // New prop for secondary increment/decrement
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, min, max, onValueChange, secondaryStep, ...props }, ref) => {
    // Convert string props to numbers, always use step=1
    const stepValue = 1; // Always use 1 as step
    const minValue = typeof min === "string" ? parseFloat(min) : min;
    const maxValue = typeof max === "string" ? parseFloat(max) : max;

    const getCurrentValue = () => {
      const numValue = parseFloat(props.value as string);
      // Always start from 0 when empty, regardless of min value
      // min value is only enforced when preventing going below it
      return isNaN(numValue) ? 0 : numValue;
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

    const handleSecondaryIncrement = () => {
      if (!secondaryStep) return;
      const currentValue = getCurrentValue();
      const newValue = currentValue + secondaryStep;
      if (maxValue === undefined || newValue <= maxValue) {
        const newValueString = newValue.toString();
        onValueChange?.(newValueString);
      }
    };

    const handleSecondaryDecrement = () => {
      if (!secondaryStep) return;
      const currentValue = getCurrentValue();
      const newValue = currentValue - secondaryStep;
      if (minValue === undefined || newValue >= minValue) {
        const newValueString = newValue.toString();
        onValueChange?.(newValueString);
      }
    };

    const currentValue = getCurrentValue();

    return (
      <div className="relative flex items-center">
        {/* Left group: -5 and - */}
        {secondaryStep ? (
          <div className="flex">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 w-9 rounded-none border-r-0 -mr-px"
              noPadding
              onClick={handleSecondaryDecrement}
              disabled={minValue !== undefined && currentValue - secondaryStep < minValue}
            >
              -{secondaryStep}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 w-9 rounded-none border-l-0 border-r-0 -mr-px"
              noPadding
              onClick={handleDecrement}
              disabled={minValue !== undefined && currentValue <= minValue}
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 w-9 rounded-r-none border-r-0 px-0"
            noPadding
            onClick={handleDecrement}
            disabled={minValue !== undefined && currentValue <= minValue}
          >
            <Minus className="h-4 w-4" />
          </Button>
        )}
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
        {/* Right group: + and +5 */}
        {secondaryStep ? (
          <div className="flex">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 w-9 rounded-none border-r-0 border-l-0 -mr-px"
              noPadding
              onClick={handleIncrement}
              disabled={maxValue !== undefined && currentValue >= maxValue}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 w-9 rounded-none border-l-0"
              noPadding
              onClick={handleSecondaryIncrement}
              disabled={maxValue !== undefined && currentValue + secondaryStep > maxValue}
            >
              +{secondaryStep}
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 w-9 rounded-l-none border-l-0 px-0"
            noPadding
            onClick={handleIncrement}
            disabled={maxValue !== undefined && currentValue >= maxValue}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  },
);

NumberInput.displayName = "NumberInput";

export { NumberInput };
