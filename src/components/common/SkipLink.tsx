import React from 'react';

export const SkipLink: React.FC = () => {
  return (
    <a
      href="#main-content"
      id="skip-link"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg focus:outline-none transition-all"
      style={{
        backgroundColor: 'var(--theme-primary)',
        color: '#FFFFFF',
        fontWeight: 600,
      }}
    >
      Pular para o conteúdo principal
    </a>
  );
};
