import { SignIn } from '@clerk/clerk-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InstagramLogin } from './InstagramLogin';

export function LoginPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-12">
        <div className="text-center">
          <h1 className="text-6xl font-extralight mb-8">Ⓡ</h1>
          <p className="text-sm text-gray-600">Organizer login</p>
        </div>
        
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>
              Sign in to manage your DJ events and submissions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Instagram Login - Featured for DJ/Organizer audience */}
            <InstagramLogin />
            
            {/* Standard Clerk Login */}
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