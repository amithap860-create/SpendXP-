'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Mail, Lock, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

interface SecurityQuestion {
  question: string;
  answer: string;
}

interface PasswordStrength {
  score: number;
  feedback: string[];
  color: string;
}

export default function SecureSignupForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    isParent: false
  });

  const [securityQuestions, setSecurityQuestions] = useState<SecurityQuestion[]>([
    { question: '', answer: '' },
    { question: '', answer: '' }
  ]);

  const [availableQuestions, setAvailableQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
    color: 'red'
  });

  // Fetch available security questions
  useEffect(() => {
    fetch('/api/auth/signup')
      .then(res => res.json())
      .then(data => {
        if (data.securityQuestions) {
          setAvailableQuestions(data.securityQuestions);
        }
      })
      .catch(err => console.error('Failed to fetch security questions:', err));
  }, []);

  // Password strength checker
  useEffect(() => {
    if (formData.password) {
      const strength = checkPasswordStrength(formData.password);
      setPasswordStrength(strength);
    }
  }, [formData.password]);

  const checkPasswordStrength = (password: string): PasswordStrength => {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) score++;
    else feedback.push('At least 8 characters');

    if (/[A-Z]/.test(password)) score++;
    else feedback.push('One uppercase letter');

    if (/[a-z]/.test(password)) score++;
    else feedback.push('One lowercase letter');

    if (/\d/.test(password)) score++;
    else feedback.push('One number');

    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;
    else feedback.push('One special character');

    const colors = ['red', 'orange', 'yellow', 'lime', 'green'];
    
    return {
      score,
      feedback,
      color: colors[score] || 'red'
    };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSecurityQuestionChange = (index: number, field: 'question' | 'answer', value: string) => {
    const newQuestions = [...securityQuestions];
    newQuestions[index][field] = value;
    setSecurityQuestions(newQuestions);
  };

  const validateForm = (): boolean => {
    if (!formData.email || !formData.password || !formData.displayName) {
      setError('All fields are required');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (passwordStrength.score < 4) {
      setError('Password does not meet security requirements');
      return false;
    }

    if (securityQuestions.length !== 2 || 
        !securityQuestions[0].question || !securityQuestions[0].answer ||
        !securityQuestions[1].question || !securityQuestions[1].answer) {
      setError('Both security questions and answers are required');
      return false;
    }

    if (securityQuestions[0].question === securityQuestions[1].question) {
      setError('Security questions must be different');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          displayName: formData.displayName,
          isParent: formData.isParent,
          securityQuestions: securityQuestions
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
      } else {
        setError(data.error || 'Signup failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Create Secure Account</CardTitle>
          <CardDescription>
            Join SpendXP with enterprise-grade security
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert>
                <ShieldCheck className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    name="displayName"
                    type="text"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleInputChange}
                      required
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
                  
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center space-x-2">
                        <div className={`h-2 flex-1 rounded bg-${passwordStrength.color}-500`} 
                             style={{ width: `${(passwordStrength.score / 5) * 100}%` }} />
                        <span className="text-xs text-gray-600">
                          {passwordStrength.score}/5 strength
                        </span>
                      </div>
                      {passwordStrength.feedback.length > 0 && (
                        <div className="mt-1 text-xs text-gray-600">
                          {passwordStrength.feedback.join(', ')}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
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

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isParent"
                    checked={formData.isParent}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, isParent: checked as boolean }))
                    }
                  />
                  <Label htmlFor="isParent">I am a parent/guardian</Label>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold">Security Questions</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    These will be used to verify your identity if you forget your password.
                  </p>
                </div>

                {securityQuestions.map((sq, index) => (
                  <div key={index} className="space-y-2">
                    <div>
                      <Label>Question {index + 1}</Label>
                      <select
                        value={sq.question}
                        onChange={(e) => handleSecurityQuestionChange(index, 'question', e.target.value)}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                        required
                      >
                        <option value="">Select a question</option>
                        {availableQuestions.map((question) => (
                          <option key={question} value={question}>
                            {question}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label>Answer {index + 1}</Label>
                      <Input
                        value={sq.answer}
                        onChange={(e) => handleSecurityQuestionChange(index, 'answer', e.target.value)}
                        placeholder="Enter your answer"
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-lg font-semibold"
            >
              {loading ? 'Creating Account...' : 'Create Secure Account'}
            </Button>

            <div className="text-center text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 hover:underline">
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
