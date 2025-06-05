import { fmt, type FinalTableType } from '../main'
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from './stripped-table.tsx'

type FinalTableProps = {
  data: FinalTableType
}

const COLORS = [
  'bg-red-400',
  'bg-green-400',
  'bg-blue-400',
  'bg-yellow-400',
  'bg-purple-400',
  'bg-orange-400',
  'bg-pink-400',
  'bg-cyan-400',
]

export function FinalTable({ data }: FinalTableProps) {
  const tableWithoutHeader = data.table
  const numRows = tableWithoutHeader.length
  const numCols = tableWithoutHeader[0].length

  const colorMap: Record<string, string> = {}
  let colorIndex = 0

  for (let col = 0; col < numCols - 1; col++) {
    let oneIndex = -1
    let isBase = true

    for (let row = 0; row < numRows; row++) {
      const value = tableWithoutHeader[row][col]
      if (value.equals(1)) {
        if (oneIndex === -1) {
          oneIndex = row
        } else {
          isBase = false
          break
        }
      } else if (!value.equals(0)) {
        isBase = false
        break
      }
    }

    if (isBase && oneIndex !== -1) {
      const key1 = `${oneIndex}-${col}`
      const key2 = `${oneIndex}-${numCols - 1}`
      const color = COLORS[colorIndex % COLORS.length]
      colorMap[key1] = color
      colorMap[key2] = color
      colorIndex++
    }
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {data.headers.map(h => (
              <TableHead key={h}>{h}</TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {tableWithoutHeader.map((row, i) => (
            <TableRow key={i.toString()}>
              {row.map((cell, j) => {
                const key = `${i}-${j}`
                const color = colorMap[key]
                return (
                  <TableCell key={key} className={color}>
                    {typeof cell === 'string' ? cell : fmt(cell)}
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
