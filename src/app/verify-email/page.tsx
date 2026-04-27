'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { applyActionCode, auth, safeUpdateDoc } from '@/firebase'
import { doc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { sendEmailVerification } from 'firebase/auth'
import { RefreshCw, CheckCircle2, AlertCircle, Mail, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'already_verified' | 'expired' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const verifyEmail = async () => {
      const oobCode = searchParams.get('oobCode') ?? searchParams.get('code')

      if (!oobCode) {
        setStatus('error')
        setErrorMessage('Invalid verification link. Please request a new one from your profile.')
        return
      }

      try {
        await applyActionCode(auth, oobCode)
        await auth.currentUser?.reload()
        await auth.currentUser?.getIdToken(true)
        
        if (auth.currentUser) {
          await safeUpdateDoc(
            doc(db, 'users', auth.currentUser.uid),
            { emailVerified: true, updatedAt: serverTimestamp() }
          )
        }
        setStatus('success')
      } catch (error: any) {
        if (error.code === 'auth/invalid-action-code') {
          await auth.currentUser?.reload()
          if (auth.currentUser?.emailVerified) {
            setStatus('already_verified')
          } else {
            setStatus('expired')
          }
        } else if (error.code === 'auth/expired-action-code') {
          setStatus('expired')
        } else if (error.code === 'auth/user-disabled') {
          setStatus('error')
          setErrorMessage('This account has been disabled.')
        } else {
          setStatus('error')
          setErrorMessage('Verification failed. Please try again or request a new link.')
          console.error('[SpendXP] Email verification error:', error)
        }
      }
    }

    verifyEmail()
  }, [searchParams])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4 p-4">
        <RefreshCw className="h-10 w-10 animate-spin text-primary" />
        <p className="text-slate-500 font-bold">Verifying your email...</p>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-8 text-center animate-in fade-in zoom-in duration-500">
        <div className="h-20 w-20 bg-[#C8E8D8] text-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Email verified!</h1>
        <p className="text-slate-500 font-medium max-w-sm mx-auto mb-8">
          Your SpendXP account is fully verified. You now have access to all features.
        </p>
        <Button onClick={() => router.push('/dashboard')} className="h-14 px-10 text-lg font-black rounded-2xl shadow-xl shadow-emerald-100" suppressHydrationWarning>
          Go to SpendXP <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    )
  }

  if (status === 'already_verified') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-8 text-center">
        <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-4" />
        <p className="text-lg font-bold text-slate-900 mb-6">Your email is already verified.</p>
        <Button variant="outline" onClick={() => router.push('/dashboard')} className="h-12 px-8 font-black border-2" suppressHydrationWarning>
          Go to dashboard
        </Button>
      </div>
    )
  }

  if (status === 'expired') {
    return <ExpiredLinkUI />
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-8 text-center gap-4">
      <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
      <p className="text-lg font-bold text-rose-600">{errorMessage || 'Something went wrong.'}</p>
      <Button variant="ghost" onClick={() => router.push('/profile')} className="font-bold underline" suppressHydrationWarning>
        Back to profile
      </Button>
    </div>
  )
}

function ExpiredLinkUI() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown(c => c - 1), 1000)
    }
    return () => clearInterval(timer)
  }, [cooldown])

  const handleResend = async () => {
    if (!auth.currentUser || cooldown > 0) return
    setLoading(true)
    try {
      await sendEmailVerification(auth.currentUser)
      setSent(true)
      setCooldown(60)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="h-20 w-20 bg-[#C8E8D8] text-[#2E7D5A] rounded-full flex items-center justify-center mx-auto mb-6">
        <Mail className="h-10 w-10" />
      </div>
      <h1 className="text-3xl font-black text-slate-900 mb-2">Link Expired</h1>
      <p className="text-slate-500 font-medium max-w-sm mx-auto mb-8">
        Email verification links expire after 24 hours for security.
      </p>
      
      {auth.currentUser ? (
        <div className="space-y-4">
          <Button 
            onClick={handleResend} 
            disabled={loading || cooldown > 0} 
            className="h-14 px-10 text-lg font-black rounded-2xl shadow-xl"
            suppressHydrationWarning
          >
            {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : sent ? `Resend in ${cooldown}s` : 'Send new link'}
          </Button>
          {sent && <p className="text-xs font-bold text-primary">Verification link resent! Check your inbox.</p>}
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm font-bold text-[#2E7D5A]">Sign in first, then resend from your profile.</p>
          <Button onClick={() => router.push('/login')} className="h-14 px-10 text-lg font-black rounded-2xl" suppressHydrationWarning>
            Sign in <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}