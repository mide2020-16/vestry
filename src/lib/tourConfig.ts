export interface TourStep {
  id: string;
  target: string; // CSS selector or data-tour ID
  title: string;
  content: string;
  position?: "top" | "bottom" | "left" | "right";
  path?: string; // Only show on this path
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    target: '[data-tour="welcome"]',
    title: "Welcome to Vestry!",
    content: "We're excited to have you. This quick guide will help you navigate the registration process with ease.",
    position: "bottom",
    path: "/register",
  },
  {
    id: "ticket-type",
    target: '[data-tour="ticket-type"]',
    title: "Choose Your Experience",
    content: "Select 'Single' for yourself or 'Couple' to register for two people at once. We'll need your partner's name too!",
    position: "bottom",
    path: "/register",
  },
  {
    id: "mesh-lab",
    target: '[data-tour="merch-customization"]',
    title: "The Merch Lab",
    content: "Pick your favorite color and the perfect size. Our premium mesh shirts are designed for comfort and style.",
    position: "top",
    path: "/register", // Note: This will be active when Step2Mesh is visible
  },
  {
    id: "inscriptions",
    target: '[data-tour="inscriptions"]',
    title: "Make it Yours",
    content: "Add a custom inscription to your merch. This will be beautifully embroidered on your shirt.",
    position: "top",
    path: "/register",
  },
  {
    id: "payment-methods",
    target: '[data-tour="payment-selection"]',
    title: "Secure Payment",
    content: "Choose between Paystack for instant online payment or Bank Transfer for manual processing.",
    position: "top",
    path: "/checkout",
  },
  {
    id: "receipt-upload",
    target: '[data-tour="receipt-uploader"]',
    title: "Confirm Your Transfer",
    content: "If you choose Bank Transfer, simply upload your receipt here. Our admins will verify and confirm your ticket within minutes.",
    position: "top",
    path: "/checkout",
  },
];
