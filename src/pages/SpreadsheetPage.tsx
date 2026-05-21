import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAppDispatch } from '../store/hooks';
import { setCurrentDocId } from '../store/slices/documentsSlice';
import Spreadsheet from '../components/SpreadSheet/SpreadSheet';

const SpreadsheetPage = () => {
    const { documentId } = useParams<{ documentId: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (documentId) {
            dispatch(setCurrentDocId(documentId));
        }
    }, [documentId, dispatch]);

    const handleBack = () => {
        dispatch(setCurrentDocId(null));
        navigate('/dashboard');
    };

    return <Spreadsheet onBack={handleBack} />;
};

export default SpreadsheetPage;