import { isNil } from "lodash"
import { DateTime } from "luxon"

function formatDate(input?: string | null) {
  if (isNil(input)) {
    return ""
  }

  return DateTime.fromISO(input).toUTC().toFormat("yyyy/MM/dd")
}

export function formatDateTime(input?: string | null) {
  if (isNil(input)) {
    return ""
  }

  return DateTime.fromISO(input).toFormat("yyyy/MM/dd h:mm a")
}

export function getCurrentFiscalYear() {
  const currentDate = DateTime.now()

  if (currentDate.month <= 3) {
    return `${currentDate.year - 1}/${currentDate.year.toString().slice(-2)}`
  } else {
    return `${currentDate.year}/${(currentDate.year + 1).toString().slice(-2)}`
  }
}

export default formatDate
