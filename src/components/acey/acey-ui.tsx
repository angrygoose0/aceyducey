'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useAceyProgram, useGameAccount, useInitGame, usePlayerAccountQuery } from './acey-data-access'
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import BN from 'bn.js';
import { EMPTY_PUBLIC_KEY, fromLamportsDecimals, ToLamportsDecimals, ZERO } from './acey-helpers';
import { PublicKey } from '@solana/web3.js';

export function InitGameButton() {
  const { initGame } = useInitGame();
  const {publicKey} = useWallet();

  const handleCreateLotteryButton = useCallback(async () => {
    try {
      if (!publicKey) throw new Error("Wallet is not connected.");



      await initGame.mutateAsync();

      toast.success("lottery created successfully!");
    } catch (error: any) {
      console.error("Error creating lottery:", error);
      toast.error("Failed to create lottery");
    }
  }, [initGame, publicKey]);

  return (
    <button
      className="btn btn-xs shadow-lg"
      onClick={handleCreateLotteryButton}
    >
      Create Game
    </button>
  );
}

export function ShowPlayer({ accountKey, currentPlayerId }: { accountKey: PublicKey; currentPlayerId: BN }) {
  const { playerAccountQuery } = usePlayerAccountQuery({ accountKey });

  const [playerAccount, setPlayerAccount] = useState<{
    id: BN;
    user: PublicKey;
    userName: string;
  }>({
    id: ZERO,
    user: EMPTY_PUBLIC_KEY,
    userName: "",
  });

  useEffect(() => {
    if (playerAccountQuery.data) {
      setPlayerAccount({
        id: playerAccountQuery.data.id,
        user: playerAccountQuery.data.user,
        userName: playerAccountQuery.data.userName,
      });
    }
  }, [playerAccountQuery.data]);

  return (
    <pre
      className={`p-2 rounded-md text-black ${
        currentPlayerId.eq(playerAccount.id) ? "bg-yellow-300" : "bg-gray-200"
      }`}
    >
      {JSON.stringify(playerAccount, null, 2)}
    </pre>
  );
}


