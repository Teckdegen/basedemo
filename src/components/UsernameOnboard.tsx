
import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface UsernameOnboardProps {
  onFinish?: () => void;
}

const UsernameOnboard: React.FC<UsernameOnboardProps> = ({ onFinish }) => {
  const { setUsername } = useAuth();
  const [username, setNewUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!username.trim()) {
      setError("Username required");
      setLoading(false);
      return;
    }
    const { error } = await setUsername(username.trim());
    if (error) {
      setError(error.message || "Could not set username");
    } else if (onFinish) {
      onFinish();
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow-xl space-y-4 w-full max-w-xs text-center"
      >
        <div className="text-lg font-bold text-gray-900">Pick Your Username</div>
        <Input
          placeholder="Unique username"
          value={username}
          onChange={(e) => setNewUsername(e.target.value)}
          className="w-full"
          autoFocus
          disabled={loading}
        />
        {error && <div className="text-sm text-red-500">{error}</div>}
        <Button
          type="submit"
          className="w-full bg-blue-600 text-white"
          disabled={loading}
        >
          {loading ? "Saving..." : "Continue"}
        </Button>
      </form>
    </div>
  );
};

export default UsernameOnboard;
