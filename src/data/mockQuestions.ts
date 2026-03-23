export type CareerQuadrant = 'Doctor' | 'Lawyer' | 'Engineer' | 'Artist';

export interface AnswerOption {
    text: string;
    points: Partial<Record<CareerQuadrant, number>>;
}

export interface Question {
    id: number;
    type: 'aptitude' | 'psychometric';
    text: string;
    options: AnswerOption[];
}

export const mockQuestions: Question[] = [
    {
        id: 1,
        type: 'psychometric',
        text: "When faced with a complex problem, what is your first approach?",
        options: [
            { text: "Analyze the root cause logically and step-by-step", points: { Engineer: 2, Doctor: 1 } },
            { text: "Look for patterns and debate different perspectives", points: { Lawyer: 2 } },
            { text: "Brainstorm creative and out-of-the-box solutions", points: { Artist: 2 } },
            { text: "Carefully examine symptoms and refer to past cases", points: { Doctor: 2 } },
        ]
    },
    {
        id: 2,
        type: 'aptitude',
        text: "If 3 machines can produce 3 widgets in 3 minutes, how long does it take 100 machines to produce 100 widgets?",
        options: [
            { text: "100 minutes", points: { Artist: 0 } },
            { text: "3 minutes", points: { Engineer: 2, Doctor: 1 } },
            { text: "33 minutes", points: { Lawyer: 0 } },
            { text: "10 minutes", points: {} },
        ]
    },
    {
        id: 3,
        type: 'psychometric',
        text: "How do you handle high-pressure situations?",
        options: [
            { text: "Stay calm, focus on the facts, and follow procedures", points: { Doctor: 2, Engineer: 1 } },
            { text: "Argue the case, find loopholes, and negotiate", points: { Lawyer: 2 } },
            { text: "Express my feelings through my work to relieve stress", points: { Artist: 2 } },
            { text: "Create a systematic plan and execute it", points: { Engineer: 2 } },
        ]
    },
    {
        id: 4,
        type: 'aptitude',
        text: "Find the next number in the sequence: 2, 6, 12, 20...",
        options: [
            { text: "28", points: {} },
            { text: "30", points: { Engineer: 2, Lawyer: 1 } },
            { text: "32", points: {} },
            { text: "36", points: {} },
        ]
    },
    {
        id: 5,
        type: 'psychometric',
        text: "Which of these activities sounds most appealing to you on a weekend?",
        options: [
            { text: "Reading journal articles or volunteering at a clinic", points: { Doctor: 2 } },
            { text: "Building a PC or fixing a broken appliance", points: { Engineer: 2 } },
            { text: "Painting, writing, or visiting an art gallery", points: { Artist: 2 } },
            { text: "Reading about famous court cases or debating politics", points: { Lawyer: 2 } },
        ]
    },
    {
        id: 6,
        type: 'aptitude',
        text: "A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost?",
        options: [
            { text: "$0.10", points: {} },
            { text: "$0.05", points: { Engineer: 2, Lawyer: 1 } },
            { text: "$1.00", points: {} },
            { text: "$0.15", points: {} },
        ]
    },
    {
        id: 7,
        type: 'psychometric',
        text: "In a team project, which role do you naturally take on?",
        options: [
            { text: "The mediator who ensures fair arguments and rules", points: { Lawyer: 2 } },
            { text: "The caretaker who ensures everyone is healthy and doing okay", points: { Doctor: 2 } },
            { text: "The visionary who designs how everything should look", points: { Artist: 2 } },
            { text: "The architect who structures the underlying system", points: { Engineer: 2 } },
        ]
    },
    {
        id: 8,
        type: 'aptitude',
        text: "Which word does not belong with the others?",
        options: [
            { text: "Apple", points: {} },
            { text: "Banana", points: {} },
            { text: "Carrot", points: { Doctor: 1, Lawyer: 1 } },
            { text: "Orange", points: {} },
        ]
    },
    {
        id: 9,
        type: 'psychometric',
        text: "What type of environment do you prefer to work in?",
        options: [
            { text: "A structured, clean, and highly regulated hospital or lab", points: { Doctor: 2 } },
            { text: "A quiet office where I can read, research and write arguments", points: { Lawyer: 2 } },
            { text: "A tech lab or workshop with tools and computers", points: { Engineer: 2 } },
            { text: "A vibrant, open studio with music and colors", points: { Artist: 2 } },
        ]
    },
    {
        id: 10,
        type: 'aptitude',
        text: "If SOME Smurfs are green, and ALL green things are slimy, which statement is true?",
        options: [
            { text: "All Smurfs are slimy", points: {} },
            { text: "Some Smurfs are slimy", points: { Lawyer: 2, Engineer: 1 } },
            { text: "No Smurfs are slimy", points: {} },
            { text: "All slimy things are Smurfs", points: {} },
        ]
    },
    {
        id: 11,
        type: 'psychometric',
        text: "When reading the news, which section do you jump to first?",
        options: [
            { text: "Health & Science", points: { Doctor: 2 } },
            { text: "Technology & Innovation", points: { Engineer: 2 } },
            { text: "Politics & Justice", points: { Lawyer: 2 } },
            { text: "Arts & Culture", points: { Artist: 2 } },
        ]
    },
    {
        id: 12,
        type: 'aptitude',
        text: "Rearrange the letters 'CIFAIPC' to name a:",
        options: [
            { text: "City", points: {} },
            { text: "Animal", points: {} },
            { text: "Ocean", points: { Engineer: 1, Doctor: 1 } },
            { text: "River", points: {} },
        ]
    }
];
