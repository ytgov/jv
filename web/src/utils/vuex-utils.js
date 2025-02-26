export function withGettersFromState(state, getters) {
  Object.keys(state).forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(getters, key)) {
      throw new Error(`Getter for key "${key}" already exists!`)
    }

    getters[key] = (state) => {
      return state[key]
    }
  })

  return getters
}
