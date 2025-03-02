'use client';

import { ACEY_PROGRAM_ID as programId, getAceyProgram } from '@project/anchor'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useMutation, useQuery } from '@tanstack/react-query'

import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'
import { ComputeBudgetProgram, PublicKey, Transaction } from '@solana/web3.js';
import BN from 'bn.js';
import { CLUBMOON_MINT, EMPTY_PUBLIC_KEY, ZERO } from './acey-helpers';
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, NATIVE_MINT, getAssociatedTokenAddress } from '@solana/spl-token';

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


        const init = await program.methods
          .initGame()
          .accounts({
            signer:publicKey,
            clubmoonMint: CLUBMOON_MINT,
            solanaMint: NATIVE_MINT,
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
          .add(init);
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
    initGame,
  };
}

export function usePlayerJoin() {
  const { program } = useAceyProgram();
  const transactionToast = useTransactionToast();
  const { connection } = useConnection();
  const { sendTransaction, publicKey } = useWallet();
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

     


        const bet = await program.methods
          .playerBet()
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

    


        const claim = await program.methods
          .playerClaim()
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

     


        const leave = await program.methods
          .playerLeave()
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

     


        const kick = await program.methods
          .kickPlayer()
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

  return {
    playerJoin
  };
}