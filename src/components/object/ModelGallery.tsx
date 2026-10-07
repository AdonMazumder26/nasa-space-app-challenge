import { Html, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { LuBox, LuCircle, LuMaximize2, LuRotate3D, LuRotateCcw, LuX } from "react-icons/lu";
import { useI18n } from "../../features/localization/LanguageContext";
import type { ArtifactModel } from "../../data/artifactModels";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

type Props = {
    models: ArtifactModel[];
    onClose: () => void;
};

export function ModelGallery({ models, onClose }: Props) {
    const { lang, t } = useI18n();
    const [activeId, setActiveId] = useState(models[0]?.id ?? "");
    const [autoRotate, setAutoRotate] = useState(false);
    const controlsRef = useRef<OrbitControlsImpl>(null);
    const active = models.find((model) => model.id === activeId) ?? models[0];
    if (!active) return null;

    return (
        <div className="pointer-events-auto absolute inset-x-2 top-20 bottom-20 z-50 flex justify-end sm:inset-x-4 sm:top-24 sm:bottom-24">
            <aside className="flex h-full w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/15 bg-[#070d1c]/95 shadow-2xl backdrop-blur-xl" role="dialog" aria-modal="true" aria-labelledby="model-gallery-title">
                <header className="flex items-start gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
                    <div className="min-w-0 flex-1">
                        <p className="text-[11px] tracking-[0.18em] text-[#f2a64a] uppercase">{t.modelArchive}</p>
                        <h2 id="model-gallery-title" className="font-display text-2xl text-[#f4f7ff] sm:text-3xl">{t.modelGallery}</h2>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#93a6c9]">
                            <span>{t.modelGalleryHint}</span>
                            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">{t.modelCount.replace("{count}", String(models.length))}</span>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} aria-label={t.close} title={t.close} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10 text-[#f4f7ff] transition hover:border-[#6aa4ff]/60 hover:bg-white/10">
                        <LuX aria-hidden="true" />
                    </button>
                </header>
                <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_18rem]">
                    <div className="relative min-h-[16rem] overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_center,rgba(106,164,255,0.24),rgba(11,22,44,0.82)_58%,#081124_100%)] lg:min-h-0 lg:border-r lg:border-b-0">
                        <Canvas camera={{ position: [0, 0.2, 4], fov: 36 }} dpr={[1, 1.5]} gl={{ toneMappingExposure: 1.35 }}>
                            <color attach="background" args={["#081124"]} />
                            <hemisphereLight args={["#dceaff", "#162545", 1.7]} />
                            <ambientLight intensity={1.8} />
                            <directionalLight position={[3, 5, 4]} intensity={3.6} color="#fff4df" />
                            <directionalLight position={[-4, 1, -2]} intensity={1.4} color="#8bbaff" />
                            <directionalLight position={[1, -2, -5]} intensity={1.1} color="#f2a64a" />
                            <Suspense fallback={<Html center><span className="rounded-full border border-white/10 bg-black/50 px-3 py-2 text-xs text-[#c5d2ea] backdrop-blur-md">{t.modelLoading}</span></Html>}>
                                <InspectableModel key={active.file} url={active.file} />
                            </Suspense>
                            <OrbitControls ref={controlsRef} enablePan={false} minDistance={1.8} maxDistance={7} autoRotate={autoRotate} autoRotateSpeed={0.8} makeDefault />
                        </Canvas>
                        <div className="pointer-events-none absolute inset-x-4 top-4 flex items-start justify-between gap-3">
                            <div className="max-w-[75%] rounded-2xl border border-white/15 bg-[#070d1c]/60 px-3 py-2 backdrop-blur-md">
                                <p className="truncate text-[11px] tracking-[0.16em] text-[#f2a64a] uppercase">{active.mission[lang]}</p>
                                <p className="mt-0.5 truncate text-sm font-medium text-[#f4f7ff]">{active.name[lang]}</p>
                            </div>
                            <span className="rounded-full border border-white/15 bg-[#070d1c]/60 px-2.5 py-1 text-xs text-[#c5d2ea] backdrop-blur-md">{active.kind[lang]}</span>
                        </div>
                        <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-2 text-xs text-[#c5d2ea] backdrop-blur-md">
                                <LuRotate3D aria-hidden="true" /> {t.rotateModel}
                            </div>
                            <div className="flex items-center gap-1 rounded-2xl border border-white/15 bg-[#070d1c]/75 p-1 shadow-xl backdrop-blur-md">
                                <ModelControl label={t.modelReset} onClick={() => controlsRef.current?.reset()}>
                                    <LuRotateCcw aria-hidden="true" />
                                </ModelControl>
                                <ModelControl label={t.modelAutoRotate} pressed={autoRotate} onClick={() => setAutoRotate((value) => !value)}>
                                    <LuMaximize2 aria-hidden="true" />
                                </ModelControl>
                            </div>
                        </div>
                    </div>
                    <div className="min-h-0 overflow-y-auto p-3 sm:p-4">
                        <div className="mb-3 flex items-center gap-2 text-[11px] tracking-[0.16em] text-[#93a6c9] uppercase">
                            <LuBox aria-hidden="true" /> {t.modelSelection}
                        </div>
                        <div className="space-y-2">
                            {models.map((model) => (
                                <button key={model.id} type="button" aria-pressed={model.id === active.id} onClick={() => setActiveId(model.id)} className={`group flex w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left transition ${model.id === active.id ? "border-[#6aa4ff]/60 bg-[#6aa4ff]/15" : "border-white/10 hover:border-white/25 hover:bg-white/5"}`}>
                                    <span className={`mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full border ${model.id === active.id ? "border-[#6aa4ff] text-[#6aa4ff]" : "border-white/15 text-transparent group-hover:text-[#93a6c9]"}`}><LuCircle className="h-2 w-2 fill-current" aria-hidden="true" /></span>
                                    <span className="min-w-0">
                                        <span className="block text-sm font-medium text-[#f4f7ff]">{model.name[lang]}</span>
                                        <span className="mt-1 block text-xs text-[#93a6c9]">{model.mission[lang]} · {model.kind[lang]}</span>
                                    </span>
                                </button>
                            ))}
                        </div>
                        <section className="mt-5 border-t border-white/10 pt-4">
                            <p className="text-[11px] tracking-[0.16em] text-[#f2a64a] uppercase">{active.mission[lang]}</p>
                            <h3 className="mt-1 font-display text-2xl text-[#f4f7ff]">{active.name[lang]}</h3>
                            <p className="mt-3 text-sm leading-6 text-[#c5d2ea]">{active.description[lang]}</p>
                            <p className="mt-4 text-sm leading-6 text-[#f4f7ff]">{active.significance[lang]}</p>
                            <a href={active.sourceUrl} target="_blank" rel="noreferrer noopener" className="mt-4 block rounded-xl border border-white/10 px-3 py-2 text-xs text-[#9ec0ff] underline underline-offset-2">
                                {active.sourceLabel[lang]} · {t.externalLink}
                            </a>
                        </section>
                    </div>
                </div>
            </aside>
        </div>
    );
}

function InspectableModel({ url }: { url: string }) {
    const { scene } = useGLTF(url);
    const model = useMemo(() => {
        const clone = scene.clone(true);
        const bounds = new THREE.Box3().setFromObject(clone);
        const size = bounds.getSize(new THREE.Vector3());
        const center = bounds.getCenter(new THREE.Vector3());
        const largest = Math.max(size.x, size.y, size.z) || 1;
        clone.scale.setScalar(2.35 / largest);
        clone.position.set(-center.x * clone.scale.x, -center.y * clone.scale.y, -center.z * clone.scale.z);
        clone.traverse((node) => {
            if (node instanceof THREE.Mesh) {
                node.castShadow = true;
                node.receiveShadow = true;
            }
        });
        return clone;
    }, [scene]);
    return <primitive object={model} />;
}

function ModelControl({ label, onClick, pressed, children }: { label: string; onClick: () => void; pressed?: boolean; children: ReactNode }) {
    return (
        <span className="group relative">
            <button type="button" aria-label={label} title={label} aria-pressed={pressed} onClick={onClick} className={`grid h-10 w-10 place-items-center rounded-xl text-sm transition hover:bg-white/10 ${pressed ? "bg-[#6aa4ff]/20 text-[#6aa4ff]" : "text-[#f4f7ff]"}`}>
                {children}
            </button>
            <span role="tooltip" className="pointer-events-none absolute right-0 bottom-[calc(100%+0.45rem)] z-20 whitespace-nowrap rounded-full border border-white/10 bg-[#070d1c]/95 px-2.5 py-1 text-[11px] text-[#f4f7ff] opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-within:opacity-100">
                {label}
            </span>
        </span>
    );
}
