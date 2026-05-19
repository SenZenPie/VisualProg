import { useState } from 'react';
import Spreadsheet from './components/SpreadSheet/SpreadSheet';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
    const [currentDocId, setCurrentDocId] = useState<string | null>(null);

    if (currentDocId) {
        return <Spreadsheet documentId={currentDocId} onBack={() => setCurrentDocId(null)} />;
    }

    return <Dashboard onOpenDocument={setCurrentDocId} />;
}

export default App;