import { useState, useEffect } from 'react';

export function useTableEditor<T>(initialValue: T, onSave: (value: T) => void) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState<T>(initialValue);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

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
