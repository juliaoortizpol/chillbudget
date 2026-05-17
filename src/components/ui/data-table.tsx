import * as React from "react"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  appendRowComponent?: React.ReactNode
  containerClassName?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  appendRowComponent,
  containerClassName = "max-h-[280px]",
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="w-full relative flex flex-col">
      <div className={`overflow-y-auto custom-scrollbar ${containerClassName}`}>
        <Table className="relative">
          <TableHeader className="sticky top-0 bg-ds-background/95 backdrop-blur supports-[backdrop-filter]:bg-ds-background/60 z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.1)]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b border-muted/40 hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase h-12">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-b border-muted/40 hover:bg-muted/20 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-1.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {appendRowComponent && (
        <div className="border-t border-muted/40 bg-ds-background/50 rounded-b-xl overflow-hidden mt-auto">
          <Table>
            <TableFooter className="hover:bg-transparent border-t-0">
              {appendRowComponent}
            </TableFooter>
          </Table>
        </div>
      )}
    </div>
  )
}
