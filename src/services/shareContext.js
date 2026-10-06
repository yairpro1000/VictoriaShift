export function shareRoute(pathname = '') {
  if (!pathname.startsWith('/share/')) return null
  const match = pathname.match(/^\/share\/([0-9a-f]{64})(?:\/manager)?\/?$/)
  return { token: match?.[1] ?? null, basePath: match ? `/share/${match[1]}` : '/share/invalid' }
}

export function shareAwareFetch(fetcher, getPathname, getSession = () => null) {
  return (input, init = {}) => {
    const headers = new Headers(init.headers ?? (input instanceof Request ? input.headers : undefined))
    const route = shareRoute(getPathname())
    // Even malformed share URLs must not fall back to public/owner data.
    headers.delete('x-protocol-session')
    if (route) {
      headers.set('x-protocol-share', route.token ?? 'invalid')
      const session = route.token ? getSession(route.token) : null
      if (session) headers.set('x-protocol-session', session)
    }
    else headers.delete('x-protocol-share')
    return fetcher(input, { ...init, headers })
  }
}
