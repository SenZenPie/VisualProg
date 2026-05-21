import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setCurrentDocId, setCurrentDocument, setDocumentsList } from '../store/slices/documentsSlice';
import { setCells } from '../store/slices/spreadsheetSlice';
import { getDocumentById, getDocumentsList } from '../services/storageService';
import type { Cell } from '../types/spreadsheet';
import Spreadsheet from '../components/SpreadSheet/SpreadSheet';

const SpreadsheetPage = () => {
    const { documentId } = useParams<{ documentId: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const userId = useAppSelector((state) => state.auth.user?.id);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!documentId || !userId) {
            navigate('/dashboard');
            return;
        }

        const doc = getDocumentById(documentId, userId);
        
        if (!doc) {
            setError('403');
            setTimeout(() => navigate('/dashboard'), 2000);
            return;
        }

        const docs = getDocumentsList(userId);
        dispatch(setDocumentsList(docs));
        dispatch(setCurrentDocument(doc));
        dispatch(setCurrentDocId(documentId));
        
        if (doc.cells && doc.cells.length > 0) {
            dispatch(setCells(doc.cells));
        } else {
            const initCellsFunction = (rows: number, cols: number): Cell[][] => {
                const newCells: Cell[][] = [];
                for (let i = 0; i < rows; i++) {
                    newCells[i] = [];
                    for (let j = 0; j < cols; j++) {
                        newCells[i][j] = {
                            value: null,
                            formattedValue: '',
                            formula: null,
                            style: {
                                bold: false,
                                italic: false,
                                underline: false,
                                textColor: '#000000',
                                bgColor: '#ffffff',
                                align: 'left',
                                format: 'text'
                            }
                        };
                    }
                }
                return newCells;
            };
            dispatch(setCells(initCellsFunction(doc.rows, doc.cols)));
        }
        
        setLoading(false);
    }, [documentId, userId, navigate, dispatch]);

    if (error === '403') {
        return (
            <div className="auth-page">
                <div className="auth-container">
                    <h1>403 - Доступ запрещён</h1>
                    <p>У вас нет доступа к этому документу</p>
                    <p>Перенаправление на главную...</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return <div>Загрузка...</div>;
    }

    return <Spreadsheet />;
};

export default SpreadsheetPage;