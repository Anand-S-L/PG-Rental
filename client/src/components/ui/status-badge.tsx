import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: "Available" | "Pending" | "Booked" | "Confirmed" | "Cancelled";
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variants = {
    Available: "bg-green-100 text-green-800 hover:bg-green-100",
    Pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    Booked: "bg-red-100 text-red-800 hover:bg-red-100",
    Confirmed: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    Cancelled: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "font-medium", 
        variants[status], 
        className
      )}
    >
      {status}
    </Badge>
  );
}