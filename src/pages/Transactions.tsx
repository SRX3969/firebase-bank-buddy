import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { Navigation } from '@/components/layout/Navigation';
import { LoadingState } from '@/components/ui/loading-spinner';
import { ArrowUpRight, ArrowDownLeft, History, IndianRupee } from 'lucide-react';

interface Transaction {
  id: string;
  amount: number;
  transaction_type: string;
  description: string | null;
  balance_after: number;
  created_at: string;
}

interface Profile {
  name: string;
}

const Transactions = () => {
  const { user, loading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Fetch data
  useEffect(() => {
    if (user) {
      fetchTransactions();
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('name')
        .eq('user_id', user?.id)
        .single();

      if (!error && data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching transactions:', error);
        toast({
          title: 'Error',
          description: 'Failed to load transactions',
          variant: 'destructive',
        });
      } else {
        setTransactions(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getTransactionIcon = (type: string) => {
    return type === 'deposit' ? (
      <ArrowDownLeft className="h-4 w-4 text-green-600" />
    ) : (
      <ArrowUpRight className="h-4 w-4 text-red-600" />
    );
  };

  const getTransactionColor = (type: string) => {
    return type === 'deposit' ? 'text-green-600' : 'text-red-600';
  };

  const getBadgeVariant = (type: string) => {
    return type === 'deposit' ? 'default' : 'secondary';
  };

  if (loading || transactionsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation userName={profile?.name} />
        <LoadingState>
          <p className="text-muted-foreground">Loading your transactions...</p>
        </LoadingState>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation userName={profile?.name} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <History className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Transaction History</h1>
            <p className="text-muted-foreground">
              View all your banking transactions in one place
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transactions.length}</div>
              <p className="text-xs text-muted-foreground">
                All time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
              <ArrowDownLeft className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {transactions.filter(t => t.transaction_type === 'deposit').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Successful deposits
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Withdrawals</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {transactions.filter(t => t.transaction_type === 'withdrawal').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Successful withdrawals
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Your complete transaction history
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  No transactions yet
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your transaction history will appear here once you make your first deposit or withdrawal.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-muted rounded-full">
                        {getTransactionIcon(transaction.transaction_type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium capitalize">
                            {transaction.transaction_type}
                          </h4>
                          <Badge variant={getBadgeVariant(transaction.transaction_type)}>
                            {transaction.transaction_type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {transaction.description || `${transaction.transaction_type} transaction`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getTransactionColor(transaction.transaction_type)}`}>
                        {transaction.transaction_type === 'deposit' ? '+' : '-'}
                        {formatCurrency(Math.abs(transaction.amount)).replace('₹', '')}
                        <IndianRupee className="inline h-4 w-4 ml-1" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Balance: {formatCurrency(transaction.balance_after)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Transactions;