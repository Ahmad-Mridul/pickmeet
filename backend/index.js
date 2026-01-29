require('dotenv').config()
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
const multer = require("multer");
const path = require("path");
const fs = require("fs");


// const { PrismaClient } = require("./generated/prisma");
const { PrismaClient } = require("@prisma/client");
app.use(express.json());
app.use(cors());





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

// 3. Create the Upload Route
// 'pdfFile' is the name of the input field in the frontend
app.post("/upload-pdf", upload.single('pdfFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send("No file uploaded.");
        }

        // The file is now saved in /backend/uploads/
        // req.file.filename contains the saved name

        console.log("File saved:", req.file.filename);

        // TODO: Save 'req.file.filename' to your Database using Prisma here
        // const result = await prisma.document.create({ data: { filePath: req.file.filename } })

        res.json({ message: "File uploaded successfully", filePath: req.file.filename });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get("/download-pdf/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', filename);

    console.log("Request for PDF:", filename);
    console.log("Resolved path:", filePath);

    if (fs.existsSync(filePath)) {
        console.log("File exists, serving...");
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline'); // Ensure it displays in browser
        res.sendFile(filePath);
    } else {
        console.error("File not found at path:", filePath);
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
    console.log("clientid from params: ", id);
    const cardHolder = await prisma.cardHolder.findUnique({
        where: {
            clientID: id
        }
    });
    res.send(cardHolder);
});
app.post("/register/card-holder", async (req, res) => {
    let { clientID, name, mobile, card_number, card_type, service_limit, email, address, password, role } = req.body;
    console.log("clientID, name", clientID, name);
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
        console.log("Registration failed", error);
        res.status(500).json({ error: "Registration failed" });
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
        console.log("Registration failed", error);
        res.status(500).json({ error: "Registration failed" });
    }
});

// =================================
//          Service Ticket
// =================================

app.post("/register/service-ticket", async (req, res) => {
    try {
        const { cardHolderId, merchantId, pickupDateTime, dropoffDateTime, pickupAddress, dropoffAddress, specialInstructions, paymentStatus, ticketStatus, serviceType } = req.body;

        console.log("serviceType: ", serviceType);

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
                specialInstructions: specialInstructions || "",
                paymentStatus: paymentStatus || "Unpaid",
                ticketStatus: ticketStatus || "pending",
                serviceType: serviceType || "Unspecified"
            }
        })
        res.status(200).json({ message: "Service ticket created successfully", serviceTicket });
    } catch (error) {
        console.log("Service ticket creation failed", error);
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



app.get("/users", async (req, res) => {
    const users = await prisma.user.findMany();
    res.send(users);
});














app.get('/', (req, res) => {
    res.send("Server is connected");
});


app.listen(port, () => {
    console.log(`Listening from port: ${port}`)
});
// export default app;