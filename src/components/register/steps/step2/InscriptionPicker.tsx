interface InscriptionPickerProps {
  inscriptions: string[];
  selected: string | null;
  onSelect: (text: string) => void;
}

export default function InscriptionPicker({ inscriptions, selected, onSelect }: InscriptionPickerProps) {
  if (!inscriptions || inscriptions.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-amber-500/60">
          Personalization
        </span>
        <div className="flex-1 h-px bg-white/5" />
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        {inscriptions.map((text) => (
          <button
            key={text}
            onClick={() => onSelect(text)}
            type="button"
            className={`group relative flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 ${
              selected === text
                ? 'border-amber-500 bg-amber-500/10 text-white shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                : 'border-white/5 bg-white/2 text-neutral-400 hover:border-white/20 hover:bg-white/5'
            }`}
          >
            <span className="text-sm font-medium tracking-wide">{text}</span>
            {selected === text && (
              <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}