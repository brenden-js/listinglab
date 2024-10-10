"use client"
import React, {useEffect, useRef, useState} from "react";
import {api} from "@/trpc/react";
import {House} from "@/app/dashboard/contexts/prompts";
import {toast} from "sonner";
import {defaultChatData} from "@/app/dashboard/houses/components/default-chats";
import {ScrollArea} from "@/components/ui/scroll-area";
import {AnimatePresence, motion} from "framer-motion";
import {FinancialView, LocationView, PropertyView} from "@/app/dashboard/houses/components/chat-data-views";
import Image from "next/image";
import {Button} from "@/components/ui/button";
import {ResetChatSlider} from "@/app/dashboard/houses/components/reset-chat-slider";
import {Textarea} from "@/components/ui/textarea";
import {PaperPlaneIcon} from "@radix-ui/react-icons";
import ReactMarkdown from 'react-markdown';
import {twMerge} from "tailwind-merge";
import {cn} from "@/lib/utils";
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {APIProvider} from '@vis.gl/react-google-maps';
import {CopyIcon} from "lucide-react";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger} from "@/components/ui/drawer";
import {Separator} from "@/components/ui/separator";

interface ChatInterfaceProps {
  showDataView: boolean;
  setShowDataView: (show: boolean) => void;
  house: House;
}

type ChatType = 'Property' | 'Location' | 'Financial' | 'Main';


const baseTextStyles = "text-gray-800 leading-relaxed";
const headingStyles = "font-semibold tracking-tight";

