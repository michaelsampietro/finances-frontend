import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { isAuthenticated } from '@/lib/api/client'
import { useEffect } from 'react'

export const Route = createFileRoute('/')({
  component: IndexPage,
})

function IndexPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated()) {
        navigate({ to: '/dashboard', replace: true })
      } else {
        navigate({ to: '/login', replace: true })
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Carregando...</p>
      </div>
    </div>
  )
}

