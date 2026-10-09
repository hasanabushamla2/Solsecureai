import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

export async function getSign(wallet: string | undefined) {
  const response = await api.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/nonce`, {
    wallet_address: wallet,
  });

  return response.data;
}

export async function verifySign(id: string, nonce: string, signature: string) {
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify`,
    {
      id,
      nonce,
      signature,
    },
    {
      withCredentials: true,
    },
  );

  return response.data;
}

export async function getMe() {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`,
    { withCredentials: true },
  );

  return response.data;
}
