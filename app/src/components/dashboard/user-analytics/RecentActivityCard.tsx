import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { MyActivity } from "../CardStatistics";

export default function RecentActivityCard({
  activity,
}: {
  activity: MyActivity[] | undefined;
}) {
  const recentActivity = activity ? [...activity].reverse().slice(-3) : [];
  const activityConfig: Record<string, { icon: string; text: string }> = {
    login: { icon: "🔑", text: "Logged into the system" },
    logout: { icon: "🚪", text: "Logged out of the system" },
    create_challenge: { icon: "➕", text: "Created a new challenge" },
    fund_challenge: { icon: "💰", text: "Funded the challenge" },
    pause_challenge: { icon: "⏸️", text: "Paused the challenge" },
    resume_challenge: { icon: "▶️", text: "Resumed the challenge" },
    close_challenge: { icon: "❌", text: "Closed the challenge" },
    claim_challenge: { icon: "🏆", text: "Claimed the challenge reward" },
    edit_challenge: { icon: "✏️", text: "Updated challenge details" },
    chat_session: { icon: "💬", text: "Started a new chat session" },
    message: { icon: "✉️", text: "Sent a new message" },
    edit_username: { icon: "👤", text: "Updated account username" },
    win_challenge: { icon: "👑", text: "Won the challenge" },
  };
  return (
    <div className="border-border/5 overflow-y-auto flex flex-col shadow-xl border-2 p-4 rounded-xl gap-3">
      <div
        className={`${!activity && "mb-5"} w-full border-border/20 border-b py-2 flex justify-between`}
      >
        <p className="font-bold">Recent Activities</p>
      </div>

      <div className="flex flex-col justify-center items-center">
        {recentActivity.map((activity: MyActivity) => {
          const config = activityConfig[activity.activity_type] || {
            icon: "📝",
            text: "Performed a system action",
          };

          return (
            <div
              key={activity.id}
              className="flex flex-row justify-between items-center w-full py-1"
            >
              <div className="flex flex-row items-center gap-3">
                <span className="text-xl">{config.icon}</span>

                <div>
                  <p className="font-bold text-sm capitalize">
                    {activity.metadata?.Activity ||
                      activity.activity_type.replace("_", " ")}
                  </p>

                  <div>
                    <p className="text-foreground/50 text-xs mt-0.5">
                      {config.text}{" "}
                      {activity.challenge_pda
                        ? `(PDA: ${activity.challenge_pda.slice(0, 4)}...${activity.challenge_pda.slice(-4)})`
                        : ""}
                    </p>
                    <p className="text-foreground/50 text-xs">
                      {new Date(activity.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
