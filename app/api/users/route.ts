import { NextRequest, NextResponse } from 'next/server'
import { makeData, Person } from '@/makeData'

// Generate data once and reuse it (similar to makeData.ts)
const data = makeData(10000)

export async function POST(request: NextRequest) {
  // Simulate some network latency
  await new Promise(r => setTimeout(r, 1500))

  // Parse request body
  const body = await request.json()
  const {
    pageIndex = 0,
    pageSize = 10,
    sorting,
    columnFilters,
  } = body

  // Create a copy of the data to avoid mutating the original
  let filteredData = [...data]

  // Apply filtering if provided
  if (columnFilters && columnFilters.length > 0) {
    filteredData = filteredData.filter(row => {
      return columnFilters.every((filter: {id: string, value: any}) => {
        const { id, value } = filter
        
        // Skip empty filters
        if (value === undefined || value === null || value === '') {
          return true
        }

        const rowValue = row[id as keyof Person]
        
        // Handle undefined/null row values
        if (rowValue === undefined || rowValue === null) {
          return false
        }

        // Convert filter value to string for comparison
        const filterValue = String(value).toLowerCase().trim()
        
        // Handle different field types
        if (typeof rowValue === 'string') {
          // Case-insensitive contains matching for strings
          return rowValue.toLowerCase().includes(filterValue)
        } else if (typeof rowValue === 'number') {
          // For numbers, try exact match first, then string contains
          const numFilter = Number(filterValue)
          if (!isNaN(numFilter)) {
            return rowValue === numFilter || String(rowValue).includes(filterValue)
          }
          return String(rowValue).includes(filterValue)
        } else {
          // Fallback: convert to string and do contains match
          return String(rowValue).toLowerCase().includes(filterValue)
        }
      })
    })
  }

  // Apply sorting if provided
  if (sorting && sorting.length > 0) {
    filteredData.sort((a, b) => {
      for (const sort of sorting) {
        const { id, desc } = sort
        const aValue = a[id as keyof Person]
        const bValue = b[id as keyof Person]

        // Handle null/undefined values
        if (aValue === undefined || aValue === null) {
          if (bValue === undefined || bValue === null) continue
          return desc ? -1 : 1
        }
        if (bValue === undefined || bValue === null) {
          return desc ? 1 : -1
        }

        // Compare values based on type
        let comparison = 0
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          comparison = aValue.localeCompare(bValue)
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue - bValue
        } else {
          // Fallback for mixed types
          comparison = String(aValue).localeCompare(String(bValue))
        }

        // Apply descending order if needed
        if (comparison !== 0) {
          return desc ? -comparison : comparison
        }
      }
      return 0
    })
  }

  // Apply pagination after filtering and sorting
  const start = pageIndex * pageSize
  const end = start + pageSize

  return NextResponse.json({
    rows: filteredData.slice(start, end),
    pageCount: Math.ceil(filteredData.length / pageSize),
    rowCount: filteredData.length,
  })
}
