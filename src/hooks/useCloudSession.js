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
  localReady: false
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
    const localPlayer = players.find((player) => player.id === stateRef.current.playerId);

    setState((prev) => ({
      ...prev,
      status: 'connected',
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
        resetPlayers[p.id] = { ...p, ready: false };
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
    const playerId = createPlayerId();
    const roomCode = createRoomCode();
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
          ready: true
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
    const normalizedCode = (roomCode || '').trim().toUpperCase();
    if (!normalizedCode) {
      setState((prev) => ({ ...prev, status: 'error', error: 'Room code is required.' }));
      return;
    }

    if (normalizedCode.length !== ROOM_CODE_LENGTH) {
      setState((prev) => ({
        ...prev,
        status: 'error',
        error: `Room code must be ${ROOM_CODE_LENGTH} characters.`
      }));
      return;
    }

    const playerId = createPlayerId();
    const roomRef = ref(database, `${ROOMS_ROOT}/${normalizedCode}`);
    const roomSnapshot = await get(roomRef);

    if (!roomSnapshot.exists()) {
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

    await set(playerRef, { id: finalPlayerId, name, ready: false });
    playerRefRef.current = playerRef;
    onDisconnect(playerRef).remove();

    attachRoomListener(normalizedCode);
  };

  const leaveRoom = async (skipStateReset = false) => {
    detachRoomListener();

    if (playerRefRef.current) {
      await remove(playerRefRef.current).catch(() => undefined);
      playerRefRef.current = null;
    }

    const roomRef = roomRefRef.current;
    if (roomRef && stateRef.current.role === 'host') {
      await remove(roomRef).catch(() => undefined);
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
    const { roomCode, role } = stateRef.current;
    if (!roomCode || role !== 'host') return;

    const roomRef = ref(database, `${ROOMS_ROOT}/${roomCode}`);

    await runTransaction(roomRef, (room) => {
      if (!room) return room;

      return {
        ...room,
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

  const isHost = useMemo(() => state.role === 'host', [state.role]);
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
    sendReady
  };
};
