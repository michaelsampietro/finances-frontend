import React, { createContext, useContext, useState, useEffect } from 'react'
import { setAuthToken, removeAuthToken, getAuthToken } from '@/lib/api/client'
import { usersApi } from '@/lib/api/users'
import type { User } from '@/types'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = getAuthToken()
    if (token) {
      // Try to fetch user data
      usersApi
        .getMe()
        .then((userData) => {
          setUser(userData)
        })
        .catch((error) => {
          // Token invalid or API error, remove it
          console.error('Auth error:', error)
          removeAuthToken()
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }
  }, [])

  const handleSetUser = (newUser: User | null) => {
    setUser(newUser)
  }

  const logout = () => {
    removeAuthToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        setUser: handleSetUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

