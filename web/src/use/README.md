# web/src/use/README.md

This is a very light store pattern known as the "use" pattern. Each instance of the store has its own state; however, state is keyed by query/id. The primary use for this is per-query state, that also tracks loading and error states. This is useful if you need to use the same store for multiple components on a page and don't want to share state between them.

Id/queries that are the same will return the state object.

The pattern is evolving, but so far it looks like:

Each use function gets a "reactive" state object.
That state object is returned from the function as a spread "toRefs"" object.
Functions and constants are returned directly.

Useage looks like

```js
import { useExpenses } from '@/use/use-expenses'

const expenseOptions = computed(() => ({
  where: {
    travelAuthorizationId: props.travelAuthorizationId,
    type: TYPES.EXPENSE,
  },
}))
const { expenses, isLoading, fetch } = useExpenses(expenseOptions)
```

Note that options passed to use files should be reactive.
i.e. either a computed, ref, or props attribute.
This enables the use function to reactively load content whenever the options change.

"expenses" and "isLoading" are refs and fetch is a function that mutates those refs.
