// app/resume/_components/project-form.jsx
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
import { projectSchema } from "@/app/lib/schema";
import { Sparkles, PlusCircle, X, Loader2, Github, ExternalLink, Folder } from "lucide-react";
import { improveWithAI } from "@/actions/resume";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";

// Generate year options
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 20 }, (_, i) => currentYear - i);
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function ProjectForm({ entries = [], onChange }) {
  const [isAdding, setIsAdding] = useState(false);

  const {
    register,
    handleSubmit: handleValidation,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      technologies: "",
      githubUrl: "",
      liveUrl: "",
      startDate: "",
      endDate: "",
    },
  });

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
      type: "project",
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
                <Folder className="inline h-4 w-4 mr-2" />
                {item.name}
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
              {(item.startDate || item.endDate) && (
                <p className="text-sm text-slate-400">
                  {item.startDate}{item.endDate ? ` - ${item.endDate}` : ""}
                </p>
              )}
              {item.technologies && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.technologies.split(",").map((tech, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 text-xs bg-blue-900/50 text-blue-300 rounded"
                    >
                      {tech.trim()}
                    </span>
                  ))}
                </div>
              )}
              <p className="mt-2 text-sm whitespace-pre-wrap text-slate-300">
                {item.description}
              </p>
              <div className="flex gap-4 mt-3">
                {item.githubUrl && (
                  <a
                    href={item.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-blue-400 hover:text-blue-300"
                  >
                    <Github className="h-4 w-4 mr-1" />
                    GitHub
                  </a>
                )}
                {item.liveUrl && (
                  <a
                    href={item.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-green-400 hover:text-green-300"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Live Demo
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add New Entry Form */}
      {isAdding && (
        <Card className="bg-slate-900/50 border-slate-600">
          <CardHeader>
            <CardTitle className="text-slate-200">Add Project</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Project Name *</label>
              <Input
                placeholder="e.g. E-Commerce Platform"
                {...register("name")}
                className="bg-slate-900 border-slate-600 text-slate-200"
              />
              {errors.name && (
                <p className="text-sm text-red-400">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">Technologies Used (comma-separated)</label>
              <Input
                placeholder="e.g. React, Node.js, MongoDB, AWS"
                {...register("technologies")}
                className="bg-slate-900 border-slate-600 text-slate-200"
              />
              <p className="text-xs text-slate-500">Separate technologies with commas</p>
            </div>

            {/* Date Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Start Date (Optional)</label>
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
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-300">End Date (Optional)</label>
                <div className="grid grid-cols-2 gap-2">
                  <Select value={endMonth} onValueChange={setEndMonth}>
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
                  <Select value={endYear} onValueChange={setEndYear}>
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
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-300">
                  <Github className="inline h-4 w-4 mr-1" />
                  GitHub URL (Optional)
                </label>
                <Input
                  placeholder="https://github.com/username/repo"
                  {...register("githubUrl")}
                  className="bg-slate-900 border-slate-600 text-slate-200"
                />
                {errors.githubUrl && (
                  <p className="text-sm text-red-400">{errors.githubUrl.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-300">
                  <ExternalLink className="inline h-4 w-4 mr-1" />
                  Live Demo URL (Optional)
                </label>
                <Input
                  placeholder="https://myproject.com"
                  {...register("liveUrl")}
                  className="bg-slate-900 border-slate-600 text-slate-200"
                />
                {errors.liveUrl && (
                  <p className="text-sm text-red-400">{errors.liveUrl.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">Description *</label>
              <Textarea
                placeholder="Describe what the project does, your role, and key achievements..."
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
              Add Project
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
          Add Project
        </Button>
      )}
    </div>
  );
}
