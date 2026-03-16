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
  localReady: false,
  winnerId: null,
  resetCounter: 0,
  error: null
};

const createPlayerId = () => `p_${Math.random().toString(36).slice(2, 10)}`;

const createRoomCode = () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i += 1) {
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
      winnerId: game.winnerId ?? null,
      resetCounter: game.resetCounter ?? 0,
      localReady: localPlayer ? !!localPlayer.ready : prev.localReady,
      error: null
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
    });
  };

  const attemptAutoStart = async () => {
    if (!roomRefRef.current) return;

    await runTransaction(roomRefRef.current, (room) => {
      if (!room) return room;
      const players = Object.values(room.players || {});
      if (room.game?.inGame || players.length < 2 || !players.every((player) => player.ready)) {
        return room;
      }

      const startIndex = Math.floor(Math.random() * players.length);
      const startPlayerId = players[startIndex]?.id ?? null;

      return {
        ...room,
        game: {
          ...(room.game || {}),
          inGame: true,
          currentTurnPlayerId: startPlayerId,
          calledNumbers: [],
          lastCalledNumber: null,
          winnerId: null,
          resetCounter: room.game?.resetCounter ?? 0
        }
      };
    });
  };

  const createRoom = async ({ name }) => {
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
          ready: false
        }
      },
      game: {
        inGame: false,
        currentTurnPlayerId: null,
        calledNumbers: [],
        lastCalledNumber: null,
        winnerId: null,
        resetCounter: 0
      }
    });

    playerRefRef.current = playerRef;
    onDisconnect(playerRef).remove();
    attachRoomListener(roomCode);
  };

  const joinRoom = async ({ roomCode, name }) => {
    const normalizedCode = (roomCode || '').trim().toUpperCase();
    if (!normalizedCode) {
      setState((prev) => ({ ...prev, status: 'error', error: 'Room code is required.' }));
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
    const playerRef = ref(database, `${ROOMS_ROOT}/${normalizedCode}/players/${playerId}`);

    setState({
      ...initialState,
      status: 'connecting',
      role: roomData.hostId === playerId ? 'host' : 'client',
      playerId,
      roomCode: normalizedCode,
      hostInfo: { roomCode: normalizedCode }
    });

    await set(playerRef, { id: playerId, name, ready: false });
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

  const sendReady = async () => {
    const playerRef = playerRefRef.current;
    if (!playerRef) return;

    await update(playerRef, { ready: true });
    setState((prev) => ({ ...prev, localReady: true }));
    await attemptAutoStart();
  };

  const sendCall = async (number) => {
    const { roomCode, playerId } = stateRef.current;
    if (!roomCode || !playerId) return;

    const roomRef = ref(database, `${ROOMS_ROOT}/${roomCode}`);

    await runTransaction(roomRef, (room) => {
      if (!room || !room.game?.inGame || room.game?.winnerId) return room;
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

      const players = Object.fromEntries(
        Object.entries(room.players || {}).map(([id, player]) => [id, { ...player, ready: false }])
      );

      return {
        ...room,
        players,
        game: {
          ...(room.game || {}),
          inGame: false,
          calledNumbers: [],
          lastCalledNumber: null,
          currentTurnPlayerId: null,
          winnerId: null,
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
      if (!room || room.game?.winnerId) return room;
      return {
        ...room,
        game: {
          ...(room.game || {}),
          winnerId: playerId,
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
    sendReady,
    sendCall,
    sendReset,
    sendWin
  };
};
