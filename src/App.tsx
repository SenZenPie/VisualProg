import { useState } from 'react';
import Spreadsheet from './components/SpreadSheet/SpreadSheet';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
    const [currentDocId, setCurrentDocId] = useState<string | null>(null);

    if (currentDocId) {
        return (
            <div className="app">
                <button className="back-btn" onClick={() => setCurrentDocId(null)}>
                    Назад
                </button>
                <Spreadsheet documentId={currentDocId} />
            </div>
        );
    }

    return <Dashboard onOpenDocument={setCurrentDocId} />;
}

export default App;