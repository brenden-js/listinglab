"use client"

import {BarChart3, MessageCircle, RefreshCw, UserCircle, ArrowRight, BookHeart, Lightbulb} from 'lucide-react'
import { motion } from 'framer-motion'

const features = [
  {
    title: 'Transform raw data into compelling stories',
    description:
      "From listing details to investment insights. Create content that matters, powered by comprehensive data at your fingertips.",
    icon: BarChart3,
  },
  {
    title: 'Share your expertise. Effortlessly.',
    description:
      'Add your personal touch with interactive chats. Because real estate is about more than just numbers.',
    icon: Lightbulb,
  },
  {
    title: "Always up-to-date. Always relevant.",
    description:
      "Stay ahead with real-time listing scans. Fresh data, fresh content. Automatically.",
    icon: RefreshCw,
  },
  {
    title: 'Your brand. Your voice.',
    description:
      "Create content that's uniquely you. Authentic. Consistent. Powered by your expertise.",
    icon: UserCircle,
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10
    }
  }
}

export default function PrimaryFeatures() {
  return (
    <section
      id="features"
      aria-label="Primary features"
      className="relative overflow-hidden bg-gradient-to-br from-blue-100 via-indigo-200 to-blue-300 py-24 sm:py-32"
    >
      <div className="absolute inset-0 bg-grid-slate-100/[0.05] bg-[bottom_1px_center] dark:bg-grid-slate-700/[0.05]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-2xl lg:text-center"
        >
          <h2 className="text-base font-semibold leading-7 text-indigo-600">Grow your audience</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Ultra specific listing content without the hassle
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Go beyond cold calls, generic content, and expensive leads. Engage your audience with fresh, relevant real estate content about the latest listings to capture genuine interest and lasting connections.
          </p>
        </motion.div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none"
        >
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
            {features.map((feature) => (
              <div key={feature.title} className="feature-item">
                <div
                  className="mb-4 block items-center rounded-full"
                >
                  <feature.icon className="inline-block h-10 w-10 text-black" aria-hidden="true" />
                  {feature.title === 'Transform raw data into compelling stories' && (
                    <>
                      <ArrowRight className="inline-block h-8 w-8  mx-2" aria-hidden="true" />
                      <BookHeart className="inline-block h-10 w-10 " aria-hidden="true" />
                    </>
                  )}
                  {feature.title === 'Share your expertise. Effortlessly.' && (
                    <>
                      <ArrowRight className="inline-block h-8 w-8  mx-2" aria-hidden="true" />
                      <MessageCircle className="inline-block h-10 w-10 " aria-hidden="true" />
                    </>
                  )}
                </div>
                <dt className="text-2xl font-semibold leading-7 text-gray-900">{feature.title}</dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </motion.div>
      </div>
    </section>
  )
}