import { useEffect, useMemo, useRef, useState } from 'react';
import {
  get,
  off,
  onDisconnect,
  onValue,
  ref,
  remove,
  runTransaction,
  set,
  update
} from 'firebase/database';
import { database } from '../firebase/client';

const ROOMS_ROOT = 'bingoRooms';
const ROOM_CODE_LENGTH = 4;

const initialState = {
  status: 'idle',
  role: null,
  roomCode: null,
  players: [],
  playerId: null,
  hostInfo: null,
  inGame: false,
  currentTurnPlayerId: null,
  calledNumbers: [],
  lastCalledNumber: null,
  winners: [],
  resetCounter: 0,
  error: null,
  localReady: false,
  localBoardReady: false
};

const createPlayerId = () => `p_${Math.random().toString(36).slice(2, 10)}`;

const createRoomCode = () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < ROOM_CODE_LENGTH; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
};

const getNextTurnPlayerId = (players, currentPlayerId) => {
  if (!players.length) return null;
  const currentIndex = players.findIndex((player) => player.id === currentPlayerId);
  const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % players.length;
  return players[nextIndex]?.id ?? null;
};

export const useCloudSession = () => {
  const [state, setState] = useState(initialState);
  const stateRef = useRef(state);
  const roomRefRef = useRef(null);
  const playerRefRef = useRef(null);
  const roomListenerRef = useRef(null);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const syncFromRoom = (roomCode, roomData) => {
    const players = Object.values(roomData.players || {});
    const game = roomData.game || {};
    const myId = stateRef.current.playerId;
    const localPlayer = players.find((player) => player.id === myId);

    // If we were in the room but are no longer in the player list, we got kicked
    if (!localPlayer && myId && stateRef.current.status === 'connected') {
      detachRoomListener();
      roomRefRef.current = null;
      playerRefRef.current = null;
      setState({ ...initialState, error: 'You have been removed from the room.' });
      return;
    }

    const derivedRole = roomData.hostId === myId ? 'host' : 'client';

    setState((prev) => ({
      ...prev,
      status: 'connected',
      role: derivedRole,
      roomCode,
      hostInfo: { roomCode },
      players,
      inGame: !!game.inGame,
      currentTurnPlayerId: game.currentTurnPlayerId ?? null,
      calledNumbers: game.calledNumbers || [],
      lastCalledNumber: game.lastCalledNumber ?? null,
      winners: game.winners || [],
      resetCounter: game.resetCounter ?? 0,
      error: null,
      localReady: localPlayer ? localPlayer.ready : false,
      localBoardReady: localPlayer ? localPlayer.boardReady : false,
      hostId: roomData.hostId
    }));
  };

  const detachRoomListener = () => {
    if (roomListenerRef.current) {
      off(roomListenerRef.current);
      roomListenerRef.current = null;
    }
  };

  const attachRoomListener = (roomCode) => {
    const roomRef = ref(database, `${ROOMS_ROOT}/${roomCode}`);
    roomRefRef.current = roomRef;
    roomListenerRef.current = roomRef;

    onValue(roomRef, (snapshot) => {
      const roomData = snapshot.val();
      if (!roomData) {
        setState((prev) => ({ ...prev, status: 'error', error: 'Room ended by host.' }));
        return;
      }
      syncFromRoom(roomCode, roomData);

      const players = Object.values(roomData.players || {});
      const isHost = roomData.hostId === stateRef.current.playerId;
    });
  };

  const setPlayerReady = async (isReady) => {
    if (!stateRef.current.roomCode || !stateRef.current.playerId) return;
    const playerRef = ref(database, `${ROOMS_ROOT}/${stateRef.current.roomCode}/players/${stateRef.current.playerId}`);
    await update(playerRef, { ready: isReady });
  };

  const sendReady = async () => {
    await setPlayerReady(true);
  };

  const sendBoardReady = async (isReady) => {
    if (!stateRef.current.roomCode || !stateRef.current.playerId) return;
    const playerRef = ref(database, `${ROOMS_ROOT}/${stateRef.current.roomCode}/players/${stateRef.current.playerId}`);
    await update(playerRef, { boardReady: isReady });
  };

  const sendBingoProgress = async (lettersCount) => {
    if (!stateRef.current.roomCode || !stateRef.current.playerId) return;
    const playerRef = ref(database, `${ROOMS_ROOT}/${stateRef.current.roomCode}/players/${stateRef.current.playerId}`);
    await update(playerRef, { bingoProgress: lettersCount });
  };

  const updatePlayerName = async (newName) => {
    if (!stateRef.current.roomCode || !stateRef.current.playerId) return;
    const playerRef = ref(database, `${ROOMS_ROOT}/${stateRef.current.roomCode}/players/${stateRef.current.playerId}`);
    await update(playerRef, { name: newName });
  };

  const kickPlayer = async (playerIdToKick) => {
    if (!stateRef.current.roomCode || !stateRef.current.playerId) return;
    // Only the current host (from Firebase) can kick
    if (stateRef.current.hostId !== stateRef.current.playerId) return;
    const playerRef = ref(database, `${ROOMS_ROOT}/${stateRef.current.roomCode}/players/${playerIdToKick}`);
    await remove(playerRef);
  };

  const transferHost = async (newHostId) => {
    if (!stateRef.current.roomCode || !stateRef.current.playerId) return;
    if (stateRef.current.hostId !== stateRef.current.playerId) return;
    const roomRef = ref(database, `${ROOMS_ROOT}/${stateRef.current.roomCode}`);
    await update(roomRef, { hostId: newHostId });
  };


  const startGame = async () => {
    if (!roomRefRef.current) return;

    await runTransaction(roomRefRef.current, (room) => {
      if (!room) return room;
      const players = Object.values(room.players || {});
      if (room.game?.inGame || players.length < 2) {
        return room;
      }

      const startIndex = Math.floor(Math.random() * players.length);
      const startPlayerId = players[startIndex]?.id ?? null;

      const resetPlayers = {};
      players.forEach(p => {
        resetPlayers[p.id] = { ...p, ready: false, boardReady: false };
      });

      return {
        ...room,
        players: resetPlayers,
        game: {
          ...(room.game || {}),
          inGame: true,
          currentTurnPlayerId: startPlayerId,
          calledNumbers: [],
          lastCalledNumber: null,
          winners: [],
          resetCounter: room.game?.resetCounter ?? 0
        }
      };
    });
  };

  const createRoom = async ({ name }) => {
    if (stateRef.current.status === 'connecting' || stateRef.current.status === 'connected') return;
    stateRef.current = { ...stateRef.current, status: 'connecting' };
    
    const roomCode = createRoomCode();
    const playerId = createPlayerId();
    const roomRef = ref(database, `${ROOMS_ROOT}/${roomCode}`);
    const playerRef = ref(database, `${ROOMS_ROOT}/${roomCode}/players/${playerId}`);

    setState({ ...initialState, status: 'connecting', role: 'host', playerId, roomCode });

    await set(roomRef, {
      hostId: playerId,
      createdAt: Date.now(),
      players: {
        [playerId]: {
          id: playerId,
          name,
          ready: true,
          boardReady: false
        }
      },
      game: {
        inGame: false,
        currentTurnPlayerId: null,
        calledNumbers: [],
        lastCalledNumber: null,
        winners: [],
        resetCounter: 0
      }
    });

    playerRefRef.current = playerRef;
    onDisconnect(playerRef).remove();
    attachRoomListener(roomCode);
  };

  const joinRoom = async ({ roomCode, name }) => {
    if (stateRef.current.status === 'connecting' || stateRef.current.status === 'connected') return;
    stateRef.current = { ...stateRef.current, status: 'connecting' };
    
    setState((prev) => ({ ...prev, status: 'connecting', error: null }));

    const normalizedCode = (roomCode || '').trim().toUpperCase();
    if (!normalizedCode) {
      stateRef.current.status = 'error';
      setState((prev) => ({ ...prev, status: 'error', error: 'Room code is required.' }));
      return;
    }

    if (normalizedCode.length !== ROOM_CODE_LENGTH) {
      stateRef.current = { ...stateRef.current, status: 'error' };
      setState((prev) => ({
        ...prev,
        status: 'error',
        error: `Room code must be ${ROOM_CODE_LENGTH} characters.`
      }));
      return;
    }

    const roomRef = ref(database, `${ROOMS_ROOT}/${normalizedCode}`);
    const roomSnapshot = await get(roomRef);

    if (!roomSnapshot.exists()) {
      stateRef.current = { ...stateRef.current, status: 'error' };
      setState((prev) => ({ ...prev, status: 'error', error: 'Room not found.' }));
      return;
    }

    const roomData = roomSnapshot.val();

    let finalPlayerId = createPlayerId();
    if (roomData.players) {
      const existingEntry = Object.entries(roomData.players).find(([_, p]) => p.name === name);
      if (existingEntry) {
        finalPlayerId = existingEntry[0];
      }
    }

    const playerRef = ref(database, `${ROOMS_ROOT}/${normalizedCode}/players/${finalPlayerId}`);

    setState({
      ...initialState,
      status: 'connecting',
      role: roomData.hostId === finalPlayerId ? 'host' : 'client',
      playerId: finalPlayerId,
      roomCode: normalizedCode,
      hostInfo: { roomCode: normalizedCode }
    });

    await set(playerRef, { id: finalPlayerId, name, ready: true, boardReady: false });
    playerRefRef.current = playerRef;
    onDisconnect(playerRef).remove();

    attachRoomListener(normalizedCode);
  };

  const returnToLobby = async () => {
    const { roomCode, playerId } = stateRef.current;
    if (!roomCode || !playerId) return;

    // Mark self as ready
    const playerRef = ref(database, `${ROOMS_ROOT}/${roomCode}/players/${playerId}`);
    await update(playerRef, { ready: true, boardReady: false });
  };

  const leaveRoom = async (skipStateReset = false) => {
    detachRoomListener();

    if (playerRefRef.current) {
      await remove(playerRefRef.current).catch(() => undefined);
      playerRefRef.current = null;
    }

    // Only delete the entire room if we are the current host
    const roomRef = roomRefRef.current;
    if (roomRef && stateRef.current.hostId === stateRef.current.playerId) {
      const otherPlayer = stateRef.current.players.find(p => p.id !== stateRef.current.playerId);
      if (otherPlayer) {
        await update(roomRef, { hostId: otherPlayer.id }).catch(() => undefined);
      } else {
        await remove(roomRef).catch(() => undefined);
      }
    }

    roomRefRef.current = null;
    if (!skipStateReset) {
      setState(initialState);
    }
  };

  const sendCall = async (number) => {
    const { roomCode, playerId } = stateRef.current;
    if (!roomCode || !playerId) return;

    const roomRef = ref(database, `${ROOMS_ROOT}/${roomCode}`);

    await runTransaction(roomRef, (room) => {
      if (!room || !room.game?.inGame || (room.game?.winners && room.game?.winners.length > 0)) return room;
      if (room.game.currentTurnPlayerId !== playerId) return room;

      const calledNumbers = room.game.calledNumbers || [];
      if (calledNumbers.includes(number)) return room;

      const players = Object.values(room.players || {});
      const nextTurnPlayerId = getNextTurnPlayerId(players, playerId);

      return {
        ...room,
        game: {
          ...(room.game || {}),
          calledNumbers: [...calledNumbers, number],
          lastCalledNumber: number,
          currentTurnPlayerId: nextTurnPlayerId
        }
      };
    });
  };

  const sendReset = async () => {
    const { roomCode, playerId, hostId } = stateRef.current;
    if (!roomCode || hostId !== playerId) return;

    const roomRef = ref(database, `${ROOMS_ROOT}/${roomCode}`);

    await runTransaction(roomRef, (room) => {
      if (!room) return room;

      // Mark the host as ready when resetting
      const players = room.players || {};
      const updatedPlayers = {};
      Object.keys(players).forEach(pid => {
        updatedPlayers[pid] = { ...players[pid], boardReady: false };
      });

      return {
        ...room,
        players: updatedPlayers,
        game: {
          ...(room.game || {}),
          inGame: false,
          calledNumbers: [],
          lastCalledNumber: null,
          currentTurnPlayerId: null,
          winners: [],
          resetCounter: (room.game?.resetCounter || 0) + 1
        }
      };
    });
  };

  const sendWin = async () => {
    const { roomCode, playerId } = stateRef.current;
    if (!roomCode || !playerId) return;

    const roomRef = ref(database, `${ROOMS_ROOT}/${roomCode}`);

    await runTransaction(roomRef, (room) => {
      if (!room) return room;
      const currentWinners = room.game?.winners || [];
      if (currentWinners.includes(playerId)) return room;
      
      return {
        ...room,
        game: {
          ...(room.game || {}),
          winners: [...currentWinners, playerId],
          inGame: false
        }
      };
    });
  };

  useEffect(() => {
    return () => {
      leaveRoom(true);
    };
  }, []);

  const isHost = useMemo(() => state.hostId === state.playerId, [state.hostId, state.playerId]);
  const isYourTurn = useMemo(
    () => state.inGame && state.currentTurnPlayerId === state.playerId,
    [state.currentTurnPlayerId, state.inGame, state.playerId]
  );

  return {
    ...state,
    isHost,
    isYourTurn,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    sendCall,
    sendReset,
    sendWin,
    setPlayerReady,
    sendReady,
    sendBoardReady,
    updatePlayerName,
    kickPlayer,
    transferHost,
    returnToLobby,
    sendBingoProgress
  };
};
