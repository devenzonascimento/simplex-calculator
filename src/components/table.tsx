import { fmt, generateTableHeaders, type TableType } from '../main'
import {
  Table as StrippedTable,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from './stripped-table.tsx'

type TableProps = {
  data: TableType | undefined
}

export function Table({ data }: TableProps) {
  if (!data || data.tableRows.length === 0) {
    return null
  }

  const { tableRows, pivotColNumber, pivotRowNumber } = data

  const headers = generateTableHeaders(tableRows)
  const body = tableRows.map(r => r.cells)

  return (
    <div className="overflow-x-auto">
      <StrippedTable>
        <TableHeader>
          <TableRow>
            {headers.map(h => (
              <TableHead key={h}>{h}</TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {body.map((r, i) => (
            <TableRow key={i.toString()}>
              {r.map((c, j) => (
                <TableCell
                  key={`${i}-${j + 0}`}
                  className={`${pivotRowNumber === i && pivotColNumber === j && 'bg-green-500'}`}
                >
                  {fmt(c)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </StrippedTable>
    </div>
  )
}
