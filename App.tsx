
import React, { useState } from 'react';
import HouseView from './components/HouseView';

type HouseId = 'house1' | 'house2';

const App: React.FC = () => {
  const [activeHouse, setActiveHouse] = useState<HouseId>('house1');

  const TabButton = ({ houseId, label }: { houseId: HouseId, label: string }) => (
    <button
      onClick={() => setActiveHouse(houseId)}
      className={`w-full py-3 text-sm font-bold uppercase tracking-wider transition-colors duration-300 focus:outline-none ${
        activeHouse === houseId
          ? 'bg-blue-600 text-white'
          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-900 font-sans">
      <header className="bg-gray-800 shadow-lg sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-white text-center tracking-tight">
            Home Electricity Tracker
          </h1>
        </div>
        <div className="flex">
          <TabButton houseId="house1" label="House 1" />
          <TabButton houseId="house2" label="House 2" />
        </div>
      </header>

      <main className="p-2 sm:p-4">
        <div className="max-w-4xl mx-auto">
          {activeHouse === 'house1' && <HouseView key="house1" houseId="house1" />}
          {activeHouse === 'house2' && <HouseView key="house2" houseId="house2" />}
        </div>
      </main>
    </div>
  );
};

export default App;
