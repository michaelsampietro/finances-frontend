import { Link, useRouterState } from '@tanstack/react-router'
import { Home, Receipt, Target, CreditCard, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AddTransactionModal } from '@/components/modals/add-transaction-modal'
import { useState } from 'react'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: Home },
  { to: '/transactions', label: 'Transações', icon: Receipt },
  { to: '/budgets', label: 'Orçamentos', icon: Target },
  { to: '/accounts', label: 'Contas', icon: CreditCard },
]

export function BottomNav() {
  const router = useRouterState({
    select: (state) => state.location.pathname,
  })
  const currentPath = router
  const [addModalOpen, setAddModalOpen] = useState(false)

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background lg:hidden safe-area-inset-bottom">
        <div className="flex items-center justify-around px-1 py-2">
          {/* Dashboard */}
          <Link
            to="/dashboard"
            className={cn(
              "flex flex-col items-center justify-center gap-1 px-2 py-1 rounded-md transition-colors flex-1",
              currentPath === '/dashboard'
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Home className={cn("h-5 w-5", currentPath === '/dashboard' && "text-primary")} />
            <span className="text-xs font-medium">Dashboard</span>
          </Link>

          {/* Transações */}
          <Link
            to="/transactions"
            className={cn(
              "flex flex-col items-center justify-center gap-1 px-2 py-1 rounded-md transition-colors flex-1",
              currentPath === '/transactions'
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Receipt className={cn("h-5 w-5", currentPath === '/transactions' && "text-primary")} />
            <span className="text-xs font-medium">Transações</span>
          </Link>

          {/* Botão central de adicionar */}
          <div className="flex flex-col items-center -mt-4">
            <button
              onClick={() => setAddModalOpen(true)}
              className={cn(
                "flex items-center justify-center h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:scale-110 active:scale-95"
              )}
            >
              <Plus className="h-6 w-6" />
            </button>
            {/* <span className="text-xs text-muted-foreground mt-1">Adicionar</span> */}
          </div>

          {/* Orçamentos */}
          <Link
            to="/budgets"
            className={cn(
              "flex flex-col items-center justify-center gap-1 px-2 py-1 rounded-md transition-colors flex-1",
              currentPath === '/budgets'
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Target className={cn("h-5 w-5", currentPath === '/budgets' && "text-primary")} />
            <span className="text-xs font-medium">Orçamentos</span>
          </Link>

          {/* Contas */}
          <Link
            to="/accounts"
            className={cn(
              "flex flex-col items-center justify-center gap-1 px-2 py-1 rounded-md transition-colors flex-1",
              currentPath === '/accounts'
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <CreditCard className={cn("h-5 w-5", currentPath === '/accounts' && "text-primary")} />
            <span className="text-xs font-medium">Contas</span>
          </Link>
        </div>
      </nav>
      <AddTransactionModal open={addModalOpen} onOpenChange={setAddModalOpen} />
    </>
  )
}


