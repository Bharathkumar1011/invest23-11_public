import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  User as UserIcon, 
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  FileText,
  Clock,
  Edit,
  CheckCircle
} from "lucide-react";
import { SiLinkedin, SiWhatsapp } from "react-icons/si";
import type { Intervention, Lead, Company, Contact, User as UserType } from "@/lib/types";
import { formatDistanceToNow, format, isToday, isPast } from "date-fns";

interface ScheduledTaskCardProps {
  intervention: Intervention & {
    lead: Lead & {
      company: Company;
      contact?: Contact;
    };
    user: UserType;
  };
  onEdit?: (interventionId: number) => void;
  onComplete?: (interventionId: number) => void;
}

export default function ScheduledTaskCard({ 
  intervention,
  onEdit,
  onComplete
}: ScheduledTaskCardProps) {
  const { lead, user, scheduledAt, type, notes } = intervention;
  const { company, contact } = lead;

  // Get activity type icon and label
  const getActivityConfig = () => {
    switch (type) {
      case 'linkedin_message':
        return { icon: SiLinkedin, label: 'LinkedIn Message', color: 'bg-blue-500' };
      case 'call':
        return { icon: Phone, label: 'Call', color: 'bg-green-500' };
      case 'whatsapp':
        return { icon: SiWhatsapp, label: 'WhatsApp', color: 'bg-green-500' };
      case 'email':
        return { icon: Mail, label: 'Email', color: 'bg-red-500' };
      case 'meeting':
        return { icon: Calendar, label: 'Meeting', color: 'bg-purple-500' };
      case 'document':
        return { icon: FileText, label: 'Document', color: 'bg-orange-500' };
      default:
        return { icon: MessageSquare, label: type, color: 'bg-gray-500' };
    }
  };

  const activityConfig = getActivityConfig();
  const ActivityIcon = activityConfig.icon;

  // Determine status based on scheduled time
  const getStatus = () => {
    const scheduledDate = new Date(scheduledAt);
    
    if (isPast(scheduledDate) && !isToday(scheduledDate)) {
      return { label: 'Overdue', variant: 'destructive' as const };
    }
    
    if (isToday(scheduledDate)) {
      return { label: 'Today', variant: 'warning' as const };
    }
    
    return { label: 'Upcoming', variant: 'default' as const };
  };

  const status = getStatus();
  const scheduledDate = new Date(scheduledAt);
  const relativeTime = formatDistanceToNow(scheduledDate, { addSuffix: true });
  const formattedDateTime = format(scheduledDate, 'MMM d, yyyy • h:mm a');

  return (
    <Card className="hover-elevate" data-testid={`scheduled-task-card-${intervention.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Company Name */}
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <h3 className="font-semibold text-base truncate" data-testid={`company-name-${intervention.id}`}>
                {company.name}
              </h3>
            </div>
            
            {/* POC Information */}
            {contact && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <UserIcon className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate" data-testid={`poc-name-${intervention.id}`}>
                  {contact.name}
                  {contact.designation && ` • ${contact.designation}`}
                </span>
              </div>
            )}
          </div>

          {/* Status Badge */}
          <Badge variant={status.variant} data-testid={`status-${intervention.id}`}>
            {status.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Activity Type */}
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded ${activityConfig.color} bg-opacity-10`}>
            <ActivityIcon className={`h-4 w-4 ${activityConfig.color.replace('bg-', 'text-')}`} />
          </div>
          <span className="text-sm font-medium" data-testid={`activity-type-${intervention.id}`}>
            {activityConfig.label}
          </span>
        </div>

        {/* Scheduled Time */}
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="font-medium" data-testid={`scheduled-time-${intervention.id}`}>
              {formattedDateTime}
            </span>
            <span className="text-xs text-muted-foreground">{relativeTime}</span>
          </div>
        </div>

        {/* Notes */}
        {notes && (
          <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
            <p className="line-clamp-2" data-testid={`notes-${intervention.id}`}>{notes}</p>
          </div>
        )}

        {/* Assigned User */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <UserIcon className="h-3.5 w-3.5" />
          <span data-testid={`assigned-user-${intervention.id}`}>
            {user.firstName} {user.lastName}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(intervention.id)}
              data-testid={`button-edit-${intervention.id}`}
            >
              <Edit className="h-3.5 w-3.5 mr-1" />
              Edit
            </Button>
          )}
          {onComplete && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onComplete(intervention.id)}
              data-testid={`button-complete-${intervention.id}`}
            >
              <CheckCircle className="h-3.5 w-3.5 mr-1" />
              Complete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
