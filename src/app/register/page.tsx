"use client";
import { useRegister } from "./useRegister";
import StepIndicator from "./StepIndicator";
import Step1Details from "./steps/Step1Details";
import Step2Mesh from "./steps/Step2Mesh";
import Step3Food from "./steps/Step3Food";
import Step4Review from "./steps/Step4Review";
import StickyLogo from "@/components/register/StickyLogo";
import OutlineTitle from "@/components/register/OutlineTitle";
import NavigationButtons from "@/components/register/NavigationButtons";
import LoadingScreen from "@/components/register/LoadingScreen";

export default function RegisterPage() {
  const r = useRegister();

  if (r.loadingData) return <LoadingScreen />;

  const eventName = r.settings?.tenureName ?? "Vestry Event";

  return (
    <main className="min-h-screen bg-background text-foreground px-4 py-10 transition-colors duration-300">
      <StickyLogo logoUrl={r.settings?.logoUrl} />

      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-2 flex flex-col items-center">
          <div className="w-full mb-2">
            <OutlineTitle text={eventName.toUpperCase()} />
          </div>
          <p className="text-muted-foreground text-sm -mt-1">Register your spot</p>
        </div>

        <StepIndicator current={r.step} />

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
          <Step3Food
            foods={r.foods}
            drinks={r.drinks}
            selectedFoodIds={r.selectedFoodIds}
            onFoodToggle={r.handleFoodToggle}
            selectedDrinkId={r.selectedDrinkId}
            onDrinkToggle={r.handleDrinkToggle}
          />
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
            selectedDrinkId={r.selectedDrinkId}
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
