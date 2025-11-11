import React from 'react';

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white rounded-2xl shadow-md p-6 ${className}`}>
      {children}
    </div>
  );
}

type CardContentProps = {
  children: React.ReactNode;
};

export function CardContent({ children }: CardContentProps) {
  return <div className="text-gray-800">{children}</div>;
}