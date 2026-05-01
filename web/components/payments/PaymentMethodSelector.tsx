'use client';

import React from 'react';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import styles from './PaymentMethodSelector.module.css';

interface PaymentMethodSelectorProps {
  bookingId: string;
  token: string | null;
  onMethodSelected: (method: string) => void;
  onError?: (error: string) => void;
}

/**
 * Component to display and select payment methods
 * Shows all available payment options with fees and processing times
 */
export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  bookingId,
  token,
  onMethodSelected,
  onError,
}) => {
  const { methods, amount, loading, error } = usePaymentMethods(bookingId, token);
  const [selectedMethod, setSelectedMethod] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  const formatAmount = (pesewas: number) => {
    const ghs = (pesewas / 100).toFixed(2);
    return `GH₵${ghs}`;
  };

  const handleMethodClick = (methodType: string) => {
    setSelectedMethod(methodType);
    onMethodSelected(methodType);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading payment methods...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2>Select Payment Method</h2>
      <p className={styles.totalAmount}>
        Total Amount: <strong>{formatAmount(amount)}</strong>
      </p>

      <div className={styles.methodsGrid}>
        {methods.map((method) => (
          <div
            key={method.type}
            className={`${styles.methodCard} ${
              selectedMethod === method.type ? styles.selected : ''
            } ${!method.available ? styles.disabled : ''}`}
            onClick={() => method.available && handleMethodClick(method.type)}
            role="button"
            tabIndex={method.available ? 0 : -1}
          >
            <div className={styles.methodHeader}>
              <h3>{method.label}</h3>
              {!method.available && <span className={styles.comingSoon}>Coming Soon</span>}
            </div>

            <p className={styles.description}>{method.description}</p>

            <div className={styles.details}>
              <div className={styles.detailItem}>
                <span className={styles.label}>Processing Fee:</span>
                <span className={styles.value}>{formatAmount(method.fees)}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>Processing Time:</span>
                <span className={styles.value}>{method.processingTime}</span>
              </div>
            </div>

            {selectedMethod === method.type && (
              <div className={styles.checkmark}>✓</div>
            )}
          </div>
        ))}
      </div>

      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
};

export default PaymentMethodSelector;
