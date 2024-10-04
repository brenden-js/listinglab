import React from 'react';
import { Home, MapPin, DollarSign, ArrowDown,  } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {PaperPlaneIcon} from "@radix-ui/react-icons";

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

      <div className="mx-3 md:mx-12 relative rounded-xl p-8 bg-[#151529] shadow-xl">
        {/* Background Blur */}

        <div className="flex items-center justify-center">
          <ul className="mx-3 md:mx-12 mt-4 text-xl text-gray-100">
            <li>Comps</li>
            <li>Payment estimates</li>
            <li>Nearby stores and places</li>
            <li>Listing details</li>
            <li>Property details</li>
            <li>ROI, NOI, IRR</li>
          </ul>

          <div className="mx-3 md:mx-12">
            <div className="flex items-center justify-center space-x-8">
              <div className="flex flex-col items-center">
                <div className="bg-gray-100 rounded-full p-4 mb-2">
                  <DollarSign className="h-6 w-6" />
                </div>
                <ArrowDown className="h-6 w-6 ml-8 transform -rotate-45 text-white" />
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-gray-100 rounded-full p-4 mb-2">
                  <DollarSign className="h-6 w-6" />
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