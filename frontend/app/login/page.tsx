import { Metadata } from 'next'
import { LoginForm } from '@/components/auth/LoginForm'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Login - Al-Hidaya',
  description: 'Login to your Al-Hidaya account',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass-morphism p-8 rounded-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-islamic-600 to-islamic-400 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Login to access your account
            </p>
          </div>
          
          <LoginForm />
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link 
                href="/register" 
                className="text-islamic-600 hover:text-islamic-500 font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}