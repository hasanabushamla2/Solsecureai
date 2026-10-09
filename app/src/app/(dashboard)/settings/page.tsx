"use client";
import Input from "@/components/dashboard/create-challenge/Input";
import { editProfile, getProfile } from "@/lib/dashboard/api";
import { socket } from "@/lib/socket";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Coins, User } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Profile {
  wallet_address: string;
  username: string;
  created_at: string;
}

export default function page() {
  const [profile, setProfile] = useState<Profile>();
  const [username, setUsername] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const queryClient = useQueryClient()
  const getProfileRes = async () => {
    const rs = await getProfile();
    return rs.result;
  };

  const {
    data: profileCash = {},
    isLoading: isLoadingCash,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ["profileSettings"],
    queryFn: getProfileRes,
  });

  useEffect(() => {
    socket?.on("dashboard:update", refetchProfile);
    return () => {
      socket?.off("dashboard:update");
      socket.disconnect();
    };
  }, [socket, getProfileRes]);
  const formatDate = (dateString: string | null | undefined) => {
    if (typeof dateString !== "string") return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const editProfileUsername = async () => {
    try {
      setLoading(true);
      await editProfile(username);
      toast.success("Successfully.");
      queryClient.invalidateQueries({queryKey:['profileSettings']})
    } catch (err) {
      toast.error("Error to edit username.");
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 800);
    }
  };
  if (isLoadingCash) {
    return (
      <div className="flex justify-center items-center p-8 animate-fade-in duration-200">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-muted border-t-foreground" />
      </div>
    );
  }
  return (
    <div className="p-6 md:w-2/3 flex gap-5 flex-col max-w-7xl">
      <Input
        input={profileCash?.wallet_address}
        label="Wallet Address"
        Icon={Coins}
        disabled={true}
        className="text-sm md:text-md w-full"
      />
      <Input
        input={profileCash.username}
        setInput={setUsername}
        label="Username"
        Icon={User}
        className="outline-0 w-full"
      />
      <p className="ml-2">
        Joined :{" "}
        <span className="text-foreground/50">
          {formatDate(profileCash?.created_at)}
        </span>
      </p>
      <button
        disabled={loading}
        onClick={() => {
          editProfileUsername();
        }}
        className={`${loading ? "bg-gray-300" : "bg-primary"} mt-4 px-4 w-1/2 py-2 text-background font-medium text-sm rounded-lg hover:opacity-90 transition-all`}
      >
        {loading ? (
          <>
            <span
              className="animate-spin inline-block w-3 h-3 border-2 border-current border-t-transparent text-gray-500 rounded-full"
              role="status"
              aria-label="loading"
            ></span>
          </>
        ) : (
          "Edit Profile"
        )}
      </button>
    </div>
  );
}
