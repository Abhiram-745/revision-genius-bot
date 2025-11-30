import { Step } from "react-joyride";

export const timetableViewTourSteps: Step[] = [
  {
    target: "[data-tour='timetable-progress']",
    content: "Track your overall progress here! This shows how many study sessions you've completed across your entire timetable. Watch it grow as you mark sessions complete!",
    disableBeacon: true,
    placement: "bottom",
  },
  {
    target: "[data-tour='timetable-calendar']",
    content: "Select a specific date to filter your schedule. Days with study sessions are highlighted - tap any date to see just that day's tasks!",
    disableBeacon: true,
    placement: "left",
  },
  {
    target: "[data-tour='session-card']",
    content: "Each card represents a study session. Click on any session to add resources, notes, or view recommended materials for that specific topic!",
    disableBeacon: true,
    placement: "top",
  },
  {
    target: "[data-tour='session-start-btn']",
    content: "Start a focused study timer! It tracks your actual study time and helps you stay on track. The timer will run even if you leave this page.",
    disableBeacon: true,
    placement: "left",
  },
  {
    target: "[data-tour='session-checkbox']",
    content: "Mark sessions as complete when you're done. You'll be prompted to reflect on how the session went - this data helps improve future timetables!",
    disableBeacon: true,
    placement: "left",
  },
  {
    target: "[data-tour='daily-insights']",
    content: "Get AI-powered insights for each day! See personalized recommendations and regenerate tomorrow's schedule if your plans change.",
    disableBeacon: true,
    placement: "top",
  },
  {
    target: "[data-tour='topic-resources']",
    content: "Access all your resources organized by topic. Add notes, links, and study materials here to keep everything in one place!",
    disableBeacon: true,
    placement: "left",
  },
];
