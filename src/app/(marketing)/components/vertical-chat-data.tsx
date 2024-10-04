"use client"
import React from 'react';
import {Home, MapPin, DollarSign, Store, Building, TrendingUp, Plus, List} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PaperPlaneIcon } from "@radix-ui/react-icons";
import { motion } from 'framer-motion'

const DataList = () => {
  const features = [
    { text: "Comps", icon: <Building className="w-6 h-6" /> },
    { text: "Payment estimates", icon: <DollarSign className="w-6 h-6" /> },
    { text: "Nearby places", icon: <Store className="w-6 h-6" /> },
    { text: "Listing details", icon: <Home className="w-6 h-6" /> },
    { text: "Property details", icon: <List className="w-6 h-6" /> },
    { text: "ROI, NOI, IRR", icon: <TrendingUp className="w-6 h-6" /> },
  ];

  return (
    <div className="text-white text-center">
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature, index) => (
          <motion.li
            key={index}
            className="flex flex-col items-center mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="flex items-center justify-center w-10 h-10 bg-primary rounded-full mb-2"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {feature.icon}
            </motion.div>
            <span>{feature.text}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
};

const DataComponent = () => {
  return (
    <div className="py-36 bg-gradient-to-r from-indigo-100 via-blue-50 to-blue-100 flex flex-col items-center justify-center">
      <h2
        className="px-3 text-3xl text-center font-bold mb-8
          bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600
          bg-clip-text text-transparent max-w-4xl"
      >
        Combine your expertise with real-time data to craft virtually any type of listing content you want.
      </h2>
      <div className="mx-1 flex flex-col md:mx-12 rounded-xl p-3 py-8 md:p-8 bg-[#151529] shadow-xl">
        {/* DataList on top */}
        <div className="mb-8">
          <DataList />
        </div>

        {/* Chat interface below */}
        <div className="text-black">
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
  );
};

export default DataComponent;