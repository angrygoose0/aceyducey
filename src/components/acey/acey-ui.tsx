'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useAceyProgram, useGameAccount, useInitGame, usePlayerAccountQuery } from './acey-data-access'
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import BN from 'bn.js';
import { EMPTY_PUBLIC_KEY, fromLamportsDecimals, ToLamportsDecimals, ZERO, getCardSvgFilename, shortenString, SHRINK_RATE, GameAccount } from './acey-helpers';
import { PublicKey } from '@solana/web3.js';
import Image from "next/image";

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



function PlayerCard({ accountKey, index, midpoint, count, gameAccount }: { 
  accountKey: PublicKey; 
  index: number; 
  midpoint: number; 
  count: number; 
  gameAccount: GameAccount;
}) {
  const { playerAccountQuery } = usePlayerAccountQuery({ accountKey });

  const [playerAccount, setPlayerAccount] = useState({
    user: EMPTY_PUBLIC_KEY,
    id: ZERO,
    userName: "",
  });

  useEffect(() => {
    if (playerAccountQuery.data) {
      setPlayerAccount(playerAccountQuery.data);
    }
  }, [playerAccountQuery.data]);

  const computeStyles = () => {
    const distance = Math.abs(index - midpoint);
    return {
      opacity: 0.3 + (1 - distance / (count / 2)) * 0.7,
      scale: 0.4 + (1 - Math.pow(distance / (count / 2), SHRINK_RATE)) * 0.6,
      shadow: distance === 0 ? "shadow-xl" : distance < count / 4 ? "shadow-lg" : "shadow-md",
      translateY: -Math.pow(distance, 1.5) * 3,
    };
  };

  const { opacity, scale, shadow, translateY } = computeStyles();

  return (
    <div
      key={accountKey.toString()}
      className={`relative p-6 rounded-lg bg-white flex-shrink-0 ${shadow}`}
      style={{
        opacity,
        transform: `scale(${scale}) translateY(${translateY}px)`,
        width: "300px",
        minWidth: "300px",
      }}
    >
      <p className="font-bold text-xl">{playerAccount.userName}</p>
      <p className="mt-2 text-md">{shortenString(playerAccount.user.toBase58())}</p>
      {(playerAccount.id.eq(gameAccount.currentPlayerId)) && 
        gameAccount.card1 !== 0 && 
        gameAccount.card2 !== 0 && (
          <>
            <p className="mt-2 text-xs">
              {playerAccount.userName} antes: <span className="font-bold">{fromLamportsDecimals(gameAccount.antePrice)} SOL</span>
            </p>

            {!gameAccount.currentBet.eq(ZERO) && (
              <p className="mt-2 text-xs">
                {playerAccount.userName} bets: <span className="font-bold">{fromLamportsDecimals(gameAccount.currentBet)} SOL</span>
              </p>
            )}
          </>
        )
      }
      
      {playerAccount.id.toString()}
    </div>
  );
}

export function ProgressiveDivs({ 
  allPlayers, 
  gameAccount,
}: { 
  allPlayers: { pubkey: PublicKey; id: BN }[]; 
  gameAccount: GameAccount
}) {

  const count = allPlayers.length;
  const midpoint = Math.floor(count / 2);

  const reorderPlayers = (players: { pubkey: PublicKey; id: BN }[], currentPlayerId: BN) => {
    const centerIndex = players.findIndex(player => player.id.eq(currentPlayerId));
    
    if (centerIndex === -1) return players; // If centerId not found, return original order

    const ROTATION = Math.ceil(count / 2);

    const rotatedPlayers = [
      ...players.slice((centerIndex + ROTATION) % players.length),
      ...players.slice(0, (centerIndex + ROTATION) % players.length)
    ];
    return rotatedPlayers;
  };
  const orderedPlayers = reorderPlayers(allPlayers, gameAccount.currentPlayerId);

  return (
    <div className="w-screen flex justify-center items-center overflow-x-auto space-x-4 px-4 py-4">
      {orderedPlayers.map((player, index) => (
        <PlayerCard key={player.pubkey.toBase58()} accountKey={player.pubkey} index={index} midpoint={midpoint} count={count} gameAccount={gameAccount} />
      ))}
      {count % 2 === 0 && <div className="relative p-6 rounded-lg bg-transparent flex-shrink-0" style={{ width: "300px", minWidth: "300px", opacity: 0 }} />}
    </div>
  );
}



