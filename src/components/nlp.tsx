import { fmt, generateTableHeaders, type NlpType } from '../main'
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from './stripped-table.tsx'

type NlpProps = {
  data: NlpType
}

export function Nlp({ data }: NlpProps) {
  const { pivotRow, newPivotRow } = data

  const headers = ['Origem', ...generateTableHeaders([pivotRow, newPivotRow])]
  const body = [
    ['Linha pivô', ...pivotRow.cells],
    ['Nova linha pivô', ...newPivotRow.cells],
  ]

  return (
    <div className="overflow-x-auto">
      <Table>
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
