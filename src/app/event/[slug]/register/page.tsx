"use client";
import { XCircle } from "lucide-react";
import { useRegister } from "./useRegister";
import { useActivityLog } from "@/hooks/useActivityLog";
import StepIndicator from "./StepIndicator";
import Step1Details from "./steps/Step1Details";
import Step2Mesh from "./steps/Step2Mesh";
import Step3Food from "./steps/Step3Food";
import Step4Review from "./steps/Step4Review";
import StickyLogo from "@/components/register/StickyLogo";
import OutlineTitle from "@/components/register/OutlineTitle";
import NavigationButtons from "@/components/register/NavigationButtons";
import LoadingScreen from "@/components/register/LoadingScreen";
import dynamic from "next/dynamic";

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
            <a 
              href="/" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-muted hover:bg-accent rounded-2xl text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
            >
              Return Home
            </a>
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
            singlePrice={r.settings?.singlePrice}
            couplePrice={r.settings?.couplePrice}
          />
        )}

        {r.step === 2 && (
          <Step2Mesh
            meshes={r.meshes}
            selectedMerch={r.selectedMerch}
            setSelectedMerch={r.setSelectedMerch}
            meshColors={r.meshColors}
            meshSizes={r.meshSizes}
            ticketType={r.ticketType}
            meshPrice={r.meshPrice}
          />
        )}

        {r.step === 3 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Hospitality</h2>
            <p className="text-muted-foreground">Select your complimentary food and drinks</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Food Section */}
            {r.hasFood && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="font-bold flex items-center gap-2">
                    <UtensilsCrossed size={18} className="text-amber-500" />
                    Food Menu
                  </h3>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-500/60 bg-amber-500/10 px-2 py-1 rounded-full">
                    Pick up to {r.settings?.maxFood ?? 2}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {r.foods.map((food: any) => (
                    <button
                      key={food._id}
                      onClick={() => r.handleFoodToggle(food._id)}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left group relative overflow-hidden ${
                        r.selectedFoodIds.includes(food._id)
                          ? "bg-amber-500 border-amber-500 text-black"
                          : "bg-card border-border hover:border-amber-500/50"
                      }`}
                    >
                      <div className="flex items-center gap-3 relative z-10">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                          r.selectedFoodIds.includes(food._id) ? "bg-black/10" : "bg-muted"
                        }`}>
                          <UtensilsCrossed size={20} />
                        </div>
                        <div>
                          <p className="font-bold">{food.name}</p>
                          <p className={`text-xs ${r.selectedFoodIds.includes(food._id) ? "text-black/60" : "text-muted-foreground"}`}>
                            {food.description || "Freshly prepared"}
                          </p>
                        </div>
                      </div>
                      {r.selectedFoodIds.includes(food._id) && (
                        <CheckCircle2 size={20} className="relative z-10" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Drink Section */}
            {r.hasDrink && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="font-bold flex items-center gap-2">
                    <Beer size={18} className="text-amber-500" />
                    Drinks List
                  </h3>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-500/60 bg-amber-500/10 px-2 py-1 rounded-full">
                    Pick up to {r.settings?.maxDrink ?? 1}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {r.drinks.map((drink: any) => (
                    <button
                      key={drink._id}
                      onClick={() => r.handleDrinkToggle(drink._id)}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left group relative overflow-hidden ${
                        r.selectedDrinkIds.includes(drink._id)
                          ? "bg-amber-500 border-amber-500 text-black"
                          : "bg-card border-border hover:border-amber-500/50"
                      }`}
                    >
                      <div className="flex items-center gap-3 relative z-10">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                          r.selectedDrinkIds.includes(drink._id) ? "bg-black/10" : "bg-muted"
                        }`}>
                          <Beer size={20} />
                        </div>
                        <div>
                          <p className="font-bold">{drink.name}</p>
                          <p className={`text-xs ${r.selectedDrinkIds.includes(drink._id) ? "text-black/60" : "text-muted-foreground"}`}>
                            {drink.description || "Chilled beverage"}
                          </p>
                        </div>
                      </div>
                      {r.selectedDrinkIds.includes(drink._id) && (
                        <CheckCircle2 size={20} className="relative z-10" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        )}

        {r.step === 4 && (
          <Step4Review
            name={r.name}
            email={r.email}
            ticketType={r.ticketType}
            ticketPrice={r.ticketPrice}
            partnerName={r.partnerName}
            selectedMerch={r.selectedMerch}
            meshes={r.meshes}
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
