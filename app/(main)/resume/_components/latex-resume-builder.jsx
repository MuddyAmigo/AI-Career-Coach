"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUser } from "@clerk/nextjs";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Download, Loader2, FileText, Code, X } from "lucide-react";
import { resumeSchema } from "@/app/lib/schema";
import { saveResume } from "@/actions/resume";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";
import { ExperienceForm } from "./experience-form";
import { EducationForm } from "./education-form";
import { ProjectForm } from "./project-form";
import { generateLatexResume, defaultLatexTemplate } from "@/lib/latex-template";

// Dynamically import Monaco Editor (code editor)
const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

/**
 * Overleaf-Style LaTeX Resume Builder
 * 
 * Features:
 * - Split-screen layout: Form on left, Live preview on right
 * - LaTeX source code editing
 * - Real-time preview compilation
 * - Dark theme UI
 * - PDF export
 */
export default function LatexResumeBuilder({ initialContent }) {
  const [activeTab, setActiveTab] = useState("form");
  const [latexCode, setLatexCode] = useState(initialContent || defaultLatexTemplate);
  const [compiledHtml, setCompiledHtml] = useState("");
  const [isCompiling, setIsCompiling] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const previewRef = useRef(null);
  const { user } = useUser();

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      contactInfo: {
        name: user?.fullName || "",
        email: user?.primaryEmailAddress?.emailAddress || "",
        mobile: "",
        linkedin: "",
        twitter: "",
      },
      summary: "",
      skills: "",
      experience: [],
      education: [],
      projects: [],
    },
  });

  const {
    loading: isSaving,
    fn: saveResumeFn,
    data: saveResult,
    error: saveError,
  } = useFetch(saveResume);

  // Watch form values for auto-generation
  const formValues = watch();

  // Auto-generate LaTeX from form data whenever form changes
  useEffect(() => {
    const generatedLatex = generateLatexResume(formValues);
    setLatexCode(generatedLatex);
  }, [formValues]);

  // Compile preview on demand
  const handlePreview = () => {
    setIsCompiling(true);
    try {
      const html = convertLatexToHtml(latexCode);
      setCompiledHtml(html);
      setShowPreview(true);
    } catch (error) {
      console.error("LaTeX compilation error:", error);
      toast.error("Failed to generate preview");
    } finally {
      setIsCompiling(false);
    }
  };

  // Handle save result
  useEffect(() => {
    if (saveResult && !isSaving) {
      toast.success("Resume saved successfully!");
    }
    if (saveError) {
      toast.error(saveError.message || "Failed to save resume");
    }
  }, [saveResult, saveError, isSaving]);

  const onSubmit = async (data) => {
    await saveResumeFn(latexCode);
  };

  const generatePDF = async () => {
    try {
      // Dynamically import html2pdf
      const html2pdf = (await import("html2pdf.js")).default;
      
      // Ensure preview is rendered
      if (!previewRef.current) {
        // Generate preview first if not showing
        const html = convertLatexToHtml(latexCode);
        setCompiledHtml(html);
        setShowPreview(true);
        
        // Wait for render
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      const element = previewRef.current;
      if (!element) {
        toast.error("Please open preview first");
        return;
      }
      
      const opt = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: `${formValues.contactInfo?.name || "resume"}_resume.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true
        },
        jsPDF: { 
          unit: "in", 
          format: "letter", 
          orientation: "portrait" 
        }
      };
      
      toast.info("Generating PDF...");
      await html2pdf().set(opt).from(element).save();
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              LaTeX Resume Builder
            </h1>
            <div className="flex gap-2">
              <Button
                onClick={handlePreview}
                disabled={isCompiling}
                variant="outline"
                className="border-blue-600 text-blue-400 hover:bg-blue-900"
              >
                {isCompiling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Preview Resume
                  </>
                )}
              </Button>
              <Button
                onClick={handleSubmit(onSubmit)}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
              <Button
                onClick={generatePDF}
                variant="outline"
                className="border-slate-600 text-slate-200 hover:bg-slate-800"
              >
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger 
              value="form" 
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-white"
            >
              <FileText className="h-4 w-4 mr-2" />
              Form Builder
            </TabsTrigger>
            <TabsTrigger 
              value="latex"
              className="data-[state=active]:bg-slate-700 data-[state=active]:text-white"
            >
              <Code className="h-4 w-4 mr-2" />
              LaTeX Editor
            </TabsTrigger>
          </TabsList>

          {/* Full Width Form */}
          <TabsContent value="form" className="m-0">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6 space-y-6">
                    {/* Contact Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-200">Contact Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          {...register("contactInfo.name")}
                          placeholder="Full Name"
                          className="bg-slate-900 border-slate-600 text-slate-200"
                        />
                        <Input
                          {...register("contactInfo.email")}
                          type="email"
                          placeholder="Email"
                          className="bg-slate-900 border-slate-600 text-slate-200"
                        />
                        <Input
                          {...register("contactInfo.mobile")}
                          placeholder="Phone Number"
                          className="bg-slate-900 border-slate-600 text-slate-200"
                        />
                        <Input
                          {...register("contactInfo.linkedin")}
                          placeholder="LinkedIn URL"
                          className="bg-slate-900 border-slate-600 text-slate-200"
                        />
                      </div>
                    </div>

                    {/* Professional Summary */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-200">Professional Summary</h3>
                      <Controller
                        name="summary"
                        control={control}
                        render={({ field }) => (
                          <Textarea
                            {...field}
                            placeholder="Write your professional summary..."
                            className="h-24 bg-slate-900 border-slate-600 text-slate-200"
                          />
                        )}
                      />
                    </div>

                    {/* Skills */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-200">Skills</h3>
                      <Controller
                        name="skills"
                        control={control}
                        render={({ field }) => (
                          <Textarea
                            {...field}
                            placeholder="List your skills..."
                            className="h-24 bg-slate-900 border-slate-600 text-slate-200"
                          />
                        )}
                      />
                    </div>

                    {/* Experience */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-200">Work Experience</h3>
                      <Controller
                        name="experience"
                        control={control}
                        render={({ field }) => (
                          <ExperienceForm
                            entries={field.value}
                            onChange={field.onChange}
                          />
                        )}
                      />
                    </div>

                    {/* Education */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-200">Education</h3>
                      <Controller
                        name="education"
                        control={control}
                        render={({ field }) => (
                          <EducationForm
                            entries={field.value}
                            onChange={field.onChange}
                          />
                        )}
                      />
                    </div>

                    {/* Projects */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-200">Projects</h3>
                      <Controller
                        name="projects"
                        control={control}
                        render={({ field }) => (
                          <ProjectForm
                            entries={field.value}
                            onChange={field.onChange}
                          />
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="latex" className="m-0">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-slate-200">LaTeX Source Code</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Editor
                      height="calc(100vh - 200px)"
                      defaultLanguage="latex"
                      value={latexCode}
                      onChange={(value) => setLatexCode(value || "")}
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: "on",
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                      }}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Preview Modal */}
            {showPreview && (
              <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col">
                  <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-2xl font-bold text-gray-900">Resume Preview</h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowPreview(false)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <X className="h-6 w-6" />
                    </Button>
                  </div>
                  <div className="flex-1 overflow-auto bg-white">
                    <div 
                      ref={previewRef}
                      className="prose prose-sm max-w-none p-6"
                      dangerouslySetInnerHTML={{ __html: compiledHtml }}
                    />
                  </div>
                  <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
                    <Button
                      variant="outline"
                      onClick={() => setShowPreview(false)}
                    >
                      Close
                    </Button>
                    <Button
                      onClick={generatePDF}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
    </div>
  );
}

/**
 * Enhanced LaTeX to HTML converter for live preview
 * Converts LaTeX resume to readable HTML with proper formatting
 */
function convertLatexToHtml(latex) {
  if (!latex || latex.trim() === "") {
    return "<div class='flex items-center justify-center h-full text-gray-400'><p>Start filling the form to see your resume...</p></div>";
  }
  
  let html = latex;

  // Remove document class and preamble
  html = html.replace(/\\documentclass\[.*?\]\{.*?\}/g, "");
  html = html.replace(/\\usepackage(\[.*?\])?\{.*?\}/g, "");
  html = html.replace(/\\pagestyle\{.*?\}/g, "");
  html = html.replace(/\\fancyhf\{\}/g, "");
  html = html.replace(/\\fancyfoot\{\}/g, "");
  html = html.replace(/\\renewcommand\{.*?\}\{.*?\}/g, "");
  html = html.replace(/\\addtolength\{.*?\}\{.*?\}/g, "");
  html = html.replace(/\\urlstyle\{.*?\}/g, "");
  html = html.replace(/\\raggedbottom/g, "");
  html = html.replace(/\\raggedright/g, "");
  html = html.replace(/\\setlength\{.*?\}\{.*?\}/g, "");
  html = html.replace(/\\titleformat\{.*?\}\{[\s\S]*?\}\[\s\S]*?\]/g, "");
  html = html.replace(/\\newcommand\{.*?\}(\[.*?\])?\{[\s\S]*?\}/g, "");
  
  // Extract document content
  const docMatch = html.match(/\\begin\{document\}([\s\S]*?)\\end\{document\}/);
  if (docMatch) {
    html = docMatch[1];
  }

  // Convert center environment (for header) - reduced padding
  html = html.replace(/\\begin\{center\}([\s\S]*?)\\end\{center\}/g, (match, content) => {
    return `<div class='text-center mb-4 pb-3 border-b-2 border-gray-200'>${content}</div>`;
  });

  // Convert name and contact in header - improved patterns
  html = html.replace(/\\textbf\{\\Huge\s+\\scshape\s+([^}]+)\}/g, "<h1 class='text-3xl font-bold mb-2 text-gray-900'>$1</h1>");
  html = html.replace(/\\Huge\s+\\scshape\s+([^\\\n]+)/g, "<h1 class='text-3xl font-bold mb-2 text-gray-900'>$1</h1>");

  // Convert sections BEFORE handling \small
  html = html.replace(/\\section\{([^}]+)\}/g, "<h2 class='text-lg font-bold mt-4 mb-2 pb-1 border-b-2 border-gray-300 uppercase text-gray-900'>$1</h2>");
  html = html.replace(/\\subsection\{([^}]+)\}/g, "<h3 class='text-base font-semibold mt-3 mb-1 text-gray-800'>$1</h3>");

  // Convert \small{content} - preserve the content
  html = html.replace(/\\small\{([^}]+)\}/g, "<div class='text-sm text-gray-700 leading-relaxed mb-3'>$1</div>");
  html = html.replace(/\\small\s+([^\n\\]+)/g, "<div class='text-sm text-gray-600 mt-1'>$1</div>");

  // Convert itemize lists
  html = html.replace(/\\resumeSubHeadingListStart/g, "<div class='space-y-3 mt-2'>");
  html = html.replace(/\\resumeSubHeadingListEnd/g, "</div>");
  html = html.replace(/\\resumeItemListStart/g, "<ul class='list-disc list-inside mt-1 space-y-1 ml-4'>");
  html = html.replace(/\\resumeItemListEnd/g, "</ul>");
  html = html.replace(/\\resumeItem\{([^}]*)\}/g, "<li class='text-sm text-gray-700'>$1</li>");
  html = html.replace(/\\resumeSubItem\{([^}]*)\}/g, "<li class='text-sm text-gray-700'>$1</li>");
  
  // Convert standard itemize/enumerate
  html = html.replace(/\\begin\{itemize\}(\[.*?\])?/g, "<ul class='list-disc list-inside mt-2 space-y-1 ml-4'>");
  html = html.replace(/\\end\{itemize\}/g, "</ul>");
  html = html.replace(/\\item\s+/g, "<li class='text-sm'>");

  // Convert resume project headings
  html = html.replace(/\\resumeProjectHeading\s*\{([^}]*)\}\{([^}]*)\}/g, 
    `<div class='mb-3'>
      <div class='flex justify-between items-baseline flex-wrap'>
        <h3 class='text-base font-semibold'>$1</h3>
        <span class='text-sm text-gray-600'>$2</span>
      </div>
    </div>`
  );

  // Convert resume subheadings (job entries)
  html = html.replace(/\\resumeSubheading\s*\{([^}]*)\}\{([^}]*)\}\s*\{([^}]*)\}\{([^}]*)\}/g, 
    `<div class='mb-3'>
      <div class='flex justify-between items-baseline flex-wrap'>
        <h3 class='text-base font-semibold'>$1</h3>
        <span class='text-sm text-gray-600'>$2</span>
      </div>
      <div class='flex justify-between items-baseline flex-wrap'>
        <p class='text-sm italic text-gray-700'>$3</p>
        <span class='text-sm text-gray-600'>$4</span>
      </div>
    </div>`
  );

  // Convert tabular (for complex layouts)
  html = html.replace(/\\begin\{tabular\*?\}.*?\{.*?\}([\s\S]*?)\\end\{tabular\*?\}/g, (match, content) => {
    let tableContent = content;
    tableContent = tableContent.replace(/&/g, " ");
    tableContent = tableContent.replace(/\\\\/g, "<br/>");
    return tableContent;
  });

  // Convert emph for technologies
  html = html.replace(/\\emph\{([^}]+)\}/g, "<em class='text-gray-600'>$1</em>");

  // Convert text formatting - do this BEFORE removing LaTeX commands
  html = html.replace(/\\textbf\{([^}]+)\}/g, "<strong class='font-semibold'>$1</strong>");
  html = html.replace(/\\textit\{([^}]+)\}/g, "<em class='italic'>$1</em>");
  html = html.replace(/\\underline\{([^}]+)\}/g, "<u>$1</u>");
  html = html.replace(/\\scshape\s+([^\\\n]+)/g, "<span class='uppercase tracking-wide text-sm'>$1</span>");

  // Remove size commands but keep content
  html = html.replace(/\\large\s*/g, "");
  html = html.replace(/\\footnotesize\s*/g, "");

  // Convert links
  html = html.replace(/\\href\{([^}]+)\}\{\\underline\{([^}]+)\}\}/g, "<a href='$1' class='text-blue-600 hover:underline' target='_blank'>$2</a>");
  html = html.replace(/\\href\{mailto:([^}]+)\}\{\\underline\{([^}]+)\}\}/g, "<a href='mailto:$1' class='text-blue-600 hover:underline'>$2</a>");
  html = html.replace(/\\href\{([^}]+)\}\{([^}]+)\}/g, "<a href='$1' class='text-blue-600 hover:underline' target='_blank'>$2</a>");

  // Convert line breaks and spacing
  html = html.replace(/\\\\\s*\\vspace\{[^}]+\}/g, "<br/>");
  html = html.replace(/\\\\/g, "<br/>");
  html = html.replace(/\\vspace\{[^}]+\}/g, "");
  html = html.replace(/\\hfill/g, "");

  // Convert special characters
  html = html.replace(/\\\$/g, "$");
  html = html.replace(/\\\&/g, "&");
  html = html.replace(/\\%/g, "%");
  html = html.replace(/\\_/g, "_");
  html = html.replace(/\\\#/g, "#");
  html = html.replace(/\$\|?\$/g, " | ");
  html = html.replace(/\|/g, " • ");

  // Remove remaining LaTeX commands that we don't need
  html = html.replace(/\\[a-zA-Z]+\*?\s*/g, "");
  
  // Clean up curly braces
  html = html.replace(/\{([^{}]*)\}/g, "$1");
  html = html.replace(/[{}]/g, "");

  // Clean up extra whitespace and newlines
  html = html.replace(/\n\s*\n\s*\n/g, "\n\n");
  html = html.replace(/\n/g, " ");
  html = html.replace(/\s+/g, " ");

  // Add proper paragraph structure
  html = html.replace(/<\/h[123]>\s*<h[123]/g, "</h$&");
  html = html.replace(/<\/div>\s*<h/g, "</div><h");

  // Wrap in container with minimal padding
  html = `<div class="max-w-4xl mx-auto bg-white min-h-full" style="padding: 0.5in;">
    ${html}
  </div>`;

  return html;
}
