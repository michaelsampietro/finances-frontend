import { Outlet, Link, useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/contexts/auth-context'
import { useTheme } from '@/contexts/theme-context'
import { Button } from '@/components/ui/button'
import { removeAuthToken } from '@/lib/api/client'
import { Wallet, Home, Receipt, Target, CreditCard, Settings, Moon, Sun } from 'lucide-react'
import { FloatingAddButton } from './floating-add-button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { ReactNode } from 'react'

interface ProtectedLayoutProps {
  children?: ReactNode
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { user, logout } = useAuth()
  const { setTheme, resolvedTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => {
    removeAuthToken()
    logout()
    navigate({ to: '/login' })
  }

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: Home },
    { to: '/transactions', label: 'Transações', icon: Receipt },
    { to: '/budgets', label: 'Orçamentos', icon: Target },
    { to: '/accounts', label: 'Contas', icon: CreditCard },
    { to: '/settings', label: 'Configurações', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="h-6 w-6" />
              <h1 className="text-xl font-bold">Finances</h1>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    activeProps={{
                      className: 'text-foreground',
                    }}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user?.name}
              </span>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    {resolvedTheme === 'dark' ? (
                      <Sun className="h-5 w-5" />
                    ) : (
                      <Moon className="h-5 w-5" />
                    )}
                    <span className="sr-only">Alternar tema</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setTheme('light')}>
                    <Sun className="mr-2 h-4 w-4" />
                    <span>Claro</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('dark')}>
                    <Moon className="mr-2 h-4 w-4" />
                    <span>Escuro</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('system')}>
                    <span>🖥️ Sistema</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {children || <Outlet />}
      </main>

      <FloatingAddButton />
    </div>
  )
}

