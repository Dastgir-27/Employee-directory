import { useId, useRef } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}

export default function SearchBar({ value, onChange, onClear }: Props) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  function clear() {
    onClear();
    inputRef.current?.focus();
  }

  return (
    <div className="relative w-full sm:max-w-sm">
      <label htmlFor={id} className="sr-only">
        Search employees by name
      </label>
      <input
        ref={inputRef}
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape" && value) {
            e.preventDefault();
            clear();
          }
        }}
        placeholder="Search employees by name..."
        autoComplete="off"
        maxLength={100}
        className="input pr-10 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={clear}
          aria-label="Clear search"
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-md text-xl text-slate-500 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-indigo-600"
        >
          &times;
        </button>
      )}
    </div>
  );
}
