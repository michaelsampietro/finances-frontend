import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

console.log('Creating router with routeTree:', routeTree)

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
})

console.log('Router created:', router)

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

