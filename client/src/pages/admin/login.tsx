import { useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, LogIn, Lock } from "lucide-react";
import { Link } from "wouter";

// Admin Login Form Schema
const adminLoginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
  rememberMe: z.boolean().optional(),
});

type AdminLoginFormValues = z.infer<typeof adminLoginFormSchema>;

export default function AdminLogin() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const { user, isLoading } = useAuth();

  // Redirect if user is already logged in and is an admin
  useEffect(() => {
    if (user && user.role === 'admin') {
      navigate("/admin/dashboard");
    }
  }, [user, navigate]);

  const form = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginFormSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const adminLoginMutation = useMutation({
    mutationFn: async (credentials: AdminLoginFormValues) => {
      const res = await apiRequest("POST", "/api/admin/login", {
        email: credentials.email,
        password: credentials.password,
      });
      return await res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.name}!`,
      });
      navigate("/admin/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: AdminLoginFormValues) {
    adminLoginMutation.mutate(values);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="text-center">
            <Link href="/">
              <span className="text-2xl font-bold text-primary cursor-pointer">PG Rental</span>
            </Link>
          </div>
        </div>
      </div>
      
      <main className="flex-grow flex items-center justify-center py-12">
        <div className="max-w-md w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Admin Login
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to the admin dashboard
            </p>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email address</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="admin@example.com" 
                            type="email" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="••••••••" 
                            type="password" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm cursor-pointer">Remember me</FormLabel>
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={adminLoginMutation.isPending}
                  >
                    {adminLoginMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <LogIn className="mr-2 h-4 w-4" />
                    )}
                    Sign in
                  </Button>
                </form>
              </Form>
              
              <div className="mt-6 flex items-center justify-center">
                <Lock className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-xs text-gray-500">This area is restricted to administrators only</span>
              </div>
              
              <div className="mt-4 text-center">
                <Link href="/">
                  <a className="text-sm font-medium text-primary hover:text-primary-700">
                    Return to homepage
                  </a>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <footer className="py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} PG Rental. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
