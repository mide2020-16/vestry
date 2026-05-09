export interface TourStep {
  id: string;
  target: string;
  title: string;
  content: string;
  position?: "top" | "bottom" | "left" | "right";
  page?: "register" | "checkout" | "admin-dashboard" | "admin-events" | "admin-users" | "admin-settings";
}

export const TOUR_STEPS: TourStep[] = [
  // Registration Flow
  {
    id: "welcome",
    target: '[data-tour="welcome"]',
    title: "Welcome to Vestry!",
    content: "We're excited to have you. This quick guide will help you navigate the registration process with ease.",
    position: "bottom",
    page: "register",
  },
  {
    id: "ticket-type",
    target: '[data-tour="ticket-type"]',
    title: "Dynamic Ticketing",
    content: "Select from a variety of ticket types curated by the event organizer. Each card shows the benefits and pricing for that tier.",
    position: "bottom",
    page: "register",
  },
  {
    id: "payment-methods",
    target: '[data-tour="payment-selection"]',
    title: "Secure Payment",
    content: "Choose between Paystack for instant online payment or Bank Transfer for manual processing. All data is securely handled.",
    position: "top",
    page: "checkout",
  },

  // Admin Flow
  {
    id: "admin-welcome",
    target: "h2",
    title: "Admin Dashboard",
    content: "Welcome to your command center. Here you can see real-time statistics for your events.",
    position: "bottom",
    page: "admin-dashboard",
  },
  {
    id: "event-switcher",
    target: '[data-tour="event-switcher"]',
    title: "Switch Events",
    content: "Use this menu to quickly switch between different events you manage.",
    position: "bottom",
    page: "admin-dashboard",
  },
  {
    id: "manage-events",
    target: '[data-tour="nav-events"]',
    title: "Event Management",
    content: "Super Admins can create and manage all event instances from here.",
    position: "right",
    page: "admin-dashboard",
  },
  {
    id: "manage-users",
    target: '[data-tour="nav-users"]',
    title: "Admin Management",
    content: "Manage your team of administrators and assign them to specific events.",
    position: "right",
    page: "admin-dashboard",
  },
  {
    id: "event-settings",
    target: '[data-tour="nav-settings"]',
    title: "Event Configuration",
    content: "Configure pricing, SMTP, and payment gateways specifically for the active event.",
    position: "right",
    page: "admin-dashboard",
  },
  {
    id: "ticket-inventory",
    target: '[data-tour="ticket-inventory"]',
    title: "Ticket Inventory Manager",
    content: "This is the heart of your event's revenue. Add, edit, or remove ticket types dynamically. Changes reflect instantly on the registration page.",
    position: "top",
    page: "admin-settings",
  },
];
