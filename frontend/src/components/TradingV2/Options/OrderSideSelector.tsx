import { OrderSide } from "@/utils/types";
import { twJoin } from "tailwind-merge";

interface OrderSideSelectorProps {
  selectedOrderSide: OrderSide;
  setSelectedOrderSide: (orderSide: OrderSide) => void;
}

function OrderSideSelector({
  selectedOrderSide,
  setSelectedOrderSide,
}: OrderSideSelectorProps) {
  const orderSides: OrderSide[] = ["Buy", "Sell"];

  return (
    <div className="flex flex-row items-center gap-[4px]">
      {orderSides.map((orderSide) => (
        <OrderSideButton
          key={orderSide}
          orderSide={orderSide}
          isSelected={orderSide === selectedOrderSide}
          setSelectedOrderSide={setSelectedOrderSide}
        />
      ))}
    </div>
  );
}

export default OrderSideSelector;

interface OrderSideButtonProps {
  orderSide: OrderSide;
  isSelected: boolean;
  setSelectedOrderSide: (orderSide: OrderSide) => void;
}

function OrderSideButton({
  orderSide,
  isSelected,
  setSelectedOrderSide,
}: OrderSideButtonProps) {
  return (
    <button
      className={twJoin(
        "cursor-pointer flex flex-row items-center justify-center",
        "w-[96px] h-[36px] px-[14px] rounded-[6px]",
        "text-[13px] text-grayb3 font-semibold",
        "hover:bg-black1f",
        "active:bg-transparent active:opacity-80 active:scale-95",
        isSelected && orderSide === "Buy" && "!bg-green63",
        isSelected && orderSide === "Sell" && "!bg-redff33"
      )}
      onClick={() => {
        setSelectedOrderSide(orderSide);
      }}
    >
      <p className={twJoin(isSelected && "text-black17 font-bold")}>{orderSide}</p>
    </button>
  );
}
