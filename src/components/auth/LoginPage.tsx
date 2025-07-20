import { SignIn } from '@clerk/clerk-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Rite</h1>
          <p className="mt-2 text-gray-600">Organizer Dashboard</p>
        </div>
        
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>
              Sign in to manage your DJ events and submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignIn 
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none border-none bg-transparent",
                }
              }}
              signUpUrl="/signup"
              afterSignInUrl="/dashboard"
            />
          </CardContent>
        </Card>
        
        <div className="text-center text-sm text-gray-600">
          <p>New organizer? <a href="/signup" className="text-blue-600 hover:text-blue-800">Create an account</a></p>
        </div>
      </div>
    </div>
  );
}