import React from 'react';

export default function GlobalStoreName({ className = '' }: { className?: string }) {
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || '蒂蒂安美髮沙龍';
  
  return (
    <span className={className}>
      {storeName}
    </span>
  );
}
