"use client";

import { useSession, signOut } from "~/lib/auth-client";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { LogOut, User, Settings, CreditCard, ChevronUp } from "lucide-react";

export function UserMenu() {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session?.user) {
    return null;
  }

  const user = session.user;
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : (user.email?.[0] ?? "U").toUpperCase();

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/sign-in");
        },
      },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="flex w-full items-center justify-between gap-3 rounded-xl px-2 py-6 text-left hover:bg-[#252525] focus:outline-none"
          />
        }
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <Avatar className="h-8 w-8 rounded-lg border border-[#2D2D2D]">
            {user.image && <AvatarImage src={user.image} alt={user.name ?? "User avatar"} />}
            <AvatarFallback className="bg-[#2D2D2D] text-[#E3E3E3] text-xs font-semibold rounded-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium text-[#E3E3E3] truncate">
              {user.name ?? "My Account"}
            </span>
            <span className="text-[11px] text-[#9B9B9B] truncate">
              {user.email}
            </span>
          </div>
        </div>
        <ChevronUp className="h-4 w-4 text-[#9B9B9B] shrink-0" />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56 bg-[#202020] border border-[#2D2D2D] text-[#E3E3E3] rounded-xl shadow-2xl p-1.5" align="start">
        <div className="px-2 py-1.5 text-xs text-[#9B9B9B] font-medium">
          Logged in as <span className="text-[#E3E3E3]">{user.name || user.email}</span>
        </div>
        <DropdownMenuSeparator className="bg-[#2D2D2D]" />
        
        <DropdownMenuItem
          onClick={() => router.push("/dashboard/settings")}
          className="flex items-center gap-2 px-2.5 py-2 text-sm text-[#E3E3E3] rounded-lg hover:bg-[#2A2A2A] focus:bg-[#2A2A2A] focus:text-[#E3E3E3] cursor-pointer"
        >
          <User className="h-4 w-4 text-[#9B9B9B]" />
          My Profile
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => router.push("/dashboard/billing")}
          className="flex items-center gap-2 px-2.5 py-2 text-sm text-[#E3E3E3] rounded-lg hover:bg-[#2A2A2A] focus:bg-[#2A2A2A] focus:text-[#E3E3E3] cursor-pointer"
        >
          <CreditCard className="h-4 w-4 text-[#9B9B9B]" />
          Billing
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => router.push("/dashboard/settings")}
          className="flex items-center gap-2 px-2.5 py-2 text-sm text-[#E3E3E3] rounded-lg hover:bg-[#2A2A2A] focus:bg-[#2A2A2A] focus:text-[#E3E3E3] cursor-pointer"
        >
          <Settings className="h-4 w-4 text-[#9B9B9B]" />
          Settings
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-[#2D2D2D]" />
        
        <DropdownMenuItem
          onClick={handleSignOut}
          className="flex items-center gap-2 px-2.5 py-2 text-sm text-rose-400 rounded-lg hover:bg-rose-950/30 focus:bg-rose-950/30 cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
