import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAppDispatch } from '../store/hooks';
import { setCurrentDocId, setCurrentDocument, setDocumentsList } from '../store/slices/documentsSlice';
import { setCells } from '../store/slices/spreadsheetSlice';
import { getDocumentById, getDocumentsList } from '../services/storageService';
import Spreadsheet from '../components/SpreadSheet/SpreadSheet';

const SpreadsheetPage = () => {
    const { documentId } = useParams<{ documentId: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!documentId) {
            navigate('/dashboard');
            return;
        }

        const doc = getDocumentById(documentId);
        
        if (!doc) {
            navigate('/dashboard');
            return;
        }

        const docs = getDocumentsList();
        dispatch(setDocumentsList(docs));
        dispatch(setCurrentDocument(doc));
        dispatch(setCurrentDocId(documentId));
        
        if (doc.cells && doc.cells.length > 0) {
            dispatch(setCells(doc.cells));
        }
        
        setLoading(false);
    }, [documentId, navigate, dispatch]);

    const handleBack = () => {
        dispatch(setCurrentDocId(null));
        navigate('/dashboard');
    };

    if (loading) {
        return <div>Загрузка...</div>;
    }

    return <Spreadsheet onBack={handleBack} />;
};

export default SpreadsheetPage;