import { watchEffect, unref } from "vue"

import { useAuth0, auth0 } from "@/plugins/auth0-plugin"

export async function authGuard(to) {
  const { isAuthenticated, isLoading } = useAuth0()

  const fn = async () => {
    if (unref(isAuthenticated)) {
      return true
    }

    await auth0.loginWithRedirect({
      appState: { target: to.fullPath },
    })

    return false
  }

  if (!unref(isLoading)) {
    return fn()
  }

  await watchEffectOnceAsync(() => !unref(isLoading))

  return fn()
}

function watchEffectOnceAsync(watcher) {
  return new Promise((resolve) => {
    watchEffectOnce(watcher, resolve)
  })
}

/**
 * @ignore
 * Run watchEffect untill the watcher returns true, then stop the watch.
 * Once it returns true, it will call the provided function.
 */
function watchEffectOnce(watcher, fn) {
  const stopWatch = watchEffect(() => {
    if (watcher()) {
      fn()
      stopWatch()
    }
  })
}
