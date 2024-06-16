"use client"
import {Dialog, DialogContent} from '@/components/ui/dialog'
import { useState} from 'react'

import ReactPlayer from 'react-player'
import {Button} from "@/components/ui/button";
import {PlayIcon} from "@radix-ui/react-icons";

const PopupVideoPlayer = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const vimeoVideoUrl = 'https://vimeo.com/951746102' // Replace with your Vimeo video URL

    const handlePlayerReady = () => {
        setIsLoading(false)
    }
    return (
        <>
            <Button className="flex items-center gap-2 transition-colors duration-300 hover:text-blue-800"
                    variant={'outline'} onClick={() => setIsOpen(true)}
            >
                <PlayIcon className="transition-colors duration-300"/>
                Watch Demo
            </Button>
            <Dialog
                open={isOpen}
                onOpenChange={setIsOpen}
                className="fixed inset-0 z-50 flex items-center justify-center"
            >
                <DialogContent
                    className="w-full max-w-[90vw] max-h-[80vh] overflow-auto rounded-lg bg-white p-4 flex flex-col items-center justify-center">

                    <div className="h-[calc(80vh-4rem)] aspect-video mx-auto relative">
                        {isLoading && (
                            <div
                                className="rounded-xl absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse">
                            </div>
                        )}
                        <ReactPlayer
                            url={vimeoVideoUrl}
                            width="100%"
                            height="100%"
                            controls
                            onReady={handlePlayerReady}
                            playing={true}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default PopupVideoPlayer