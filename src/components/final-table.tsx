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

export function FinalTable({ data }: FinalTableProps) {
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
          {data.table.map((r, i) => (
            <TableRow key={i.toString()}>
              {r.map((c, j) => (
                <TableCell key={`${i}-${j + 0}`}>
                  {typeof c === 'string' ? c : fmt(c)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
