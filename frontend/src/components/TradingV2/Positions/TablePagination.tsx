import IconArrowPrev from "@/assets/trading-v2/icon-arrow-prev.png";
import IconArrowNext from "@/assets/trading-v2/icon-arrow-next.png";
import { twJoin } from "tailwind-merge";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

function TablePagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: TablePaginationProps) {
  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // Calculate display range for items
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  return (
    <div className="flex flex-row items-center justify-end gap-[18px] w-full h-[40px] px-[12px] py-[8px] border-t-[1px] border-black29">
      <div>
        <p className="text-gray80 text-[12px] font-medium leading-[24px]">
          {totalItems === 0 ? "0-0 of 0" : `${startItem}-${endItem} of ${totalItems}`}
        </p>
      </div>
      <div className="flex gap-[6px]">
        <button
          className={twJoin(
            "w-[24px] h-[24px] flex items-center justify-center rounded-full",
            currentPage !== 1 && "hover:bg-black1f active:opacity-30 active:scale-95",
            currentPage === 1 && "cursor-not-allowed"
          )}
          onClick={handlePrevPage}
          disabled={currentPage === 1}
        >
          <img
            src={IconArrowPrev}
            alt="Previous page"
            className={twJoin("w-[24px] h-[24px]", currentPage === 1 ? "opacity-30" : "opacity-100")}
          />
        </button>
        <button
          className={twJoin(
            "w-[24px] h-[24px] flex items-center justify-center rounded-full",
            currentPage !== totalPages && "hover:bg-black1f active:opacity-30 active:scale-95",
            currentPage === totalPages && "cursor-not-allowed"
          )}
          onClick={handleNextPage}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          <img
            src={IconArrowNext}
            alt="Next page"
            className={twJoin(
              "w-[24px] h-[24px]",
              currentPage === totalPages || totalPages === 0 ? "opacity-30" : "opacity-100"
            )}
          />
        </button>
      </div>
    </div>
  );
}

export default TablePagination;
