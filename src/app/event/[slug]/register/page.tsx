
"use client";
import { XCircle } from "lucide-react";
import { useRegister } from "./useRegister";
import { useActivityLog } from "@/hooks/useActivityLog";
import StepIndicator from "./StepIndicator";
import Step1Details from "./steps/Step1Details";
import Step3Food from "./steps/Step3Food";
import Step4Review from "./steps/Step4Review";
import StickyLogo from "@/components/register/StickyLogo";
import OutlineTitle from "@/components/register/OutlineTitle";
import NavigationButtons from "@/components/register/NavigationButtons";
import LoadingScreen from "@/components/register/LoadingScreen";
import dynamic from "next/dynamic";
import Link from "next/link";

const BackButton = dynamic(() => import("@/components/ui/BackButton").then(mod => mod.BackButton), { ssr: false });

export default function RegisterPage() {
  const r = useRegister();

  useActivityLog(
    "VIEW_EVENT", 
    "Event", 
    `Consumer viewed registration page for ${r.settings?.tenureName || 'an event'}`,
    { slug: r.settings?.slug }
  );

  if (r.loadingData) return <LoadingScreen />;

  // Block registration if event is CLOSED
  if (r.settings?.status === "CLOSED") {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border border-border rounded-[2.5rem] p-10 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-3xl -mr-16 -mt-16 rounded-full" />
          
          <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-4 animate-bounce">
            <XCircle size={40} />
          </div>
          
          <h1 className="text-3xl font-black uppercase tracking-tighter leading-tight">
            Registration <span className="text-red-500">Closed</span>
          </h1>
          
          <p className="text-muted-foreground text-sm leading-relaxed">
            We are sorry, but <span className="font-bold text-foreground">{r.settings?.tenureName}</span> is no longer accepting new registrations. 
            The deadline has passed or the event has reached its maximum capacity.
          </p>

          <div className="pt-4">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-muted hover:bg-accent rounded-2xl text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
            >
              Return Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const eventName = r.settings?.tenureName ?? "Vestry Event";

  return (
    <main className="min-h-screen bg-background text-foreground px-4 py-10 transition-colors duration-300 relative">
      <div className="fixed top-6 left-6 z-50 sm:absolute sm:top-8 sm:left-8">
        <BackButton minimal />
      </div>

      <StickyLogo logoUrl={r.settings?.logoUrl} />

      <div className="max-w-xl mx-auto relative">

        {/* Header */}
        <div className="text-center mb-2 flex flex-col items-center" data-tour="welcome">
          <div className="w-full mb-2">
            <OutlineTitle text={eventName.toUpperCase()} />
          </div>
          <p className="text-muted-foreground text-sm -mt-1">Register your spot</p>
        </div>

        <StepIndicator current={r.step} ticketType={r.ticketType} />

        {r.step === 1 && (
          <Step1Details
            name={r.name}
            setName={r.setName}
            email={r.email}
            setEmail={r.setEmail}
            ticketType={r.ticketType}
            setTicketType={r.setTicketType}
            partnerName={r.partnerName}
            setPartnerName={r.setPartnerName}
            ticketPrice={r.ticketPrice}
            ticketTypes={r.settings?.ticketTypes || []}
          />
        )}

        {r.step === 3 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
             <Step3Food
                foods={r.foods}
                drinks={r.drinks}
                selectedFoodIds={r.selectedFoodIds}
                onFoodToggle={r.handleFoodToggle}
                selectedDrinkIds={r.selectedDrinkIds}
                onDrinkToggle={r.handleDrinkToggle}
                maxFood={r.settings?.maxFood ?? 2}
                maxDrink={r.settings?.maxDrink ?? 1}
              />
        </div>
        )}

        {r.step === 4 && (
          <Step4Review
            name={r.name}
            email={r.email}
            ticketType={r.ticketType}
            ticketPrice={r.ticketPrice}
            partnerName={r.partnerName}
            foods={r.foods}
            selectedFoodIds={r.selectedFoodIds}
            drinks={r.drinks}
            selectedDrinkIds={r.selectedDrinkIds}
            grandTotal={r.grandTotal}
          />
        )}

        <NavigationButtons
          step={r.step}
          canProceed={r.canProceed}
          onBack={r.handleBack}
          onNext={r.handleNext}
          onSubmit={r.handleSubmit}
        />
      </div>
    </main>
  );
}
