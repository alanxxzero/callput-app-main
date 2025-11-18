import { ReactNode, useEffect, useRef } from "react";
import { twJoin } from "tailwind-merge";

import IconToastSuccess from "../../assets/icon-toast-success.svg"
import IconToastError from "../../assets/icon-toast-error.svg"
import IconToastInfo from "../../assets/icon-toast-info.svg"
import IconToastLoading from "../../assets/gif-loader.gif"
import IconToastClose from "../../assets/icon-toast-close.svg"
import { ToastType, removeToastMessage } from "@/utils/toast";

export type ToastProps = {
  id: string;
  type: ToastType;
  title: string;
  message: ReactNode;
  duration: number;
};

const typeIcons: {[key: string]: string} = {
  success: IconToastSuccess,
  error: IconToastError,
  info: IconToastInfo,
  loading: IconToastLoading
}

const typeClasses: {[key: string]: string} = {
  success: "border-green4c",
  error: "border-redc7",
  info: "border-primaryc1",
  loading: "border-primaryc1"
}

export const Toast = (props: ToastProps) => {
  const { id, type = "info", title, message, duration = 3000 } = props;

  const typeIcon = typeIcons[type];
  const typeClass = typeClasses[type];

  const dismissRef = useRef<ReturnType<typeof setTimeout>>();

  const isMessageEmpty = message === "";

  useEffect(() => {
    if(duration) {
      dismissRef.current = setTimeout(() => {
        removeToastMessage(id);
      }, duration)
    }
    
    return () => {
      clearTimeout(dismissRef.current)
    }
  }, [id, duration])

  const handleRemove = () => {
    removeToastMessage(id);
  };

  return (
    <div
      className={twJoin(
        "flex flex-col w-full",
        "px-[20px] py-[16px] rounded-[4px] bg-black1f",
        "border-[1px] border-opacity-30 shadow-[0px_0px_36px_0_rgba(10,10,10,0.72)]",
        "animate-toastIn",
        isMessageEmpty ? "w-[448px] h-[57px]" : "w-[480px] h-full",
        `${typeClass}`
      )}
    >
      <div className="flex flex-row items-center">
        <img className="w-[24px] h-[24px]" src={typeIcon} />
        <div
          className={twJoin(
            "w-[388px] px-[16px] text-[14px] text-whitee0 font-semibold",
          )}
        >
          {title}
        </div>
        {
          !isMessageEmpty &&
            (<img
                className="cursor-pointer w-[32px] h-[32px]"
                src={IconToastClose}
                onClick={handleRemove}
              />)
        }
      </div>
      <div className="flex flex-row items-center">
        <div className="w-[24px]" />
        {
          !isMessageEmpty && (<div className="w-[388px] px-[16px] text-[14px] text-gray98">{message}</div>)
        }
        <div className="w-[32px]" />
      </div>
    </div>
  );
};
