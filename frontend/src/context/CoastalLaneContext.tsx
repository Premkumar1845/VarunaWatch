'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { COASTAL_LANES, CoastalLane, getCoastalLane } from '@/lib/coastalLanes';

interface CoastalLaneContextType {
  currentLane: CoastalLane;
  setLaneId: (id: string) => void;
  lanes: CoastalLane[];
  isInfoOpen: boolean;
  setIsInfoOpen: (open: boolean) => void;
  toggleInfo: () => void;
}

const CoastalLaneContext = createContext<CoastalLaneContextType>({
  currentLane: COASTAL_LANES[0],
  setLaneId: () => {},
  lanes: COASTAL_LANES,
  isInfoOpen: false,
  setIsInfoOpen: () => {},
  toggleInfo: () => {},
});

export const CoastalLaneProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedLaneId, setSelectedLaneId] = useState<string>('all');
  const [isInfoOpen, setIsInfoOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('vw-coastal-lane');
      if (saved && COASTAL_LANES.some((l) => l.id === saved)) {
        setSelectedLaneId(saved);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleSetLaneId = (id: string) => {
    setSelectedLaneId(id);
    try {
      localStorage.setItem('vw-coastal-lane', id);
    } catch (e) {
      // ignore
    }
  };

  const toggleInfo = () => setIsInfoOpen((prev) => !prev);

  const currentLane = getCoastalLane(selectedLaneId);

  return (
    <CoastalLaneContext.Provider
      value={{
        currentLane,
        setLaneId: handleSetLaneId,
        lanes: COASTAL_LANES,
        isInfoOpen,
        setIsInfoOpen,
        toggleInfo,
      }}
    >
      {children}
    </CoastalLaneContext.Provider>
  );
};

export const useCoastalLane = () => useContext(CoastalLaneContext);
