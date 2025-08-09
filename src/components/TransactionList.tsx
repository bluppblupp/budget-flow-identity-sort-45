import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, Filter, Search, RefreshCw, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useGoCardless, type Transaction } from "@/hooks/useGoCardless";
import { BankConnection } from "./BankConnection";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { categorizeTransaction, getCategoryColor } from "@/utils/categoryUtils";


export const TransactionList = () => {
  const { formatAmount } = useCurrency();
  const { getTransactions, loading } = useGoCardless();
  const { toast } = useToast();
  
  const [accounts, setAccounts] = useState<{ account_id: string; bank_name?: string }[]>([]);
  const [connectedAccountId, setConnectedAccountId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Load user's connected bank accounts
  const loadAccounts = async () => {
    setIsLoadingAccounts(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('connected_banks')
          .select('account_id, bank_name')
          .eq('user_id', user.id)
          .eq('is_active', true);
        if (!error && data) {
          setAccounts(data);
          if (!connectedAccountId && data.length > 0) {
            setConnectedAccountId(data[0].account_id);
          }
        }
      }
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

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
      
      // Save transactions to database with categorization
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const transactionsToSave = bankTransactions.map(transaction => ({
          user_id: user.id,
          bank_account_id: connectedAccountId,
          transaction_id: transaction.id,
          description: transaction.description,
          amount: transaction.amount,
          category: categorizeTransaction(transaction.description),
          date: transaction.date
        }));

        // Use upsert to avoid duplicates
        await supabase
          .from('transactions')
          .upsert(transactionsToSave, { 
            onConflict: 'user_id,bank_account_id,transaction_id',
            ignoreDuplicates: true 
          });
      }
      
      setLastUpdated(new Date().toLocaleTimeString());
      toast({
        title: "Transactions loaded",
        description: `Loaded and saved ${bankTransactions.length} transactions from your bank account`
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

  // Optional auto-refresh of transactions
  useEffect(() => {
    if (!autoRefresh || !connectedAccountId) return;
    const id = setInterval(() => {
      loadTransactions();
    }, 120000);
    return () => clearInterval(id);
  }, [autoRefresh, connectedAccountId]);

  const handleAccountConnected = async (accountId: string) => {
    setConnectedAccountId(accountId);
    // Reload accounts from backend to reflect new connection
    await loadAccounts();
  };


  // Only show real transactions, no mock data for dashboard
  const displayTransactions = transactions;

  return (
    <div className="space-y-6">
      <BankConnection onAccountConnected={handleAccountConnected} />

      {isLoadingAccounts ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading your bank accounts...</span>
        </div>
      ) : (
        accounts.length > 0 && (
          <div className="flex items-center gap-3">
            <label htmlFor="account" className="text-sm font-medium">Account:</label>
            <select
              id="account"
              className="border rounded-md p-2 bg-background"
              value={connectedAccountId || ""}
              onChange={(e) => setConnectedAccountId(e.target.value)}
            >
              {accounts.map((acc) => (
                <option key={acc.account_id} value={acc.account_id}>
                  {acc.bank_name || acc.account_id}
                </option>
              ))}
            </select>
            <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
              <span>Auto refresh</span>
              <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
              {lastUpdated && <span className="ml-4">Last updated: {lastUpdated}</span>}
            </div>
          </div>
        )
      )}

      {connectedAccountId ? (
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
                        <div className={`w-3 h-3 rounded-full bg-primary`} />
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.date).toLocaleDateString()} • Bank Account
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Badge variant="secondary" className="text-xs">
                          {categorizeTransaction(transaction.description)}
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
      ) : (
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
      )}
    </div>
  );
};