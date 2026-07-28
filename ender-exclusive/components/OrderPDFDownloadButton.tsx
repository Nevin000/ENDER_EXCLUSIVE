"use client";

import { useEffect, useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { OrderReceiptPDF } from "./OrderReceiptPDF";
import { Order } from "@/services/orderService";
import { FaFilePdf } from "react-icons/fa";

interface Props {
  order: Order;
}

export default function OrderPDFDownloadButton({ order }: Props) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <button
        disabled
        className="inline-flex items-center justify-center gap-2 bg-zinc-800 text-zinc-400 font-medium uppercase tracking-wider text-xs sm:text-sm px-6 py-3.5 rounded-full cursor-not-allowed opacity-70"
      >
        <FaFilePdf /> Loading PDF Generator...
      </button>
    );
  }

  return (
    <PDFDownloadLink
      document={<OrderReceiptPDF order={order} orderId={order.id || ""} />}
      fileName={`ENDER_Order_${order.orderNo || order.id?.slice(0, 8).toUpperCase()}.pdf`}
      className="inline-flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black font-medium uppercase tracking-wider text-xs sm:text-sm px-6 py-3.5 rounded-full hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-md cursor-pointer"
    >
      {({ loading }) => (
        <>
          {loading ? (
            "Generating PDF..."
          ) : (
            <>
              <FaFilePdf /> Download Order PDF
            </>
          )}
        </>
      )}
    </PDFDownloadLink>
  );
}