type ComponentProps = {
  className?: string;
  children?: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>;

type CodeProps = ComponentProps & {
  inline?: boolean;
};

export const markdownComponents = {
  h1: ({className, ...props}: ComponentProps) => (
    <h1 className={twMerge(`${baseTextStyles} ${headingStyles} text-3xl my-2`, className)} {...props} />
  ),
  h2: ({className, ...props}: ComponentProps) => (
    <h2 className={twMerge(`${baseTextStyles} ${headingStyles} text-2xl my-1.5`, className)} {...props} />
  ),
  h3: ({className, ...props}: ComponentProps) => (
    <h3 className={twMerge(`${baseTextStyles} ${headingStyles} text-xl my-1`, className)} {...props} />
  ),
  p: ({className, ...props}: ComponentProps) => (
    <p className={twMerge(`${baseTextStyles} mb-1`, className)} {...props} />
  ),
  ul: ({className, ...props}: ComponentProps) => (
    <ul className={twMerge("list-disc pl-5 mb-4", className)} {...props} />
  ),
  ol: ({className, ...props}: ComponentProps) => (
    <ol className={twMerge("list-decimal pl-5 mb-4", className)} {...props} />
  ),
  li: ({className, ...props}: ComponentProps) => (
    <li className={twMerge(`${baseTextStyles} mb-0.5`, className)} {...props} />
  ),
  code: ({className, inline, ...props}: CodeProps) => (
    inline ? (
      <code className={twMerge("bg-gray-100 text-red-600 rounded px-1 py-0.5 text-sm", className)} {...props} />
    ) : (
      <code
        className={twMerge("block bg-gray-100 rounded p-3 overflow-x-auto text-sm my-4", className)} {...props} />
    )
  ),
  blockquote: ({className, ...props}: ComponentProps) => (
    <blockquote className={twMerge("border-l-4 border-gray-300 pl-4 italic my-4", className)} {...props} />
  ),
};
export const ChatInterface: React.FC<ChatInterfaceProps> = ({showDataView, setShowDataView, house}) => {
  const [currentChat, setCurrentChat] = useState<ChatType>('Main');
  const [newMessage, setNewMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const utils = api.useUtils()

  const updateChat = api.house.updateChat.useMutation({
    onMutate: async (newMessage) => {
      if (!house) return;

      await utils.house.getHouseDetails.cancel();

      // 1. Get existing data (similar to onSuccess)
      utils.house.getHouseDetails.setData(house.id, (oldData: House | undefined) => {
        if (!oldData) return; // Handle cases where oldData is undefined

        const expertiseField = `${newMessage.topic.toLowerCase()}Expertise` as keyof House;

        // 2. Update data (notice the consistent approach)
        return {
          ...oldData,
          [expertiseField]: JSON.stringify([
            ...(oldData[expertiseField] ? JSON.parse(oldData[expertiseField]) : []),
            {
              sender: "You",
              message: newMessage.message.message
            }
          ]),
        };
      });
    },
    onError: (err, newMessage, context) => {
      toast.error("Failed to send message")
    },
    onSuccess: (data, variables) => {
      if (!house) return;
      utils.house.getHouseDetails.setData(
        house.id,
        (oldData: House | undefined) => { // Use House type or appropriate type
          if (oldData) {
            return {
              ...oldData,
              [variables.topic.toLowerCase() + 'Expertise']: JSON.stringify(
                data.filteredChatData
              ),
            };
          }
          // Optionally handle cases where oldData is undefined
        }
      );
    },
  });


  const messageVariants = {
    hidden: {opacity: 0, y: 20},
    visible: {opacity: 1, y: 0},
  };

  const typingIndicatorVariants = {
    hidden: {opacity: 0, y: 10},
    visible: {opacity: 1, y: 0},
  };

  const chatData = {
    Property: house?.propertyExpertise ? JSON.parse(house.propertyExpertise) : defaultChatData.Property,
    Location: house?.locationExpertise ? JSON.parse(house.locationExpertise) : defaultChatData.Location,
    Financial: house?.financialExpertise ? JSON.parse(house.financialExpertise) : defaultChatData.Financial,
    Main: house?.mainExpertise ? JSON.parse(house.mainExpertise) : defaultChatData.Main,

  };

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {

      const scrollableElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollableElement && !showDataView) {
        scrollableElement.scrollTop = scrollableElement.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatData[currentChat], updateChat.isPending]);


  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement> | undefined) => {
    if (e){
     e.preventDefault();
    }
    if (newMessage.trim() === "") return;

    if (!house) return;

    try {
      const response = await updateChat.mutateAsync({
        topic: currentChat,
        message: {
          sender: "You",
          message: newMessage,
        },
        houseId: house.id,
      });
      console.log('response', response)

      if (response.status === 'Chat updated successfully') {
        setNewMessage("");
      }
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  const onEnterPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.keyCode == 13 && e.shiftKey == false) {
      e.preventDefault();
      handleSendMessage(undefined);
    }
  }

  const handleCopyClick = (message: string) => {
    navigator.clipboard.writeText(message);
    toast.success("Copied to clipboard.");
  };

  if (!house) return null;
  return (
    <>
      <div className="px-4 my-4 flex flex-row justify-between items-center">
        <div className="bg-secondary rounded-lg p-1.5">
          <Button variant="secondary"
                  className={cn("w-[100px] sm:w-[150px] hover:bg-secondary", currentChat === 'Main' && 'bg-white' +
                    ' hover:bg-white text-black shadow')}
                  onClick={() => setCurrentChat('Main')}
                  onDoubleClick={() => setShowDataView(!showDataView)}
          >
            Main Chat
          </Button>
        </div>
        <Tabs value={currentChat} onDoubleClick={() => setShowDataView(!showDataView)}
              onValueChange={setCurrentChat as any} className=" pl-2 sm:pl-4 flex-grow">
          <TabsList>
            <TabsTrigger value="Property">Property</TabsTrigger>
            <TabsTrigger value="Location">Location</TabsTrigger>
            <TabsTrigger value="Financial">Financial</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <Separator className=""/>
      <ScrollArea ref={scrollAreaRef} className="flex-grow pr-1 md:pr-4">
        <div className="flex-1 overflow-hidden">
          <div className="p-4 space-y-4">
            <AnimatePresence mode="wait">
              {showDataView ? (
                <motion.div
                  key="data"
                  initial={{opacity: 0, y: 20}}
                  animate={{opacity: 1, y: 0}}
                  exit={{opacity: 0, y: -20}}
                  transition={{duration: 0.1}}
                >
                  {currentChat === 'Property' && (
                    <PropertyView house={house}/>
                  )}
                  {currentChat === 'Financial' && house.investment !== null && (
                    <FinancialView investment={JSON.parse(house.investment)} listingPrice={house.price!}/>
                  )}
                  <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
                    {currentChat === 'Location' && house.nearbyPlaces !== null && (
                      <LocationView nearbyPlaces={house.nearbyPlaces} lat={house.lat!} lon={house.lon!}/>
                    )}
                  </APIProvider>
                  {currentChat === 'Main' && (
                    <div className={" flex items-center justify-center"}>
                      <div className="px-4">
                        <h3 className="text-xl font-bold mb-4">Main Chat</h3>
                        <p><strong>Your responses from the property, location, and financial
                          chats will be included in this
                          chat.</strong></p>
                      </div>
                      <Image
                        src="/images/main-chat-illustration.png"
                        alt="Main Chat Illustration"
                        width={400}
                        height={400}
                        className="mx-auto"
                      />
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="chat"
                  initial={{opacity: 0, y: 20}}
                  animate={{opacity: 1, y: 0}}
                  transition={{duration: 0.05}}
                >
                  <AnimatePresence initial={false}>
                    {chatData[currentChat].map((message: {
                      sender: string;
                      message: string
                    }, index: number) => (
                      <motion.div
                        key={index}
                        variants={messageVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{duration: 0.1, delay: index * 0.02}}
                      >
                        <div
                          className={`p-3 md:max-w-[65%] mt-2 rounded-t-lg ${message.sender === 'You' ? 'bg-blue-100' +
                            ' rounded-b-lg' +
                            ' ml-auto max-w-[80%]' : 'bg-gray-100'}`}>
                          <p className="font-semibold">{message.sender}</p>
                          <ReactMarkdown
                            components={markdownComponents}>{message.message}
                          </ReactMarkdown>
                        </div>
                        {message.sender !== 'You' && (
                          <div className={"bg-gray-200 p-1.5 flex justify-between rounded-b-lg md:max-w-[65%]"}>
                            <Button variant={"ghost"} size={"sm"} className={''}
                                    onClick={() => handleCopyClick(message.message)}>
                              <CopyIcon className="mr-2 w-4 h-4"/>
                              Copy
                            </Button>
                            <Drawer>
                              <DrawerTrigger>
                                <p className="text-xs text-gray-500 transition-colors hover:text-gray-700 cursor-pointer mr-1.5">
                                  Use generations <span className="text-blue-700 hover:text-gray-700">with caution.</span>
                                </p>
                              </DrawerTrigger>
                              <DrawerContent className="max-h-[70vh]">
                                <DrawerHeader>
                                </DrawerHeader>
                                <ScrollArea className={"max-w-2xl mb-8 mx-auto px-4 h-[70vh] overflow-auto"}>
                                  <div>
                                    <markdownComponents.h1>
                                      Generative Real Estate Content
                                    </markdownComponents.h1>

                                    <markdownComponents.p>
                                      Our real estate app now offers experimental access to content generation features
                                      powered by generative AI
                                      technology. This warning applies to the services and features that utilize this
                                      technology.
                                    </markdownComponents.p>

                                    <markdownComponents.h2>
                                      Use Responsibly
                                    </markdownComponents.h2>

                                    <markdownComponents.p>
                                      Our generative real estate content features are still experimental, and
                                      you&apos;re
                                      responsible for your use of
                                      suggested content. Exercise discretion and carefully review
                                      all generated content for
                                      accuracy, appropriateness, and compliance with real estate regulations before
                                      relying on it or sharing it with
                                      clients.
                                    </markdownComponents.p>

                                    <markdownComponents.h2>Content Originality</markdownComponents.h2>

                                    <markdownComponents.p>
                                      Our generative real estate features are designed to produce original content and
                                      not
                                      replicate existing listings
                                      or descriptions at length. We&apos;ve implemented systems to minimize the chances
                                      of this
                                      occurring, and we
                                      continuously work to improve these systems.
                                    </markdownComponents.p>

                                    <markdownComponents.h2>Editing and Customization</markdownComponents.h2>

                                    <markdownComponents.p>
                                      While our AI generates content based on your inputs, it&apos;s essential to
                                      customize and
                                      edit the results to
                                      accurately reflect specific properties, market conditions, and your professional
                                      expertise. The generated
                                      content should serve as a starting point, not a final product.
                                    </markdownComponents.p>

                                    <markdownComponents.h2>Feedback</markdownComponents.h2>

                                    <markdownComponents.p>
                                      We value your input in improving our generative real estate content features. If
                                      you
                                      encounter any issues,
                                      inaccuracies, or have suggestions for enhancement, please use the feedback option
                                      within the app to let us know.
                                    </markdownComponents.p>
                                  </div>
                                </ScrollArea>
                              </DrawerContent>
                            </Drawer>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <AnimatePresence>
                    {updateChat.isPending && (
                      <motion.div
                        key="typing"
                        variants={typingIndicatorVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        transition={{duration: 0.3}}
                        className="p-3 my-2 rounded-lg bg-gray-100 inline-block"
                      >
                        <span className="flex space-x-1">
                          <motion.span
                            animate={{opacity: [0, 1, 0]}}
                            transition={{duration: 1, repeat: Infinity, repeatDelay: 0.25}}
                            className="w-2 h-2 bg-gray-500 rounded-full"
                          />
                          <motion.span
                            animate={{opacity: [0, 1, 0]}}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              repeatDelay: 0.25,
                              delay: 0.2
                            }}
                            className="w-2 h-2 bg-gray-500 rounded-full"
                          />
                          <motion.span
                            animate={{opacity: [0, 1, 0]}}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              repeatDelay: 0.25,
                              delay: 0.4
                            }}
                            className="w-2 h-2 bg-gray-500 rounded-full"
                          />
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <div className={"flex flex-row space-x-3"}>
          <Button
            variant="outline"
            onClick={() => setShowDataView(!showDataView)}
            className={"mb-4 w-[175px]"}
          >
            {showDataView ? <p className="block">Back to Chat</p> : (<><p className="hidden sm:block sm:mr-1">View</p>
              <p>{currentChat} Data</p></>)}
          </Button>
          <ResetChatSlider houseId={house.id} topic={currentChat}/>
          <Button type="submit" className="w-[50px]sm:w-[150px] sm:hidden block"
                  disabled={newMessage.trim() === "" || updateChat.isPending}>
            <PaperPlaneIcon className="sm:mr-2"/>
            <p className="hidden sm:block">Send</p>
          </Button>
        </div>
        <form className="flex space-x-2" onSubmit={handleSendMessage}>
          <Textarea
            placeholder="Type your message here..."
            className="flex-grow p-2 border rounded-lg sm:text-md text-[16px]"
            disabled={updateChat.isPending}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={onEnterPress}
          />
          <Button type="submit" className="w-[50px]sm:w-[150px] sm:flex hidden"
                  disabled={newMessage.trim() === "" || updateChat.isPending}>
            <PaperPlaneIcon className="sm:mr-2"/>
            <p className="hidden sm:block">Send</p>
          </Button>
        </form>
      </div>
    </>
  );
};