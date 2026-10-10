"use client";
import { Cloud, Link2, Type, FileText, Key, Brain } from "lucide-react";
import { Modal } from "react-responsive-modal";
import Input from "@/components/dashboard/create-challenge/Input";
import { getAPIai } from "@/lib/dashboard/api";
import { useState, useEffect } from "react";
import { Challenge } from "@/types/challenge";
import { submitEdit } from "@/lib/dashboard/apiMyChallange";
import SecretPrompt from "@/components/dashboard/create-challenge/SecretPrompt";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function ModalMyChallenge({
  open,
  setOpen,
  challenge,
  loading,
  setLoading,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  challenge: Challenge;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState<string>(challenge?.title || "");
  const [description, setDescription] = useState<string>(
    challenge?.description || "",
  );
  const [api_key_encrypted, setAPI] = useState<string>("");
  const [system_prompt_encrypted, setSys] = useState<string>("");
  const [endpoint_url, setEndpoint] = useState<string>("");
  const [providerAI, setProvider] = useState<string>(challenge?.provider || "");
  const [modelName, setModel] = useState<string>(challenge?.model_name || "");
  const [endpointUrlBefore, setEndPointBefore] = useState("");
  const fetchInfo = async () => {
    try {
      const rs = await getAPIai(challenge.challenge_pda);
      return rs.result;
    } catch (err) {
      console.error("Failed to fatch settings of api");
      return [];
    }
  };
  const {
    data: apiSettings = {},
    isLoading,
    refetch: refetchApiSettings,
  } = useQuery({
    queryKey: ["apiSettings", challenge.challenge_pda],
    queryFn: fetchInfo,
  });
  useEffect(() => {
    if (apiSettings?.endpoint_url) {
      setEndpoint(apiSettings.endpoint_url);
      setEndPointBefore(apiSettings.endpoint_url);
    }
    refetchApiSettings();
  }, [apiSettings]);
  const handleEditChallenge = async () => {
    const currentFields = {
      title,
      description,
      provider: providerAI,
      model_name: modelName,
      endpoint_url,
      api_key_encrypted,
      system_prompt_encrypted,
    };
    const updatedFields = Object.fromEntries(
      Object.entries(currentFields).filter(([key, value]) => {
        if (key === "api_key_encrypted" || key === "system_prompt_encrypted") {
          return !!value;
        }
        if (key === "endpoint_url") {
          return value !== endpointUrlBefore;
        }
        return value !== challenge[key as keyof Challenge];
      }),
    );
    await submitEdit(
      challenge.challenge_pda,
      updatedFields,
      loading,
      setLoading,
      setOpen,
    );

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["challenges"] }),
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] }),
      queryClient.invalidateQueries({ queryKey: ["apiSettings"] }),
    ]);
  };
  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      center
      classNames={{
        modal:
          "backdrop-blur-md border border-border p-6 rounded-2xl max-w-md w-10/12 md:w-full",
        overlay: " backdrop-blur-sm",
      }}
      styles={{
        modal: {
          background:
            typeof document !== "undefined" &&
            document.documentElement.classList.contains("dark")
              ? "#000"
              : "#fff",
        },
        closeButton: {
          fill: "currentColor",
          color:
            typeof document !== "undefined" &&
            document.documentElement.classList.contains("dark")
              ? "#fff"
              : "#000",
        },
      }}
    >
      <h2 className="text-foreground text-lg font-bold mb-4">Edit Challenge</h2>
      <div className="text-muted-foreground gap-4 flex flex-col">
        <Input
          input={title}
          setInput={setTitle}
          placeholder="Title"
          Icon={Type}
          label="Title"
          className="outline-0 w-full"
        />
        <Input
          input={description}
          setInput={setDescription}
          placeholder="Description"
          Icon={FileText}
          label="Description"
          className="outline-0 w-full"
        />
        {challenge.status === "draft" && (
          <>
            <Input
              input={providerAI}
              setInput={setProvider}
              placeholder="Provider"
              Icon={Cloud}
              label="Provider"
              className="outline-0 w-full"
            />
            <Input
              input={modelName}
              setInput={setModel}
              placeholder="Model name"
              Icon={Brain}
              label="Model name"
              className="outline-0 w-full"
            />
            <Input
              input={api_key_encrypted}
              setInput={setAPI}
              placeholder="•••••••••••• (Leave blank to keep current)"
              type="password"
              Icon={Key}
              isPassword={true}
              requiredInput={false}
              label="Api Key"
              className="outline-0 w-full"
            />
            <Input
              input={endpoint_url}
              setInput={setEndpoint}
              placeholder="Endpoint URL"
              Icon={Link2}
              type="url"
              label="Endpoint Url"
              className="outline-0 w-full"
            />
            <SecretPrompt
              sysProm={system_prompt_encrypted}
              setSysProm={setSys}
            />
          </>
        )}
      </div>
      <button
        onClick={() => {
          handleEditChallenge();
        }}
        className={`text-white ${loading ? "bg-gray-200" : "bg-primary"} float-right mt-2 font-semibold py-3 px-12 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_25px_rgba(16,185,129,0.2)]`}
        type="submit"
      >
        {loading ? (
          <>
            <span className="animate-spin inline-block w-5 h-5 border-2 border-current border-t-transparent text-gray-500 rounded-full [animation-delay:150ms] animate-[spin_1s_linear_infinite,fadeIn_0.2s_ease-out_150ms_forwards]"></span>
          </>
        ) : (
          "Edit Challenge"
        )}
      </button>
    </Modal>
  );
}
