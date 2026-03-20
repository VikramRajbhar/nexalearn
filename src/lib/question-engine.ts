import { generateWithAI } from './puter';

export const TOPICS: Record<string, { name: string; subtopics: string[] }> = {
    // Theory
    DSA: {
        name: "Data Structures & Algorithms",
        subtopics: ["Arrays", "Linked Lists", "Trees", "Graphs", "Sorting", "Dynamic Programming", "Stack & Queue", "Hashing"]
    },
    OS: {
        name: "Operating Systems",
        subtopics: ["Process Management", "Memory Management", "File Systems", "Deadlocks", "Scheduling", "Synchronization"]
    },
    DBMS: {
        name: "Database Management",
        subtopics: ["SQL", "Normalization", "Transactions", "Indexing", "ER Diagrams", "NoSQL"]
    },
    CN: {
        name: "Computer Networks",
        subtopics: ["OSI Model", "TCP/IP", "HTTP", "DNS", "Routing", "Security"]
    },
    OOP: {
        name: "Object Oriented Programming",
        subtopics: ["Classes", "Inheritance", "Polymorphism", "Abstraction", "Design Patterns"]
    },
    SystemDesign: {
        name: "System Design",
        subtopics: ["Scalability", "Load Balancing", "Caching", "Databases", "APIs"]
    },

    // Languages
    JavaScript: {
        name: "JavaScript",
        subtopics: ["Closures", "Promises", "ES6+", "DOM", "Event Loop", "Prototypes"]
    },
    Python: {
        name: "Python",
        subtopics: ["Lists", "Decorators", "Generators", "OOP", "File Handling"]
    },
    Java: {
        name: "Java",
        subtopics: ["Collections", "Multithreading", "OOP", "Exception Handling", "Generics"]
    },
    C: {
        name: "C Programming",
        subtopics: ["Pointers", "Memory", "Arrays", "Functions", "Structs"]
    },
    CPP: {
        name: "C++",
        subtopics: ["STL", "Templates", "OOP", "Memory Management", "Algorithms"]
    },

    // Web & Tools
    HTML_CSS: {
        name: "HTML & CSS",
        subtopics: ["Box Model", "Flexbox", "Grid", "Selectors", "Animations"]
    },
    SQL: {
        name: "SQL Queries",
        subtopics: ["SELECT", "JOINs", "Subqueries", "Aggregations", "Indexing"]
    },
    Git: {
        name: "Git",
        subtopics: ["Commands", "Branching", "Merging", "Rebase", "Conflicts"]
    }
};

function getDifficultyDescription(difficulty: number): string {
    switch (difficulty) {
        case 1: return "Basic definitions and syntax, suitable for beginners";
        case 2: return "Simple applications and common patterns";
        case 3: return "Intermediate concepts requiring understanding";
        case 4: return "Advanced topics requiring deep knowledge";
        case 5: return "Expert level, edge cases and complex scenarios";
        default: return "General undergraduate knowledge";
    }
}

export async function generateQuestions(topic: string, difficulty: number, count = 20) {
    if (!TOPICS[topic]) {
        throw new Error(`Invalid topic: ${topic}`);
    }

    const { name, subtopics } = TOPICS[topic];
    const difficultyDesc = getDifficultyDescription(difficulty);

    const prompt = `
You are an expert computer science professor creating 
exam questions for Computer Science students.

Generate exactly ${count} multiple choice questions on 
the topic: ${name}
Difficulty level: ${difficulty}/5 
(1=beginner, 3=intermediate, 5=expert)

Focus on these subtopics: ${subtopics.join(", ")}

STRICT RULES:
- Questions must be clear and unambiguous
- All 4 options must be plausible
- Only ONE option is correct
- Explanation must teach why the answer is correct
- Difficulty ${difficulty} means: ${difficultyDesc}

Return ONLY a valid JSON array. No markdown, no explanation, 
no backticks. Just the raw JSON array.

Schema for each question:
{
  "topic": "${topic}",
  "difficulty": ${difficulty},
  "question": "question text here",
  "options": ["option A", "option B", "option C", "option D"],
  "correct_index": 0,
  "explanation": "explanation why option A is correct"
}
`;

    return await generateWithAI(prompt);
}
