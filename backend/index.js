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







const prisma = new PrismaClient();
// =================================
//          Card Holders
// =================================
app.get("/card-holders", async (req, res) => {
    const cardHolders = await prisma.cardHolder.findMany();
    res.send(cardHolders);
});
app.post("/register/user-holder", async (req, res) => {
    const { clientID, name, mobile, card_number, card_type, service_limit, email, address, password, role } = req.body;
    console.log(service_limit);
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
    const merchants = await prisma.merchant.findMany();
    res.send(merchants);
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
        name, mobile, address, payment_method, account_name, branch_name,
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
    routing_number = parseInt(routing_number) || 0;
    account_number = parseInt(account_number) || 0;

    const merchant = {
        name,
        mobile,
        address,
        payment_method,
        account_name,
        branch_name,
        routing_number,
        account_number,
        agreement_url,
        co_name,
        co_nickname,
        co_mobile,
        co_email,
        co_telephone,
        co_extension,
        email,
        password,
        role
    }
    console.log(merchant);
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
                    name, mobile, address, payment_method, account_name, branch_name, routing_number, account_number, agreement_url, co_name, co_nickname, co_mobile, co_email, co_telephone, co_extension, email, password, role,
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








app.get('/', (req, res) => {
    res.send("Server is connected");
});


app.listen(port, () => {
    console.log(`Listening from port: ${port}`)
});