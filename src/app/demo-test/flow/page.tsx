"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

const steps = [
    { id: 'auth', title: 'Registration / Login', desc: 'Secure user authentication' },
    { id: 'payment', title: 'Payment Processing', desc: 'Secure payment gateway' },
    { id: 'ready', title: 'Assessment Ready', desc: 'Prepare for your test' },
];

export default function FlowStatusSection() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        // Simulate steps completion for demo purposes
        if (currentStep < 2) {
            const timer = setTimeout(() => {
                setCurrentStep(prev => prev + 1);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [currentStep]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-center mb-8">System Flow Simulation</h2>

                <div className="space-y-6 mb-10">
                    {steps.map((step, index) => {
                        const isCompleted = currentStep > index;
                        const isCurrent = currentStep === index;

                        return (
                            <div
                                key={step.id}
                                className={`flex items-center p-4 rounded-xl border ${isCompleted ? 'border-green-200 bg-green-50' :
                                        isCurrent ? 'border-primary bg-blue-50' :
                                            'border-gray-100 bg-gray-50 opacity-60'
                                    }`}
                            >
                                <div className="mr-4">
                                    {isCompleted ? (
                                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                                    ) : isCurrent ? (
                                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                    ) : (
                                        <Circle className="w-8 h-8 text-gray-300" />
                                    )}
                                </div>
                                <div>
                                    <h3 className={`font-semibold ${isCompleted ? 'text-green-800' : isCurrent ? 'text-blue-900' : 'text-gray-500'}`}>
                                        {step.title}
                                    </h3>
                                    <p className="text-sm text-gray-500">{step.desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {currentStep === 2 && (
                    <div className="text-center animate-fade-in">
                        <button
                            onClick={() => router.push('/demo-test/test')}
                            className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-lg font-semibold transition-colors w-full sm:w-auto"
                        >
                            Begin Test Now
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
