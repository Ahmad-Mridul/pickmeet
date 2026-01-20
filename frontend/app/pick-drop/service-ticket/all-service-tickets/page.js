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
import { ArrowLeft, Search, Eye, Download } from "lucide-react";
import { toast } from "sonner";

// Status color mapping
const getStatusColor = (status) => {
    const statusColors = {
        pending: "warning",
        approved: "info",
        assigned: "primary",
        "picked-up": "success",
        delivered: "success",
    };
    return statusColors[status] || "default";
};

// Status label mapping
const getStatusLabel = (status) => {
    const labels = {
        pending: "Pending",
        approved: "Approved",
        assigned: "Canceled",
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
                // TODO: Replace with actual API call
                // const response = await fetch("https://api.reward.smartemi.info/service-tickets");
                // if (!response.ok) throw new Error("Failed to fetch tickets");
                // const data = await response.json();
                // setTickets(data);
                
                setTickets(mockTickets);
                setFilteredTickets(mockTickets);
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

    // Handle search
    useEffect(() => {
        const filtered = tickets.filter(
            (ticket) =>
                ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ticket.cardHolderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ticket.merchantName.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredTickets(filtered);
    }, [searchTerm, tickets]);

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString() + " " + date.toLocaleTimeString();
        } catch {
            return dateString;
        }
    };

    const handleViewDetails = (ticket) => {
        setSelectedTicket(ticket);
        setOpenDetails(true);
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
                        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                            📋 All Service Tickets
                        </Typography>
                        <Typography variant="body2" sx={{ color: "gray", mt: 0.5 }}>
                            Manage and track all service tickets
                        </Typography>
                    </Box>
                </Box>
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
                    {filteredTickets.length} Tickets
                </Typography>
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
                                    Service
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
                            {filteredTickets.length > 0 ? (
                                filteredTickets.map((ticket) => (
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
                                        <TableCell>{ticket.cardHolderName}</TableCell>
                                        <TableCell>{ticket.merchantName}</TableCell>
                                        <TableCell>{ticket.serviceName}</TableCell>
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
            <Dialog open={openDetails} onClose={handleCloseDetails} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ backgroundColor: "#667eea", color: "white", fontWeight: "bold" }}>
                    Ticket Details - {selectedTicket?.id}
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    {selectedTicket && (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            {/* Customer Info */}
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                                    👤 Customer Information
                                </Typography>
                                <Grid container spacing={1}>
                                    <Grid item xs={6}>
                                        <TextField
                                            size="small"
                                            label="Name"
                                            value={selectedTicket.cardHolderName}
                                            fullWidth
                                            disabled
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            size="small"
                                            label="Card Number"
                                            value={selectedTicket.cardNumber}
                                            fullWidth
                                            disabled
                                        />
                                    </Grid>
                                </Grid>
                            </Box>

                            <Divider />

                            {/* Merchant & Service Info */}
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                                    🏪 Service Information
                                </Typography>
                                <Grid container spacing={1}>
                                    <Grid item xs={6}>
                                        <TextField
                                            size="small"
                                            label="Merchant"
                                            value={selectedTicket.merchantName}
                                            fullWidth
                                            disabled
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            size="small"
                                            label="Service"
                                            value={selectedTicket.serviceName}
                                            fullWidth
                                            disabled
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            size="small"
                                            label="Service Charge"
                                            value={`$${selectedTicket.serviceCharge.toFixed(2)}`}
                                            fullWidth
                                            disabled
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            size="small"
                                            label="Status"
                                            value={getStatusLabel(selectedTicket.ticketStatus)}
                                            fullWidth
                                            disabled
                                        />
                                    </Grid>
                                </Grid>
                            </Box>

                            <Divider />

                            {/* Schedule Info */}
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                                    📅 Schedule Information
                                </Typography>
                                <Grid container spacing={1}>
                                    <Grid item xs={12}>
                                        <TextField
                                            size="small"
                                            label="Pick-up Time"
                                            value={formatDate(selectedTicket.pickupDateTime)}
                                            fullWidth
                                            disabled
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            size="small"
                                            label="Drop-off Time"
                                            value={formatDate(selectedTicket.dropoffDateTime)}
                                            fullWidth
                                            disabled
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            size="small"
                                            label="Pick-up Address"
                                            value={selectedTicket.pickupAddress}
                                            fullWidth
                                            disabled
                                            multiline
                                            rows={2}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>

                            <Divider />

                            {/* Additional Info */}
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                                    ℹ️ Additional Information
                                </Typography>
                                <Grid container spacing={1}>
                                    <Grid item xs={6}>
                                        <TextField
                                            size="small"
                                            label="Payment Status"
                                            value={
                                                selectedTicket.paymentStatus === "prepaid"
                                                    ? "Pre-paid"
                                                    : selectedTicket.paymentStatus === "pay-on-pickup"
                                                    ? "Pay on Pickup"
                                                    : "Bill to Card"
                                            }
                                            fullWidth
                                            disabled
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            size="small"
                                            label="Created At"
                                            value={formatDate(selectedTicket.createdAt)}
                                            fullWidth
                                            disabled
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            size="small"
                                            label="Special Instructions"
                                            value={selectedTicket.specialInstructions || "None"}
                                            fullWidth
                                            disabled
                                            multiline
                                            rows={2}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleCloseDetails} variant="contained">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
