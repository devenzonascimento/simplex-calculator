import { fmt, generateTableHeaders, type TableType } from '../main'

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
                  className={`px-3 py-2 border border-zinc-300 text-center ${pivotRowNumber === i && pivotColNumber === j && 'bg-green-500'}`}
                >
                  {fmt(c)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
