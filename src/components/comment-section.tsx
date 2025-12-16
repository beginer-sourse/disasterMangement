import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { MessageCircle, Send, User, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { commentsAPI } from '../services/api';
import { toast } from 'sonner';

interface Comment {
  _id: string;
  content: string;
  author: string;
  authorName: string;
  authorAvatar?: string;
  report: string;
  createdAt: string;
  updatedAt: string;
}

interface CommentSectionProps {
  reportId: string;
  initialComments?: Comment[];
  onCommentAdded?: (comment: Comment) => void;
  className?: string;
}

export function CommentSection({ 
  reportId, 
  initialComments = [], 
  onCommentAdded,
  className = "" 
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const { token, user } = useAuth();

  useEffect(() => {
    if (showComments && comments.length === 0) {
      fetchComments();
    }
  }, [showComments, reportId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await commentsAPI.getComments(reportId);
      if (response.success) {
        setComments(response.data);
      } else {
        toast.error('Failed to fetch comments');
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Error fetching comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast.error('Please log in to comment');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      setSubmitting(true);
      const response = await commentsAPI.createComment(token, reportId, newComment.trim());
      
      if (response.success) {
        const comment = response.data.comment;
        setComments(prev => [comment, ...prev]);
        setNewComment('');
        toast.success('Comment added successfully');
        
        if (onCommentAdded) {
          onCommentAdded(comment);
        }
      } else {
        toast.error(response.message || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Error creating comment:', error);
      toast.error('Error creating comment');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Comment Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowComments(!showComments)}
        className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 w-full justify-start"
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
        {showComments ? ' (Hide)' : ' (Show)'}
      </Button>

      {/* Comment Section */}
      {showComments && (
        <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">Comments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Comment Input */}
            {token && (
              <form onSubmit={handleSubmitComment} className="space-y-3">
                <div className="flex space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="text-xs">
                      {user ? getInitials(user.name) : <User className="w-4 h-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Textarea
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[80px] resize-none bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                      maxLength={500}
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {newComment.length}/500 characters
                      </span>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={submitting || !newComment.trim()}
                        className="ml-auto"
                      >
                        {submitting ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-1" />
                            Post
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            )}

            {/* Comments List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">No comments yet. Be the first to comment!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment._id} className="flex space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.authorAvatar} />
                      <AvatarFallback className="text-xs">
                        {getInitials(comment.authorName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{comment.authorName}</span>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTimeAgo(comment.createdAt)}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
