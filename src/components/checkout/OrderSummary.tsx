import { OrderData } from "@/types/checkout.types";

interface OrderSummaryProps {
  order: OrderData;
  onPay: () => void;
}

export function OrderSummary({ order, onPay }: OrderSummaryProps) {
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
                  {order.meshInscriptions && (
                    <p className="text-amber-400 font-semibold uppercase tracking-tighter">
                      Inscription: &quot;{order.meshInscriptions}&quot;
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

      <button
        type="button"
        onClick={onPay}
        className="w-full mt-8 bg-linear-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500
          text-black font-bold text-lg py-4 rounded-xl shadow-[0_0_20px_rgba(251,191,36,0.2)]
          hover:shadow-[0_0_30px_rgba(251,191,36,0.4)] transition-all active:scale-[0.98]"
      >
        Pay ₦{order.grandTotal.toLocaleString()}
      </button>
    </div>
  );
}
