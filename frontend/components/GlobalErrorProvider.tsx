"use client";
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import ErrorToast from './ErrorToast';

interface ErrorContextType {
  showError: (message: string) => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const useError = (): ErrorContextType => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

interface ErrorProviderProps {
  children: ReactNode;
}

export const GlobalErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [errors, setErrors] = useState<{id: number; message: string}[]>([]);
  
  const showError = useCallback((message: string) => {
    setErrors(prevErrors => [...prevErrors, {
      id: Date.now(),
      message
    }]);
  }, []);

  const removeError = useCallback((id: number) => {
    setErrors(prevErrors => prevErrors.filter(error => error.id !== id));
  }, []);

  return (
    <ErrorContext.Provider value={{ showError }}>
      {children}
      {errors.map((error) => (
        <ErrorToast
          key={error.id}
          message={error.message}
          onClose={() => removeError(error.id)}
        />
      ))}
    </ErrorContext.Provider>
  );
};

export default GlobalErrorProvider;