import { Idl } from "@coral-xyz/anchor";

export type ShadowPay = {
  address: string;
  metadata: {
    name: string;
    version: string;
    spec: string;
    description: string;
  };
  version: "0.1.0";
  name: "shadowpay";
  instructions: [
    {
      name: "initializeUser";
      accounts: [
        { name: "userProfile", isMut: true, isSigner: false },
        { name: "owner", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false }
      ];
      args: [
        { name: "worldIdNullifier", type: { array: ["u8", 32] } },
        { name: "arciumPubkey", type: { array: ["u8", 32] } },
        { name: "usernameHash", type: { array: ["u8", 32] } }
      ];
    },
    {
      name: "sendPayment";
      accounts: [
        { name: "sender", isMut: true, isSigner: true },
        { name: "senderProfile", isMut: true, isSigner: false },
        { name: "recipient", isMut: true, isSigner: false },
        { name: "recipientProfile", isMut: true, isSigner: false },
        { name: "senderTokenAccount", isMut: true, isSigner: false },
        { name: "recipientTokenAccount", isMut: true, isSigner: false },
        { name: "paymentRecord", isMut: true, isSigner: false },
        { name: "tokenProgram", isMut: false, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false }
      ];
      args: [
        { name: "amount", type: "u64" },
        { name: "encryptedAmount", type: { array: ["u8", 64] } },
        { name: "encryptedMemo", type: { array: ["u8", 128] } }
      ];
    }
  ];
  accounts: [
    {
      name: "userProfile";
      type: {
        kind: "struct";
        fields: [
          { name: "owner", type: "publicKey" },
          { name: "worldIdNullifier", type: { array: ["u8", 32] } },
          { name: "arciumPubkey", type: { array: ["u8", 32] } },
          { name: "usernameHash", type: { array: ["u8", 32] } },
          { name: "encryptedBalance", type: { array: ["u8", 64] } },
          { name: "paymentCount", type: "u64" },
          { name: "receiveCount", type: "u64" },
          { name: "isVerified", type: "bool" },
          { name: "createdAt", type: "i64" },
          { name: "bump", type: "u8" }
        ];
      };
    },
    {
      name: "paymentRecord";
      type: {
        kind: "struct";
        fields: [
          { name: "sender", type: "publicKey" },
          { name: "recipient", type: "publicKey" },
          { name: "encryptedAmount", type: { array: ["u8", 64] } },
          { name: "encryptedMemo", type: { array: ["u8", 128] } },
          { name: "timestamp", type: "i64" },
          { name: "bump", type: "u8" }
        ];
      };
    },
    {
      name: "paymentRequest";
      type: {
        kind: "struct";
        fields: [
          { name: "requester", type: "publicKey" },
          { name: "amount", type: "u64" },
          { name: "encryptedAmount", type: { array: ["u8", 64] } },
          { name: "encryptedMemo", type: { array: ["u8", 128] } },
          { name: "expiry", type: "i64" },
          { name: "bump", type: "u8" }
        ];
      };
    }
  ];
};

export const IDL: ShadowPay = {
  address: "11111111111111111111111111111111",
  metadata: {
    name: "shadowpay",
    version: "0.1.0",
    spec: "0.1.0",
    description: "Privacy-first P2P payments",
  },
  version: "0.1.0",
  name: "shadowpay",
  instructions: [
    {
      name: "initializeUser",
      accounts: [
        { name: "userProfile", isMut: true, isSigner: false },
        { name: "owner", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false }
      ],
      args: [
        { name: "worldIdNullifier", type: { array: ["u8", 32] } },
        { name: "arciumPubkey", type: { array: ["u8", 32] } },
        { name: "usernameHash", type: { array: ["u8", 32] } }
      ]
    },
    {
      name: "sendPayment",
      accounts: [
        { name: "sender", isMut: true, isSigner: true },
        { name: "senderProfile", isMut: true, isSigner: false },
        { name: "recipient", isMut: true, isSigner: false },
        { name: "recipientProfile", isMut: true, isSigner: false },
        { name: "senderTokenAccount", isMut: true, isSigner: false },
        { name: "recipientTokenAccount", isMut: true, isSigner: false },
        { name: "paymentRecord", isMut: true, isSigner: false },
        { name: "tokenProgram", isMut: false, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false }
      ],
      args: [
        { name: "amount", type: "u64" },
        { name: "encryptedAmount", type: { array: ["u8", 64] } },
        { name: "encryptedMemo", type: { array: ["u8", 128] } }
      ]
    }
  ],
  accounts: [
    {
      name: "userProfile",
      type: {
        kind: "struct",
        fields: [
          { name: "owner", type: "publicKey" },
          { name: "worldIdNullifier", type: { array: ["u8", 32] } },
          { name: "arciumPubkey", type: { array: ["u8", 32] } },
          { name: "usernameHash", type: { array: ["u8", 32] } },
          { name: "encryptedBalance", type: { array: ["u8", 64] } },
          { name: "paymentCount", type: "u64" },
          { name: "receiveCount", type: "u64" },
          { name: "isVerified", type: "bool" },
          { name: "createdAt", type: "i64" },
          { name: "bump", type: "u8" }
        ]
      }
    },
    {
      name: "paymentRecord",
      type: {
        kind: "struct",
        fields: [
          { name: "sender", type: "publicKey" },
          { name: "recipient", type: "publicKey" },
          { name: "encryptedAmount", type: { array: ["u8", 64] } },
          { name: "encryptedMemo", type: { array: ["u8", 128] } },
          { name: "timestamp", type: "i64" },
          { name: "bump", type: "u8" }
        ]
      }
    },
    {
      name: "paymentRequest",
      type: {
        kind: "struct",
        fields: [
          { name: "requester", type: "publicKey" },
          { name: "amount", type: "u64" },
          { name: "encryptedAmount", type: { array: ["u8", 64] } },
          { name: "encryptedMemo", type: { array: ["u8", 128] } },
          { name: "expiry", type: "i64" },
          { name: "bump", type: "u8" }
        ]
      }
    }
  ]
};
