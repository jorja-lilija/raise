import { ResponseValues } from "axios-hooks"
import classNames from "classnames"
import * as React from "react"
import Alert from "./Alert"

interface PropertyDefinition<I, V> {
  label?: string,
  formatter?: (v: V, i: I) => string,
  className?: string,
}

interface Props<I> {
  definition: Partial<{ [K in keyof I]: PropertyDefinition<I, I[K]> } & { [s: `_${string}`]: PropertyDefinition<I, unknown> }>,
  items?: I[] | ResponseValues<I[], unknown>,
  primaryKey?: keyof I,
  onClick?: (item: I, event: React.MouseEvent) => void,
  emptyMessage?: string,
}

const Table = <I,>({
  definition, items, primaryKey, onClick, emptyMessage = "There are no entries",
}: Props<I>) => {
  // Normalized properties
  const nItems = ((items === undefined || Array.isArray(items)) ? items : items.data) ?? []
  const nPrimaryKey = primaryKey ?? (nItems && nItems[0] && "id" in nItems[0] ? "id" as keyof I : undefined)

  // Loading and error states
  if (items && !Array.isArray(items)) {
    if (items.loading) return <div className="overflow-x-auto bg-black bg-opacity-20 rounded p-4"><span className="animate-pulse">Loading...</span></div>
    if (items.error) return <Alert variant="error">{items.error}</Alert>
  }

  return (
    <div className="overflow-x-auto bg-black bg-opacity-20 rounded py-2">
      <table className="w-full">
        <thead>
          <tr>
            {Object.entries(definition).map(([k, v], index, arr) => (
              <th key={k} className={classNames("p-2", { "pl-4": index === 0, "pr-4": index === arr.length - 1 }, v.className)}>{v.label ?? k}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {nItems.map((item, rowIndex) => (
            <tr key={nPrimaryKey ? String(item[nPrimaryKey]) : rowIndex} className={classNames("hover:bg-black hover:bg-opacity-20", { "cursor-pointer": onClick !== undefined })} onClick={onClick === undefined ? undefined : (e) => onClick(item, e)}>
              {Object.entries(definition).map(([k, v], cellIndex, arr) => (
                <td key={k} className={classNames("p-2", { "pl-4": cellIndex === 0, "pr-4": cellIndex === arr.length - 1 }, v.className)}>{v.formatter ? v.formatter(item[k as keyof I]) : (item[k as keyof I] ?? "—")}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {nItems.length === 0 && <p className="px-4 pt-2 pb-1 text-center">{emptyMessage}</p>}
    </div>
  )
}

export const amountFormatter = (amountInPence?: number | null) => (amountInPence === undefined || amountInPence === null ? "—" : `£${(amountInPence / 100).toFixed(2)}`)
export const amountDropPenceIfZeroFormatter = (amountInPence?: number | null) => (amountInPence === undefined || amountInPence === null ? "—" : `£${(amountInPence / 100).toFixed(amountInPence % 100 === 0 ? 0 : 2)}`)
export const booleanFormatter = (boolean?: boolean | null) => (boolean === undefined || boolean === null ? "—" : (boolean && "Yes") || "No")
export const dateFormatter = (unixTimestamp?: number | null) => (unixTimestamp === undefined || unixTimestamp === null ? "—" : new Date(unixTimestamp * 1000).toLocaleDateString())
export const matchFundingRateFormatter = (percentageInPoints?: number | null) => (percentageInPoints === undefined || percentageInPoints === null ? "—" : `${percentageInPoints}% (i.e. £1 donated, £${percentageInPoints % 100 === 0 ? (percentageInPoints / 100) : (percentageInPoints / 100).toFixed(2)} matched, £${percentageInPoints % 100 === 0 ? (1 + percentageInPoints / 100) : (1 + percentageInPoints / 100).toFixed(2)} total)`)
export const percentFormatter = (percentageInPoints?: number | null) => (percentageInPoints === undefined || percentageInPoints === null ? "—" : `${percentageInPoints}%`)
export const timestampFormatter = (unixTimestamp?: number | null) => (unixTimestamp === undefined || unixTimestamp === null ? "—" : new Date(unixTimestamp * 1000).toLocaleString())
export const jsonFormatter = (any: unknown) => JSON.stringify(any)

export default Table
