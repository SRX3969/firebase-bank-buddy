import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthProvider';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface BankingOperationsProps {
  currentBalance: number;
  onBalanceUpdate: () => void;
}

export const BankingOperations: React.FC<BankingOperationsProps> = ({
  currentBalance,
  onBalanceUpdate,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleTransaction = async (
    type: 'deposit' | 'withdraw',
    amount: number,
    description: string
  ) => {
    if (!user) return;

    setIsLoading(true);

    try {
      // Calculate new balance
      const newBalance = type === 'deposit' 
        ? currentBalance + amount 
        : currentBalance - amount;

      if (type === 'withdraw' && newBalance < 0) {
        toast({
          title: 'Insufficient Funds',
          description: 'You do not have sufficient balance for this withdrawal.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      // Process transaction manually
        const { data: currentProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('balance')
          .eq('user_id', user.id)
          .single();

        if (fetchError) throw fetchError;

        const updatedBalance = type === 'deposit' 
          ? currentProfile.balance + amount 
          : currentProfile.balance - amount;

        if (type === 'withdraw' && updatedBalance < 0) {
          toast({
            title: 'Insufficient Funds',
            description: 'You do not have sufficient balance for this withdrawal.',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }

        // Update balance
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ balance: updatedBalance })
          .eq('user_id', user.id);

        if (updateError) throw updateError;

        // Create transaction record
        const { error: transactionInsertError } = await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            amount,
            transaction_type: type,
            description: description || `${type === 'deposit' ? 'Deposit' : 'Withdrawal'} transaction`,
            balance_after: updatedBalance,
          });

        if (transactionInsertError) throw transactionInsertError;

      toast({
        title: 'Success',
        description: `${type === 'deposit' ? 'Deposit' : 'Withdrawal'} of ₹${amount.toFixed(2)} completed successfully.`,
      });

      onBalanceUpdate();
    } catch (error: any) {
      console.error('Transaction error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Transaction failed. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDepositSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const amount = parseFloat(formData.get('depositAmount') as string);
    const description = formData.get('depositDescription') as string;

    if (amount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount greater than 0.',
        variant: 'destructive',
      });
      return;
    }

    await handleTransaction('deposit', amount, description);
    (event.target as HTMLFormElement).reset();
  };

  const handleWithdrawSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const amount = parseFloat(formData.get('withdrawAmount') as string);
    const description = formData.get('withdrawDescription') as string;

    if (amount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount greater than 0.',
        variant: 'destructive',
      });
      return;
    }

    if (amount > currentBalance) {
      toast({
        title: 'Insufficient Funds',
        description: 'You do not have sufficient balance for this withdrawal.',
        variant: 'destructive',
      });
      return;
    }

    await handleTransaction('withdraw', amount, description);
    (event.target as HTMLFormElement).reset();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Banking Operations</CardTitle>
        <CardDescription>Manage your deposits and withdrawals</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="deposit" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="deposit" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Deposit
            </TabsTrigger>
            <TabsTrigger value="withdraw" className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Withdraw
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="deposit">
            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <div>
                <Label htmlFor="depositAmount">Amount (₹)</Label>
                <Input
                  id="depositAmount"
                  name="depositAmount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  placeholder="Enter deposit amount"
                />
              </div>
              <div>
                <Label htmlFor="depositDescription">Description (Optional)</Label>
                <Textarea
                  id="depositDescription"
                  name="depositDescription"
                  placeholder="Enter transaction description"
                  className="resize-none"
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Deposit Money'}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="withdraw">
            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              <div>
                <Label htmlFor="withdrawAmount">Amount (₹)</Label>
                <Input
                  id="withdrawAmount"
                  name="withdrawAmount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  max={currentBalance}
                  required
                  placeholder="Enter withdrawal amount"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Available balance: ₹{currentBalance.toFixed(2)}
                </p>
              </div>
              <div>
                <Label htmlFor="withdrawDescription">Description (Optional)</Label>
                <Textarea
                  id="withdrawDescription"
                  name="withdrawDescription"
                  placeholder="Enter transaction description"
                  className="resize-none"
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Withdraw Money'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};