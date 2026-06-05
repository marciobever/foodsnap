'use client';
import React, { useState } from 'react';
import { X, Calculator, Droplets, Activity, Scale, ChevronRight, ArrowRight, Check, Dumbbell, Flame, Heart, Percent } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

interface CalculatorsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type ToolType = 'bmi' | 'water' | 'bmr' | 'tdee' | 'orm' | 'bodyfat' | 'hr';

const CalculatorsModal: React.FC<CalculatorsModalProps> = ({ isOpen, onClose }) => {
    const [activeTool, setActiveTool] = useState<ToolType>('bmi');
    const { t } = useLanguage();

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                {/* Backdrop Overlay */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-gray-950/70 backdrop-blur-md"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative bg-white w-full max-w-6xl h-[600px] md:h-[750px] max-h-[95vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row ring-1 ring-gray-200"
                >
                    {/* Close Button (Mobile) */}
                    <button
                        onClick={onClose}
                        className="md:hidden absolute top-4 right-4 z-20 p-2 bg-gray-100 rounded-full text-gray-500 hover:text-gray-900"
                    >
                        <X size={20} />
                    </button>

                    {/* Sidebar Navigation */}
                    <aside className="w-full md:w-80 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col shrink-0">
                        <div className="p-4 md:p-6 border-b border-gray-100/50">
                            <div className="flex items-center gap-2">
                                <div className="bg-brand-600 p-2 rounded-lg text-white shadow-lg shadow-brand-500/20">
                                    <Calculator size={20} />
                                </div>
                                <span className="font-bold text-lg text-gray-900 tracking-tight">FoodSnap Tools</span>
                            </div>
                        </div>

                        <nav className="flex-1 overflow-y-auto p-4 md:p-4 space-y-1 scrollbar-thin scrollbar-thumb-gray-200 flex flex-row md:flex-col gap-2 md:gap-1 overflow-x-auto md:overflow-x-visible pb-4 md:pb-0">
                            <NavButton
                                active={activeTool === 'bmi'}
                                onClick={() => setActiveTool('bmi')}
                                icon={<Scale size={18} />}
                                label={t.tools.bmi.title}
                                desc="Índice de Massa Corporal"
                            />
                            <NavButton
                                active={activeTool === 'tdee'}
                                onClick={() => setActiveTool('tdee')}
                                icon={<Flame size={18} />}
                                label={t.tools.tdee.title}
                                desc="Gasto Total Diário"
                            />
                            <NavButton
                                active={activeTool === 'water'}
                                onClick={() => setActiveTool('water')}
                                icon={<Droplets size={18} />}
                                label={t.tools.water.title}
                                desc="Hidratação Diária"
                            />
                            <NavButton
                                active={activeTool === 'bmr'}
                                onClick={() => setActiveTool('bmr')}
                                icon={<Activity size={18} />}
                                label={t.tools.bmr.title}
                                desc="Taxa Metabólica Basal"
                            />
                            <div className="hidden md:block h-px bg-gray-200 my-2 mx-4"></div>
                            <NavButton
                                active={activeTool === 'orm'}
                                onClick={() => setActiveTool('orm')}
                                icon={<Dumbbell size={18} />}
                                label={t.tools.orm.title}
                                desc="Força Máxima (1RM)"
                            />
                            <NavButton
                                active={activeTool === 'bodyfat'}
                                onClick={() => setActiveTool('bodyfat')}
                                icon={<Percent size={18} />}
                                label={t.tools.bodyfat.title}
                                desc="Gordura Corporal"
                            />
                            <NavButton
                                active={activeTool === 'hr'}
                                onClick={() => setActiveTool('hr')}
                                icon={<Heart size={18} />}
                                label={t.tools.hr.title}
                                desc="Zonas Cardíacas"
                            />
                        </nav>
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-1 relative overflow-y-auto bg-white">
                        {/* Close Button (Desktop) */}
                        <button
                            onClick={onClose}
                            className="hidden md:block absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 transition-colors bg-white hover:bg-gray-100 rounded-full z-10"
                        >
                            <X size={24} />
                        </button>

                        <div className="p-6 md:p-10 max-w-3xl mx-auto h-full flex flex-col justify-center min-h-[500px]">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTool}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="w-full"
                                >
                                    {activeTool === 'bmi' && <BMICalculator t={t} />}
                                    {activeTool === 'water' && <WaterCalculator t={t} />}
                                    {activeTool === 'bmr' && <BMRCalculator t={t} />}
                                    {activeTool === 'tdee' && <TDEECalculator t={t} />}
                                    {activeTool === 'orm' && <ORMCalculator t={t} />}
                                    {activeTool === 'bodyfat' && <BodyFatCalculator t={t} />}
                                    {activeTool === 'hr' && <HeartRateCalculator t={t} />}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </main>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

// --- Components de Navegação ---

const NavButton = ({ active, onClick, icon, label, desc }: any) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-3 p-3 md:p-3.5 rounded-xl transition-all duration-200 w-full text-left min-w-[200px] md:min-w-0 md:mb-1 ${active
                ? 'bg-white shadow-md shadow-gray-200 ring-1 ring-gray-200'
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
            }`}
    >
        <div className={`p-2 rounded-lg transition-colors shrink-0 ${active ? 'bg-brand-50 text-brand-600' : 'bg-gray-200/50 text-gray-500'}`}>
            {icon}
        </div>
        <div className="min-w-0">
            <span className={`block text-sm font-bold truncate ${active ? 'text-gray-900' : 'text-gray-600'}`}>{label}</span>
            <span className="hidden md:block text-[10px] text-gray-400 font-medium leading-tight truncate">{desc}</span>
        </div>
        {active && <div className="hidden md:block ml-auto w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0"></div>}
    </button>
);

// --- Calculadoras (Existentes + Novas) ---

const BMICalculator = ({ t }: any) => {
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [bmi, setBmi] = useState<number | null>(null);

    const calculate = () => {
        if (weight && height) {
            const h = parseFloat(height) / 100;
            const val = parseFloat(weight) / (h * h);
            setBmi(parseFloat(val.toFixed(1)));
        }
    };

    const getStatus = (val: number) => {
        if (val < 18.5) return { label: 'Abaixo do peso', color: 'text-blue-500', bg: 'bg-blue-500', range: 0 };
        if (val < 25) return { label: 'Peso ideal', color: 'text-green-500', bg: 'bg-green-500', range: 33 };
        if (val < 30) return { label: 'Sobrepeso', color: 'text-yellow-500', bg: 'bg-yellow-500', range: 66 };
        return { label: 'Obesidade', color: 'text-red-500', bg: 'bg-red-500', range: 100 };
    };

    const status = bmi ? getStatus(bmi) : null;

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{t.tools.bmi.title}</h2>
                <p className="text-gray-500">{t.tools.bmi.desc}</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <BigInput label={t.tools.bmi.labelWeight} value={weight} onChange={setWeight} placeholder="70" unit="kg" />
                <BigInput label={t.tools.bmi.labelHeight} value={height} onChange={setHeight} placeholder="175" unit="cm" />
            </div>

            <button
                onClick={calculate}
                disabled={!weight || !height}
                className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {t.tools.calculate} <ArrowRight size={18} />
            </button>

            {bmi && status && (
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 animate-in fade-in slide-in-from-bottom-4">
                    <div className="text-center mb-6">
                        <p className="text-sm text-gray-500 font-medium uppercase tracking-wide mb-1">Seu Resultado</p>
                        <div className="text-5xl font-extrabold text-gray-900 mb-2">{bmi}</div>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold bg-white shadow-sm border border-gray-100 ${status.color}`}>
                            {status.label}
                        </span>
                    </div>

                    {/* Visual Bar */}
                    <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden mb-2">
                        <div className="absolute inset-y-0 left-0 w-1/4 bg-blue-400"></div>
                        <div className="absolute inset-y-0 left-1/4 w-1/4 bg-green-400"></div>
                        <div className="absolute inset-y-0 left-2/4 w-1/4 bg-yellow-400"></div>
                        <div className="absolute inset-y-0 left-3/4 w-1/4 bg-red-400"></div>
                    </div>
                    <div className="relative h-4 w-full">
                        <div
                            className="absolute top-0 -translate-x-1/2 transition-all duration-500"
                            style={{ left: `${Math.min(Math.max((bmi / 40) * 100, 5), 95)}%` }}
                        >
                            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-gray-800 mx-auto"></div>
                        </div>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-400 font-medium mt-1">
                        <span>18.5</span>
                        <span>25.0</span>
                        <span>30.0</span>
                    </div>
                </div>
            )}
        </div>
    );
};

