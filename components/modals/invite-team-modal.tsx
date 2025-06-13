'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Users, Mail, Plus, X, Loader2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

interface InviteTeamModalProps {
  trigger?: React.ReactNode;
}

const ROLES = [
  {
    value: 'admin',
    label: 'Admin',
    description: 'Full access to all features',
  },
  {
    value: 'editor',
    label: 'Editor',
    description: 'Can edit projects and content',
  },
  { value: 'viewer', label: 'Viewer', description: 'Read-only access' },
  {
    value: 'guest',
    label: 'Guest',
    description: 'Limited access to specific projects',
  },
];

interface Invitation {
  email: string;
  role: string;
}

export function InviteTeamModal({ trigger }: InviteTeamModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>([
    { email: '', role: 'editor' },
  ]);

  const addInvitation = () => {
    setInvitations((prev) => [...prev, { email: '', role: 'editor' }]);
  };

  const removeInvitation = (index: number) => {
    setInvitations((prev) => prev.filter((_, i) => i !== index));
  };

  const updateInvitation = (
    index: number,
    field: keyof Invitation,
    value: string
  ) => {
    setInvitations((prev) =>
      prev.map((inv, i) => (i === index ? { ...inv, [field]: value } : inv))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validInvitations = invitations.filter((inv) => inv.email.trim());
    if (validInvitations.length === 0) {
      toast.error('Please add at least one email address');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success(
        `${validInvitations.length} invitation(s) sent successfully!`
      );
      setIsOpen(false);
      setInvitations([{ email: '', role: 'editor' }]);
    } catch (error) {
      toast.error('Failed to send invitations');
    } finally {
      setIsLoading(false);
    }
  };

  const defaultTrigger = (
    <Button variant="outline" className="w-full justify-start cursor-pointer">
      <Users className="h-4 w-4 mr-2" />
      Invite Team Member
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invite Team Members
          </DialogTitle>
          <DialogDescription>
            Send invitations to collaborate on your workspace.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            {invitations.map((invitation, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row gap-2 items-start sm:items-end"
              >
                <div className="flex-1 w-full">
                  <Label htmlFor={`email-${index}`}>
                    Email Address {index === 0 && '*'}
                  </Label>
                  <Input
                    id={`email-${index}`}
                    type="email"
                    value={invitation.email}
                    onChange={(e) =>
                      updateInvitation(index, 'email', e.target.value)
                    }
                    placeholder="colleague@company.com"
                    required={index === 0}
                    className="mt-1"
                  />
                </div>

                <div className="w-full sm:w-[220px]">
                  <Label htmlFor={`role-${index}`}>Role</Label>
                  <Select
                    value={invitation.role}
                    onValueChange={(value) =>
                      updateInvitation(index, 'role', value)
                    }
                  >
                    <SelectTrigger className="mt-1 w-full h-auto py-2">
                      <div className="flex flex-col text-left">
                        <span className="font-medium text-sm">
                          {
                            ROLES.find((r) => r.value === invitation.role)
                              ?.label
                          }
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {
                            ROLES.find((r) => r.value === invitation.role)
                              ?.description
                          }
                        </span>
                      </div>
                    </SelectTrigger>

                    <SelectContent className="w-[260px]">
                      {ROLES.map((role) => (
                        <SelectItem
                          key={role.value}
                          value={role.value}
                          className="py-2"
                        >
                          <div className="flex flex-col space-y-0.5">
                            <span className="font-medium">{role.label}</span>
                            <span className="text-xs text-muted-foreground">
                              {role.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {invitations.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeInvitation(index)}
                    className="mb-0 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={addInvitation}
            className="w-full cursor-pointer"
            disabled={invitations.length >= 10}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Invitation
          </Button>

          {/* Role Descriptions */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Role Permissions:</h4>
            <div className="space-y-1 text-xs text-gray-600">
              {ROLES.map((role) => (
                <div key={role.value} className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {role.label}
                  </Badge>
                  <span>{role.description}</span>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 cursor-pointer"
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Mail className="h-4 w-4 mr-2" />
              Send Invitations
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
