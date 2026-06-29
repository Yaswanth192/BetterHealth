interface CountryCode {
  code: string;
  label: string;
  flag: string;
}

const countries: CountryCode[] = [
  { code: '+91', label: 'India', flag: '🇮🇳' },
  { code: '+1', label: 'US', flag: '🇺🇸' },
  { code: '+44', label: 'UK', flag: '🇬🇧' },
  { code: '+61', label: 'Australia', flag: '🇦🇺' },
  { code: '+971', label: 'UAE', flag: '🇦🇪' },
  { code: '+966', label: 'Saudi', flag: '🇸🇦' },
  { code: '+65', label: 'Singapore', flag: '🇸🇬' },
  { code: '+60', label: 'Malaysia', flag: '🇲🇾' },
  { code: '+86', label: 'China', flag: '🇨🇳' },
  { code: '+81', label: 'Japan', flag: '🇯🇵' },
  { code: '+49', label: 'Germany', flag: '🇩🇪' },
  { code: '+33', label: 'France', flag: '🇫🇷' },
  { code: '+27', label: 'South Africa', flag: '🇿🇦' },
];

function getCountryFromValue(value: string): { countryCode: string; number: string } {
  if (!value) return { countryCode: '+91', number: '' };
  const match = value.match(/^(\+\d{1,4})\s*(.*)/);
  if (match) {
    return { countryCode: match[1], number: match[2].replace(/[^0-9]/g, '') };
  }
  return { countryCode: '+91', number: value.replace(/[^0-9]/g, '') };
}

interface PhoneInputProps {
  value: string;
  onChange: (fullNumber: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function PhoneInput({ value, onChange, placeholder = '98765 43210', required = false, className = '' }: PhoneInputProps) {
  const { countryCode, number } = getCountryFromValue(value);

  function handleCountryChange(newCode: string) {
    onChange(`${newCode} ${number}`.trim());
  }

  function handleNumberChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/[^0-9]/g, '');
    onChange(`${countryCode} ${digits}`.trim());
  }

  return (
    <div className={`relative flex items-center border border-neutral-200 rounded-xl bg-white dark:border-neutral-600 dark:bg-neutral-800 focus-within:ring-2 focus-within:ring-primary-400 focus-within:border-primary-400 transition-all duration-200 ${className}`}>
      <select
        value={countryCode}
        onChange={(e) => handleCountryChange(e.target.value)}
        className="appearance-none text-sm bg-transparent border-r border-neutral-200 dark:border-neutral-600 pl-3 pr-1 py-3 text-neutral-800 dark:text-neutral-100 outline-none cursor-pointer flex-shrink-0"
      >
        {countries.map((c) => (
          <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
        ))}
      </select>
      <input
        type="tel"
        required={required}
        value={number}
        onChange={handleNumberChange}
        placeholder={placeholder}
        className="flex-1 bg-transparent px-3 py-3 text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 outline-none"
      />
    </div>
  );
}
