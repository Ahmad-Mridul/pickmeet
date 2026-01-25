-- CreateTable
CREATE TABLE "ServiceTicket" (
    "id" SERIAL NOT NULL,
    "cardHolderId" INTEGER NOT NULL,
    "merchantId" INTEGER NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "pickupDateTime" TIMESTAMP(3) NOT NULL,
    "dropoffDateTime" TIMESTAMP(3) NOT NULL,
    "useCardHolderAddress" BOOLEAN NOT NULL,
    "pickupAddress" TEXT NOT NULL,
    "specialInstructions" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL,
    "ticketStatus" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceTicket_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ServiceTicket" ADD CONSTRAINT "ServiceTicket_cardHolderId_fkey" FOREIGN KEY ("cardHolderId") REFERENCES "CardHolder"("clientID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceTicket" ADD CONSTRAINT "ServiceTicket_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
