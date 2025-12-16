import React, { useState, useEffect } from 'react';
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageCircle, 
  MapPin, 
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { PhotoViewer } from './photo-viewer';
import { CommentSection } from './comment-section';
import { useAuth } from '../contexts/AuthContext';
import { reportsAPI, DisasterReport } from '../services/api';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const mockPosts = [
  {
    id: 1,
    title: 'Oil Spill Emergency - Goa Coast',
    location: 'Goa, India',
    severity: 'CRITICAL',
    description: 'Large oil spill detected near popular beach area. Immediate response required.',
    reporter: 'Coast Guard',
    reporterAvatar: '/avatars/coast-guard.png',
    timestamp: '30 minutes ago',
    status: 'VERIFIED',
    image: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=400&h=300&fit=crop',
    votes: { up: 45, down: 2 },
    comments: 12,
    views: 234
  },
  {
    id: 2,
    title: 'High Waves Alert - Mumbai Coast',
    location: 'Mumbai, Maharashtra',
    severity: 'MEDIUM',
    description: 'Waves reaching 4-5 meters height. Fishing boats advised to stay in harbor.',
    reporter: 'Fisherman Cooperative',
    reporterAvatar: '/avatars/fisherman.png',
    timestamp: '1 hour ago',
    status: 'VERIFIED',
    image: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=300&fit=crop',
    votes: { up: 23, down: 1 },
    comments: 8,
    views: 156
  },
  {
    id: 3,
    title: 'Minor Storm Surge - Kochi',
    location: 'Kochi, Kerala',
    severity: 'LOW',
    description: 'Water level slightly elevated along waterfront areas. Monitoring ongoing.',
    reporter: 'Local Authority',
    reporterAvatar: '/avatars/authority.png',
    timestamp: '2 hours ago',
    status: 'PENDING',
    image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=300&fit=crop',
    votes: { up: 12, down: 0 },
    comments: 3,
    views: 89
  }
];

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'CRITICAL': return 'bg-red-500';
    case 'HIGH': return 'bg-red-500';
    case 'MEDIUM': return 'bg-yellow-500';
    case 'LOW': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'VERIFIED': return 'text-green-600 bg-green-50 dark:bg-green-950/20';
    case 'PENDING': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20';
    case 'REJECTED': return 'text-red-600 bg-red-50 dark:bg-red-950/20';
    default: return 'text-gray-600 bg-gray-50 dark:bg-gray-950/20';
  }
};

interface PostFeedProps {
  selectedState: string;
}

export function PostFeed({ selectedState }: PostFeedProps) {
  const [posts, setPosts] = useState<DisasterReport[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const [photoViewer, setPhotoViewer] = useState<{
    isOpen: boolean;
    imageUrl: string;
    imageAlt: string;
  }>({
    isOpen: false,
    imageUrl: '',
    imageAlt: ''
  });
  const { token } = useAuth();

  useEffect(() => {
    // Add a small delay to ensure backend is ready
    const timer = setTimeout(() => {
      fetchPosts();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Refetch posts when selectedState changes
  useEffect(() => {
    fetchPosts();
  }, [selectedState]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      console.log('Fetching posts...', selectedState ? `for state: ${selectedState}` : 'for all states');
      const response = await reportsAPI.getReports({ 
        limit: 5,
        ...(selectedState && { state: selectedState })
      });
      console.log('Posts response:', response);
      if (response.success) {
        setPosts(response.data);
        console.log('Posts set:', response.data);
      } else {
        console.error('Failed to fetch reports:', response.message);
        toast.error('Failed to fetch reports');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Error fetching reports');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (reportId: string, voteType: 'up' | 'down') => {
    if (!token) {
      toast.error('Please log in to vote');
      return;
    }

    try {
      const response = await reportsAPI.voteReport(token, reportId, voteType);
      if (response.success) {
        // Update local state
        setPosts(posts.map(post => 
          post._id === reportId 
            ? { ...post, votes: response.data.votes }
            : post
        ));
        toast.success('Vote recorded');
      } else {
        toast.error(response.message || 'Failed to vote');
      }
    } catch (error) {
      toast.error('Error voting on report');
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return t('timeAgo.justNow');
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}${t('timeAgo.minutesAgo')}`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}${t('timeAgo.hoursAgo')}`;
    return `${Math.floor(diffInSeconds / 86400)}${t('timeAgo.daysAgo')}`;
  };

  const handleImageClick = (imageUrl: string, imageAlt: string) => {
    setPhotoViewer({
      isOpen: true,
      imageUrl,
      imageAlt
    });
  };

  const closePhotoViewer = () => {
    setPhotoViewer({
      isOpen: false,
      imageUrl: '',
      imageAlt: ''
    });
  };

  if (loading) {
    return (
      <Card 
        className="backdrop-blur-md border-blue-200/60 dark:border-blue-700/40 hover:shadow-md transition-all duration-200"
        style={{ backgroundColor: '#f0f9ff' }} // sky-50
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>{t('postFeed.loadingReports')}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="backdrop-blur-md border-blue-200/60 dark:border-blue-700/40 hover:shadow-md transition-all duration-200"
      style={{ backgroundColor: '#f0f9ff' }} // sky-50
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200">{t('dashboard.recentActivity')}</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {t('reports.subtitle')}
            </p>
          </div>
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            {t('dashboard.viewAll')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>{t('postFeed.noReportsFound')}</p>
          </div>
        ) : (
          posts.map((post) => (
            <div 
              key={post._id} 
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-sky-50/50 dark:bg-gray-800/50 backdrop-blur-sm"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={post.authorAvatar || "/avatars/user.png"} />
                    <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{post.authorName}</p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimeAgo(post.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className={`${getSeverityColor(post.severity)} text-white border-0`}>
                    {post.severity}
                  </Badge>
                  <Badge variant="secondary" className={getStatusColor(post.status)}>
                    {post.status === 'VERIFIED' && <CheckCircle className="w-3 h-3 mr-1" />}
                    {post.status === 'PENDING' && <AlertTriangle className="w-3 h-3 mr-1" />}
                    {post.status}
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold mb-1">{post.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{post.description}</p>
                </div>

                {/* Location */}
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <MapPin className="w-4 h-4" />
                  <span>{post.location}</span>
                </div>

                {/* Media */}
                {post.media?.url && (
                  <div className="rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity" 
                       onClick={() => handleImageClick(post.media.url, post.title)}>
                    <ImageWithFallback 
                      src={post.media.url}
                      alt={post.title}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-4">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400"
                      onClick={() => handleVote(post._id, 'up')}
                    >
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      {post.votes.up}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
                      onClick={() => handleVote(post._id, 'down')}
                    >
                      <ThumbsDown className="w-4 h-4 mr-1" />
                      {post.votes.down}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {post.comments.length}
                    </Button>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {post.views} {t('postFeed.views')}
                  </div>
                </div>

                {/* Comment Section */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <CommentSection 
                    reportId={post._id}
                    initialComments={post.comments || []}
                    onCommentAdded={(comment) => {
                      // Update the post's comment count
                      setPosts(posts.map(p => 
                        p._id === post._id 
                          ? { ...p, comments: [...(p.comments || []), comment] }
                          : p
                      ));
                    }}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
      
      {/* Photo Viewer */}
      <PhotoViewer
        isOpen={photoViewer.isOpen}
        onClose={closePhotoViewer}
        imageUrl={photoViewer.imageUrl}
        imageAlt={photoViewer.imageAlt}
      />
    </Card>
  );
}