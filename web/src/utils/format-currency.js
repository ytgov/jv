import { isNil } from "lodash"

function formatCurrency(amount, currency = "CAD") {
  if (isNil(amount)) {
    return ""
  }

  const minimumFractionDigits = 2
  const maximumFractionDigits = 2
  const formatter = new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  })
  return formatter.format(amount)
}

export default formatCurrency
