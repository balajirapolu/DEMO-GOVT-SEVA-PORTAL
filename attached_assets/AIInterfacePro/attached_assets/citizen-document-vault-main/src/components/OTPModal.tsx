
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

interface OTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (otp: string) => Promise<void>;
  phoneNumber: string;
  purpose: string;
}

const OTPModal: React.FC<OTPModalProps> = ({ 
  isOpen, 
  onClose, 
  onVerify, 
  phoneNumber, 
  purpose 
}) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (isOpen && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [isOpen, countdown]);

  useEffect(() => {
    if (isOpen) {
      setOtp('');
      setCountdown(300);
      setCanResend(false);
    }
  }, [isOpen]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a 6-digit OTP.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await onVerify(otp);
      onClose();
      toast({
        title: "OTP Verified",
        description: "Your verification was successful."
      });
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "Invalid OTP. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setCountdown(300);
    setCanResend(false);
    toast({
      title: "OTP Resent",
      description: `A new OTP has been sent to ${phoneNumber}`
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>OTP Verification</DialogTitle>
          <DialogDescription>
            {purpose}. Enter the 6-digit OTP sent to{' '}
            <span className="font-medium">{phoneNumber}</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp">Enter OTP</Label>
            <Input
              id="otp"
              type="text"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="text-center text-lg tracking-widest"
              maxLength={6}
            />
          </div>
          
          <div className="text-center">
            {countdown > 0 ? (
              <p className="text-sm text-gray-600">
                OTP expires in: <span className="font-medium text-orange-600">{formatTime(countdown)}</span>
              </p>
            ) : (
              <p className="text-sm text-red-600">OTP has expired</p>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <Button
            variant="outline"
            onClick={canResend ? handleResend : undefined}
            disabled={!canResend}
            className="w-full sm:w-auto"
          >
            {canResend ? 'Resend OTP' : `Resend in ${formatTime(countdown)}`}
          </Button>
          <Button
            onClick={handleVerify}
            disabled={loading || otp.length !== 6}
            className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OTPModal;
