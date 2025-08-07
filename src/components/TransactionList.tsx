import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, Filter, Search, RefreshCw, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useGoCardless, type Transaction } from "@/hooks/useGoCardless";
import { BankConnection } from "./BankConnection";
import { useToast } from "@/hooks/use-toast";

const mockTransactions = [
  {
    id: "1",
    date: "2024-01-20",
    description: "Grocery Store",
    amount: -85.50,
    category: "Food & Dining",
    account: "Checking",
    categoryColor: "bg-orange-500",
    currency: "USD",
    type: "debit" as const
  },
  {
    id: "2",
    date: "2024-01-19",
    description: "Salary Deposit",
    amount: 3500.00,
    category: "Income",
    account: "Checking",
    categoryColor: "bg-income",
    currency: "USD",
    type: "credit" as const
  },
  {
    id: "3",
    date: "2024-01-18",
    description: "Netflix Subscription",
    amount: -15.99,
    category: "Entertainment",
    account: "Credit Card",
    categoryColor: "bg-primary",
    currency: "USD",
    type: "debit" as const
  },
  {
    id: "4",
    date: "2024-01-17",
    description: "Gas Station",
    amount: -45.20,
    category: "Transportation",
    account: "Checking",
    categoryColor: "bg-warning",
    currency: "USD",
    type: "debit" as const
  },
  {
    id: "5",
    date: "2024-01-16",
    description: "Online Shopping",
    amount: -120.00,
    category: "Shopping",
    account: "Credit Card",
    categoryColor: "bg-purple-500",
    currency: "USD",
    type: "debit" as const
  },
  {
    id: "6",
    date: "2024-01-15",
    description: "Restaurant",
    amount: -67.80,
    category: "Food & Dining",
    account: "Credit Card",
    categoryColor: "bg-orange-500",
    currency: "USD",
    type: "debit" as const
  }
];

export const TransactionList = () => {
  const { formatAmount } = useCurrency();
  const { getTransactions, loading } = useGoCardless();
  const { toast } = useToast();
  
  const [connectedAccountId, setConnectedAccountId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

  // Load transactions when account is connected
  useEffect(() => {
    if (connectedAccountId) {
      loadTransactions();
    }
  }, [connectedAccountId]);

  const loadTransactions = async () => {
    if (!connectedAccountId) return;
    
    setIsLoadingTransactions(true);
    try {
      // Get transactions from last 30 days
      const dateTo = new Date().toISOString().split('T')[0];
      const dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const bankTransactions = await getTransactions(connectedAccountId, dateFrom, dateTo);
      setTransactions(bankTransactions);
      
      toast({
        title: "Transactions loaded",
        description: `Loaded ${bankTransactions.length} transactions from your bank account`
      });
    } catch (error) {
      toast({
        title: "Error loading transactions",
        description: "Failed to load transactions from your bank",
        variant: "destructive"
      });
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const handleAccountConnected = (accountId: string) => {
    setConnectedAccountId(accountId);
  };

  const getCategoryColor = (description: string) => {
    const desc = description.toLowerCase();
    if (desc.includes('grocery') || desc.includes('restaurant') || desc.includes('coffee')) return 'bg-orange-500';
    if (desc.includes('salary') || desc.includes('income') || desc.includes('deposit')) return 'bg-income';
    if (desc.includes('gas') || desc.includes('transport') || desc.includes('taxi')) return 'bg-warning';
    if (desc.includes('netflix') || desc.includes('entertainment') || desc.includes('subscription')) return 'bg-primary';
    if (desc.includes('shop') || desc.includes('amazon') || desc.includes('store')) return 'bg-purple-500';
    return 'bg-muted';
  };

  const getCategory = (description: string) => {
    const desc = description.toLowerCase();
    if (desc.includes('grocery') || desc.includes('restaurant') || desc.includes('coffee')) return 'Food & Dining';
    if (desc.includes('salary') || desc.includes('income') || desc.includes('deposit')) return 'Income';
    if (desc.includes('gas') || desc.includes('transport') || desc.includes('taxi')) return 'Transportation';
    if (desc.includes('netflix') || desc.includes('entertainment') || desc.includes('subscription')) return 'Entertainment';
    if (desc.includes('shop') || desc.includes('amazon') || desc.includes('store')) return 'Shopping';
    if (desc.includes('electric') || desc.includes('utilities') || desc.includes('bill')) return 'Utilities';
    return 'Other';
  };

  // Only show real transactions, no mock data for dashboard
  const displayTransactions = transactions;

  if (!connectedAccountId) {
    return (
      <div className="space-y-6">
        <BankConnection onAccountConnected={handleAccountConnected} />
        
        <Card>
          <CardHeader>
            <CardTitle>No Transactions Yet</CardTitle>
            <p className="text-sm text-muted-foreground">
              Connect your bank account above to see your real transactions
            </p>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>Your transactions will appear here once you connect a bank account.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Recent Transactions</CardTitle>
          <div className="flex space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search transactions..." 
                className="pl-10 w-64"
              />
            </div>
            <Button 
              variant="outline" 
              size="icon"
              onClick={loadTransactions}
              disabled={isLoadingTransactions}
            >
              {isLoadingTransactions ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoadingTransactions ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading transactions...</span>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {displayTransactions.map((transaction) => (
                <div 
                  key={transaction.id} 
                  className="flex items-center justify-between p-4 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      'categoryColor' in transaction 
                        ? transaction.categoryColor 
                        : getCategoryColor(transaction.description)
                    }`} />
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString()} • 
                        {'account' in transaction ? (transaction as any).account : 'Bank Account'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary" className="text-xs">
                      {'category' in transaction 
                        ? transaction.category 
                        : getCategory(transaction.description)
                      }
                    </Badge>
                    <span 
                      className={`font-semibold ${
                        transaction.amount > 0 ? 'text-income' : 'text-expense'
                      }`}
                    >
                      {transaction.amount > 0 ? '+' : ''}{formatAmount(transaction.amount)}
                    </span>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            {displayTransactions.length > 0 && (
              <div className="mt-6 text-center">
                <Button variant="outline" onClick={loadTransactions}>
                  Refresh Transactions
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};