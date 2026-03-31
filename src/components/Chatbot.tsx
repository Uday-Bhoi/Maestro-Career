"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X, Send, Sparkles } from "lucide-react"

type Message = {
    role: "bot" | "user"
    content: string
}

const FAQ_RESPONSES: Record<string, string> = {
    "how it works": "Maestro uses a 4-phase psychometric engine (Discovery, Alignment, Validation, Ignition) to map your professional DNA to modern careers. Want to start a trial?",
    "pricing": "We offer flexible plans for students and graduates. Our most popular plan is the 'Ignition' package which includes 1-on-1 mentorship.",
    "is this ai": "Not exactly! While we use advanced algorithms, our core methodology is built on 35+ years of human psychological expertise and real-world industry data.",
    "hello": "Hi there! I'm your Maestro Career Guide. How can I help you find your path today?",
    "help": "I can help you with: 1. How it works 2. Pricing details 3. Career categories. Just type your question!"
}

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false)
    const [input, setInput] = useState("")
    const [messages, setMessages] = useState<Message[]>([
        { role: "bot", content: "Hey! Confused about your career? I'm here to help you find your professional DNA. Ask me anything!" }
    ])
    const [isTyping, setIsTyping] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isTyping])

    const handleSend = (textOverride?: string) => {
        const textToSend = textOverride || input.trim()
        if (!textToSend) return

        setMessages(prev => [...prev, { role: "user", content: textToSend }])
        setInput("")
        setIsTyping(true)

        setTimeout(() => {
            const normalizedMsg = textToSend.toLowerCase()
            let botReply = "I'm still learning! You can reach our experts via the Contact form if you have a specific question."
            
            for (const key in FAQ_RESPONSES) {
                if (normalizedMsg.includes(key)) {
                    botReply = FAQ_RESPONSES[key]
                    break
                }
            }

            setMessages(prev => [...prev, { role: "bot", content: botReply }])
            setIsTyping(false)
        }, 800)
    }

    return (
        <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: "bottom right" }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="mb-6 w-[92vw] md:w-[400px] h-[600px] glass border-foreground/5 shadow-3d rounded-[2.5rem] flex flex-col overflow-hidden ring-1 ring-foreground/10"
                    >
                        {/* Header: Vibrant & Kinetic */}
                        <div className="p-8 bg-foreground flex justify-between items-center relative overflow-hidden group">
                           <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-vibe-pink/20 opacity-50" />
                           <div className="absolute top-0 right-0 w-32 h-32 bg-vibe-purple/20 blur-3xl -z-10" />
                           
                            <div className="flex items-center space-x-4 relative z-10">
                                <div className="w-12 h-12 rounded-2xl bg-background/10 backdrop-blur-xl flex items-center justify-center border border-background/20 group-hover:scale-105 transition-transform">
                                    <Sparkles className="w-6 h-6 text-background" />
                                </div>
                                <div className="space-y-0.5">
                                    <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-background/50">Career Oracle</h4>
                                    <h3 className="text-lg font-black tracking-tight text-background">Maestro Guide</h3>
                                </div>
                            </div>
                            <motion.button 
                                whileHover={{ rotate: 90, scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setIsOpen(false)} 
                                className="bg-background/10 p-2.5 rounded-xl hover:bg-background/20 transition-colors border border-background/20 relative z-10"
                            >
                                <X className="w-4 h-4 text-background" />
                            </motion.button>
                        </div>

                        {/* Messages Area */}
                        <div 
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide bg-background/20"
                        >
                            {messages.map((ms, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: ms.role === "user" ? 10 : -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`flex ${ms.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div className={`max-w-[85%] px-5 py-4 rounded-[1.8rem] text-sm font-bold shadow-sm ${
                                        ms.role === "user" 
                                        ? "bg-primary text-white rounded-br-none shadow-3d" 
                                        : "bg-secondary text-foreground rounded-tl-none border border-border/30"
                                    }`}>
                                        {ms.content}
                                    </div>
                                </motion.div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-secondary px-5 py-4 rounded-[1.8rem] rounded-tl-none shadow-sm border border-border/30 flex space-x-1.5">
                                        {[0, 1, 2].map(dot => (
                                            <motion.div 
                                                key={dot}
                                                animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] }} 
                                                transition={{ repeat: Infinity, duration: 1, delay: dot * 0.2 }} 
                                                className="w-1.5 h-1.5 rounded-full bg-primary/40" 
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Suggested Prompt Chips */}
                        <div className="px-8 py-3 bg-secondary/30 border-t border-border/10">
                            <div className="flex space-x-2 overflow-x-auto scrollbar-hide pb-1">
                                {["How it works", "Pricing", "Help"].map(q => (
                                    <motion.button 
                                        key={q} 
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleSend(q)}
                                        className="whitespace-nowrap px-4 py-2 bg-background border border-border/40 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all text-muted-foreground hover:bg-primary hover:text-white hover:border-primary shadow-sm"
                                    >
                                        {q}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className="p-8 pt-4 bg-background">
                            <div className="relative flex items-center bg-secondary/30 rounded-[2rem] border-2 border-border/20 focus-within:border-primary/20 transition-all p-1.5">
                                <input 
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-transparent px-5 py-3 text-sm font-bold text-foreground placeholder:text-muted-foreground/50 outline-none"
                                />
                                <motion.button 
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleSend()}
                                    className="w-12 h-12 bg-primary text-white rounded-[1.4rem] flex items-center justify-center hover:bg-primary/90 transition-colors shadow-3d"
                                >
                                    <Send className="w-5 h-5" />
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05, y: -2, boxShadow: "0 20px 40px hsla(var(--primary) / 0.3)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-16 h-16 rounded-[1.8rem] bg-foreground text-background shadow-3d flex items-center justify-center relative transition-all group"
            >
                <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-10 transition-opacity rounded-[1.8rem]" />
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                            <X className="w-6 h-6" />
                        </motion.div>
                    ) : (
                        <div className="relative">
                            <MessageCircle className="w-6 h-6" />
                            <motion.div 
                                animate={{ scale: [1, 1.4, 1], opacity: [0, 0.4, 0] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute inset-0 bg-primary rounded-full blur-xl -z-10"
                            />
                        </div>
                    )}
                </AnimatePresence>
            </motion.button>
        </div>
    )
}
