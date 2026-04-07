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
    Alert
} from "@mui/material";
import StoreIcon from "@mui/icons-material/Store";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CampaignIcon from "@mui/icons-material/Campaign";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { toast } from "sonner";

export default function CardHolderProfile() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;

    const [holder, setHolder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHolder = async () => {
            if (!id) return;
            try {
                // Fetching all holders and filtering because the single ID endpoint might differ or not exist as simpler standard
                // Also inspected the list endpoint primarily.
                // Optimistically trying /card-holders/${id} first, if fails, fallback?
                // Based on merchant pattern, let's try direct fetch.
                const response = await fetch(`http://localhost:5000/pick-drop/all-holders/${id}`);
                if (!response.ok) {
                    // Fallback check if it's because api structure is different
                    throw new Error("Failed to fetch card holder details");
                }
                const data = await response.json();
                setHolder(data);
            } catch (err) {
                console.error(err);
                setError(err.message);
                toast.error("Error", { description: err.message });
            } finally {
                setLoading(false);
            }
        };

        fetchHolder();
    }, [id]);

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !holder) {
        return (
            <Container sx={{ mt: 4 }}>
                <Typography variant="h5" color="error" sx={{ mt: 2 }}>
                    {error || "Card Holder not found"}
                </Typography>
            </Container>
        );
    }

    // Adapt fields based on inspection
    const name = holder.name || holder.fullName || "N/A";
    const email = holder.email || "N/A";
    const mobile = holder.mobile || holder.mobileNumber || "N/A";
    const cardNumber = holder.card_number || "N/A";
    const address = holder.address || "N/A";
    // Agreement - typically null for holders unless specified, we check for it
    const agreement_paper = holder.agreement_paper;

    const isPdf = typeof agreement_paper === 'string' && agreement_paper.toLowerCase().endsWith(".pdf");

    return (
        <Container maxWidth={'xl'} sx={{ py: 4 }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" fontWeight="bold" className="text-black">Card Holder Profile</Typography>
                <Typography variant="body2" color="text.secondary">ID: {id}</Typography>
            </Box>

            <Grid container spacing={2}>
                {/* Left Sidebar - Profile Info */}
                <Grid item size={4}>
                    <Card sx={{ height: '100%', boxShadow: 1, borderRadius: 2 }}>
                        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', pt: 4 }}>
                            <Avatar sx={{ width: 80, height: 80, bgcolor: '#1976d2', fontSize: 32, mb: 2 }}>
                                {name?.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant="h6" fontWeight="bold">{name}</Typography>
                            <Chip label="card holder" size="small" sx={{ bgcolor: '#1976d2', color: 'white', mt: 1, mb: 4 }} />

                            <Box sx={{ width: '100%', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, color: 'text.secondary' }}>
                                        <EmailIcon fontSize="small" />
                                        <Typography variant="caption" fontWeight="bold">EMAIL</Typography>
                                    </Box>
                                    <Typography variant="body2">{email}</Typography>
                                </Box>

                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, color: 'text.secondary' }}>
                                        <PhoneIcon fontSize="small" />
                                        <Typography variant="caption" fontWeight="bold">MOBILE</Typography>
                                    </Box>
                                    <Typography variant="body2">{mobile}</Typography>
                                </Box>

                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, color: 'text.secondary' }}>
                                        <CreditCardIcon fontSize="small" />
                                        <Typography variant="caption" fontWeight="bold">CARD NUMBER</Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{cardNumber}</Typography>
                                </Box>

                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, color: 'text.secondary' }}>
                                        <HomeIcon fontSize="small" />
                                        <Typography variant="caption" fontWeight="bold">ADDRESS</Typography>
                                    </Box>
                                    <Typography variant="body2">{address}</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Right Content - Details */}
                <Grid item size={8}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

                        {/* Status / Officer */}

                        {/* Service Limits */}
                        <Card sx={{ boxShadow: 1, borderRadius: 2 }}>
                            <CardContent>
                                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Service Limits</Typography>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Paper elevation={0} variant="outlined" sx={{ flex: 1, p: 2, textAlign: 'center', bgcolor: '#e3f2fd', borderColor: '#bbdefb' }}>
                                        <Typography variant="h4" color="primary.main" fontWeight="bold">
                                            {holder.pick_limit ?? 0}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" fontWeight="medium">
                                            Pick Limit
                                        </Typography>
                                    </Paper>
                                    <Paper elevation={0} variant="outlined" sx={{ flex: 1, p: 2, textAlign: 'center', bgcolor: '#e8f5e9', borderColor: '#c8e6c9' }}>
                                        <Typography variant="h4" color="success.main" fontWeight="bold">
                                            {holder.meet_limit ?? 0}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" fontWeight="medium">
                                            Meet Limit
                                        </Typography>
                                    </Paper>
                                    <Paper elevation={0} variant="outlined" sx={{ flex: 1, p: 2, textAlign: 'center', bgcolor: '#fff8e1', borderColor: '#ffecb3' }}>
                                        <Typography variant="h4" color="warning.main" fontWeight="bold">
                                            {holder.lounge_limit ?? 0}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" fontWeight="medium">
                                            Lounge Limit
                                        </Typography>
                                    </Paper>
                                </Box>
                            </CardContent>
                        </Card>

                        {/* Recent Activity / Campaigns */}
                        <Card sx={{ boxShadow: 1, borderRadius: 2 }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <CampaignIcon color="secondary" />
                                    <Typography variant="h6" fontWeight="bold">Service History</Typography>
                                </Box>

                                <TableContainer component={Paper} elevation={0} variant="outlined">
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Type</TableCell>
                                                <TableCell>Merchant</TableCell>
                                                <TableCell>Date & Time</TableCell>
                                                <TableCell>Payment</TableCell>
                                                <TableCell>Status</TableCell>
                                                <TableCell>Created At</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {holder.serviceTicket && holder.serviceTicket.length > 0 ? (
                                                holder.serviceTicket.map((ticket, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>
                                                            <Chip label={ticket.serviceType || "Unknown"} size="small" color="info" variant="outlined" />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <StoreIcon fontSize="small" color="action" />
                                                                {ticket.merchant?.name || "Unknown"}
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell>
                                                            {ticket.pickupDateTime ? new Date(ticket.pickupDateTime).toLocaleString() : 
                                                             (ticket.meetDateTime ? new Date(ticket.meetDateTime).toLocaleString() : "N/A")}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={ticket.paymentStatus || "unpaid"}
                                                                size="small"
                                                                color={(ticket.paymentStatus || "").toLowerCase() === 'paid' ? 'success' : 'default'}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={ticket.ticketStatus || "pending"}
                                                                size="small"
                                                                variant="outlined"
                                                                color={(ticket.ticketStatus || "").toLowerCase() === 'pending' ? 'warning' : 'primary'}
                                                            />
                                                        </TableCell>
                                                        <TableCell>{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={6} align="center">
                                                        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                                                            No service history found.
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </Card>
                    </Box>
                </Grid>
            </Grid>
        </Container>
    );
}
