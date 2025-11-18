import React, { useContext, useState } from 'react'
import { twMerge, twJoin } from 'tailwind-merge'
import Button from './Button'
import { ModalContext } from './ModalContext'

import Image1 from "@assets/simple-guide/img1.svg"
import Image2 from "@assets/simple-guide/img2.svg"
import Image3 from "@assets/simple-guide/img3.svg"
import Image4 from "@assets/simple-guide/img4.svg"

type Props = {

}

const StepItem = ({ idx, title, currentStepIdx, setStepIdx }: any) => {

  const isCleared = currentStepIdx >= idx

  return (
    <div
      className={twJoin(
        "flex items-center justify-center",
        "h-[48px] pl-[12px] pr-[24px]",
        "bg-black1a rounded-[6px]",
        "cursor-pointer",
      )}
      onClick={() => {
        setStepIdx(idx)
      }}
    >
      {isCleared 
        ? (
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M13.3241 3.8481L11.0001 1.6001L8.67606 3.8481L5.47506 3.3951L4.91606 6.5791L2.06006 8.0951L3.48006 11.0001L2.06006 13.9041L4.91606 15.4201L5.47506 18.6041L8.67606 18.1521L11.0001 20.4001L13.3241 18.1521L16.5251 18.6041L17.0841 15.4201L19.9401 13.9041L18.5201 11.0001L19.9401 8.0951L17.0841 6.5791L16.5251 3.3951L13.3241 3.8481ZM6.23406 11.4231L9.66206 14.8511L15.3451 8.6451L13.9981 7.3981L9.59806 12.1931L7.52606 10.1211L6.23406 11.4231Z" fill="url(#paint0_linear_2114_1132)"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M13.101 4.533L11 2.5L8.89902 4.533L6.00402 4.123L5.49902 7.003L2.91602 8.373L4.20002 11L2.91602 13.627L5.49902 14.997L6.00402 17.877L8.89902 17.467L11 19.5L13.101 17.467L15.996 17.877L16.501 14.997L19.084 13.627L17.8 11L19.084 8.373L16.501 7.003L15.996 4.123L13.101 4.533ZM6.23302 11.423L9.66202 14.851L15.345 8.645L13.998 7.398L9.59802 12.193L7.52602 10.121L6.23302 11.423Z" fill="url(#paint1_linear_2114_1132)"/>
            <defs>
            <linearGradient id="paint0_linear_2114_1132" x1="4.41106" y1="2.4951" x2="18.0831" y2="21.5081" gradientUnits="userSpaceOnUse">
            <stop stop-color="#DDFFD2"/>
            <stop offset="0.539" stop-color="#73CD05"/>
            <stop offset="0.68" stop-color="#73CB00"/>
            <stop offset="1" stop-color="#00CC1B"/>
            </linearGradient>
            <linearGradient id="paint1_linear_2114_1132" x1="5.35502" y1="3.395" x2="16.361" y2="19.133" gradientUnits="userSpaceOnUse">
            <stop stop-color="#A4F97F"/>
            <stop offset="0.406" stop-color="#66E219"/>
            <stop offset="0.989" stop-color="#66E219"/>
            </linearGradient>
            </defs>
          </svg>
        )
        : (
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="11" r="6" fill="#292929"/>
          </svg>
        )
      }
      <span
        className={twJoin(
          "text-[15px] font-[700] leading-[16px] ml-[10px]",
          isCleared 
            ? "text-whitee0"
            : "text-gray80",
        )}
      >
        {title}
      </span>
    </div>
  )
}

const steps = [
  { title: "Trade Options", src: Image1 },
  { title: "0DTE Options", src: Image2 },
  { title: "Provide Liquidity", src: Image3 },
  { title: "Referral", src: Image4 },
]

const MobySimpleGuidePopup = ({ }: Props) => {

  const { closeModal } = useContext(ModalContext)

  const [stepIdx, setStepIdx] = useState(0)

  return (
    <div
      className={twJoin(
        "w-[806px]",
        "pt-[52px] pb-[28px] px-[24px]",
        "bg-black1f",
        "rounded-[3px]",
        "shadow-[0px_0px_24px_0px_rgba(10,10,10,0.75)"
      )}
      onClick={(e) => { e.stopPropagation() }}
    >
      <div
        className={twJoin(
          "max-h-[70vh]",
          "overflow-scroll scrollbar-hide",
        )}
      >
        <p
          className={twJoin(
            "text-[30px] text-primaryc1 font-[800]",
            "mb-[8px]",
            "leading-[24px]",
          )}
        >
          Moby Simple Guides
        </p>

        <p
          className={twJoin(
            "text-[15px] font-[400] text-grayb3",
            "mb-[36px]",
          )}
        >
          To maximize your potential, this guide covers the essentials for seamless interaction with Moby.

          <span
            className={twJoin(
              "text-greene6 ml-[8px]",
              "underline",
            )}
            onClick={() => {
              window.open("https://docs.moby.trade/lets-get-started/your-guidebook")
            }}
          >
            Learn more
          </span>
        </p>
      </div>

      <div
        className={twJoin(
          "flex items-center justify-between",
          "mb-[24px]",
        )}
      >
        {steps.map(({ title }, idx) => {
          return (
            <>
              <StepItem idx={idx} currentStepIdx={stepIdx} title={title} setStepIdx={setStepIdx} />
              {idx !== steps.length - 1 && (
                <div
                  className={twJoin(
                    "w-[22px] h-[22px] mx-[6px]",
                  )}
                >
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M8.73274 13.4316C8.34222 13.8221 8.34222 14.4553 8.73274 14.8458C9.12327 15.2363 9.75643 15.2363 10.147 14.8458L13.2683 11.7245C13.6588 11.3339 13.6588 10.7008 13.2683 10.3102C12.8778 9.91972 12.2446 9.91972 11.8541 10.3102L8.73274 13.4316Z" fill="#808080"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M8.73274 8.61482C8.34222 8.2243 8.34222 7.59113 8.73274 7.20061C9.12327 6.81008 9.75643 6.81008 10.147 7.20061L13.2683 10.3219C13.6588 10.7125 13.6588 11.3456 13.2683 11.7361C12.8778 12.1267 12.2446 12.1267 11.8541 11.7361L8.73274 8.61482Z" fill="#808080"/>
                  </svg>
                </div>
              )}
            </>
          )
        })}
      </div>

      <img
          className={twJoin(
            "w-[734px] h-[296px]",
            "mb-[24px]",
          )}
          src={steps[stepIdx].src} 
        />

      <div
        className={twJoin(
          "flex items-center justify-between pr-[12px]",
        )}
      >
        <div
          className={twJoin(
            "cursor-pointer"
          )}
          onClick={() => {
            closeModal()
          }}
        >
          Close
        </div>

        <div
          className={twJoin(
            "flex"
          )}
        >
          {stepIdx > 0 && (
            <span
              className={twJoin(
                "flex items-center justify-between",
                "w-[128px] h-[40px] mr-[8px] px-[16px]",
                "text-[15px] font-[700] text-whitee0",
                "cursor-pointer",
                "bg-black1f",
              )}
              onClick={() => {
                setStepIdx(stepIdx - 1)
              }}
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M13.2677 13.4335C13.6583 13.824 13.6583 14.4572 13.2677 14.8477C12.8772 15.2383 12.2441 15.2383 11.8535 14.8477L8.73221 11.7264C8.34169 11.3359 8.34169 10.7027 8.73221 10.3122C9.12274 9.92167 9.7559 9.92167 10.1464 10.3122L13.2677 13.4335Z" fill="#F5F5F5"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M13.2677 8.61677C13.6583 8.22625 13.6583 7.59309 13.2677 7.20256C12.8772 6.81204 12.2441 6.81204 11.8535 7.20256L8.73221 10.3239C8.34169 10.7144 8.34169 11.3476 8.73221 11.7381C9.12274 12.1286 9.7559 12.1286 10.1464 11.7381L13.2677 8.61677Z" fill="#F5F5F5"/>
              </svg>
              Previous
            </span>
          )}
          <Button
            className="w-[180px] h-[40px]"
            name={stepIdx === steps.length - 1 ? "Let's Go!" : "Next"}
            color="greene6"
            onClick={() => {

              if (stepIdx === steps.length - 1) {
                closeModal()
                return
              }

              setStepIdx(stepIdx + 1)
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default MobySimpleGuidePopup