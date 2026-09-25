import { useEffect, useId, useRef, useState } from "react";
import { LuSearch } from "react-icons/lu";
import { useI18n } from "../../features/localization/LanguageContext";
import { missionById, searchObjects } from "../../lib/filtering";
import type { Artifact, Mission } from "../../types/catalog";

type Props = {
  objects: Artifact[];
  missions: Mission[];
  onSelect: (object: Artifact) => void;
};

export function SearchBox({ objects, missions, onSelect }: Props) {
  const { t, lang } = useI18n();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();
  const boxRef = useRef<HTMLDivElement>(null);
  const results = searchObjects(objects, missions, query);

  useEffect(() => {
    const onPointer = (event: PointerEvent) => {
      if (!boxRef.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", onPointer);
    return () => window.removeEventListener("pointerdown", onPointer);
  }, []);

  return (
    <div ref={boxRef} className="relative">
      <label className="sr-only" htmlFor={`${listId}-input`}>
        {t.searchLabel}
      </label>
      <LuSearch className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[#b7b0a4]" aria-hidden />
      <input
        id={`${listId}-input`}
        role="combobox"
        aria-expanded={open && results.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        value={query}
        placeholder={t.searchPlaceholder}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
          setActive(0);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActive((index) => Math.min(index + 1, Math.max(results.length - 1, 0)));
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActive((index) => Math.max(index - 1, 0));
          } else if (event.key === "Enter" && results[active]) {
            event.preventDefault();
            onSelect(results[active]);
            setOpen(false);
          } else if (event.key === "Escape") {
            setOpen(false);
          }
        }}
        className="w-full rounded-full border border-white/10 bg-black/40 py-2 pr-3 pl-10 text-sm outline-none placeholder:text-[#8d867c]"
      />
      {open && query.trim() && (
        <ul id={listId} role="listbox" className="absolute z-40 mt-2 max-h-80 w-full overflow-auto rounded-2xl border border-white/10 bg-[#12151c] p-1 shadow-2xl">
          {results.length === 0 && <li className="px-3 py-2 text-sm text-[#b7b0a4]">{t.noResults}</li>}
          {results.map((object, index) => {
            const mission = missionById(missions, object.missionId);
            return (
              <li key={object.id} role="option" aria-selected={index === active}>
                <button
                  type="button"
                  className={`block w-full rounded-xl px-3 py-2 text-left ${index === active ? "bg-white/10" : ""}`}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => {
                    onSelect(object);
                    setOpen(false);
                  }}
                >
                  <span className="block text-sm">{object.name[lang]}</span>
                  <span className="block text-xs text-[#b7b0a4]">
                    {mission?.name[lang]} · {object.location.locationName}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
