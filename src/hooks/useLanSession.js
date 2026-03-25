import { useEffect, useRef, useState } from 'react';
import TcpSocket from 'react-native-tcp-socket';
import * as Network from 'expo-network';

const DEFAULT_PORT = 5050;

const initialState = {
  status: 'idle',
  role: null,
  players: [],
  playerId: null,
  hostInfo: null,
  inGame: false,
  currentTurnPlayerId: null,
  calledNumbers: [],
  lastCalledNumber: null,
  localReady: false,
  localBoardReady: false,
  winners: [],
  resetCounter: 0,
  error: null,
  hostId: 0
};

const createLineParser = (onMessage) => {
  let buffer = '';
  return (data) => {
    buffer += data.toString();
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      try {
        const parsed = JSON.parse(trimmed);
        onMessage(parsed);
      } catch (error) {
        onMessage({ type: 'error', message: 'Invalid message payload' });
      }
    });
  };
};

const sendToSocket = (socket, message) => {
  if (!socket) return;
  socket.write(`${JSON.stringify(message)}\n`);
};

const removePlayer = (players, playerId) => {
  return players.filter((player) => player.id !== playerId);
};

const getNextTurnPlayerId = (players, currentPlayerId) => {
  if (!players.length) return null;
  const currentIndex = players.findIndex((player) => player.id === currentPlayerId);
  const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % players.length;
  return players[nextIndex]?.id ?? null;
};

