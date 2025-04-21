import { cn } from "@/lib/utils";

type RoomStatus = 'Available' | 'Pending' | 'Booked';
type BookingStatus = 'Pending' | 'Confirmed' | 'Cancelled';
type PaymentStatus = 'Pending' | 'Verified';

interface StatusBadgeProps {
  status: RoomStatus | BookingStatus | PaymentStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  let badgeStyles = '';
  let dotColor = '';
  let statusText = status;

  switch (status) {
    case 'Available':
      badgeStyles = 'bg-green-100 text-green-800';
      dotColor = 'bg-green-500';
      break;
    case 'Pending':
      badgeStyles = 'bg-yellow-100 text-yellow-800';
      dotColor = 'bg-yellow-500';
      break;
    case 'Booked':
    case 'Confirmed':
      badgeStyles = 'bg-green-100 text-green-800';
      dotColor = 'bg-green-500';
      break;
    case 'Cancelled':
      badgeStyles = 'bg-red-100 text-red-800';
      dotColor = 'bg-red-500';
      break;
    case 'Verified':
      badgeStyles = 'bg-green-100 text-green-800';
      dotColor = 'bg-green-500';
      break;
    default:
      badgeStyles = 'bg-gray-100 text-gray-800';
      dotColor = 'bg-gray-500';
  }

  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", badgeStyles, className)}>
      <span className={cn("w-2 h-2 mr-1 rounded-full", dotColor)}></span>
      {statusText}
    </span>
  );
}
