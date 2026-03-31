"use client";

import React, { useState } from "react";
import {
    Play, X, Compass, Target, LineChart,
    BrainCircuit, Users, BookOpen, Brain, Briefcase,
    ChevronRight, ChevronLeft, ArrowRight, Zap, Orbit,
    Activity, Star
} from "lucide-react";

// --- SECTION WRAPPER ---
interface SectionProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    className?: string;
    id?: string;
}
export const SectionWrapper = ({ children, title, subtitle, className = "", id = "" }: SectionProps) => (
    <section id={id} className={`py-24 px-6 md:px-12 max-w-7xl mx-auto overflow-hidden ${className}`}>
        {(title || subtitle) && (
            <div className="text-center mb-16 max-w-3xl mx-auto">
                {title && <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">{title}</h2>}
                {subtitle && <p className="text-lg md:text-xl text-slate-600 leading-relaxed">{subtitle}</p>}
            </div>
        )}
        {children}
    </section>
);

// --- HERO SECTION ---
export const ExploreHero = () => {
    return (
        <div className="relative overflow-hidden bg-white pt-32 pb-20">
            <div className="absolute top-0 -left-64 w-[500px] h-[500px] bg-blue-100/60 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-40 -right-64 w-[500px] h-[500px] bg-purple-100/60 rounded-full blur-[100px] pointer-events-none" />
            <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold mb-8 shadow-sm">
                    <Orbit className="w-4 h-4 text-blue-500" /> Interactive Discovery Engine
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-[1.1]">
                    Explore Your Personality <br className="hidden md:block" /> & Career Path
                </h1>
                <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto mb-12">
                    Dive into an interactive journey to uncover your true potential, understand your psychological traits, and map out your perfect future.
                </p>
                <button
                    onClick={() => document.getElementById('personality-tree')?.scrollIntoView({ behavior: 'smooth' })}
                    className="bg-primary text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-primary-dark transition-all hover:scale-[1.03] shadow-xl shadow-primary/20 flex items-center gap-2 mx-auto group"
                >
                    Start Exploring <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
};

// --- PERSONALITY TREE ---
const personalities = [
    { id: 'INTJ', label: 'The Architect', traits: ['Strategic', 'Logical', 'Independent'], strengths: ['Quick Thinker', 'Hard-working'], careers: ['Data Scientist', 'Software Engineer', 'Financial Analyst'], color: 'from-purple-500 to-indigo-500' },
    { id: 'INTP', label: 'The Logician', traits: ['Innovative', 'Curious', 'Analytical'], strengths: ['Objective', 'Open-minded'], careers: ['Systems Analyst', 'Biomedical Engineer', 'Economist'], color: 'from-blue-500 to-cyan-500' },
    { id: 'ENTJ', label: 'The Commander', traits: ['Bold', 'Imaginative', 'Strong-willed'], strengths: ['Efficient', 'Self-Confident'], careers: ['Management Consultant', 'Executive', 'Corporate Strategist'], color: 'from-rose-500 to-pink-500' },
    { id: 'ENTP', label: 'The Debater', traits: ['Smart', 'Curious', 'Energetic'], strengths: ['Knowledgeable', 'Excellent Brainstormer'], careers: ['Entrepreneur', 'Lawyer', 'Creative Director'], color: 'from-orange-500 to-amber-500' },
    { id: 'INFJ', label: 'The Advocate', traits: ['Quiet', 'Mystical', 'Inspiring'], strengths: ['Creative', 'Passionate'], careers: ['Clinical Psychologist', 'Writer', 'HR Manager'], color: 'from-emerald-500 to-teal-500' },
    { id: 'INFP', label: 'The Mediator', traits: ['Poetic', 'Kind', 'Altruistic'], strengths: ['Idealistic', 'Open-Minded'], careers: ['UX Designer', 'Animator', 'Author'], color: 'from-fuchsia-500 to-rose-500' },
    { id: 'ENFJ', label: 'The Protagonist', traits: ['Charismatic', 'Inspiring', 'Natural Leader'], strengths: ['Tolerant', 'Reliable'], careers: ['PR Specialist', 'Sales Manager', 'Teacher'], color: 'from-yellow-400 to-orange-500' },
    { id: 'ENFP', label: 'The Campaigner', traits: ['Enthusiastic', 'Creative', 'Sociable'], strengths: ['Curious', 'Excellent Communicator'], careers: ['Journalist', 'Event Planner', 'Brand Manager'], color: 'from-cyan-400 to-blue-500' },
];

export const PersonalityTree = () => {
    const [selected, setSelected] = useState(personalities[0]);

    return (
        <SectionWrapper
            id="personality-tree"
            title="Decode Your Psychological Blueprint"
            subtitle="Click through the 8 foundational psychological profiles to see how distinct traits map perfectly to specific industries and roles."
            className="bg-white"
        >
            <div className="flex flex-col lg:flex-row gap-12 mt-12 items-center lg:items-start">
                {/* Visual Tree Layout (Left) */}
                <div className="w-full lg:w-1/2 relative bg-slate-50 p-8 rounded-3xl border border-slate-100 flex items-center justify-center min-h-[500px]">
                    <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                        <BrainCircuit className="w-96 h-96 text-primary" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full relative z-10">
                        {personalities.map((p) => {
                            const isActive = selected.id === p.id;
                            return (
                                <button
                                    key={p.id}
                                    onClick={() => setSelected(p)}
                                    className={`relative p-4 rounded-xl text-left transition-all duration-300 overflow-hidden group
                                        ${isActive ? 'bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] scale-[1.02] border-transparent' : 'bg-transparent hover:bg-white border border-slate-200 hover:border-transparent hover:shadow-md'}
                                    `}
                                >
                                    {isActive && (
                                        <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${p.color}`} />
                                    )}
                                    <h3 className={`font-bold text-lg transition-colors ${isActive ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`}>{p.id}</h3>
                                    <p className={`text-sm font-medium transition-colors ${isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-500'}`}>{p.label}</p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Display Panel (Right) */}
                <div className="w-full lg:w-1/2">
                    <div
                        key={selected.id}
                        className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50 animate-fade-in-up"
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selected.color} flex items-center justify-center shadow-lg`}>
                                <span className="text-white font-black text-xl tracking-wider">{selected.id}</span>
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-slate-900">{selected.label}</h3>
                                <p className="text-slate-500 font-medium">Psychological Profile Analysis</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                                    <Zap className="w-4 h-4 text-amber-500" /> Core Strengths
                                </h4>
                                <ul className="grid grid-cols-2 gap-3">
                                    {selected.strengths.map((s, i) => (
                                        <li key={i} className="flex items-center gap-2 text-slate-600 bg-slate-50 px-3 py-2 rounded-lg text-sm font-medium border border-slate-100">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                                    <Target className="w-4 h-4 text-emerald-500" /> Defining Traits
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {selected.traits.map((t, i) => (
                                        <span key={i} className="px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-semibold border border-emerald-100">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                                    <Briefcase className="w-4 h-4 text-primary" /> High-Compatibility Careers
                                </h4>
                                <ul className="space-y-3">
                                    {selected.careers.map((c, i) => (
                                        <li key={i} className="flex items-center gap-3 text-slate-700 bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm text-primary font-bold text-xs">0{i + 1}</div>
                                            <span className="font-semibold">{c}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SectionWrapper>
    );
};

// --- NATURE SLIDER ---
export const NatureSlider = () => {
    const [sliderVal, setSliderVal] = useState(50);

    const getNature = () => {
        if (sliderVal < 33) return { type: 'Extrovert', desc: 'Thrives in energetic environments. Social interaction recharges their batteries. They are often quick to act and speak, highly expressive, and comfortable leading grouped initiatives.', glow: 'shadow-orange-500/40', bg: 'bg-orange-500', icon: <Users className="w-8 h-8 text-white" /> };
        if (sliderVal > 66) return { type: 'Introvert', desc: 'Gains energy from solitude and quiet reflection. Highly observant, deep thinkers who prefer detailed one-on-one conversations or independent, focused execution.', glow: 'shadow-blue-500/40', bg: 'bg-blue-500', icon: <BookOpen className="w-8 h-8 text-white" /> };
        return { type: 'Ambivert', desc: 'The balanced middle-ground. Highly adaptable, they know when to speak up and when to listen. They can thrive equally in collaborative social settings or independent analytical tasks depending on context.', glow: 'shadow-emerald-500/40', bg: 'bg-emerald-500', icon: <Activity className="w-8 h-8 text-white" /> };
    };

    const activeData = getNature();

    return (
        <SectionWrapper
            title="The Social Energy Spectrum"
            subtitle="Drag the slider to understand how your social battery directly influences your ideal working environment and communication style."
            className="bg-slate-50"
        >
            <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200 mt-10">

                {/* Slider UI */}
                <div className="relative pt-10 pb-8">
                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">
                        <span>Extrovert</span>
                        <span>Ambivert</span>
                        <span>Introvert</span>
                    </div>

                    <input
                        type="range"
                        min="0" max="100"
                        value={sliderVal}
                        onChange={(e) => setSliderVal(Number(e.target.value))}
                        className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                    />

                    <div className="flex justify-between mt-4 px-4 text-slate-300">
                        <div className="w-0.5 h-3 bg-slate-300" />
                        <div className="w-0.5 h-3 bg-slate-300" />
                        <div className="w-0.5 h-3 bg-slate-300" />
                    </div>
                </div>

                {/* Display Area */}
                <div className={`mt-8 p-8 rounded-3xl bg-slate-900 text-white relative overflow-hidden transition-all duration-500 shadow-2xl ${activeData.glow} ring-1 ring-white/10`}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                        <div className={`w-20 h-20 rounded-2xl ${activeData.bg} flex items-center justify-center shrink-0 shadow-xl transition-colors duration-500`}>
                            {activeData.icon}
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold mb-3">{activeData.type} Spectrum</h3>
                            <p className="text-slate-300 leading-relaxed text-lg">
                                {activeData.desc}
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </SectionWrapper>
    );
};

// --- CAREER EXPLORATION CARDS ---
const careerCategories = [
    { title: 'Technology & AI', icon: <BrainCircuit />, desc: 'Roles involving deep logical problem solving, building scalable software, and data analysis.', skills: ['Coding', 'Analytics', 'Logic'], path: 'Junior Dev → Tech Lead → CTO' },
    { title: 'Business & Strategy', icon: <Briefcase />, desc: 'Roles focused on market direction, organizational leadership, and financial growth.', skills: ['Leadership', 'Finance', 'Strategy'], path: 'Analyst → Manager → VP' },
    { title: 'Design & Creative', icon: <Compass />, desc: 'Roles focusing on aesthetics, user experience, visual storytelling, and brand identity.', skills: ['Creativity', 'Empathy', 'Visuals'], path: 'Designer → Art Director → Creative VP' },
];

export const CareerCards = () => {
    const [expanded, setExpanded] = useState<number | null>(null);

    return (
        <SectionWrapper
            title="Macro Career Paths"
            subtitle="Click to expand industry overviews to see standard growth trajectories and core skills required."
            className="bg-white"
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                {careerCategories.map((c, i) => {
                    const isExp = expanded === i;
                    return (
                        <div
                            key={i}
                            onClick={() => setExpanded(isExp ? null : i)}
                            className={`rounded-3xl cursor-pointer transition-all duration-500 border ${isExp ? 'bg-primary text-white border-primary shadow-2xl shadow-primary/30 scale-[1.03]' : 'bg-white text-slate-900 border-slate-200 hover:border-primary/50 hover:shadow-xl'}`}
                        >
                            <div className="p-8">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${isExp ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}`}>
                                    {React.cloneElement(c.icon as React.ReactElement, { className: 'w-7 h-7' })}
                                </div>
                                <h3 className="text-2xl font-bold mb-3">{c.title}</h3>
                                <p className={`mb-6 line-clamp-2 transition-colors ${isExp ? 'text-white/80' : 'text-slate-500'}`}>{c.desc}</p>

                                <div className={`overflow-hidden transition-all duration-500 ${isExp ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <div className={`w-full h-px mb-6 ${isExp ? 'bg-white/20' : 'bg-slate-200'}`} />

                                    <h4 className="font-semibold text-sm uppercase tracking-wider mb-3 opacity-90">Core Skills</h4>
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {c.skills.map(s => (
                                            <span key={s} className={`px-3 py-1 text-xs font-bold rounded-full ${isExp ? 'bg-white/20' : 'bg-slate-100 text-slate-700'}`}>{s}</span>
                                        ))}
                                    </div>

                                    <h4 className="font-semibold text-sm uppercase tracking-wider mb-3 opacity-90">Growth Path</h4>
                                    <p className={`font-medium ${isExp ? 'text-white' : 'text-slate-900'}`}>{c.path}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </SectionWrapper>
    );
};

// --- VIDEO LEARNING SECTION ---
export const VideoModalPlayer = () => {
    const [activeVideo, setActiveVideo] = useState<string | null>(null);

    const videos = [
        { id: 'dQw4w9WgXcQ', title: 'What is a Psychometric Test?', thumb: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80' },
        { id: '3JZ_D3ELwOQ', title: 'Why Career Counselling Matters', thumb: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=80' },
        { id: 'L_jWHffIx5E', title: 'How to Choose the Right Career', thumb: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80' },
    ];

    return (
        <SectionWrapper
            title="Video Masterclass Series"
            subtitle="Short, high-impact videos designed to instantly clarify confusing counselling concepts."
            className="bg-slate-900"
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 text-white">
                {videos.map((v, i) => (
                    <div
                        key={i}
                        className="group relative rounded-3xl overflow-hidden cursor-pointer bg-slate-800 aspect-video border border-slate-700 hover:border-slate-500 transition-colors"
                        onClick={() => setActiveVideo(v.id)}
                    >
                        <img src={v.thumb} alt={v.title} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-40 transition-opacity duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                            <div className="w-16 h-16 rounded-full bg-primary/90 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-primary/50">
                                <Play className="w-6 h-6 ml-1" />
                            </div>
                            <h3 className="text-lg font-bold drop-shadow-lg">{v.title}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Overlay */}
            {activeVideo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-4 animate-fade-in-up">
                    <div className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-700">
                        <button
                            onClick={() => setActiveVideo(null)}
                            className="absolute top-4 right-4 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <iframe
                            className="w-full h-full"
                            src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1`}
                            title="YouTube video player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            )}
        </SectionWrapper>
    );
};

// --- FACTS SLIDER ---
const facts = [
    { title: "73% Overlap", desc: "Most students choose careers based on peer pressure rather than proper algorithmic guidance.", icon: <Users /> },
    { title: "2.5x Accuracy", desc: "Valid psychometric analysis increases long-term job satisfaction prediction massively.", icon: <LineChart /> },
    { title: "Age 14 is Key", desc: "Early career assessment dramatically improves college stream decision clarity.", icon: <Target /> },
    { title: "Skill Shift", desc: "By 2030, emotional intelligence and adaptability will rule the hybrid workplace.", icon: <Brain /> },
];

export const FactsSlider = () => {
    return (
        <SectionWrapper className="bg-white py-16">
            <div className="flex overflow-x-auto gap-6 pb-8 snap-x hide-scrollbar">
                {facts.map((f, i) => (
                    <div key={i} className="min-w-[300px] md:min-w-[400px] bg-slate-50 border border-slate-200 rounded-3xl p-8 snap-center shrink-0 hover:shadow-lg transition-shadow">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
                            {React.cloneElement(f.icon as React.ReactElement, { className: 'w-6 h-6' })}
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
                        <p className="text-slate-600 leading-relaxed font-medium">{f.desc}</p>
                    </div>
                ))}
            </div>
            <div className="text-center mt-4 text-sm font-semibold text-slate-400 flex items-center justify-center gap-2">
                <ChevronLeft className="w-4 h-4" /> Swipe for facts <ChevronRight className="w-4 h-4" />
            </div>
        </SectionWrapper>
    );
};

// --- WHY PSYCHOMETRIC TESTS MATTER ---
export const InfoSection = () => {
    return (
        <SectionWrapper className="bg-blue-600 text-white rounded-[3rem] my-20 mx-4 md:mx-12 border border-blue-500 shadow-2xl relative">
            <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center relative z-10">
                <div>
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight leading-tight">Eliminate Guesswork.<br />Embrace Certainty.</h2>
                    <p className="text-blue-100 text-lg mb-8 leading-relaxed">
                        Psychometric tests look beyond raw grades. They map inherited psychological tendencies, intrinsic motivations, and natural cognitive processing styles to find the absolute clearest path forward.
                    </p>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20">
                            <Compass className="w-8 h-8 text-amber-300 mb-3" />
                            <h4 className="font-bold mb-1">Total Clarity</h4>
                            <p className="text-sm text-blue-200">Remove confusion over stream choices.</p>
                        </div>
                        <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20">
                            <Star className="w-8 h-8 text-emerald-300 mb-3" />
                            <h4 className="font-bold mb-1">Confidence</h4>
                            <p className="text-sm text-blue-200">Walk into decisions with data-backed assurance.</p>
                        </div>
                    </div>
                </div>
                <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-2xl border border-white/20">
                    <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80" alt="Mentorship" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent flex flex-col justify-end p-8 text-white">
                        <p className="font-bold text-xl">The science of human capability.</p>
                        <p className="text-blue-200 mt-2">Validated by global leading universities.</p>
                    </div>
                </div>
            </div>
        </SectionWrapper>
    );
};
