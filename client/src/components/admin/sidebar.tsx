import React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Building,
  DoorOpen,
  BookmarkCheck,
  CreditCard,
  Users,
  LogOut
} from "lucide-react";

export default function AdminSidebar() {
  const [location] = useLocation();
  const { logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const menuItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="mr-3 h-5 w-5" />,
      path: "/admin/dashboard",
    },
    {
      title: "Manage PGs",
      icon: <Building className="mr-3 h-5 w-5" />,
      path: "/admin/pgs",
    },
    {
      title: "Manage Rooms",
      icon: <DoorOpen className="mr-3 h-5 w-5" />,
      path: "/admin/rooms",
    },
    {
      title: "Bookings",
      icon: <BookmarkCheck className="mr-3 h-5 w-5" />,
      path: "/admin/bookings",
    },
    {
      title: "Payments",
      icon: <CreditCard className="mr-3 h-5 w-5" />,
      path: "/admin/payments",
    },
    {
      title: "Customers",
      icon: <Users className="mr-3 h-5 w-5" />,
      path: "/admin/customers",
    },
  ];

  return (
    <aside className="py-6 px-2 sm:px-6 lg:py-0 lg:px-0">
      <nav className="space-y-1">
        {menuItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <a
              className={cn(
                "group rounded-md px-3 py-2 flex items-center text-sm font-medium",
                location === item.path
                  ? "bg-gray-50 text-primary"
                  : "text-gray-900 hover:bg-gray-50 hover:text-primary"
              )}
            >
              {React.cloneElement(item.icon, {
                className: cn(
                  item.icon.props.className,
                  location === item.path
                    ? "text-primary"
                    : "text-gray-400 group-hover:text-primary"
                ),
              })}
              <span className="truncate">{item.title}</span>
            </a>
          </Link>
        ))}
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-900 hover:bg-gray-50 hover:text-primary rounded-md px-3 py-2 text-sm font-medium"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="mr-3 h-5 w-5 text-gray-400" />
          <span className="truncate">Sign out</span>
        </Button>
      </nav>
    </aside>
  );
}
