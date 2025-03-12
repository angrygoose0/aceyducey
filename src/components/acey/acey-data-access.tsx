'use client';

import { ACEY_PROGRAM_ID as programId, getAceyProgram } from '@project/anchor'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'
import { ComputeBudgetProgram, PublicKey, Transaction } from '@solana/web3.js';
import BN from 'bn.js';
import { CLUBMOON_MINT, DEV_AMM_CONFIG, DEV_CLUBMOON_MINT, DEV_CLUBMOON_POOL_ID, EMPTY_PUBLIC_KEY, RAYDIUM_CPMM_PROGRAM_ID, RAYDIUM_DEVNET_CPMM_PROGRAM_ID, ZERO } from './acey-helpers';
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, NATIVE_MINT, getAssociatedTokenAddress } from '@solana/spl-token';
import { useEffect } from 'react';

import { sha256 } from "js-sha256";
import bs58 from 'bs58';

export function useAceyProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const program = getAceyProgram(provider);

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });



  return {
    program,
    programId,
    getProgramAccount,
  };
}


export function useInitGame() {
  const { program } = useAceyProgram();
  const transactionToast = useTransactionToast();
  const { connection } = useConnection();
  const { sendTransaction, publicKey } = useWallet();
  const initGame = useMutation<
    string,
    Error
  >({
    mutationKey: ['buyToken'],
    mutationFn: async ( ) => {
      try {
        if (publicKey === null) {
          throw new Error('Wallet not connected');
        }
        /*
        const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
          units: 16000,
        });

        const recentPriorityFees = await connection.getRecentPrioritizationFees({
        });
        const minFee = Math.min(...recentPriorityFees.map(fee => fee.prioritizationFee));

        const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
          microLamports: minFee + 1,
        });
        */

        const gameSeeds = [Buffer.from("game")];
        const gameAccountKey = PublicKey.findProgramAddressSync(gameSeeds, programId)[0];


        const solanaTreasurySeeds = [
          Buffer.from("solana"),
          gameAccountKey.toBuffer(),
        ];

        const solanaTreasury = await PublicKey.findProgramAddressSync(
          solanaTreasurySeeds,
          programId,
        )[0];

        console.log(solanaTreasury.toString());


        
        const game = await program.methods
          .initGame()
          .accounts({
            signer:publicKey,
          })
          .rpc();

        

        const treasury = await program.methods
        .initTreasuries()
        .accounts({
          signer:publicKey,
          clubmoonMint: DEV_CLUBMOON_MINT, //change to CLUBMOON_MINT
          solanaMint: NATIVE_MINT,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

        /*
        const blockhashContext = await connection.getLatestBlockhashAndContext();

        
        const transaction = new Transaction({
          feePayer: publicKey,
          blockhash: blockhashContext.value.blockhash,
          lastValidBlockHeight: blockhashContext.value.lastValidBlockHeight,
        })
          //.add(modifyComputeUnits)
          //.add(addPriorityFee)
          .add(game)
          .add(treasury);

        const signature = await sendTransaction(transaction, connection, {
        });
        


        return signature;
        */
        return;

      } catch (error) {
        console.error("Error during transaction processing:", error);
        throw error;
      }
    },

    onSuccess: (signature) => {
      transactionToast(signature);
    },
    onError: (error) => {
      toast.error(`Error initializing game ${error.message}`);
      console.error('Toast error:', error);
    },
  });

  return {
    initGame,
  };
}

export function useGameAccount() {
  const { program } = useAceyProgram();
  const transactionToast = useTransactionToast();
  const { connection } = useConnection();
  const { sendTransaction, publicKey } = useWallet();
  const {cluster} = useCluster();
  const queryClient = useQueryClient();

  const gameSeeds = [Buffer.from("game")];
  const gameAccountKey = PublicKey.findProgramAddressSync(gameSeeds, programId)[0];

  const userPlayerAccountQuery = useQuery({
    queryKey: ['playerAccount', { cluster, gameAccountKey, publicKey }],
    queryFn: async () => {
      if (!publicKey) return null;

      const playerSeeds = [Buffer.from("player"), gameAccountKey.toBuffer(), publicKey.toBuffer()];
      const playerAccountKey = PublicKey.findProgramAddressSync(gameSeeds, programId)[0];

      return program.account.gameAccount.fetch(playerAccountKey);
    },
  });

  useEffect(() => {
    if (!publicKey) return; // Prevent execution when wallet is not connected
  
    const playerSeeds = [Buffer.from("player"), gameAccountKey.toBuffer(), publicKey.toBuffer()];
    const playerAccountKey = PublicKey.findProgramAddressSync(playerSeeds, programId)[0];
  
    const subscriptionId = connection.onAccountChange(
      playerAccountKey,
      async () => {
        try {
          const updatedData = await program.account.gameAccount.fetch(playerAccountKey);
          queryClient.setQueryData(['playerAccount', { cluster, playerAccountKey }], updatedData);
        } catch (error) {
          console.error('Failed to fetch updated player account data:', error);
        }
      }
    );
  
    return () => {
      connection.removeAccountChangeListener(subscriptionId);
    };
  }, [connection, publicKey, gameAccountKey, program, cluster, queryClient]);


  const gameAccountQuery = useQuery({
    queryKey: ['gameAccount', { cluster, gameAccountKey }],
    queryFn: async () => {
      return program.account.gameAccount.fetch(gameAccountKey);
    },
  });

  useEffect(() => {
    const subscriptionId = connection.onAccountChange(
      gameAccountKey,
      async (updatedAccountInfo) => {
        try {
          const updatedData = await program.account.gameAccount.fetch(gameAccountKey);
          // Update the query with the new data
          queryClient.setQueryData(['gameAccount', { cluster, gameAccountKey }], updatedData);
        } catch (error) {
          console.error('Failed to fetch updated game account data:', error);
        }
      }
    );

    // Cleanup the subscription when the component unmounts or dependencies change
    return () => {
      connection.removeAccountChangeListener(subscriptionId);
    };
  }, [connection, gameAccountKey, program, cluster, queryClient]);


  const playersQuery = useQuery({
    queryKey: ['playerAccountsQUERY', gameAccountKey.toBase58()], // Better queryKey
    queryFn: async () => {
      if (!publicKey) {
        throw new Error('Wallet not connected');
      }
  
      // Fetch game account
      const gameAccount = await program.account.gameAccount.fetch(gameAccountKey);
  
      // PlayerAccount discriminator
      const playerAccountDiscriminator = Buffer.from(sha256.digest('account:PlayerAccount')).slice(0, 8);
  
      // Filters for PlayerAccount
      const filters = [
        { memcmp: { offset: 0, bytes: bs58.encode(playerAccountDiscriminator) } },
        { memcmp: { offset: 40, bytes: gameAccountKey.toBase58() } },
      ];
  
      let offset = 72; // Offset for `id`
      let length = 8;  // `id` is a `u64` (8 bytes)
  
      // Fetch accounts
      const accounts = await connection.getProgramAccounts(programId, {
        dataSlice: { offset, length },
        filters,
      });
  
      // Parse `id` values as BN
      const accountsWithId = accounts.map(({ pubkey, account }) => {
        const id = new BN(account.data, 'le'); // Keep `id` as BN
        return { pubkey, id };
      });
  
      // Sort accounts by `id` (as BN)
      const sortedAccounts = accountsWithId.sort((a, b) => a.id.cmp(b.id)); 
  
      return sortedAccounts; // Returns an array of `{ pubkey, id }` with `id` as BN
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });



  const playerJoin = useMutation<
    string,
    Error,
    { userName: string }
  >({
    mutationKey: ['buyToken'],
    mutationFn: async ({userName}) => {
      try {
        if (publicKey === null) {
          throw new Error('Wallet not connected');
        }
        /*
        const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
          units: 16000,
        });

        const recentPriorityFees = await connection.getRecentPrioritizationFees({
        });
        const minFee = Math.min(...recentPriorityFees.map(fee => fee.prioritizationFee));

        const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
          microLamports: minFee + 1,
        });
        */

     


        const join = await program.methods
          .playerJoin(userName)
          .accounts({
            signer:publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .instruction();

        const blockhashContext = await connection.getLatestBlockhashAndContext();

        const transaction = new Transaction({
          feePayer: publicKey,
          blockhash: blockhashContext.value.blockhash,
          lastValidBlockHeight: blockhashContext.value.lastValidBlockHeight,
        })
          //.add(modifyComputeUnits)
          //.add(addPriorityFee)
          .add(join);
        const signature = await sendTransaction(transaction, connection, {
        });


        return signature;

      } catch (error) {
        console.error("Error during transaction processing:", error);
        throw error;
      }
    },

    onSuccess: (signature) => {
      transactionToast(signature);
    },
    onError: (error) => {
      toast.error(`Error initializing game ${error.message}`);
      console.error('Toast error:', error);
    },
  });



  const playerAnte = useMutation<
    string,
    Error
  >({
    mutationKey: ['buyToken'],
    mutationFn: async () => {
      try {
        if (publicKey === null) {
          throw new Error('Wallet not connected');
        }
        /*
        const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
          units: 16000,
        });

        const recentPriorityFees = await connection.getRecentPrioritizationFees({
        });
        const minFee = Math.min(...recentPriorityFees.map(fee => fee.prioritizationFee));

        const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
          microLamports: minFee + 1,
        });
        */

     


        const ante = await program.methods
          .playerAnte()
          .accounts({
            signer:publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .instruction();

        const blockhashContext = await connection.getLatestBlockhashAndContext();

        const transaction = new Transaction({
          feePayer: publicKey,
          blockhash: blockhashContext.value.blockhash,
          lastValidBlockHeight: blockhashContext.value.lastValidBlockHeight,
        })
          //.add(modifyComputeUnits)
          //.add(addPriorityFee)
          .add(ante);
        const signature = await sendTransaction(transaction, connection, {
        });


        return signature;

      } catch (error) {
        console.error("Error during transaction processing:", error);
        throw error;
      }
    },

    onSuccess: (signature) => {
      transactionToast(signature);
    },
    onError: (error) => {
      toast.error(`Error initializing game ${error.message}`);
      console.error('Toast error:', error);
    },
  });

  const playerBet = useMutation<
    string,
    Error,
    {betAmount:BN}
  >({
    mutationKey: ['buyToken'],
    mutationFn: async ({betAmount}) => {
      try {
        if (publicKey === null) {
          throw new Error('Wallet not connected');
        }
        /*
        const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
          units: 16000,
        });

        const recentPriorityFees = await connection.getRecentPrioritizationFees({
        });
        const minFee = Math.min(...recentPriorityFees.map(fee => fee.prioritizationFee));

        const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
          microLamports: minFee + 1,
        });
        */

     


        const bet = await program.methods
          .playerBet(betAmount)
          .accounts({
            signer:publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .instruction();

        const blockhashContext = await connection.getLatestBlockhashAndContext();

        const transaction = new Transaction({
          feePayer: publicKey,
          blockhash: blockhashContext.value.blockhash,
          lastValidBlockHeight: blockhashContext.value.lastValidBlockHeight,
        })
          //.add(modifyComputeUnits)
          //.add(addPriorityFee)
          .add(bet);
        const signature = await sendTransaction(transaction, connection, {
        });


        return signature;

      } catch (error) {
        console.error("Error during transaction processing:", error);
        throw error;
      }
    },

    onSuccess: (signature) => {
      transactionToast(signature);
    },
    onError: (error) => {
      toast.error(`Error initializing game ${error.message}`);
      console.error('Toast error:', error);
    },
  });

  const playerClaim = useMutation<
    string,
    Error
  >({
    mutationKey: ['buyToken'],
    mutationFn: async () => {
      try {
        if (publicKey === null) {
          throw new Error('Wallet not connected');
        }
        /*
        const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
          units: 16000,
        });

        const recentPriorityFees = await connection.getRecentPrioritizationFees({
        });
        const minFee = Math.min(...recentPriorityFees.map(fee => fee.prioritizationFee));

        const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
          microLamports: minFee + 1,
        });
        */

        const playerAccountDiscriminator = Buffer.from(sha256.digest('account:PlayerAccount')).slice(
          0,
          8
        );
  
        const filters = [
          {
            memcmp: { offset: 0, bytes: bs58.encode(playerAccountDiscriminator) },
          },
  
          {
            memcmp: { offset: 40, bytes: gameAccountKey.toBase58() },
          },
        ];

        let offset = 0;
        let length = 0;

        const accounts = await connection.getProgramAccounts(programId, {
          dataSlice: { offset, length },
          filters,
        });

        const remainingAccounts = accounts.map(account => ({
          pubkey: account.pubkey, // Use the public key from your array
          isWritable: false,      // Adjust this based on whether the account needs to be writable
          isSigner: false         // Adjust this based on whether the account is a signer
        }));



        const observationStateSeeds = [
          Buffer.from("observation"),
          DEV_CLUBMOON_POOL_ID.toBuffer(),
        ]

        const [observationState] = await PublicKey.findProgramAddressSync(
          observationStateSeeds,
          RAYDIUM_DEVNET_CPMM_PROGRAM_ID,
        );

        console.log(observationState.toString(), 'overs');

        const inputVaultSeeds = [
          Buffer.from("pool_vault"),
          DEV_CLUBMOON_POOL_ID.toBuffer(),
          NATIVE_MINT.toBuffer(),
        ];

        const inputVault = await PublicKey.findProgramAddressSync(
          inputVaultSeeds,
          RAYDIUM_DEVNET_CPMM_PROGRAM_ID
        )[0];

        const outputVaultSeeds = [
          Buffer.from("pool_vault"),
          DEV_CLUBMOON_POOL_ID.toBuffer(),
          DEV_CLUBMOON_MINT.toBuffer(),
        ];

        const outputVault = await PublicKey.findProgramAddressSync(
          outputVaultSeeds,
          RAYDIUM_DEVNET_CPMM_PROGRAM_ID,
        )[0];



        const claim = await program.methods
        .playerClaim()
        .accounts({
          cpSwapProgram: RAYDIUM_DEVNET_CPMM_PROGRAM_ID,
          signer: publicKey,
          clubmoonMint: DEV_CLUBMOON_MINT,
          solanaMint: NATIVE_MINT,
          ammConfig: DEV_AMM_CONFIG,
          poolState: DEV_CLUBMOON_POOL_ID,
          inputVault: inputVault,
          outputVault: outputVault,
          observationState: observationState,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .remainingAccounts(remainingAccounts)
        .instruction();

        const blockhashContext = await connection.getLatestBlockhashAndContext();

        const transaction = new Transaction({
          feePayer: publicKey,
          blockhash: blockhashContext.value.blockhash,
          lastValidBlockHeight: blockhashContext.value.lastValidBlockHeight,
        })
          //.add(modifyComputeUnits)
          //.add(addPriorityFee)
          .add(claim);

        const simulationResult = await connection.simulateTransaction(transaction);
        console.log('Simulation Result:', simulationResult);

        if (simulationResult.value.err) {
          console.error('Simulation Error:', simulationResult.value.err);
          throw new Error('Transaction simulation failed');
        }
        
        const signature = await sendTransaction(transaction, connection, {
        });


        return signature;

      } catch (error) {
        console.error("Error during transaction processing:", error);
        throw error;
      }
    },

    onSuccess: (signature) => {
      transactionToast(signature);
    },
    onError: (error) => {
      toast.error(`Error initializing game ${error.message}`);
      console.error('Toast error:', error);
    },
  });

  const playerLeave = useMutation<
    string,
    Error
  >({
    mutationKey: ['buyToken'],
    mutationFn: async () => {
      try {
        if (publicKey === null) {
          throw new Error('Wallet not connected');
        }
        /*
        const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
          units: 16000,
        });

        const recentPriorityFees = await connection.getRecentPrioritizationFees({
        });
        const minFee = Math.min(...recentPriorityFees.map(fee => fee.prioritizationFee));

        const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
          microLamports: minFee + 1,
        });
        */


        const playerAccountDiscriminator = Buffer.from(sha256.digest('account:PlayerAccount')).slice(
          0,
          8
        );
  
        const filters = [
          {
            memcmp: { offset: 0, bytes: bs58.encode(playerAccountDiscriminator) },
          },
  
          {
            memcmp: { offset: 40, bytes: gameAccountKey.toBase58() },
          },
        ];

        let offset = 0;
        let length = 0;

        const accounts = await connection.getProgramAccounts(programId, {
          dataSlice: { offset, length },
          filters,
        });

        const remainingAccounts = accounts.map(account => ({
          pubkey: account.pubkey, // Use the public key from your array
          isWritable: false,      // Adjust this based on whether the account needs to be writable
          isSigner: false         // Adjust this based on whether the account is a signer
        }));

        const playerSeeds = [
          Buffer.from("player"),
          gameAccountKey.toBuffer(),
          publicKey.toBuffer()
        ];
        const playerAccountKey = PublicKey.findProgramAddressSync(playerSeeds, programId)[0];


        const leave = await program.methods
          .playerLeave()
          .accounts({
            signer:publicKey,
            closingPlayerAccount:playerAccountKey
          })
          .remainingAccounts(remainingAccounts)
          .instruction();

        const blockhashContext = await connection.getLatestBlockhashAndContext();

        const transaction = new Transaction({
          feePayer: publicKey,
          blockhash: blockhashContext.value.blockhash,
          lastValidBlockHeight: blockhashContext.value.lastValidBlockHeight,
        })
          //.add(modifyComputeUnits)
          //.add(addPriorityFee)
          .add(leave);
        const signature = await sendTransaction(transaction, connection, {
        });


        return signature;

      } catch (error) {
        console.error("Error during transaction processing:", error);
        throw error;
      }
    },

    onSuccess: (signature) => {
      transactionToast(signature);
    },
    onError: (error) => {
      toast.error(`Error initializing game ${error.message}`);
      console.error('Toast error:', error);
    },
  });

  const kickPlayer = useMutation<
    string,
    Error
  >({
    mutationKey: ['buyToken'],
    mutationFn: async () => {
      try {
        if (publicKey === null) {
          throw new Error('Wallet not connected');
        }
        /*
        const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
          units: 16000,
        });

        const recentPriorityFees = await connection.getRecentPrioritizationFees({
        });
        const minFee = Math.min(...recentPriorityFees.map(fee => fee.prioritizationFee));

        const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
          microLamports: minFee + 1,
        });
        */

     
        const playerAccountDiscriminator = Buffer.from(sha256.digest('account:PlayerAccount')).slice(
          0,
          8
        );
  
        const filters = [
          {
            memcmp: { offset: 0, bytes: bs58.encode(playerAccountDiscriminator) },
          },
  
          {
            memcmp: { offset: 40, bytes: gameAccountKey.toBase58() },
          },
        ];

        let offset = 0;
        let length = 0;

        const accounts = await connection.getProgramAccounts(programId, {
          dataSlice: { offset, length },
          filters,
        });

        const remainingAccounts = accounts.map(account => ({
          pubkey: account.pubkey, // Use the public key from your array
          isWritable: false,      // Adjust this based on whether the account needs to be writable
          isSigner: false         // Adjust this based on whether the account is a signer
        }));

        const gameAccountData = await program.account.gameAccount.fetch(gameAccountKey);
        const currentId  = gameAccountData.currentPlayerId;


        const currentIdBuffer = Buffer.alloc(8);
        currentId.toArrayLike(Buffer, "le", 8).copy(currentIdBuffer);

        filters.push({
          memcmp: { offset: 72, bytes: bs58.encode(currentIdBuffer) },
        });

        const currentPlayerAccounts = await connection.getProgramAccounts(programId, {
          dataSlice: { offset, length },
          filters,
        });

        const kick = await program.methods
          .kickPlayer()
          .accounts({
            signer:publicKey,
            closingPlayerAccount: currentPlayerAccounts[0].pubkey, 
          })
          .remainingAccounts(remainingAccounts)
          .instruction();

        const blockhashContext = await connection.getLatestBlockhashAndContext();

        const transaction = new Transaction({
          feePayer: publicKey,
          blockhash: blockhashContext.value.blockhash,
          lastValidBlockHeight: blockhashContext.value.lastValidBlockHeight,
        })
          //.add(modifyComputeUnits)
          //.add(addPriorityFee)
          .add(kick);
        const signature = await sendTransaction(transaction, connection, {
        });


        return signature;

      } catch (error) {
        console.error("Error during transaction processing:", error);
        throw error;
      }
    },

    onSuccess: (signature) => {
      transactionToast(signature);
    },
    onError: (error) => {
      toast.error(`Error initializing game ${error.message}`);
      console.error('Toast error:', error);
    },
  });

  return {
    gameAccountQuery,
    userPlayerAccountQuery,  //INSTEAD OF DOING THIS, DERIVE SEEDS FROM FRONTEND AND USE EXISITING USEPLAYERACOUBTQUERY!
    playerJoin,
    playersQuery,
    playerAnte,
    playerBet,
    playerLeave,
    kickPlayer,
    playerClaim,
  };
}

export function usePlayerAccountQuery({
  accountKey
}: {
  accountKey:PublicKey
}) {
  const provider = useAnchorProvider();
  const program = getAceyProgram(provider);
  const { connection } = useConnection();
  const {cluster} = useCluster();
  const queryClient = useQueryClient();


  const playerAccountQuery = useQuery({
    queryKey: ['playerAccount', { cluster, accountKey }],
    queryFn: async () => {
      return program.account.playerAccount.fetch(accountKey);
    },
  });

  useEffect(() => {
    const subscriptionId = connection.onAccountChange(
      accountKey,
      async (updatedAccountInfo) => {
        try {
          const updatedData = await program.account.playerAccount.fetch(accountKey);
          // Update the query with the new data
          queryClient.setQueryData(['playerAccount', { cluster, accountKey }], updatedData);
        } catch (error) {
          console.error('Failed to fetch updated player account data:', error);
        }
      }
    );

    // Cleanup the subscription when the component unmounts or dependencies change
    return () => {
      connection.removeAccountChangeListener(subscriptionId);
    };
  }, [connection, accountKey, program, cluster, queryClient]);



 

  return {
    playerAccountQuery
  };
}