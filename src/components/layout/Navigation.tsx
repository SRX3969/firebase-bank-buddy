import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { useToast } from '@/hooks/use-toast';
import { Menu, Home, User, History, LogOut, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationProps {
  userName?: string;
}

export const Navigation: React.FC<NavigationProps> = ({ userName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      navigate('/auth');
    }
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: Home },
    { label: 'Profile', path: '/profile', icon: User },
    { label: 'Transactions', path: '/transactions', icon: History },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const NavItem = ({ item, mobile = false }: { item: typeof navItems[0]; mobile?: boolean }) => {
    const isActive = location.pathname === item.path;
    const Icon = item.icon;
    
    return (
      <Button
        variant={isActive ? 'default' : 'ghost'}
        size={mobile ? 'default' : 'sm'}
        onClick={() => {
          navigate(item.path);
          if (mobile) setIsOpen(false);
        }}
        className={cn(
          mobile ? 'w-full justify-start' : '',
          isActive ? 'bg-primary text-primary-foreground' : ''
        )}
      >
        <Icon className="h-4 w-4 mr-2" />
        {item.label}
      </Button>
    );
  };

  return (
    <header className="bg-card border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-primary">Bank Buddy</h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {userName && (
              <span className="hidden sm:block text-sm text-muted-foreground">
                Welcome, {userName}!
              </span>
            )}
            
            <ThemeToggle />
            
            <Button 
              onClick={handleSignOut} 
              variant="outline" 
              size="sm"
              className="hidden md:flex"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="md:hidden">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col space-y-4 mt-8">
                  {userName && (
                    <div className="text-center py-4 border-b">
                      <p className="text-lg font-medium">Welcome!</p>
                      <p className="text-muted-foreground">{userName}</p>
                    </div>
                  )}
                  
                  {navItems.map((item) => (
                    <NavItem key={item.path} item={item} mobile />
                  ))}
                  
                  <Button 
                    onClick={() => {
                      handleSignOut();
                      setIsOpen(false);
                    }}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};