export function ShowGame() {
  const { gameAccountQuery, playerJoin, playersQuery, playerAnte, playerBet, playerLeave, kickPlayer, playerClaim } = useGameAccount();
  const {publicKey} = useWallet();

  useEffect(() => {
    if (playersQuery.data && Array.isArray(playersQuery.data)) {
      setAllPlayers(playersQuery.data);
    }
  }, [playersQuery.data]);

  const [allPlayers, setAllPlayers] = useState<PublicKey[]>([]);

  const [gameAccount, setGameAccount] = useState<{
    entryPrice: BN;
    antePrice: BN;
    potAmount: BN;
    nextSkipTime: BN;
    currentBet: BN;
    playerNo: BN;
    currentPlayerId: BN;
    currentlyPlaying: BN;
    card1: number;
    card2: number;
    card3: number;
  }>({
    entryPrice: ZERO,
    antePrice: ZERO,
    potAmount: ZERO,
    nextSkipTime: ZERO,
    currentBet: ZERO,
    playerNo: ZERO,
    currentPlayerId: ZERO,
    currentlyPlaying: ZERO,
    card1: 0,
    card2: 0,
    card3: 0,
  });

  const [userName, setUserName] = useState("");
  const [betAmount, setBetAmount] = useState<BN | null>(null);


  useEffect(() => {
    if (gameAccountQuery.data) {
      setGameAccount({
        entryPrice: gameAccountQuery.data.entryPrice,
        antePrice: gameAccountQuery.data.antePrice,
        potAmount: gameAccountQuery.data.potAmount,
        nextSkipTime: gameAccountQuery.data.nextSkipTime,
        currentBet: gameAccountQuery.data.currentBet,
        playerNo: gameAccountQuery.data.playerNo,
        currentPlayerId: gameAccountQuery.data.currentPlayerId,
        currentlyPlaying: gameAccountQuery.data.currentlyPlaying,
        card1: gameAccountQuery.data.card1,
        card2: gameAccountQuery.data.card2,
        card3: gameAccountQuery.data.card3,
      });
    }
  }, [gameAccountQuery.data]);

  const handleUsernameFormFieldChange = (event: { target: { value: any; }; }) => {
    const value = event.target.value;

    setUserName(value);
  };

  const handleBetFormFieldChange = (event: { target: { value: any; }; }) => {
    const value = event.target.value;

    if (value === "") {
      setBetAmount(null);
      return;
    }

    const valueBN = ToLamportsDecimals(value)

    setBetAmount(valueBN);
  };


  const handleJoinGameButton = useCallback(async () => {
    try {
      if (!publicKey) throw new Error("Wallet is not connected.");

      await playerJoin.mutateAsync({ userName });

      toast.success("game joined successfully!");
    } catch (error: any) {
      console.error("Error joining game:", error);
      toast.error("Failed to join game");
    }
  }, [playerJoin, publicKey, userName]);

  const handleAnteButton = useCallback(async () => {
    try {
      if (!publicKey) throw new Error("Wallet is not connected.");

      await playerAnte.mutateAsync();

      toast.success("ante sent successfully!");
    } catch (error: any) {
      console.error("Error sending ante:", error);
      toast.error("Failed to send ante");
    }
  }, [playerAnte, publicKey]);

  const handleBetButton = useCallback(async () => {
    try {
      if (!publicKey) throw new Error("Wallet is not connected.");

      if (!betAmount) throw new Error("Fill in bet amount")

      await playerBet.mutateAsync({betAmount});

      toast.success("bet sent successfully!");
    } catch (error: any) {
      console.error("Error sending bet:", error);
      toast.error("Failed to send bet");
    }
  }, [playerBet, publicKey, betAmount]);

  const handleClaimButton = useCallback(async () => {
    try {
      if (!publicKey) throw new Error("Wallet is not connected.");


      await playerClaim.mutateAsync();

      toast.success("turn ended successfully!");
    } catch (error: any) {
      console.error("Error ending turn:", error);
      toast.error("Failed to end turn");
    }
  }, [playerClaim, publicKey]);

  const handleLeaveButton = useCallback(async () => {
    try {
      if (!publicKey) throw new Error("Wallet is not connected.");

      await playerLeave.mutateAsync();

      toast.success("game left successfully!");
    } catch (error: any) {
      console.error("Error leaving game:", error);
      toast.error("Failed to leave game");
    }
  }, [playerLeave, publicKey]);

  const handleKickButton = useCallback(async () => {
    try {
      if (!publicKey) throw new Error("Wallet is not connected.");

      await kickPlayer.mutateAsync();

      toast.success("player kicked successfully!");
    } catch (error: any) {
      console.error("Error kicking player:", error);
      toast.error("Failed to kick player");
    }
  }, [kickPlayer, publicKey]);


  return (
    <div className="flex flex-col items-center text-center">
      <h2 className="font-bold text-md mr-2">Pooled SOL:</h2>
      <p className="text-4xl font-bold mr-2 ">0.5 SOL</p>
      <div className="mt-2 text-md">
        Entry Price: <span className="font-bold">55 SOL</span>
      </div>
      <div className="mb-4">
        <input
          type="string"
          className="input input-bordered w-auto max-w-xs h-6 shadow-lg"
          onChange={handleUsernameFormFieldChange}
          value={userName}
          placeholder="Select Username"
        />

        <input
          type="number"
          className="input input-bordered w-auto max-w-xs h-6 shadow-lg"
          onChange={handleBetFormFieldChange}
          value={betAmount === null ? "" : fromLamportsDecimals(betAmount)}
          placeholder="set bet (sol)"
        />
        <button
          className="btn btn-xs shadow-lg"
          onClick={handleJoinGameButton}
        >
          Join Game
       </button>

       <button
          className="btn btn-xs shadow-lg"
          onClick={handleAnteButton}
        >
          Ante
       </button>

       <button
          className="btn btn-xs shadow-lg"
          onClick={handleBetButton}
        >
          Bet
       </button>

       <button
          className="btn btn-xs shadow-lg"
          onClick={handleClaimButton}
        >
          Claim
       </button>

       <button
          className="btn btn-xs shadow-lg"
          onClick={handleLeaveButton}
        >
          Leave
       </button>
       <button
          className="btn btn-xs shadow-lg"
          onClick={handleKickButton}
        >
          Kick
       </button>
      </div>

        aa
      <ul>
        {allPlayers.map((player, index) => (
          <li key={index}>
            <ShowPlayer accountKey={player} currentPlayerId={gameAccount.currentPlayerId}/>
          </li>
        ))}
      </ul>

      <h2>Game Account State</h2>
      <pre>
        {JSON.stringify(
          Object.fromEntries(
            Object.entries(gameAccount).map(([key, value]) => [key, value.toString()])
          ),
          null,
          2
        )}
      </pre>
    </div>
  );
}
