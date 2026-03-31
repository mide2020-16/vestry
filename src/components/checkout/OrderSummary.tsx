import { OrderData } from "@/types/checkout.types";
import { UploadDropzone } from "@/lib/uploadthing";

interface OrderSummaryProps {
  order: OrderData;
  onPay: () => void;
  paymentMethod: "paystack" | "transfer";
  setPaymentMethod: (method: "paystack" | "transfer") => void;
  receiptUrl: string | null;
  setReceiptUrl: (url: string) => void;
  isPaying: boolean;
}

export function OrderSummary({
  order,
  onPay,
  paymentMethod,
  setPaymentMethod,
  receiptUrl,
  setReceiptUrl,
  isPaying,
}: OrderSummaryProps) {
  const attendeeRows = [
    { label: "Primary Attendee", value: order.name },
    ...(order.ticketType === "couple" && order.partnerName
      ? [{ label: "Partner", value: order.partnerName }]
      : []),
    { label: "Email", value: order.email },
    {
      label: "Ticket Type",
      value: order.ticketType.toUpperCase(),
      amber: true,
    },
  ];

  const hasFoodDrink = order.foods.length > 0 || order.drink !== null;

  return (
    <div className="max-w-xl w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <h1 className="text-3xl font-bold text-white mb-2">Order Summary</h1>
      <p className="text-neutral-400 mb-8 border-b border-neutral-800 pb-4">
        Review your selections before payment.
      </p>

      {/* Attendee details */}
      <div className="space-y-3 mb-8">
        {attendeeRows.map(({ label, value, amber }) => (
          <div
            key={label}
            className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-white/5"
          >
            <span className="text-neutral-400">{label}</span>
            <span
              className={
                amber
                  ? "text-amber-400 font-bold tracking-wide"
                  : "text-white font-medium"
              }
            >
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Selections */}
      <div className="space-y-3 mb-8">
        <h2 className="text-neutral-300 font-semibold mb-2">Your Selections</h2>

        <div className="flex justify-between items-center text-sm p-3 rounded-lg bg-white/5">
          <span className="text-white">🎟️ Tickets ({order.ticketType})</span>
          <span className="font-mono text-neutral-300">
            ₦{order.ticketPrice.toLocaleString()}
          </span>
        </div>

        {order.mesh && (
          <div className="flex justify-between items-center text-sm p-3 rounded-lg bg-white/5">
            <div className="flex flex-col">
              <span className="text-white">👕 {order.mesh.name}</span>

              {(order.meshColor || order.meshSize) && (
                <div className="flex items-center gap-2 mt-1 text-xs text-neutral-400">
                  {order.meshColor && (
                    <div className="flex items-center gap-1">
                      <span
                        className="w-3 h-3 rounded-full border border-white/20"
                        style={{ backgroundColor: order.meshColor }}
                      />
                      <span className="uppercase tracking-wide">Color</span>
                    </div>
                  )}

                  {order.meshSize && (
                    <span className="px-2 py-0.5 rounded bg-white/10 text-white/70 font-medium">
                      {order.meshSize}
                    </span>
                  )}
                  {order.meshInscription && (
                    <p className="text-amber-400 font-semibold uppercase tracking-tighter">
                      Inscription: &quot;{order.meshInscription}&quot;
                    </p>
                  )}
                </div>
              )}

              {order.ticketType === "couple" && (
                <span className="text-neutral-500 text-xs mt-0.5">
                  ₦{order.mesh.price.toLocaleString()} × 2 (couple)
                </span>
              )}
            </div>
            <span className="font-mono text-neutral-300">
              ₦{order.meshTotal.toLocaleString()}
            </span>
          </div>
        )}

        {hasFoodDrink && (
          <div className="py-2">
            <span className="text-xs text-emerald-400 uppercase font-bold tracking-wider block mb-2">
              Included Food &amp; Drinks
            </span>
            <ul className="space-y-1 pl-2 border-l-2 border-neutral-800">
              {order.foods.map((food) => (
                <li
                  key={food._id}
                  className="text-sm text-neutral-400 flex items-center gap-2"
                >
                  <span
                    className="w-1 h-1 bg-neutral-600 rounded-full"
                    aria-hidden
                  />
                  {food.name}
                </li>
              ))}
              {order.drink && (
                <li className="text-sm text-neutral-400 flex items-center gap-2">
                  <span
                    className="w-1 h-1 bg-neutral-600 rounded-full"
                    aria-hidden
                  />
                  {order.drink.name}
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Payment Method Selection */}
      <div className="space-y-4 mb-8">
        <h2 className="text-neutral-300 font-semibold mb-2">Payment Method</h2>
        
        <div className="grid gap-3">
          <label className={`cursor-pointer rounded-xl p-4 border flex items-center gap-3 transition-colors ${paymentMethod === "paystack" ? "bg-amber-500/10 border-amber-500" : "bg-white/5 border-neutral-800 hover:border-neutral-700"}`} onClick={() => setPaymentMethod("paystack")}>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === "paystack" ? "border-amber-500" : "border-neutral-500"}`}>
              {paymentMethod === "paystack" && <div className="w-2.5 h-2.5 bg-amber-500 rounded-full" />}
            </div>
            <div>
              <p className="font-bold text-white">Pay Online (Paystack)</p>
              <p className="text-xs text-neutral-400">Instant verification via card or bank transfer.</p>
            </div>
          </label>

          <label className={`cursor-pointer rounded-xl p-4 border flex items-center gap-3 transition-colors ${paymentMethod === "transfer" ? "bg-amber-500/10 border-amber-500" : "bg-white/5 border-neutral-800 hover:border-neutral-700"}`} onClick={() => setPaymentMethod("transfer")}>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === "transfer" ? "border-amber-500" : "border-neutral-500"}`}>
              {paymentMethod === "transfer" && <div className="w-2.5 h-2.5 bg-amber-500 rounded-full" />}
            </div>
            <div>
              <p className="font-bold text-white">Manual Bank Transfer</p>
              <p className="text-xs text-neutral-400">Transfer directly and upload your receipt (Wait for admin approval).</p>
            </div>
          </label>
        </div>
      </div>

      {/* Manual Transfer Instructions */}
      {paymentMethod === "transfer" && (
        <div className="space-y-4 mb-8 bg-neutral-950 p-6 rounded-xl border border-neutral-800">
          <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wide">Bank Details</h3>
          <div className="space-y-2">
            <div className="flex justify-between border-b border-neutral-800 pb-2">
              <span className="text-neutral-400 text-sm">Bank Name</span>
              <span className="text-white font-medium">{order.bankDetails?.bankName}</span>
            </div>
            <div className="flex justify-between border-b border-neutral-800 pb-2">
              <span className="text-neutral-400 text-sm">Account Name</span>
              <span className="text-white font-medium">{order.bankDetails?.accountName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400 text-sm">Account Number</span>
              <span className="text-amber-400 font-mono text-lg">{order.bankDetails?.accountNumber}</span>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-neutral-800">
            <h3 className="text-sm font-bold text-white mb-3">Upload Payment Receipt</h3>
            {receiptUrl ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm p-4 rounded-xl flex justify-between items-center">
                <span>✅ Receipt Uploaded</span>
                <button onClick={() => setReceiptUrl("")} className="text-xs underline hover:text-emerald-300">Remove</button>
              </div>
            ) : (
              <div className="bg-white/5 rounded-xl border border-neutral-800 p-2">
                <UploadDropzone
                  endpoint="receiptUploader"
                  onClientUploadComplete={(res) => {
                    if (res && res.length > 0) {
                      setReceiptUrl(res[0].url);
                    }
                  }}
                  onUploadError={(error: Error) => {
                    alert(`Error uploading receipt: ${error.message}`);
                  }}
                  appearance={{
                    button: "bg-amber-500 text-black px-4 py-2 mt-4 ut-uploading:bg-amber-600",
                    label: "text-amber-500 hover:text-amber-400",
                    container: "p-4",
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Paystack Fee Notice */}
      {paymentMethod === "paystack" && (
         <div className="flex justify-between items-center text-sm p-3 rounded-lg bg-neutral-950 border border-neutral-800 mb-6">
           <span className="text-neutral-400">Processing Fee</span>
           <span className="font-mono text-neutral-300">
             ₦{order.paystackFee.toLocaleString()}
           </span>
         </div>
      )}

      <button
        type="button"
        onClick={onPay}
        disabled={isPaying || (paymentMethod === "transfer" && !receiptUrl)}
        className="w-full bg-linear-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 disabled:opacity-50 disabled:cursor-not-allowed
          text-black font-bold text-lg py-4 rounded-xl shadow-[0_0_20px_rgba(251,191,36,0.2)]
          hover:shadow-[0_0_30px_rgba(251,191,36,0.4)] transition-all active:scale-[0.98]"
      >
        {isPaying 
          ? "Processing..." 
          : paymentMethod === 'paystack' 
            ? `Pay ₦${order.grandTotal.toLocaleString()}` 
            : `Confirm Registration (₦${order.baseTotal.toLocaleString()})`}
      </button>
    </div>
  );
}