const WaterCalculator = ({ t }: any) => {
    const [weight, setWeight] = useState('');
    const [liters, setLiters] = useState<number | null>(null);

    const calculate = () => {
        if (weight) {
            const val = parseFloat(weight) * 0.035;
            setLiters(parseFloat(val.toFixed(1)));
        }
    };

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-cyan-900">{t.tools.water.title}</h2>
                <p className="text-gray-500">{t.tools.water.desc}</p>
            </div>

            <div className="flex items-center gap-8">
                <div className="flex-1 space-y-6">
                    <BigInput label={t.tools.bmi.labelWeight} value={weight} onChange={setWeight} placeholder="70" unit="kg" />
                    <button
                        onClick={calculate}
                        disabled={!weight}
                        className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {t.tools.calculate} <ArrowRight size={18} />
                    </button>
                </div>

                {/* Visual Bottle */}
                <div className="hidden md:flex w-32 h-64 bg-gray-100 rounded-[2rem] border-4 border-gray-200 relative overflow-hidden items-end justify-center shrink-0">
                    <div
                        className="absolute bottom-0 left-0 right-0 bg-cyan-400 transition-all duration-700 ease-out opacity-80"
                        style={{ height: liters ? '70%' : '10%' }}
                    >
                        <div className="w-full absolute -top-4 left-0 h-8 bg-cyan-400 rounded-[100%]"></div>
                    </div>
                    <div className="relative z-10 mb-8 text-center">
                        <Droplets className="text-white drop-shadow-md mx-auto mb-2" size={24} />
                        {liters && <span className="text-white font-bold text-xl drop-shadow-md">{liters}L</span>}
                    </div>
                </div>
            </div>

            {liters && (
                <div className="md:hidden bg-cyan-50 border border-cyan-100 p-6 rounded-2xl text-center">
                    <p className="text-sm text-cyan-800 font-medium uppercase tracking-wide mb-1">Meta Diária</p>
                    <p className="text-5xl font-extrabold text-cyan-600">{liters} L</p>
                </div>
            )}
        </div>
    );
};

