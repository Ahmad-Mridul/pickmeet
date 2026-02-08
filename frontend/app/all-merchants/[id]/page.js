"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Container,
    Card,
    CardContent,
    Typography,
    Grid,
    Button,
    Box,
    CircularProgress,
    Paper,
    Avatar,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Alert,
    Skeleton
} from "@mui/material";
import StoreIcon from "@mui/icons-material/Store";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CampaignIcon from "@mui/icons-material/Campaign";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { toast } from "sonner";

export default function MerchantProfile() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;

    const [merchant, setMerchant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Mock campaigns data for design purposes
    const campaigns = [
        { code: "ZZ18QWLL", customer: "SIBLI SADIK RONY", points: 10000, amount: "₹2500", status: "Claimed", expiry: "3/2/2026" },
        { code: "3C95VLZ6", customer: "Zafirul Islam", points: 12000, amount: "₹3000", status: "Available", expiry: "3/2/2026" },
    ];

    useEffect(() => {
        const fetchMerchant = async () => {
            if (!id) return;
            try {
                const response = await fetch(`http://localhost:5000/merchant/${id}`);
                if (!response.ok) throw new Error("Failed to fetch merchant details");
                const data = await response.json();
                setMerchant(data);
            } catch (err) {
                console.error(err);
                setError(err.message);
                toast.error("Error", { description: err.message });
            } finally {
                setLoading(false);
            }
        };

        fetchMerchant();
    }, [id]);

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !merchant) {
        return (
            <Container sx={{ mt: 4 }}>
                <Typography variant="h5" color="error" sx={{ mt: 2 }}>
                    {error || "Merchant not found"}
                </Typography>
            </Container>
        );
    }

    const {
        name,
        email,
        mobile,
        address,
        account_number,
        store_details,
        co_name,
        co_nickname,
        co_mobile,
        co_email,
        co_telephone,
        co_extension,
        agreement_url
    } = merchant;

    const fullAgreementUrl = agreement_url && agreement_url !== "N/A"
        ? `http://localhost:5000/download-pdf/${agreement_url}`
        : null;

    const isPdf = fullAgreementUrl && fullAgreementUrl.toLowerCase().endsWith(".pdf");

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" fontWeight="bold" className="text-black">Merchant Profile</Typography>
                <Typography variant="body2" color="text.secondary">ID: {id}</Typography>
            </Box>

            <Grid container spacing={4}>
                {/* Left Sidebar - Profile Info */}
                <Grid item size={4}>
                    <Card sx={{ height: '100%', boxShadow: 1, borderRadius: 2 }}>
                        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', pt: 4 }}>
                            <Avatar sx={{ width: 80, height: 80, bgcolor: '#9c27b0', fontSize: 32, mb: 2 }}>
                                {name?.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant="h6" fontWeight="bold">{name}</Typography>
                            <Chip label="merchant" size="small" sx={{ bgcolor: '#9c27b0', color: 'white', mt: 1, mb: 4 }} />

                            <Box sx={{ width: '100%', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, color: 'text.secondary' }}>
                                        <StoreIcon fontSize="small" />
                                        <Typography variant="caption" fontWeight="bold">STORE DETAILS</Typography>
                                    </Box>
                                    <Typography variant="body2">{store_details || address || "N/A"}</Typography>
                                </Box>

                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, color: 'text.secondary' }}>
                                        <EmailIcon fontSize="small" />
                                        <Typography variant="caption" fontWeight="bold">EMAIL</Typography>
                                    </Box>
                                    <Typography variant="body2">{email || "N/A"}</Typography>
                                </Box>

                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, color: 'text.secondary' }}>
                                        <PhoneIcon fontSize="small" />
                                        <Typography variant="caption" fontWeight="bold">MOBILE</Typography>
                                    </Box>
                                    <Typography variant="body2">{mobile || "N/A"}</Typography>
                                </Box>

                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, color: 'text.secondary' }}>
                                        <AccountBalanceIcon fontSize="small" />
                                        <Typography variant="caption" fontWeight="bold">ACCOUNT NUMBER</Typography>
                                    </Box>
                                    <Typography variant="body2">{account_number || "N/A"}</Typography>
                                </Box>

                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, color: 'text.secondary' }}>
                                        <HomeIcon fontSize="small" />
                                        <Typography variant="caption" fontWeight="bold">ADDRESS</Typography>
                                    </Box>
                                    <Typography variant="body2">{address || "N/A"}</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Right Content - Details */}
                <Grid item size={8}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

                        {/* Communication Officer */}
                        <Card sx={{ boxShadow: 1, borderRadius: 2 }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <AssignmentIndIcon color="primary" />
                                    <Typography variant="h6" fontWeight="bold">Communication Officer</Typography>
                                </Box>
                                <TableContainer component={Paper} elevation={0} variant="outlined">
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Name</TableCell>
                                                <TableCell>Nickname</TableCell>
                                                <TableCell>Mobile</TableCell>
                                                <TableCell>Email</TableCell>
                                                <TableCell>Telephone</TableCell>
                                                <TableCell>Extension</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell>{co_name}</TableCell>
                                                <TableCell>{co_nickname}</TableCell>
                                                <TableCell>{co_mobile}</TableCell>
                                                <TableCell>{co_email}</TableCell>
                                                <TableCell>{co_telephone}</TableCell>
                                                <TableCell>{co_extension}</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </Card>

                        {/* Agreement Document */}
                        <Accordion elevation={3}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel1-content"
                                id="panel1-header"
                            >
                                <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PictureAsPdfIcon color="error" />
                                    Agreement Document
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Box sx={{
                                    bgcolor: '#f5f5f5',
                                    borderRadius: 1,
                                    overflow: 'hidden',
                                    border: '1px solid #e0e0e0',
                                    minHeight: '500px'
                                }}>
                                    {loading ? (
                                        <Skeleton variant="rectangular" width="100%" height={500} />
                                    ) : fullAgreementUrl ? (
                                        <object
                                            data={fullAgreementUrl}
                                            type="application/pdf"
                                            width="100%"
                                            height="500px"
                                            style={{ minHeight: '500px' }}
                                        >
                                            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" gap={2} p={3}>
                                                <Typography color="text.secondary">
                                                    Unable to display PDF directly.
                                                </Typography>
                                                <Button
                                                    variant="contained"
                                                    href={fullAgreementUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    Download Agreement
                                                </Button>
                                            </Box>
                                        </object>
                                    ) : (
                                        <Box display="flex" alignItems="center" justifyContent="center" height="500px">
                                            <Typography color="text.secondary">
                                                No agreement document available.
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </AccordionDetails>
                        </Accordion>

                    </Box>
                </Grid>
            </Grid>
        </Container>
    );
}
