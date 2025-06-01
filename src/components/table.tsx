import type { Table as TableType } from '../main'

type TableProps = {
  data: TableType | undefined
}

export function Table({ data }: TableProps) {
  if (!data || data.tableRows.length === 0) {
    return null
  }

  const { pivotColNumber, pivotRowNumber } = data

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-zinc-400 rounded-lg">
        <thead>
          <tr>
            <th className="px-3 py-2 border border-zinc-300 text-center bg-zinc-100">
              Z
            </th>
            {data?.tableRows?.[0].Xs.map((_, i) => (
              <th
                key={i.toString()}
                aria-selected={pivotColNumber === i + 1}
                className={`px-3 py-2  text-center bg-zinc-100 ${
                  pivotColNumber === i + 1
                    ? 'border-b-1 border-b-zinc-300 border-4 border-blue-500'
                    : 'border border-zinc-300'
                }`}
              >
                X{i + 1}
              </th>
            ))}
            {data?.tableRows?.[0].XFs.map((_, i) => (
              <th
                key={i.toString()}
                className="px-3 py-2 border border-zinc-300 text-center bg-zinc-100"
              >
                XF{i + 1}
              </th>
            ))}
            <th className="px-3 py-2 border border-zinc-300 text-center bg-zinc-100">
              B
            </th>
          </tr>
        </thead>

        <tbody>
          {data?.tableRows.map((line, lineIndex) => (
            <tr
              key={lineIndex.toString()}
              className={
                pivotRowNumber === lineIndex + 1
                  ? 'border-4 border-blue-500'
                  : ''
              }
            >
              <td className="px-3 py-2 border border-zinc-300 text-center">
                {line.Z}
              </td>
              {line.Xs.map((x, i) => {
                const isPivot =
                  pivotRowNumber === lineIndex + 1 && pivotColNumber === i + 1
                return (
                  <td
                    key={i.toString()}
                    className={`px-3 py-2   text-center ${
                      pivotColNumber === i + 1
                        ? 'border-x-4 border-blue-500'
                        : 'border border-zinc-300'
                    }
                    ${lineIndex === data.tableRows.length - 1 && pivotColNumber === i + 1 ? 'border-b-4' : ''}
                    ${isPivot && 'bg-blue-100'}
                    `}
                  >
                    <span className={isPivot ? 'font-bold' : ''}>{x}</span>
                  </td>
                )
              })}
              {line.XFs.map((xf, i) => (
                <td
                  key={i.toString()}
                  className="px-3 py-2 border border-zinc-300 text-center"
                >
                  {xf}
                </td>
              ))}
              <td className="px-3 py-2 border border-zinc-300 text-center">
                {line.B}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
