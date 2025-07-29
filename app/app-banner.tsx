'use client';
import { useAppStore } from '@/stores/app-store';
import React from 'react';

export default function AppBanner() {
  const { isBannerVisible, setIsBannerVisible } = useAppStore();
  if (!isBannerVisible) return null;

  return (
    <div className="hidden h-[4.6rem] w-full items-center justify-center gap-4 bg-card px-2 py-1 backdrop-blur-md md:flex">
      <div className="flex items-center gap-20 rounded-md bg-background px-4 py-4 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <h4 className="font-poppins text-xs font-bold text-accent">PHISHING WARNING: </h4>
          <p className="font-mono text-xs font-normal">
            please make sure you&apos;re visiting{' '}
            <span className="font-black">https://app.odx.so </span> - check the url carefully.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <svg
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="hidden animate-spin md:block"
          >
            <path
              d="M8.34959 9.70395C8.59957 9.2588 8.93787 8.91282 9.3645 8.66603C9.79113 8.41924 10.2508 8.29017 10.7435 8.27882C11.2363 8.26747 11.7052 8.38679 12.1504 8.63677C12.5991 8.88876 12.9451 9.22706 13.1883 9.65168C13.4351 10.0783 13.5642 10.538 13.5755 11.0307C13.5869 11.5235 13.4676 11.9924 13.2176 12.4376C12.9656 12.8863 12.6273 13.2323 12.2027 13.4755C11.776 13.7223 11.3164 13.8514 10.8236 13.8627C10.3345 13.8761 9.86552 13.7567 9.41677 13.5048C8.97162 13.2548 8.62564 12.9165 8.37885 12.4898C8.13206 12.0632 8.00299 11.6035 7.99164 11.1108C7.97828 10.6216 8.0976 10.1527 8.34959 9.70395ZM14.5939 12.5092L17.868 14.3478L17.2692 15.414L13.9952 13.5755L14.5939 12.5092ZM11.281 15.1041L12.4583 14.7736L13.4782 18.4062L12.301 18.7367L11.281 15.1041ZM8.27888 14.2824L9.3451 14.8811L7.50656 18.1551L6.44034 17.5564L8.27888 14.2824ZM3.11761 12.5882L6.75024 11.5682L7.08078 12.7455L3.44816 13.7654L3.11761 12.5882ZM4.29792 6.72752L7.57197 8.56606L6.97323 9.63228L3.69919 7.79374L4.29792 6.72752ZM8.08892 3.73534L9.26616 3.40479L10.2861 7.03742L9.10889 7.36796L8.08892 3.73534ZM14.0606 3.98637L15.1268 4.5851L13.2883 7.85915L12.2221 7.26041L14.0606 3.98637ZM14.4864 9.39607L18.119 8.3761L18.4495 9.55334L14.8169 10.5733L14.4864 9.39607Z"
              fill="#FF7272"
            />
          </svg>
        </div>
      </div>

      <button
        onClick={() => setIsBannerVisible(false)}
        className="text-muted-foreground hover:text-foreground"
        aria-label="Dismiss banner"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12.8536 2.85355C13.0488 2.65829 13.0488 2.34171 12.8536 2.14645C12.6583 1.95118 12.3417 1.95118 12.1464 2.14645L8 6.29289L3.85355 2.14645C3.65829 1.95118 3.34171 1.95118 3.14645 2.14645C2.95118 2.34171 2.95118 2.65829 3.14645 2.85355L7.29289 7L3.14645 11.1464C2.95118 11.3417 2.95118 11.6583 3.14645 11.8536C3.34171 12.0488 3.65829 12.0488 3.85355 11.8536L8 7.70711L12.1464 11.8536C12.3417 12.0488 12.6583 12.0488 12.8536 11.8536C13.0488 11.6583 13.0488 11.3417 12.8536 11.1464L8.70711 7L12.8536 2.85355Z"
            fill="currentColor"
          />
        </svg>
      </button>
    </div>
  );
}
