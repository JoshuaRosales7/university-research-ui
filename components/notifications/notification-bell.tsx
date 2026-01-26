// components/notifications/notification-bell.tsx
"use client"

import { useState, useEffect } from "react"
import { Bell, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface Notification {
    id: string
    type: string
    title: string
    message: string
    link: string | null
    read: boolean
    created_at: string
}

export function NotificationBell() {
    const { user } = useAuth()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [open, setOpen] = useState(false)

    useEffect(() => {
        if (user) {
            fetchNotifications()
            subscribeToNotifications()
        }
    }, [user])

    async function fetchNotifications() {
        if (!user) return

        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10)

        if (error) {
            // Table might not exist, silently fail
            console.debug('[NotificationBell] Notifications table not available:', error.message)
            return
        }

        if (data) {
            setNotifications(data)
            setUnreadCount(data.filter(n => !n.read).length)
        }
    }

    function subscribeToNotifications() {
        if (!user) return

        // Note: Realtime subscriptions require the notifications table to exist
        // If table doesn't exist, this will not cause errors but won't receive updates
        const channel = supabase
            .channel('notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`
                },
                (payload) => {
                    setNotifications(prev => [payload.new as Notification, ...prev].slice(0, 10))
                    setUnreadCount(prev => prev + 1)
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.debug('[NotificationBell] Subscribed to notifications')
                } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
                    console.debug('[NotificationBell] Notification subscription not available')
                }
            })

        return () => {
            channel.unsubscribe()
        }
    }

    async function markAsRead(notificationId: string) {
        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', notificationId)

        if (error) {
            console.debug('[NotificationBell] Could not mark as read:', error.message)
            return
        }

        setNotifications(prev =>
            prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
    }

    async function markAllAsRead() {
        if (!user) return

        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('user_id', user.id)
            .eq('read', false)

        if (error) {
            console.debug('[NotificationBell] Could not mark all as read:', error.message)
            return
        }

        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        setUnreadCount(0)
    }

    async function deleteNotification(notificationId: string) {
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', notificationId)

        if (error) {
            console.debug('[NotificationBell] Could not delete notification:', error.message)
            return
        }

        setNotifications(prev => prev.filter(n => n.id !== notificationId))
        setUnreadCount(prev => {
            const notification = notifications.find(n => n.id === notificationId)
            return notification && !notification.read ? prev - 1 : prev
        })
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-xl">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-[10px] font-black rounded-full">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[380px] p-0 rounded-3xl shadow-2xl border-0 ring-1 ring-border/50" align="end">
                <div className="flex items-center justify-between p-4 border-b bg-muted/20">
                    <h3 className="font-black text-sm uppercase tracking-tight">Notificaciones</h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            className="h-8 text-[10px] font-black uppercase tracking-widest rounded-xl"
                        >
                            Marcar todas
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[400px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Bell className="h-12 w-12 text-muted-foreground/30 mb-3" />
                            <p className="text-sm font-bold text-muted-foreground">No hay notificaciones</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/20">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "p-4 hover:bg-muted/30 transition-colors relative group",
                                        !notification.read && "bg-primary/5"
                                    )}
                                >
                                    {!notification.read && (
                                        <div className="absolute left-2 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />
                                    )}

                                    <div className="flex gap-3 pl-4">
                                        <div className="flex-1 min-w-0 space-y-1">
                                            <p className="font-bold text-sm leading-tight">{notification.title}</p>
                                            <p className="text-xs text-muted-foreground leading-relaxed">{notification.message}</p>
                                            <p className="text-[10px] text-muted-foreground font-medium">
                                                {new Date(notification.created_at).toLocaleDateString('es-GT', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            {!notification.read && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => markAsRead(notification.id)}
                                                >
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => deleteNotification(notification.id)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {notification.link && (
                                        <Link
                                            href={notification.link}
                                            className="block mt-2 ml-4"
                                            onClick={() => {
                                                markAsRead(notification.id)
                                                setOpen(false)
                                            }}
                                        >
                                            <Button variant="outline" size="sm" className="h-8 text-xs font-bold rounded-xl">
                                                Ver detalles
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    )
}
