import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Users, Plus, Search, Lock, Globe, Trophy, TrendingUp, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Header from "@/components/Header";
import { CreateGroupModal } from "@/components/groups/CreateGroupModal";
import { JoinGroupModal } from "@/components/groups/JoinGroupModal";
import { GroupInvitations } from "@/components/groups/GroupInvitations";
import { CheckAchievementsButton } from "@/components/groups/CheckAchievementsButton";
import FriendsList from "@/components/social/FriendsList";
import AddFriend from "@/components/social/AddFriend";
import Leaderboard from "@/components/social/Leaderboard";
import { GroupLeaderboard } from "@/components/social/GroupLeaderboard";
import SocialStats from "@/components/social/SocialStats";
import StudyOverview from "@/components/social/StudyOverview";
import PageTransition from "@/components/PageTransition";
import { BarChart3 } from "lucide-react";

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  subject: string;
  is_private: boolean;
  member_count: number;
  avatar_url: string;
}

const Connect = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [myGroups, setMyGroups] = useState<StudyGroup[]>([]);
  const [allGroups, setAllGroups] = useState<StudyGroup[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeMainTab, setActiveMainTab] = useState("social");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setUserId(session.user.id);
        loadGroups(session.user.id);
      } else {
        navigate("/auth");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setUserId(session.user.id);
        loadGroups(session.user.id);
      } else {
        setUser(null);
        setUserId("");
        setMyGroups([]);
        setAllGroups([]);
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadGroups = async (userId: string) => {
    try {
      setLoading(true);

      const { data: memberData } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', userId);

      if (memberData) {
        const groupIds = memberData.map(m => m.group_id);
        
        if (groupIds.length > 0) {
          const { data: groupsData } = await supabase
            .from('study_groups')
            .select('*')
            .in('id', groupIds);

          if (groupsData) {
            const groupsWithCounts = await Promise.all(
              groupsData.map(async (group) => {
                const { count } = await supabase
                  .from('group_members')
                  .select('*', { count: 'exact', head: true })
                  .eq('group_id', group.id);

                return {
                  ...group,
                  member_count: count || 0
                };
              })
            );
            setMyGroups(groupsWithCounts);
          } else {
            setMyGroups([]);
          }
        } else {
          setMyGroups([]);
        }
      }

      const { data: publicGroups } = await supabase
        .from('study_groups')
        .select('*')
        .eq('is_private', false);

      if (publicGroups) {
        const groupsWithCounts = await Promise.all(
          publicGroups.map(async (group) => {
            const { count } = await supabase
              .from('group_members')
              .select('*', { count: 'exact', head: true })
              .eq('group_id', group.id);

            return {
              ...group,
              member_count: count || 0
            };
          })
        );
        setAllGroups(groupsWithCounts);
      } else {
        setAllGroups([]);
      }
    } catch (error) {
      console.error('Error loading groups:', error);
      toast.error('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const filteredGroups = allGroups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.subject?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Floating background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none hidden md:block">
          <div className="floating-blob top-20 -left-32 w-64 md:w-96 h-64 md:h-96 bg-primary/10 animate-float"></div>
          <div className="floating-blob top-40 right-10 w-72 md:w-[500px] h-72 md:h-[500px] bg-secondary/15 animate-float-delayed"></div>
          <div className="floating-blob bottom-20 left-1/3 w-48 md:w-80 h-48 md:h-80 bg-accent/10 animate-float-slow"></div>
        </div>

        <Header />

        <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-8 relative z-10">
          <div className="space-y-6 animate-fade-in">
            {/* Header Section */}
            <div className="space-y-1 md:space-y-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold gradient-text">
                Connect
              </h1>
              <p className="text-muted-foreground text-sm md:text-lg font-medium">
                Friends, groups, and leaderboards - all in one place
              </p>
            </div>

            {/* Main Tabs - Social vs Groups */}
            <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full">
              <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-2 gap-2 glass-card p-1 rounded-xl">
                <TabsTrigger 
                  value="social" 
                  className="gap-2 data-[state=active]:bg-gradient-primary data-[state=active]:text-white rounded-lg"
                >
                  <UserPlus className="h-4 w-4" />
                  Social
                </TabsTrigger>
                <TabsTrigger 
                  value="groups" 
                  className="gap-2 data-[state=active]:bg-gradient-primary data-[state=active]:text-white rounded-lg"
                >
                  <Users className="h-4 w-4" />
                  Groups
                </TabsTrigger>
              </TabsList>

              {/* Social Tab Content */}
              <TabsContent value="social" className="mt-6">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-4 gap-2 glass-card p-1 rounded-xl">
                    <TabsTrigger value="overview" className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg">
                      <BarChart3 className="h-4 w-4" />
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="friends" className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg">
                      <Users className="h-4 w-4" />
                      Friends
                    </TabsTrigger>
                    <TabsTrigger value="leaderboard" className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg">
                      <Trophy className="h-4 w-4" />
                      Leaderboard
                    </TabsTrigger>
                    <TabsTrigger value="stats" className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg">
                      <TrendingUp className="h-4 w-4" />
                      Stats
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-6">
                    <StudyOverview userId={userId} />
                  </TabsContent>

                  <TabsContent value="friends" className="space-y-6 mt-6">
                    <GroupInvitations />
                    <AddFriend userId={userId} />
                    <FriendsList userId={userId} />
                  </TabsContent>

                  <TabsContent value="leaderboard" className="space-y-6 mt-6">
                    <Leaderboard userId={userId} />
                    <GroupLeaderboard />
                  </TabsContent>

                  <TabsContent value="stats" className="mt-6">
                    <SocialStats userId={userId} />
                  </TabsContent>
                </Tabs>
              </TabsContent>

              {/* Groups Tab Content */}
              <TabsContent value="groups" className="mt-6 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-display font-bold text-foreground">Study Groups</h2>
                    <p className="text-muted-foreground text-sm">Collaborate and learn together</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <CheckAchievementsButton />
                    <Button 
                      onClick={() => setShowJoinModal(true)} 
                      variant="outline" 
                      size="sm"
                      className="gap-2 hover-lift text-xs sm:text-sm"
                    >
                      <Search className="w-3 h-3 sm:w-4 sm:h-4" /> <span className="hidden xs:inline">Join with</span> Code
                    </Button>
                    <Button 
                      onClick={() => setShowCreateModal(true)} 
                      size="sm"
                      className="gap-2 text-xs sm:text-sm"
                    >
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4" /> Create
                    </Button>
                  </div>
                </div>

                <Tabs defaultValue="my-groups" className="space-y-6">
                  <TabsList className="glass-card p-1 rounded-xl">
                    <TabsTrigger 
                      value="my-groups" 
                      className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg"
                    >
                      My Groups
                    </TabsTrigger>
                    <TabsTrigger 
                      value="discover" 
                      className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg"
                    >
                      Discover
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="my-groups" className="space-y-4">
                    {myGroups.length === 0 ? (
                      <Card className="p-12 text-center hover-lift">
                        <Users className="w-16 h-16 mx-auto text-primary mb-4" />
                        <h3 className="text-xl font-display font-bold gradient-text mb-2">No groups yet</h3>
                        <p className="text-muted-foreground mb-4">
                          Create or join a group to start collaborating
                        </p>
                        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
                          <Plus className="w-4 h-4" /> Create Your First Group
                        </Button>
                      </Card>
                    ) : (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {myGroups.map(group => (
                          <Card
                            key={group.id}
                            className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={() => navigate(`/groups/${group.id}`)}
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="p-3 bg-primary/10 rounded-lg">
                                {group.is_private ? (
                                  <Lock className="w-6 h-6 text-primary" />
                                ) : (
                                  <Globe className="w-6 h-6 text-primary" />
                                )}
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {group.member_count} members
                              </span>
                            </div>
                            
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                              {group.name}
                            </h3>
                            
                            {group.subject && (
                              <span className="inline-block px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded mb-2">
                                {group.subject}
                              </span>
                            )}
                            
                            {group.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {group.description}
                              </p>
                            )}
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="discover" className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search groups by name, subject, or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredGroups.map(group => (
                        <Card
                          key={group.id}
                          className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                          onClick={() => navigate(`/groups/${group.id}`)}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-primary/10 rounded-lg">
                              <Globe className="w-6 h-6 text-primary" />
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {group.member_count} members
                            </span>
                          </div>
                          
                          <h3 className="text-lg font-semibold text-foreground mb-2">
                            {group.name}
                          </h3>
                          
                          {group.subject && (
                            <span className="inline-block px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded mb-2">
                              {group.subject}
                            </span>
                          )}
                          
                          {group.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {group.description}
                            </p>
                          )}
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </TabsContent>
            </Tabs>
          </div>
        </main>

        <CreateGroupModal 
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          onSuccess={() => user && loadGroups(user.id)}
        />
        
        <JoinGroupModal
          open={showJoinModal}
          onOpenChange={setShowJoinModal}
          onSuccess={() => user && loadGroups(user.id)}
        />
      </div>
    </PageTransition>
  );
};

export default Connect;
