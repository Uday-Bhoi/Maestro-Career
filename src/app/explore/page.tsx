"use client";

import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
    ExploreHero,
    PersonalityTree,
    NatureSlider,
    CareerCards,
    VideoModalPlayer,
    FactsSlider,
    InfoSection
} from "@/components/explore/ExplorationComponents";

export default function ExplorationPage() {
    return (
        <main className="min-h-screen bg-slate-50 font-sans selection:bg-primary/20">
            <Header />

            {/* 1. Hero Section */}
            <ExploreHero />

            {/* 2. Personality Tree Explorer */}
            <PersonalityTree />

            {/* 3. Slider Interaction */}
            <NatureSlider />

            {/* 6. Interesting Facts / Stats Carousel */}
            <FactsSlider />

            {/* 4. Career Exploration Cards */}
            <CareerCards />

            {/* 7. Why Tests Matter (Clean Information Pane) */}
            <div className="py-12">
                <InfoSection />
            </div>

            {/* 5. Video Masterclass UI */}
            <VideoModalPlayer />

            <Footer />
        </main>
    );
}
