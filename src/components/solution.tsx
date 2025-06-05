import type { SolutionType } from "../main"

type SolutionProps = {
    data: SolutionType
}

export function Solution({ data }: SolutionProps) {
    return (
        <div>{JSON.stringify(data)}</div>
    )
}