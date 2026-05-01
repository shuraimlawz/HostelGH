import { useState, useEffect } from 'react';

interface PaymentMethod {
  type: 'CARD' | 'BANK_TRANSFER' | 'USSD' | 'MOBILE_MONEY';
  label: string;
  description: string;
  fees: number;
  processingTime: string;
  available: boolean;
}

interface UsePaymentMethodsReturn {
  methods: PaymentMethod[];
  amount: number;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to fetch available payment methods for a booking
 */
export const usePaymentMethods = (bookingId: string, token: string | null): UsePaymentMethodsReturn => {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId || !token) return;

    const fetchMethods = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/payments/methods/${bookingId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch payment methods');
        }

        const data = await response.json();
        setMethods(data.methods);
        setAmount(data.amount);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchMethods();
  }, [bookingId, token]);

  return { methods, amount, loading, error };
};

/**
 * Hook to initiate bank transfer payment
 */
export const useBankTransfer = (bookingId: string, token: string | null) => {
  const [bankDetails, setBankDetails] = useState<any>(null);
  const [referenceCode, setReferenceCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiate = async () => {
    if (!bookingId || !token) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/payments/bank/init/${bookingId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to initiate bank transfer');
      }

      const data = await response.json();
      setBankDetails(data.bank);
      setReferenceCode(data.referenceCode);

      return data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { bankDetails, referenceCode, loading, error, initiate };
};

/**
 * Hook to verify bank transfer
 */
export const useBankTransferVerify = (token: string | null) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verify = async (transferCode: string) => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/payments/bank/verify/${transferCode}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to verify bank transfer');
      }

      return await response.json();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { verify, loading, error };
};

/**
 * Hook to select payment method
 */
export const useSelectPaymentMethod = (token: string | null) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectMethod = async (
    paymentId: string,
    method: 'CARD' | 'BANK_TRANSFER' | 'USSD' | 'MOBILE_MONEY'
  ) => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/payments/method/select', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId,
          method,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to select payment method');
      }

      return await response.json();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { selectMethod, loading, error };
};
