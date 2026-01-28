"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Paper,
    Divider,
    IconButton,
    InputAdornment,
} from "@mui/material";
import { ArrowLeft, Search, Eye, Download, Calendar, MapPin, CreditCard, Package, User, DollarSign, Clock, FileText, CheckCircle2, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { MobileFriendly } from "@mui/icons-material";

// Status color mapping
const getStatusColor = (status) => {
    const statusColors = {
        pending: "warning",
        approved: "info",
        assigned: "primary",
        "picked-up": "secondary", // Changed to secondary for distinction
        delivered: "success",
    };
    return statusColors[status] || "default";
};

// Status label mapping
const getStatusLabel = (status) => {
    const labels = {
        pending: "Pending",
        approved: "Approved",
        assigned: "Assigned", // Fixed typo: was "Canceled" for assigned
        "picked-up": "Picked Up",
        delivered: "Complete",
    };
    return labels[status] || status;
};

export default function AllServiceTickets() {
    const router = useRouter();
    const [tickets, setTickets] = useState([]);
    const [filteredTickets, setFilteredTickets] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [openDetails, setOpenDetails] = useState(false);
    const [loadingTickets, setLoadingTickets] = useState(true);

    // Mock data - Replace with API call
    const mockTickets = [
        {
            id: "TKT-001",
            cardHolderName: "John Doe",
            cardNumber: "****-****-****-1234",
            merchantName: "ABC Dry Cleaning",
            serviceName: "Dry Cleaning",
            serviceCharge: 20.0,
            pickupDateTime: "2024-01-18T10:00",
            dropoffDateTime: "2024-01-18T14:00",
            pickupAddress: "123 Main St, City",
            specialInstructions: "Handle with care",
            paymentStatus: "bill-to-card",
            ticketStatus: "pending",
            createdAt: "2024-01-18T09:00:00Z",
        },
        {
            id: "TKT-002",
            cardHolderName: "Jane Smith",
            cardNumber: "****-****-****-5678",
            merchantName: "XYZ Auto Repair",
            serviceName: "Oil Change",
            serviceCharge: 35.0,
            pickupDateTime: "2024-01-18T09:00",
            dropoffDateTime: "2024-01-18T11:00",
            pickupAddress: "456 Oak Ave, City",
            specialInstructions: "Check tire pressure too",
            paymentStatus: "prepaid",
            ticketStatus: "assigned",
            createdAt: "2024-01-18T08:30:00Z",
        },
        {
            id: "TKT-003",
            cardHolderName: "Mike Johnson",
            cardNumber: "****-****-****-9101",
            merchantName: "Tech Repair Shop",
            serviceName: "Screen Repair",
            serviceCharge: 75.0,
            pickupDateTime: "2024-01-17T15:00",
            dropoffDateTime: "2024-01-17T17:00",
            pickupAddress: "789 Pine Rd, City",
            specialInstructions: "iPhone 13 screen",
            paymentStatus: "pay-on-pickup",
            ticketStatus: "delivered",
            createdAt: "2024-01-17T14:00:00Z",
        },
    ];

    // Load tickets
    useEffect(() => {
        const fetchTickets = async () => {
            try {
                setLoadingTickets(true);
                const response = await fetch("http://localhost:5000/service-tickets");
                if (!response.ok) throw new Error("Failed to fetch tickets");
                const data = await response.json();
                setTickets(data);
                setFilteredTickets(data);
            } catch (err) {
                toast.error("Error loading tickets", {
                    description: err.message,
                });
            } finally {
                setLoadingTickets(false);
            }
        };
        fetchTickets();
    }, []);
    console.log("All tickets: ", tickets);
    // Handle search
    useEffect(() => {
        const filtered = tickets.filter(
            (ticket) =>
                ticket?.id ||
                ticket?.cardHolder?.name ||
                ticket?.merchant?.name
        );
        setFilteredTickets(filtered);
    }, [searchTerm, tickets]);

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch {
            return dateString;
        }
    };

    const handleViewDetails = (ticket) => {
        setSelectedTicket(ticket);
        setOpenDetails(true);
        console.log("Selected ticket: ", ticket);
    };

    const handleCloseDetails = () => {
        setOpenDetails(false);
        setSelectedTicket(null);
    };

    const handleExportTicket = (ticket) => {
        const ticketData = JSON.stringify(ticket, null, 2);
        const blob = new Blob([ticketData], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${ticket.id}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Ticket exported successfully");
    };
    const pickDropTickets = tickets.filter((ticket) => ticket?.serviceType === "pick-and-drop");
    return (
        <Box sx={{ p: 3, maxWidth: "1400px", mx: "auto", backgroundColor: "#fafafa", minHeight: "100vh" }}>
            {/* Header */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <IconButton
                        onClick={() => router.back()}
                        sx={{
                            backgroundColor: "#f0f0f0",
                            "&:hover": { backgroundColor: "#e0e0e0" },
                        }}
                    >
                        <ArrowLeft size={20} />
                    </IconButton>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: "bold", color: "#667eea" }}>
                            📋 Pick & Drop Service Tickets
                        </Typography>
                        <Typography variant="body2" sx={{ color: "gray", mt: 0.5 }}>
                            Manage and track all service tickets
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography
                        variant="h6"
                        sx={{
                            backgroundColor: "#667eea",
                            color: "white",
                            px: 3,
                            py: 1,
                            borderRadius: 2,
                            fontWeight: "bold",
                        }}
                    >
                        {pickDropTickets.length} Tickets
                    </Typography>
                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: "#667eea",
                            color: "white",
                            px: 3,
                            py: 1.5,
                            borderRadius: 2,
                            fontWeight: "bold",
                        }}
                        onClick={() => router.push("/pick-drop/generate-service-ticket")}
                    >
                        Generate A New Ticket
                    </Button>
                </Box>
            </Box>

            {/* Search Bar */}
            <Box sx={{ mb: 3 }}>
                <TextField
                    fullWidth
                    placeholder="Search by Ticket ID, Customer Name, or Merchant..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    variant="outlined"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search size={20} color="gray" />
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        backgroundColor: "white",
                        borderRadius: 1,
                        "& .MuiOutlinedInput-root": {
                            "&:hover fieldset": {
                                borderColor: "#667eea",
                            },
                            "&.Mui-focused fieldset": {
                                borderColor: "#667eea",
                            },
                        },
                    }}
                />
            </Box>

            {/* Tickets Table */}
            <Card sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                <TableContainer component={Paper} sx={{ backgroundColor: "white" }}>
                    <Table>
                        <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: "bold", color: "#333" }}>
                                    Ticket ID
                                </TableCell>
                                <TableCell sx={{ fontWeight: "bold", color: "#333" }}>
                                    Customer
                                </TableCell>
                                <TableCell sx={{ fontWeight: "bold", color: "#333" }}>
                                    Merchant
                                </TableCell>


                                <TableCell sx={{ fontWeight: "bold", color: "#333" }}>
                                    Status
                                </TableCell>
                                {/* <TableCell sx={{ fontWeight: "bold", color: "#333" }}>
                                    Payment
                                </TableCell> */}
                                <TableCell sx={{ fontWeight: "bold", color: "#333" }} align="center">
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tickets.length > 0 ? (
                                tickets.filter((ticket) => ticket.serviceType === "pick-and-drop").map((ticket) => (
                                    <TableRow
                                        key={ticket.id}
                                        sx={{
                                            "&:hover": { backgroundColor: "#f9f9f9" },
                                            borderBottom: "1px solid #e0e0e0",
                                        }}
                                    >
                                        <TableCell sx={{ fontWeight: 600, color: "#667eea" }}>
                                            {ticket.id}
                                        </TableCell>
                                        <TableCell>{ticket.cardHolder.name}</TableCell>
                                        <TableCell>{ticket.merchant.name}</TableCell>
                                        {/* <TableCell>{ticket?.serviceName}</TableCell> */}
                                        {/* <TableCell align="right" sx={{ fontWeight: 600 }}>
                                            ${ticket.serviceCharge.toFixed(2)}
                                        </TableCell> */}
                                        <TableCell>
                                            <Chip
                                                label={getStatusLabel(ticket.ticketStatus)}
                                                color={getStatusColor(ticket.ticketStatus)}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        {/* <TableCell>
                                            <Typography variant="caption" sx={{ fontWeight: 500 }}>
                                                {ticket.paymentStatus === "prepaid"
                                                    ? "Pre-paid"
                                                    : ticket.paymentStatus === "pay-on-pickup"
                                                    ? "Pay on Pickup"
                                                    : "Bill to Card"}
                                            </Typography>
                                        </TableCell> */}
                                        <TableCell align="center">
                                            <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={<Eye size={16} />}
                                                    onClick={() => handleViewDetails(ticket)}
                                                    sx={{
                                                        textTransform: "none",
                                                        color: "#667eea",
                                                        borderColor: "#667eea",
                                                        "&:hover": {
                                                            backgroundColor: "#f0f3ff",
                                                        },
                                                    }}
                                                >
                                                    Details
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="text"
                                                    startIcon={<Download size={16} />}
                                                    onClick={() => handleExportTicket(ticket)}
                                                    sx={{
                                                        textTransform: "none",
                                                        color: "#666",
                                                    }}
                                                >
                                                    Export
                                                </Button>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                        <Typography sx={{ color: "gray" }}>
                                            {searchTerm
                                                ? "No tickets found matching your search"
                                                : "No service tickets yet"}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>

            {/* Ticket Details Dialog */}
            <Dialog
                open={openDetails}
                onClose={handleCloseDetails}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3, overflow: 'hidden' }
                }}
            >
                {selectedTicket && (
                    <>
                        <Box sx={{
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            color: "white",
                            p: 3,
                            position: "relative"
                        }}>
                            <IconButton
                                onClick={handleCloseDetails}
                                sx={{
                                    position: "absolute",
                                    right: 16,
                                    top: 16,
                                    color: "white",
                                    bgcolor: "rgba(255,255,255,0.2)",
                                    '&:hover': { bgcolor: "rgba(255,255,255,0.3)" }
                                }}
                            >
                                <ArrowLeft size={20} />
                            </IconButton>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                                <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                                    TID-{selectedTicket.id}
                                </Typography>
                                <Chip
                                    icon={<CheckCircle2 size={14} color="white" />}
                                    label={getStatusLabel(selectedTicket.ticketStatus)}
                                    sx={{
                                        bgcolor: "rgba(255,255,255,0.2)",
                                        color: "white",
                                        fontWeight: "bold",
                                        border: "1px solid rgba(255,255,255,0.3)",
                                        '& .MuiChip-icon': { color: 'white' }
                                    }}
                                    size="small"
                                />
                            </Box>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                Created on {formatDate(selectedTicket.createdAt)}
                            </Typography>
                        </Box>

                        <DialogContent sx={{ p: 0, bgcolor: "#f9fafe" }}>
                            <Box sx={{ p: 3 }}>
                                <Grid container spacing={3}>

                                    {/* 1. Service Details Card */}
                                    <Grid item size={4}>
                                        <Card sx={{ height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: 2 }}>
                                            <CardHeader
                                                title={
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                                        <Package color="#667eea" size={20} />
                                                        <Typography variant="h6" fontWeight="bold" color="#333">Service Details</Typography>
                                                    </Box>
                                                }
                                                sx={{ pb: 1, borderBottom: '1px solid #f0f0f0' }}
                                            />
                                            <CardContent sx={{ pt: 2 }}>
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>Merchant</Typography>
                                                    <Typography variant="subtitle1" fontWeight="500">{selectedTicket?.merchant?.name}</Typography>
                                                </Box>
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>Service Requested</Typography>
                                                    <Typography variant="subtitle1" fontWeight="500">Pick & Drop</Typography>
                                                </Box>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>Estimated Charge</Typography>
                                                        <Typography variant="h6" fontWeight="bold" color="primary.main">
                                                            ${selectedTicket?.merchant?.service_charge}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    {/* 2. Customer Details Card */}
                                    <Grid item size={4}>
                                        <Card sx={{ height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: 2 }}>
                                            <CardHeader
                                                title={
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                                        <User color="#667eea" size={20} />
                                                        <Typography variant="h6" fontWeight="bold" color="#333">Customer Info</Typography>
                                                    </Box>
                                                }
                                                sx={{ pb: 1, borderBottom: '1px solid #f0f0f0' }}
                                            />
                                            <CardContent sx={{ pt: 2 }}>
                                                <Box sx={{ display: "flex", alignItems: "start", gap: 2, mb: 2.5 }}>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>Full Name</Typography>
                                                        <Typography variant="subtitle1" fontWeight="500">{selectedTicket.cardHolder?.name}</Typography>
                                                    </Box>
                                                </Box>
                                                <Box sx={{ display: "flex", alignItems: "start", gap: 2 }}>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>Card Number</Typography>
                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                            <CreditCard size={18} color="gray" />
                                                            <Typography variant="body2">{selectedTicket.cardHolder?.card_number}</Typography>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                                <Box sx={{ display: "flex", alignItems: "start", gap: 2 }}>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>Email</Typography>
                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                            <Mail size={18} color="gray" />
                                                            <Typography variant="body2">{selectedTicket.cardHolder?.email}</Typography>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                                <Box sx={{ display: "flex", alignItems: "start", gap: 2 }}>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>Mobile</Typography>
                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                            <Phone size={18} color="gray" />
                                                            <Typography variant="body2">{selectedTicket.cardHolder?.mobile}</Typography>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    {/* 3. Schedule & Logistics Card */}
                                    <Grid item size={4}>
                                        <Card sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: 2 }}>
                                            <CardHeader
                                                title={
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                                        <Clock color="#667eea" size={20} />
                                                        <Typography variant="h6" fontWeight="bold" color="#333">Logistics & Schedule</Typography>
                                                    </Box>
                                                }
                                                sx={{ pb: 1, borderBottom: '1px solid #f0f0f0' }}
                                            />
                                            <CardContent sx={{ pt: 2 }}>
                                                <Grid container spacing={3}>
                                                    <Grid item size={6}>
                                                        <Box sx={{ p: 1.5, bgcolor: "#fff4e5", borderRadius: 2, border: "1px solid #ffe0b2" }}>
                                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                                                <Calendar size={16} color="#ed6c02" />
                                                                <Typography variant="subtitle2" color="#ed6c02" fontWeight="bold">Pick-up</Typography>
                                                            </Box>
                                                            <Typography variant="body2" fontWeight="500">
                                                                {formatDate(selectedTicket.pickupDateTime)}
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                    <Grid item size={6}>
                                                        <Box sx={{ p: 1.5, bgcolor: "#e8f5e9", borderRadius: 2, border: "1px solid #c8e6c9" }}>
                                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                                                <Calendar size={16} color="#2e7d32" />
                                                                <Typography variant="subtitle2" color="#2e7d32" fontWeight="bold">Drop-off</Typography>
                                                            </Box>
                                                            <Typography variant="body2" fontWeight="500">
                                                                {formatDate(selectedTicket.dropoffDateTime)}
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                    <Grid item xs={12} md={4}>
                                                        <Box sx={{ p: 1.5, bgcolor: "#e3f2fd", borderRadius: 2, border: "1px solid #bbdefb" }}>
                                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                                                <DollarSign size={16} color="#0288d1" />
                                                                <Typography variant="subtitle2" color="#0288d1" fontWeight="bold">Payment</Typography>
                                                            </Box>
                                                            <Typography variant="body2" fontWeight="500" sx={{ textTransform: "capitalize" }}>
                                                                {selectedTicket.paymentStatus?.replace(/-/g, " ")}
                                                            </Typography>
                                                        </Box>
                                                    </Grid>

                                                    <Grid item xs={12}>
                                                        <Box sx={{ mt: 1 }}>
                                                            <Box sx={{ display: "flex", gap: 1.5, mb: 1 }}>
                                                                <MapPin size={18} color="#667eea" style={{ marginTop: 2 }} />
                                                                <Box>
                                                                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0 }}>Pick-up / Drop-off Address</Typography>
                                                                    <Typography variant="body1">{selectedTicket.pickupAddress}</Typography>
                                                                </Box>
                                                            </Box>
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    {/* 4. Instructions Card */}
                                    {selectedTicket.specialInstructions && (
                                        <Grid item xs={12}>
                                            <Card sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: 2, bgcolor: "#fff" }}>
                                                <CardContent sx={{ py: 2 }}>
                                                    <Box sx={{ display: "flex", gap: 2 }}>
                                                        <FileText size={20} color="#667eea" />
                                                        <Box>
                                                            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.5 }}>Special Instructions</Typography>
                                                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                                                                "{selectedTicket.specialInstructions}"
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    )}

                                </Grid>
                            </Box>
                        </DialogContent>

                        <DialogActions sx={{ p: 2.5, bgcolor: "white", borderTop: "1px solid #f0f0f0" }}>
                            <Button
                                onClick={handleCloseDetails}
                                variant="contained"
                                sx={{
                                    px: 4,
                                    py: 1,
                                    borderRadius: 2,
                                    bgcolor: "#667eea",
                                    textTransform: "none",
                                    fontWeight: "bold",
                                    '&:hover': { bgcolor: "#5a6fd6" }
                                }}
                            >
                                Close Details
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
}