/*
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
    <>
    <div className="w-screen flex justify-between items-center overflow-x-auto">
      

    
      <div className="mb-4 shadow-lg w-full max-w-md mx-auto relative p-6 rounded-lg opacity-100">
  <p className="font-bold text-xl">username</p>
  <p className="mt-2 text-md">{shortenString("giohawoifhiaohdioawhidhwaiohdoiaw")}</p>
  <p className="mt-2 text-xs">username bets: <span className="font-bold">5 SOL</span></p>
</div>

<div className="mb-3 shadow-md w-full max-w-sm mx-auto relative p-5 rounded-md opacity-90">
  <p className="font-bold text-lg">username</p>
  <p className="mt-1 text-sm">{shortenString("giohawoifhiaohdioawhidhwaiohdoiaw")}</p>
  <p className="mt-1 text-xs">username bets: <span className="font-bold">5 SOL</span></p>
</div>

<div className="mb-2 shadow w-full max-w-xs mx-auto relative p-4 rounded-md opacity-75">
  <p className="font-bold text-md">username</p>
  <p className="mt-1 text-xs">{shortenString("giohawoifhiaohdioawhidhwaiohdoiaw")}</p>
  <p className="mt-1 text-[10px]">username bets: <span className="font-bold">5 SOL</span></p>
</div>

<div className="mb-1 shadow-sm w-full max-w-[200px] mx-auto relative p-3 rounded-sm opacity-50">
  <p className="font-bold text-sm">username</p>
  <p className="mt-0.5 text-[10px]">{shortenString("giohawoifhiaohdioawhidhwaiohdoiaw")}</p>
  <p className="mt-0.5 text-[8px]">username bets: <span className="font-bold">5 SOL</span></p>
</div>

<div className="mb-0.5 shadow-xs w-full max-w-[150px] mx-auto relative p-2 rounded-sm opacity-30">
  <p className="font-bold text-xs">username</p>
  <p className="mt-0.5 text-[9px]">{shortenString("giohawoifhiaohdioawhidhwaiohdoiaw")}</p>
  <p className="mt-0.5 text-[7px]">username bets: <span className="font-bold">5 SOL</span></p>
</div>

<div className="w-full max-w-[120px] mx-auto relative p-1 rounded-sm opacity-15">
  <p className="font-bold text-[10px]">username</p>
  <p className="mt-0.5 text-[8px]">{shortenString("giohawoifhiaohdioawhidhwaiohdoiaw")}</p>
  <p className="mt-0.5 text-[6px]">username bets: <span className="font-bold">5 SOL</span></p>
</div>
</div>
    <pre
      className={`p-2 rounded-md text-black ${
        currentPlayerId.eq(playerAccount.id) ? "bg-yellow-300" : "bg-gray-200"
      }`}
    >
      {JSON.stringify(playerAccount, null, 2)}
    </pre>
    </>
  );
}
*/



const UserCard = ({ username, bets, description }:any) => {
  return (
    <div className={`mb-4 shadow-lg w-full max-w-md p-6 rounded-lg bg-white`}>
      <p className="font-bold text-xl">{username}</p>
      <p className="mt-2 text-md">{shortenString(description)}</p>
      <p className="mt-2 text-xs">
        {username} bets: <span className="font-bold">{bets} SOL</span>
      </p>
    </div>
  );
};

const UserGrid = () => {
  const users = [
    { username: "user1", bets: 5, description: "giohawoifhiaohdioawhidhwaiohdoiaw" },
    { username: "user2", bets: 3, description: "longdescriptionhereforuser2" },
    { username: "user3", bets: 7, description: "anotherlongdescriptionforuser3" },
    { username: "user4", bets: 2, description: "yetanotherlongdescriptionhere" },
    { username: "bob", bets: 2, description: "yetanotherlongdescriptionhere" },
    { username: "bob", bets: 2, description: "yetanotherlongdescriptionhere" },
    { username: "bob", bets: 2, description: "yetanotherlongdescriptionhere" },
    { username: "bob", bets: 2, description: "yetanotherlongdescriptionhere" },
  ];

  return (
    <div className="flex justify-center items-center gap-4 p-4 overflow-x-auto w-full">
      {users.map((user, index) => (
        <div
          key={index}
          className={
            users.length % 2 === 0 && index === Math.floor(users.length / 2)
              ? "flex justify-center"
              : ""
          }
        >
          <UserCard {...user} />
        </div>
      ))}
    </div>
  );
};



export default UserGrid;


