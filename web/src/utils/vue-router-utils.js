import { cloneDeep } from "lodash"

/*
CONSIDER: building chainable caster so you can do
cast("formId", parseInt).cast("foo", barFunction)

Currently you would have to do:
(route) => {
   const route2 = cast('formId', parseInt)(route)
   return cast('foo', barFunction)(route2)
}
*/

export function cast(param, converter) {
  return (route) => {
    const props = cloneDeep(route.params)

    if (props[param] !== undefined) {
      props[param] = converter(props[param])
    }

    return props
  }
}
