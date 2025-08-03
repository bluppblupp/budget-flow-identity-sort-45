import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useCurrency } from "@/contexts/CurrencyContext";
import { TrendingUp, TrendingDown, Wallet, Target } from "lucide-react";

const budgetData = [
  { category: "Food & Dining", spent: 420, budget: 500, color: "bg-expense" },
  { category: "Transportation", spent: 180, budget: 300, color: "bg-warning" },
  { category: "Entertainment", spent: 150, budget: 200, color: "bg-primary" },
  { category: "Shopping", spent: 320, budget: 250, color: "bg-expense" },
];

export const BudgetOverview = () => {
  const { formatAmount } = useCurrency();
  const totalIncome = 4500;
  const totalExpenses = 2840;
  const savings = totalIncome - totalExpenses;

  return (
    <div className="space-y-6">
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-card to-card/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Balance</p>
                <p className="text-2xl font-bold text-foreground">{formatAmount(totalIncome)}</p>
              </div>
              <Wallet className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-income/10 to-income/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Income</p>
                <p className="text-2xl font-bold text-income">{formatAmount(totalIncome)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-income" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-expense/10 to-expense/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Expenses</p>
                <p className="text-2xl font-bold text-expense">{formatAmount(totalExpenses)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-expense" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-success/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Savings</p>
                <p className="text-2xl font-bold text-success">{formatAmount(savings)}</p>
              </div>
              <Target className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {budgetData.map((item, index) => {
            const percentage = (item.spent / item.budget) * 100;
            const isOverBudget = percentage > 100;
            
            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{item.category}</span>
                   <span className={`font-semibold ${isOverBudget ? 'text-expense' : 'text-muted-foreground'}`}>
                     {formatAmount(item.spent)} / {formatAmount(item.budget)}
                   </span>
                </div>
                <Progress 
                  value={Math.min(percentage, 100)} 
                  className="h-2"
                  style={{
                    '--progress-background': isOverBudget ? 'hsl(var(--expense))' : 'hsl(var(--primary))'
                  } as React.CSSProperties}
                />
                {isOverBudget && (
                  <p className="text-sm text-expense">Over budget by {formatAmount(item.spent - item.budget)}</p>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};