import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Wallet, TrendingUp, TrendingDown } from 'lucide-react';

interface Profile {
  id: string;
  name: string;
  phone: string;
  account_type: string;
  balance: number;
}

interface Transaction {
  id: string;
  amount: number;
  transaction_type: string;
  description: string;
  balance_after: number;
  created_at: string;
}

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchTransactions();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user?.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
    } else {
      setProfile(data);
    }
  };

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching transactions:', error);
    } else {
      setTransactions(data);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !depositAmount) return;

    setIsProcessing(true);
    const amount = parseFloat(depositAmount);
    const newBalance = profile.balance + amount;

    try {
      // Update profile balance
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('user_id', user?.id);

      if (profileError) throw profileError;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user?.id,
          amount,
          transaction_type: 'deposit',
          description: 'Account Deposit',
          balance_after: newBalance
        });

      if (transactionError) throw transactionError;

      setProfile({ ...profile, balance: newBalance });
      setDepositAmount('');
      fetchTransactions();
      
      toast({
        title: "Deposit Successful",
        description: `₹${amount.toFixed(2)} has been deposited to your account.`,
      });
    } catch (error: any) {
      toast({
        title: "Deposit Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !withdrawAmount) return;

    const amount = parseFloat(withdrawAmount);
    if (amount > profile.balance) {
      toast({
        title: "Insufficient Funds",
        description: "You don't have enough balance for this withdrawal.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    const newBalance = profile.balance - amount;

    try {
      // Update profile balance
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('user_id', user?.id);

      if (profileError) throw profileError;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user?.id,
          amount,
          transaction_type: 'withdraw',
          description: 'Account Withdrawal',
          balance_after: newBalance
        });

      if (transactionError) throw transactionError;

      setProfile({ ...profile, balance: newBalance });
      setWithdrawAmount('');
      fetchTransactions();
      
      toast({
        title: "Withdrawal Successful",
        description: `₹${amount.toFixed(2)} has been withdrawn from your account.`,
      });
    } catch (error: any) {
      toast({
        title: "Withdrawal Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Logout Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!profile) {
    return <div className="flex min-h-screen items-center justify-center">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {profile.name}</h1>
            <p className="text-muted-foreground">Manage your {profile.account_type} account</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Account Balance Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Account Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">
              ₹{profile.balance.toFixed(2)}
            </div>
            <p className="text-muted-foreground mt-1">
              {profile.account_type.charAt(0).toUpperCase() + profile.account_type.slice(1)} Account
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Banking Operations */}
          <Card>
            <CardHeader>
              <CardTitle>Banking Operations</CardTitle>
              <CardDescription>Deposit or withdraw funds</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="deposit" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="deposit">Deposit</TabsTrigger>
                  <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
                </TabsList>
                
                <TabsContent value="deposit">
                  <form onSubmit={handleDeposit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="deposit-amount">Amount (₹)</Label>
                      <Input
                        id="deposit-amount"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isProcessing}>
                      <TrendingUp className="w-4 h-4 mr-2" />
                      {isProcessing ? 'Processing...' : 'Deposit'}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="withdraw">
                  <form onSubmit={handleWithdraw} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="withdraw-amount">Amount (₹)</Label>
                      <Input
                        id="withdraw-amount"
                        type="number"
                        min="0.01"
                        step="0.01"
                        max={profile.balance}
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isProcessing}>
                      <TrendingDown className="w-4 h-4 mr-2" />
                      {isProcessing ? 'Processing...' : 'Withdraw'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest banking activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No transactions yet</p>
                ) : (
                  transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {transaction.transaction_type === 'deposit' ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                        <div>
                          <p className="font-medium">
                            {transaction.transaction_type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${
                          transaction.transaction_type === 'deposit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.transaction_type === 'deposit' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Balance: ₹{transaction.balance_after.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;