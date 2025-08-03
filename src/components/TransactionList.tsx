import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCurrency } from "@/contexts/CurrencyContext";

const transactions = [
  {
    id: 1,
    date: "2024-01-20",
    description: "Grocery Store",
    amount: -85.50,
    category: "Food & Dining",
    account: "Checking",
    categoryColor: "bg-orange-500"
  },
  {
    id: 2,
    date: "2024-01-19",
    description: "Salary Deposit",
    amount: 3500.00,
    category: "Income",
    account: "Checking",
    categoryColor: "bg-income"
  },
  {
    id: 3,
    date: "2024-01-18",
    description: "Netflix Subscription",
    amount: -15.99,
    category: "Entertainment",
    account: "Credit Card",
    categoryColor: "bg-primary"
  },
  {
    id: 4,
    date: "2024-01-17",
    description: "Gas Station",
    amount: -45.20,
    category: "Transportation",
    account: "Checking",
    categoryColor: "bg-warning"
  },
  {
    id: 5,
    date: "2024-01-16",
    description: "Online Shopping",
    amount: -120.00,
    category: "Shopping",
    account: "Credit Card",
    categoryColor: "bg-purple-500"
  },
  {
    id: 6,
    date: "2024-01-15",
    description: "Restaurant",
    amount: -67.80,
    category: "Food & Dining",
    account: "Credit Card",
    categoryColor: "bg-orange-500"
  }
];

export const TransactionList = () => {
  const { formatAmount } = useCurrency();

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
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div 
              key={transaction.id} 
              className="flex items-center justify-between p-4 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${transaction.categoryColor}`} />
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(transaction.date).toLocaleDateString()} • {transaction.account}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Badge variant="secondary" className="text-xs">
                  {transaction.category}
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
        
        <div className="mt-6 text-center">
          <Button variant="outline">
            Load More Transactions
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};