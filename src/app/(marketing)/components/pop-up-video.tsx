"use client"
import {Dialog, DialogContent} from '@/components/ui/dialog'
import { useState} from 'react'

import ReactPlayer from 'react-player'
import {Button} from "@/components/ui/button";
import {PlayIcon} from "@radix-ui/react-icons";

const PopupVideoPlayer = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const vimeoVideoUrl = 'https://www.youtube.com/watch?v=me1ZuKsKQUA'

    const handlePlayerReady = () => {
        setIsLoading(false);
    }

    return (
        <>
            <Button className="flex items-center gap-2 transition-colors duration-300 hover:text-blue-300"
                    onClick={() => setIsOpen(true)}
            >
                <PlayIcon className="transition-colors duration-300"/>
                Watch Demo
            </Button>
            <Dialog
                open={isOpen}
                onOpenChange={setIsOpen}
            >
                <DialogContent
                    className="w-full max-w-[1750px] max-h-[80vh] overflow-auto rounded-lg bg-white p-4 pt-12 flex flex-col items-center justify-center">

                    <div className="relative max-h-[800px] w-full" style={{aspectRatio: '4 / 3'}}>
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