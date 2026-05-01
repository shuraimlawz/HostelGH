'use client';

import React from 'react';
import { useBankTransfer } from '@/hooks/usePaymentMethods';
import styles from './BankTransferForm.module.css';

interface BankTransferFormProps {
  bookingId: string;
  token: string | null;
  onSuccess?: (bankDetails: any) => void;
  onError?: (error: string) => void;
}

/**
 * Component for bank transfer payment
 * Displays bank account details and reference code for transfer
 */
export const BankTransferForm: React.FC<BankTransferFormProps> = ({
  bookingId,
  token,
  onSuccess,
  onError,
}) => {
  const { bankDetails, referenceCode, loading, error, initiate } = useBankTransfer(
    bookingId,
    token
  );
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  const handleInitiate = async () => {
    try {
      const data = await initiate();
      if (onSuccess) {
        onSuccess(data);
      }
    } catch (err) {
      // Error handled by hook
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!bankDetails || !referenceCode) {
    return (
      <div className={styles.container}>
        <h2>Bank Transfer Payment</h2>
        <p className={styles.description}>
          Transfer funds directly to our bank account. This is the fastest way to pay in Ghana.
        </p>
        <button
          onClick={handleInitiate}
          disabled={loading}
          className={styles.initiateButton}
        >
          {loading ? 'Generating Bank Details...' : 'Generate Bank Transfer Details'}
        </button>
        {error && <div className={styles.error}>{error}</div>}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2>Bank Transfer Details</h2>

      <div className={styles.card}>
        <div className={styles.section}>
          <h3>Transfer to Account</h3>
          <div className={styles.detailRow}>
            <span className={styles.label}>Bank Name:</span>
            <span className={styles.value}>{bankDetails.name}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.label}>Account Number:</span>
            <div className={styles.copyableValue}>
              <span className={styles.value}>{bankDetails.accountNumber}</span>
              <button
                className={styles.copyButton}
                onClick={() => copyToClipboard(bankDetails.accountNumber)}
                title="Copy account number"
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.label}>Account Holder:</span>
            <span className={styles.value}>{bankDetails.accountName}</span>
          </div>
        </div>

        <div className={styles.section}>
          <h3>Reference Code</h3>
          <p className={styles.info}>
            Use this reference code in your bank transfer description to link the payment to your
            booking.
          </p>
          <div className={styles.copyableValue}>
            <code className={styles.referenceCode}>{referenceCode}</code>
            <button
              className={styles.copyButton}
              onClick={() => copyToClipboard(referenceCode)}
              title="Copy reference code"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <div className={styles.section}>
          <h3>Instructions</h3>
          <ol className={styles.instructions}>
            <li>Open your bank app or visit your bank's website</li>
            <li>Navigate to "Send Money" or "Transfer"</li>
            <li>Enter the account number and bank name above</li>
            <li>Enter the exact amount shown below</li>
            <li>In the description/memo field, paste the reference code</li>
            <li>Confirm and complete the transfer</li>
            <li>Your booking will be confirmed within 1-5 minutes</li>
          </ol>
        </div>

        <div className={styles.warningBox}>
          <strong>⚠️ Important:</strong> Make sure to use the exact amount and include the
          reference code in the transfer description so we can match your payment.
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
};

export default BankTransferForm;
