'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  options?: SelectOption[];
}

interface SelectContextValue {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  menuRect: DOMRect | null;
  triggerRef: React.RefObject<HTMLButtonElement>;
  menuRef: React.RefObject<HTMLDivElement>;
  registerItem: (item: SelectOption) => void;
  items: SelectOption[];
  displayLabel: string;
}

const SelectContext = React.createContext<SelectContextValue | null>(null);

export function Select({ className, value = '', onValueChange, placeholder = 'Select...', options = [], children, ...props }: SelectProps) {
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [menuRect, setMenuRect] = React.useState<DOMRect | null>(null);
  const [items, setItems] = React.useState<SelectOption[]>([]);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (open && triggerRef.current) {
      setMenuRect(triggerRef.current.getBoundingClientRect());
    }
  }, [open, value]);

  React.useEffect(() => {
    if (!open) return;

    const handleOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedInsideWrapper = wrapperRef.current?.contains(target);
      const clickedInsideMenu = menuRef.current?.contains(target);

      if (!clickedInsideWrapper && !clickedInsideMenu) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  const itemList = React.useMemo(() => {
    if (options.length > 0) {
      return options;
    }
    return items;
  }, [items, options]);

  React.useEffect(() => {
    if (options.length > 0) {
      setItems(options);
    }
  }, [options]);

  const displayLabel = React.useMemo(() => {
    if (!value) {
      return placeholder;
    }
    const match = itemList.find((item) => item.value === value);
    return match?.label ?? value;
  }, [itemList, placeholder, value]);

  const registerItem = React.useCallback((item: SelectOption) => {
    setItems((current) => {
      if (current.some((entry) => entry.value === item.value)) {
        return current;
      }
      return [...current, item];
    });
  }, []);

  const handleValueChange = React.useCallback(
    (selectedValue: string) => {
      setOpen(false);
      onValueChange?.(selectedValue);
    },
    [onValueChange]
  );

  const contextValue = React.useMemo(
    () => ({
      value: value ?? '',
      onValueChange: handleValueChange,
      placeholder,
      open,
      setOpen,
      menuRect,
      triggerRef,
      menuRef,
      registerItem,
      items: itemList,
      displayLabel
    }),
    [displayLabel, handleValueChange, itemList, menuRect, open, placeholder, registerItem, value]
  );

  return (
    <SelectContext.Provider value={contextValue}>
      <div ref={wrapperRef} className={clsx('relative overflow-visible', className)} {...props}>
        {children}
        {mounted && contextValue.open && contextValue.menuRect && null}
      </div>
    </SelectContext.Provider>
  );
}

function useSelectContext() {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error('Select components must be used within a <Select> component.');
  }
  return context;
}

export function SelectTrigger({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const context = useSelectContext();

  return (
    <button
      ref={context.triggerRef}
      type="button"
      onClick={() => context.setOpen((value) => !value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          context.setOpen((value) => !value);
        }
        if (event.key === 'Escape') {
          context.setOpen(false);
        }
      }}
      aria-haspopup="listbox"
      aria-expanded={context.open}
      className={clsx(
        'relative w-full rounded-2xl border border-[#b88b3d] bg-[#081a36] px-4 py-3 text-sm text-white text-left min-h-[3.5rem]',
        'transition duration-200 focus:outline-none focus:ring-2 focus:ring-[#b88b3d]/30 focus:border-[#b88b3d]',
        'hover:border-[#d5ad5f] hover:bg-[#0f2b54]',
        'flex items-center justify-between',
        context.open && 'border-[#d5ad5f] bg-[#0d244c] shadow-[0_0_0_1px_rgba(213,173,95,0.35)]',
        className
      )}
      {...props}
    >
      <span className="flex-1 text-left">{children}</span>
      <ChevronDown className={clsx('h-4 w-4 text-[#f6d47e] transition-transform duration-200', context.open && 'rotate-180')} />
    </button>
  );
}

interface SelectValueProps {
  placeholder?: string;
}

export function SelectValue({ placeholder }: SelectValueProps) {
  const context = useSelectContext();
  const resolvedPlaceholder = placeholder ?? context.placeholder;
  const hasSelection = Boolean(context.value);
  const label = hasSelection ? context.displayLabel : resolvedPlaceholder;

  return <span className={clsx(hasSelection ? 'text-white' : 'text-[#d5ad5f]/80')}>{label}</span>;
}

export function SelectContent({ children }: { children: React.ReactNode }) {
  const context = useSelectContext();

  if (!context.open || !context.menuRect) {
    return null;
  }

  return createPortal(
    <div
      ref={context.menuRef}
      role="listbox"
      aria-labelledby="select-trigger"
      className="rounded-2xl border border-[#b88b3d] bg-[#081a36] text-white shadow-[0_24px_70px_rgba(0,0,0,0.35)] overflow-hidden"
      style={{
        position: 'fixed',
        top: context.menuRect.bottom + 8,
        left: context.menuRect.left,
        width: context.menuRect.width,
        zIndex: 9999
      }}
    >
      {children}
    </div>,
    document.body
  );
}

interface SelectItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  label?: string;
}

export function SelectItem({ value, label, className, children, ...props }: SelectItemProps) {
  const context = useSelectContext();
  const itemLabel = label ?? (typeof children === 'string' ? children : String(children));

  React.useEffect(() => {
    context.registerItem({ value, label: itemLabel });
  }, [context.registerItem, itemLabel, value]);

  return (
    <button
      type="button"
      role="option"
      aria-selected={context.value === value}
      onClick={() => context.onValueChange(value)}
      className={clsx(
        'w-full px-4 py-3 text-sm text-left transition-colors',
        context.value === value
          ? 'bg-[#b88b3d]/25 text-[#ffe699] font-semibold'
          : 'text-white hover:bg-[#0f315d] hover:text-[#f9d77b]',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
