import { useState, useEffect } from 'react';
import './FormulaBar.css';

interface FormulaBarProps{
  value: string;
  onChange: (value: string) => void;
  onCommit: () => void;
}

const FormulaBar = ({ value, onChange, onCommit }: FormulaBarProps) =>{
  const [localValue, setLocalValue] = useState(value);

  useEffect(() =>{
    setLocalValue(value);
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) =>{
    if (e.key === 'Enter'){
      onChange(localValue);
      onCommit();
    } else if (e.key === 'Escape'){
      setLocalValue(value);
      onCommit();
    }
  };

  const handleBlur = () =>{
    if (localValue !== value){
      onChange(localValue);
    }
    onCommit();
  };

  return(
    <div className="formula-bar">
      <div className="formula-label">fx</div>
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className="formula-input"
        placeholder="Введите значение или формулу"
      />
    </div>
  );
};

export default FormulaBar;