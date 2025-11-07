
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Reading, Averages, Comparison } from '../types';
import { DateIcon, SunIcon, SparklesIcon, MoonIcon, SolarIcon, TrashIcon } from '../constants';

interface HouseViewProps {
  houseId: 'house1' | 'house2';
}

const InputField: React.FC<{
  label: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  icon: React.ReactNode;
}> = ({ label, value, onChange, type = 'number', placeholder, icon }) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {icon}
      </div>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm pl-10 pr-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        {...(type === 'number' ? { min: '0', step: '0.01' } : {})}
      />
    </div>
  </div>
);

const ComparisonDisplay: React.FC<{ comparison: Comparison | null }> = ({ comparison }) => {
    if (!comparison) return null;
    
    const renderDiff = (value: number | null) => {
        if (value === null) return <span className="text-gray-500">-</span>;
        const sign = value > 0 ? '+' : '';
        const color = value > 0 ? 'text-red-400' : 'text-green-400';
        return <span className={color}>{`${sign}${value.toFixed(2)}`}</span>;
    };

    return (
        <div className="bg-gray-800/50 p-4 rounded-lg mt-4 border border-gray-700">
            <h3 className="font-semibold text-lg mb-2 text-center">Change from Previous Reading</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-sm">
                <div><p className="text-gray-400">Day</p><p className="font-mono">{renderDiff(comparison.day)}</p></div>
                <div><p className="text-gray-400">Evening</p><p className="font-mono">{renderDiff(comparison.evening)}</p></div>
                <div><p className="text-gray-400">Night</p><p className="font-mono">{renderDiff(comparison.night)}</p></div>
                <div><p className="text-gray-400">Solar Gen.</p><p className="font-mono">{renderDiff(comparison.solar)}</p></div>
            </div>
        </div>
    );
};

const AveragesDisplay: React.FC<{ averages: Averages | null }> = ({ averages }) => {
    if (!averages) return null;

    return (
        <div className="bg-gray-800/50 p-4 rounded-lg mt-4 border border-gray-700">
            <h3 className="font-semibold text-lg mb-2 text-center">Monthly Averages ({averages.count} days)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-sm">
                <div><p className="text-gray-400">Day</p><p className="font-mono">{averages.day}</p></div>
                <div><p className="text-gray-400">Evening</p><p className="font-mono">{averages.evening}</p></div>
                <div><p className="text-gray-400">Night</p><p className="font-mono">{averages.night}</p></div>
                <div><p className="text-gray-400">Solar Gen.</p><p className="font-mono">{averages.solar}</p></div>
            </div>
        </div>
    );
};


