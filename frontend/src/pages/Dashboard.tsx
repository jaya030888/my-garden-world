import React, { useState } from 'react';
import { CozyGardenWorld } from '../components/garden/CozyGardenWorld';
import { GardenShopDrawer } from '../components/garden/GardenShopDrawer';
import { AIScannerModal } from '../components/garden/AIScannerModal';
import { FieldJournalModal } from '../components/garden/FieldJournalModal';
import { QuestsDrawer } from '../components/garden/QuestsDrawer';

export const DashboardPage: React.FC = () => {
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [isQuestsOpen, setIsQuestsOpen] = useState(false);

  return (
    <div className="relative min-h-screen">
      {/* Primary Interactive Virtual Garden Experience */}
      <CozyGardenWorld
        onOpenShop={() => setIsShopOpen(true)}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenJournal={() => setIsJournalOpen(true)}
        onOpenQuests={() => setIsQuestsOpen(true)}
      />

      {/* Non-Intrusive Overlays & Drawers */}
      <GardenShopDrawer isOpen={isShopOpen} onClose={() => setIsShopOpen(false)} />
      <AIScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />
      <FieldJournalModal isOpen={isJournalOpen} onClose={() => setIsJournalOpen(false)} />
      <QuestsDrawer isOpen={isQuestsOpen} onClose={() => setIsQuestsOpen(false)} />
    </div>
  );
};
