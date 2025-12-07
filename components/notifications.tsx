"use client"

import * as React from "react"
import {Bell} from "lucide-react"
import {Button} from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {Badge} from "@/components/ui/badge";
import {cn} from "@/lib/utils"
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import Link from "next/link";

// Sample notification data structure
interface Notification {
  id: string
  title: string
  message: string
  timestamp: string
  read: boolean
}

// Sample notifications - in real app, this would come from an API/state
const notifications: Notification[] = [
  {
    id: "1",
    title: "New user registered",
    message: "John Doe has just registered",
    timestamp: "2 minutes ago",
    read: false,
  },
  {
    id: "2",
    title: "Order completed",
    message: "Order #12345 has been completed",
    timestamp: "15 minutes ago",
    read: false,
  },
  {
    id: "3",
    title: "System update",
    message: "New features are available",
    timestamp: "1 hour ago",
    read: true,
  },
  {
    id: "4",
    title: "Payment received",
    message: "Payment of $500 received",
    timestamp: "2 hours ago",
    read: true,
  },
]

export function Notifications() {
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>

        {/*<div className='relative w-fit'>*/}
        {/*  <Avatar className='size-9 rounded-sm'>*/}
        {/*    <AvatarFallback className='rounded-sm'>*/}
        {/*      <Bell className='size-4' />*/}
        {/*    </AvatarFallback>*/}
        {/*  </Avatar>*/}
        {/*  <Badge className='absolute -top-2.5 -right-2.5 h-5 min-w-5 px-1 tabular-nums'>58</Badge>*/}
        {/*</div>*/}

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-6 w-6"/>
          {unreadCount > 0 && (
            <Badge className='absolute -top-1 -right-1 h-5 min-w-5 px-1 tabular-nums'>{unreadCount > 9 ? "9+" : unreadCount}</Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              ({unreadCount} new)
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator/>
        <DropdownMenuGroup>
          {notifications.length === 0 ? (
            <DropdownMenuItem disabled className="flex flex-col items-center justify-center py-6 text-sm text-muted-foreground">
              No notifications
            </DropdownMenuItem>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  "flex flex-col items-start gap-1 px-3 py-2",
                  !notification.read && "bg-accent/50 font-medium"
                )}
              >
                <div className="flex w-full items-start justify-between gap-2">
                  <div className="flex-1 space-y-1">
                    <p className={cn(
                      "text-sm leading-none",
                      !notification.read && "font-semibold"
                    )}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {notification.message}
                    </p>
                  </div>
                  {!notification.read && (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-primary"/>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {notification.timestamp}
                </span>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuGroup>
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator/>
            <DropdownMenuItem asChild className="justify-center text-center cursor-pointer">
              <Button asChild variant="default">
                <Link href="/">View all notifications</Link>
              </Button>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
