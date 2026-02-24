require('dotenv').config()
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const twilio = require("twilio");

// const { PrismaClient } = require("./generated/prisma");
const { PrismaClient } = require("@prisma/client");
const sendMail = require('./sendMail');
app.use(express.json());
app.use(cors());

// const client = twilio(
//     process.env.TWILIO_ACCOUNT_SID,
//     process.env.TWILIO_AUTH_TOKEN
// );

// SMS API
app.post("/send-sms", async (req, res) => {
    const { to, message } = req.body;

    try {
        // Get credentials from environment variables
        const apiUrl = process.env.SMS_API_URL;
        const userName = process.env.SMS_USERNAME;
        const apiKey = process.env.SMS_API_KEY;
        const senderName = process.env.SMS_SENDER_NAME;

        // Format the mobile number to 88... if it's not already
        // This assumes input might be "+880..." or "01..."
        // logic: remove all non-digits, take last 11, prepend 88
        const cleanNumber = to.replace(/[^0-9]/g, '');
        const mobileNumber = `88${cleanNumber.slice(-11)}`;

        // Build the URL with query parameters
        const params = new URLSearchParams();
        params.append('UserName', userName);
        params.append('Apikey', apiKey);
        params.append('MobileNumber', mobileNumber);
        params.append('SenderName', senderName);
        params.append('TransactionType', 'T');
        params.append('Message', message);

        const fullUrl = `${apiUrl}?${params.toString()}`;

        const response = await fetch(fullUrl, { method: 'GET' });

        if (!response.ok) {
            throw new Error(`SMS API request failed with status ${response.status}`);
        }

        const result = await response.json();

        res.json({ success: true, result: result });
    } catch (error) {
        console.error("SMS Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});




// 1. Configure Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/';
        // Create folder if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath);
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Save as: timestamp-originalName.pdf to avoid duplicates
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// 2. Make the folder "public" so frontend can view the PDFs later
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.post("/upload-pdf", upload.single('pdfFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send("No file uploaded.");
        }
        res.json({ message: "File uploaded successfully", filePath: req.file.filename });
    } catch (error) {
        res.status(500).send(error.message);
    }
});




app.get("/download-pdf/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', filename);

    if (fs.existsSync(filePath)) {
        res.sendFile(filePath, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="${filename}"`
            }
        });
    } else {
        res.status(404).send("File not found");
    }
});







const prisma = new PrismaClient();
// =================================
//          Card Holders
// =================================
app.get("/card-holders", async (req, res) => {
    const cardHolders = await prisma.cardHolder.findMany();
    res.send(cardHolders);
});
app.get("/pick-drop/all-holders/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const cardHolder = await prisma.cardHolder.findUnique({
        where: {
            clientID: id
        }
    });
    res.send(cardHolder);
});
app.post("/register/card-holder", async (req, res) => {
    let { clientID, name, mobile, card_number, card_type, service_limit, email, address, password, role } = req.body;
    if (card_type === "platinum") {
        service_limit = 6;
    }
    try {
        const result = await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    email,
                    password,
                    role
                }
            });
            const newCardHolder = await tx.cardHolder.create({
                data: {
                    clientID, name, mobile, card_number, card_type, service_limit, email, address, role,
                    user: {
                        connect: {
                            id: newUser.id
                        }
                    }
                }
            });
            return { user: newUser, cardHolder: newCardHolder }
        })
        res.status(200).json({ message: "Registration successful", result });
    } catch (error) {
        res.status(500).json({ error: "Registration failed" });
    }
});

app.put("/card-holders/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const { name, mobile, email, card_number, address } = req.body;

    try {
        const updatedCardHolder = await prisma.cardHolder.update({
            where: { clientID: id },
            data: {
                name,
                mobile,
                email,
                card_number,
                address
            }
        });
        res.json({ message: "Card holder updated successfully", result: updatedCardHolder });
    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ error: "Failed to update card holder" });
    }
});




app.delete("/card-holders/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const { password, userEmail } = req.body;

    try {
        // 1. Find the user requesting the delete
        const user = await prisma.user.findUnique({
            where: { email: userEmail }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // 2. Verify password (assuming plain text as per current codebase patterns, 
        // if hashed, use bcrypt.compare(password, user.password))
        if (user.password !== password) {
            return res.status(401).json({ error: "Incorrect password" });
        }

        // 3. Delete the CardHolder
        // Note: This might fail if there are related ServiceTickets. 
        // We might need to delete them first or use cascade delete in schema.
        // For now, attempting direct delete.
        await prisma.cardHolder.delete({
            where: { clientID: id }
        });

        res.json({ message: "Card holder deleted successfully" });

    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ error: "Failed to delete card holder. It might be linked to other records." });
    }
});

// =================================
//          Merchants
// =================================

app.get("/merchants", async (req, res) => {
    try {
        const merchants = await prisma.merchant.findMany();
        res.json(merchants);
    } catch (error) {
        console.error("ERROR /merchants:", error);
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
        });
    }
});

app.get("/merchant/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const merchant = await prisma.merchant.findUnique({
        where: {
            id: id
        }
    });
    res.send(merchant);
});
app.post("/register/merchant", upload.single('agreement_url'), async (req, res) => {
    // Destructure with defaults for safety
    const {
        name, mobile, address, payment_method, account_name, branch_name, service_charge,
        co_name = "", co_nickname = "", co_mobile = "", co_email = "", co_telephone = "", co_extension = "",
        email, password, role = "merchant"
    } = req.body;

    let { agreement_url, routing_number, account_number } = req.body;

    // If a file was uploaded, use its filename
    if (req.file) {
        agreement_url = req.file.filename;
    } else if (!agreement_url) {
        agreement_url = "N/A";
    }

    // Parse Integer fields
    // Parse Integer fields
    // routing_number = parseInt(routing_number) || 0;
    // account_number = parseInt(account_number) || 0;

    // const merchant = {
    //     name,
    //     mobile,
    //     address,
    //     payment_method,
    //     service_charge,
    //     account_name,
    //     branch_name,
    //     routing_number,
    //     account_number,
    //     agreement_url,
    //     co_name,
    //     co_nickname,
    //     co_mobile,
    //     co_email,
    //     co_telephone,
    //     co_extension,
    //     email,
    //     password,
    //     role
    // }
    try {
        const result = await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    email,
                    password,
                    role
                }
            });
            const newMerchant = await tx.merchant.create({
                data: {
                    name, mobile, address, payment_method, service_charge, account_name, branch_name, routing_number, account_number, agreement_url, co_name, co_nickname, co_mobile, co_email, co_telephone, co_extension, email, password, role,
                    user: {
                        connect: {
                            id: newUser.id
                        }
                    }
                }
            });
            return { user: newUser, merchant: newMerchant }
        })
        res.status(200).json({ message: "Registration successful", result });
    } catch (error) {
        res.status(500).json({ error: "Registration failed" });
    }
});

app.put("/merchants/:id", upload.single('agreement_paper'), async (req, res) => {
    const id = parseInt(req.params.id);
    // Extract fields from req.body (FormData turns checks into strings, so be careful)
    const {
        name, mobile, address, payment_method, account_name, branch_name,
        routing_number, account_number, co_name, co_nickname, co_mobile,
        co_email, co_telephone, co_extension, email, password, store_details
    } = req.body;

    let updateData = {
        name, mobile, address, payment_method, account_name, branch_name,
        routing_number, account_number, co_name, co_nickname, co_mobile,
        co_email, co_telephone, co_extension, email,
        // store_details is not in the schema shown earlier but was in the frontend form. 
        // If it's not in schema, prisma will throw. I'll check schema again if it fails.
        // Based on previous schema view, `store_details` was NOT in Merchant model.
        // I will omit it for now or check schema.
    };

    // Only update password if provided and not empty
    if (password && password.trim() !== "") {
        updateData.password = password;
    }

    if (req.file) {
        updateData.agreement_url = req.file.filename;
    }

    try {
        const updatedMerchant = await prisma.merchant.update({
            where: { id: id },
            data: updateData
        });
        res.json({ message: "Merchant updated successfully", data: updatedMerchant });
    } catch (error) {
        console.error("Update Merchant Error:", error);
        res.status(500).json({ error: "Failed to update merchant" });
    }
});

app.delete("/merchants/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const { password, userEmail } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { email: userEmail }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (user.password !== password) {
            return res.status(401).json({ error: "Incorrect password" });
        }

        await prisma.merchant.delete({
            where: { id: id }
        });

        res.json({ message: "Merchant deleted successfully" });
    } catch (error) {
        console.error("Delete Merchant Error:", error);
        res.status(500).json({ error: "Failed to delete merchant" });
    }
});

// =================================
//          Service Ticket
// =================================

app.post("/register/service-ticket", async (req, res) => {
    try {
        const { cardHolderId, merchantId, pickupDateTime, dropoffDateTime, pickupAddress, dropoffAddress, meetAddress, specialInstructions, paymentStatus, ticketStatus, serviceType, flightNumber } = req.body;


        // Handle optional dates safely
        let pickupDate = pickupDateTime ? new Date(pickupDateTime) : null;
        let dropoffDate = dropoffDateTime ? new Date(dropoffDateTime) : null;
        let meetDate = null;

        if (serviceType === "meet-and-greet" || serviceType === "greet-and-meet") {
            meetDate = pickupDate;
            pickupDate = null;
            dropoffDate = null;
        }

        const serviceTicket = await prisma.serviceTicket.create({
            data: {
                cardHolder: {
                    connect: {
                        clientID: parseInt(cardHolderId)
                    }
                },
                merchant: {
                    connect: {
                        id: parseInt(merchantId)
                    }
                },
                pickupDateTime: pickupDate,
                dropoffDateTime: dropoffDate,
                meetDateTime: meetDate,
                pickupAddress: pickupAddress || "",
                dropoffAddress: dropoffAddress || "",
                meetAddress: meetAddress || "",
                flightNumber: flightNumber || "",
                specialInstructions: specialInstructions || "",
                paymentStatus: paymentStatus || "Unpaid",
                ticketStatus: ticketStatus || "pending",
                serviceType: serviceType || "Unspecified"
            },
            include: {
                cardHolder: true,
                merchant: true
            }
        });

        // Send Email Notifications
        try {
            let specificDetails = "";
            if (serviceTicket.serviceType === "meet-and-greet" || serviceTicket.serviceType === "greet-and-meet") {
                specificDetails = `
Meet-up Date & Time: ${serviceTicket.meetDateTime || 'N/A'}
Meet-up Address: ${serviceTicket.meetAddress || 'N/A'}
Flight Number: ${serviceTicket.flightNumber || 'N/A'}
`;
            } else {
                specificDetails = `
Pickup Date & Time: ${serviceTicket.pickupDateTime || 'N/A'}
Dropoff Date & Time: ${serviceTicket.dropoffDateTime || 'N/A'}

Pickup Address: ${serviceTicket.pickupAddress || 'N/A'}
Dropoff Address: ${serviceTicket.dropoffAddress || 'N/A'}
`;
            }

            const ticketDetails = `
Service Ticket Details:
----------------------
Service Type: ${serviceTicket.serviceType}

Card Holder: ${serviceTicket.cardHolder.name}
Card Holder Mobile: ${serviceTicket.cardHolder.mobile}
Merchant: ${serviceTicket.merchant.name}
Merchant Mobile: ${serviceTicket.merchant.mobile}
${specificDetails}
Instructions: ${serviceTicket.specialInstructions || 'None'}
`;

            // To Card Holder
            await sendMail(
                serviceTicket.cardHolder.email,
                `Ticket Created: ${serviceTicket.serviceType}`,
                `Hi ${serviceTicket.cardHolder.name},\n\nYour service ticket has been created successfully.\n${ticketDetails}\n\nThank you!`
            );

            // To Merchant
            await sendMail(
                serviceTicket.merchant.email,
                `New Service Ticket: ${serviceTicket.serviceType}`,
                `Hi ${serviceTicket.merchant.name},\n\nYou have received a new service ticket.\n${ticketDetails}\n\nThank you!`
            );
        } catch (mailError) {
            console.error("Failed to send notification emails:", mailError);
        }

        res.status(200).json({ message: "Service ticket created successfully", serviceTicket });
    } catch (error) {
        res.status(500).json({ error: "Service ticket creation failed" });
    }
});


app.get("/service-tickets", async (req, res) => {
    const serviceTickets = await prisma.serviceTicket.findMany({
        include: {
            cardHolder: true,
            merchant: true
        }
    });
    res.send(serviceTickets);
});
app.get("/service-tickets/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const serviceTicket = await prisma.serviceTicket.findUnique({
        where: {
            id: id
        }
    });
    res.send(serviceTicket);
});

app.put("/service-tickets/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const { ticketStatus } = req.body;

    try {
        const updatedTicket = await prisma.serviceTicket.update({
            where: { id: id },
            data: { ticketStatus: ticketStatus }
        });
        res.json({ message: "Ticket status updated successfully", serviceTicket: updatedTicket });
    } catch (error) {
        console.error("Update Ticket Error:", error);
        res.status(500).json({ error: "Failed to update ticket status" });
    }
});



app.get("/users", async (req, res) => {
    const users = await prisma.user.findMany();
    res.send(users);
});

app.post("/verify-password", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user || user.password !== password) {
            return res.json({ success: false });
        }

        res.json({ success: true });
    } catch (error) {
        console.error("Verification Error:", error);
        res.status(500).json({ error: "Verification failed" });
    }
});














app.get('/', (req, res) => {
    res.send("Server is connected");
});


app.listen(port, () => {
    console.log(`Listening from port: ${port}`)
});
// export default app;