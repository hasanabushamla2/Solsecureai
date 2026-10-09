import axios from "axios";

export async function getMe() {
  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`,
    { withCredentials: true },
  );

  return res.data;
}

export async function getStats() {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/stats`,
    { withCredentials: true },
  );

  return response.data;
}

export async function getActivity() {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/activity`,
    { withCredentials: true },
  );

  return response.data;
}

export async function getSession() {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/api/chat/sessions`,
    { withCredentials: true },
  );

  return response.data;
}


export async function getAnalyticsMessage(day:'7D'|'30D'|'3M'|'1Y') {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/api/analytics/chat-messages/${day}`,{ withCredentials: true },
  );

  return response.data;
}

export async function getChallenges() {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/api/my-challenges`,
    { withCredentials: true },
  );

  return response.data;
}

export async function createChallenge(
  challenge_pda: string,
  transaction_signature: string,
  title: string,
  description: string,
  model_name: string,
  provider: string,
  api_key: string,
  endpoint_url: string,
  sysProm: string,
  secret: string,
) {
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/api/create-challenge`,
    {
      challenge_pda,
      transaction_signature,
      title,
      description,
      model_name,
      provider,
      api_key,
      endpoint_url,
    },
    {
      withCredentials: true,
    },
  );
  const createAICre = await createAPI(
    api_key,
    provider,
    endpoint_url,
    challenge_pda,
  );
  const createAIConfigs = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/api/challenges/${challenge_pda}/ai-config`,
    {
      system_prompt: sysProm,
      secret,
    },
    {
      withCredentials: true,
    },
  );

  return response.data;
}

export async function createAPI(
  api_key: string,
  providerAI: string,
  endpoint_url: string,
  challenge_pda?: string,
) {
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/api/company/ai-credentials`,
    {
      api_key,
      provider: providerAI,
      endpoint_url,
      challenge_pda,
    },
    {
      withCredentials: true,
    },
  );
  return response.data;
}

export async function updateAPI(
  id: string,
  updatedFields: Record<string, string>,
) {
  const response = await axios.patch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/challenges/${id}`,
    { id, ...updatedFields },
    {
      withCredentials: true,
    },
  );

  return response.data;
}

export async function getAPIai(id: string) {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/api/challenge-ai-credentials/${id}`,

    {
      withCredentials: true,
    },
  );

  return response.data;
}

export async function getAPIRes() {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/api/company/ai-credentials`,
    {
      withCredentials: true,
    },
  );

  return response.data;
}

export async function getAPIResId(id: string) {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/api/company/ai-credentials/${id}`,
    {
      withCredentials: true,
    },
  );

  return response.data;
}

export async function getChallengesAll() {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/api/challenges`,
    { withCredentials: true },
  );

  return response.data;
}

export async function getChallengesParticipants() {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/api/challenges-participants`,
    { withCredentials: true },
  );

  return response.data;
}

export async function fundChallenge(
  challenge_pda: string,
  transaction_signature: string,
  company_wallet: string,
) {
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/api/fund-challenge`,
    {
      challenge_pda,
      transaction_signature,
      company_wallet,
    },
    {
      withCredentials: true,
    },
  );
  return response.data;
}

export async function claimChallenge(challenge_pda: string) {
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/api/challenges/${challenge_pda}/claim`,
    {},
    {
      withCredentials: true,
    },
  );
  const chatSession = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/api/chat/sessions`,
    {
      challenge_pda,
    },
    {
      withCredentials: true,
    },
  );

  return response.data;
}

export async function closeChallenge(
  challenge_pda: string,
  transaction_signature: string,
  company_wallet: string,
) {
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/api/close-challenge`,
    {
      challenge_pda,
      transaction_signature,
      company_wallet,
    },
    {
      withCredentials: true,
    },
  );

  return response.data;
}

export async function pauseOrResumeChallenge(
  challenge_pda: string,
  transaction_signature: string,
  company_wallet: string,
  pause: boolean,
) {
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/api/${pause === true ? "pause-challenge" : "resume-challenge"}`,
    {
      challenge_pda,
      transaction_signature,
      company_wallet,
    },
    {
      withCredentials: true,
    },
  );

  return response.data;
}

export async function submitSecretChallenge(
  challenge_pda: string,
  transaction_signature: string,
  company_wallet: string,
) {
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/api/complete-challenge`,
    {
      challenge_pda,
      transaction_signature,
      company_wallet,
    },
    {
      withCredentials: true,
    },
  );

  return response.data;
}

export async function getChatSessions() {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/api/chat/sessions`,
    { withCredentials: true },
  );

  return response.data;
}

export async function getMessages(id:string,ch:string) {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/api/chat/sessions/${id}/challenge/${ch}/messages`,
    { withCredentials: true },
  );

  return response.data;
}

export async function getProfile() {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/api/user/profile`,
    { withCredentials: true },
  );

  return response.data;
}

export async function editProfile(username: string) {
  const response = await axios.patch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/user/profile`,
    { username },
    { withCredentials: true },
  );

  return response.data;
}

export async function getBilling() {
  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/api/user/billing`,
    { withCredentials: true },
  );
  return res.data;
}

export async function getLeaderRes() {
  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/api/leaderboard`,
    { withCredentials: true },
  );
  return res.data;
}

export async function getCountRes(day:'7D'|'30D'|'3M'|'1Y'){
  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/api/analytics/activity-overview/${day}`,
    { withCredentials: true },
  );
  return res.data;
}

export async function getNotification() {
  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/api/notification-count`,
    { withCredentials: true },
  );
  return res.data;
}
export async function getNotificationContent() {
  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/api/notification`,
    { withCredentials: true },
  );
  return res.data;
}

export async function postNotification() {
  const res = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/api/notification`,{},
    { withCredentials: true },
  );
  return res.data;
}