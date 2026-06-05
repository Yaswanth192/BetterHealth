import { AppointmentStatus } from '../../types';

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus;
}

const config: Record<AppointmentStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'badge-pending' },
  confirmed: { label: 'Confirmed', className: 'badge-confirmed' },
  rejected: { label: 'Rejected', className: 'badge-rejected' },
  completed: { label: 'Completed', className: 'badge-completed' },
  cancelled: { label: 'Cancelled', className: 'badge-cancelled' },
};

export function AppointmentStatusBadge({ status }: AppointmentStatusBadgeProps) {
  const { label, className } = config[status] || config.pending;
  return <span className={className}>{label}</span>;
}
