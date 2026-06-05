import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fullScreen?: boolean;
  label?: string;
}

const sizes = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

export function LoadingSpinner({ size = 'md', className = '', fullScreen = false, label }: LoadingSpinnerProps) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-primary-100 border-t-primary-600 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-primary-600 animate-pulse" />
            </div>
          </div>
        </div>
        {label && <p className="mt-4 text-neutral-500 font-medium">{label}</p>}
      </div>
    );
  }

  return (
    <Loader2
      className={`animate-spin text-primary-600 ${sizes[size]} ${className}`}
    />
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-primary-100" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-600 animate-spin" />
          <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-teal-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
        </div>
        <p className="text-neutral-400 text-sm animate-pulse">Loading...</p>
      </div>
    </div>
  );
}
