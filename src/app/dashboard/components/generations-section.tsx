"use client"
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import {ReloadIcon} from "@radix-ui/react-icons";
import {CopyToClipboard} from "@/app/dashboard/components/copy-to-clipboard";
import {api} from "@/trpc/react";
import {useContext, useEffect, useState} from "react";
import {CurrentPromptContext, ModelId} from "@/app/dashboard/contexts/prompts";
import {toast} from "sonner";

export const GenerationsSection = () => {
    const genMutation = api.house.generateText.useMutation()
    const {advOptions, selectedHouses, prompt, changePrompt} = useContext(CurrentPromptContext)

    useEffect(() => {
        if (genMutation.error) {
            toast.error('Something happened when creating your generation.')
            console.error(genMutation.error)
        }
    }, [genMutation.error]);

    const [generatedAnswer, setGeneratedAnswer] = useState<string>("");
    const generateAnswer = async () => {
        if (!selectedHouses.length) {
            toast.error('No houses selected.')
            return
        }

        try {
            const response = await genMutation.mutateAsync({
                prompt: prompt,
                houses: selectedHouses.map((house) => {
                    return {id: house!.id}
                }),
                max_tokens: advOptions.max_tokens,
                temperature: advOptions.temperature,
                top_p: advOptions.top_p,
                dataset: "interior"
            })
            if (response.status === "Out of Credits") {
                toast.error('Out of credits, upgrade your subscription.')
            } else {
                setGeneratedAnswer(response.generation)
            }
        } catch (e) {
            // reset the form state
            console.log('Error', e)
        }
    };
    return (
        <div className="flex">
            <div className="w-full">
                <div className="">
                    <div className="w-full">
                        <Textarea
                            placeholder="Enter prompt here."
                            value={prompt}
                            className="min-h-16 mb-2"
                            onChange={(e) => changePrompt(e.target.value, "", "New prompt")}/>
                    </div>
                    <div className="flex items-center mt-2 mb-4">
                        <Button
                            onClick={() => generateAnswer()}
                            disabled={!selectedHouses.length || genMutation.isPending}
                        >
                            {genMutation.isPending && <ReloadIcon className="mr-2 h-4 w-4 animate-spin"/>}
                            Generate
                        </Button>
                        {!selectedHouses.length &&
                            <p className="text-slate-500 text-sm ml-2">Select a house to submit prompt</p>}
                    </div>
                    {genMutation.isPending && (
                        <div
                            className={`mb-6 w-full rounded-md min-h-[196px] p-3 border bg-muted inline-block animate-pulse`}>
                        </div>
                    )}
                    {!genMutation.isPending && !generatedAnswer && (
                        <div
                            className={`mb-6 w-full rounded-md min-h-[196px] p-3 border bg-muted`}>
                        </div>
                    )}
                    {!genMutation.isPending && generatedAnswer && (
                        <CopyToClipboard>
                            {generatedAnswer}
                        </CopyToClipboard>
                    )}
                </div>
            </div>
        </div>
    )
}