export const useLanSession = () => {
  const [state, setState] = useState(initialState);
  const stateRef = useRef(state);
  const isMountedRef = useRef(true);
  const serverRef = useRef(null);
  const socketsRef = useRef(new Map());
  const parsersRef = useRef(new Map());
  const clientSocketRef = useRef(null);
  const nextPlayerIdRef = useRef(1);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const updateState = (updater) => {
    if (!isMountedRef.current) return;
    const prev = stateRef.current;
    const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
    stateRef.current = next;
    setState(next);
  };

  const broadcast = (message) => {
    socketsRef.current.forEach((socket) => {
      sendToSocket(socket, message);
    });
  };

  const broadcastState = () => {
    const { players, inGame, currentTurnPlayerId, calledNumbers, winners } = stateRef.current;
    broadcast({
      type: 'state',
      players,
      inGame,
      currentTurnPlayerId,
      calledNumbers,
      winners
    });
  };

  const resetRoomState = () => {
    updateState((prev) => ({
      ...prev,
      inGame: false,
      calledNumbers: [],
      lastCalledNumber: null,
      currentTurnPlayerId: null,
      winners: [],
      localReady: false,
      localBoardReady: false,
      players: prev.players.map((player) => ({ ...player, ready: false, boardReady: false })),
      resetCounter: prev.resetCounter + 1
    }));
  };

  const handleWin = (winPlayerId) => {
    updateState((prev) => {
      const currentWinners = prev.winners || [];
      if (currentWinners.includes(winPlayerId)) return prev;
      return {
        ...prev,
        winners: [...currentWinners, winPlayerId],
        inGame: false
      };
    });
    broadcast({ type: 'win', winnerId: winPlayerId });
    broadcastState();
  };

  const handleCall = (playerId, number) => {
    const { inGame, currentTurnPlayerId, calledNumbers, players, winners } = stateRef.current;
    if (!inGame || (winners && winners.length > 0)) return;
    if (currentTurnPlayerId !== playerId) {
      const socket = socketsRef.current.get(playerId);
      sendToSocket(socket, { type: 'error', message: 'Not your turn' });
      return;
    }
    if (calledNumbers.includes(number)) {
      const socket = socketsRef.current.get(playerId);
      sendToSocket(socket, { type: 'error', message: 'Number already called' });
      return;
    }

const nextTurnPlayerId = getNextTurnPlayerId(players, currentTurnPlayerId);
    updateState((prev) => ({
      ...prev,
      calledNumbers: [...prev.calledNumbers, number],
      lastCalledNumber: number,
      currentTurnPlayerId: nextTurnPlayerId
    }));

    broadcast({ type: 'call', number, currentTurnPlayerId: nextTurnPlayerId });
    broadcastState();
  };

  const startGame = () => {
    const { players, inGame, role } = stateRef.current;
    if (inGame || role !== 'host') return;
    if (players.length < 2) return;

    const startingIndex = Math.floor(Math.random() * players.length);
    const startingPlayerId = players[startingIndex]?.id ?? null;
    updateState((prev) => ({
      ...prev,
      inGame: true,
      currentTurnPlayerId: startingPlayerId,
      calledNumbers: [],
      lastCalledNumber: null,
      winners: [],
      players: prev.players.map(p => ({ ...p, ready: false, boardReady: false }))
    }));
    broadcast({ type: 'start', currentTurnPlayerId: startingPlayerId });
    broadcastState();
  };

  const removeClient = (clientId) => {
    const socket = socketsRef.current.get(clientId);
    if (socket) {
      socket.destroy();
    }
    socketsRef.current.delete(clientId);
    parsersRef.current.delete(clientId);

    updateState((prev) => {
      const players = removePlayer(prev.players, clientId);
      const nextTurnPlayerId = prev.currentTurnPlayerId === clientId
        ? getNextTurnPlayerId(players, clientId)
        : prev.currentTurnPlayerId;

      return {
        ...prev,
        players,
        currentTurnPlayerId: nextTurnPlayerId
      };
    });
    broadcastState();
  };

  const handleHostMessage = (clientId, message) => {
    switch (message.type) {
      case 'join': {
        updateState((prev) => {
          const existing = prev.players.find((player) => player.id === clientId);
          if (existing) return prev;
          
          const filteredPlayers = prev.players.filter((player) => player.name !== message.name);
          return {
            ...prev,
            players: [...filteredPlayers, { id: clientId, name: message.name || `Player ${clientId}`, ready: true, boardReady: false }]
          };
        });
        broadcastState();
        break;
      }
      case 'ready': {
        updateState((prev) => ({
          ...prev,
          players: prev.players.map((player) =>
            player.id === clientId ? { ...player, ready: true } : player
          )
        }));
        broadcastState();
        break;
      }
      case 'boardReady': {
        updateState((prev) => ({
          ...prev,
          players: prev.players.map((player) =>
            player.id === clientId ? { ...player, boardReady: message.isReady } : player
          )
        }));
        broadcastState();
        break;
      }
      case 'returnToLobby': {
        updateState((prev) => ({
          ...prev,
          players: prev.players.map((player) =>
            player.id === clientId ? { ...player, ready: true, boardReady: false } : player
          )
        }));
        broadcastState();
        break;
      }
      case 'call': {
        handleCall(clientId, message.number);
        break;
      }
      case 'win': {
        handleWin(clientId);
        break;
      }
      default:
        break;
    }
  };

  const handleClientMessage = (message) => {
    if (message.type === 'welcome') {
      updateState({ playerId: message.playerId });
      return;
    }
    if (message.type === 'state') {
      updateState((prev) => {
        const players = message.players || prev.players;
        const localPlayer = players.find((player) => player.id === prev.playerId);
        return {
          ...prev,
          players,
          inGame: message.inGame ?? prev.inGame,
          currentTurnPlayerId: message.currentTurnPlayerId ?? prev.currentTurnPlayerId,
          calledNumbers: message.calledNumbers ?? prev.calledNumbers,
          winners: message.winners ?? prev.winners,
          localReady: localPlayer ? localPlayer.ready : prev.localReady,
          localBoardReady: localPlayer ? localPlayer.boardReady : prev.localBoardReady
        };
      });
      return;
    }
    if (message.type === 'call') {
      updateState((prev) => ({
        ...prev,
        calledNumbers: prev.calledNumbers.includes(message.number)
          ? prev.calledNumbers
          : [...prev.calledNumbers, message.number],
        lastCalledNumber: message.number,
        currentTurnPlayerId: message.currentTurnPlayerId ?? prev.currentTurnPlayerId
      }));
      return;
    }
    if (message.type === 'reset') {
      resetRoomState();
      return;
    }
    if (message.type === 'win') {
      updateState((prev) => {
        const currentWinners = prev.winners || [];
        if (currentWinners.includes(message.winnerId)) return prev;
        return {
          ...prev,
          winners: [...currentWinners, message.winnerId],
          inGame: false
        };
      });
      return;
    }
    if (message.type === 'error') {
      updateState({ error: message.message || 'Server error', status: 'error' });
    }
  };

  const hostRoom = async ({ port = DEFAULT_PORT, name = 'Host' } = {}) => {
    if (stateRef.current.status === 'connecting' || stateRef.current.status === 'connected') return;
    if (serverRef.current) return;
    updateState({ status: 'connecting', role: 'host', error: null });

    try {
      if (!TcpSocket || typeof TcpSocket.createServer !== 'function') {
        updateState({ error: 'TCP server not available. Use a Dev Client build, not Expo Go.', status: 'error' });
        return;
      }
      const ipAddress = await Network.getIpAddressAsync();
      const server = TcpSocket.createServer((socket) => {
        const clientId = nextPlayerIdRef.current++;
        socketsRef.current.set(clientId, socket);
        const parser = createLineParser((message) => handleHostMessage(clientId, message));
        parsersRef.current.set(clientId, parser);

        socket.on('data', parser);
        socket.on('error', () => removeClient(clientId));
        socket.on('close', () => removeClient(clientId));

        sendToSocket(socket, { type: 'welcome', playerId: clientId });
      });

      if (!server) {
        updateState({ error: 'Failed to create TCP server. Use a Dev Client build.', status: 'error' });
        return;
      }

      server.on('error', (error) => {
        updateState({ error: error.message, status: 'error' });
      });

      server.listen({ port, host: '0.0.0.0' }, () => {
        serverRef.current = server;
        updateState((prev) => ({
          ...prev,
          status: 'connected',
          role: 'host',
          hostInfo: { ip: ipAddress, port },
          playerId: 0,
          players: [{ id: 0, name, ready: true, boardReady: false }]
        }));
      });
    } catch (error) {
      updateState({ error: error.message, status: 'error' });
    }
  };

  const joinRoom = ({ host, port = DEFAULT_PORT, name = 'Player' } = {}) => {
    if (stateRef.current.status === 'connecting' || stateRef.current.status === 'connected') return;
    if (!host) {
      updateState({ error: 'Host address is required', status: 'error' });
      return;
    }

    updateState({ status: 'connecting', role: 'client', error: null, hostInfo: { ip: host, port } });
    const socket = TcpSocket.createConnection({ host, port }, () => {
      sendToSocket(socket, { type: 'join', name });
      updateState({ status: 'connected' });
    });

    const parser = createLineParser(handleClientMessage);
    clientSocketRef.current = socket;

    socket.on('data', parser);
    socket.on('error', (error) => {
      updateState({ error: error.message, status: 'error' });
    });
    socket.on('close', () => {
      updateState(initialState);
    });
  };

  const leaveRoom = (skipStateReset = false) => {
    if (clientSocketRef.current) {
      clientSocketRef.current.destroy();
      clientSocketRef.current = null;
    }
    if (serverRef.current) {
      serverRef.current.close();
      serverRef.current = null;
    }
    socketsRef.current.forEach((socket) => socket.destroy());
    socketsRef.current.clear();
    parsersRef.current.clear();
    nextPlayerIdRef.current = 1;
    if (!skipStateReset) {
      updateState(initialState);
    }
  };

  const sendReady = () => {
    if (stateRef.current.role === 'host') {
      updateState((prev) => ({
        ...prev,
        localReady: true,
        players: prev.players.map((player) =>
          player.id === prev.playerId ? { ...player, ready: true } : player
        )
      }));
      broadcastState();
      return;
    }
    if (clientSocketRef.current) {
      updateState((prev) => ({ ...prev, localReady: true }));
      sendToSocket(clientSocketRef.current, { type: 'ready' });
    }
  };

  const setPlayerReady = (isReady) => {
    if (isReady) {
      sendReady();
    }
  };

  const sendBoardReady = (isReady) => {
    if (stateRef.current.role === 'host') {
      updateState((prev) => ({
        ...prev,
        localBoardReady: isReady,
        players: prev.players.map((player) =>
          player.id === prev.playerId ? { ...player, boardReady: isReady } : player
        )
      }));
      broadcastState();
      return;
    }
    if (clientSocketRef.current) {
      updateState((prev) => ({ ...prev, localBoardReady: isReady }));
      sendToSocket(clientSocketRef.current, { type: 'boardReady', isReady });
    }
  };

  const returnToLobby = () => {
    if (stateRef.current.role === 'host') {
      updateState((prev) => ({
        ...prev,
        localReady: true,
        localBoardReady: false,
        players: prev.players.map((player) =>
          player.id === prev.playerId ? { ...player, ready: true, boardReady: false } : player
        )
      }));
      broadcastState();
      return;
    }
    if (clientSocketRef.current) {
      updateState((prev) => ({ ...prev, localReady: true, localBoardReady: false }));
      sendToSocket(clientSocketRef.current, { type: 'returnToLobby' });
    }
  };

  const sendCall = (number) => {
    if (!stateRef.current.inGame) return;
    if (stateRef.current.role === 'host') {
      handleCall(stateRef.current.playerId, number);
      return;
    }
    if (clientSocketRef.current) {
      sendToSocket(clientSocketRef.current, { type: 'call', number });
    }
  };

  const sendReset = () => {
    if (stateRef.current.role !== 'host') return;
    resetRoomState();
    broadcast({ type: 'reset' });
    broadcastState();
  };

  const sendWin = () => {
    if (stateRef.current.role === 'host') {
      handleWin(stateRef.current.playerId);
      return;
    }
    if (clientSocketRef.current) {
      sendToSocket(clientSocketRef.current, { type: 'win' });
    }
  };

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      leaveRoom(true);
    };
  }, []);

  const isHost = state.role === 'host';
  const isYourTurn = state.inGame && state.currentTurnPlayerId === state.playerId;

  return {
    ...state,
    isHost,
    isYourTurn,
    hostRoom,
    joinRoom,
    leaveRoom,
    startGame,
    sendReady,
    sendBoardReady,
    returnToLobby,
    sendCall,
    sendReset,
    sendWin,
    setPlayerReady
  };
};
