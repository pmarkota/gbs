"use client";

import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { motion, AnimatePresence } from "framer-motion";

// Question types
interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswers: number[]; // Array of correct answer indices
  multipleChoice: boolean; // Whether multiple answers can be selected
}

const questions: Question[] = [
  {
    id: 1,
    question: "What is the house edge in most casino games?",
    options: [
      "A) The casino always loses money",
      "B) A mathematical advantage that ensures the casino profits over time",
      "C) A physical barrier around the casino",
      "D) The minimum bet amount"
    ],
    correctAnswers: [1], // B
    multipleChoice: false
  },
  {
    id: 2,
    question: "Which of the following are signs of problem gambling? (Select all that apply)",
    options: [
      "A) Chasing losses with bigger bets",
      "B) Lying about gambling activities",
      "C) Setting and sticking to a budget",
      "D) Gambling with money needed for essentials"
    ],
    correctAnswers: [0, 1, 3], // A, B, D
    multipleChoice: true
  },
  {
    id: 3,
    question: "What is the most important rule for responsible gambling?",
    options: [
      "A) Always bet on red in roulette",
      "B) Never gamble with money you can't afford to lose",
      "C) Play only on weekends",
      "D) Always double your bet after a loss"
    ],
    correctAnswers: [1], // B
    multipleChoice: false
  },
  {
    id: 4,
    question: "Which strategies can help maintain control while gambling? (Select all that apply)",
    options: [
      "A) Set time limits before you start",
      "B) Set spending limits before you start",
      "C) Take regular breaks",
      "D) Drink alcohol to relax"
    ],
    correctAnswers: [0, 1, 2], // A, B, C
    multipleChoice: true
  },
  {
    id: 5,
    question: "What should you do if gambling is negatively affecting your life?",
    options: [
      "A) Gamble more to win back losses",
      "B) Keep it secret from family and friends",
      "C) Seek help from professionals or support groups",
      "D) Switch to different types of gambling"
    ],
    correctAnswers: [2], // C
    multipleChoice: false
  }
];

