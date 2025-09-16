import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { Navigation } from '@/components/layout/Navigation';
import { LoadingState } from '@/components/ui/loading-spinner';
import { User, Edit3, Save, X } from 'lucide-react';

interface Profile {
  id: string;
  name: string;
  phone: string;
  account_type: string;
  balance: number;
}

const Profile = () => {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    account_type: ''
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Fetch user profile
  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: 'Error',
          description: 'Failed to load profile data',
          variant: 'destructive',
        });
      } else {
        setProfile(data);
        setEditForm({
          name: data.name,
          phone: data.phone,
          account_type: data.account_type
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: editForm.name,
          phone: editForm.phone,
          account_type: editForm.account_type
        })
        .eq('user_id', user?.id);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to update profile',
          variant: 'destructive',
        });
      } else {
        setProfile({ ...profile, ...editForm });
        setIsEditing(false);
        toast({
          title: 'Success',
          description: 'Profile updated successfully',
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      setEditForm({
        name: profile.name,
        phone: profile.phone,
        account_type: profile.account_type
      });
    }
    setIsEditing(false);
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation userName={profile?.name} />
        <LoadingState>
          <p className="text-muted-foreground">Loading your profile...</p>
        </LoadingState>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">Failed to load profile data</p>
              <Button onClick={() => window.location.reload()} className="w-full mt-4">
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation userName={profile.name} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <User className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
              <p className="text-muted-foreground">Manage your account information</p>
            </div>
          </div>
          
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSaveProfile} size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button onClick={handleCancelEdit} variant="outline" size="sm">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Your basic account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p className="text-lg font-medium">{profile.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <p className="text-lg font-medium">{profile.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="account_type">Account Type</Label>
                {isEditing ? (
                  <Select
                    value={editForm.account_type}
                    onValueChange={(value) => setEditForm({ ...editForm, account_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="savings">Savings Account</SelectItem>
                      <SelectItem value="current">Current Account</SelectItem>
                      <SelectItem value="fixed">Fixed Deposit</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-lg font-medium capitalize">{profile.account_type} Account</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Read-only account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Account ID</Label>
                <p className="text-sm font-mono bg-muted p-2 rounded">
                  {profile.id}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Current Balance</Label>
                <p className="text-2xl font-bold text-primary">
                  ₹{profile.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Account Status</Label>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600 font-medium">Active</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Member Since</Label>
                <p className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString('en-IN', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>
              Manage your account security
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
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
                  <h4 className="font-medium">Change Password</h4>
                  <p className="text-sm text-muted-foreground">
                    Update your login password
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Change Password
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;