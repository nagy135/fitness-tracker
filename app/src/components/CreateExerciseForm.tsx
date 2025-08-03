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
import { Plus, X } from "lucide-react";

interface CreateExerciseFormData {
  name: string;
  primaryMuscles: string;
  instructions: string;
  totalWeightMultiplier: boolean;
}

interface CreateExerciseFormProps {
  onSubmit: (data: {
    name: string;
    primaryMuscles: string[];
    instructions: string;
    totalWeightMultiplier?: number;
  }) => Promise<void>;
  isLoading: boolean;
}

export function CreateExerciseForm({ onSubmit, isLoading }: CreateExerciseFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [muscles, setMuscles] = useState<string[]>([]);
  const [muscleInput, setMuscleInput] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateExerciseFormData>();

  const handleAddMuscle = () => {
    if (muscleInput.trim() && !muscles.includes(muscleInput.trim())) {
      setMuscles([...muscles, muscleInput.trim()]);
      setMuscleInput("");
    }
  };

  const handleRemoveMuscle = (muscle: string) => {
    setMuscles(muscles.filter((m) => m !== muscle));
  };

  const handleFormSubmit = async (data: CreateExerciseFormData) => {
    if (muscles.length === 0) {
      return;
    }
    
    try {
      await onSubmit({
        name: data.name,
        primaryMuscles: muscles,
        instructions: data.instructions,
        totalWeightMultiplier: data.totalWeightMultiplier ? 0.5 : 1.0,
      });
      
      // Reset form and close dialog
      reset();
      setMuscles([]);
      setMuscleInput("");
      setIsOpen(false);
    } catch (error) {
      console.error("Error creating exercise:", error);
    }
  };

  const handleCancel = () => {
    reset();
    setMuscles([]);
    setMuscleInput("");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Exercise
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Exercise</DialogTitle>
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
            <Label htmlFor="primaryMuscles">Primary Muscles</Label>
            <div className="flex gap-2">
              <Input
                id="primaryMuscles"
                placeholder="Add a muscle group"
                value={muscleInput}
                onChange={(e) => setMuscleInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddMuscle();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddMuscle}
                disabled={!muscleInput.trim()}
              >
                Add
              </Button>
            </div>
            {muscles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {muscles.map((muscle) => (
                  <span
                    key={muscle}
                    className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm"
                  >
                    {muscle}
                    <button
                      type="button"
                      onClick={() => handleRemoveMuscle(muscle)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            {muscles.length === 0 && (
              <p className="text-sm text-red-500">At least one muscle group is required</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions</Label>
            <textarea
              id="instructions"
              placeholder="Enter exercise instructions"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              {...register("instructions", {
                required: "Instructions are required",
                minLength: {
                  value: 10,
                  message: "Instructions must be at least 10 characters"
                }
              })}
            />
            {errors.instructions && (
              <p className="text-sm text-red-500">{errors.instructions.message}</p>
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
              disabled={isLoading || muscles.length === 0}
            >
              {isLoading ? "Creating..." : "Create Exercise"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 