// components/comments-section.tsx
"use client"

import { useState } from "react"
import { MessageSquare, Send, Trash2, Edit2, Check, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"
import { useComments, addComment, deleteComment, updateComment, useUserProfile } from "@/lib/hooks"
import { cn } from "@/lib/utils"

interface CommentsSectionProps {
  investigationId: string
  onCommentAdded?: () => void
}

function CommentItem({ comment, onDelete, isOwner }: { comment: any, onDelete: (id: string) => void, isOwner: boolean }) {
  const { data: profile } = useUserProfile(comment.user_id)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [isEditSubmitting, setIsEditSubmitting] = useState(false)

  const displayName = profile?.full_name || "Usuario Anónimo"
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const handleUpdate = async () => {
    if (!editContent.trim()) return

    setIsEditSubmitting(true)
    try {
      await updateComment(comment.id, editContent.trim())
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating comment:", error)
    } finally {
      setIsEditSubmitting(false)
    }
  }

  return (
    <div className="group p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3 flex-1 min-w-0">
          <Avatar className="h-8 w-8 mt-1">
            <AvatarFallback className="text-[10px] font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-sm font-bold">{displayName}</p>
              {comment.is_edited && (
                <Badge variant="outline" className="text-[10px] font-bold">Editado</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              {new Date(comment.created_at).toLocaleDateString('es-GT', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>

            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[80px] resize-none rounded-lg border-border/40"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleUpdate}
                    disabled={isEditSubmitting || !editContent.trim()}
                    className="h-8 px-3"
                  >
                    {isEditSubmitting ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Check className="h-3 w-3 mr-1" />}
                    Guardar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsEditing(false)
                      setEditContent(comment.content)
                    }}
                    className="h-8 px-3"
                  >
                    <X className="h-3 w-3 mr-1" /> Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap break-words">{comment.content}</p>
            )}
          </div>
        </div>

        {isOwner && !isEditing && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 hover:bg-background/80"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(comment.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export function CommentsSection({ investigationId, onCommentAdded }: CommentsSectionProps) {
  const { user } = useAuth()
  const { data: comments, mutate } = useComments(investigationId)
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return

    setIsSubmitting(true)
    try {
      await addComment(investigationId, newComment.trim(), user.id)
      setNewComment("")
      mutate()
      onCommentAdded?.()
    } catch (error) {
      console.error("Error adding comment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("¿Eliminar este comentario?")) return

    try {
      await deleteComment(commentId)
      mutate()
    } catch (error) {
      console.error("Error deleting comment:", error)
    }
  }

  return (
    <Card className="border-0 shadow-lg ring-1 ring-border/50 bg-card/60 backdrop-blur-md rounded-3xl overflow-hidden">
      <CardHeader className="border-b bg-muted/20 pb-4">
        <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Comentarios ({comments?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Add Comment Form */}
        {user && (
          <div className="space-y-3 pb-6 border-b border-dashed">
            <Textarea
              placeholder="Comparte tu opinión o pregunta sobre esta investigación..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-24 resize-none rounded-xl border-border/40"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setNewComment("")}
                disabled={!newComment.trim() || isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddComment}
                disabled={!newComment.trim() || isSubmitting}
                className="gap-2"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Comentar
              </Button>
            </div>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {!comments || comments.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">
              No hay comentarios aún. ¡Sé el primero en comentar!
            </p>
          ) : (
            comments.map((comment: any) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onDelete={handleDeleteComment}
                isOwner={user?.id === comment.user_id}
              />
            ))
          )}
        </div>

        {!user && (
          <p className="text-center text-muted-foreground text-sm py-4">
            Inicia sesión para comentar en esta investigación
          </p>
        )}
      </CardContent>
    </Card>
  )
}