const BMRCalculator = ({ t }: any) => {
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [age, setAge] = useState('');
    const [bmr, setBmr] = useState<number | null>(null);

    const calculate = () => {
        if (weight && height && age) {
            let val = (10 * parseFloat(weight)) + (6.25 * parseFloat(height)) - (5 * parseFloat(age));
            val = gender === 'male' ? val + 5 : val - 161;
            setBmr(Math.round(val));
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{t.tools.bmr.title}</h2>
                <p className="text-gray-500">{t.tools.bmr.desc}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setGender('male')} className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${gender === 'male' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'}`}>
                    <div className="font-bold">{t.tools.bmr.male}</div>
                    {gender === 'male' && <div className="p-1 bg-brand-500 rounded-full text-white"><Check size={12} /></div>}
                </button>
                <button onClick={() => setGender('female')} className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${gender === 'female' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'}`}>
                    <div className="font-bold">{t.tools.bmr.female}</div>
                    {gender === 'female' && <div className="p-1 bg-brand-500 rounded-full text-white"><Check size={12} /></div>}
                </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <BigInput label={t.tools.bmi.labelWeight} value={weight} onChange={setWeight} placeholder="70" unit="kg" />
                <BigInput label={t.tools.bmi.labelHeight} value={height} onChange={setHeight} placeholder="175" unit="cm" />
                <BigInput label={t.tools.bmr.labelAge} value={age} onChange={setAge} placeholder="30" unit="anos" />
            </div>

            <button
                onClick={calculate}
                disabled={!weight || !height || !age}
                className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {t.tools.calculate} <ArrowRight size={18} />
            </button>

            {bmr && (
                <div className="bg-orange-50 border border-orange-100 p-6 rounded-2xl flex items-center justify-between animate-in fade-in zoom-in">
                    <div>
                        <p className="text-sm text-orange-800 font-medium uppercase tracking-wide mb-1">Gasto em Repouso</p>
                        <p className="text-xs text-orange-600/70 max-w-[200px]">Calorias que você queima parado.</p>
                    </div>
                    <div className="text-right">
                        <p className="text-4xl font-extrabold text-orange-600">{bmr}</p>
                        <p className="text-xs font-bold text-orange-400 uppercase">kcal / dia</p>
                    </div>
                </div>
            )}
        </div>
    );
};

const TDEECalculator = ({ t }: any) => {
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [age, setAge] = useState('');
    const [activity, setActivity] = useState<number>(1.2);
    const [tdee, setTdee] = useState<number | null>(null);

    const calculate = () => {
        if (weight && height && age) {
            let bmr = (10 * parseFloat(weight)) + (6.25 * parseFloat(height)) - (5 * parseFloat(age));
            bmr = gender === 'male' ? bmr + 5 : bmr - 161;
            setTdee(Math.round(bmr * activity));
        }
    };

    const activityLevels = [
        { val: 1.2, label: t.tools.tdee.sedentary },
        { val: 1.375, label: t.tools.tdee.light },
        { val: 1.55, label: t.tools.tdee.moderate },
        { val: 1.725, label: t.tools.tdee.active },
        { val: 1.9, label: t.tools.tdee.veryActive },
    ];

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{t.tools.tdee.title}</h2>
                <p className="text-gray-500">{t.tools.tdee.desc}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setGender('male')} className={`p-3 rounded-xl border-2 transition-all flex justify-center items-center gap-2 ${gender === 'male' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-400'}`}>{t.tools.bmr.male}</button>
                <button onClick={() => setGender('female')} className={`p-3 rounded-xl border-2 transition-all flex justify-center items-center gap-2 ${gender === 'female' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 bg-white text-gray-400'}`}>{t.tools.bmr.female}</button>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <BigInput label={t.tools.bmi.labelWeight} value={weight} onChange={setWeight} placeholder="70" unit="kg" />
                <BigInput label={t.tools.bmi.labelHeight} value={height} onChange={setHeight} placeholder="175" unit="cm" />
                <BigInput label={t.tools.bmr.labelAge} value={age} onChange={setAge} placeholder="30" unit="anos" />
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">{t.tools.tdee.activity}</label>
                <div className="grid grid-cols-1 gap-2">
                    {activityLevels.map((lvl) => (
                        <button
                            key={lvl.val}
                            onClick={() => setActivity(lvl.val)}
                            className={`text-left px-4 py-3 rounded-xl border transition-all flex justify-between items-center ${activity === lvl.val ? 'border-brand-500 bg-brand-50 text-brand-900 ring-1 ring-brand-500' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}
                        >
                            <span className="font-medium text-sm">{lvl.label}</span>
                            {activity === lvl.val && <div className="w-2 h-2 rounded-full bg-brand-500"></div>}
                        </button>
                    ))}
                </div>
            </div>

            <button
                onClick={calculate}
                disabled={!weight || !height || !age}
                className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
            >
                {t.tools.calculate}
            </button>

            {tdee && (
                <div className="bg-brand-900 text-white p-6 rounded-2xl flex items-center justify-between animate-in fade-in zoom-in shadow-xl">
                    <div>
                        <p className="text-sm text-brand-300 font-bold uppercase tracking-wide mb-1">Gasto Calórico Total</p>
                        <p className="text-xs text-brand-200 opacity-80 max-w-[200px]">Energia necessária para manter seu peso atual.</p>
                    </div>
                    <div className="text-right">
                        <p className="text-4xl font-extrabold text-white">{tdee}</p>
                        <p className="text-xs font-bold text-brand-400 uppercase">kcal / dia</p>
                    </div>
                </div>
            )}
        </div>
    );
};

const ORMCalculator = ({ t }: any) => {
    const [lift, setLift] = useState('');
    const [reps, setReps] = useState('');
    const [orm, setOrm] = useState<number | null>(null);

    const calculate = () => {
        if (lift && reps) {
            // Epley Formula
            const w = parseFloat(lift);
            const r = parseFloat(reps);
            if (r === 1) {
                setOrm(w);
            } else {
                const val = w * (1 + r / 30);
                setOrm(Math.round(val));
            }
        }
    };

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{t.tools.orm.title}</h2>
                <p className="text-gray-500">{t.tools.orm.desc}</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <BigInput label={t.tools.orm.lift} value={lift} onChange={setLift} placeholder="100" unit="kg" />
                <BigInput label={t.tools.orm.reps} value={reps} onChange={setReps} placeholder="5" unit="reps" />
            </div>

            <button
                onClick={calculate}
                disabled={!lift || !reps}
                className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
            >
                {t.tools.calculate} <ArrowRight size={18} className="inline ml-2" />
            </button>

            {orm && (
                <div className="bg-gray-100 p-6 rounded-2xl animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-500 font-bold uppercase text-xs">Sua Força Máxima Estimada</span>
                        <Dumbbell className="text-gray-400" size={20} />
                    </div>
                    <div className="text-center py-4">
                        <span className="text-6xl font-black text-gray-900 tracking-tighter">{orm}</span>
                        <span className="text-2xl text-gray-400 font-bold ml-2">kg</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                        <div className="bg-white p-2 rounded-lg shadow-sm">
                            <span className="block text-xs text-gray-400 font-bold">90%</span>
                            <span className="block font-bold text-gray-800">{Math.round(orm * 0.9)}kg</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg shadow-sm">
                            <span className="block text-xs text-gray-400 font-bold">70% (Hipertrofia)</span>
                            <span className="block font-bold text-gray-800">{Math.round(orm * 0.7)}kg</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg shadow-sm">
                            <span className="block text-xs text-gray-400 font-bold">50%</span>
                            <span className="block font-bold text-gray-800">{Math.round(orm * 0.5)}kg</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const BodyFatCalculator = ({ t }: any) => {
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [waist, setWaist] = useState('');
    const [neck, setNeck] = useState('');
    const [hip, setHip] = useState('');
    const [height, setHeight] = useState('');
    const [bf, setBf] = useState<number | null>(null);

    const calculate = () => {
        // US Navy Method
        const h = parseFloat(height);
        const w = parseFloat(waist);
        const n = parseFloat(neck);

        if (gender === 'male' && h && w && n) {
            const res = 495 / (1.0324 - 0.19077 * Math.log10(w - n) + 0.15456 * Math.log10(h)) - 450;
            setBf(parseFloat(res.toFixed(1)));
        } else if (gender === 'female' && h && w && n && hip) {
            const hi = parseFloat(hip);
            const res = 495 / (1.29579 - 0.35004 * Math.log10(w + hi - n) + 0.22100 * Math.log10(h)) - 450;
            setBf(parseFloat(res.toFixed(1)));
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{t.tools.bodyfat.title}</h2>
                <p className="text-gray-500">{t.tools.bodyfat.desc}</p>
            </div>

            <div className="flex gap-4 mb-4">
                <button onClick={() => setGender('male')} className={`flex-1 p-3 rounded-xl border-2 transition-all font-bold ${gender === 'male' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200'}`}>{t.tools.bmr.male}</button>
                <button onClick={() => setGender('female')} className={`flex-1 p-3 rounded-xl border-2 transition-all font-bold ${gender === 'female' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200'}`}>{t.tools.bmr.female}</button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <BigInput label={t.tools.bmi.labelHeight} value={height} onChange={setHeight} placeholder="175" unit="cm" />
                <BigInput label={t.tools.bodyfat.neck} value={neck} onChange={setNeck} placeholder="40" unit="cm" />
                <BigInput label={t.tools.bodyfat.waist} value={waist} onChange={setWaist} placeholder="90" unit="cm" />
                {gender === 'female' && (
                    <BigInput label={t.tools.bodyfat.hip} value={hip} onChange={setHip} placeholder="100" unit="cm" />
                )}
            </div>

            <button
                onClick={calculate}
                disabled={!height || !neck || !waist || (gender === 'female' && !hip)}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg"
            >
                {t.tools.calculate}
            </button>

            {bf && (
                <div className="bg-brand-50 border border-brand-100 p-8 rounded-2xl text-center animate-in fade-in zoom-in">
                    <p className="text-sm text-brand-800 font-bold uppercase tracking-wide mb-2">Gordura Corporal Estimada</p>
                    <p className="text-6xl font-black text-brand-600">{bf}<span className="text-3xl">%</span></p>
                    <div className="mt-4 text-xs text-brand-500 font-medium bg-brand-100 inline-block px-3 py-1 rounded-full">
                        Método US Navy
                    </div>
                </div>
            )}
        </div>
    );
};

const HeartRateCalculator = ({ t }: any) => {
    const [age, setAge] = useState('');
    const [maxHr, setMaxHr] = useState<number | null>(null);

    const calculate = () => {
        if (age) {
            const val = 220 - parseFloat(age);
            setMaxHr(val);
        }
    };

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{t.tools.hr.title}</h2>
                <p className="text-gray-500">{t.tools.hr.desc}</p>
            </div>

            <div className="max-w-xs">
                <BigInput label={t.tools.bmr.labelAge} value={age} onChange={setAge} placeholder="30" unit="anos" />
            </div>

            <button onClick={calculate} disabled={!age} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-red-500/30">
                {t.tools.calculate}
            </button>

            {maxHr && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="text-center mb-6">
                        <span className="text-sm font-bold text-gray-400 uppercase">Frequência Máxima Teórica</span>
                        <div className="text-5xl font-black text-gray-900">{maxHr} <span className="text-xl font-medium text-gray-400">bpm</span></div>
                    </div>

                    <div className="space-y-2">
                        <ZoneBar zone="5" color="bg-red-500" range="90-100%" val={`${Math.round(maxHr * 0.9)} - ${maxHr}`} label="Performance Máxima" />
                        <ZoneBar zone="4" color="bg-orange-500" range="80-90%" val={`${Math.round(maxHr * 0.8)} - ${Math.round(maxHr * 0.9)}`} label="Cardio Intenso" />
                        <ZoneBar zone="3" color="bg-green-500" range="70-80%" val={`${Math.round(maxHr * 0.7)} - ${Math.round(maxHr * 0.8)}`} label="Aeróbico (Queima)" />
                        <ZoneBar zone="2" color="bg-blue-500" range="60-70%" val={`${Math.round(maxHr * 0.6)} - ${Math.round(maxHr * 0.7)}`} label="Queima de Gordura / Aquecimento" />
                    </div>
                </div>
            )}
        </div>
    );
};

const ZoneBar = ({ zone, color, range, val, label }: any) => (
    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center gap-4">
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center text-white font-bold shrink-0`}>Z{zone}</div>
        <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-gray-800 text-sm">{label}</span>
                <span className="text-xs font-bold text-gray-400">{range}</span>
            </div>
            <div className="text-sm font-medium text-gray-600">{val} bpm</div>
        </div>
    </div>
);


const BigInput = ({ label, value, onChange, placeholder, unit }: any) => (
    <div className="w-full">
        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">{label}</label>
        <div className="relative">
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-4 py-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-bold text-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all placeholder-gray-300"
                placeholder={placeholder}
            />
            {unit && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">{unit}</span>}
        </div>
    </div>
);

export default CalculatorsModal;