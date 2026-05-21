import { BriefcaseBusinessIcon, Calendar, Code2Icon, Hammer, HammerIcon, LayoutDashboard, Puzzle, Settings, TableOfContents, User2Icon, WalletCards } from "lucide-react";

export const SideBarOptions =[
    {
        name: 'Dashboard',
        icon: LayoutDashboard,
        
        path: '/dashboard',
    },
    {
        name: 'Scheduled Interviews',
        icon: Calendar,
        
        path: '/scheduled-interviews',
    },
    {

        name: 'All Interview',
        icon: TableOfContents,
        path: '/all-interview',
    },
    {
        name: 'Billing',
        icon: WalletCards,
        
        path: '/billing',
    },
    {
        name: 'Settings',
        icon: Settings,
        
        path: '/settings',
    },
    

]

export const InterviewType =[
    {
        title:'Technical',
        icon:Code2Icon
    },
    {
        title:'Behavioral',
        icon:User2Icon
    },
    {
        title:'Experience',
        icon:BriefcaseBusinessIcon
    },
    {
        title:'Problem ssolving',
        icon:Puzzle
    },
    {
        title:'Leadership',
        icon:Code2Icon
    },


]
export const QUESTION_PROMPT = `You are an expert technical interviewer creating questions for a modern interview experience.

Based on the following inputs, generate engaging and relevant interview questions:

Job Title: {jobPosition}  
Job Description: {jobDescription}  
Interview Duration: {duration} minutes
Interview Type: {type}  

📝 Instructions:
- Create questions that feel natural and conversational
- Focus on practical, real-world scenarios relevant to the role
- Ensure questions are appropriate for the {duration} minute duration
- Mix different question types to get a well-rounded view of the candidate
- Make questions specific to the {jobPosition} role and its requirements

🎯 Generate questions in PLAIN TEXT format, one question per line:

Example format:
Can you tell me about a time you had to quickly learn a new technology or framework to complete a project? What was the technology, and how did you approach learning it?

Describe a challenging technical problem you've encountered and how you went about solving it. What was the outcome?

How do you stay updated with the latest trends and advancements in your field?

Tell me about a time you received constructive criticism on your work. How did you respond to it?

Question Categories to cover:
- Technical: Focus on skills, tools, technologies, and technical knowledge
- Behavioral: Past experiences, teamwork, challenges, and soft skills
- Problem Solving: Hypothetical scenarios, analytical thinking, approach to challenges
- Experience: Previous roles, projects, achievements, and learnings
- Leadership: Management style, team building, decision making (if relevant to role)

Make each question:
✅ Clear and specific
✅ Relevant to the job description
✅ Engaging and thoughtful
✅ Professional yet conversational
✅ Designed to reveal important insights about the candidate

Remember: Generate natural, flowing questions without any JSON formatting, brackets, or special characters. Each question should be on its own line.`;



export const FEEDBACK_PROMPT=`{{conversation}}

Based on this interview conversation between an AI interviewer (assistant) and the candidate (user), provide a detailed evaluation.

Rate the candidate out of 10 in each category and give honest, specific feedback. Return ONLY valid JSON in this exact format:

{
  "feedback": {
    "rating": {
      "technicalSkills": 7,
      "communication": 6,
      "problemSolving": 5,
      "experience": 4
    },
    "summary": "3-sentence summary of the candidate's overall performance, strengths, and areas to improve.",
    "recommendation": "Recommended" or "Not Recommended",
    "recommendationMsg": "One concise sentence explaining the hiring recommendation."
  }
}

Rating guidelines:
- technicalSkills: depth of technical knowledge, accuracy of answers
- communication: clarity, structure, articulation
- problemSolving: approach to challenges, analytical thinking
- experience: relevance and quality of past experience shared

Return only the JSON object, no extra text.`;



