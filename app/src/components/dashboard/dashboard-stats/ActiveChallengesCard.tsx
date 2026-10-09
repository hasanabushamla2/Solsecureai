import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface Challenges {
  challenge_pda: string;
  company_wallet: string;
  title: string;
  description: string;
  model_name: string;
  provider: string;
  status: string;
}
interface Amount {
  challenge_pda: string;
  id: string;
  amount: number;
  token_symbol: string;
  token_decimals: number;
  type: "fund" | "earning";
  date: string;
  wallet: string;
}

export default function ActiveChallengesCard({
  challenges,
  amount
}: {
  challenges: Challenges[] | null;
  amount: Amount[];
}) {
  const recentChallenges = challenges
    ? [...challenges].reverse().slice(0, 4)
    : [];
  
  return (
    <div className="flex-1 h-full border-background/2 flex flex-col shadow-xl border-2 p-4 rounded-xl gap-3">
      <div
        className={`${!challenges && "mb-5"} w-full border-border border-b py-2 flex justify-between`}
      >
        <p className="font-bold">Recent Challenges</p>
        <Link
          href={"/challenges"}
          className="text-blue-500 flex hover:scale-105 transition-all ease-in-out duration-300"
        >
          View all
          <ArrowUpRight />
        </Link>
      </div>
      {recentChallenges.map((challenge,index) => {
        const a = (amount as Amount[]).filter(
          (i) =>
            i.challenge_pda === challenge.challenge_pda && i.type === "fund",
        );

        return (
          <Link
            href={`/my-challenges`}
            key={challenge.challenge_pda}
            className={`flex justify-between h-full pb-2 items-center w-full ${recentChallenges.length!==index+1 && 'border-b'} border-border`}
          >
            <div className="w-1/4 min-w-0">
              <p className="font-bold truncate">{challenge.title}</p>
            </div>
            <div className="w-1/4 flex items-center justify-end">
              <p className={`${challenge.status === 'active' ? "bg-primary/20 text-primary":challenge.status === 'draft'? "bg-orange-400/20 text-orange-500":challenge.status==='paused'?"bg-amber-400/20 text-amber-500":challenge.status==='closed'?"bg-red-400/20 text-red-500":"bg-blue-400/20 text-blue-500"} rounded-4xl flex items-center justify-center w-25 py-2 px-4 text-sm font-medium`}>
                {challenge.status}
              </p>
            </div>
            <div className="w-1/4">
              <p className="font-semibold items-center flex justify-end">
                {a && a[0] && a[0].amount / 10 ** a[0].token_decimals}{" "}
                {a&& a[0]&&a[0].token_symbol}
              </p>
            </div>

            <div className="w-1/4">
              <p className=" items-center flex justify-end">
                <ArrowUpRight className="text-primary w-5 h-5" />
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
