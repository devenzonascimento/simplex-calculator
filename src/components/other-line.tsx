import { fmt, generateTableHeaders, type OtherLineType } from '../main'

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
    <div className="flex items-center gap-3">
      <div className="flex-1 overflow-x-auto">
        <table className="min-w-full border-zinc-400 rounded-lg">
          <thead>
            <tr>
              {headers.map(h => (
                <th
                  key={h}
                  className="px-3 py-2 border border-zinc-300 text-center bg-zinc-100"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {body.map((r, i) => (
              <tr key={i.toString()}>
                {r.map((c, j) => (
                  <td
                    key={`${i}-${j + 0}`}
                    className="px-3 py-2 border border-zinc-300 text-center"
                  >
                    {typeof c === 'string' ? c : fmt(c)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
