/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/acey.json`.
 */
export type Acey = {
  "address": "6z68wfurCMYkZG51s1Et9BJEd9nJGUusjHXNt4dGbNNF",
  "metadata": {
    "name": "acey",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "initGame",
      "discriminator": [
        251,
        46,
        12,
        208,
        184,
        148,
        157,
        73
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "gameAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  97,
                  109,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "clubmoonMint",
          "writable": true
        },
        {
          "name": "solanaMint",
          "writable": true
        },
        {
          "name": "treasuryClubmoonAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  108,
                  117,
                  98,
                  109,
                  111,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "gameAccount"
              }
            ]
          }
        },
        {
          "name": "treasurySolanaAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  111,
                  108,
                  97,
                  110,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "gameAccount"
              }
            ]
          }
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "kickPlayer",
      "discriminator": [
        230,
        225,
        244,
        193,
        58,
        11,
        192,
        199
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "gameAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  97,
                  109,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "closingPlayerAccount",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "playerAnte",
      "discriminator": [
        97,
        185,
        171,
        173,
        109,
        20,
        87,
        181
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "gameAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  97,
                  109,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "playerAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  121,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "gameAccount"
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        },
        {
          "name": "treasurySolanaAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  111,
                  108,
                  97,
                  110,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "gameAccount"
              }
            ]
          }
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "playerBet",
      "discriminator": [
        23,
        181,
        137,
        220,
        128,
        248,
        123,
        210
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "gameAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  97,
                  109,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "playerAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  121,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "gameAccount"
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        },
        {
          "name": "treasurySolanaAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  111,
                  108,
                  97,
                  110,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "gameAccount"
              }
            ]
          }
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "betAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "playerClaim",
      "discriminator": [
        188,
        220,
        237,
        31,
        181,
        18,
        85,
        45
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "gameAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  97,
                  109,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "playerAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  121,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "gameAccount"
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        },
        {
          "name": "treasurySolanaAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  111,
                  108,
                  97,
                  110,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "gameAccount"
              }
            ]
          }
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "playerJoin",
      "discriminator": [
        177,
        164,
        86,
        107,
        116,
        37,
        248,
        210
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "gameAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  97,
                  109,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "playerAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  121,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "gameAccount"
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        },
        {
          "name": "treasurySolanaAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  111,
                  108,
                  97,
                  110,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "gameAccount"
              }
            ]
          }
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "userName",
          "type": "string"
        }
      ]
    },
    {
      "name": "playerLeave",
      "discriminator": [
        26,
        243,
        133,
        50,
        243,
        174,
        111,
        140
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "gameAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  97,
                  109,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "closingPlayerAccount",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "gameAccount",
      "discriminator": [
        168,
        26,
        58,
        96,
        13,
        208,
        230,
        188
      ]
    },
    {
      "name": "playerAccount",
      "discriminator": [
        224,
        184,
        224,
        50,
        98,
        72,
        48,
        236
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "unauthorized",
      "msg": "unauthorized"
    },
    {
      "code": 6001,
      "name": "betBiggerThanPot",
      "msg": "Can't bet bigger than the pot"
    }
  ],
  "types": [
    {
      "name": "gameAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "entryPrice",
            "type": "u64"
          },
          {
            "name": "antePrice",
            "type": "u64"
          },
          {
            "name": "potAmount",
            "type": "u64"
          },
          {
            "name": "nextSkipTime",
            "type": "i64"
          },
          {
            "name": "card1",
            "type": "u8"
          },
          {
            "name": "card2",
            "type": "u8"
          },
          {
            "name": "card3",
            "type": "u8"
          },
          {
            "name": "currentBet",
            "type": "u64"
          },
          {
            "name": "players",
            "type": "bytes"
          },
          {
            "name": "playerNo",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "playerAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "gameAccount",
            "type": "pubkey"
          },
          {
            "name": "userName",
            "type": "string"
          },
          {
            "name": "id",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
