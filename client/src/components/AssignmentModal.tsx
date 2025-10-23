import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Users, Building2 } from "lucide-react";
import type { Lead, Company, User as UserType } from "@/lib/types";

interface AssignmentModalProps {
  lead: Lead | null;
  company: Company | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserType;
}

export default function AssignmentModal({ 
  lead, 
  company, 
  isOpen, 
  onClose, 
  currentUser 
}: AssignmentModalProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedInternIds, setSelectedInternIds] = useState<string[]>([]);
  const { toast } = useToast();

  const isAnalyst = currentUser.role === 'analyst';
  const isPartnerOrAdmin = ['partner', 'admin'].includes(currentUser.role);

  // Fetch users based on role
  // Analysts fetch their assigned interns from dedicated endpoint
  // Partners/Admins fetch all users
  // const { data: users = [], isLoading: isLoadingUsers } = useQuery<UserType[]>({
  //   queryKey: isAnalyst 
  //     ? [`/api/analysts/${currentUser.id}/interns`] 
  //     : ['/api/users'],
  //   enabled: isOpen,
  //   queryFn: async () => {
  //     const endpoint = isAnalyst 
  //       ? `/api/analysts/${currentUser.id}/interns` 
  //       : '/api/users';
      
  //     const response = await fetch(endpoint, {
  //       credentials: 'include',
  //       cache: 'no-cache',
  //     });
      
  //     if (!response.ok) {
  //       throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  //     }
      
  //     return await response.json();
  //   },
  // });

      const { data: users = [], isLoading: isLoadingUsers } = useQuery<UserType[]>({
      queryKey: ['/api/users'],
      enabled: isOpen,
      queryFn: async () => {
        const response = await fetch('/api/users', {
          credentials: 'include',
          cache: 'no-cache',
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      },
    });


  // Assignment mutation for Partners/Admins (to analysts)
  const assignmentMutation = useMutation({
    mutationFn: async (data: { leadId: number; assignedTo: string | null }) => {
      return apiRequest('POST', `/api/leads/${data.leadId}/assign`, { assignedTo: data.assignedTo });
    },
    onSuccess: async () => {
      toast({
        title: "Lead Assigned",
        description: "The lead has been successfully assigned.",
      });
      await queryClient.invalidateQueries({ queryKey: ['leads'], refetchType: 'active' });
      setSelectedUserId(null);
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Assignment Failed",
        description: error?.message || "Failed to assign the lead. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Intern assignment mutation for Analysts (to interns)
  const internAssignmentMutation = useMutation({
    mutationFn: async (data: { leadId: number; internIds: string[] }) => {
      return apiRequest('PATCH', `/api/leads/${data.leadId}/assign-intern`, { internIds: data.internIds });
    },
    onSuccess: async () => {
      toast({
        title: "Lead Assigned to Intern(s)",
        description: "The lead has been successfully assigned to the selected intern(s).",
      });
      await queryClient.invalidateQueries({ queryKey: ['leads'], refetchType: 'active' });
      setSelectedInternIds([]);
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Assignment Failed",
        description: error?.message || "Failed to assign the lead to intern(s). Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleAssign = () => {
    if (!lead) return;
    
    if (isAnalyst) {
      // Analyst assigning to interns
      if (selectedInternIds.length === 0) return;
      internAssignmentMutation.mutate({
        leadId: lead.id,
        internIds: selectedInternIds
      });
    } else {
      // Partner/Admin assigning to analyst
      if (!selectedUserId) return;
      assignmentMutation.mutate({
        leadId: lead.id,
        assignedTo: selectedUserId
      });
    }
  };

  const handleUnassign = () => {
    if (!lead) return;
    
    assignmentMutation.mutate({
      leadId: lead.id,
      assignedTo: null
    });
  };

  const toggleInternSelection = (internId: string) => {
    setSelectedInternIds(prev => 
      prev.includes(internId) 
        ? prev.filter(id => id !== internId)
        : [...prev, internId]
    );
  };

  if (!lead || !company) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent data-testid="modal-assignment">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {isAnalyst ? 'Assign to Intern(s)' : 'Assign Lead'}
          </DialogTitle>
          <DialogDescription>
            {isAnalyst 
              ? 'Assign this lead to one or more of your interns for follow-up.'
              : 'Assign this lead to a team member for follow-up.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Lead Information */}
          <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <div>
              <h4 className="font-medium">{company.name}</h4>
              <p className="text-sm text-muted-foreground">
                Stage: <Badge variant="outline">{lead.stage}</Badge>
              </p>
            </div>
          </div>

          {/* Current Assignment - Only show for non-analysts */}
          {!isAnalyst && lead.assignedTo && (
            <div className="p-3 border rounded-md">
              <h5 className="font-medium mb-1">Currently Assigned To:</h5>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="text-sm">{lead.assignedTo}</span>
              </div>
            </div>
          )}

          {/* Assignment Selection */}
          {isAnalyst ? (
            // Multi-select for Analysts (selecting interns)
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Intern(s):</label>
              {isLoadingUsers ? (
                <p className="text-sm text-muted-foreground">Loading interns...</p>
              ) : users.length === 0 ? (
                <p className="text-sm text-muted-foreground">No interns assigned to you</p>
              ) : (
                <div className="border rounded-md p-3 space-y-2 max-h-60 overflow-y-auto">
                  {users.filter((ele)=>ele.role==='intern').map((intern) => (
                    <div 
                      key={intern.id} 
                      className="flex items-center gap-2 p-2 rounded hover-elevate"
                      data-testid={`checkbox-intern-${intern.id}`}
                    >
                      <Checkbox
                        checked={selectedInternIds.includes(intern.id)}
                        onCheckedChange={() => toggleInternSelection(intern.id)}
                      />
                      <label 
                        htmlFor={`intern-${intern.id}`}
                        className="flex items-center gap-2 flex-1 cursor-pointer"
                        onClick={() => toggleInternSelection(intern.id)}
                      >
                        <User className="h-4 w-4" />
                        <span className="text-sm">
                          {intern.firstName && intern.lastName 
                            ? `${intern.firstName} ${intern.lastName}` 
                            : intern.email}
                        </span>
                        <Badge variant="secondary" className="ml-auto">
                          {intern.role}
                        </Badge>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Single select for Partners/Admins (selecting analysts/users)
            <div className="space-y-2">
              <label className="text-sm font-medium">Assign to:</label>
              <Select onValueChange={setSelectedUserId} disabled={isLoadingUsers}>
                <SelectTrigger data-testid="select-assignee">
                  <SelectValue placeholder="Select team member..." />
                </SelectTrigger>
                <SelectContent className="bg-gray-50">
                  {users.filter((ele)=>ele.role==='analyst').map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {user.firstName && user.lastName 
                          ? `${user.firstName} ${user.lastName}` 
                          : user.email
                        }
                        <Badge variant="secondary" className="ml-2">
                          {user.role}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <div>
              {!isAnalyst && lead.assignedTo && (
                <Button
                  variant="outline"
                  onClick={handleUnassign}
                  disabled={assignmentMutation.isPending}
                  data-testid="button-unassign"
                >
                  Unassign
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={assignmentMutation.isPending || internAssignmentMutation.isPending}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssign}
                disabled={
                  (isAnalyst && selectedInternIds.length === 0) ||
                  (!isAnalyst && !selectedUserId) ||
                  assignmentMutation.isPending ||
                  internAssignmentMutation.isPending
                }
                data-testid="button-assign"
              >
                {(assignmentMutation.isPending || internAssignmentMutation.isPending) 
                  ? "Assigning..." 
                  : isAnalyst 
                    ? `Assign to ${selectedInternIds.length} Intern(s)` 
                    : "Assign Lead"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
