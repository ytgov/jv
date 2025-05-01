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

export default formatDate
