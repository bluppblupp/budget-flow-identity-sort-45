import { useEffect } from 'react'
import { Header } from '@/components/Header'
import { RealDataBudgetOverview } from '@/components/RealDataBudgetOverview'
import { TransactionList } from '@/components/TransactionList'
import { RealDataCategoryChart } from '@/components/RealDataCategoryChart'
import { useAuth } from '@/contexts/AuthContext'
import { CurrencyProvider } from '@/contexts/CurrencyContext'

const Dashboard = () => {
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/'
    }
  }, [user, loading])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  return (
    <CurrencyProvider>
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8 space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-3xl font-bold">Welcome back!</h2>
            <p className="text-muted-foreground">Here's your financial overview</p>
          </div>

          {/* Budget Overview */}
          <RealDataBudgetOverview />

          {/* Charts Section */}
          <RealDataCategoryChart />

          {/* Transactions */}
          <TransactionList />
        </main>
      </div>
    </CurrencyProvider>
  )
}

export default Dashboard