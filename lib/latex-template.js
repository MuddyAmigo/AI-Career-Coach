/**
 * Professional LaTeX Resume Template
 * Generates a clean, ATS-friendly resume in LaTeX format
 */

export const generateLatexResume = (data) => {
  const {
    contactInfo = {},
    summary = "",
    skills = "",
    experience = [],
    education = [],
    projects = [],
  } = data;

  return `\\documentclass[letterpaper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

% Adjust margins - reduced top margin to minimize header gap
\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-0.7in}
\\addtolength{\\textheight}{1.2in}

\\urlstyle{same}

\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Sections formatting - reduced spacing
\\titleformat{\\section}{
  \\vspace{-6pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-6pt}]

% Custom commands
\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-6pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & \\textit{\\small #2} \\\\
    \\end{tabular*}\\vspace{-6pt}
}

\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-4pt}}

\\renewcommand{\\labelitemii}{$\\circ$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=*]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

%-------------------------------------------
%%%%%%  CV STARTS HERE  %%%%%%%%%%%%%%%%%%%%

\\begin{document}

%----------HEADING-----------------
\\begin{center}
    \\textbf{\\Huge \\scshape ${contactInfo.name || "Your Name"}} \\\\ \\vspace{2pt}
    \\small ${contactInfo.mobile || ""} ${contactInfo.mobile && contactInfo.email ? "$|$" : ""} ${contactInfo.email ? `\\href{mailto:${contactInfo.email}}{\\underline{${contactInfo.email}}}` : ""} ${contactInfo.linkedin ? `$|$ \\href{${contactInfo.linkedin}}{\\underline{LinkedIn}}` : ""} ${contactInfo.twitter ? `$|$ \\href{${contactInfo.twitter}}{\\underline{Twitter}}` : ""}
\\end{center}
\\vspace{-8pt}

${
  summary
    ? `%-----------SUMMARY-----------------
\\section{Professional Summary}
  \\small{${escapeLatex(summary)}}
`
    : ""
}

${
  skills
    ? `%-----------SKILLS-----------------
\\section{Skills}
  \\small{${escapeLatex(skills)}}
`
    : ""
}

${
  experience && experience.length > 0
    ? `%-----------EXPERIENCE-----------------
\\section{Experience}
  \\resumeSubHeadingListStart
${experience
  .map(
    (exp) => `
    \\resumeSubheading
      {${escapeLatex(exp.title || "")}}{${exp.startDate || ""}${exp.current ? " - Present" : exp.endDate ? " - " + exp.endDate : ""}}
      {${escapeLatex(exp.organization || "")}}{${exp.location || ""}}
      \\resumeItemListStart
        \\resumeItem{${escapeLatex(exp.description || "")}}
      \\resumeItemListEnd
`
  )
  .join("")}
  \\resumeSubHeadingListEnd
`
    : ""
}

${
  education && education.length > 0
    ? `%-----------EDUCATION-----------------
\\section{Education}
  \\resumeSubHeadingListStart
${education
  .map(
    (edu) => `
    \\resumeSubheading
      {${escapeLatex(edu.institution || "")}}{${edu.location || ""}}
      {${escapeLatex(edu.degree || "")}${edu.grade ? ` -- GPA: ${escapeLatex(edu.grade)}` : ""}}{${edu.startDate || ""}${edu.current ? " - Present (Expected)" : edu.endDate ? " - " + edu.endDate : ""}}
      ${edu.description ? `\\resumeItemListStart
        \\resumeItem{${escapeLatex(edu.description)}}
      \\resumeItemListEnd` : ""}
`
  )
  .join("")}
  \\resumeSubHeadingListEnd
`
    : ""
}

${
  projects && projects.length > 0
    ? `%-----------PROJECTS-----------------
\\section{Projects}
  \\resumeSubHeadingListStart
${projects
  .map(
    (proj) => `
    \\resumeProjectHeading
      {${escapeLatex(proj.name || "")}${proj.technologies ? ` $|$ \\emph{${escapeLatex(proj.technologies)}}` : ""}${proj.githubUrl ? ` $|$ \\href{${proj.githubUrl}}{\\underline{GitHub}}` : ""}${proj.liveUrl ? ` $|$ \\href{${proj.liveUrl}}{\\underline{Live}}` : ""}}{${proj.startDate || ""}${proj.endDate ? " - " + proj.endDate : ""}}
      \\resumeItemListStart
        \\resumeItem{${escapeLatex(proj.description || "")}}
      \\resumeItemListEnd
`
  )
  .join("")}
  \\resumeSubHeadingListEnd
`
    : ""
}

%-------------------------------------------
\\end{document}`;
};

/**
 * Escape special LaTeX characters
 */
function escapeLatex(text) {
  if (!text) return "";
  return text
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/[&%$#_{}]/g, "\\$&")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}")
    .replace(/\n/g, " ");
}

/**
 * Default template content for new resumes
 */
export const defaultLatexTemplate = `\\documentclass[letterpaper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

\\begin{document}

\\begin{center}
    \\textbf{\\Huge \\scshape Your Name} \\\\ \\vspace{1pt}
    \\small +1-XXX-XXX-XXXX $|$ \\href{mailto:email@example.com}{\\underline{email@example.com}} $|$ 
    \\href{https://linkedin.com}{\\underline{LinkedIn}} $|$
    \\href{https://github.com}{\\underline{GitHub}}
\\end{center}

\\section{Professional Summary}
  Write your professional summary here...

\\section{Skills}
  \\textbf{Languages:} JavaScript, Python, Java \\\\
  \\textbf{Frameworks:} React, Node.js, Django \\\\
  \\textbf{Tools:} Git, Docker, AWS

\\section{Experience}
  Start adding your work experience...

\\section{Education}
  Add your education details...

\\section{Projects}
  List your notable projects...

\\end{document}`;
