import { ArrowRight } from "lucide-react";

export default function Hero() {
    return (
        <section id="home" className="relative bg-white pt-24 pb-32 overflow-hidden">
            {/* Decorative gradient blob */}
            <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3">
                <div className="w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center max-w-4xl">
                <h1 className="text-5xl md:text-6xl font-extrabold text-dark tracking-tight leading-tight mb-6">
                    Empowering Your Journey to <span className="text-primary text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Professional Excellence</span>
                </h1>
                <p className="mt-4 text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
                </p>
                <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <a
                        href="/demo-test"
                        className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-full text-white bg-primary hover:bg-primary-dark shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                        Try Assessment Demo
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </a>
                    <a
                        href="#services"
                        className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-200 text-lg font-medium rounded-full text-dark bg-white hover:bg-gray-50 transition-all duration-300"
                    >
                        Learn More
                    </a>
                </div>
            </div>
        </section>
    );
}
