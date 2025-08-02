import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  ScrollView, 
  Pressable 
} from 'react-native';
import { ChevronDownIcon, CheckIcon } from 'lucide-react-native';
import '@rite/ui/types/nativewind';

// Root Select component - manages state
export interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

interface SelectContextType {
  value?: string;
  onValueChange?: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  disabled?: boolean;
}

const SelectContext = React.createContext<SelectContextType | undefined>(undefined);

export function Select({ value, onValueChange, disabled, children }: SelectProps) {
  const [open, setOpen] = useState(false);
  
  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen, disabled }}>
      {children}
    </SelectContext.Provider>
  );
}

// SelectGroup - groups items together
export function SelectGroup({ children }: { children?: React.ReactNode }) {
  return <View>{children}</View>;
}

// SelectValue - placeholder/selected value display
export interface SelectValueProps {
  placeholder?: string;
}

export function SelectValue({ placeholder }: SelectValueProps) {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error('SelectValue must be used within Select');
  
  return (
    <Text className="text-base text-gray-900">
      {context.value || placeholder || 'Select...'}
    </Text>
  );
}

// SelectTrigger - button that opens the select
export interface SelectTriggerProps {
  children?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'default';
}

export function SelectTrigger({ children, className = '', size = 'default' }: SelectTriggerProps) {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error('SelectTrigger must be used within Select');
  
  const heightClass = size === 'sm' ? 'h-8' : 'h-9';
  
  return (
    <TouchableOpacity
      onPress={() => !context.disabled && context.setOpen(true)}
      disabled={context.disabled}
      className={`flex-row items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 ${heightClass} ${context.disabled ? 'opacity-50' : ''} ${className}`}
    >
      {children}
      <ChevronDownIcon size={16} color="#6b7280" />
    </TouchableOpacity>
  );
}

// SelectContent - modal/dropdown content
export interface SelectContentProps {
  children?: React.ReactNode;
  className?: string;
}

export function SelectContent({ children, className = '' }: SelectContentProps) {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error('SelectContent must be used within Select');
  
  return (
    <Modal
      visible={context.open}
      transparent
      animationType="fade"
      onRequestClose={() => context.setOpen(false)}
    >
      <Pressable 
        className="flex-1 bg-black/50 justify-end"
        onPress={() => context.setOpen(false)}
      >
        <View className={`bg-white rounded-t-xl max-h-96 ${className}`}>
          <ScrollView className="p-2">
            {children}
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
}

// SelectLabel - label for a group of items
export interface SelectLabelProps {
  children?: React.ReactNode;
  className?: string;
}

export function SelectLabel({ children, className = '' }: SelectLabelProps) {
  return (
    <Text className={`px-2 py-1.5 text-xs text-gray-500 ${className}`}>
      {children}
    </Text>
  );
}

// SelectItem - individual selectable item
export interface SelectItemProps {
  value: string;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function SelectItem({ value, children, className = '', disabled }: SelectItemProps) {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error('SelectItem must be used within Select');
  
  const isSelected = context.value === value;
  
  return (
    <TouchableOpacity
      onPress={() => {
        if (!disabled) {
          context.onValueChange?.(value);
          context.setOpen(false);
        }
      }}
      disabled={disabled}
      className={`flex-row items-center px-2 py-3 rounded ${isSelected ? 'bg-gray-100' : ''} ${disabled ? 'opacity-50' : ''} ${className}`}
    >
      <View className="flex-1">
        <Text className="text-base text-gray-900">{children}</Text>
      </View>
      {isSelected && (
        <CheckIcon size={16} color="#6b7280" />
      )}
    </TouchableOpacity>
  );
}

// SelectSeparator - divider between items
export function SelectSeparator({ className = '' }: { className?: string }) {
  return <View className={`h-px bg-gray-200 my-1 -mx-1 ${className}`} />;
}

// Scroll buttons - not needed in React Native as ScrollView handles this
export function SelectScrollUpButton() {
  return null;
}

export function SelectScrollDownButton() {
  return null;
}