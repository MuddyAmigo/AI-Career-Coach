// app/resume/_components/experience-form.jsx
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { experienceSchema } from "@/app/lib/schema";
import { Sparkles, PlusCircle, X, Loader2 } from "lucide-react";
import { improveWithAI } from "@/actions/resume";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";

// Generate year options
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 50 }, (_, i) => currentYear - i);
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function ExperienceForm({ entries = [], onChange }) {
  const [isAdding, setIsAdding] = useState(false);

  const {
    register,
    handleSubmit: handleValidation,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      title: "",
      organization: "",
      location: "",
      startDate: "",
      endDate: "",
      description: "",
      current: false,
    },
  });

  const current = watch("current");
  const [startMonth, setStartMonth] = useState("");
  const [startYear, setStartYear] = useState("");
  const [endMonth, setEndMonth] = useState("");
  const [endYear, setEndYear] = useState("");

  // Update form value when month/year changes
  useEffect(() => {
    if (startMonth && startYear) {
      setValue("startDate", `${startMonth} ${startYear}`);
    }
  }, [startMonth, startYear, setValue]);

  useEffect(() => {
    if (endMonth && endYear) {
      setValue("endDate", `${endMonth} ${endYear}`);
    }
  }, [endMonth, endYear, setValue]);

  const handleAdd = handleValidation((data) => {
    onChange([...entries, data]);
    reset();
    setStartMonth("");
    setStartYear("");
    setEndMonth("");
    setEndYear("");
    setIsAdding(false);
  });

  const handleDelete = (index) => {
    const newEntries = entries.filter((_, i) => i !== index);
    onChange(newEntries);
  };

  const {
    loading: isImproving,
    fn: improveWithAIFn,
    data: improvedContent,
    error: improveError,
  } = useFetch(improveWithAI);

  useEffect(() => {
    if (improvedContent && !isImproving) {
      setValue("description", improvedContent);
      toast.success("Description improved successfully!");
    }
    if (improveError) {
      toast.error(improveError.message || "Failed to improve description");
    }
  }, [improvedContent, improveError, isImproving, setValue]);

  const handleImproveDescription = async () => {
    const description = watch("description");
    if (!description) {
      toast.error("Please enter a description first");
      return;
    }
    await improveWithAIFn({
      current: description,
      type: "experience",
    });
  };

  return (
    <div className="space-y-4">
      {/* Existing Entries */}
      <div className="space-y-4">
        {entries.map((item, index) => (
          <Card key={index} className="bg-slate-900/50 border-slate-600">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">
                {item.title} @ {item.organization}
              </CardTitle>
              <Button
                variant="outline"
                size="icon"
                type="button"
                onClick={() => handleDelete(index)}
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">
                {item.current
                  ? `${item.startDate} - Present`
                  : `${item.startDate} - ${item.endDate}`}
              </p>
              {item.location && (
                <p className="text-sm text-slate-500">{item.location}</p>
              )}
              <p className="mt-2 text-sm whitespace-pre-wrap text-slate-300">
                {item.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add New Entry Form */}
      {isAdding && (
        <Card className="bg-slate-900/50 border-slate-600">
          <CardHeader>
            <CardTitle className="text-slate-200">Add Work Experience</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Job Title *</label>
                <Input
                  placeholder="e.g. Software Engineer"
                  {...register("title")}
                  className="bg-slate-900 border-slate-600 text-slate-200"
                />
                {errors.title && (
                  <p className="text-sm text-red-400">{errors.title.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Company Name *</label>
                <Input
                  placeholder="e.g. Google"
                  {...register("organization")}
                  className="bg-slate-900 border-slate-600 text-slate-200"
                />
                {errors.organization && (
                  <p className="text-sm text-red-400">{errors.organization.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">Location (Optional)</label>
              <Input
                placeholder="e.g. San Francisco, CA"
                {...register("location")}
                className="bg-slate-900 border-slate-600 text-slate-200"
              />
            </div>

            {/* Date Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Start Date *</label>
                <div className="grid grid-cols-2 gap-2">
                  <Select value={startMonth} onValueChange={setStartMonth}>
                    <SelectTrigger className="bg-slate-900 border-slate-600 text-slate-200">
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month} value={month}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={startYear} onValueChange={setStartYear}>
                    <SelectTrigger className="bg-slate-900 border-slate-600 text-slate-200">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {errors.startDate && (
                  <p className="text-sm text-red-400">{errors.startDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-300">End Date</label>
                <div className="grid grid-cols-2 gap-2">
                  <Select 
                    value={endMonth} 
                    onValueChange={setEndMonth}
                    disabled={current}
                  >
                    <SelectTrigger className="bg-slate-900 border-slate-600 text-slate-200">
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month} value={month}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select 
                    value={endYear} 
                    onValueChange={setEndYear}
                    disabled={current}
                  >
                    <SelectTrigger className="bg-slate-900 border-slate-600 text-slate-200">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {errors.endDate && (
                  <p className="text-sm text-red-400">{errors.endDate.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="current-exp"
                {...register("current")}
                onChange={(e) => {
                  setValue("current", e.target.checked);
                  if (e.target.checked) {
                    setValue("endDate", "");
                    setEndMonth("");
                    setEndYear("");
                  }
                }}
                className="bg-slate-900 border-slate-600"
              />
              <label htmlFor="current-exp" className="text-slate-200">I currently work here</label>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">Description *</label>
              <Textarea
                placeholder="Describe your responsibilities and achievements..."
                className="h-32 bg-slate-900 border-slate-600 text-slate-200"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-red-400">{errors.description.message}</p>
              )}
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleImproveDescription}
              disabled={isImproving || !watch("description")}
              className="text-blue-400 hover:text-blue-300 hover:bg-slate-800"
            >
              {isImproving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Improving...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Improve with AI
                </>
              )}
            </Button>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                setStartMonth("");
                setStartYear("");
                setEndMonth("");
                setEndYear("");
                setIsAdding(false);
              }}
              className="border-slate-600 text-slate-200 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleAdd}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Experience
            </Button>
          </CardFooter>
        </Card>
      )}

      {!isAdding && (
        <Button
          className="w-full border-slate-600 text-slate-200 hover:bg-slate-800"
          variant="outline"
          onClick={() => setIsAdding(true)}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Work Experience
        </Button>
      )}
    </div>
  );
}
