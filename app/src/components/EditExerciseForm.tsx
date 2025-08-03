"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Edit2 } from "lucide-react";
import { Exercise, UpdateExerciseRequest } from "@/lib/types/exercise";
import { ExercisesAPI } from "@/lib/api/exercises";

interface EditExerciseFormData {
  name: string;
  totalWeightMultiplier: boolean;
}

interface EditExerciseFormProps {
  exercise: Exercise;
  onSubmit: () => Promise<void>;
  isLoading?: boolean;
}

export function EditExerciseForm({ exercise, onSubmit, isLoading = false }: EditExerciseFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditExerciseFormData>({
    defaultValues: {
      name: exercise.name,
      totalWeightMultiplier: exercise.totalWeightMultiplier === 0.5,
    },
  });

  const handleFormSubmit = async (data: EditExerciseFormData) => {
    setIsSubmitting(true);
    
    try {
      const updateData: UpdateExerciseRequest = {
        name: data.name,
        totalWeightMultiplier: data.totalWeightMultiplier ? 0.5 : 1.0,
      };

      await ExercisesAPI.updateExercise(exercise.id, updateData);
      await onSubmit();
      
      // Reset form and close dialog
      reset();
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating exercise:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    reset();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit2 className="h-4 w-4 mr-1" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Exercise</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Exercise Name</Label>
            <Input
              id="name"
              placeholder="Enter exercise name"
              {...register("name", { 
                required: "Exercise name is required",
                minLength: {
                  value: 3,
                  message: "Exercise name must be at least 3 characters"
                }
              })}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="totalWeightMultiplier"
                {...register("totalWeightMultiplier")}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="totalWeightMultiplier"
                className="text-sm font-medium text-gray-700"
              >
                This exercise uses pulleys (halved weight)
              </label>
            </div>
            <p className="text-xs text-gray-500">
              Check this if the exercise uses pulleys or similar equipment that halves the effective weight
            </p>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </DialogClose>
            <Button 
              type="submit" 
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting ? "Updating..." : "Update Exercise"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 