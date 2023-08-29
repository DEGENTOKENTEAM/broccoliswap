import {
    DeflationTokenError,
    FailedToCheckForTransactionReceiptError,
    InsufficientFundsError,
    InsufficientFundsOneinchError,
    LowGasError,
    LowSlippageDeflationaryTokenError,
    MaxAmountError,
    MinAmountError,
    NotWhitelistedProviderError,
    TooLowAmountError,
    TransactionRevertedError,
    UnsupportedReceiverAddressError,
    UpdatedRatesError,
    UserRejectError,
    WalletNotConnectedError,
    WrongNetworkError,
    nativeTokensList
} from "rubic-sdk";

export const getErrorName = (err: Error) => {
    if (err instanceof UpdatedRatesError) {
      return 'UpdatedRatesError';
    }
    if (err instanceof TransactionRevertedError) {
      return 'TransactionRevertedError';
    }
    if (err instanceof TooLowAmountError) {
      return 'TooLowAmountError';
    }
    if (err instanceof FailedToCheckForTransactionReceiptError) {
      return 'FailedToCheckForTransactionReceiptError';
    }
    if (err instanceof UserRejectError) {
      return 'UserRejectError';
    }
    if (err instanceof InsufficientFundsError) {
      return 'InsufficientFundsError';
    }
    if (err instanceof LowGasError) {
      return 'LowGasError';
    }
    if (err instanceof LowSlippageDeflationaryTokenError) {
      return 'LowSlippageDeflationaryTokenError';
    }
    if (err instanceof InsufficientFundsOneinchError) {
      return 'InsufficientFundsOneinchError';
    }
    if (err instanceof NotWhitelistedProviderError) {
      return 'NotWhitelistedProviderError';
    }
    if (err instanceof DeflationTokenError) {
      return 'DeflationTokenError';
    }
    if (err instanceof WalletNotConnectedError) {
      return 'WalletNotConnectedError';
    }
    if (err instanceof WrongNetworkError) {
      return 'WrongNetworkError';
    }
    if (err instanceof MinAmountError) {
      return 'MinAmountError';
    }
    if (err instanceof MaxAmountError) {
      return 'MaxAmountError';
    }
    if (err instanceof UnsupportedReceiverAddressError) {
      return 'UnsupportedReceiverAddressError';
    }
}