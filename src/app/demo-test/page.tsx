import Link from 'next/link';
import { ArrowRight, Clock, FileCheck, Target } from 'lucide-react';

export default function StartAssessmentPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-primary p-8 text-white text-center">
                    <h1 className="text-3xl font-bold mb-4">Maestro Career Assessment</h1>
                    <p className="text-primary-100 max-w-xl mx-auto">
                        Discover your ideal career path with our comprehensive psychometric and aptitude evaluation.
                    </p>
                </div>

                <div className="p-8">
                    <div className="grid md:grid-cols-3 gap-6 mb-10">
                        <div className="flex flex-col items-center text-center p-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                <Clock className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="font-semibold mb-2">12 Minutes</h3>
                            <p className="text-sm text-gray-500">60 seconds per question</p>
                        </div>

                        <div className="flex flex-col items-center text-center p-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                <Target className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="font-semibold mb-2">12 Questions</h3>
                            <p className="text-sm text-gray-500">Aptitude & Psychometric</p>
                        </div>

                        <div className="flex flex-col items-center text-center p-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                <FileCheck className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="font-semibold mb-2">Detailed Report</h3>
                            <p className="text-sm text-gray-500">Instant PDF generation</p>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 mb-8 text-sm text-blue-800">
                        <h4 className="font-semibold mb-2">Demo Module Notice</h4>
                        <p>This is a prototype module designed to demonstrate the assessment flow. It includes simulated payment and registration processes, a functional timed test, and outcome mapping to 4 basic career quadrants.</p>
                    </div>

                    <div className="flex justify-center">
                        <Link
                            href="/demo-test/flow"
                            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-lg font-semibold transition-colors duration-200"
                        >
                            Start Assessment Demo
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
