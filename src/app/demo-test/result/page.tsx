"use client";

import { useEffect, useState } from "react";
import { CareerQuadrant } from "@/data/mockQuestions";
import { Download, Award, Target, AlertTriangle, BookOpen } from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

type Scores = Record<CareerQuadrant, number>;

const QUADRANT_INFO = {
    Doctor: {
        title: "Healthcare & Medicine",
        desc: "You show strong compassion, analytical skills, and grace under pressure.",
        skills: ["Empathy", "Analysis", "Crisis Management", "Attention to Detail"],
        avoid: ["Isolating desk jobs", "Highly ambiguous roles without structure"],
        courses: ["Pre-Med Foundations", "Advanced Biology", "Healthcare Administration"],
        roles: ["General Practitioner", "Medical Researcher", "Clinical Specialist"]
    },
    Engineer: {
        title: "Engineering & Technology",
        desc: "You excel at structured problem solving, logical analysis, and system building.",
        skills: ["Logic", "Systems Thinking", "Troubleshooting", "Precision"],
        avoid: ["Roles with high emotional labor", "Roles lacking clear metrics/goals"],
        courses: ["Computer Science 101", "Systems Architecture", "Advanced Calculus"],
        roles: ["Software Engineer", "Systems Architect", "Data Scientist"]
    },
    Lawyer: {
        title: "Law & Advocacy",
        desc: "You have a natural talent for argumentation, negotiation, and seeing multiple perspectives.",
        skills: ["Debate", "Negotiation", "Critical Reading", "Persuasion"],
        avoid: ["Repetitive manual tasks", "Roles lacking intellectual challenge"],
        courses: ["Pre-Law Seminars", "Public Speaking", "Ethics and Philosophy"],
        roles: ["Corporate Counsel", "Litigator", "Policy Advisor"]
    },
    Artist: {
        title: "Arts & Design",
        desc: "You are highly creative, favoring self-expression, out-of-the-box thinking, and aesthetics.",
        skills: ["Creativity", "Visual Design", "Emotional Intelligence", "Originality"],
        avoid: ["Highly regimented bureaucratic roles", "Purely statistical/number-crunching jobs"],
        courses: ["Graphic Design Basics", "Creative Writing", "Art History"],
        roles: ["UI/UX Designer", "Creative Director", "Content Creator"]
    }
};

const COLORS = ['#1294DD', '#10B981', '#F59E0B', '#8B5CF6'];

export default function ResultPage() {
    const [mounted, setMounted] = useState(false);
    const [scores, setScores] = useState<Scores | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem('assessmentDemoScores');
        if (saved) {
            setScores(JSON.parse(saved));
        } else {
            setScores({ Doctor: 4, Lawyer: 3, Engineer: 6, Artist: 2 });
        }
    }, []);

    if (!mounted || !scores) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;

    const entries = Object.entries(scores) as [CareerQuadrant, number][];
    const sorted = [...entries].sort((a, b) => b[1] - a[1]);
    const primaryQuadrant = sorted[0][0];
    const secondaryQuadrant = sorted[1][0];
    const topInfo = QUADRANT_INFO[primaryQuadrant];

    const chartData = entries.map(([name, value]) => ({ name, value }));

    const generatePDF = async () => {
        setIsGenerating(true);
        try {
            const resp = await fetch('/api/generate-pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ scores, primaryQuadrant, secondaryQuadrant })
            });
            const blob = await resp.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Maestro-Career-Report.pdf`;
            a.click();
        } catch (e) {
            console.error(e);
            alert('Error generating PDF');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-5xl mx-auto space-y-6">

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <span className="bg-primary/10 text-primary font-semibold px-3 py-1 rounded-full text-sm mb-3 inline-block">Assessment Complete</span>
                        <h1 className="text-3xl font-bold text-gray-900">Your Career Profile</h1>
                        <p className="text-gray-500 mt-2">Based on your psychometric and aptitude responses.</p>
                    </div>
                    <button
                        onClick={generatePDF}
                        disabled={isGenerating}
                        className="flex items-center gap-2 bg-dark hover:bg-black text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-70"
                    >
                        <Download className="w-5 h-5" />
                        {isGenerating ? "Generating..." : "Download PDF Report"}
                    </button>
                </div>

                <div className="bg-gradient-to-br from-primary to-blue-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 opacity-10">
                        <Award className="w-64 h-64 -mt-10 -mr-10" />
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-blue-100 mb-1 text-lg font-medium">Primary Recommended Path</h2>
                        <h3 className="text-4xl font-bold mb-4">{topInfo.title}</h3>
                        <p className="text-blue-50 text-lg max-w-2xl mb-6">{topInfo.desc}</p>

                        <div className="bg-white/10 rounded-xl p-4 inline-flex gap-8 backdrop-blur-sm border border-white/20">
                            <div>
                                <div className="text-blue-100 text-sm mb-1">Secondary Strengths</div>
                                <div className="font-semibold text-lg">{QUADRANT_INFO[secondaryQuadrant].title}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <Target className="w-5 h-5 text-primary" />
                            Score Breakdown
                        </h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <RechartsTooltip cursor={{ fill: '#f3f4f6' }} />
                                    <Bar dataKey="value" fill="#1294DD" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <Target className="w-5 h-5 text-green-500" />
                            Aptitude Distribution
                        </h3>
                        <div className="h-64 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                            <BookOpen className="w-5 h-5 text-blue-500" /> Key Skills
                        </h3>
                        <ul className="space-y-2">
                            {topInfo.skills.map((s, i) => (
                                <li key={i} className="flex items-center gap-2 text-gray-600 text-sm">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> {s}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                            <BookOpen className="w-5 h-5 text-green-500" /> Recommended Roles
                        </h3>
                        <ul className="space-y-2">
                            {topInfo.roles.map((s, i) => (
                                <li key={i} className="flex items-center gap-2 text-gray-600 text-sm">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> {s}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-yellow-100 bg-yellow-50/30 shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-yellow-200 pb-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-500" /> To Avoid
                        </h3>
                        <ul className="space-y-2">
                            {topInfo.avoid.map((s, i) => (
                                <li key={i} className="flex items-center gap-2 text-gray-600 text-sm">
                                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> {s}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
