import { OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useMemo, useState } from "react";
import * as THREE from "three";
import { LuBox, LuRotate3D, LuX } from "react-icons/lu";
import { useI18n } from "../../features/localization/LanguageContext";
import type { ArtifactModel } from "../../data/artifactModels";

type Props = {
    models: ArtifactModel[];
    onClose: () => void;
};

export function ModelGallery({ models, onClose }: Props) {
    const { lang, t } = useI18n();
    const [activeId, setActiveId] = useState(models[0]?.id ?? "");
    const active = models.find((model) => model.id === activeId) ?? models[0];
    if (!active) return null;

    return (
        <div className="pointer-events-auto absolute inset-x-2 top-20 bottom-20 z-50 flex justify-end sm:inset-x-4 sm:top-24 sm:bottom-24">
            <aside className="flex h-full w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-white/15 bg-[#070d1c]/95 shadow-2xl backdrop-blur-xl" role="dialog" aria-modal="true" aria-labelledby="model-gallery-title">
                <header className="flex items-start gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
                    <div className="min-w-0 flex-1">
                        <p className="text-[11px] tracking-[0.18em] text-[#f2a64a] uppercase">{t.modelArchive}</p>
                        <h2 id="model-gallery-title" className="font-display text-2xl text-[#f4f7ff] sm:text-3xl">{t.modelGallery}</h2>
                        <p className="mt-1 text-xs text-[#93a6c9]">{t.modelGalleryHint}</p>
                    </div>
                    <button type="button" onClick={onClose} aria-label={t.close} title={t.close} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10 text-[#f4f7ff] transition hover:border-[#6aa4ff]/60 hover:bg-white/10">
                        <LuX aria-hidden="true" />
                    </button>
                </header>
                <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_18rem]">
                    <div className="relative min-h-[14rem] border-b border-white/10 bg-[radial-gradient(circle_at_center,rgba(106,164,255,0.24),rgba(11,22,44,0.82)_58%,#081124_100%)] lg:min-h-0 lg:border-r lg:border-b-0">
                        <Canvas camera={{ position: [0, 0.2, 4], fov: 36 }} dpr={[1, 1.5]} gl={{ toneMappingExposure: 1.35 }}>
                            <color attach="background" args={["#081124"]} />
                            <hemisphereLight args={["#dceaff", "#162545", 1.7]} />
                            <ambientLight intensity={1.8} />
                            <directionalLight position={[3, 5, 4]} intensity={3.6} color="#fff4df" />
                            <directionalLight position={[-4, 1, -2]} intensity={1.4} color="#8bbaff" />
                            <directionalLight position={[1, -2, -5]} intensity={1.1} color="#f2a64a" />
                            <Suspense fallback={null}>
                                <InspectableModel key={active.file} url={active.file} />
                            </Suspense>
                            <OrbitControls enablePan={false} minDistance={1.8} maxDistance={7} makeDefault />
                        </Canvas>
                        <div className="pointer-events-none absolute left-4 bottom-4 flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-2 text-xs text-[#c5d2ea] backdrop-blur-md">
                            <LuRotate3D aria-hidden="true" /> {t.rotateModel}
                        </div>
                    </div>
                    <div className="min-h-0 overflow-y-auto p-3 sm:p-4">
                        <div className="mb-3 flex items-center gap-2 text-[11px] tracking-[0.16em] text-[#93a6c9] uppercase">
                            <LuBox aria-hidden="true" /> {t.modelSelection}
                        </div>
                        <div className="space-y-2">
                            {models.map((model) => (
                                <button key={model.id} type="button" aria-pressed={model.id === active.id} onClick={() => setActiveId(model.id)} className={`w-full rounded-2xl border px-3 py-3 text-left transition ${model.id === active.id ? "border-[#6aa4ff]/60 bg-[#6aa4ff]/15" : "border-white/10 hover:border-white/25 hover:bg-white/5"}`}>
                                    <span className="block text-sm font-medium text-[#f4f7ff]">{model.name[lang]}</span>
                                    <span className="mt-1 block text-xs text-[#93a6c9]">{model.mission[lang]} · {model.kind[lang]}</span>
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
