'use client';

import React, { useState } from 'react';
import { useMobileMoney } from '@/hooks/usePaymentMethods';
import styles from './MobileMoneyForm.module.css';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface MobileMoneyFormProps {
  bookingId: string;
  token: string | null;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const PROVIDERS = [
  { id: 'mtn', name: 'MTN MoMo', icon: 'M' },
  { id: 'vodafone', name: 'Vodafone Cash', icon: 'V' },
  { id: 'airteltigo', name: 'AirtelTigo Money', icon: 'A' },
];

export const MobileMoneyForm: React.FC<MobileMoneyFormProps> = ({
  bookingId,
  token,
  onSuccess,
  onError,
}) => {
  const { initiate, submitOTP, loading, error, status } = useMobileMoney(token);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [saveWallet, setSaveWallet] = useState(false);

  const handleInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvider || !phoneNumber) return;

    try {
      await initiate({
        bookingId,
        phoneNumber,
        provider: selectedProvider,
        saveWallet,
      });
    } catch (err) {
      if (onError) onError(err instanceof Error ? err.message : 'Failed to initiate MoMo');
    }
  };

  const handleSubmitOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;

    try {
      const data = await submitOTP(otp);
      if (data.status === 'success' && onSuccess) {
        onSuccess();
      }
    } catch (err) {
      if (onError) onError(err instanceof Error ? err.message : 'Failed to verify OTP');
    }
  };

  if (status === 'success') {
    return (
      <div className={styles.container}>
        <div className={styles.success}>
          <CheckCircle2 size={24} className="mb-2" />
          <p>Payment initiated successfully! Please check your phone for the confirmation prompt.</p>
        </div>
      </div>
    );
  }

  if (status === 'otp_required') {
    return (
      <div className={styles.container}>
        <h2>Enter OTP</h2>
        <p className={styles.description}>
          A 6-digit code has been sent to your mobile phone. Please enter it below to confirm.
        </p>
        <form onSubmit={handleSubmitOtp}>
          <div className={styles.inputGroup}>
            <input
              type="text"
              className={styles.otpInput}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="000000"
              maxLength={6}
              autoFocus
            />
          </div>
          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? <Loader2 className="animate-spin inline mr-2" size={16} /> : null}
            Verify OTP
          </button>
        </form>
        {error && <div className={styles.error}>{error}</div>}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2>Mobile Money Payment</h2>
      <p className={styles.description}>
        Select your provider and enter your phone number to receive a payment prompt on your phone.
      </p>

      <div className={styles.providerGrid}>
        {PROVIDERS.map((provider) => (
          <div
            key={provider.id}
            className={`${styles.providerCard} ${styles[provider.id]} ${
              selectedProvider === provider.id ? styles.selected : ''
            }`}
            onClick={() => setSelectedProvider(provider.id)}
          >
            <div className={styles.providerIcon}>{provider.icon}</div>
            <span className={styles.providerName}>{provider.name}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleInitiate}>
        <div className={styles.inputGroup}>
          <label htmlFor="phoneNumber">Phone Number</label>
          <input
            id="phoneNumber"
            type="tel"
            className={styles.phoneInput}
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="055 000 0000"
            required
          />
        </div>

        <div className="flex items-center gap-2 mb-4">
          <input
            id="saveWallet"
            type="checkbox"
            checked={saveWallet}
            onChange={(e) => setSaveWallet(e.target.checked)}
          />
          <label htmlFor="saveWallet" className="text-xs text-gray-600">
            Save this number for future payments
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || !selectedProvider || !phoneNumber}
          className={styles.submitButton}
        >
          {loading ? <Loader2 className="animate-spin inline mr-2" size={16} /> : null}
          Send Payment Prompt
        </button>
      </form>
      {error && <div className={styles.error}>{error}</div>}
      {status === 'pending' && (
        <div className={styles.success}>
          Prompt sent! Please check your phone to authorize GH₵5.00.
        </div>
      )}
    </div>
  );
};

export default MobileMoneyForm;
