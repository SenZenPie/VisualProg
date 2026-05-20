import { useAppSelector, useAppDispatch } from './store/hooks';
import { setCurrentDocId } from './store/slices/documentsSlice';
import Spreadsheet from './components/SpreadSheet/SpreadSheet';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
    const currentDocId = useAppSelector((state) => state.documents.currentDocId);
    const dispatch = useAppDispatch();

    if (currentDocId) {
        return (
            <div className="app">
                <Spreadsheet onBack={() => dispatch(setCurrentDocId(null))} />
            </div>
        );
    }

    return <Dashboard />;
}

export default App;