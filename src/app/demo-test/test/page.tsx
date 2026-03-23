"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { mockQuestions, CareerQuadrant } from "@/data/mockQuestions";
import { Clock } from "lucide-react";

export default function AssessmentTestPage() {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [scores, setScores] = useState<Record<CareerQuadrant, number>>({
        Doctor: 0,
        Lawyer: 0,
        Engineer: 0,
        Artist: 0,
    });

    const question = mockQuestions[currentIndex];
    // Ensure question is loaded on client safely
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (timeLeft <= 0) {
            handleNext();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, currentIndex]);

    const handleNext = () => {
        if (currentIndex === mockQuestions.length - 1) {
            finishTest();
        } else {
            setCurrentIndex((prev) => prev + 1);
            setTimeLeft(60);
        }
    };

    const handleOptionSelect = (points: Partial<Record<CareerQuadrant, number>>) => {
        const newScores = { ...scores };
        Object.entries(points).forEach(([quadrant, pt]) => {
            newScores[quadrant as CareerQuadrant] += (pt as number);
        });
        setScores(newScores);
        handleNext();
    };

    const finishTest = () => {
        localStorage.setItem('assessmentDemoScores', JSON.stringify(scores));
        router.push('/demo-test/result');
    };

    if (!mounted || !question) return <div className="min-h-screen bg-gray-50" />;

    const progress = ((currentIndex + 1) / mockQuestions.length) * 100;

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 flex flex-col items-center">
            <div className="w-full max-w-4xl bg-white shadow-xl rounded-2xl overflow-hidden flex flex-col min-h-[600px]">
                {/* Header */}
                <div className="bg-white border-b border-gray-100 p-6 flex justify-between items-center relative z-10 shadow-sm">
                    <div>
                        <span className="text-xs font-bold tracking-wider text-gray-400 uppercase">Question {currentIndex + 1} of {mockQuestions.length}</span>
                        <div className="mt-2 w-48 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-300 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-xl">
                        <Clock className={`w-6 h-6 ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-primary'}`} />
                        <span className={timeLeft <= 10 ? 'text-red-600 font-bold' : 'text-gray-800'}>
                            00:{timeLeft.toString().padStart(2, '0')}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
                    <div className="mb-4 inline-block">
                        <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-4 py-1.5 rounded-full border border-blue-100">
                            {question.type === 'aptitude' ? 'Aptitude Test' : 'Psychometric Test'}
                        </span>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-10 leading-tight">
                        {question.text}
                    </h2>

                    <div className="space-y-4">
                        {question.options.map((option, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleOptionSelect(option.points)}
                                className="w-full text-left p-5 rounded-xl border-2 border-gray-100 hover:border-primary hover:bg-blue-50/50 transition-all duration-200 group flex items-center shadow-sm bg-white"
                            >
                                <div className="w-8 h-8 rounded-full border border-gray-300 group-hover:border-primary group-hover:bg-primary flex items-center justify-center mr-4 transition-colors shrink-0">
                                    <span className="text-gray-500 group-hover:text-white text-sm font-medium">
                                        {String.fromCharCode(65 + idx)}
                                    </span>
                                </div>
                                <span className="text-gray-700 font-medium">{option.text}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
