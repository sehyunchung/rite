import * as React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Upload } from 'lucide-react-native';
import { cn } from '../../utils';

// Note: react-dropzone is not compatible with React Native
// This is a placeholder implementation that provides the same API surface
// For full functionality, you would need to integrate with react-native-document-picker
// or expo-document-picker

interface DropzoneContextType {
  src?: File[];
  accept?: Record<string, string[]>;
  maxSize?: number;
  minSize?: number;
  maxFiles?: number;
}

const DropzoneContext = React.createContext<DropzoneContextType | undefined>(undefined);

export interface DropzoneProps {
  src?: File[];
  className?: string;
  onDrop?: (acceptedFiles: File[]) => void;
  children?: React.ReactNode;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number;
  minSize?: number;
  disabled?: boolean;
}

export function Dropzone({
  src,
  className,
  onDrop,
  children,
  accept,
  maxFiles = 1,
  maxSize,
  minSize,
  disabled,
}: DropzoneProps) {
  const handlePress = () => {
    // TODO: Implement file picker
    console.warn('File picking not implemented in React Native');
  };

  return (
    <DropzoneContext.Provider value={{ src, accept, maxSize, minSize, maxFiles }}>
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        className={cn(
          'border border-gray-300 dark:border-gray-700 rounded-md p-8 items-center justify-center',
          disabled && 'opacity-50',
          className
        )}
      >
        {children}
      </Pressable>
    </DropzoneContext.Provider>
  );
}

function useDropzoneContext() {
  const context = React.useContext(DropzoneContext);
  if (!context) {
    throw new Error('useDropzoneContext must be used within a Dropzone');
  }
  return context;
}

export interface DropzoneContentProps {
  children?: React.ReactNode;
  className?: string;
}

export function DropzoneContent({ children, className }: DropzoneContentProps) {
  const { src } = useDropzoneContext();

  if (!src || src.length === 0) {
    return null;
  }

  if (children) {
    return <>{children}</>;
  }

  return (
    <View className={cn('items-center justify-center', className)}>
      <View className="w-8 h-8 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800">
        <Upload size={16} color="#6B7280" />
      </View>
      <Text className="my-2 text-sm font-medium text-gray-900 dark:text-white">
        {src.length > 1 ? `${src.length} files selected` : src[0]?.name || 'File selected'}
      </Text>
      <Text className="text-xs text-gray-600 dark:text-gray-400">
        Tap to replace
      </Text>
    </View>
  );
}

export interface DropzoneEmptyStateProps {
  children?: React.ReactNode;
  className?: string;
}

export function DropzoneEmptyState({ children, className }: DropzoneEmptyStateProps) {
  const { src, maxFiles } = useDropzoneContext();

  if (src && src.length > 0) {
    return null;
  }

  if (children) {
    return <>{children}</>;
  }

  return (
    <View className={cn('items-center justify-center', className)}>
      <View className="w-8 h-8 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800">
        <Upload size={16} color="#6B7280" />
      </View>
      <Text className="my-2 text-sm font-medium text-gray-900 dark:text-white">
        Upload {maxFiles === 1 ? 'a file' : 'files'}
      </Text>
      <Text className="text-xs text-gray-600 dark:text-gray-400">
        Tap to select
      </Text>
    </View>
  );
}