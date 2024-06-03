"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {useContext, useEffect, useState} from "react";
import {api} from "@/trpc/react";
import {ReloadIcon} from "@radix-ui/react-icons";
import {Textarea} from "@/components/ui/textarea";
import {CurrentPromptContext} from "@/app/dashboard/contexts/prompts";
import {toast} from "sonner";

export function PresetSave() {
  const [formData, setFormData] = useState({ name: ""})
  const { prompt, changePrompt } = useContext(CurrentPromptContext)

  const promptMutation = api.user.addPrompt.useMutation();

  const onSubmit = () => {
    promptMutation.mutate({name: formData.name, prompt})
  }

  useEffect(() => {
    if (promptMutation.isSuccess) {
      toast.success("Succesfully saved prompt.")
      setOpen(false)
      changePrompt(prompt, promptMutation.data, formData.name)
    }
  }, [promptMutation.data, promptMutation.isSuccess])

  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" onClick={() => setOpen(true)}>Save</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[475px]">
        <DialogHeader>
          <DialogTitle>Save preset</DialogTitle>
          <DialogDescription>
            This will save the current prompt.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="prompt-name">Prompt Name</Label>
            <Input
              id="prompt-name"
              autoFocus
              onChange={(e) => setFormData((prev) => ({...prev, name: e.target.value}))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              disabled
              value={prompt}
              className="h-48"
              onChange={(e) => setFormData((prev) => ({...prev, prompt: e.target.value}))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={onSubmit}
            disabled={promptMutation.isPending}
          >
            {promptMutation.isPending && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
          {promptMutation.isError && <p>Error creating prompt, try again later.</p>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}