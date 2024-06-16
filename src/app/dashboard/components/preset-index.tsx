"use client"

import {api} from "@/trpc/react";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {CaretSortIcon, CheckIcon, DotsHorizontalIcon} from "@radix-ui/react-icons";
import * as React from "react";
import {useContext} from "react";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {
    AlertDialog, AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {CurrentPromptContext} from "@/app/dashboard/contexts/prompts";
import {PresetSave} from "@/app/dashboard/components/preset-save";
import { communityPrompts} from "@/lib/data/community-prompts";
import {toast} from "sonner";
import {cn} from "@/lib/utils";

export const PresetIndex = () => {
    const [open, setOpen] = React.useState(false)

    const {changePrompt, promptId, name} = useContext(CurrentPromptContext)
    const getPrompts = api.user.getPrompts.useQuery()

    const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
    const deleteMutation = api.user.deletePrompt.useMutation()

    return (
        <div className="flex space-x-2">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-label="Load a prompt"
                        aria-expanded={open}
                        className="flex-1 justify-between md:max-w-[200px] lg:max-w-[300px]"
                    >
                        {name ? name : "Select a prompt..."}
                        <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px]">
                    <h4 className="font-medium mt-2">My prompts</h4>
                    {getPrompts.data === undefined && (
                        <div
                            className={"relative flex items-center rounded-sm px-2 py-1.5 text-sm outline-none"}
                        >Loading prompts...</div>
                    )}
                    {!getPrompts.data?.length && !getPrompts.isPending && (
                        <div
                            className={"relative flex items-center rounded-sm px-2 py-1.5 text-sm outline-none"}
                        >Create a custom prompt and save it to see it here.</div>
                    )}
                    {getPrompts.data?.map((myPrompt) => (
                        <div
                            className={"relative hover:bg-gray-100 cursor-pointer flex items-center rounded-sm px-2 py-1.5 text-sm outline-none"}
                            key={myPrompt.promptId}
                            onClick={() => {
                                changePrompt(myPrompt.prompt, myPrompt.promptId, myPrompt.name)
                                setOpen(false)
                            }}
                        >
                            {myPrompt.name}
                            <CheckIcon
                                className={cn(
                                    "ml-auto h-4 w-4",
                                    promptId === myPrompt.promptId
                                        ? "opacity-100"
                                        : "opacity-0"
                                )}
                            />
                        </div>
                    ))}
                        <h4 className="font-medium mt-2">Community prompts</h4>
                        {communityPrompts.map((example) => (
                            <div
                                className={"relative hover:bg-gray-100 cursor-pointer flex items-center rounded-sm px-2 py-1.5 text-sm outline-none"}
                                key={example.id}
                                onClick={() => {
                                    changePrompt(example.prompt, example.id, example.name)
                                    setOpen(false)
                                }}
                            >
                                {example.name}
                                <CheckIcon
                                    className={cn(
                                        "ml-auto h-4 w-4",
                                        promptId === example.id
                                            ? "opacity-100"
                                            : "opacity-0"
                                    )}
                                />
                            </div>
                        ))}
                </PopoverContent>
            </Popover>

            {/* Save prompt */
            }

            <PresetSave/>

            {/* Actions */
            }

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="secondary">
                        <span className="sr-only">Actions</span>
                        <DotsHorizontalIcon className="h-4 w-4"/>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem
                        onSelect={() => setShowDeleteDialog(true)}
                        className="text-red-600"
                        disabled={!promptId}
                    >
                        Delete prompt
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This preset will no longer be
                            accessible by you or others you&apos;ve shared it with.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <Button
                            variant="destructive"
                            onClick={async () => {
                                deleteMutation.mutate(promptId)
                                setShowDeleteDialog(false)
                                await getPrompts.refetch()
                                changePrompt("", "", "")
                                toast.success('Succesfully deleted prompt.')
                            }}
                        >
                            Delete
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </div>
    )
}