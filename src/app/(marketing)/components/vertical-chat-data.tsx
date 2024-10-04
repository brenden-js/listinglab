"use client"
import React from 'react';
import { Home, MapPin, DollarSign, ArrowDown, Store, Building, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {PaperPlaneIcon} from "@radix-ui/react-icons";
import { motion } from 'framer-motion'

const DataList = () => {
  const features = [
    { text: "Comps", icon: <Building className="w-6 h-6" /> },
    { text: "Payment estimates", icon: <DollarSign className="w-6 h-6" /> },
    { text: "Nearby places", icon: <Store className="w-6 h-6" /> },
    { text: "Listing details", icon: <Home className="w-6 h-6" /> },
    { text: "Property details", icon: <Building className="w-6 h-6" /> },
    { text: "ROI, NOI, IRR", icon: <TrendingUp className="w-6 h-6" /> },
  ]

  return (
    <div>
      <h4>Automatically included with every listing:</h4>
      <ul className="mx-1 md:mx-12 mt-4 space-y-4">
        {features.map((feature, index) => (
          <motion.li
            key={index}
            className="flex items-center space-x-4 text-xl"
            initial={{opacity: 0, x: -20}}
            animate={{opacity: 1, x: 0}}
            transition={{duration: 0.5, delay: index * 0.1}}
          >
            <motion.div
              className="flex items-center justify-center w-10 h-10 bg-primary rounded-full"
              whileHover={{scale: 1.1}}
              whileTap={{scale: 0.9}}
            >
              {feature.icon}
            </motion.div>
            <span>{feature.text}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  )

}
const DataComponent = () => {
  return (
    <div className="py-36 bg-gradient-to-r from-indigo-100 via-blue-50 to-blue-100 flex flex-col items-center justify-center">
      <h2
        className="px-3 text-3xl text-center font-bold mb-8
          bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600
          bg-clip-text text-transparent max-w-4xl"
      >
        Combine your expertise with real-time data
        to craft virtually any type of listing content you want.
      </h2>
      <div className="mx-1 md:mx-12 relative rounded-xl p-3 py-8 md:p-8 bg-[#151529] shadow-xl">
        <div className="flex items-center justify-center text-gray-100">
          <DataList />
          <div className="text-black mx-3 md:mx-12">
            <div className="flex items-center justify-center space-x-8">
              <div className="flex flex-col items-center">
                <div className="bg-gray-100 rounded-full p-4 mb-2">
                  <DollarSign className="h-6 w-6" />
                </div>
                <ArrowDown className="h-6 w-6 ml-8 transform -rotate-45 text-white" />
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-gray-100 rounded-full p-4 mb-2">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <ArrowDown className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-gray-100 rounded-full p-4 mb-2">
                  <MapPin className="h-6 w-6" />
                </div>
                <ArrowDown className="h-6 w-6 mr-8 transform rotate-45 text-white" />
              </div>
            </div>

            <div className="flex items-center justify-center mt-8">
              <div className="bg-gray-100 rounded-lg p-4">
                <Home className="h-8 w-8" />
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="p-3 my-2 rounded-lg bg-gray-100">
                <p className="font-semibold">Deena AI</p>
                How can I help with this listing?
              </div>
              <div className="flex space-x-2 text-white">
                <Input
                  placeholder="Type your message here..."
                  className="flex-grow p-2 border rounded-lg"
                  defaultValue="Create a piece of content that..."
                />
                <Button className="w-[150px] bg-white text-black hover:bg-gray-100">
                  <PaperPlaneIcon className="mr-2 h-4 w-4" />
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataComponent;