export interface Plan {
    id: string;
    name: string;
    priceInr: number;
    description: string;
    features: string[];
    extraFeatures?: string[];
    mostPopular?: boolean;
    color: string;
}

export const PLANS: Plan[] = [
    {
        id: "startup",
        name: "Startup",
        priceInr: 5000,
        description: "Essential guidance for starting your career journey.",
        color: "blue",
        features: [
            "Pre-Career Counselling 1-1 Session (30 Min)",
            "Student Psychometric Analysis Test",
            "Student Parent Psychometric Evaluation (1 Session)",
            "Customize Career Discovery Planning Report",
            "General Career Sensitization & Awareness (Group)",
        ],
        extraFeatures: [
            "Live Group Sessions for Career Building",
            "Lifetime Access to the Career Library",
            "New Age Career Opportunities After 12 (Group)",
            "Foreign Education & Scholarship Awareness (Group)",
            "Industry-Job Specific Technology Skill (Group)",
            "Live 1-1 Session: 1 session",
            "Career Suitability Report: Not included",
            "Profile Building: Not included",
            "Mentor Discussion: Not included",
            "CV Review: Not included",
            "Career Discussion: Not included",
        ],
    },
    {
        id: "growth",
        name: "Growth",
        priceInr: 8000,
        description: "Comprehensive support for career discovery and profile building.",
        mostPopular: true,
        color: "purple",
        features: [
            "Pre-Career Counselling 1-1 Session (30 Min)",
            "Student Psychometric Analysis Test",
            "Student Parent Psychometric Evaluation (1 Session)",
            "Customize Career Discovery Planning Report",
            "Live 1-1 Session: 2 sessions",
            "Career Suitability Report: 2 career paths",
            "Profile Building Guidance: Included",
            "Mentor Discussion: 80 min",
        ],
        extraFeatures: [
            "General Career Sensitization & Awareness (Group)",
            "Live Group Sessions for Career Building",
            "Lifetime Access to the Career Library",
            "New Age Career Opportunities After 12 (Group)",
            "Foreign Education & Scholarship Awareness (Group)",
            "Industry-Job Specific Technology Skill (Group)",
            "CV Review: Not included",
            "Career Discussion: Not included",
        ],
    },
    {
        id: "excel",
        name: "Excel",
        priceInr: 13000,
        description: "The ultimate track for career mastery and global opportunities.",
        color: "cyan",
        features: [
            "Pre-Career Counselling 1-1 Session (30 Min)",
            "Student Psychometric Analysis Test",
            "Student Parent Psychometric Evaluation (1 Session)",
            "Live 1-1 Session: 4 sessions",
            "Career Suitability Report: 3 career paths",
            "Profile Building Guidance: Included",
            "Mentor Discussion: 120 min",
            "CV Review: Included",
            "Career Discussion: Included",
        ],
        extraFeatures: [
            "Customize Career Discovery Planning Report",
            "General Career Sensitization & Awareness (Group)",
            "Live Group Sessions for Career Building",
            "Lifetime Access to the Career Library",
            "New Age Career Opportunities After 12 (Group)",
            "Foreign Education & Scholarship Awareness (Group)",
            "Industry-Job Specific Technology Skill (Group)",
        ],
    },
];

export function getPlanById(planId: string) {
    return PLANS.find((plan) => plan.id === planId);
}

export function formatInr(value: number) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(value);
}
