import { createContext, useContext, useState, ReactNode } from 'react';

interface QuoteTimerContextType {
  timeUntilNextQuote: number;
  setTimeUntilNextQuote: (time: number | ((prev: number) => number)) => void;
  isQuoteLoading: boolean;
  setIsQuoteLoading: (loading: boolean) => void;
}

const QuoteTimerContext = createContext<QuoteTimerContextType | undefined>(undefined);

export function QuoteTimerProvider({ children }: { children: ReactNode }) {
  const [timeUntilNextQuote, setTimeUntilNextQuote] = useState(10);
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);

  return (
    <QuoteTimerContext.Provider
      value={{
        timeUntilNextQuote,
        setTimeUntilNextQuote,
        isQuoteLoading,
        setIsQuoteLoading,
      }}
    >
      {children}
    </QuoteTimerContext.Provider>
  );
}

export function useQuoteTimer() {
  const context = useContext(QuoteTimerContext);
  if (context === undefined) {
    throw new Error('useQuoteTimer must be used within a QuoteTimerProvider');
  }
  return context;
}
