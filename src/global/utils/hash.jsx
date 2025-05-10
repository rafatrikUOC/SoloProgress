import * as Crypto from 'expo-crypto';

export const customHash = async (text) => {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    text
  );
  return digest;
};
