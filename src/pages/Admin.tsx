import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Header from "@/components/Header";
import { Users, Crown, Ban, Search, Eye, Calendar, BookOpen, Clock, AlertTriangle, CheckCircle, XCircle, Loader2, ChevronRight, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import PageTransition from "@/components/PageTransition";
import { triggerConfetti, triggerEmoji } from "@/utils/celebrations";
import { motion, AnimatePresence } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface UserData {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "paid" | "free";
  is_banned: boolean;
  ban_reason: string | null;
  created_at: string;
}

interface UserStats {
  timetables: any[];
  events: any[];
  homeworks: any[];
  studySessions: any[];
  testScores: any[];
  totalStudyMinutes: number;
  completedSessions: number;
}

const ADMIN_EMAILS = [
  'abhiramkakarla1@gmail.com',
  'dhrishiv.panjabi@gmail.com'
];

const Admin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [selectedTimetable, setSelectedTimetable] = useState<any | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [selectedHomework, setSelectedHomework] = useState<any | null>(null);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [selectedScore, setSelectedScore] = useState<any | null>(null);

  // Dialog states
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [banTargetUser, setBanTargetUser] = useState<UserData | null>(null);
  
  const [premiumDialogOpen, setPremiumDialogOpen] = useState(false);
  const [premiumAction, setPremiumAction] = useState<"grant" | "revoke">("grant");
  const [premiumTargetUser, setPremiumTargetUser] = useState<UserData | null>(null);

  const [unbanDialogOpen, setUnbanDialogOpen] = useState(false);
  const [unbanTargetUser, setUnbanTargetUser] = useState<UserData | null>(null);

  useEffect(() => {
    checkAdminAndLoadUsers();
  }, []);

  const checkAdminAndLoadUsers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      if (!ADMIN_EMAILS.includes((user.email || '').toLowerCase())) {
        toast.error("You don't have access to this page");
        navigate("/dashboard");
        return;
      }

      setIsAdmin(true);
      await loadUsers();
    } catch (error) {
      console.error("Error:", error);
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const { data: emailData, error: emailError } = await supabase.functions.invoke('admin-get-users');
      
      if (emailError) {
        console.error("Error fetching users from edge function:", emailError);
        throw emailError;
      }

      const authUsers = emailData?.users || [];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, created_at");

      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id, role");

      const { data: bannedUsers } = await supabase
        .from("banned_users")
        .select("user_id, reason");

      const userList: UserData[] = authUsers.map((authUser: any) => {
        const profile = profiles?.find((p) => p.id === authUser.id);
        const role = roles?.find((r) => r.user_id === authUser.id);
        const banned = bannedUsers?.find((b) => b.user_id === authUser.id);
        
        return {
          id: authUser.id,
          email: authUser.email || "",
          full_name: profile?.full_name || null,
          avatar_url: profile?.avatar_url || null,
          role: (role?.role as "paid" | "free") || "free",
          is_banned: !!banned,
          ban_reason: banned?.reason || null,
          created_at: authUser.created_at || profile?.created_at || "",
        };
      });

      setUsers(userList);
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Failed to load users");
    }
  };

  const openBanDialog = (user: UserData) => {
    setBanTargetUser(user);
    setBanReason("");
    setBanDialogOpen(true);
  };

  const handleBanUser = async () => {
    if (!banTargetUser) return;
    
    setActionLoading(banTargetUser.id);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Store both user_id AND email to prevent ban bypass via new account creation
      const { error } = await supabase
        .from("banned_users")
        .insert({ 
          user_id: banTargetUser.id, 
          banned_by: user.id,
          reason: banReason.trim() || null,
          email: banTargetUser.email.toLowerCase() // Store email to prevent re-registration
        });

      if (error) throw error;

      triggerEmoji("🚫");
      toast.success(`${banTargetUser.full_name || banTargetUser.email} has been banned`, {
        description: banReason ? `Reason: ${banReason}` : undefined,
      });
      
      setBanDialogOpen(false);
      await loadUsers();
    } catch (error) {
      console.error("Error banning user:", error);
      toast.error("Failed to ban user");
    } finally {
      setActionLoading(null);
    }
  };

  const openUnbanDialog = (user: UserData) => {
    setUnbanTargetUser(user);
    setUnbanDialogOpen(true);
  };

  const handleUnbanUser = async () => {
    if (!unbanTargetUser) return;

    setActionLoading(unbanTargetUser.id);
    try {
      const { error } = await supabase
        .from("banned_users")
        .delete()
        .eq("user_id", unbanTargetUser.id);

      if (error) throw error;

      triggerConfetti("success");
      toast.success(`${unbanTargetUser.full_name || unbanTargetUser.email} has been unbanned`);
      
      setUnbanDialogOpen(false);
      await loadUsers();
    } catch (error) {
      console.error("Error unbanning user:", error);
      toast.error("Failed to unban user");
    } finally {
      setActionLoading(null);
    }
  };

  const openPremiumDialog = (user: UserData, action: "grant" | "revoke") => {
    setPremiumTargetUser(user);
    setPremiumAction(action);
    setPremiumDialogOpen(true);
  };

  const handlePremiumAction = async () => {
    if (!premiumTargetUser) return;

    setActionLoading(premiumTargetUser.id);
    try {
      if (premiumAction === "grant") {
        const { data: existingRole } = await supabase
          .from("user_roles")
          .select("id")
          .eq("user_id", premiumTargetUser.id)
          .maybeSingle();

        if (existingRole) {
          const { error } = await supabase
            .from("user_roles")
            .update({ role: "paid" })
            .eq("user_id", premiumTargetUser.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("user_roles")
            .insert({ user_id: premiumTargetUser.id, role: "paid" });
          if (error) throw error;
        }

        triggerConfetti("achievement");
        triggerEmoji("👑");
        toast.success(`Premium granted to ${premiumTargetUser.full_name || premiumTargetUser.email}!`, {
          description: "They now have access to all premium features",
        });
      } else {
        const { error } = await supabase
          .from("user_roles")
          .update({ role: "free" })
          .eq("user_id", premiumTargetUser.id);
        if (error) throw error;

        toast.success(`Premium revoked from ${premiumTargetUser.full_name || premiumTargetUser.email}`, {
          description: "They are now on the free plan",
        });
      }

      setPremiumDialogOpen(false);
      await loadUsers();
    } catch (error) {
      console.error("Error updating premium status:", error);
      toast.error(`Failed to ${premiumAction} premium`);
    } finally {
      setActionLoading(null);
    }
  };

  const resetSelectedItems = () => {
    setSelectedTimetable(null);
    setSelectedEvent(null);
    setSelectedHomework(null);
    setSelectedSession(null);
    setSelectedScore(null);
  };

  const handleViewUser = async (user: UserData) => {
    setSelectedUser(user);
    resetSelectedItems();
    setStatsLoading(true);
    
    try {
      const [timetablesRes, eventsRes, homeworksRes, sessionsRes, scoresRes] = await Promise.all([
        supabase.from("timetables").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("events").select("*").eq("user_id", user.id).order("start_time", { ascending: false }).limit(20),
        supabase.from("homeworks").select("*").eq("user_id", user.id).order("due_date", { ascending: true }),
        supabase.from("study_sessions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
        supabase.from("test_scores").select("*").eq("user_id", user.id).order("test_date", { ascending: false }),
      ]);

      const sessions = sessionsRes.data || [];
      const completedSessions = sessions.filter((s: any) => s.status === "completed");
      const totalStudyMinutes = completedSessions.reduce((acc: number, s: any) => acc + (s.actual_duration_minutes || 0), 0);

      setUserStats({
        timetables: timetablesRes.data || [],
        events: eventsRes.data || [],
        homeworks: homeworksRes.data || [],
        studySessions: sessions,
        testScores: scoresRes.data || [],
        totalStudyMinutes,
        completedSessions: completedSessions.length,
      });
    } catch (error) {
      console.error("Error loading user stats:", error);
      toast.error("Failed to load user stats");
    } finally {
      setStatsLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.full_name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower)
    );
  });

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-hero rounded-xl blur-md opacity-60"></div>
              <div className="relative bg-gradient-hero p-3 rounded-xl shadow-lg">
                <Crown className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold gradient-text">Admin Panel</h1>
              <p className="text-muted-foreground text-sm mt-1">Manage users and permissions</p>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{users.length}</p>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/10 rounded-lg">
                    <Crown className="h-8 w-8 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{users.filter((u) => u.role === "paid").length}</p>
                    <p className="text-sm text-muted-foreground">Premium Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{users.filter((u) => u.role === "free").length}</p>
                    <p className="text-sm text-muted-foreground">Free Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-destructive/10 rounded-lg">
                    <Ban className="h-8 w-8 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{users.filter((u) => u.is_banned).length}</p>
                    <p className="text-sm text-muted-foreground">Banned Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Users List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    All Users ({filteredUsers.length})
                  </CardTitle>
                  <CardDescription>View and manage user access levels</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <AnimatePresence>
                <div className="space-y-3">
                  {filteredUsers.map((user, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-all hover:shadow-md"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Avatar className="h-10 w-10 ring-2 ring-background">
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback className="bg-gradient-primary text-white text-sm">
                            {getInitials(user.full_name, user.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.full_name || "Unknown"}</p>
                          <p className="text-sm text-muted-foreground">{user.email || user.id}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {ADMIN_EMAILS.includes(user.email.toLowerCase()) ? (
                          <Badge className="bg-gradient-hero">Admin</Badge>
                        ) : (
                          <>
                            <Badge variant={user.role === "paid" ? "default" : "secondary"}>
                              {user.role === "paid" ? "Premium" : "Free"}
                            </Badge>
                            {user.is_banned && (
                              <Badge variant="destructive">Banned</Badge>
                            )}
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewUser(user)}
                              className="hover:bg-primary/10"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            {user.is_banned ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openUnbanDialog(user)}
                                disabled={actionLoading === user.id}
                                className="hover:bg-green-500/10 hover:text-green-600 hover:border-green-500/50"
                              >
                                {actionLoading === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Unban"}
                              </Button>
                            ) : (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => openBanDialog(user)}
                                disabled={actionLoading === user.id}
                              >
                                {actionLoading === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ban"}
                              </Button>
                            )}

                            {user.role === "paid" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openPremiumDialog(user, "revoke")}
                                disabled={actionLoading === user.id}
                                className="hover:bg-orange-500/10 hover:text-orange-600 hover:border-orange-500/50"
                              >
                                {actionLoading === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Revoke Premium"}
                              </Button>
                            ) : (
                              <Button
                                variant="default"
                                size="sm"
                                className="bg-gradient-hero hover:opacity-90"
                                onClick={() => openPremiumDialog(user, "grant")}
                                disabled={actionLoading === user.id}
                              >
                                {actionLoading === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Grant Premium"}
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Ban User Dialog */}
          <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Ban User
                </DialogTitle>
                <DialogDescription>
                  Are you sure you want to ban <span className="font-semibold">{banTargetUser?.full_name || banTargetUser?.email}</span>? 
                  They will not be able to access the app.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={banTargetUser?.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-primary text-white">
                      {banTargetUser && getInitials(banTargetUser.full_name, banTargetUser.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{banTargetUser?.full_name || "Unknown"}</p>
                    <p className="text-sm text-muted-foreground">{banTargetUser?.email}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ban-reason">Ban Reason (optional)</Label>
                  <Textarea
                    id="ban-reason"
                    placeholder="Enter a reason for the ban..."
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    This message will be shown to the user when they try to log in.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setBanDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleBanUser}
                  disabled={actionLoading === banTargetUser?.id}
                >
                  {actionLoading === banTargetUser?.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Banning...
                    </>
                  ) : (
                    <>
                      <Ban className="h-4 w-4 mr-2" />
                      Ban User
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Unban User Dialog */}
          <Dialog open={unbanDialogOpen} onOpenChange={setUnbanDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  Unban User
                </DialogTitle>
                <DialogDescription>
                  Are you sure you want to unban <span className="font-semibold">{unbanTargetUser?.full_name || unbanTargetUser?.email}</span>? 
                  They will be able to access the app again.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={unbanTargetUser?.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-primary text-white">
                      {unbanTargetUser && getInitials(unbanTargetUser.full_name, unbanTargetUser.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{unbanTargetUser?.full_name || "Unknown"}</p>
                    <p className="text-sm text-muted-foreground">{unbanTargetUser?.email}</p>
                    {unbanTargetUser?.ban_reason && (
                      <p className="text-sm text-destructive mt-1">
                        Previous ban reason: {unbanTargetUser.ban_reason}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setUnbanDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleUnbanUser}
                  disabled={actionLoading === unbanTargetUser?.id}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {actionLoading === unbanTargetUser?.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Unbanning...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Unban User
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Premium Action Dialog */}
          <Dialog open={premiumDialogOpen} onOpenChange={setPremiumDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {premiumAction === "grant" ? (
                    <>
                      <Crown className="h-5 w-5 text-yellow-500" />
                      <span className="text-yellow-600">Grant Premium</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-orange-500" />
                      <span className="text-orange-600">Revoke Premium</span>
                    </>
                  )}
                </DialogTitle>
                <DialogDescription>
                  {premiumAction === "grant" ? (
                    <>
                      Grant premium access to <span className="font-semibold">{premiumTargetUser?.full_name || premiumTargetUser?.email}</span>? 
                      They will get access to all premium features.
                    </>
                  ) : (
                    <>
                      Revoke premium access from <span className="font-semibold">{premiumTargetUser?.full_name || premiumTargetUser?.email}</span>? 
                      They will be moved to the free plan.
                    </>
                  )}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={premiumTargetUser?.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-primary text-white">
                      {premiumTargetUser && getInitials(premiumTargetUser.full_name, premiumTargetUser.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{premiumTargetUser?.full_name || "Unknown"}</p>
                    <p className="text-sm text-muted-foreground">{premiumTargetUser?.email}</p>
                    <Badge variant={premiumTargetUser?.role === "paid" ? "default" : "secondary"} className="mt-1">
                      Currently: {premiumTargetUser?.role === "paid" ? "Premium" : "Free"}
                    </Badge>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPremiumDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handlePremiumAction}
                  disabled={actionLoading === premiumTargetUser?.id}
                  className={premiumAction === "grant" ? "bg-gradient-hero hover:opacity-90" : "bg-orange-500 hover:bg-orange-600"}
                >
                  {actionLoading === premiumTargetUser?.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      {premiumAction === "grant" ? "Granting..." : "Revoking..."}
                    </>
                  ) : (
                    <>
                      <Crown className="h-4 w-4 mr-2" />
                      {premiumAction === "grant" ? "Grant Premium" : "Revoke Premium"}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* User Details Dialog */}
          <Dialog open={!!selectedUser} onOpenChange={(open) => { if (!open) { setSelectedUser(null); resetSelectedItems(); } }}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
              <DialogHeader className="flex flex-row items-center justify-between">
                <DialogTitle className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedUser?.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-primary text-white">
                      {selectedUser && getInitials(selectedUser.full_name, selectedUser.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p>{selectedUser?.full_name || "Unknown"}</p>
                    <p className="text-sm font-normal text-muted-foreground">{selectedUser?.email}</p>
                  </div>
                </DialogTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => selectedUser && handleViewUser(selectedUser)}
                  disabled={statsLoading}
                  className="gap-2"
                >
                  {statsLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh Stats
                    </>
                  )}
                </Button>
              </DialogHeader>

              {statsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-pulse text-muted-foreground">Loading user data...</div>
                </div>
              ) : userStats ? (
                <>
                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="p-3 bg-primary/10 rounded-lg text-center">
                      <p className="text-2xl font-bold">{Math.round(userStats.totalStudyMinutes / 60)}h</p>
                      <p className="text-xs text-muted-foreground">Total Study Time</p>
                    </div>
                    <div className="p-3 bg-green-500/10 rounded-lg text-center">
                      <p className="text-2xl font-bold">{userStats.completedSessions}</p>
                      <p className="text-xs text-muted-foreground">Sessions Completed</p>
                    </div>
                    <div className="p-3 bg-yellow-500/10 rounded-lg text-center">
                      <p className="text-2xl font-bold">{userStats.timetables.length}</p>
                      <p className="text-xs text-muted-foreground">Timetables Created</p>
                    </div>
                  </div>

                  <Tabs defaultValue="timetables" className="w-full">
                    <TabsList className="grid grid-cols-5 w-full">
                      <TabsTrigger value="timetables">
                        <BookOpen className="h-4 w-4 mr-1" />
                        Timetables ({userStats.timetables.length})
                      </TabsTrigger>
                      <TabsTrigger value="events">
                        <Calendar className="h-4 w-4 mr-1" />
                        Events ({userStats.events.length})
                      </TabsTrigger>
                      <TabsTrigger value="homework">
                        Homework ({userStats.homeworks.length})
                      </TabsTrigger>
                      <TabsTrigger value="sessions">
                        <Clock className="h-4 w-4 mr-1" />
                        Sessions ({userStats.studySessions.length})
                      </TabsTrigger>
                      <TabsTrigger value="scores">
                        Test Scores ({userStats.testScores.length})
                      </TabsTrigger>
                    </TabsList>

                    <ScrollArea className="h-[350px] mt-4">
                      <TabsContent value="timetables" className="space-y-2 mt-0">
                        {selectedTimetable ? (
                          <div className="space-y-4">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedTimetable(null)} className="gap-2">
                              <ArrowLeft className="h-4 w-4" />
                              Back to list
                            </Button>
                            <div className="p-4 border rounded-lg bg-muted/30">
                              <h3 className="font-semibold text-lg mb-2">{selectedTimetable.name}</h3>
                              <p className="text-sm text-muted-foreground mb-4">
                                {selectedTimetable.start_date} to {selectedTimetable.end_date}
                              </p>
                              
                              {selectedTimetable.subjects && (
                                <div className="mb-4">
                                  <Label className="text-sm font-medium">Subjects:</Label>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {(selectedTimetable.subjects as any[]).map((s: any, i: number) => (
                                      <Badge key={i} variant="outline">{s.name}</Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {selectedTimetable.schedule && (
                                <div>
                                  <Label className="text-sm font-medium mb-2 block">Schedule:</Label>
                                  <Accordion type="multiple" className="w-full">
                                    {Object.entries(selectedTimetable.schedule as Record<string, any[]>).map(([date, sessions]) => (
                                      <AccordionItem key={date} value={date}>
                                        <AccordionTrigger className="text-sm">
                                          {new Date(date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}
                                          <Badge variant="secondary" className="ml-2">{(sessions as any[]).length} sessions</Badge>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                          <div className="space-y-2 pl-2">
                                            {(sessions as any[]).map((session: any, idx: number) => (
                                              <div key={idx} className="p-2 bg-background border rounded text-sm">
                                                <div className="flex justify-between items-start">
                                                  <div>
                                                    <p className="font-medium">{session.subject}</p>
                                                    <p className="text-xs text-muted-foreground">{session.topic || 'General study'}</p>
                                                  </div>
                                                  <div className="text-right text-xs text-muted-foreground">
                                                    <p>{session.startTime} - {session.endTime}</p>
                                                    <Badge variant="outline" className="mt-1">{session.type || 'study'}</Badge>
                                                  </div>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </AccordionContent>
                                      </AccordionItem>
                                    ))}
                                  </Accordion>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : userStats?.timetables.length === 0 ? (
                          <p className="text-muted-foreground text-center py-8">No timetables</p>
                        ) : (
                          userStats?.timetables.map((tt: any) => (
                            <div 
                              key={tt.id} 
                              className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer flex items-center justify-between group"
                              onClick={() => setSelectedTimetable(tt)}
                            >
                              <div>
                                <p className="font-medium">{tt.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {tt.start_date} to {tt.end_date}
                                </p>
                                {tt.subjects && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {(tt.subjects as any[]).length} subjects • {tt.schedule ? Object.keys(tt.schedule).length : 0} days scheduled
                                  </p>
                                )}
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          ))
                        )}
                      </TabsContent>

                      <TabsContent value="events" className="space-y-2 mt-0">
                        {selectedEvent ? (
                          <div className="space-y-4">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedEvent(null)} className="gap-2">
                              <ArrowLeft className="h-4 w-4" />
                              Back to list
                            </Button>
                            <div className="p-4 border rounded-lg bg-muted/30">
                              <h3 className="font-semibold text-lg mb-2">{selectedEvent.title}</h3>
                              <div className="space-y-2 text-sm">
                                <p><span className="text-muted-foreground">Start:</span> {new Date(selectedEvent.start_time).toLocaleString()}</p>
                                <p><span className="text-muted-foreground">End:</span> {new Date(selectedEvent.end_time).toLocaleString()}</p>
                                {selectedEvent.description && (
                                  <p><span className="text-muted-foreground">Description:</span> {selectedEvent.description}</p>
                                )}
                                {selectedEvent.is_recurring && (
                                  <Badge variant="outline">Recurring: {selectedEvent.recurrence_rule}</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : userStats?.events.length === 0 ? (
                          <p className="text-muted-foreground text-center py-8">No events</p>
                        ) : (
                          userStats?.events.map((evt: any) => (
                            <div 
                              key={evt.id} 
                              className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer flex items-center justify-between group"
                              onClick={() => setSelectedEvent(evt)}
                            >
                              <div>
                                <p className="font-medium">{evt.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(evt.start_time).toLocaleString()}
                                </p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          ))
                        )}
                      </TabsContent>

                      <TabsContent value="homework" className="space-y-2 mt-0">
                        {selectedHomework ? (
                          <div className="space-y-4">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedHomework(null)} className="gap-2">
                              <ArrowLeft className="h-4 w-4" />
                              Back to list
                            </Button>
                            <div className="p-4 border rounded-lg bg-muted/30">
                              <h3 className="font-semibold text-lg mb-2">{selectedHomework.title}</h3>
                              <div className="space-y-2 text-sm">
                                <p><span className="text-muted-foreground">Subject:</span> {selectedHomework.subject}</p>
                                <p><span className="text-muted-foreground">Due:</span> {selectedHomework.due_date}</p>
                                {selectedHomework.duration && (
                                  <p><span className="text-muted-foreground">Duration:</span> {selectedHomework.duration} mins</p>
                                )}
                                {selectedHomework.description && (
                                  <p><span className="text-muted-foreground">Description:</span> {selectedHomework.description}</p>
                                )}
                                <Badge variant={selectedHomework.completed ? "default" : "secondary"}>
                                  {selectedHomework.completed ? "Completed" : "Pending"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ) : userStats?.homeworks.length === 0 ? (
                          <p className="text-muted-foreground text-center py-8">No homework</p>
                        ) : (
                          userStats?.homeworks.map((hw: any) => (
                            <div 
                              key={hw.id} 
                              className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer flex items-center justify-between group"
                              onClick={() => setSelectedHomework(hw)}
                            >
                              <div>
                                <p className="font-medium">{hw.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {hw.subject} - Due: {hw.due_date}
                                </p>
                                <Badge variant={hw.completed ? "default" : "secondary"}>
                                  {hw.completed ? "Completed" : "Pending"}
                                </Badge>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          ))
                        )}
                      </TabsContent>

                      <TabsContent value="sessions" className="space-y-2 mt-0">
                        {selectedSession ? (
                          <div className="space-y-4">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedSession(null)} className="gap-2">
                              <ArrowLeft className="h-4 w-4" />
                              Back to list
                            </Button>
                            <div className="p-4 border rounded-lg bg-muted/30">
                              <h3 className="font-semibold text-lg mb-2">{selectedSession.subject}</h3>
                              <div className="space-y-2 text-sm">
                                <p><span className="text-muted-foreground">Topic:</span> {selectedSession.topic || 'N/A'}</p>
                                <p><span className="text-muted-foreground">Type:</span> {selectedSession.session_type}</p>
                                <p><span className="text-muted-foreground">Planned:</span> {new Date(selectedSession.planned_start).toLocaleString()}</p>
                                <p><span className="text-muted-foreground">Duration:</span> {selectedSession.planned_duration_minutes} mins planned</p>
                                {selectedSession.actual_duration_minutes && (
                                  <p><span className="text-muted-foreground">Actual:</span> {selectedSession.actual_duration_minutes} mins</p>
                                )}
                                {selectedSession.focus_score && (
                                  <p><span className="text-muted-foreground">Focus Score:</span> {selectedSession.focus_score}/10</p>
                                )}
                                {selectedSession.notes && (
                                  <p><span className="text-muted-foreground">Notes:</span> {selectedSession.notes}</p>
                                )}
                                <Badge variant={selectedSession.status === "completed" ? "default" : "secondary"}>
                                  {selectedSession.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ) : userStats?.studySessions.length === 0 ? (
                          <p className="text-muted-foreground text-center py-8">No study sessions</p>
                        ) : (
                          userStats?.studySessions.map((session: any) => (
                            <div 
                              key={session.id} 
                              className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer flex items-center justify-between group"
                              onClick={() => setSelectedSession(session)}
                            >
                              <div>
                                <p className="font-medium">{session.subject}</p>
                                <p className="text-sm text-muted-foreground">
                                  {session.topic} - {session.planned_duration_minutes} mins
                                </p>
                                <Badge variant={session.status === "completed" ? "default" : "secondary"}>
                                  {session.status}
                                </Badge>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          ))
                        )}
                      </TabsContent>

                      <TabsContent value="scores" className="space-y-2 mt-0">
                        {selectedScore ? (
                          <div className="space-y-4">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedScore(null)} className="gap-2">
                              <ArrowLeft className="h-4 w-4" />
                              Back to list
                            </Button>
                            <div className="p-4 border rounded-lg bg-muted/30">
                              <h3 className="font-semibold text-lg mb-2">{selectedScore.subject} - {selectedScore.test_type}</h3>
                              <div className="space-y-2 text-sm">
                                <p><span className="text-muted-foreground">Date:</span> {selectedScore.test_date}</p>
                                <p><span className="text-muted-foreground">Score:</span> {selectedScore.marks_obtained}/{selectedScore.total_marks} ({selectedScore.percentage}%)</p>
                                
                                {selectedScore.strengths?.length > 0 && (
                                  <div>
                                    <span className="text-muted-foreground">Strengths:</span>
                                    <ul className="list-disc list-inside ml-2">
                                      {selectedScore.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                                    </ul>
                                  </div>
                                )}
                                
                                {selectedScore.weaknesses?.length > 0 && (
                                  <div>
                                    <span className="text-muted-foreground">Weaknesses:</span>
                                    <ul className="list-disc list-inside ml-2">
                                      {selectedScore.weaknesses.map((w: string, i: number) => <li key={i}>{w}</li>)}
                                    </ul>
                                  </div>
                                )}
                                
                                {selectedScore.recommendations?.length > 0 && (
                                  <div>
                                    <span className="text-muted-foreground">Recommendations:</span>
                                    <ul className="list-disc list-inside ml-2">
                                      {selectedScore.recommendations.map((r: string, i: number) => <li key={i}>{r}</li>)}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : userStats?.testScores.length === 0 ? (
                          <p className="text-muted-foreground text-center py-8">No test scores</p>
                        ) : (
                          userStats?.testScores.map((score: any) => (
                            <div 
                              key={score.id} 
                              className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer flex items-center justify-between group"
                              onClick={() => setSelectedScore(score)}
                            >
                              <div>
                                <p className="font-medium">{score.subject} - {score.test_type}</p>
                                <p className="text-sm text-muted-foreground">
                                  Score: {score.marks_obtained}/{score.total_marks} ({score.percentage}%)
                                </p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          ))
                        )}
                      </TabsContent>
                    </ScrollArea>
                  </Tabs>
                </>
              ) : null}
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </PageTransition>
  );
};

export default Admin;