export function ShowGame() {
  const { gameAccountQuery, playerJoin, playersQuery, playerAnte, playerBet, playerLeave, kickPlayer, nextTurn, userPlayerAccountQuery } = useGameAccount();

  const {publicKey} = useWallet();
  

  const [allPlayers, setAllPlayers] = useState<{ pubkey: PublicKey; id: BN }[]>([]);

  
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



  const [playerAccount, setPlayerAccount] = useState<{
    id: BN;
    user_name: string;

  }>({
    id: ZERO,
    user_name: "",
  });

  const [userName, setUserName] = useState("");
  const [betAmount, setBetAmount] = useState<BN | null>(null);

  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(Date.now()); // State update
    }, 1000);

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  const timeLeft = (to: number): string => {
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    let diff = to - now; // Time remaining
  
    if (diff <= 0) return "00:00:00"; // If time is up
  
    const hours = Math.floor(diff / 3600);
    diff %= 3600;
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
  
    return [hours, minutes, seconds]
      .map((unit) => String(unit).padStart(2, "0"))
      .join(":");
  };


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


  
  useEffect(() => {
    if (userPlayerAccountQuery.data) {
      setPlayerAccount({
        id: userPlayerAccountQuery.data.id,
        user_name: userPlayerAccountQuery.data.userName,
      });
    } else {
      // Reset to default values when data is null
      setPlayerAccount({
        id: ZERO,
        user_name: "",
      });
    }
  }, [userPlayerAccountQuery.data]);

  useEffect(() => {
    if (playersQuery.data && Array.isArray(playersQuery.data)) {

      const players = [...playersQuery.data]; // Copy the array to avoid mutating original data
  
      // Find the middle index
      const middleIndex = Math.floor(players.length / 2);
  
      // Separate the target player and remaining players
      const targetPlayer = players.find(player => player.id.eq(gameAccount.currentlyPlaying));
      const otherPlayers = players.filter(player => player.id.cmp(gameAccount.currentlyPlaying) !== 0);
  
      if (targetPlayer) {
        // Insert target player at the middle index
        otherPlayers.splice(middleIndex, 0, targetPlayer);
      }
  
      setAllPlayers(otherPlayers);
    }
  }, [playersQuery.data, gameAccount.currentlyPlaying]);
  


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

  const handleNextTurnButton = useCallback(async () => {
    try {
      if (!publicKey) throw new Error("Wallet is not connected.");


      await nextTurn.mutateAsync();

      toast.success("turn ended successfully!");
    } catch (error: any) {
      console.error("Error ending turn:", error);
      toast.error("Failed to end turn");
    }
  }, [nextTurn, publicKey]);

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
      <p className="text-4xl font-bold mr-2 ">{fromLamportsDecimals(gameAccount.potAmount)} SOL</p>
      <div className="mt-2 text-md">
        Entry Price: <span className="font-bold">{fromLamportsDecimals(gameAccount.entryPrice)} SOL</span>
      </div>
      <div className="mt-2 text-md">
        Ante Price: <span className="font-bold">{fromLamportsDecimals(gameAccount.antePrice)} SOL</span>
      </div>

      

      <div className="flex justify-center items-center p-4 space-x-4">
        <Image
          src={`/cards/${getCardSvgFilename(gameAccount.card1)}`}
          alt={`Card ${gameAccount.card1}`}
          width={150}
          height={120} // Adjusted height proportionally
          className="shadow-lg rounded-lg"
        />

        <Image
          src={`/cards/${getCardSvgFilename(gameAccount.card3)}`}
          alt={`Card ${gameAccount.card3}`}
          width={180}
          height={144} // Adjusted height proportionally
          className="shadow-lg rounded-lg"
        />

        <Image
          src={`/cards/${getCardSvgFilename(gameAccount.card2)}`}
          alt={`Card ${gameAccount.card2}`}
          width={150}
          height={120} // Adjusted height proportionally
          className="shadow-lg rounded-lg"
        />
      </div>
      

      <ProgressiveDivs allPlayers={allPlayers} gameAccount={gameAccount}/>

      <div className="py-4 flex flex-col items-center space-y-4">
  {playerAccount.id.eq(ZERO) ? (
    <div className="flex flex-col items-center space-y-2">
      <input
        type="text"
        className="input input-bordered w-auto max-w-xs h-8 shadow-lg"
        onChange={handleUsernameFormFieldChange}
        value={userName}
        placeholder="Select Username"
      />
      <button className="btn btn-sm shadow-lg" onClick={handleJoinGameButton}>
        Join Game
      </button>
    </div>
  ) : (
    <div className="flex flex-col items-center space-y-2">
      <button className="btn btn-sm shadow-lg" onClick={handleLeaveButton}>
        Leave
      </button>
      <span className="text-sm font-semibold">{timeLeft(gameAccount.nextSkipTime.toNumber())}</span>
      {timeLeft(gameAccount.nextSkipTime.toNumber()) === "00:00:00" && (
        <button className="btn btn-sm shadow-lg" onClick={handleKickButton}>
          Kick
        </button>
      )}
    </div>
  )}

  {playerAccount.id.eq(gameAccount.currentPlayerId) && (
    <div className="flex flex-col items-center space-y-2">
      <button className="btn btn-sm shadow-lg" onClick={handleNextTurnButton}>
        Next Turn
      </button>
      {gameAccount.card1 === 0 && gameAccount.card2 === 0 ? (
        <button className="btn btn-sm shadow-lg" onClick={handleAnteButton}>
          Ante
        </button>
      ) : gameAccount.card3 === 0 ? (
        <div className="flex flex-col items-center space-y-2">
          <input
            type="number"
            className="input input-bordered w-auto max-w-xs h-8 shadow-lg"
            onChange={handleBetFormFieldChange}
            value={betAmount ? fromLamportsDecimals(betAmount) : ""}
            placeholder="Set bet (SOL)"
          />
          <button className="btn btn-sm shadow-lg" onClick={handleBetButton}>
            Bet
          </button>
        </div>
      ) : null}
    </div>
  )}
      </div>




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
