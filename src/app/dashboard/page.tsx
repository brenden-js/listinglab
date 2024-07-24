import {ScrollArea} from "@/components/ui/scroll-area";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"
import {PresetIndex} from "@/app/dashboard/components/preset-index";
import AdvancedPromptOptions from "@/app/dashboard/components/advanced-prompt-options";
import {HousesSection} from "@/app/dashboard/components/houses-section";
import {GenerationsSection} from "@/app/dashboard/components/generations-section";
import DatasetSelection from "@/app/dashboard/components/dataset-selection";


export default function PlaygroundPage() {
    return (
        <>
            <div className="h-full flex-col md:hidden">
                <div className="container flex flex-col items-start pt-4">
                    Mobile application in development. Use desktop for now.
                </div>
            </div>
            <div className="hidden h-full flex-col md:flex">
                <ResizablePanelGroup direction={"horizontal"}>
                    <ResizablePanel className="min-w-[75px]" defaultSize={35} maxSize={80}>
                        <HousesSection/>
                    </ResizablePanel>
                    <ResizableHandle withHandle/>
                    <ResizablePanel className="min-w-[70px]" defaultSize={65} maxSize={85}>
                        <ScrollArea className={"h-[100vh]"}>
                            <div className="px-8 min-w-[500px]">
                                <div className="flex justify-between mt-10">
                                    <p className="flex text-left font-medium">
                                        Select a dataset to include with prompt.
                                    </p>
                                {/*    A radio selection form that allows you to pick from listing data, interior house data, exterior house data, and investment data*/}
                                </div>
                                <DatasetSelection/>
                                <div className="flex justify-between mt-10 mb-4">
                                    <p className="flex text-left font-medium">
                                        Enter a prompt.
                                    </p>
                                    <PresetIndex/>
                                </div>
                                <GenerationsSection/>
                            </div>
                        </ ScrollArea>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </>
    )
}