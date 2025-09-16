import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { Navigation } from '@/components/layout/Navigation';
import { LoadingState } from '@/components/ui/loading-spinner';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Smartphone, 
  Mail, 
  Download,
  Trash2,
  AlertTriangle
} from 'lucide-react';

interface Profile {
  name: string;
}

const Settings = () => {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    push: false,
    marketing: false
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Fetch profile
  useEffect(() => {
    if (user) {
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
    } finally {
      setProfileLoading(false);
    }
  };

  const handleNotificationChange = (key: keyof typeof notifications, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    toast({
      title: 'Settings Updated',
      description: `${key.charAt(0).toUpperCase() + key.slice(1)} notifications ${value ? 'enabled' : 'disabled'}`,
    });
  };

  const handleExportData = () => {
    toast({
      title: 'Export Started',
      description: 'Your data export will be ready shortly. We\'ll notify you via email.',
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: 'Account Deletion',
      description: 'Please contact support to delete your account.',
      variant: 'destructive',
    });
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation userName={profile?.name} />
        <LoadingState>
          <p className="text-muted-foreground">Loading settings...</p>
        </LoadingState>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation userName={profile?.name} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <SettingsIcon className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account preferences and security settings
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize your app appearance and theme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Theme</Label>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred theme
                  </p>
                </div>
                <ThemeToggle />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Configure how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label className="text-base font-medium">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive transaction alerts via email
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(value) => handleNotificationChange('email', value)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label className="text-base font-medium">SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive transaction alerts via SMS
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notifications.sms}
                  onCheckedChange={(value) => handleNotificationChange('sms', value)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label className="text-base font-medium">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications in your browser
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={(value) => handleNotificationChange('push', value)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label className="text-base font-medium">Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive promotional content and updates
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notifications.marketing}
                  onCheckedChange={(value) => handleNotificationChange('marketing', value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security
              </CardTitle>
              <CardDescription>
                Manage your account security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Two-Factor Authentication</h4>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Enable 2FA
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Login Sessions</h4>
                  <p className="text-sm text-muted-foreground">
                    View and manage your active sessions
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Manage Sessions
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Change Password</h4>
                  <p className="text-sm text-muted-foreground">
                    Update your login password
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Data & Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Data & Privacy
              </CardTitle>
              <CardDescription>
                Manage your data and privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Export Account Data</h4>
                  <p className="text-sm text-muted-foreground">
                    Download a copy of your account data
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleExportData}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Privacy Settings</h4>
                  <p className="text-sm text-muted-foreground">
                    Control your data sharing preferences
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Manage Privacy
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border border-destructive rounded-lg">
                <div>
                  <h4 className="font-medium text-destructive">Delete Account</h4>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all data
                  </p>
                </div>
                <Button variant="destructive" size="sm" onClick={handleDeleteAccount}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;