const HouseView: React.FC<HouseViewProps> = ({ houseId }) => {
  const localStorageKey = `electricityReadings_${houseId}`;
  
  const [readings, setReadings] = useState<Reading[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [day, setDay] = useState('');
  const [evening, setEvening] = useState('');
  const [night, setNight] = useState('');
  const [solar, setSolar] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const [comparison, setComparison] = useState<Comparison | null>(null);
  const [averages, setAverages] = useState<Averages | null>(null);

  useEffect(() => {
    try {
      const storedReadings = localStorage.getItem(localStorageKey);
      if (storedReadings) {
        const parsedReadings: Reading[] = JSON.parse(storedReadings);
        // Sort on load to be safe
        parsedReadings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setReadings(parsedReadings);
      }
    } catch (err) {
      console.error("Failed to load readings from localStorage", err);
    }
  }, [localStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(localStorageKey, JSON.stringify(readings));
    } catch (err) {
      console.error("Failed to save readings to localStorage", err);
    }
  }, [readings, localStorageKey]);

  const sortedReadings = useMemo(() => {
    // Already sorted on update, but memoization is good practice
    return [...readings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [readings]);
  
  const handleSaveReading = (e: React.FormEvent) => {
    e.preventDefault();
    if (readings.some(r => r.date === date)) {
      setError(`A reading for ${date} already exists.`);
      return;
    }

    const newReading: Reading = {
      id: Date.now().toString(),
      date,
      day: parseFloat(day),
      evening: parseFloat(evening),
      night: parseFloat(night),
      solar: parseFloat(solar),
    };

    const updatedReadings = [...readings, newReading].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setReadings(updatedReadings);

    // Calculate comparison
    const sortedForComparison = [...updatedReadings].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const newReadingIndex = sortedForComparison.findIndex(r => r.id === newReading.id);
    if (newReadingIndex > 0) {
        const prevReading = sortedForComparison[newReadingIndex - 1];
        setComparison({
            day: newReading.day - prevReading.day,
            evening: newReading.evening - prevReading.evening,
            night: newReading.night - prevReading.night,
            solar: newReading.solar - prevReading.solar,
        });
    } else {
        setComparison(null);
    }

    // Reset form
    setDate(new Date().toISOString().split('T')[0]);
    setDay('');
    setEvening('');
    setNight('');
    setSolar('');
    setError(null);
    setAverages(null); // Clear averages as data has changed
  };

  const handleComputeAverages = () => {
    if (!date) {
        setError("Please select a date to determine the month for averaging.");
        return;
    }
    const targetMonth = new Date(date).getMonth();
    const targetYear = new Date(date).getFullYear();

    const monthReadings = readings.filter(r => {
        const rDate = new Date(r.date);
        return rDate.getMonth() === targetMonth && rDate.getFullYear() === targetYear;
    });

    if (monthReadings.length === 0) {
        setAverages(null);
        setError("No readings found for the selected month.");
        return;
    }

    const sums = monthReadings.reduce((acc, r) => ({
        day: acc.day + r.day,
        evening: acc.evening + r.evening,
        night: acc.night + r.night,
        solar: acc.solar + r.solar
    }), { day: 0, evening: 0, night: 0, solar: 0 });

    const count = monthReadings.length;
    setAverages({
        day: (sums.day / count).toFixed(2),
        evening: (sums.evening / count).toFixed(2),
        night: (sums.night / count).toFixed(2),
        solar: (sums.solar / count).toFixed(2),
        count: count,
    });
    setError(null);
  };
  
  const handleDeleteReading = useCallback((id: string) => {
    if(window.confirm("Are you sure you want to delete this entry?")) {
        setReadings(prev => prev.filter(r => r.id !== id));
        setAverages(null);
        setComparison(null);
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Form Card */}
      <div className="bg-gray-800 rounded-lg shadow-xl p-4 sm:p-6">
        <form onSubmit={handleSaveReading} className="space-y-4">
          <InputField label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} icon={<DateIcon />} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Day Reading (6am-6pm)" value={day} onChange={e => setDay(e.target.value)} placeholder="e.g., 10.5" icon={<SunIcon />} />
            <InputField label="Evening Reading (6pm-10pm)" value={evening} onChange={e => setEvening(e.target.value)} placeholder="e.g., 4.2" icon={<SparklesIcon />} />
            <InputField label="Night Reading (10pm-6am)" value={night} onChange={e => setNight(e.target.value)} placeholder="e.g., 3.1" icon={<MoonIcon />} />
            <InputField label="Net Solar Generation" value={solar} onChange={e => setSolar(e.target.value)} placeholder="e.g., 15.3" icon={<SolarIcon />} />
          </div>
          {error && <p className="text-sm text-red-400 text-center">{error}</p>}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 shadow-md">
              Save Reading
            </button>
            <button type="button" onClick={handleComputeAverages} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 shadow-md">
              Compute Monthly Average
            </button>
          </div>
        </form>
      </div>

      {/* Results Display */}
      { (comparison || averages) &&
        <div className="space-y-4">
            <ComparisonDisplay comparison={comparison} />
            <AveragesDisplay averages={averages} />
        </div>
      }

      {/* History Card */}
      <div className="bg-gray-800 rounded-lg shadow-xl p-4 sm:p-6">
        <h2 className="text-xl font-bold mb-4 text-center">Reading History</h2>
        <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
          {sortedReadings.length > 0 ? (
            sortedReadings.map(r => (
              <div key={r.id} className="bg-gray-700/50 p-3 rounded-lg flex items-center justify-between shadow-sm border border-gray-700">
                <div>
                  <p className="font-bold text-white">{new Date(r.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-xs text-gray-300 mt-2">
                    <span>Day: <b className="font-mono text-white">{r.day}</b></span>
                    <span>Evening: <b className="font-mono text-white">{r.evening}</b></span>
                    <span>Night: <b className="font-mono text-white">{r.night}</b></span>
                    <span>Solar: <b className="font-mono text-green-400">{r.solar}</b></span>
                  </div>
                </div>
                <button onClick={() => handleDeleteReading(r.id)} className="p-2 text-gray-400 hover:text-white hover:bg-red-600 rounded-full transition-colors duration-200">
                    <TrashIcon />
                </button>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400 py-4">No readings recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HouseView;
