import type { FinalTableType } from '../main'

type FinalTableProps = {
  data: FinalTableType
}

export function FinalTable({ data }: FinalTableProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 overflow-x-auto">
        <table className="min-w-full border-zinc-400 rounded-lg">
          <thead>
            <tr>
              {data.headers.map(h => (
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
            {data.table.map((r, i) => (
              <tr key={i.toString()}>
                {r.map((c, j) => (
                  <td
                    key={`${i}-${j + 0}`}
                    className="px-3 py-2 border border-zinc-300 text-center"
                  >
                    {c}
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
