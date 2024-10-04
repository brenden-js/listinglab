"use client";
import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PaperPlaneIcon } from "@radix-ui/react-icons";
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from "@/app/dashboard/houses/components/chat-interface";
import { Input } from "@/components/ui/input";

interface Message {
  sender: "You" | "Bot";
  message: string;
}

const scenarios: { [key: string]: Message[] } = {
  a: [
    { sender: "Bot", message: "Hello! How can I help you with this listing?" },
    { sender: "You", message: "Give me a few sentences about the listing price, estimated payment, and location." },
    { sender: "Bot", message: "Welcome to 123 Main Street, this house..." },
  ],
  b: [
    { sender: "Bot", message: "Hello! How can I help you with this listing?" },
    { sender: "You", message: "Analyze this house and tell me if it's a good deal" },
    { sender: "Bot", message: "Based upon other recently sold houses, and houses on the market, this house..." },
  ],
  c: [
    { sender: "Bot", message: "Hello! How can I help you with this listing?" },
    { sender: "You", message: "Does this listing meet my client Sebastian's goals?" },
    {
      sender: "Bot",
      message: "Let's break it down, Sebastian is looking for a house with..."
    },
  ],
};

const DummyChat = () => {
  const [newMessage, setNewMessage] = useState("");
  const [chatData, setChatData] = useState<Message[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [currentScenario, setCurrentScenario] = useState<string | null>(null);

  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const handleStartScenario = (scenarioKey: string) => {
    if (currentScenario === scenarioKey) return; // Prevent restarting the same scenario
    setCurrentScenario(scenarioKey);
    setChatData([]);
    setNewMessage("");

    const playScenario = async (index = 0) => {
      if (index < scenarios[scenarioKey].length) {
        const message = scenarios[scenarioKey][index];
        setChatData((prevData) => [...prevData, message]);

        if (index < scenarios[scenarioKey].length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          playScenario(index + 1);
        }
      }
    };

    playScenario();
  };

  // Scroll to bottom when chatData updates
  useEffect(() => {
    const scrollableElement = scrollAreaRef.current?.querySelector(
      '[data-radix-scroll-area-viewport]'
    );
    if (scrollableElement) {
      scrollableElement.scrollTop = scrollableElement.scrollHeight;
    }
  }, [chatData]);

  // Start Scenario A when component comes into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    if (chatContainerRef.current) {
      observer.observe(chatContainerRef.current);
    }
    return () => observer?.disconnect();
  }, []);

  useEffect(() => {
    if (isInView && !currentScenario) {
      handleStartScenario("a");
    }
  }, [isInView, currentScenario]);

  return (
    <div className="my-36 px-3" ref={chatContainerRef}>
      <div className="mx-auto max-w-3xl md:text-center">
          <h2 className="font-display text-3xl  text-slate-900 sm:text-4xl font-bold tracking-tight">
            Skip the manual assembly of all the different data points, and start producing.
          </h2>
          <p className="mt-4 text-lg tracking-tight text-slate-700 mb-8">
            Cut down your time to edit and publish, to minutes.
          </p>
      </div>
      <div
        className="bg-white border-t mx-auto rounded-lg shadow-md overflow-hidden min-h-[600px] max-w-2xl flex flex-col"
      >
        <div ref={scrollAreaRef} className="flex-grow pr-4 overflow-y-auto">
          <div className="flex-1 overflow-hidden p-4 space-y-4">
            <AnimatePresence initial={false}>
              {chatData.map((message, index) => (
                <motion.div
                  key={index}
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{duration: 0.1, delay: index * 0.02}}
                  className={`p-3 max-w-[75%] my-2 rounded-lg ${message.sender === "You" ? "bg-blue-100 ml-auto" : "bg-gray-100"
                  }`}
                >
                  <p className="font-semibold">{message.sender}</p>
                  <ReactMarkdown components={markdownComponents}>
                    {message.message}
                  </ReactMarkdown>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <Input
              className="flex-grow p-2 border rounded-lg resize-none"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled
            />
            <Button type="submit" className="w-[150px]" disabled>
              <PaperPlaneIcon className="mr-2"/>
              Send
            </Button>
          </div>
        </div>
        <div className="px-4 py-3 border-b flex justify-around">
          {Object.keys(scenarios).map((key) => (
            <Button
              key={key}
              variant={currentScenario === key ? "default" : "outline"}
              onClick={() => handleStartScenario(key)}
            >
              Example {key.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DummyChat;