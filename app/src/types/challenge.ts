export interface Challenge {
  challenge_pda: string;
  company_wallet: string;
  description: string;
  model_name: string;
  provider: string;
  status: string;
  title: string;
  created_at?: string;
  token_symbol?:string;
  token_decimals?:number;
  amount?:number;
  total_participants?:number;
}