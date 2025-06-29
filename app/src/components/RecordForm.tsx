"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useExerciseOptionsQuery } from "@/lib/queries/useExerciseOptionsQuery";
import { RecordsAPI } from "@/lib/api/records";
import { CreateRecordRequest } from "@/lib/types/record";

const repSchema = z.object({
  weight: z.string().min(1, "Weight is required").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    "Weight must be a positive number"
  ),
  feeling: z.enum(["easy", "normal", "hard"], {
    required_error: "Please select how the rep felt",
  }),
});

const recordSchema = z.object({
  exerciseId: z.number().min(1, "Please select an exercise"),
  reps: z.array(repSchema).min(1, "At least one rep is required"),
});

type RecordFormData = z.infer<typeof recordSchema>;

interface RecordFormProps {
  onSuccess: () => void;
}

export function RecordForm({ onSuccess }: RecordFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: exerciseOptions, isLoading: exercisesLoading } =
    useExerciseOptionsQuery();

  const defaultValues: RecordFormData = {
    exerciseId: 0,
    reps: [{ weight: "", feeling: "normal" }],
  };

  const form = useForm<RecordFormData>({
    resolver: zodResolver(recordSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "reps",
  });

  const onSubmit = async (data: RecordFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const request: CreateRecordRequest = {
        exerciseId: data.exerciseId,
        reps: data.reps.map(rep => ({
          weight: parseFloat(rep.weight),
          feeling: rep.feeling,
        })),
      };

      await RecordsAPI.createRecord(request);
      form.reset(defaultValues);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create record");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addRep = () => {
    append({ weight: "", feeling: "normal" });
  };

  const removeRep = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Add New Record</CardTitle>
        <CardDescription>Record your workout performance</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="exerciseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exercise</FormLabel>
                  <FormControl>
                    <Select
                      placeholder="Select an exercise"
                      {...field}
                      value={field.value?.toString() || ""}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || undefined)
                      }
                      disabled={exercisesLoading}
                    >
                      {exerciseOptions?.exercises.map((exercise) => (
                        <option key={exercise.id} value={exercise.id}>
                          {exercise.name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel className="text-base font-medium">Reps</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addRep}
                >
                  Add Rep
                </Button>
              </div>

              {fields.map((field, index) => (
                <Card key={field.id} className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-1 space-y-4">
                      <FormField
                        control={form.control}
                        name={`reps.${index}.weight`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weight (kg)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.1"
                                min="0"
                                placeholder="Enter weight"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`reps.${index}.feeling`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>How did it feel?</FormLabel>
                            <FormControl>
                              <Select placeholder="Select feeling" {...field}>
                                <option value="easy">Easy</option>
                                <option value="normal">Normal</option>
                                <option value="hard">Hard</option>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeRep(index)}
                        className="mt-6"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || exercisesLoading}
            >
              {isSubmitting ? "Creating..." : "Create Record"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