const BlogPage = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [userAnswers, setUserAnswers] = useState<number[][]>(Array(questions.length).fill([]));
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [showReward, setShowReward] = useState(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const question = questions[currentQuestion];
    
    if (question.multipleChoice) {
      if (selectedAnswers.includes(answerIndex)) {
        setSelectedAnswers(selectedAnswers.filter(a => a !== answerIndex));
      } else {
        setSelectedAnswers([...selectedAnswers, answerIndex]);
      }
    } else {
      setSelectedAnswers([answerIndex]);
    }
  };

  const handleNextQuestion = () => {
    // Save current answers
    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentQuestion] = selectedAnswers;
    setUserAnswers(newUserAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswers(userAnswers[currentQuestion + 1] || []);
    } else {
      // Calculate final score
      let finalScore = 0;
      newUserAnswers.forEach((answers, index) => {
        const question = questions[index];
        const correctAnswers = question.correctAnswers.sort();
        const userAnswersSorted = answers.sort();
        
        if (JSON.stringify(correctAnswers) === JSON.stringify(userAnswersSorted)) {
          finalScore++;
        }
      });
      
      setScore(finalScore);
      setShowResults(true);
      
      if (finalScore === questions.length) {
        setTimeout(() => setShowReward(true), 1000);
      }
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      // Save current answers
      const newUserAnswers = [...userAnswers];
      newUserAnswers[currentQuestion] = selectedAnswers;
      setUserAnswers(newUserAnswers);
      
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswers(userAnswers[currentQuestion - 1] || []);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setUserAnswers(Array(questions.length).fill([]));
    setShowResults(false);
    setScore(0);
    setShowReward(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a0f0a] to-[#2d1b0e] text-white relative overflow-hidden">
      <Header />
      
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Floating Orbs */}
        <motion.div
          className="absolute top-1/4 left-1/6 w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, rgba(212,175,55,0.02) 40%, transparent 70%)'
          }}
          animate={{ 
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/6 w-80 h-80 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, rgba(212,175,55,0.01) 50%, transparent 80%)'
          }}
          animate={{ 
            x: [0, -40, 0],
            y: [0, 40, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        />
        
        {/* Particle System */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#d4af37]/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 0.6, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
      
      <main className="relative flex-grow px-4 pt-16 pb-16 flex items-center justify-center min-h-screen">
        <motion.div
          className="relative z-10 w-full max-w-4xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Main Content Card */}
          <motion.div
            className="relative backdrop-blur-xl bg-gradient-to-br from-[#1a0805]/40 via-[#2d0f08]/60 to-[#1a0805]/40 p-10 rounded-3xl border border-[#d4af37]/20 shadow-[0_25px_80px_rgba(0,0,0,0.4)] overflow-hidden"
            variants={itemVariants}
            whileHover={{ 
              boxShadow: "0 30px 100px rgba(212,175,55,0.15), 0 0 0 1px rgba(212,175,55,0.1)",
              scale: 1.01
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* Inner Glow Effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#d4af37]/5 via-transparent to-[#d4af37]/5 pointer-events-none" />
            
            {/* Dynamic Corner Accents */}
            <motion.div
              className="absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-radial from-[#d4af37]/10 to-transparent"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.6, 0.3],
                rotate: [0, 90, 0]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-gradient-radial from-[#d4af37]/8 to-transparent"
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.2, 0.5, 0.2],
                rotate: [0, -90, 0]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            />
            
            {/* Header */}
            <motion.div
              className="flex flex-col items-center mb-8"
              variants={itemVariants}
            >
              <div className="relative mb-4">
                <div className="absolute inset-0 rounded-full bg-[#d4af37]/20 blur-xl scale-150"></div>
                <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#d4af37]/10 to-[#d4af37]/5 border border-[#d4af37]/30">
                  <svg className="w-8 h-8 text-[#d4af37]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#d4af37] via-[#f4c430] to-[#d4af37] bg-clip-text text-transparent mb-2">
                  Casino Education Hub
                </h1>
                <p className="text-sm text-gray-400 font-light tracking-wide">Learn about responsible gambling</p>
              </div>
            </motion.div>

            {!showResults ? (
              <>
                {/* Blog Content */}
                {currentQuestion === 0 && (
                  <motion.div
                    className="mb-8 prose prose-invert max-w-none"
                    variants={itemVariants}
                  >
                    <div className="text-gray-300 space-y-6 leading-relaxed">
                      <h2 className="text-2xl font-semibold text-[#d4af37] mb-4">Understanding Casino Games and Responsible Gambling</h2>
                      
                      <p>
                        Casinos are entertainment venues that offer various games of chance and skill. While they can provide excitement and fun, 
                        it's crucial to understand how they work and how to gamble responsibly.
                      </p>
                      
                      <h3 className="text-xl font-semibold text-[#d4af37] mt-6 mb-3">The House Edge</h3>
                      <p>
                        Every casino game has a built-in mathematical advantage for the house, known as the "house edge." This ensures that 
                        over time, the casino will always profit. Understanding this concept is fundamental to responsible gambling.
                      </p>
                      
                      <h3 className="text-xl font-semibold text-[#d4af37] mt-6 mb-3">Signs of Problem Gambling</h3>
                      <p>
                        Problem gambling can affect anyone. Warning signs include chasing losses, lying about gambling activities, 
                        gambling with essential money, and feeling unable to stop despite negative consequences.
                      </p>
                      
                      <h3 className="text-xl font-semibold text-[#d4af37] mt-6 mb-3">Responsible Gambling Strategies</h3>
                      <p>
                        Set strict time and money limits before you start. Never gamble with money you can't afford to lose. 
                        Take regular breaks, avoid alcohol while gambling, and seek help if gambling becomes problematic.
                      </p>
                      
                      <div className="bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-lg p-4 mt-6">
                        <p className="text-[#d4af37] font-semibold">
                          Remember: Gambling should be entertainment, not a way to make money or solve financial problems.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Quiz Section */}
                <motion.div variants={itemVariants}>
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold text-[#d4af37]">
                        Knowledge Check - Question {currentQuestion + 1} of {questions.length}
                      </h3>
                      <div className="text-sm text-gray-400">
                        Progress: {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-[#1a0805]/60 rounded-full h-2 mb-6">
                      <motion.div
                        className="bg-gradient-to-r from-[#d4af37] to-[#f4c430] h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>

                  {/* Question */}
                  <div className="mb-8">
                    <h4 className="text-lg font-medium text-white mb-4">
                      {questions[currentQuestion].question}
                    </h4>
                    
                    {questions[currentQuestion].multipleChoice && (
                      <p className="text-sm text-[#d4af37] mb-4">
                        * Multiple answers may be correct - select all that apply
                      </p>
                    )}
                    
                    <div className="space-y-3">
                      {questions[currentQuestion].options.map((option, index) => (
                        <motion.button
                          key={index}
                          className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${
                            selectedAnswers.includes(index)
                              ? 'bg-[#d4af37]/20 border-[#d4af37]/60 text-[#d4af37]'
                              : 'bg-[#0f0605]/60 border-[#d4af37]/20 text-gray-300 hover:border-[#d4af37]/40'
                          }`}
                          onClick={() => handleAnswerSelect(index)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {option}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between">
                    <motion.button
                      className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                        currentQuestion === 0
                          ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                          : 'bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30 hover:bg-[#d4af37]/30'
                      }`}
                      onClick={handlePreviousQuestion}
                      disabled={currentQuestion === 0}
                      whileHover={currentQuestion > 0 ? { scale: 1.05 } : {}}
                      whileTap={currentQuestion > 0 ? { scale: 0.95 } : {}}
                    >
                      Previous
                    </motion.button>
                    
                    <motion.button
                      className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                        selectedAnswers.length === 0
                          ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-[#d4af37] via-[#f4c430] to-[#d4af37] text-black hover:from-[#e1bd45] hover:via-[#f7d045] hover:to-[#e1bd45]'
                      }`}
                      onClick={handleNextQuestion}
                      disabled={selectedAnswers.length === 0}
                      whileHover={selectedAnswers.length > 0 ? { scale: 1.05 } : {}}
                      whileTap={selectedAnswers.length > 0 ? { scale: 0.95 } : {}}
                    >
                      {currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                    </motion.button>
                  </div>
                </motion.div>
              </>
            ) : (
              /* Results Section */
              <motion.div
                className="text-center"
                variants={itemVariants}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="text-2xl font-bold text-[#d4af37] mb-6">Quiz Complete!</h3>
                
                <div className="mb-8">
                  <div className="text-4xl font-bold text-white mb-2">
                    {score} / {questions.length}
                  </div>
                  <div className="text-gray-400">
                    {score === questions.length ? 'Perfect Score!' : 
                     score >= questions.length * 0.8 ? 'Great Job!' :
                     score >= questions.length * 0.6 ? 'Good Effort!' : 'Keep Learning!'}
                  </div>
                </div>

                {score === questions.length && (
                  <motion.div
                    className="mb-8 p-6 bg-gradient-to-r from-[#d4af37]/20 to-[#f4c430]/20 rounded-2xl border border-[#d4af37]/30"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <p className="text-[#d4af37] font-semibold mb-2">
                      Congratulations! You've demonstrated excellent knowledge of responsible gambling.
                    </p>
                    <p className="text-gray-300">
                      You've earned 50 coins for completing the quiz with a perfect score!
                    </p>
                  </motion.div>
                )}

                <motion.button
                  className="bg-gradient-to-r from-[#d4af37] via-[#f4c430] to-[#d4af37] text-black font-bold py-3 px-8 rounded-xl hover:from-[#e1bd45] hover:via-[#f7d045] hover:to-[#e1bd45] transition-all duration-300"
                  onClick={resetQuiz}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Retake Quiz
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </main>

      {/* Reward Animation */}
      <AnimatePresence>
        {showReward && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowReward(false)}
          >
            <motion.div
              className="bg-gradient-to-br from-[#1a0805]/90 via-[#2d0f08]/90 to-[#1a0805]/90 p-8 rounded-2xl border border-[#d4af37] shadow-[0_0_50px_rgba(212,175,55,0.5)] text-center backdrop-blur-xl"
              initial={{ scale: 0.5, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.5, y: 50, opacity: 0 }}
              transition={{ type: "spring", duration: 0.6 }}
            >
              <motion.div
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#d4af37] to-[#f4c430] flex items-center justify-center"
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                  scale: { duration: 1, repeat: Infinity, repeatType: "reverse" }
                }}
              >
                <span className="text-3xl font-bold text-black">50</span>
              </motion.div>
              
              <motion.h3
                className="text-2xl font-bold text-[#d4af37] mb-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Congratulations!
              </motion.h3>
              
              <motion.p
                className="text-white/90 mb-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                You've earned <span className="text-[#d4af37] font-bold">50 coins</span> for completing the quiz with a perfect score!
              </motion.p>
              
              <motion.button
                className="bg-gradient-to-r from-[#d4af37] via-[#f4c430] to-[#d4af37] text-black font-bold py-3 px-6 rounded-xl hover:from-[#e1bd45] hover:via-[#f7d045] hover:to-[#e1bd45] transition-all duration-300"
                onClick={() => setShowReward(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Claim Reward
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default BlogPage;
