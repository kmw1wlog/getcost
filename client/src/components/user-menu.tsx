import { User, LogIn, LogOut, ShoppingBag, Settings, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import type { User as UserType } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";

interface UserMenuProps {
  user: UserType | undefined;
  isLoading: boolean;
}

export function UserMenu({ user, isLoading }: UserMenuProps) {
  const { storageKey, clearUser } = useAuth();
  const { totalCount } = useCart();

  if (isLoading) {
    return <Skeleton className="h-9 w-9 rounded-full" />;
  }

  if (!user) {
    return (
      <Link href="/login">
        <Button
          variant="outline"
          size="sm"
          data-testid="button-login"
        >
          <LogIn className="h-4 w-4 mr-2" />
          로그인
        </Button>
      </Link>
    );
  }

  const initials = user.firstName && user.lastName 
    ? `${user.firstName[0]}${user.lastName[0]}`
    : user.email?.[0]?.toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-user-menu">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.profileImageUrl || undefined} alt={user.firstName || "User"} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center gap-2 p-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.profileImageUrl || undefined} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {user.firstName} {user.lastName}
            </span>
            <span className="text-xs text-muted-foreground">{user.email}</span>
          </div>
        </div>
        <DropdownMenuSeparator />
        <Link href="/cart">
          <DropdownMenuItem data-testid="menu-cart">
            <ShoppingCart className="h-4 w-4 mr-2" />
            장바구니 {totalCount > 0 ? `(${totalCount})` : ""}
          </DropdownMenuItem>
        </Link>
        <Link href="/purchases">
          <DropdownMenuItem data-testid="menu-purchases">
            <ShoppingBag className="h-4 w-4 mr-2" />
            구매 내역
          </DropdownMenuItem>
        </Link>
        {user.isAdmin && (
          <Link href="/admin">
            <DropdownMenuItem data-testid="menu-admin">
              <Settings className="h-4 w-4 mr-2" />
              관리자
            </DropdownMenuItem>
          </Link>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            localStorage.removeItem("mockUser"); // legacy cleanup
            localStorage.removeItem(storageKey);
            clearUser();
            window.location.href = "/";
          }}
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4 mr-2" />
          로그아웃
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
