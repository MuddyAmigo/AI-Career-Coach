// app/resume/_components/education-form.jsx
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
import { educationSchema } from "@/app/lib/schema";
import { PlusCircle, X, GraduationCap } from "lucide-react";

// Generate year options
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 60 }, (_, i) => currentYear - i + 6); // Include future years for expected graduation
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const degreeTypes = [
  "High School Diploma",
  "Associate's Degree",
  "Bachelor of Arts (BA)",
  "Bachelor of Science (BS)",
  "Bachelor of Engineering (BE)",
  "Bachelor of Technology (BTech)",
  "Master of Arts (MA)",
  "Master of Science (MS)",
  "Master of Engineering (ME)",
  "Master of Technology (MTech)",
  "Master of Business Administration (MBA)",
  "Doctor of Philosophy (PhD)",
  "Juris Doctor (JD)",
  "Doctor of Medicine (MD)",
  "Other",
];

export function EducationForm({ entries = [], onChange }) {
  const [isAdding, setIsAdding] = useState(false);

  const {
    register,
    handleSubmit: handleValidation,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      degree: "",
      institution: "",
      location: "",
      startDate: "",
      endDate: "",
      grade: "",
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

  return (
    <div className="space-y-4">
      {/* Existing Entries */}
      <div className="space-y-4">
        {entries.map((item, index) => (
          <Card key={index} className="bg-slate-900/50 border-slate-600">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">
                <GraduationCap className="inline h-4 w-4 mr-2" />
                {item.degree}
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
              <p className="text-base font-medium text-slate-300">
                {item.institution}
              </p>
              <p className="text-sm text-slate-400">
                {item.current
                  ? `${item.startDate} - Present (Expected)`
                  : `${item.startDate} - ${item.endDate}`}
              </p>
              {item.location && (
                <p className="text-sm text-slate-500">{item.location}</p>
              )}
              {item.grade && (
                <p className="text-sm text-slate-400 mt-1">
                  Grade/GPA: {item.grade}
                </p>
              )}
              {item.description && (
                <p className="mt-2 text-sm whitespace-pre-wrap text-slate-400">
                  {item.description}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add New Entry Form */}
      {isAdding && (
        <Card className="bg-slate-900/50 border-slate-600">
          <CardHeader>
            <CardTitle className="text-slate-200">Add Education</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Degree/Qualification *</label>
              <Select onValueChange={(value) => setValue("degree", value)}>
                <SelectTrigger className="bg-slate-900 border-slate-600 text-slate-200">
                  <SelectValue placeholder="Select degree type" />
                </SelectTrigger>
                <SelectContent>
                  {degreeTypes.map((degree) => (
                    <SelectItem key={degree} value={degree}>
                      {degree}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.degree && (
                <p className="text-sm text-red-400">{errors.degree.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">Field of Study (Optional)</label>
              <Input
                placeholder="e.g. Computer Science"
                {...register("fieldOfStudy")}
                className="bg-slate-900 border-slate-600 text-slate-200"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">Institution Name *</label>
              <Input
                placeholder="e.g. Stanford University"
                {...register("institution")}
                className="bg-slate-900 border-slate-600 text-slate-200"
              />
              {errors.institution && (
                <p className="text-sm text-red-400">{errors.institution.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">Location (Optional)</label>
              <Input
                placeholder="e.g. Stanford, CA"
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
                <label className="text-sm text-slate-300">End Date (or Expected)</label>
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
                id="current-edu"
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
              <label htmlFor="current-edu" className="text-slate-200">I am currently studying here</label>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">Grade/GPA (Optional)</label>
              <Input
                placeholder="e.g. 3.8/4.0 or First Class Honours"
                {...register("grade")}
                className="bg-slate-900 border-slate-600 text-slate-200"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">Additional Information (Optional)</label>
              <Textarea
                placeholder="Relevant coursework, achievements, activities..."
                className="h-24 bg-slate-900 border-slate-600 text-slate-200"
                {...register("description")}
              />
            </div>
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
              Add Education
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
          Add Education
        </Button>
      )}
    </div>
  );
}
