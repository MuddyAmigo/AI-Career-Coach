import { getResume } from "@/actions/resume";
import LatexResumeBuilder from "./_components/latex-resume-builder";

export default async function ResumePage() {
  const resume = await getResume();

  return (
    <div className="min-h-screen">
      <LatexResumeBuilder initialContent={resume?.content} />
    </div>
  );
}
