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
    TablePagination,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Autocomplete,
    createFilterOptions,
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
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Filter State
    const [merchants, setMerchants] = useState([]);
    const [cardHolders, setCardHolders] = useState([]);
    const [filterMerchant, setFilterMerchant] = useState("");
    const [filterCardHolder, setFilterCardHolder] = useState("");
    const [filterStatus, setFilterStatus] = useState("");

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Load data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoadingTickets(true);
                const [ticketsRes, merchantsRes, holdersRes] = await Promise.all([
                    fetch("http://localhost:5000/service-tickets"),
                    fetch("http://localhost:5000/merchants"),
                    fetch("http://localhost:5000/card-holders")
                ]);

                if (!ticketsRes.ok) throw new Error("Failed to fetch tickets");
                const ticketsData = await ticketsRes.json();
                setTickets(ticketsData);
                setFilteredTickets(ticketsData);

                if (merchantsRes.ok) setMerchants(await merchantsRes.json());
                if (holdersRes.ok) setCardHolders(await holdersRes.json());

            } catch (err) {
                toast.error("Error loading data", {
                    description: err.message,
                });
            } finally {
                setLoadingTickets(false);
            }
        };
        fetchData();
    }, []);
    // Handle search
    // Handle filters
    useEffect(() => {
        const lowerTerm = searchTerm.toLowerCase();
        const filtered = tickets.filter((ticket) => {
            // 1. Text Search
            const matchesSearch = !searchTerm || (
                ticket.id?.toString().includes(lowerTerm) ||
                ticket.cardHolder?.name?.toLowerCase().includes(lowerTerm) ||
                ticket.cardHolder?.email?.toLowerCase().includes(lowerTerm) ||
                ticket.cardHolder?.mobile?.toLowerCase().includes(lowerTerm) ||
                ticket.merchant?.name?.toLowerCase().includes(lowerTerm) ||
                ticket.merchant?.email?.toLowerCase().includes(lowerTerm) ||
                ticket.merchant?.mobile?.toLowerCase().includes(lowerTerm) ||
                ticket.merchant?.co_name?.toLowerCase().includes(lowerTerm) ||
                ticket.merchant?.co_email?.toLowerCase().includes(lowerTerm) ||
                ticket.merchant?.co_mobile?.toLowerCase().includes(lowerTerm)
            );

            // 2. Dropdown Filters
            const matchesMerchant = !filterMerchant || ticket.merchant?.id === filterMerchant;
            const matchesCardHolder = !filterCardHolder || ticket.cardHolder?.clientID === filterCardHolder;
            const matchesStatus = !filterStatus || ticket.ticketStatus?.toLowerCase() === filterStatus.toLowerCase();

            return matchesSearch && matchesMerchant && matchesCardHolder && matchesStatus;
        });

        setFilteredTickets(filtered);
        setPage(0); // Reset pagination on filter change
    }, [searchTerm, filterMerchant, filterCardHolder, filterStatus, tickets]);

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
    const meetGreetTickets = tickets.filter((ticket) => ticket?.serviceType === "meet-and-greet");
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
                            📋 Meet & Greet Service Tickets
                        </Typography>
                        <Typography variant="body2" sx={{ color: "gray", mt: 0.5 }}>
                            Manage and track all meet & greet service tickets
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
                        {meetGreetTickets.length} Tickets
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
                        onClick={() => router.push("/meet-greet/generate-service-ticket")}
                    >
                        Generate A New Ticket
                    </Button>
                </Box>
            </Box>

            {/* Filters Section */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    {/* Search Field */}
                    <Grid item size={3}>
                        <TextField
                            fullWidth
                            placeholder="Search (ID, Names, Emails, Mobiles)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            size="small"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search size={18} color="gray" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>

                    {/* Merchant Filter */}
                    <Grid item size={3}>
                        <Autocomplete
                            options={merchants}
                            getOptionLabel={(option) => `${option.name} (${option.mobile})`}
                            filterOptions={createFilterOptions({
                                limit: 5,
                                stringify: (option) => `${option.name} ${option.email} ${option.mobile} ${option.id}`,
                            })}
                            value={merchants.find(m => m.id === filterMerchant) || null}
                            onChange={(event, newValue) => {
                                setFilterMerchant(newValue ? newValue.id : "");
                            }}
                            renderInput={(params) => (
                                <TextField {...params} label="Filter by Merchant" size="small" placeholder="Name, Email, Phone, ID" />
                            )}
                            renderOption={(props, option) => {
                                const { key, ...otherProps } = props;
                                return (
                                    <li key={key} {...otherProps}>
                                        <Box>
                                            <Typography variant="body2" fontWeight="bold">{option.name}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {option.mobile} | {option.email}
                                            </Typography>
                                        </Box>
                                    </li>
                                )
                            }}
                        />
                    </Grid>

                    {/* CardHolder Filter */}
                    <Grid item size={3}>
                        <Autocomplete
                            options={cardHolders}
                            getOptionLabel={(option) => `${option.name} (${option.mobile})`}
                            filterOptions={createFilterOptions({
                                limit: 5,
                                stringify: (option) => `${option.name} ${option.email} ${option.mobile} ${option.clientID}`,
                            })}
                            value={cardHolders.find(ch => ch.clientID === filterCardHolder) || null}
                            onChange={(event, newValue) => {
                                setFilterCardHolder(newValue ? newValue.clientID : "");
                            }}
                            renderInput={(params) => (
                                <TextField {...params} label="Filter by CardHolder" size="small" placeholder="Name, Email, Phone, ID" />
                            )}
                            renderOption={(props, option) => {
                                const { key, ...otherProps } = props;
                                return (
                                    <li key={key} {...otherProps}>
                                        <Box>
                                            <Typography variant="body2" fontWeight="bold">{option.name}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {option.mobile} | {option.email}
                                            </Typography>
                                        </Box>
                                    </li>
                                )
                            }}
                        />
                    </Grid>

                    {/* Status Filter */}
                    <Grid item size={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={filterStatus}
                                label="Status"
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <MenuItem value=""><em>All</em></MenuItem>
                                <MenuItem value="pending">Pending</MenuItem>
                                <MenuItem value="completed">Completed</MenuItem>
                                <MenuItem value="cancelled">Cancelled</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>

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
                                    Customer Mobile
                                </TableCell>
                                <TableCell sx={{ fontWeight: "bold", color: "#333" }}>
                                    Merchant
                                </TableCell>
                                <TableCell sx={{ fontWeight: "bold", color: "#333" }}>
                                    Communication Officer
                                </TableCell>
                                <TableCell sx={{ fontWeight: "bold", color: "#333" }}>
                                    Contact Merchant
                                </TableCell>

                                <TableCell sx={{ fontWeight: "bold", color: "#333" }}>
                                    Status
                                </TableCell>
                                <TableCell sx={{ fontWeight: "bold", color: "#333" }}>
                                    Change Status
                                </TableCell>
                                <TableCell sx={{ fontWeight: "bold", color: "#333" }} align="center">
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredTickets.length > 0 ? (
                                filteredTickets
                                    .filter((ticket) => ticket.serviceType === "meet-and-greet")
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((ticket) => (
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
                                            <TableCell>{ticket.cardHolder.mobile}</TableCell>
                                            <TableCell>{ticket.merchant.name}</TableCell>
                                            <TableCell>{ticket.merchant.co_name}</TableCell>
                                            <TableCell>{ticket.merchant.co_mobile}</TableCell>

                                            <TableCell>
                                                <Chip
                                                    label={getStatusLabel(ticket.ticketStatus)}
                                                    color={getStatusColor(ticket.ticketStatus)}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <select
                                                    name="ticketStatus"
                                                    className="border border-gray-300 px-2 py-1 rounded"
                                                    value={ticket.ticketStatus}
                                                    onChange={async (e) => {
                                                        const newStatus = e.target.value;
                                                        try {
                                                            const response = await fetch(`http://localhost:5000/service-tickets/${ticket.id}`, {
                                                                method: "PUT",
                                                                headers: { "Content-Type": "application/json" },
                                                                body: JSON.stringify({ ticketStatus: newStatus }),
                                                            });
                                                            if (!response.ok) throw new Error("Failed to update status");

                                                            // Update local state
                                                            const updatedTickets = tickets.map(t =>
                                                                t.id === ticket.id ? { ...t, ticketStatus: newStatus } : t
                                                            );
                                                            setTickets(updatedTickets);
                                                            setFilteredTickets(updatedTickets); // Also update filtered list to reflect immediately
                                                            toast.success("Status updated to " + newStatus);
                                                        } catch (err) {
                                                            toast.error("Update failed", { description: err.message });
                                                        }
                                                    }}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="completed">Completed</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                            </TableCell>
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
                <TablePagination
                    rowsPerPageOptions={[10, 20, 50, 100]}
                    component="div"
                    count={filteredTickets.filter((ticket) => ticket.serviceType === "meet-and-greet").length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
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
                                                                <Typography variant="subtitle2" color="#ed6c02" fontWeight="bold">Meet-up Date</Typography>
                                                            </Box>
                                                            <Typography variant="body2" fontWeight="500">
                                                                {formatDate(selectedTicket.meetDateTime)}
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                    {/* <Grid item size={6}>
                                                        <Box sx={{ p: 1.5, bgcolor: "#e8f5e9", borderRadius: 2, border: "1px solid #c8e6c9" }}>
                                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                                                <Calendar size={16} color="#2e7d32" />
                                                                <Typography variant="subtitle2" color="#2e7d32" fontWeight="bold">Drop-off</Typography>
                                                            </Box>
                                                            <Typography variant="body2" fontWeight="500">
                                                                {formatDate(selectedTicket.dropoffDateTime)}
                                                            </Typography>
                                                        </Box>
                                                    </Grid> */}
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
