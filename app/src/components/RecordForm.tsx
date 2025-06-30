"use client";

import React, { useState } from "react";
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
  exerciseId: z.number().min(1, "Please select an exercise").optional(),
  reps: z.array(repSchema).min(1, "At least one rep is required"),
  date: z.string().optional(),
});

type RecordFormData = z.infer<typeof recordSchema>;

interface RecordFormProps {
  onSuccess: () => void;
}

// Searchable Exercise Selector Component
interface Exercise {
  id: number;
  name: string;
}

interface SearchableExerciseSelectorProps {
  exercises: Exercise[];
  value?: number;
  onChange: (exerciseId: number | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
}

function SearchableExerciseSelector({ 
  exercises, 
  value, 
  onChange, 
  disabled = false,
  placeholder = "Search and select an exercise..." 
}: SearchableExerciseSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Update search term when value prop changes
  React.useEffect(() => {
    const exercise = value ? exercises.find(ex => ex.id === value) || null : null;
    setSearchTerm(exercise ? exercise.name : "");
  }, [value, exercises]);

  const filteredExercises = exercises.filter(exercise =>
    exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectExercise = (exercise: Exercise) => {
    setSearchTerm(exercise.name);
    setIsOpen(false);
    onChange(exercise.id);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    setIsOpen(true);
    
    // If the input is cleared, reset the selection
    if (term === "") {
      onChange(undefined);
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputBlur = () => {
    // Delay closing to allow for option selection
    setTimeout(() => setIsOpen(false), 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <Input
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full"
      />
      
      {isOpen && filteredExercises.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredExercises.map((exercise) => (
            <div
              key={exercise.id}
              className="px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground text-sm border-b border-border last:border-b-0"
              onMouseDown={() => handleSelectExercise(exercise)}
            >
              {exercise.name}
            </div>
          ))}
        </div>
      )}
      
              {isOpen && filteredExercises.length === 0 && searchTerm && (
          <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg">
            <div className="px-3 py-2 text-sm text-muted-foreground">
              No exercises found matching &quot;{searchTerm}&quot;
            </div>
          </div>
        )}
    </div>
  );
}

export function RecordForm({ onSuccess }: RecordFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDateField, setShowDateField] = useState(false);
  const { data: exerciseOptions, isLoading: exercisesLoading } =
    useExerciseOptionsQuery();
  
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const defaultValues: RecordFormData = {
    exerciseId: undefined,
    reps: [{ weight: "", feeling: "normal" }],
    date: getTodayDate(),
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
      if (!data.exerciseId || data.exerciseId < 1) {
        setError("Please select an exercise");
        return;
      }

      const request: CreateRecordRequest = {
        exerciseId: data.exerciseId,
        reps: data.reps.map(rep => ({
          weight: parseFloat(rep.weight),
          feeling: rep.feeling,
        })),
        ...(showDateField && data.date ? { date: data.date } : {}),
      };

      await RecordsAPI.createRecord(request);
      form.reset({
        exerciseId: undefined,
        reps: [{ weight: "", feeling: "normal" }],
        date: getTodayDate(),
      });
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
                    <SearchableExerciseSelector
                      exercises={exerciseOptions?.exercises || []}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={exercisesLoading}
                      placeholder={exercisesLoading ? "Loading exercises..." : "Search and select an exercise..."}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="show-date"
                  checked={showDateField}
                  onChange={(e) => setShowDateField(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="show-date" className="text-sm font-medium text-gray-700">
                  Set custom date
                </label>
              </div>

              {showDateField && (
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={field.value || getTodayDate()}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

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

