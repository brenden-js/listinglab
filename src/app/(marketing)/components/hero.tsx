import Image, {type StaticImageData} from 'next/image'

import logoMeta from '@/images/logos/meta.svg'
import logoCohere from '@/images/logos/cohere.svg'
import logoOpenAI from '@/images/logos/openai.svg'
import logoAI21 from '@/images/logos/ai21.svg'
import logoAnthropic from '@/images/logos/anthropic.svg'
import logoAWS from '@/images/logos/aws.svg'

import {Button} from '@/components/ui/button'
import Link from "next/link";
import PopupVideoPlayer from "@/app/(marketing)/components/pop-up-video";
import VideoPlayer from "@/app/(marketing)/components/video-player";


interface Company {
    name: string;
    logo: StaticImageData;
}

const companies = [
    [
        {name: 'OpenAI', logo: logoOpenAI as StaticImageData},
        {name: 'Anthropic', logo: logoAnthropic as StaticImageData},
        {name: 'Mistral', logo: logoCohere as StaticImageData},
    ] as Company[],
    [
        {name: 'AWS', logo: logoAWS as StaticImageData},
        {name: 'AI21 Labs', logo: logoAI21 as StaticImageData},
        {name: 'Meta', logo: logoMeta as StaticImageData},
    ] as Company[],
]

export function Hero() {
    return (
        <div className="bg-white">
            <div className="mx-auto max-w-7xl px-4 py-24 md:py-48 sm:px-6 lg:px-8 text-center">
                <span className="font-serif text-xl text-gray-500 uppercase tracking-widest">
                    Listing Lab
                </span>
                <h2 className="font-avenir-reg mt-2 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
                    Craft compelling real estate content.
                    <span className="text-indigo-600"> Effortlessly.</span>
                </h2>

                <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-500">
                    Seamlessly blend your expertise with powerful data insights to create
                    content that resonates with your market.
                </p>

                <div className="mt-10 flex justify-center">
                    <VideoPlayer playbackId={'tsQnlVSO01DYbligero017QzqKWjvKarDwSnIfukI6Fiw'}/>
                </div>
            </div>
        </div>
    );
}
