import React, {useEffect, useRef, useState} from "react";
import {useHouseDialog} from "@/app/dashboard/contexts/house-dialog-context";
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
import {ChatMessage} from "@/app/dashboard/houses/page";

interface ChatInterfaceProps {
    showDataView: boolean;
    setShowDataView: (show: boolean) => void;
    house: House;
}
export const ChatInterface: React.FC<ChatInterfaceProps> = ({showDataView, setShowDataView, house}) => {
    const {currentChat} = useHouseDialog();
    const [newMessage, setNewMessage] = useState("");
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const utils = api.useUtils()

    const updateChat = api.house.updateChat.useMutation({
        onMutate: async (newMessage) => {
            await utils.house.getHouses.cancel()
            const previousHouses = utils.house.getHouses.getData()
            if (previousHouses) {
                utils.house.getHouses.setData(undefined, (old) => {
                    return old?.map(h => {
                        if (h?.id === house?.id) {
                            const expertiseField = `${newMessage.topic.toLowerCase()}Expertise`
                            const currentExpertise = h[expertiseField as keyof House] ? JSON.parse(h[expertiseField as keyof House]) : []
                            return {
                                ...h,
                                [expertiseField]: JSON.stringify([
                                    ...currentExpertise,
                                    {
                                        sender: "You",
                                        message: newMessage.message.message,
                                    }
                                ]),
                            }
                        }
                        return h
                    })
                })
            }
            return {previousHouses}
        },
        onError: (err, newMessage, context) => {
            if (context?.previousHouses) {
                utils.house.getHouses.setData(undefined, context.previousHouses)
            }
            toast.error("Failed to send message")
        },
        onSuccess: (data, variables) => {
            const currentHouses = utils.house.getHouses.getData();
            if (currentHouses) {
                const updatedHouses = currentHouses.map((house) => {
                    if (house?.id === variables.houseId) {
                        return {
                            ...house,
                            [variables.topic.toLowerCase() + 'Expertise']: JSON.stringify(data.filteredChatData),
                        };
                    }
                    return house;
                });
                utils.house.getHouses.setData(undefined, () => updatedHouses);
            }
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
            if (scrollableElement) {
                scrollableElement.scrollTop = scrollableElement.scrollHeight;
            }
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatData[currentChat], updateChat.isPending]);


    const handleSendMessage = async () => {
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
            handleSendMessage();
        }
    }

    if (!house) return null;

    return (
        <>
            <ScrollArea ref={scrollAreaRef} className="flex-grow pr-4">
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
                                        <FinancialView investment={house.investment}/>
                                    )}
                                    {currentChat === 'Location' && house.nearbyPlaces !== null && (
                                        <LocationView nearbyPlaces={house.nearbyPlaces}/>
                                    )}
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
                                        {chatData[currentChat].map((message: ChatMessage, index: number) => (
                                            <motion.div
                                                key={index}
                                                variants={messageVariants}
                                                initial="hidden"
                                                animate="visible"
                                                transition={{duration: 0.1, delay: index * 0.02}}
                                                className={`p-3 my-2 rounded-lg ${message.sender === 'You' ? 'bg-blue-100 ml-auto max-w-[80%]' : 'bg-gray-100'}`}
                                            >
                                                <p className="font-semibold">{message.sender}</p>
                                                <p>{message.message}</p>
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
                        {showDataView ? 'Back to Chat' : `View ${currentChat} Data`}
                    </Button>
                    <ResetChatSlider houseId={house.id} topic={currentChat}/>
                </div>
                <form className="flex space-x-2" onSubmit={handleSendMessage}>
                    <Textarea
                        placeholder="Type your message here..."
                        className="flex-grow p-2 border rounded-lg"
                        disabled={updateChat.isPending}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={onEnterPress}
                    />
                    <Button type="submit" className="w-[150px]"
                            disabled={newMessage.trim() === "" || updateChat.isPending}>
                        <PaperPlaneIcon className="mr-2"/>
                        Send
                    </Button>
                </form>
            </div>
        </>
    );
};