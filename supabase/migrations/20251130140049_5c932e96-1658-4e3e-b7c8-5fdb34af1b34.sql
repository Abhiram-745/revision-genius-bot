-- Add admin read policies for viewing all user data in Admin Hub

-- Allow admins to view all timetables
CREATE POLICY "Admins can view all timetables"
ON public.timetables
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Allow admins to view all events
CREATE POLICY "Admins can view all events"
ON public.events
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Allow admins to view all homeworks
CREATE POLICY "Admins can view all homeworks"
ON public.homeworks
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Allow admins to view all study sessions (already has public view, but adding explicit admin policy)
CREATE POLICY "Admins can view all study sessions"
ON public.study_sessions
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Allow admins to view all test scores
CREATE POLICY "Admins can view all test scores"
ON public.test_scores
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Allow admins to view all study streaks
CREATE POLICY "Admins can view all study streaks"
ON public.study_streaks
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Allow admins to view all user roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.is_admin(auth.uid()));