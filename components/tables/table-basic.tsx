'use client'

import React, {CSSProperties, Fragment, useEffect, useState} from 'react'

import {keepPreviousData, QueryClient, QueryClientProvider, useQuery,} from '@tanstack/react-query'

import {
  Cell,
  Column,
  ColumnDef,
  ColumnFiltersState, ColumnOrderState, ColumnPinningState,
  flexRender,
  getCoreRowModel, Header,
  PaginationState,
  RowPinningState,
  RowSelectionState,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table'

import {fetchData, Person} from '@/makeData'
import '@/app/index.css'
import {Checkbox} from "@/components/ui/checkbox";
import {arrayMove, horizontalListSortingStrategy, SortableContext, useSortable} from "@dnd-kit/sortable";
import { CSS } from '@dnd-kit/utilities'
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {restrictToHorizontalAxis} from "@dnd-kit/modifiers";

const queryClient = new QueryClient()


const DraggableTableHeader = ({header}: {
  header: Header<Person, unknown>
}) => {
  const { attributes, isDragging, listeners, setNodeRef, transform } = useSortable({id: header.column.id})

  const isPinned = header.column.getIsPinned()
  const isLastLeftPinnedColumn = isPinned === 'left' && header.column.getIsLastColumn('left')
  const isFirstRightPinnedColumn = isPinned === 'right' && header.column.getIsFirstColumn('right')

  const style: CSSProperties = {
    position: isPinned ? 'sticky' : 'relative',
    transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
    transition: 'width transform 0.2s ease-in-out',
    whiteSpace: 'nowrap',
    boxShadow: isLastLeftPinnedColumn ? '-4px 0 4px -4px gray inset' : isFirstRightPinnedColumn ? '4px 0 4px -4px gray inset' : undefined,
    left: isPinned === 'left' ? `${header.column.getStart('left')}px` : undefined,
    right: isPinned === 'right' ? `${header.column.getAfter('right')}px` : undefined,
    opacity: (isDragging || isPinned) ? 0.90 : 1,
    width: header.column.getSize(),
    zIndex: (isDragging || isPinned) ? 1 : 0,
  }

  return (
      <th
        key={header.id}
        ref={setNodeRef}
        colSpan={header.colSpan}
        //IMPORTANT: This is where the magic happens!
        style={style}
      >
        <div className="whitespace-nowrap">
          {header.isPlaceholder ? null : (
            <div
              className={header.column.getCanSort() ? 'cursor-pointer select-none' : ''}
              onClick={header.column.getToggleSortingHandler()}
              title={header.column.getCanSort() ? header.column.getNextSortingOrder() === 'asc' ? 'Sort ascending' : header.column.getNextSortingOrder() === 'desc' ? 'Sort descending' : 'Clear sort' : undefined}
            >
              {flexRender(header.column.columnDef.header, header.getContext())}
              {header.column.getCanPin() ? (
                <>{header.column.getIndex(header.column.getIsPinned() || 'center')}</>
              ) : null}
              {{
                asc: ' 🔼',
                desc: ' 🔽',
              }[header.column.getIsSorted() as string] ?? null}
            </div>
          )}
        </div>
        {!header.isPlaceholder && header.column.getCanPin() && (
          <div className="flex gap-1 justify-center">
            {header.column.getIsPinned() !== 'left' ? (
              <button
                className="border rounded px-2"
                onClick={() => {
                  header.column.pin('left')
                }}
              >
                {'<='}
              </button>
            ) : null}
            {header.column.getIsPinned() ? (
              <button
                className="border rounded px-2"
                onClick={() => {
                  header.column.pin(false)
                }}
              >
                X
              </button>
            ) : null}
            {header.column.getIsPinned() !== 'right' ? (
              <button
                className="border rounded px-2"
                onClick={() => {
                  header.column.pin('right')
                }}
              >
                {'=>'}
              </button>
            ) : null}
          </div>
        )}
        <div
          {...{
            onDoubleClick: () => header.column.resetSize(),
            onMouseDown: header.getResizeHandler(),
            onTouchStart: header.getResizeHandler(),
            className: `resizer ${
              header.column.getIsResizing() ? 'isResizing' : ''
            }`,
          }}
        />
        {!header.isPlaceholder && header.column.getCanFilter() ? (
          <input
            value={(header.column.getFilterValue() ?? '') as string}
            onChange={e => header.column.setFilterValue(e.target.value)}
            placeholder={`Search...`}
          />
        ) : null}
        {!header.column.getIsPinned() && (
          <button {...attributes} {...listeners}>
            🟰
          </button>
        )}
      </th>
    )
}

const DragAlongCell = ({ cell }: { cell: Cell<Person, unknown> }) => {
  const { isDragging, setNodeRef, transform } = useSortable({id: cell.column.id})

  const isPinned = cell.column.getIsPinned()
  const isLastLeftPinnedColumn = isPinned === 'left' && cell.column.getIsLastColumn('left')
  const isFirstRightPinnedColumn = isPinned === 'right' && cell.column.getIsFirstColumn('right')

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
    transition: 'width transform 0.2s ease-in-out',
    boxShadow: isLastLeftPinnedColumn ? '-4px 0 4px -4px gray inset' : isFirstRightPinnedColumn ? '4px 0 4px -4px gray inset' : undefined,
    left: isPinned === 'left' ? `${cell.column.getStart('left')}px` : undefined,
    right: isPinned === 'right' ? `${cell.column.getAfter('right')}px` : undefined,
    opacity: (isDragging || isPinned) ? 0.90 : 1,
    position: isPinned ? 'sticky' : 'relative',
    width: cell.column.getSize(),
    zIndex: (isDragging || isPinned) ? 1 : 0,
  }

  return (
    <td style={style} ref={setNodeRef}>
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </td>
  )
}


