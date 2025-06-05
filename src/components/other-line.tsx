import { fmt, generateTableHeaders, type OtherLineType } from '../main'
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from './stripped-table.tsx'

type OtherLineProps = {
  data: OtherLineType
}

export function OtherLine({ data }: OtherLineProps) {
  const {
    rowNumber,
    newPivotRow,
    multipliedNewPivotRow,
    originalRow,
    resultRow,
    coefficient,
  } = data

  const headers = [
    'Origem',
    ...generateTableHeaders([
      newPivotRow,
      multipliedNewPivotRow,
      originalRow,
      resultRow,
    ]),
  ]
  const body = [
    ['NLP', ...newPivotRow.cells],
    [`NLP x ${fmt(coefficient)}`, ...multipliedNewPivotRow.cells],
    [`${rowNumber + 1}ª L`, ...originalRow.cells],
    [`${rowNumber + 1}ª NL`, ...resultRow.cells],
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
