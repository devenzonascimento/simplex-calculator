import { fmt, type SolutionType } from '../main'

type SolutionProps = {
  data: SolutionType
}

export function Solution({ data }: SolutionProps) {
  const { objectiveFunction, results } = data
  const getFirstStep = () => {
    return objectiveFunction.replace('z', fmt(results.z).toString())
  }

  const getSecondStep = () => {
    let result = getFirstStep()

    // biome-ignore lint/complexity/noForEach: <explanation>
    Object.entries(results).forEach(([key, value]) => {
      result = result.replace(key, `.(${fmt(value)})`)
    })

    return result
  }

  return (
    <div className="p-3 flex flex-col bg-zinc-800 rounded-xl">
      <span className="font-semibold">Solução</span>

      <div>
        <ul>
          {Object.entries(results).map(([key, value]) => (
            <li key={key} className="uppercase">
              {key}: {fmt(value)}
            </li>
          ))}
          <li>{getFirstStep()}</li>
          <li>{getSecondStep()}</li>
        </ul>
      </div>
    </div>
  )
}
