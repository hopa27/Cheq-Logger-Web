import * as React from "react"
import { cn } from "@/lib/utils"

const DataGrid = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full border-separate border-spacing-0", className)}
      {...props}
    />
  </div>
))
DataGrid.displayName = "DataGrid"

const DataGridHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={className} {...props} />
))
DataGridHeader.displayName = "DataGridHeader"

const DataGridBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn(className)}
    {...props}
  />
))
DataGridBody.displayName = "DataGridBody"

const DataGridRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "group hover:bg-[#05579B] hover:text-white transition-colors [&>td]:hover:text-white [&>td>a]:hover:text-white odd:bg-white even:bg-[#e7ebec34]",
      className
    )}
    {...props}
  />
))
DataGridRow.displayName = "DataGridRow"

const SortIndicator = ({ direction }: { direction?: "asc" | "desc" | null }) => (
  <svg width="10" height="18" viewBox="0 0 10 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
    <path d="M5 0L10 6H0L5 0Z" fill={direction === "asc" ? "#002f5c" : "#BBBBBB"} />
    <path d="M5 18L0 12H10L5 18Z" fill={direction === "desc" ? "#002f5c" : "#BBBBBB"} />
  </svg>
)

export interface DataGridHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  sortable?: boolean;
  sortDirection?: "asc" | "desc" | null;
  onSortToggle?: () => void;
}

const DataGridHead = React.forwardRef<
  HTMLTableCellElement,
  DataGridHeadProps
>(({ className, sortable, sortDirection: externalSortDirection, onSortToggle, children, ...props }, ref) => {
  const [internalSort, setInternalSort] = React.useState<"asc" | "desc" | null>(null);

  const direction = externalSortDirection !== undefined ? externalSortDirection : internalSort;

  const handleToggle = () => {
    if (onSortToggle) {
      onSortToggle();
    } else {
      setInternalSort(prev => prev === "asc" ? "desc" : prev === "desc" ? null : "asc");
    }
  };

  const innerContent = (
    <div className={cn("flex items-center", sortable && "gap-4")}>
      {children}
      {sortable && <SortIndicator direction={direction} />}
    </div>
  )

  return (
    <th
      ref={ref}
      className={cn(
        "py-[24px] px-[5px] text-left align-middle font-['Livvic'] font-semibold text-[#002f5c] text-[18px] border-t-[3px] border-b-[3px] border-[#04589b]",
        sortable && "cursor-pointer hover:bg-slate-50",
        className
      )}
      onClick={sortable ? handleToggle : undefined}
      {...props}
    >
      {innerContent}
    </th>
  )
})
DataGridHead.displayName = "DataGridHead"

const DataGridCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "p-[5px] align-middle font-['Mulish'] font-light text-[#3d3d3d] text-[16px]",
      className
    )}
    {...props}
  />
))
DataGridCell.displayName = "DataGridCell"

export {
  DataGrid,
  DataGridHeader,
  DataGridBody,
  DataGridRow,
  DataGridHead,
  DataGridCell,
}