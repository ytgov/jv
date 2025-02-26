# Pages

Any component that is directly routeable is considered a page.
Pages are to be placed in the `pages` directory with a patch matching their URL.
The name of the page component should end in `Page`.

The current naming conventions for pages is pretty random, but over time it will hopefully become more consistent and similar to this example.

## Constraints

1. It should take minimal effort to figure out where to add a new page component, and what to call for a given user centric URL.
3. It should be easy to add page variations. e.g. edit vs. non-edit
4. Route names must be unique.
5. It should be easy to find a component given the vue-router route name.
2. It should be easy to find the page component for a given URL.

## Directory Structure

For example

```bash
src/
├── pages/
│   ├── my-travel-requests/
│   │   ├── MyTravelRequestsPage.vue           # /my-travel-requests
│   │   ├── MyTravelRequestPage.vue            # /my-travel-requests/:id
│   │   ├── details/
│   │   │   ├── DetailsPage.vue                # /my-travel-requests/:id/details
│   │   │   ├── DetailsEditPage.vue            # /my-travel-requests/:id/details/edit
│   │   ├── estimate/
│   │   │   ├── EstimatePage.vue               # /my-travel-requests/:id/estimate
│   │   │   ├── EstimateEditPage.vue           # /my-travel-requests/:id/estimate/edit
│   │   ├── expense/
│   │   │   ├── ExpensePage.vue                # /my-travel-requests/:id/expense
│   │   │   ├── ExpenseEditPage.vue            # /my-travel-requests/:id/expense/edit
│   │   ├── request/
│   │   │   ├── RequestPage.vue                # /my-travel-requests/:id/request
│   │   │   ├── RequestEditPage.vue            # /my-travel-requests/:id/request/edit
```

## Routes

For example

```ts
const routes = [
  {
    path: "/my-travel-requests",
    component: () => import("@/pages/my-travel-requests/MyTravelRequestsPage.vue"),
    children: [
      {
        path: ":id",
        component: () => import("@/pages/my-travel-requests/MyTravelRequestPage.vue"),
        children: [
          {
            path: "details",
            component: () => import("@/pages/my-travel-requests/details/DetailsPage.vue"),
            name: "my-travel-requests/details/DetailsPage",
          },
          {
            path: "details/edit",
            component: () => import("@/pages/my-travel-requests/details/DetailsEditPage.vue"),
            name: "my-travel-requests/details/DetailsEditPage",
          },
          {
            path: "estimate",
            component: () => import("@/pages/my-travel-requests/estimate/EstimatePage.vue"),
            name: "my-travel-requests/estimate/EstimatePage",
          },
          {
            path: "estimate/edit",
            component: () => import("@/pages/my-travel-requests/estimate/EstimateEditPage.vue"),
            name: "my-travel-requests/estimate/EstimateEditPage",
          },
          {
            path: "expense",
            component: () => import("@/pages/my-travel-requests/expense/ExpensePage.vue"),
            name: "my-travel-requests/expense/ExpensePage",
          },
          {
            path: "expense/edit",
            component: () => import("@/pages/my-travel-requests/expense/ExpenseEditPage.vue"),
            name: "my-travel-requests/expense/ExpenseEditPage",
          },
          {
            path: "request",
            component: () => import("@/pages/my-travel-requests/request/RequestPage.vue"),
            name: "my-travel-requests/request/RequestPage",
          },
          {
            path: "request/edit",
            component: () => import("@/pages/my-travel-requests/request/RequestEditPage.vue"),
            name: "my-travel-requests/request/RequestEditPage",
          },
        ],
      },
    ],
  },
]
```
