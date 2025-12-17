import { motion } from 'framer-motion';
import { Brain, Sparkles, Zap } from 'lucide-react';

export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white py-20 mb-12">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full"
            initial={{
              x: Math.random() * 1200,
              y: Math.random() * 400,
              opacity: 0.2
            }}
            animate={{
              y: [null, Math.random() * 400],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="inline-block mb-6"
          >
            <Brain className="w-20 h-20 mx-auto" />
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-4 tracking-tight">
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="block"
            >
              AI Drug Repurposing
            </motion.span>
            <motion.span
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="block bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-pink-200"
            >
              Decision Platform
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto"
          >
            Turn drug side effects into therapeutic breakthroughs using Agentic AI
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-wrap justify-center gap-6 mb-8"
          >
            {[
              { icon: Brain, text: 'Master-Worker AI' },
              { icon: Sparkles, text: 'BioBERT NLP' },
              { icon: Zap, text: 'Explainable Results' }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05, y: -5 }}
                className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-6 py-3 rounded-full border border-white/30"
              >
                <item.icon className="w-5 h-5" />
                <span className="font-semibold">{item.text}</span>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-sm text-blue-100"
          >
            <p className="mb-2">Pharmaceutical R&D • Evidence-Based Discovery • Patent Analysis</p>
            <p className="italic">Not a chatbot. Not a search engine. A scientific decision cockpit.</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
