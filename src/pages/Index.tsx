import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Shield, Wallet, Users } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="text-center max-w-4xl mx-auto px-4">
          <Building2 className="w-16 h-16 mx-auto mb-6 text-primary" />
          <h1 className="mb-6 text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Bank Management System
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Secure, efficient, and user-friendly banking solution for modern financial management.
            Manage your accounts, track transactions, and stay in control of your finances.
          </p>
          
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link to="/auth">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link to="/auth">Login to Account</Link>
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <Card>
              <CardHeader className="text-center">
                <Shield className="w-10 h-10 mx-auto mb-2 text-primary" />
                <CardTitle>Secure Banking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Advanced security measures with encrypted transactions and secure authentication
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Wallet className="w-10 h-10 mx-auto mb-2 text-primary" />
                <CardTitle>Real-time Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Instant deposits and withdrawals with real-time balance updates and transaction history
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Users className="w-10 h-10 mx-auto mb-2 text-primary" />
                <CardTitle>User-Friendly</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Intuitive interface designed for easy navigation and seamless banking experience
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
