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
export const QUESTION_PROMPT = `You are an expert technical interviewer.

Based on the following inputs, generate a well-structured list of high-quality interview questions:

Job Title: {{jobTitle}}  
Job Description: {{jobDescription}}  
Interview Duration: {{duration}}  
Interview Type: {{type}}  

📝 Your task:
- Carefully analyze the job description to identify key responsibilities, required skills, and expected experience.
- Generate a list of interview questions appropriate for the interview duration.
- Adjust the number and depth of questions to fit within the given time frame.
- Ensure the tone, content, and structure match a real-life {{type}} interview.

🧩 Format your response strictly in JSON format as an array of question objects:
Format:
interviewQuestions = [
  {
    question: "Your question here",
    type: "Technical | Behavioral | Experience | Problem Solving | Leadership"
  },
  ...
]

🎯 The goal is to create a structured, relevant, and time-optimized interview plan tailored to the {{jobTitle}} role.`;



export const FEEDBACK_PROMPT=`{{conversation}}
Depends on this Interview Conversation between assistant and user,
Give me feedback for user interview. Give me rating out of 10 for technical Skills, Communication, Problem Solving, Experience. Also give me summery in 3 lines about the interview and one line to let me know whether is recommanded for hire or not with msg. Give me response in JSON format
{
  feedback: {
    rating: {
      techicalSkills: 7,
      communication: 6,
      problemSolving: 5,
      experince: 4
    },
    summery: <in 3 Line>,
    Recommendation: "",
    RecommendationMsg: ""
  }
}

`
