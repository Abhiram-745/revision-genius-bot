import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Video, 
  Youtube, 
  Instagram, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ExternalLink, 
  Loader2,
  Users 
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface AmbassadorSubmission {
  id: string;
  user_id: string;
  platform: string;
  video_url: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_email?: string;
  user_avatar?: string;
}

export const AmbassadorTab = () => {
  const [submissions, setSubmissions] = useState<AmbassadorSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<AmbassadorSubmission | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("ambassador_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch user info for each submission
      const userIds = [...new Set((data || []).map(s => s.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);

      const submissionsWithUsers = (data || []).map(sub => {
        const profile = profiles?.find(p => p.id === sub.user_id);
        return {
          ...sub,
          user_name: profile?.full_name || "Unknown User",
          user_avatar: profile?.avatar_url || null,
        };
      });

      setSubmissions(submissionsWithUsers);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast.error("Failed to load ambassador submissions");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (submission: AmbassadorSubmission) => {
    setActionLoading(submission.id);
    try {
      const { error } = await supabase
        .from("ambassador_submissions")
        .update({ 
          status: "approved",
          admin_notes: null,
          updated_at: new Date().toISOString()
        })
        .eq("id", submission.id);

      if (error) throw error;

      toast.success("Submission approved!");
      await fetchSubmissions();
    } catch (error) {
      console.error("Error approving submission:", error);
      toast.error("Failed to approve submission");
    } finally {
      setActionLoading(null);
    }
  };

  const openRejectDialog = (submission: AmbassadorSubmission) => {
    setSelectedSubmission(submission);
    setRejectNotes("");
    setRejectDialogOpen(true);
  };

  const handleReject = async () => {
    if (!selectedSubmission) return;

    setActionLoading(selectedSubmission.id);
    try {
      const { error } = await supabase
        .from("ambassador_submissions")
        .update({ 
          status: "rejected",
          admin_notes: rejectNotes.trim() || "Video did not meet requirements",
          updated_at: new Date().toISOString()
        })
        .eq("id", selectedSubmission.id);

      if (error) throw error;

      toast.success("Submission rejected");
      setRejectDialogOpen(false);
      await fetchSubmissions();
    } catch (error) {
      console.error("Error rejecting submission:", error);
      toast.error("Failed to reject submission");
    } finally {
      setActionLoading(null);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "youtube":
        return <Youtube className="h-4 w-4 text-red-500" />;
      case "tiktok":
        return <Video className="h-4 w-4 text-pink-500" />;
      case "instagram":
        return <Instagram className="h-4 w-4 text-purple-500" />;
      default:
        return <Video className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-500 text-white">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const pendingCount = submissions.filter(s => s.status === "pending").length;
  const approvedCount = submissions.filter(s => s.status === "approved").length;
  const rejectedCount = submissions.filter(s => s.status === "rejected").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{submissions.length}</p>
                <p className="text-sm text-muted-foreground">Total Submissions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{approvedCount}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <XCircle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{rejectedCount}</p>
                <p className="text-sm text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submissions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Ambassador Submissions
          </CardTitle>
          <CardDescription>Review video submissions from users</CardDescription>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No submissions yet</p>
            </div>
          ) : (
            <AnimatePresence>
              <div className="space-y-3">
                {submissions.map((submission, index) => (
                  <motion.div
                    key={submission.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-all"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={submission.user_avatar || undefined} />
                        <AvatarFallback className="bg-gradient-primary text-white text-sm">
                          {getInitials(submission.user_name || "UN")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{submission.user_name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {getPlatformIcon(submission.platform)}
                          <span className="capitalize">{submission.platform}</span>
                          <span>•</span>
                          <span>{new Date(submission.created_at).toLocaleDateString()}</span>
                        </div>
                        {submission.admin_notes && submission.status === "rejected" && (
                          <p className="text-xs text-destructive mt-1">
                            Reason: {submission.admin_notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(submission.status)}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(submission.video_url, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      {submission.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApprove(submission)}
                            disabled={actionLoading === submission.id}
                          >
                            {actionLoading === submission.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => openRejectDialog(submission)}
                            disabled={actionLoading === submission.id}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              Reject Submission
            </DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this submission. The user will see this message.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Avatar>
                <AvatarImage src={selectedSubmission?.user_avatar || undefined} />
                <AvatarFallback className="bg-gradient-primary text-white">
                  {selectedSubmission && getInitials(selectedSubmission.user_name || "UN")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{selectedSubmission?.user_name}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {selectedSubmission && getPlatformIcon(selectedSubmission.platform)}
                  <span className="capitalize">{selectedSubmission?.platform}</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reject-notes">Rejection Reason</Label>
              <Textarea
                id="reject-notes"
                placeholder="Video did not meet the 500 views requirement..."
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={actionLoading === selectedSubmission?.id}
            >
              {actionLoading === selectedSubmission?.id ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
