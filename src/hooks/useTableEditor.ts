import { useState } from 'react';

export function useTableEditor<T>(initialValue: T, onSave: (value: T) => void) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState<T>(initialValue);
  const [previousInitialValue, setPreviousInitialValue] = useState(initialValue);
  const [isHovered, setIsHovered] = useState(false);

  // Reset a stale draft before React renders children with the new source value.
  if (!Object.is(previousInitialValue, initialValue)) {
    setPreviousInitialValue(initialValue);
    setValue(initialValue);
  }

  const startEditing = () => setIsEditing(true);
  
  const cancelEditing = () => {
    setIsEditing(false);
    setValue(initialValue);
  };

  const saveEditing = () => {
    setIsEditing(false);
    if (value !== initialValue) {
      onSave(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEditing();
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  return {
    isEditing,
    value,
    setValue,
    isHovered,
    setIsHovered,
    startEditing,
    cancelEditing,
    saveEditing,
    handleKeyDown,
  };
}
