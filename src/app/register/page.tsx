'use client'
import { useRegister } from './useRegister';
import StepIndicator    from './StepIndicator';
import Step1Details     from './steps/Step1Details';
import Step2Mesh        from './steps/Step2Mesh';
import Step3Food        from './steps/Step3Food';
import Step4Review      from './steps/Step4Review';
import StickyLogo from '@/components/register/StickyLogo';
import OutlineTitle from '@/components/register/OutlineTitle';
import NavigationButtons from '@/components/register/NavigationButtons';

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <svg className="animate-spin h-10 w-10 text-amber-400" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12" cy="12" r="10"
            stroke="currentColor" strokeWidth="4" fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <p className="text-white/40 text-sm">Loading event details...</p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const r = useRegister();

  if (r.loadingData) return <LoadingScreen />;

  const eventName = r.settings?.tenureName ?? 'Vestry Event';

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-4 py-10">
      <StickyLogo logoUrl={r.settings?.logoUrl} />

      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-2 flex flex-col items-center">
          <div className="w-full mb-2">
            <OutlineTitle text={eventName.toUpperCase()} />
          </div>
          <p className="text-white/40 text-sm -mt-1">Register your spot</p>
        </div>

        <StepIndicator current={r.step} />

        {r.step === 1 && (
          <Step1Details
            name={r.name}               setName={r.setName}
            email={r.email}             setEmail={r.setEmail}
            ticketType={r.ticketType}   setTicketType={r.setTicketType}
            partnerName={r.partnerName} setPartnerName={r.setPartnerName}
            ticketPrice={r.ticketPrice}
            singlePrice={r.settings?.singlePrice}
            couplePrice={r.settings?.couplePrice}
          />
        )}

        {r.step === 2 && (
          <Step2Mesh
            meshes={r.meshes}
            selectedmeshId={r.selectedmeshId} setSelectedmeshId={r.setSelectedmeshId}
            selectedmesh={r.selectedmesh}
            meshColor={r.meshColor} setmeshColor={r.setmeshColor}
            ticketType={r.ticketType}
            meshPrice={r.meshPrice}
            meshSize={r.meshSize} setMeshSize={r.setMeshSize}
          />
        )}

        {r.step === 3 && (
          <Step3Food
            foods={r.foods}                     drinks={r.drinks}
            selectedFoodIds={r.selectedFoodIds} onFoodToggle={r.handleFoodToggle}
            selectedDrinkId={r.selectedDrinkId} onDrinkToggle={r.handleDrinkToggle}
          />
        )}

        {r.step === 4 && (
          <Step4Review
            name={r.name}             email={r.email}
            ticketType={r.ticketType} ticketPrice={r.ticketPrice}
            partnerName={r.partnerName}
            selectedmesh={r.selectedmesh} meshPrice={r.meshPrice} meshColor={r.meshColor} meshSize={r.meshSize}
            foods={r.foods}               selectedFoodIds={r.selectedFoodIds}
            drinks={r.drinks}             selectedDrinkId={r.selectedDrinkId}
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