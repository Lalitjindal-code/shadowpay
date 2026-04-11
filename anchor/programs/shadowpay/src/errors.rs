use anchor_lang::prelude::*;

#[error_code]
pub enum ShadowPayError {
    #[msg("User must be World ID verified to send payments")]
    NotVerified,
    #[msg("Invalid World ID nullifier — duplicate account")]
    DuplicateNullifier,
    #[msg("Encrypted amount ciphertext is malformed")]
    InvalidCiphertext,
    #[msg("Payment request has expired")]
    RequestExpired,
    #[msg("Payment request already fulfilled")]
    AlreadyFulfilled,
    #[msg("Insufficient balance for payment")]
    InsufficientBalance,
    #[msg("Recipient account not initialized")]
    RecipientNotFound,
}
