import { Outlet, Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { useAuth } from '@/contexts/auth-context'
import { useTheme } from '@/contexts/theme-context'
import { Button } from '@/components/ui/button'
import { removeAuthToken } from '@/lib/api/client'
import { Wallet, Home, Receipt, Target, CreditCard, Settings, Moon, Sun, Menu } from 'lucide-react'
import { FloatingAddButton } from './floating-add-button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'

interface ProtectedLayoutProps {
  children?: ReactNode
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { user, logout } = useAuth()
  const { setTheme, resolvedTheme } = useTheme()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [menuItemsVisible, setMenuItemsVisible] = useState(false)
  
  // Obtém a rota atual
  const router = useRouterState({
    select: (state) => state.location.pathname,
  })
  const currentPath = router

  // Controla a visibilidade dos itens do menu quando o Sheet abre
  useEffect(() => {
    if (mobileMenuOpen) {
      // Reset imediato para garantir que os itens começam invisíveis
      setMenuItemsVisible(false)
      // Delay para garantir que o Sheet está completamente aberto antes de animar
      const timer = setTimeout(() => {
        setMenuItemsVisible(true)
      }, 150)
      return () => clearTimeout(timer)
    } else {
      // Reset imediato quando fecha (sem animação)
      setMenuItemsVisible(false)
    }
  }, [mobileMenuOpen])


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

  const NavLink = ({ item, onClick, isMobile = false }: { item: typeof navItems[0]; onClick?: () => void; isMobile?: boolean }) => {
    const Icon = item.icon
    const isActive = currentPath === item.to
    const baseClasses = "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 ease-in-out"
    const activeClasses = `${baseClasses} text-foreground bg-muted`
    
    const handleClick = () => {
      // Delay para permitir animação antes de fechar o menu no mobile
      if (onClick && isMobile) {
        setTimeout(() => {
          onClick()
        }, 150)
      } else if (onClick) {
        onClick()
      }
    }
    
    if (isMobile) {
      return (
        <Link
          to={item.to}
          className={isActive ? activeClasses : baseClasses}
          onClick={handleClick}
        >
          <Icon className="h-4 w-4 transition-transform duration-200" />
          {item.label}
        </Link>
      )
    }
    
    return (
      <Link
        to={item.to}
        className={isActive ? activeClasses : baseClasses}
        onClick={handleClick}
      >
        <Icon className="h-4 w-4 transition-transform duration-200" />
        {item.label}
      </Link>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <Wallet className="h-6 w-6" />
              <h1 className="text-xl font-bold">Finances</h1>
            </Link>
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-2">
              {navItems.map((item) => (
                <NavLink key={item.to} item={item} />
              ))}
            </nav>

            <div className="flex items-center gap-2 md:gap-4">
              {/* Mobile/Tablet Menu Button */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Abrir menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                  <SheetHeader>
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
                    >
                      <Wallet className="h-6 w-6" />
                      <SheetTitle className="text-lg font-semibold">Finances</SheetTitle>
                    </Link>
                  </SheetHeader>
                  <nav className="flex flex-col gap-1 mt-8">
                    {navItems.map((item, index) => (
                      <div
                        key={item.to}
                        style={{
                          opacity: menuItemsVisible ? 1 : 0,
                          transform: menuItemsVisible ? 'translateX(0)' : 'translateX(-10px)',
                          transition: menuItemsVisible
                            ? `opacity 0.3s ease-out ${index * 50}ms, transform 0.3s ease-out ${index * 50}ms`
                            : 'none',
                        }}
                      >
                        <NavLink
                          item={item}
                          isMobile={true}
                          onClick={() => setMobileMenuOpen(false)}
                        />
                      </div>
                    ))}
                  </nav>
                  <div className="mt-8 pt-8 border-t space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{user?.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Tema</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            {resolvedTheme === 'dark' ? (
                              <>
                                <Sun className="mr-2 h-4 w-4" />
                                Escuro
                              </>
                            ) : (
                              <>
                                <Moon className="mr-2 h-4 w-4" />
                                Claro
                              </>
                            )}
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
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        handleLogout()
                        setMobileMenuOpen(false)
                      }}
                    >
                      Sair
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Desktop Controls */}
              <div className="hidden lg:flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
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

              {/* Mobile/Tablet Theme Toggle (visible outside menu) */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
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

