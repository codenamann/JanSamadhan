import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useNavigate } from 'react-router-dom';
import { citizenOTPApi, citizenSubmitName, citizenVerifyOTP } from '@/lib/apiCitizen';
import { useCitizenAuth } from '@/context/CitizenAuthContext';

const CitizenLogin = () => {
  const navigate = useNavigate();
  const { user, login } = useCitizenAuth();
  const [step, setStep] = useState(1); // 1 = phone entry, 2 = otp entry
  const [citizen, setCitizen] = useState({});
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (user) {
      // Redirect logged-in users to dashboard and replace history so back button won't go to login
      navigate('/citizen/dashboard', { replace: true });
    }
  }, [user]);

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await citizenOTPApi(citizen.phone)
      console.log("Sending OTP to", citizen.phone);
      console.log(res);
      if (res.success) {
        setStep(2); // only move to step 2 if OTP sent successfully
      } else {
        console.error("Failed to send OTP:", res.message);
      }
      setStep(2);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      console.log("Verifying OTP for", citizen.phone, "with", otp);
      const res = await citizenVerifyOTP(citizen.phone, otp);
      setOtp('');
      if(res.success){
        // Extract user data from token or response
        if(res.new){
          setStep(3);
          console.log(citizen);
        }else{
          console.log(res.token);
          const userData = {
            id: res.user?.id,
            name: res.user?.name,
            phone: res.user.phone,
            role: res.user?.role
          };
          console.log(userData);
          login(userData, res.token);
          navigate('/citizen/dashboard');
        }
      }
    } catch (err) {
      console.error(err);
    } finally{
      setLoading(false);
    }
  };
  const handleNameSubmit = async (e) => {
    e.preventDefault();
    try{
      console.log(citizen);
      const res = await citizenSubmitName(citizen.phone, citizen.name);
      console.log("Submitting name", citizen.phone, "with", citizen.name);
      const userData = {
        id: res.user?.id,
        name: res.user?.name,
        phone: res.user.phone,
        role: res.user?.role
      };
      console.log(userData);
      login(userData, res.token);
      navigate('/citizen/dashboard');
    }catch(err){
      console.error(err);
    }

  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 space-y-4">
          <div>
            <h1 className="text-xl font-bold">Citizen Login</h1>
            <p className="text-sm text-muted-foreground">
              Enter your phone number and OTP to continue.
            </p>
          </div>

          {step === 1 && (
            <form onSubmit={handlePhoneSubmit} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={citizen.phone}
                  onChange={(e) => setCitizen({...citizen, phone:e.target.value})}
                  required
                />
              </div>
              <Button type="submit" loading={loading} className="w-full">Send OTP</Button>
              <div className="text-sm font-medium text-center">
                <Link to="/" className="text-muted-foreground hover:underline hover:text-primary">
                  ← Return to Home
                </Link>
              </div>
            </form>
            
          )}

          {step === 2 && (
            <form onSubmit={handleOtpSubmit} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">Verify OTP</Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep(1)}
              >
                Change Phone
              </Button>
            </form>
          )}
          {step == 3 && (
            <form onSubmit={handleNameSubmit} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="name">Enter Your Name</Label>
              <Input
                id="name"
                type="text"
                value={citizen.name}
                onChange={(e) => setCitizen({ ...citizen, name:e.target.value})}
                required
              />
            </div>
            <Button type="submit" className="w-full">Activate Account</Button>
          </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CitizenLogin;
