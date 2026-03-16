import { useState, useCallback } from 'react';

const WINNING_COMBINATIONS = [
  // Rows
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24],
  // Columns
  [0, 5, 10, 15, 20],
  [1, 6, 11, 16, 21],
  [2, 7, 12, 17, 22],
  [3, 8, 13, 18, 23],
  [4, 9, 14, 19, 24],
  // Diagonals
  [0, 6, 12, 18, 24],
  [4, 8, 12, 16, 20]
];

const shuffleArray = (array) => {
  let newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

const generateEmptyBoard = () => {
  return Array.from({ length: 25 }, () => ({ value: null, marked: false }));
};

export const useBingoGame = () => {
  const [board, setBoard] = useState(generateEmptyBoard());
  const [isSetupPhase, setIsSetupPhase] = useState(true);
  const [nextNumberToPlace, setNextNumberToPlace] = useState(1);
  const [markedHistory, setMarkedHistory] = useState([]);
  const [bingoCount, setBingoCount] = useState(0); // 0 to 5
  const [winningIndexes, setWinningIndexes] = useState(new Set());
  
  const checkBingo = useCallback((currentBoard) => {
    let completedLines = 0;
    const newWinningIndexes = new Set();

    for (const combo of WINNING_COMBINATIONS) {
      if (combo.every(index => currentBoard[index].marked)) {
        completedLines++;
        combo.forEach(idx => newWinningIndexes.add(idx));
      }
    }
    
    setBingoCount(Math.min(completedLines, 5));
    setWinningIndexes(newWinningIndexes);
  }, []);

  const toggleTile = (index) => {
    if (isSetupPhase) {
      if (board[index].value === null) {
        setBoard(prev => {
          const newBoard = [...prev];
          newBoard[index] = { ...newBoard[index], value: nextNumberToPlace };
          return newBoard;
        });
        if (nextNumberToPlace >= 25) {
          setIsSetupPhase(false);
        } else {
          setNextNumberToPlace(prev => prev + 1);
        }
      }
    } else {
      // Play phase logic: Mark tile manually when called out
      if (!board[index].marked) {
        setBoard(prevBoard => {
          const newBoard = [...prevBoard];
          newBoard[index] = { ...newBoard[index], marked: true };
          checkBingo(newBoard);
          return newBoard;
        });
        setMarkedHistory(prev => [...prev, index]);
      }
    }
  };

  const markNumber = (number) => {
    if (isSetupPhase) return;
    const index = board.findIndex(tile => tile.value === number);
    if (index === -1) return;
    if (board[index].marked) return;

    setBoard(prevBoard => {
      const newBoard = [...prevBoard];
      newBoard[index] = { ...newBoard[index], marked: true };
      checkBingo(newBoard);
      return newBoard;
    });
  };

  const autoFillRemaining = () => {
    if (!isSetupPhase) return;
    setBoard(prev => {
      const newBoard = [...prev];
      const emptyIndexes = [];
      newBoard.forEach((tile, idx) => {
        if (tile.value === null) emptyIndexes.push(idx);
      });
      
      const numbersToPlace = Array.from({ length: 26 - nextNumberToPlace }, (_, i) => i + nextNumberToPlace);
      const shuffledNumbers = shuffleArray(numbersToPlace);
      
      emptyIndexes.forEach((idx, i) => {
        newBoard[idx] = { ...newBoard[idx], value: shuffledNumbers[i] };
      });
      
      return newBoard;
    });
    setNextNumberToPlace(26);
    setIsSetupPhase(false);
  };

  const undoLastMark = () => {
    if (isSetupPhase || markedHistory.length === 0) return;
    
    setMarkedHistory(prev => {
      const newHistory = [...prev];
      const lastMarkedIndex = newHistory.pop();
      
      setBoard(prevBoard => {
        const newBoard = [...prevBoard];
        newBoard[lastMarkedIndex] = { ...newBoard[lastMarkedIndex], marked: false };
        checkBingo(newBoard);
        return newBoard;
      });
      
      return newHistory;
    });
  };

  const restartGame = () => {
    setBoard(generateEmptyBoard());
    setIsSetupPhase(true);
    setNextNumberToPlace(1);
    setMarkedHistory([]);
    setBingoCount(0);
    setWinningIndexes(new Set());
  };

  const getBingoWord = () => {
    const word = "BINGO";
    return word.substring(0, bingoCount);
  };

  return {
    board,
    isSetupPhase,
    nextNumberToPlace,
    bingoWord: getBingoWord(),
    isWin: bingoCount >= 5,
    toggleTile,
    markNumber,
    autoFillRemaining,
    undoLastMark,
    restartGame,
    canUndo: markedHistory.length > 0,
    winningIndexes,
    hasStarted: nextNumberToPlace > 1 || !isSetupPhase
  };
};
