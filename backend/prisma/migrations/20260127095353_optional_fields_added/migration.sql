-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardHolder" (
    "clientID" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "card_number" TEXT NOT NULL,
    "card_type" TEXT NOT NULL,
    "service_limit" INTEGER,
    "email" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "CardHolder_pkey" PRIMARY KEY ("clientID")
);

-- CreateTable
CREATE TABLE "Merchant" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "payment_method" TEXT NOT NULL,
    "service_charge" TEXT,
    "account_name" TEXT NOT NULL,
    "branch_name" TEXT NOT NULL,
    "routing_number" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "agreement_url" TEXT NOT NULL,
    "co_name" TEXT NOT NULL,
    "co_nickname" TEXT NOT NULL,
    "co_mobile" TEXT NOT NULL,
    "co_email" TEXT NOT NULL,
    "co_telephone" TEXT NOT NULL,
    "co_extension" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Merchant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceTicket" (
    "id" SERIAL NOT NULL,
    "cardHolderId" INTEGER NOT NULL,
    "merchantId" INTEGER NOT NULL,
    "serviceType" TEXT NOT NULL,
    "pickupDateTime" TIMESTAMP(3) NOT NULL,
    "dropoffDateTime" TIMESTAMP(3) NOT NULL,
    "meetDateTime" TIMESTAMP(3),
    "pickupAddress" TEXT NOT NULL,
    "dropoffAddress" TEXT NOT NULL,
    "meetAddress" TEXT,
    "specialInstructions" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL,
    "ticketStatus" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceTicket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CardHolder_email_key" ON "CardHolder"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_email_key" ON "Merchant"("email");

-- AddForeignKey
ALTER TABLE "CardHolder" ADD CONSTRAINT "CardHolder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Merchant" ADD CONSTRAINT "Merchant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceTicket" ADD CONSTRAINT "ServiceTicket_cardHolderId_fkey" FOREIGN KEY ("cardHolderId") REFERENCES "CardHolder"("clientID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceTicket" ADD CONSTRAINT "ServiceTicket_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
