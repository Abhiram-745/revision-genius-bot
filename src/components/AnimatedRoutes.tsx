import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Landing from "@/pages/Landing";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Timetables from "@/pages/Timetables";
import TimetableView from "@/pages/TimetableView";
import Connect from "@/pages/Connect";
import GroupDetail from "@/components/groups/GroupDetail";
import ImportTimetable from "@/pages/ImportTimetable";
import Agenda from "@/pages/Agenda";
import Insights from "@/pages/Insights";
import BlurtAI from "@/pages/BlurtAI";
import Activity from "@/pages/Activity";
import Reflections from "@/pages/Reflections";
import NotFound from "@/pages/NotFound";
import ImportAccount from "@/pages/ImportAccount";
import Admin from "@/pages/Admin";
import SaveMyExams from "@/pages/SaveMyExams";
import Practice from "@/pages/Practice";
import PMT from "@/pages/PMT";
import Quizlet from "@/pages/Quizlet";

export const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/timetables" element={<Timetables />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/connect" element={<Connect />} />
        <Route path="/groups/:id" element={<GroupDetail />} />
        <Route path="/import-timetable" element={<ImportTimetable />} />
        <Route path="/agenda" element={<Agenda />} />
        <Route path="/insights" element={<Insights />} />
        {/* Legacy routes - redirect to new pages */}
        <Route path="/calendar" element={<Agenda />} />
        <Route path="/test-scores" element={<Insights />} />
        <Route path="/ai-insights" element={<Insights />} />
        <Route path="/social" element={<Connect />} />
        <Route path="/groups" element={<Connect />} />
        <Route path="/blurt-ai" element={<BlurtAI />} />
        <Route path="/savemyexams" element={<SaveMyExams />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/pmt" element={<PMT />} />
        <Route path="/quizlet" element={<Quizlet />} />
        <Route path="/reflections" element={<Reflections />} />
        <Route path="/timetable/:id" element={<TimetableView />} />
        <Route path="/import-account" element={<ImportAccount />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
