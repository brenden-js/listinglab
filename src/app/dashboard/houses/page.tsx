"use client"

import React, { useState, useEffect, useCallback } from "react"
import { api } from "@/trpc/react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  RowSelectionState,
} from "@tanstack/react-table"
import { HouseDialogProvider } from "@/app/dashboard/contexts/house-dialog-context"
import { AddZipCodeDialog } from "@/app/dashboard/houses/components/zip-dialog"
import { AddHouse } from "@/app/dashboard/houses/components/add-house"
import { House } from "@/app/dashboard/contexts/prompts"
import Link from "next/link"
import { useRouter } from "next/navigation"

const columns: ColumnDef<House>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "stAddress",
    header: "Address",
    cell: ({ row }) => {
      const house = row.original
      if (!house) return null
      return (
        <Link href={`/dashboard/houses/${house.id}`} passHref>
          <div className="flex items-center">
            <p className="text-sm font-medium text-gray-900 hover:text-gray-700 hover:underline cursor-pointer">
              {house.stAddress}
            </p>
          </div>
        </Link>
      )
    }
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const price = row.getValue("price") as number | null
      const formatted = price
        ? new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(price)
        : "N/A"
      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "beds",
    header: "Bedrooms",
  },
  {
    accessorKey: "baths",
    header: "Bathrooms",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date
      return date.toLocaleDateString()
    },
  },
  {
    accessorKey: "seen",
    header: "Seen",
    cell: ({ row }) => ((row.getValue("seen") as number | null) ? "Yes" : "No"),
  },
]

export default function HousesPageOverview() {
  const router = useRouter()
  const currentZipCodes = api.house.getUserZipCodes.useQuery()
  const { data: housesData, isLoading: housesLoading } = api.house.getHouses.useQuery()
  const [selectedZipCode, setSelectedZipCode] = useState<string | undefined>(undefined)
  const [openZipCodeDialog, setOpenZipCodeDialog] = useState(false)
  const [activeFilter, setActiveFilter] = useState<"all" | "today" | "new">("all")
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [selectedHouses, setSelectedHouses] = useState<House[]>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  useEffect(() => {
    if (currentZipCodes.isSuccess && currentZipCodes.data.length > 0) {
      setSelectedZipCode(currentZipCodes.data[0].id)
    }
  }, [currentZipCodes])

  const getFilteredHouses = () => {
    if (!housesData) return []

    switch (activeFilter) {
      case "today":
        return housesData.filter(
          (house) =>
            house.createdAt &&
            new Date(house.createdAt).toDateString() === new Date().toDateString()
        )
      case "new":
        return housesData.filter((house) => !house.seen)
      default:
        return housesData
    }
  }

  const filteredHouses = getFilteredHouses()

  const onRowSelectionChange = useCallback((updater: ((prev: RowSelectionState) => RowSelectionState) | RowSelectionState) => {
    let newSelection: RowSelectionState
    if (typeof updater === 'function') {
      newSelection = updater(rowSelection)
    } else {
      newSelection = updater
    }

    const selectedCount = Object.values(newSelection).filter(Boolean).length
    if (selectedCount <= 5) {
      setRowSelection(newSelection)
    }
  }, [rowSelection])

  useEffect(() => {
    const selectedHouses = filteredHouses.filter((_, index) => rowSelection[index])
    setSelectedHouses(selectedHouses)
  }, [rowSelection, filteredHouses])

  const table = useReactTable({
    data: filteredHouses,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: onRowSelectionChange,
    initialState: {
      pagination: {
        pageSize: 30,
      },
    },
  })

  const chatWithSelectedHouses = () => {
    const selectedIds = selectedHouses.map((house) => house!.id).join('/')
    router.push(`/dashboard/houses/multi/${selectedIds}`)
  }

  return (
    <HouseDialogProvider>
      <div className="h-full flex flex-col">
        <div className="ml-3 flex items-center flex-row h-16">
          <h2 className="text-lg font-semibold">Houses</h2>
          <Button
            variant="secondary"
            className="ml-3"
            onClick={() => setOpenZipCodeDialog(true)}
          >
            Zip Codes
          </Button>
          <AddZipCodeDialog open={openZipCodeDialog} onOpenChange={setOpenZipCodeDialog} />
        </div>
        <Separator />
        <div className="p-3">
          <div className="flex justify-between mb-4">
            <div className="flex gap-2">
              <Button
                variant={activeFilter === "all" ? "default" : "outline"}
                onClick={() => setActiveFilter("all")}
              >
                All
              </Button>
              <Button
                variant={activeFilter === "today" ? "default" : "outline"}
                onClick={() => setActiveFilter("today")}
              >
                Today
              </Button>
              <Button
                variant={activeFilter === "new" ? "default" : "outline"}
                onClick={() => setActiveFilter("new")}
              >
                New
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={chatWithSelectedHouses}
                disabled={selectedHouses.length < 2}
              >
                Chat with selected houses ({selectedHouses.length})
              </Button>
              <AddHouse />
            </div>
          </div>

          <div className="flex items-center py-4">
            <Input
              placeholder="Search houses..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(String(event.target.value))}
              className="max-w-sm"
            />
          </div>

          {housesLoading ? (
            <div>Loading...</div>
          ) : filteredHouses.length > 0 ? (
            <div>
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : (
            <div>No houses found.</div>
          )}
        </div>
      </div>
    </HouseDialogProvider>
  )
}