//These are the important styles to make sticky column pinning work!
//Apply styles like this using your CSS strategy of choice with this kind of logic to head cells, data cells, footer cells, etc.
//View the index.css file for more needed styles such as border-collapse: separate
const getCommonPinningStyles = (column: Column<Person>): CSSProperties => {
  const isPinned = column.getIsPinned()
  const isLastLeftPinnedColumn = isPinned === 'left' && column.getIsLastColumn('left')
  const isFirstRightPinnedColumn = isPinned === 'right' && column.getIsFirstColumn('right')
  return {
    boxShadow: isLastLeftPinnedColumn ? '-4px 0 4px -4px gray inset' : isFirstRightPinnedColumn ? '4px 0 4px -4px gray inset' : undefined,
    left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
    right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
    opacity: isPinned ? 0.95 : 1,
    position: isPinned ? 'sticky' : 'relative',
    width: column.getSize(),
    zIndex: isPinned ? 1 : 0,
  }
}


function TableMainUI() {
  const columns = React.useMemo<ColumnDef<Person>[]>(
    () => [
      {
        id: 'pin',
        header: () => 'Pin',
        cell: ({row}) =>
          row.getIsPinned() ? (
            <button
              onClick={() => row.pin(false)}
            >
              ❌
            </button>
          ) : (
            <div style={{display: 'flex', gap: '4px'}}
                 onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => row.pin('top')}
              >
                ⬆️
              </button>
              <button
                onClick={() => row.pin('bottom')}
              >
                ⬇️
              </button>
            </div>
          ),
        enableHiding: false,
        enablePinning: false,
        enableColumnFilter: false,
        enableResizing: true,
        enableSorting: false,
        size: 160,
      },
      {
        id: 'select-col',
        header: ({table}) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          />
        ),
        cell: ({row}) => (
          <Checkbox
            onClick={(e) => e.stopPropagation()}
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onCheckedChange={row.getToggleSelectedHandler()}
          />
        ),
        enableHiding: false,
        enablePinning: false,
        enableColumnFilter: false,
        enableResizing: true,
        enableSorting: false,
        size: 160,
      },
      {
        accessorKey: 'firstName',
        id: 'firstName',
        cell: info => info.getValue(),
        header: 'First N',
        footer: props => props.column.id,
        enableHiding: false,
        enableSorting: false,
        enableColumnFilter: false,
        size: 160,
      },
      {
        accessorFn: row => row.lastName,
        id: 'lastName',
        cell: info => info.getValue(),
        header: () => <span>Last N</span>,
        footer: props => props.column.id,
        size: 160,
      },
      {
        accessorKey: 'age',
        id: 'age',
        header: () => 'Age',
        footer: props => props.column.id,
        size: 160,
      },
      {
        accessorKey: 'visits',
        id: 'visits',
        header: () => <span>Visits</span>,
        footer: props => props.column.id,
        size: 160,
      },
      {
        accessorKey: 'status',
        id: 'status',
        header: 'Status',
        footer: props => props.column.id,
        size: 160,
      },
      {
        accessorKey: 'progress',
        id: 'progress',
        header: 'Profile Progress',
        footer: props => props.column.id,
        size: 160,
      },
    ], []
  )
  // Store full row data for pinned rows, not just IDs
  const [pinnedRowsData, setPinnedRowsData] = useState<{
    top: Person[];
    bottom: Person[];
  }>({
    top: [],
    bottom: [],
  });

  const [rowPinning, setRowPinning] = useState<RowPinningState>({
    top: [],
    bottom: [],
  })
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    left: [],
    right: [],
  })
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({}) //manage your own row selection state
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([])
  const [canExpandGlobally, setCanExpandGlobally] = useState(true);
  // const [expanded, setExpanded] = useState<ExpandedState>({})
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(() => columns.map(c => c.id!))
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  // Reset to first page when filters change
  useEffect(() => {
    setPagination(prev => ({...prev, pageIndex: 0}))
  }, [columnFilters])

  const dataQuery = useQuery({
    queryKey: ['data', pagination, sorting, columnFilters],
    queryFn: async () => {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageIndex: pagination.pageIndex,
          pageSize: pagination.pageSize,
          sorting: sorting || [],
          columnFilters: columnFilters || [],
        }),
      })
      if (!response.ok) {
        throw new Error('Failed to fetch data')
      }
      return response.json()
    },
    placeholderData: keepPreviousData, // don't have 0 rows flash while changing pages/loading next page
  })

  // Sync pinned rows data when rowPinning state changes or data loads
  useEffect(() => {
    const getRowId = (row: Person) => String(row.firstName + row.lastName);
    const currentPageData = dataQuery.data?.rows ?? [];

    // Create a map of all available rows for lookup
    const allAvailableRows = new Map<string, Person>();
    [...currentPageData, ...pinnedRowsData.top, ...pinnedRowsData.bottom].forEach(row => {
      allAvailableRows.set(getRowId(row), row);
    });

    // Find missing pinned rows
    const missingTopRows: Person[] = [];
    const missingBottomRows: Person[] = [];

    (rowPinning.top ?? []).forEach((id: string) => {
      const existsInStored = pinnedRowsData.top.some(row => getRowId(row) === id);
      if (!existsInStored) {
        const found = allAvailableRows.get(id);
        if (found) {
          missingTopRows.push(found);
        }
      }
    });

    (rowPinning.bottom ?? []).forEach((id: string) => {
      const existsInStored = pinnedRowsData.bottom.some(row => getRowId(row) === id);
      if (!existsInStored) {
        const found = allAvailableRows.get(id);
        if (found) {
          missingBottomRows.push(found);
        }
      }
    });

    // Update pinned rows data if we found missing rows
    if (missingTopRows.length > 0 || missingBottomRows.length > 0) {
      setPinnedRowsData(prev => ({
        top: [...prev.top.filter(row => (rowPinning.top ?? []).includes(getRowId(row))), ...missingTopRows],
        bottom: [...prev.bottom.filter(row => (rowPinning.bottom ?? []).includes(getRowId(row))), ...missingBottomRows],
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataQuery.data?.rows, rowPinning]);

  // Compute valid pinned row IDs (only those that have data)
  const validPinnedRowIds = React.useMemo(() => {
    const getRowId = (row: Person) => String(row.firstName + row.lastName);
    
    const validTopIds = (rowPinning.top ?? []).filter(id => 
      pinnedRowsData.top.some(row => getRowId(row) === id)
    );
    
    const validBottomIds = (rowPinning.bottom ?? []).filter(id => 
      pinnedRowsData.bottom.some(row => getRowId(row) === id)
    );
    
    return {
      top: validTopIds,
      bottom: validBottomIds,
    };
  }, [pinnedRowsData, rowPinning]);

  // Clean up invalid pinned row IDs in state
  useEffect(() => {
    if (validPinnedRowIds.top.length !== (rowPinning.top ?? []).length || 
        validPinnedRowIds.bottom.length !== (rowPinning.bottom ?? []).length) {
      setRowPinning({
        top: validPinnedRowIds.top,
        bottom: validPinnedRowIds.bottom,
      });
    }
  }, [validPinnedRowIds, rowPinning]);

  // Merge pinned rows with current page data
  const mergedData = React.useMemo(() => {
    const currentPageData = dataQuery.data?.rows ?? [];
    const getRowId = (row: Person) => String(row.firstName + row.lastName);

    // Get pinned rows from stored data, matching the order in validPinnedRowIds
    // Only include rows that we actually have data for
    const finalPinnedTop = validPinnedRowIds.top.map((id: string) => {
      return pinnedRowsData.top.find(row => getRowId(row) === id);
    }).filter((row): row is Person => row !== undefined);

    const finalPinnedBottom = validPinnedRowIds.bottom.map((id: string) => {
      return pinnedRowsData.bottom.find(row => getRowId(row) === id);
    }).filter((row): row is Person => row !== undefined);

    // Get IDs of valid pinned rows
    const pinnedTopIds = new Set(validPinnedRowIds.top);
    const pinnedBottomIds = new Set(validPinnedRowIds.bottom);

    // Filter out pinned rows from current page data to avoid duplicates
    const filteredPageData = currentPageData.filter(row => {
      const rowId = getRowId(row);
      return !pinnedTopIds.has(rowId) && !pinnedBottomIds.has(rowId);
    });

    // Combine: pinned top rows + filtered page data + pinned bottom rows
    return [
      ...finalPinnedTop,
      ...filteredPageData,
      ...finalPinnedBottom,
    ];
  }, [dataQuery.data?.rows, validPinnedRowIds, pinnedRowsData]);

  // Handle row pinning changes
  const handleRowPinningChange = (updater: any) => {
    setRowPinning((old) => {
      const newState = typeof updater === 'function' ? updater(old) : updater;

      // Update pinned rows data when pinning state changes
      const currentPageData = dataQuery.data?.rows ?? [];
      const getRowId = (row: Person) => String(row.firstName + row.lastName);

      // Create a map of all available rows (current page + already pinned rows) for lookup
      const allAvailableRows = new Map<string, Person>();
      [...currentPageData, ...pinnedRowsData.top, ...pinnedRowsData.bottom].forEach(row => {
        allAvailableRows.set(getRowId(row), row);
      });

      // Find rows that are newly pinned
      const newTopIds = new Set(newState.top);
      const newBottomIds = new Set(newState.bottom);
      const oldTopIds = new Set(old.top);
      const oldBottomIds = new Set(old.bottom);

      // Get newly pinned rows - check both current page and already stored pinned rows
      const newlyPinnedTop: Person[] = [];
      const newlyPinnedBottom: Person[] = [];

      (newState.top ?? []).forEach((id: string) => {
        if (!oldTopIds.has(id)) {
          const row = allAvailableRows.get(id);
          if (row) {
            newlyPinnedTop.push(row);
          }
        }
      });

      (newState.bottom ?? []).forEach((id: string) => {
        if (!oldBottomIds.has(id)) {
          const row = allAvailableRows.get(id);
          if (row) {
            newlyPinnedBottom.push(row);
          }
        }
      });

      // Update pinned rows data
      setPinnedRowsData((prev) => {
        // Remove unpinned rows
        const topRows = prev.top.filter(row => newTopIds.has(getRowId(row)));
        const bottomRows = prev.bottom.filter(row => newBottomIds.has(getRowId(row)));

        // Add newly pinned rows (avoid duplicates)
        const existingTopIds = new Set(topRows.map(getRowId));
        const existingBottomIds = new Set(bottomRows.map(getRowId));

        return {
          top: [...topRows, ...newlyPinnedTop.filter(row => !existingTopIds.has(getRowId(row)))],
          bottom: [...bottomRows, ...newlyPinnedBottom.filter(row => !existingBottomIds.has(getRowId(row)))],
        };
      });

      return newState;
    });
  };

  const table = useReactTable({
    data: mergedData,
    columns,
    getRowId: (row) => String(row.firstName + row.lastName),
    // pageCount: dataQuery.data?.pageCount ?? -1, //you can now pass in `rowCount` instead of pageCount and `pageCount` will be calculated internally (new in v8.13.0)
    rowCount: dataQuery.data?.rowCount, // new in v8.13.0 - alternatively, just pass in `pageCount` directly
    state: {
      pagination,
      sorting,
      columnFilters,
      rowSelection,
      rowPinning: validPinnedRowIds, // Use cleaned state to ensure all IDs have corresponding data
      columnVisibility,
      columnOrder,
      columnPinning,
      // expanded: expanded,
    },
    enableRowPinning: true,
    enableRowSelection: true,
    enableExpanding: true,
    enableColumnFilters: true,
    enableColumnPinning: true,
    onColumnOrderChange: setColumnOrder,
    onColumnPinningChange: setColumnPinning,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onRowPinningChange: handleRowPinningChange,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getRowCanExpand: () => canExpandGlobally,
    // onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true, //we're doing manual "server-side" pagination
    // getPaginationRowModel: getPaginationRowModel(), // If only doing manual pagination, you don't need this
    //getSortedRowModel: getSortedRowModel(), //not needed for manual sorting
    manualSorting: true, //use pre-sorted row model instead of sorted row model
    manualFiltering: true,
    columnResizeMode: 'onChange',
    keepPinnedRows: true,
    debugAll: true,
  })

  // reorder columns after drag & drop
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setColumnOrder(columnOrder => {
        const oldIndex = columnOrder.indexOf(active.id as string)
        const newIndex = columnOrder.indexOf(over.id as string)
        return arrayMove(columnOrder, oldIndex, newIndex) //this is just a splice util
      })
    }
  }

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  return (
    <div className="p-2">

      <div className="inline-block border border-black shadow rounded">
        <div className="px-1 border-b border-black">
          <label>
            <input
              {...{
                type: 'checkbox',
                checked: table.getIsAllColumnsVisible(),
                onChange: table.getToggleAllColumnsVisibilityHandler(),
              }}
            />{' '}
            Toggle All
          </label>
        </div>
        {/*{table.getAllLeafColumns().filter(column => column.getCanHide()).map(column => {*/}
        {table.getAllLeafColumns().map(column => {
          return (
            <div key={column.id} className="px-1">
              <label>
                <input
                  {...{
                    type: 'checkbox',
                    checked: column.getIsVisible(),
                    disabled: !column.getCanHide(),
                    onChange: column.getToggleVisibilityHandler(),
                  }}
                />{' '}
                {column.id}
              </label>
            </div>
          )
        })}
        <button onClick={() => table.toggleAllColumnsVisible(true)}>Reset</button>
      </div>
      <br/>

      <button onClick={() => setCanExpandGlobally(!canExpandGlobally)}>Toggle Row Expansion</button>
      <br/>
      <button onClick={() => table.resetRowSelection(true)}>Reset Selected</button>
      <br/>
      <button onClick={() => {
        table.resetRowPinning(true);
        setPinnedRowsData({top: [], bottom: []});
      }}>Reset Pinned Rows
      </button>



    {/*NOTE: This provider creates div elements, so don't nest inside of <table> elements*/}
    <DndContext
      collisionDetection={closestCenter}
      modifiers={[restrictToHorizontalAxis]}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >

      <div className="table-container">
        <table style={{width: table.getTotalSize(),}}>
          <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              <SortableContext
                items={columnOrder}
                strategy={horizontalListSortingStrategy}
              >
                {headerGroup.headers.map((header) => (
                  <DraggableTableHeader key={header.id} header={header} />
                ))}
              </SortableContext>

              {/*{headerGroup.headers.map(header => {*/}
              {/*  const {column} = header*/}
              {/*  return (*/}
              {/*    <th*/}
              {/*      key={header.id}*/}
              {/*      colSpan={header.colSpan}*/}
              {/*      //IMPORTANT: This is where the magic happens!*/}
              {/*      style={{...getCommonPinningStyles(column)}}*/}
              {/*    >*/}
              {/*      <div className="whitespace-nowrap">*/}
              {/*        {header.isPlaceholder ? null : (*/}
              {/*          <div*/}
              {/*            className={header.column.getCanSort() ? 'cursor-pointer select-none' : ''}*/}
              {/*            onClick={header.column.getToggleSortingHandler()}*/}
              {/*            title={header.column.getCanSort() ? header.column.getNextSortingOrder() === 'asc' ? 'Sort ascending' : header.column.getNextSortingOrder() === 'desc' ? 'Sort descending' : 'Clear sort' : undefined}*/}
              {/*          >*/}
              {/*            {flexRender(header.column.columnDef.header, header.getContext())}*/}
              {/*            {header.column.getCanPin() ? (*/}
              {/*              <>{column.getIndex(column.getIsPinned() || 'center')}</>*/}
              {/*            ) : null}*/}
              {/*            {{*/}
              {/*              asc: ' 🔼',*/}
              {/*              desc: ' 🔽',*/}
              {/*            }[header.column.getIsSorted() as string] ?? null}*/}
              {/*          </div>*/}
              {/*        )}*/}
              {/*      </div>*/}
              {/*      {!header.isPlaceholder && header.column.getCanPin() && (*/}
              {/*        <div className="flex gap-1 justify-center">*/}
              {/*          {header.column.getIsPinned() !== 'left' ? (*/}
              {/*            <button*/}
              {/*              className="border rounded px-2"*/}
              {/*              onClick={() => {*/}
              {/*                header.column.pin('left')*/}
              {/*              }}*/}
              {/*            >*/}
              {/*              {'<='}*/}
              {/*            </button>*/}
              {/*          ) : null}*/}
              {/*          {header.column.getIsPinned() ? (*/}
              {/*            <button*/}
              {/*              className="border rounded px-2"*/}
              {/*              onClick={() => {*/}
              {/*                header.column.pin(false)*/}
              {/*              }}*/}
              {/*            >*/}
              {/*              X*/}
              {/*            </button>*/}
              {/*          ) : null}*/}
              {/*          {header.column.getIsPinned() !== 'right' ? (*/}
              {/*            <button*/}
              {/*              className="border rounded px-2"*/}
              {/*              onClick={() => {*/}
              {/*                header.column.pin('right')*/}
              {/*              }}*/}
              {/*            >*/}
              {/*              {'=>'}*/}
              {/*            </button>*/}
              {/*          ) : null}*/}
              {/*        </div>*/}
              {/*      )}*/}
              {/*      <div*/}
              {/*        {...{*/}
              {/*          onDoubleClick: () => header.column.resetSize(),*/}
              {/*          onMouseDown: header.getResizeHandler(),*/}
              {/*          onTouchStart: header.getResizeHandler(),*/}
              {/*          className: `resizer ${*/}
              {/*            header.column.getIsResizing() ? 'isResizing' : ''*/}
              {/*          }`,*/}
              {/*        }}*/}
              {/*      />*/}
              {/*      {!header.isPlaceholder && header.column.getCanFilter() ? (*/}
              {/*        <input*/}
              {/*          value={(header.column.getFilterValue() ?? '') as string}*/}
              {/*          onChange={e => header.column.setFilterValue(e.target.value)}*/}
              {/*          placeholder={`Search...`}*/}
              {/*        />*/}
              {/*      ) : null}*/}
              {/*    </th>*/}
              {/*  )*/}
              {/*})}*/}
            </tr>
          ))}
          </thead>
          <tbody>

          {/*{table.getRowModel().rows.map((row) => (*/}
          {/*  <tr key={row.id}>*/}
          {/*    {row.getVisibleCells().map((cell) => (*/}
          {/*      <SortableContext*/}
          {/*        key={cell.id}*/}
          {/*        items={columnOrder}*/}
          {/*        strategy={horizontalListSortingStrategy}*/}
          {/*      >*/}
          {/*        <DragAlongCell key={cell.id} cell={cell} />*/}
          {/*      </SortableContext>*/}
          {/*    ))}*/}
          {/*  </tr>*/}
          {/*))}*/}

          {table.getTopRows().map(row => (
            <tr key={row.id}
                style={{
                  backgroundColor: 'lightblue', position: 'sticky',
                  top: row.getIsPinned() === 'top' ? `${row.getPinnedIndex() * 28 + 78}px` : undefined,
                  zIndex: 5,
                }}
            >
              {row.getVisibleCells().map((cell) => (
                <SortableContext
                  key={cell.id}
                  items={columnOrder}
                  strategy={horizontalListSortingStrategy}
                >
                  <DragAlongCell key={cell.id} cell={cell} />
                </SortableContext>
                // <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
              ))}
            </tr>
          ))}

          {table.getCenterRows().map(row => {
            return (
              <Fragment key={row.id}>
                <tr onClick={row.getToggleExpandedHandler()} style={{cursor: 'pointer'}}>
                  {row.getVisibleCells().map((cell) => {
                    const {column} = cell
                    return (
                      <SortableContext
                        key={cell.id}
                        items={columnOrder}
                        strategy={horizontalListSortingStrategy}
                      >
                        <DragAlongCell key={cell.id} cell={cell} />
                      </SortableContext>
                      // <td
                      //   key={cell.id}
                      //   //IMPORTANT: This is where the magic happens!
                      //   style={{...getCommonPinningStyles(column)}}
                      // >
                      //   {flexRender(
                      //     cell.column.columnDef.cell,
                      //     cell.getContext()
                      //   )}
                      // </td>
                    )
                  })}
                </tr>
                {row.getIsExpanded() && (
                  <tr>
                    <td colSpan={row.getVisibleCells().length}>
                    <pre style={{fontSize: '10px'}}>
                      <code>{JSON.stringify(row.original, null, 2)}</code>
                    </pre>
                      <div>{row.id}</div>
                      <div>{row.getVisibleCells().length}</div>
                      <div>{row.getAllCells().length}</div>
                      <div>{row.getCanSelect() ? 'yes' : 'no'}</div>
                      <div>{row.getCanExpand() ? 'yes' : 'no'}</div>
                      <div>{row.getIsExpanded() ? 'yes' : 'no'}</div>
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}

          {table.getBottomRows().map(row => (
            <tr key={row.id}
                style={{
                  backgroundColor: 'lightblue', position: 'sticky',
                  bottom: row.getIsPinned() === 'bottom' ? `${(table.getBottomRows().length - 1 - row.getPinnedIndex()) * 28}px` : undefined,
                  zIndex: 5,
                }}
            >
              {row.getVisibleCells().map((cell) =>(
                <SortableContext
                  key={cell.id}
                  items={columnOrder}
                  strategy={horizontalListSortingStrategy}
                >
                  <DragAlongCell key={cell.id} cell={cell} />
                </SortableContext>
                // <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
              ))}
            </tr>
          ))}
          </tbody>
        </table>
      </div>

    </DndContext>


      <div className="h-2"/>
      <div className="flex items-center gap-2">
        <button
          className="border rounded p-1"
          onClick={() => table.firstPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {'<<'}
        </button>
        <button
          className="border rounded p-1"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {'<'}
        </button>
        <button
          className="border rounded p-1"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {'>'}
        </button>
        <button
          className="border rounded p-1"
          onClick={() => table.lastPage()}
          disabled={!table.getCanNextPage()}
        >
          {'>>'}
        </button>
        <span className="flex items-center gap-1">
          <div>Page</div>
          <strong>
            {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount().toLocaleString()}
          </strong>
        </span>
        <span className="flex items-center gap-1">
          | Go to page:
          <input
            type="number"
            min="1"
            max={table.getPageCount()}
            defaultValue={table.getState().pagination.pageIndex + 1}
            onChange={e => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0
              table.setPageIndex(page)
            }}
            className="border p-1 rounded w-16"
          />
        </span>
        <select
          value={table.getState().pagination.pageSize}
          onChange={e => {
            table.setPageSize(Number(e.target.value))
          }}
        >
          {[10, 20, 30, 40, 50].map(pageSize => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
        {dataQuery.isFetching ? 'Loading...' : null}
      </div>
      <div>
        Showing {table.getRowModel().rows.length.toLocaleString()} of{' '}
        {dataQuery.data?.rowCount.toLocaleString()} Rows
      </div>
      <pre>{JSON.stringify(pagination, null, 2)}</pre>
      <pre>{JSON.stringify(columnPinning, null, 2)}</pre>
      <pre>{JSON.stringify(sorting, null, 2)}</pre>
      <pre>{JSON.stringify(columnFilters, null, 2)}</pre>
      <pre>{JSON.stringify(rowSelection, null, 2)}</pre>
      <pre>{JSON.stringify(rowPinning, null, 2)}</pre>
      <pre>{JSON.stringify(columnVisibility, null, 2)}</pre>
      <pre>{JSON.stringify(table.getState().columnOrder, null, 2)}</pre>
    </div>
  )
}

export default function DemoTable() {
  return (
    <QueryClientProvider client={queryClient}>
      <TableMainUI/>
    </QueryClientProvider>
  )
}