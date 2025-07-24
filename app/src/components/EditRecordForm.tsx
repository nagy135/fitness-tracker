"use client";

import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useExerciseOptionsQuery } from "@/lib/queries/useExerciseOptionsQuery";
import { useUpdateRecordMutation } from "@/lib/queries/useUpdateRecordMutation";
import { Record, UpdateRecordRequest } from "@/lib/types/record";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { PRComparisonDisplay } from "@/components/PRComparisonDisplay";
import { PreviousRecordsSummary } from "@/components/PreviousRecordsSummary";

const setSchema = z.object({
  reps: z
    .string()
    .min(1, "Reps is required")
    .refine(
      (val) => !isNaN(parseInt(val)) && parseInt(val) > 0,
      "Reps must be a positive number",
    ),
  weight: z
    .string()
    .min(1, "Weight is required")
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      "Weight must be a positive number",
    ),
});

const updateRecordSchema = z.object({
  exerciseId: z.number().min(1, "Please select an exercise"),
  sets: z.array(setSchema).min(1, "At least one set is required"),
  date: z.string().optional(),
});

type UpdateRecordFormData = z.infer<typeof updateRecordSchema>;

interface Exercise {
  id: number;
  name: string;
}

interface ExerciseSelectorProps {
  exercises: Exercise[];
  value: number;
  onChange: (exerciseId: number) => void;
  disabled?: boolean;
  exerciseRecordCounts?: { [exerciseId: number]: number }; // New prop for record counts
}

function ExerciseSelector({
  exercises,
  value,
  onChange,
  disabled = false,
  exerciseRecordCounts = {},
}: ExerciseSelectorProps) {
  // Sort exercises by record count (descending), then by name (ascending) for ties
  const sortedExercises = [...exercises].sort((a, b) => {
    const countA = exerciseRecordCounts[a.id] || 0;
    const countB = exerciseRecordCounts[b.id] || 0;

    if (countB !== countA) {
      return countB - countA; // Higher count first
    }

    return a.name.localeCompare(b.name); // Alphabetical for ties
  });

  return (
    <select
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      disabled={disabled}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      <option value="">Select an exercise</option>
      {sortedExercises.map((exercise) => {
        const recordCount = exerciseRecordCounts[exercise.id] || 0;
        return (
          <option key={exercise.id} value={exercise.id}>
            {exercise.name}
            {recordCount > 0 ? ` (${recordCount}x)` : ""}
          </option>
        );
      })}
    </select>
  );
}

interface EditRecordFormProps {
  record: Record;
  onSuccess: () => void;
  exerciseRecordCounts?: { [exerciseId: number]: number }; // New prop for record counts
  records?: Record[]; // Records data for previous records summary
}

export function EditRecordForm({
  record,
  onSuccess,
  exerciseRecordCounts = {},
  records = [],
}: EditRecordFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: exerciseOptions, isLoading: exercisesLoading } =
    useExerciseOptionsQuery();
  const { updateRecord, isLoading: isUpdating } = useUpdateRecordMutation();

  // Prepare initial values from the record
  const getInitialValues = React.useCallback((): UpdateRecordFormData => {
    return {
      exerciseId: record.exerciseId,
      sets: record.sets.map((set) => ({
        reps: set.reps.toString(),
        weight: set.weight.toString(),
      })),
      date: record.date ? record.date.split("T")[0] : "",
    };
  }, [record]);

  const form = useForm<UpdateRecordFormData>({
    resolver: zodResolver(updateRecordSchema),
    defaultValues: getInitialValues(),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "sets",
  });

  const onSubmit = async (data: UpdateRecordFormData) => {
    try {
      const updateData: UpdateRecordRequest = {
        exerciseId: data.exerciseId,
        sets: data.sets.map((set) => ({
          reps: parseInt(set.reps),
          weight: parseFloat(set.weight),
        })),
        date: data.date || undefined,
      };

      await updateRecord(record.id, updateData);
      onSuccess();
      setIsOpen(false);
      form.reset(getInitialValues());
    } catch (error) {
      console.error("Error updating record:", error);
    }
  };

  const addSet = () => {
    if (fields.length > 0) {
      const lastSet = fields[fields.length - 1];
      append({ reps: lastSet.reps, weight: lastSet.weight });
    } else {
      append({ reps: "", weight: "" });
    }
  };

  const removeSet = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const handleCancel = () => {
    form.reset(getInitialValues());
    setIsOpen(false);
  };

  // Reset form when record changes or dialog opens
  React.useEffect(() => {
    if (isOpen) {
      form.reset(getInitialValues());
    }
  }, [record, isOpen, form, getInitialValues]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit2 className="h-4 w-4 mr-1" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Record</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Exercise Selection */}
          <div className="space-y-2">
            <Label htmlFor="exercise">Exercise</Label>
            {exercisesLoading ? (
              <div className="text-sm text-gray-500">Loading exercises...</div>
            ) : (
              <ExerciseSelector
                exercises={exerciseOptions?.exercises || []}
                value={form.watch("exerciseId")}
                onChange={(exerciseId) =>
                  form.setValue("exerciseId", exerciseId)
                }
                exerciseRecordCounts={exerciseRecordCounts}
              />
            )}
            {form.formState.errors.exerciseId && (
              <p className="text-sm text-red-500">
                {form.formState.errors.exerciseId.message}
              </p>
            )}
          </div>

          {/* Previous Records Summary */}
          <PreviousRecordsSummary
            records={records}
            exerciseId={form.watch("exerciseId")}
          />

          {/* PR Comparison Display */}
          <PRComparisonDisplay
            exerciseId={form.watch("exerciseId")}
            currentSets={form.watch("sets")}
          />

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date (optional)</Label>
            <Input
              id="date"
              type="date"
              {...form.register("date")}
              className="w-full"
            />
          </div>

          {/* Sets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Sets</Label>
              <Button
                type="button"
                onClick={addSet}
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Set
              </Button>
            </div>

            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <div className="flex-1">
                    <NumberInput
                      placeholder="Reps"
                      min={1}
                      value={form.watch(`sets.${index}.reps`)}
                      onValueChange={(value) =>
                        form.setValue(`sets.${index}.reps`, value)
                      }
                    />
                    {form.formState.errors.sets?.[index]?.reps && (
                      <p className="text-xs text-red-500 mt-1">
                        {form.formState.errors.sets[index]?.reps?.message}
                      </p>
                    )}
                  </div>
                  <div className="flex-1">
                    <NumberInput
                      placeholder="Weight"
                      min={0}
                      value={form.watch(`sets.${index}.weight`)}
                      onValueChange={(value) =>
                        form.setValue(`sets.${index}.weight`, value)
                      }
                    />
                    {form.formState.errors.sets?.[index]?.weight && (
                      <p className="text-xs text-red-500 mt-1">
                        {form.formState.errors.sets[index]?.weight?.message}
                      </p>
                    )}
                  </div>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeSet(index)}
                      variant="outline"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

            </div>

            {form.formState.errors.sets?.root && (
              <p className="text-sm text-red-500">
                {form.formState.errors.sets.root.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update Record"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
