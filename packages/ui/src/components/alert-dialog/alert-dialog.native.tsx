import * as React from 'react';
import { Modal, View, Text, Pressable } from 'react-native';
import { cn } from '../../utils';

interface AlertDialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AlertDialogContext = React.createContext<AlertDialogContextValue | null>(null);

function useAlertDialog() {
  const context = React.useContext(AlertDialogContext);
  if (!context) {
    throw new Error('AlertDialog components must be used within AlertDialog');
  }
  return context;
}

interface AlertDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function AlertDialog({ open: controlledOpen, onOpenChange, children }: AlertDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = onOpenChange ?? setUncontrolledOpen;
  
  return (
    <AlertDialogContext.Provider value={{ open, onOpenChange: setOpen }}>
      {children}
    </AlertDialogContext.Provider>
  );
}

interface AlertDialogTriggerProps {
  children: React.ReactElement;
  asChild?: boolean;
}

export function AlertDialogTrigger({ children, asChild }: AlertDialogTriggerProps) {
  const { onOpenChange } = useAlertDialog();
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onPress: () => onOpenChange(true),
    } as any);
  }
  
  return (
    <Pressable onPress={() => onOpenChange(true)}>
      {children}
    </Pressable>
  );
}

export function AlertDialogPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

interface AlertDialogOverlayProps {
  className?: string;
}

export function AlertDialogOverlay({ className }: AlertDialogOverlayProps) {
  return (
    <View 
      className={cn(
        "absolute inset-0 bg-black/50",
        className
      )}
    />
  );
}

interface AlertDialogContentProps {
  children: React.ReactNode;
  className?: string;
}

export function AlertDialogContent({ children, className }: AlertDialogContentProps) {
  const { open, onOpenChange } = useAlertDialog();
  
  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={() => onOpenChange(false)}
      statusBarTranslucent
    >
      <View className="flex-1 items-center justify-center p-4">
        <AlertDialogOverlay />
        <View 
          className={cn(
            "bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-sm shadow-lg",
            className
          )}
        >
          {children}
        </View>
      </View>
    </Modal>
  );
}

interface AlertDialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function AlertDialogHeader({ children, className }: AlertDialogHeaderProps) {
  return (
    <View className={cn("mb-4", className)}>
      {children}
    </View>
  );
}

interface AlertDialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function AlertDialogFooter({ children, className }: AlertDialogFooterProps) {
  return (
    <View className={cn("flex-row justify-end gap-2 mt-4", className)}>
      {children}
    </View>
  );
}

interface AlertDialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function AlertDialogTitle({ children, className }: AlertDialogTitleProps) {
  return (
    <Text className={cn("text-lg font-semibold text-gray-900 dark:text-white", className)}>
      {children}
    </Text>
  );
}

interface AlertDialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function AlertDialogDescription({ children, className }: AlertDialogDescriptionProps) {
  return (
    <Text className={cn("text-sm text-gray-600 dark:text-gray-400 mt-2", className)}>
      {children}
    </Text>
  );
}

interface AlertDialogActionProps {
  children: React.ReactNode;
  className?: string;
  onPress?: () => void;
}

export function AlertDialogAction({ children, className, onPress }: AlertDialogActionProps) {
  const { onOpenChange } = useAlertDialog();
  
  return (
    <Pressable
      onPress={() => {
        onPress?.();
        onOpenChange(false);
      }}
      className={cn(
        "bg-gray-900 dark:bg-white px-4 py-2 rounded-md",
        className
      )}
    >
      <Text className="text-white dark:text-gray-900 text-sm font-medium text-center">
        {children}
      </Text>
    </Pressable>
  );
}

interface AlertDialogCancelProps {
  children: React.ReactNode;
  className?: string;
  onPress?: () => void;
}

export function AlertDialogCancel({ children, className, onPress }: AlertDialogCancelProps) {
  const { onOpenChange } = useAlertDialog();
  
  return (
    <Pressable
      onPress={() => {
        onPress?.();
        onOpenChange(false);
      }}
      className={cn(
        "border border-gray-300 dark:border-gray-700 px-4 py-2 rounded-md mr-2",
        className
      )}
    >
      <Text className="text-gray-900 dark:text-white text-sm font-medium text-center">
        {children}
      </Text>
    </Pressable>
  );
}