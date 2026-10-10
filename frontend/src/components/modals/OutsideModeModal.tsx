import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Footprints, Wind, Sun, Leaf, Heart, CheckCircle2, Clock } from 'lucide-react';
import { useGarden } from '../../context/GardenContext';

const SENSORY_PROMPTS = [
  'Look up: Notice how the sunlight filters through the canopy overhead.',
  'Observe leaf edges: Are they smooth, serrated, or lobed?',
  'Close your eyes for 30 seconds: Count how many distinct bird or wind sounds you hear.',
  'Gently touch a tree bark or leaf surface: Is it waxy, fuzzy, rough, or cool?',
  'Find one wildflower or moss patch thriving in an unexpected spot.'
];

export const OutsideModeModal: React.FC = () => {
  const { isOutsideModeActive, stopOutsideMode, logOutsideObservation } = useGarden();

  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [promptIndex, setPromptIndex] = useState(0);
  const [showLogForm, setShowLogForm] = useState(false);
  const [locationName, setLocationName] = useState('');
  const [floraObserved, setFloraObserved] = useState('');
  const [sensoryNotes, setSensoryNotes] = useState('');
  const [weatherCondition, setWeatherCondition] = useState('Sunny / Breezy');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isOutsideModeActive && isRunning) {
      interval = setInterval(() => {
        setSessionSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOutsideModeActive, isRunning]);

  // Rotate prompts every 25 seconds
  useEffect(() => {
    if (!isOutsideModeActive) return;
    const pInterval = setInterval(() => {
      setPromptIndex(prev => (prev + 1) % SENSORY_PROMPTS.length);
    }, 25000);
    return () => clearInterval(pInterval);
  }, [isOutsideModeActive]);

  if (!isOutsideModeActive) return null;

  const minutes = Math.floor(sessionSeconds / 60);
  const seconds = sessionSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const handleFinishSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const floraList = floraObserved
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      await logOutsideObservation({
        durationMinutes: Math.max(1, minutes),
        locationDescription: locationName || 'Neighborhood Park / Nature Trail',
        floraObserved: floraList.length > 0 ? floraList : ['Oak Trees', 'Wild Grasses'],
        sensoryNotes: sensoryNotes || 'Felt refreshed and grounded by the outdoor breeze.',
        weatherCondition
      });

      stopOutsideMode();
      setShowLogForm(false);
      setSessionSeconds(0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/85 backdrop-blur-md">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg bg-gradient-to-b from-forest-900 via-forest-900 to-forest-950 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 text-white shadow-2xl overflow-hidden"
        >
          
          {/* Ambient decorative glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={stopOutsideMode}
            className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {!showLogForm ? (
            <div className="text-center space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
                <Footprints className="w-4 h-4 text-emerald-400" />
                Go Outside Observation Mode
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold font-display text-emerald-50 mb-2">
                  Touch Grass & Disconnect
                </h2>
                <p className="text-stone-300 text-xs sm:text-sm max-w-sm mx-auto">
                  Put your phone down, step into fresh air, and engage your senses with real living ecosystems.
                </p>
              </div>

              {/* Outdoor Session Timer */}
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center">
                <Clock className="w-6 h-6 text-emerald-400 mb-1" />
                <span className="text-4xl sm:text-5xl font-extrabold font-mono tracking-wider text-emerald-300">
                  {formattedTime}
                </span>
                <span className="text-xs text-stone-400 mt-1">Active Outdoor Time</span>
              </div>

              {/* Sensory Mindfulness Prompt */}
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/50 text-left flex items-start gap-3">
                <Wind className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1">
                    Sensory Observation
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-200 italic">
                    "{SENSORY_PROMPTS[promptIndex]}"
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => setShowLogForm(true)}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-forest-950 font-bold rounded-2xl shadow-lg shadow-emerald-900/40 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5 text-forest-950" />
                  Log Observation & Earn 25 Coins
                </button>
                <button
                  onClick={stopOutsideMode}
                  className="py-3 px-4 bg-white/10 hover:bg-white/15 text-stone-300 rounded-2xl text-xs font-semibold transition-colors"
                >
                  Exit Mode
                </button>
              </div>

            </div>
          ) : (
            /* Log Nature Observation Form */
            <form onSubmit={handleFinishSession} className="space-y-4">
              
              <div>
                <h3 className="text-xl font-bold font-display text-emerald-100 mb-1">
                  Record Your Nature Walk
                </h3>
                <p className="text-xs text-stone-300">
                  Document what you saw and felt. Earn 25 Flora Coins + 30 XP for spending {Math.max(1, minutes)} minutes outdoors!
                </p>
              </div>

              <div className="space-y-3 text-left">
                <div>
                  <label className="block text-xs font-semibold text-emerald-200 mb-1">
                    Where did you explore?
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. City Botanical Garden, Pine Trail, Backyard"
                    value={locationName}
                    onChange={e => setLocationName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-forest-800/80 border border-emerald-500/30 text-white placeholder-stone-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-200 mb-1">
                    Plants, trees or wildlife observed (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. White Clover, Dandelion, Oak sapling, Song sparrow"
                    value={floraObserved}
                    onChange={e => setFloraObserved(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-forest-800/80 border border-emerald-500/30 text-white placeholder-stone-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-200 mb-1">
                    Sensory Reflections & Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. The soil was moist after morning rain. Wild bees were busy on the yellow clover..."
                    value={sensoryNotes}
                    onChange={e => setSensoryNotes(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-forest-800/80 border border-emerald-500/30 text-white placeholder-stone-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-200 mb-1">
                    Weather & Conditions
                  </label>
                  <select
                    value={weatherCondition}
                    onChange={e => setWeatherCondition(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-forest-800/80 border border-emerald-500/30 text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    <option value="Sunny / Clear Sky">Sunny & Warm</option>
                    <option value="Partly Cloudy / Breezy">Partly Cloudy & Breezy</option>
                    <option value="Dappled Sunlight / Forest Canopy">Dappled Canopy Light</option>
                    <option value="Misty / Fresh Rain">Misty / Post-Rain Damp</option>
                    <option value="Crisp Autumn / Golden Hour">Crisp Golden Hour</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-forest-950 font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Heart className="w-4 h-4 fill-forest-950" />
                  {isSubmitting ? 'Saving...' : 'Submit & Claim Reward'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowLogForm(false)}
                  className="py-3 px-4 bg-white/10 hover:bg-white/15 text-stone-300 rounded-xl text-xs font-semibold"
                >
                  Back
                </button>
              </div>

            </form>
          )}

        </motion.div>

      </div>
    </AnimatePresence>
  );
};
