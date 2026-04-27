'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Eye, EyeOff, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface SecurityQuestion {
  question: string;
  answer: string;
}

function PasswordResetContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [token, setToken] = useState('');
  const [resetId, setResetId] = useState('');
  const [securityQuestions, setSecurityQuestions] = useState<SecurityQuestion[]>([
    { question: '', answer: '' }
  ]);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState<'validating' | 'questions' | 'reset' | 'success'>('validating');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const urlToken = searchParams.get('token');
    const urlResetId = searchParams.get('resetId');
    
    if (!urlToken || !urlResetId) {
      setError('Invalid password reset link');
      return;
    }

    setToken(urlToken);
    setResetId(urlResetId);
    validateToken(urlToken, urlResetId);
  }, [searchParams]);

  const validateToken = async (token: string, resetId: string) => {
    try {
      const response = await fetch(`/api/auth/reset-password?token=${token}&resetId=${resetId}`);
      const data = await response.json();

      if (response.ok && data.valid) {
        setSecurityQuestions(data.securityQuestions.map((q: string) => ({ question: q, answer: '' })));
        setEmail(data.email);
        setStep('questions');
      } else {
        setError(data.error || 'Invalid reset token');
      }
    } catch (err) {
      setError('Failed to validate reset token');
    }
  };

  const handleAnswerChange = (index: number, answer: string) => {
    const newQuestions = [...securityQuestions];
    newQuestions[index].answer = answer;
    setSecurityQuestions(newQuestions);
  };

  const validateAnswers = (): boolean => {
    for (const sq of securityQuestions) {
      if (!sq.answer || sq.answer.trim() === '') {
        setError('All security questions must be answered');
        return false;
      }
    }
    return true;
  };

  const validatePassword = (): boolean => {
    if (!newPassword || !confirmPassword) {
      setError('Both password fields are required');
      return false;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    if (!/[A-Z]/.test(newPassword)) {
      setError('Password must contain at least one uppercase letter');
      return false;
    }

    if (!/[a-z]/.test(newPassword)) {
      setError('Password must contain at least one lowercase letter');
      return false;
    }

    if (!/\d/.test(newPassword)) {
      setError('Password must contain at least one number');
      return false;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
      setError('Password must contain at least one special character');
      return false;
    }

    return true;
  };

  const handleResetPassword = async () => {
    if (!validateAnswers() || !validatePassword()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/auth/reset-password?token=${token}&resetId=${resetId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          securityAnswers: securityQuestions.map(sq => sq.answer),
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        setStep('success');
        // Redirect to login after 5 seconds
        setTimeout(() => {
          router.push('/login');
        }, 5000);
      } else {
        setError(data.error || 'Password reset failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'validating') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Lock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Validating Reset Link</h2>
              <p className="text-gray-600">Please wait while we verify your reset link...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Password Reset Successful</h2>
              <p className="text-gray-600 mb-4">{success}</p>
              <p className="text-sm text-gray-500">
                You will be redirected to the login page in a few seconds...
              </p>
              <Link href="/login">
                <Button className="mt-4">Go to Login</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Reset Your Password</CardTitle>
          <CardDescription>
            Verify your identity and create a new secure password
          </CardDescription>
          {email && (
            <p className="text-sm text-gray-600 mt-2">
              Account: {email}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="mb-6">
              <ShieldCheck className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            {/* Security Questions */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Answer Your Security Questions</h3>
              <div className="space-y-4">
                {securityQuestions.map((sq, index) => (
                  <div key={index}>
                    <Label>{sq.question}</Label>
                    <Input
                      value={sq.answer}
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                      placeholder="Enter your answer"
                      className="mt-1"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* New Password */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Create New Password</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full h-12 text-lg font-semibold"
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </Button>

            <div className="text-center text-sm">
              <Link href="/login" className="text-blue-600 hover:underline">
                Back to Login
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PasswordResetPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PasswordResetContent />
    </Suspense>
  );
}
