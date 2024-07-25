"use client"
import {useContext} from "react";
import {CurrentPromptContext} from "@/app/dashboard/contexts/prompts";
import clsx from "clsx";


const DataButton = ({value, setDataset, currentSelectedValue, label}: { value: string, currentSelectedValue: string | undefined, setDataset: any, label: string }) => {
    return (
        <button
            className={clsx("px-2 py-1 rounded-md mb-4 cursor-pointer hover:border-gray-400 duration-100 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2",
                value === currentSelectedValue ? 'bg-gray-50 border-indigo-500 ring-1 ring-indigo-500 hover:border-indigo-600 border-2 border-transparent' : 'border-2 border-gray-300'
            )} value={value}
            onClick={() => setDataset(value)}>
            <span className="text-sm text-gray-800"> {label}</span>
        </button>
    )
}
export default function DatasetSelection() {
    const {dataset, setDataset} = useContext(CurrentPromptContext)
    return (
        <div className="flex flex-row gap-2 mt-4">
            <DataButton value={"interior"} currentSelectedValue={dataset} setDataset={setDataset} label={"Interior House Data"}/>
            <DataButton value={"exterior"} currentSelectedValue={dataset} setDataset={setDataset} label={"Exterior House Data"}/>
            <DataButton value={"investment"} currentSelectedValue={dataset} setDataset={setDataset} label={"Investment Data"}/>
        </div>
    )
}