import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mail, 
  Shield, 
  ArrowLeft, 
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuthorityAuth } from '@/context/AuthorityAuthContext';
import { toast } from 'sonner';
import LogoImage from '@/assets/JanSamadhan.png';
import Logo from '@/components/ui/logo';

const AuthorityLogin = () => {
  const navigate = useNavigate();
  const { user, sendOTP, verifyOTP, loading } = useAuthorityAuth();
  
  const [step, setStep] = useState(1); // 1: Email, 2: OTP
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    if (user) {
      // Redirect logged-in users to dashboard and replace history so back button won't go to login
      navigate('/authority/dashboard', { replace: true });
    }
  }, [user]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await sendOTP(email);
      
      if (response.success) {
        setOtpSent(true);
        setStep(2);
        toast.success('OTP sent to your email address');
      } else {
        setError(response.error || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      setError('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await verifyOTP(email, otp);
      
      if (response.success) {
        toast.success('Login successful!');
        navigate('/authority/dashboard');
      } else {
        setError(response.error || 'Invalid OTP');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setError('Failed to verify OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await sendOTP(email);
      
      if (response.success) {
        toast.success('OTP resent to your email address');
      } else {
        setError(response.error || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep(1);
    setOtp('');
    setError('');
    setOtpSent(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Logo link={LogoImage} alt="JanSamadhan" className="w-48 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Authority Portal</h1>
          <p className="text-gray-600">Access the complaint management system</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              Authority Login
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {otpSent && (
              <Alert className="mb-4 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  OTP sent to {email}
                </AlertDescription>
              </Alert>
            )}

            {step === 1 ? (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your official email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    'Send OTP'
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleOTPSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="otp" className="text-sm font-medium text-gray-700">
                    Enter OTP
                  </Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="text-center text-lg tracking-widest"
                    maxLength={6}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Check your email for the verification code
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBackToEmail}
                    className="flex-1"
                    disabled={isLoading}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isLoading || otp.length !== 6}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify OTP'
                    )}
                  </Button>
                </div>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    onClick={handleResendOTP}
                    disabled={isLoading}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Didn't receive OTP? Resend
                  </Button>
                </div>
              </form>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Not an authority member?{' '}
                <Link 
                  to="/citizen/login" 
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Citizen Login
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <Link 
                to="/" 
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1"
              >
                <ArrowLeft className="h-3 w-3" />
                Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Secure access to Jan Samadhan Authority Portal
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthorityLogin;