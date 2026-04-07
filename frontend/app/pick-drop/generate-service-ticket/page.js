"use client";

import { useEffect, useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import Swal from 'sweetalert2';
import { usePathname, useRouter } from "next/navigation";
import {
    Button,
    TextField,
    Autocomplete,
    Card,
    CardContent,
    CardHeader,
    Grid,
    Box,
    Typography,
    Alert,
} from "@mui/material";

import { Eye, AlertCircle } from "lucide-react";

// Zod schema for Service Ticket form
const serviceTicketSchema = z.object({
    cardHolderId: z.union([z.string(), z.number()]).refine(val => val !== "", "Card Holder is required"),
    merchantId: z.union([z.string(), z.number()]).refine(val => val !== "", "Merchant is required"),
    pickupDateTime: z.string().min(1, "Pick-up date & time is required"),
    dropoffDateTime: z.string().min(1, "Drop-off date & time is required"),
    pickupAddress: z.string().optional(),
    dropoffAddress: z.string().optional(),
    specialInstructions: z.string().optional(),
    paymentStatus: z.enum(["unpaid", "paid"]).default("unpaid"),
    ticketStatus: z.enum(["pending", "completed", "cancelled"]).default("pending"),
    serviceType: z.string().optional()
});

export default function ServiceTicket() {
    const router = useRouter();
    const pathname = usePathname();
    // State for card holders
    const [cardHolders, setCardHolders] = useState([]);
    const [selectedCardHolder, setSelectedCardHolder] = useState(null);
    const [cardHolderDetails, setCardHolderDetails] = useState({
        name: "",
        card_number: "",
        mobile: "",
        email: "",
        card_type: "",
        address: "",
    });
    const [loadingCardHolder, setLoadingCardHolder] = useState(false);

    // State for merchants
    const [merchants, setMerchants] = useState([]);
    const [selectedMerchant, setSelectedMerchant] = useState(null);
    const [merchantDetails, setMerchantDetails] = useState({
        name: "",
        mobile: "",
        contactInfo: "",
        address: "",
        service_charge: "",
        co_name: "",
        co_email: "",
        co_mobile: "",
        co_telephone: "",
        co_extension: ""
    });
    const [services, setServices] = useState([]);
    const [loadingMerchant, setLoadingMerchant] = useState(false);

    // State for pricing
    const [selectedService, setSelectedService] = useState(null);
    const [serviceCharge, setServiceCharge] = useState(0);

    // React Hook Form
    const {
        control,
        watch,
        reset,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(serviceTicketSchema),
        defaultValues: {
            cardHolderId: "",
            merchantId: "",
            pickupDateTime: "",
            dropoffDateTime: "",
            pickupAddress: "",
            dropoffAddress: "",
            specialInstructions: "",
            paymentStatus: "unpaid",
            ticketStatus: "pending",
            serviceType: "pick-and-drop",
        },
    });
    const watchCardHolderId = watch("cardHolderId");
    const watchMerchantId = watch("merchantId");
    const watchServiceId = watch("serviceId");
    const watchUseCardHolderAddress = watch("useCardHolderAddress");

    // Fetch card holders on mount
    useEffect(() => {
        const fetchCardHolders = async () => {
            try {
                const response = await fetch(
                    "http://localhost:5000/card-holders"
                );
                if (!response.ok) throw new Error("Failed to fetch card holders");
                const data = await response.json();
                if (Array.isArray(data)) {
                    setCardHolders(data);
                }
            } catch (err) {
                toast.error("Error fetching card holders", {
                    description: err.message,
                });
            }
        };
        fetchCardHolders();
    }, []);

    // Fetch merchants on mount
    useEffect(() => {
        const fetchMerchants = async () => {
            try {
                const response = await fetch("http://localhost:5000/merchants");
                if (!response.ok) throw new Error("Failed to fetch merchants");
                const data = await response.json();
                if (Array.isArray(data)) {
                    setMerchants(data);
                }
            } catch (err) {
                toast.error("Error fetching merchants", {
                    description: err.message,
                });
            }
        };
        fetchMerchants();
    }, []);

    // Fetch card holder details when selected
    useEffect(() => {
        if (watchCardHolderId && selectedCardHolder) {
            setLoadingCardHolder(true);
            const fetchDetails = async () => {
                try {
                    const response = await fetch(
                        `http://localhost:5000/pick-drop/all-holders/${watchCardHolderId}`
                    );
                    if (!response.ok) throw new Error("Failed to fetch card holder details");
                    const data = await response.json();
                    setCardHolderDetails({
                        name: data.name || data.fullName || "Unknown",
                        card_number: data.card_number || data.cardNumber || "N/A",
                        mobile: data.mobile || data.phone || data.phoneNumber || "N/A",
                        email: data.email || "N/A",
                        card_type: data.card_type || data.cardType || "N/A",
                        address: data.address || "N/A",
                        pick_limit: data.pick_limit ?? 0,
                    });
                } catch (err) {
                    toast.error("Error fetching card holder details", {
                        description: err.message,
                    });
                } finally {
                    setLoadingCardHolder(false);
                }
            };
            fetchDetails();
        }
    }, [watchCardHolderId, selectedCardHolder]);
    console.log(cardHolderDetails.mobile);

    // Fetch merchant details and services when selected
    useEffect(() => {
        if (watchMerchantId && selectedMerchant) {
            setLoadingMerchant(true);
            const fetchDetails = async () => {
                try {
                    const response = await fetch(
                        `http://localhost:5000/merchant/${watchMerchantId}`
                    );
                    if (!response.ok) throw new Error("Failed to fetch merchant details");
                    const data = await response.json();
                    setMerchantDetails({
                        name: data.name || "Unknown",
                        address: data.address || "N/A",
                        mobile: data.mobile || data.phone || data.contactNumber || "N/A",
                        contactInfo: data.mobile || data.phone || data.contactNumber || "N/A",
                        service_charge: data.service_charge || "N/A",
                        co_name: data.co_name || "N/A",
                        co_email: data.co_email || "N/A",
                        co_mobile: data.co_mobile || "N/A",
                        co_telephone: data.co_telephone || "N/A",
                        co_extension: data.co_extension || "N/A",
                    });

                    // Use demo services for now - easily replaceable with API call
                    const demoServices =
                        DEMO_SERVICES[watchMerchantId] ||
                        DEMO_SERVICES.merchant1; // Default to merchant1 services

                    setServices(demoServices);
                    setServiceCharge(0);
                    setSelectedService(null);
                } catch (err) {
                    toast.error("Error fetching merchant details", {
                        description: err.message,
                    });
                } finally {
                    setLoadingMerchant(false);
                }
            };
            fetchDetails();
        }
    }, [watchMerchantId, selectedMerchant]);
    console.log(merchantDetails.co_mobile);
    // Update service charge when service is selected
    useEffect(() => {
        if (watchServiceId) {
            const selected = services.find(
                (s) => (s.id || s.serviceId) === watchServiceId
            );
            if (selected) {
                setSelectedService(selected);
                setServiceCharge(selected.price || 0);
            }
        }
    }, [watchServiceId, services]);

    // Format card holder options with searchable fields
    const cardHolderOptions = useMemo(() => {
        return cardHolders.map((holder) => ({
            id: holder.clientID || holder.customerId || holder.cardHolderId || holder.id,
            label: `${holder.name || holder.fullName || "Unknown"} (${holder.mobile || holder.phone || "N/A"
                })`,
            searchText: `${holder.name || holder.fullName || ""} ${holder.mobile || holder.phone || ""
                }`.toLowerCase(),
            ...holder,
        }));
    }, [cardHolders]);

    // Format merchant options
    const merchantOptions = useMemo(() => {
        return merchants.map((merchant) => ({
            id: merchant.id || merchant.merchantId,
            label: merchant.name || "Unknown",
            ...merchant,
        }));
    }, [merchants]);
    console.log(merchantDetails);
    // Handle form submission
    const onSubmit = async (data) => {
        try {
            const payload = {
                cardHolderId: watchCardHolderId,
                cardHolderDetails,
                merchantId: watchMerchantId,
                merchantDetails,
                serviceType: data.serviceType || "pick-and-drop",
                pickupDateTime: data.pickupDateTime,
                dropoffDateTime: data.dropoffDateTime,
                pickupAddress: data.pickupAddress,
                dropoffAddress: data.dropoffAddress,
                specialInstructions: data.specialInstructions,
                paymentStatus: data.paymentStatus,
                ticketStatus: data.ticketStatus,
                serviceCharge,
                createdAt: new Date().toISOString(),
            };
            console.log(merchantDetails);
            // Send to API
            const response = await fetch("http://localhost:5000/register/service-ticket", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to create service ticket");
            } else {
                if (cardHolderDetails.pick_limit > 0) {
                    await fetch(`http://localhost:5000/card-holders/${watchCardHolderId}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            ...selectedCardHolder,
                            pick_limit: cardHolderDetails.pick_limit - 1
                        })
                    });
                }
                
                Swal.fire({
                    title: "Success!",
                    text: "Service has been created successfully.",
                    icon: "success",
                    confirmButtonText: "Cool"
                });

                // Send SMS
                const holderPhone = `+88${cardHolderDetails.mobile}`
                const merchantPhone = `+88${merchantDetails.mobile}`
                const smsRes = await fetch("http://localhost:5000/send-sms", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        to: holderPhone,
                        message: `Hi ${cardHolderDetails.name}!
Your Pick & Drop service ticket has been created successfully.

Service Provider: ${merchantDetails.name}
Contact: ${merchantDetails.mobile}

Thank you!`,
                    }),
                });

                // Send SMS to merchant
                const merchantSmsRes = await fetch("http://localhost:5000/send-sms", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        to: merchantPhone,
                        message: `Hi ${merchantDetails.name}!
Your have received a new Pick & Drop service ticket.

Card Holder: ${cardHolderDetails.name}
Contact: ${cardHolderDetails.mobile}
Pickup Address: ${data.pickupAddress}
Dropoff Address: ${data.dropoffAddress}
Pickup Date & Time: ${data.pickupDateTime}
Dropoff Date & Time: ${data.dropoffDateTime}

Thank you!`,
                    }),
                });

                const smsData = await smsRes.json();
                const merchantSmsData = await merchantSmsRes.json();

                if (!smsData.success) {
                    console.error("SMS failed:", smsData.error);
                }
                if (!merchantSmsData.success) {
                    console.error("Merchant SMS failed:", merchantSmsData.error);
                }
            }
            reset();
            router.push("/pick-drop/all-service-tickets");
        } catch (err) {
            Swal.fire({
                title: "Error!",
                text: "Error creating service ticket.",
                icon: "error",
                confirmButtonText: "Cool"
            });
        }
    };

    return (
        <Box sx={{ p: 3, backgroundColor: "#fafafa", minHeight: "100vh" }}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={3}>
                    {/* Header Section */}
                    <Grid item size={12}>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                color: "white",
                                p: 3,
                                borderRadius: 2,
                                boxShadow: "0 8px 32px rgba(102, 126, 234, 0.3)",
                            }}
                        >
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: "bold", mb: 0.5 }}>
                                    📋 Pick & Drop Service Ticket Booking
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                    Book pickup and drop-off services from our merchant partners
                                </Typography>
                            </Box>
                            <Button
                                variant="contained"
                                sx={{
                                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                                    color: "white",
                                    border: "2px solid white",
                                    "&:hover": {
                                        backgroundColor: "rgba(255, 255, 255, 0.3)",
                                    },
                                    textTransform: "none",
                                    fontWeight: 600,
                                    display: "flex",
                                    gap: 1,
                                }}
                                onClick={() => router.push("/pick-drop/all-service-tickets")}
                            >
                                <Eye size={20} />
                                View All Tickets
                            </Button>
                        </Box>
                    </Grid>

                    {/* Customer Selection Section */}
                    <Grid item xs={12}>
                        <Card sx={{ borderLeft: "5px solid #667eea" }}>
                            <CardHeader
                                title="👤 Card Holder Information"
                                sx={{
                                    backgroundColor: "#f5f5f5",
                                    borderBottom: "2px solid #667eea",
                                }}
                            />
                            <CardContent>
                                <Grid container spacing={2}>
                                    {/* Card Holder Autocomplete */}
                                    <Grid item size={4}>
                                        <Controller
                                            name="cardHolderId"
                                            control={control}
                                            render={({ field }) => (
                                                <Autocomplete
                                                    {...field}
                                                    options={cardHolderOptions}
                                                    getOptionLabel={(option) =>
                                                        typeof option === "string" ? option : option.label || ""
                                                    }
                                                    onChange={(event, value) => {
                                                        field.onChange(value?.id || "");
                                                        setSelectedCardHolder(value);
                                                    }}
                                                    value={selectedCardHolder}
                                                    loading={loadingCardHolder}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            label="Select Card Holder"
                                                            placeholder="Search by name or phone..."
                                                            error={!!errors.cardHolderId}
                                                            helperText={
                                                                errors.cardHolderId?.message ||
                                                                "Type name or phone number"
                                                            }
                                                        />
                                                    )}
                                                    noOptionsText="No card holders found"
                                                    filterOptions={(options, state) => {
                                                        const searchTerm = state.inputValue.toLowerCase();
                                                        return options.filter((option) =>
                                                            option.searchText.includes(searchTerm)
                                                        );
                                                    }}
                                                />
                                            )}
                                        />
                                    </Grid>

                                    {/* Card Number (Read-only) */}
                                    <Grid item size={4}>
                                        <TextField
                                            label="Card Number"
                                            value={cardHolderDetails.card_number}
                                            fullWidth
                                            disabled
                                            variant="outlined"
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    backgroundColor: "#f9f9f9",
                                                },
                                            }}
                                        />
                                    </Grid>

                                    {/* Phone Number (Read-only) */}
                                    <Grid item size={4}>
                                        <TextField
                                            label="Phone Number"
                                            value={cardHolderDetails.mobile}
                                            fullWidth
                                            disabled
                                            variant="outlined"
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    backgroundColor: "#f9f9f9",
                                                },
                                            }}
                                        />
                                    </Grid>

                                    {/* Email Address (Read-only) */}
                                    <Grid item size={8}>
                                        <TextField
                                            label="Email Address"
                                            value={cardHolderDetails.email}
                                            fullWidth
                                            disabled
                                            variant="outlined"
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    backgroundColor: "#f9f9f9",
                                                },
                                            }}
                                        />
                                    </Grid>

                                    {/* Card Type (Read-only) */}
                                    <Grid item size={4}>
                                        <TextField
                                            label="Card Type"
                                            value={cardHolderDetails.card_type}
                                            fullWidth
                                            disabled
                                            variant="outlined"
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    backgroundColor: "#f9f9f9",
                                                },
                                            }}
                                        />
                                    </Grid>

                                    {/* Address (Read-only) */}
                                    <Grid item size={12}>
                                        <TextField
                                            label="Address"
                                            value={cardHolderDetails.address}
                                            fullWidth
                                            disabled
                                            variant="outlined"
                                            multiline
                                            rows={2}
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    backgroundColor: "#f9f9f9",
                                                },
                                            }}
                                        />
                                    </Grid>
                                    
                                    {/* Alert for 0 limit */}
                                    {selectedCardHolder && cardHolderDetails.pick_limit === 0 && (
                                        <Grid item size={12}>
                                            <div className="mt-2 p-5 rounded-xl border-2 border-red-500 bg-red-50 shadow-[0_4px_20px_rgba(239,68,68,0.3)] relative overflow-hidden flex items-start gap-4">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500 opacity-10 rounded-full blur-2xl transform translate-x-1/3 -translate-y-1/2"></div>
                                                <div className="bg-red-100 p-3 rounded-full flex-shrink-0 relative z-10">
                                                    <AlertCircle size={32} className="text-red-600 animate-pulse" />
                                                </div>
                                                <div className="relative z-10">
                                                    <h3 className="text-xl font-black text-red-700 uppercase tracking-wider mb-1">
                                                        ACCESS DENIED
                                                    </h3>
                                                    <p className="text-red-800 font-medium">
                                                        This card holder has <strong className="text-red-900 border-b-2 border-red-900">0</strong> service limits remaining. The system is locked and free services cannot be booked.
                                                    </p>
                                                </div>
                                            </div>
                                        </Grid>
                                    )}

                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Merchant & Service Section */}
                    <Grid item size={12}>
                        <Card sx={{ borderLeft: "5px solid #764ba2" }}>
                            <CardHeader
                                title="🏪 Merchant & Service Selection"
                                sx={{
                                    backgroundColor: "#f5f5f5",
                                    borderBottom: "2px solid #764ba2",
                                }}
                            />
                            <CardContent>
                                <Grid container spacing={2}>
                                    {/* Merchant Autocomplete */}
                                    <Grid item size={6}>
                                        <Controller
                                            name="merchantId"
                                            control={control}
                                            render={({ field }) => (
                                                <Autocomplete
                                                    {...field}
                                                    options={merchantOptions}
                                                    getOptionLabel={(option) =>
                                                        typeof option === "string" ? option : option.label || ""
                                                    }
                                                    onChange={(event, value) => {
                                                        field.onChange(value?.id || "");
                                                        setSelectedMerchant(value);
                                                    }}
                                                    value={selectedMerchant}
                                                    loading={loadingMerchant}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            label="Select Merchant"
                                                            placeholder="Search by name..."
                                                            error={!!errors.merchantId}
                                                            helperText={errors.merchantId?.message}
                                                        />
                                                    )}
                                                    noOptionsText="No merchants found"
                                                    filterOptions={(options, state) => {
                                                        return options.filter((option) =>
                                                            option.label
                                                                .toLowerCase()
                                                                .includes(state.inputValue.toLowerCase())
                                                        );
                                                    }}
                                                />
                                            )}
                                        />
                                    </Grid>

                                    {/* Merchant Contact Info (Read-only) */}
                                    <Grid item size={6}>
                                        <TextField
                                            label="Contact Number"
                                            value={merchantDetails.contactInfo}
                                            fullWidth
                                            disabled
                                            variant="outlined"
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    backgroundColor: "#f9f9f9",
                                                },
                                            }}
                                        />
                                    </Grid>

                                    {/* Merchant Address (Read-only) */}


                                    {/* Service Selection */}
                                    {/* <Grid item size={8}>
                                        <Controller
                                            name="serviceId"
                                            control={control}
                                            render={({ field }) => (
                                                <FormControl
                                                    fullWidth
                                                    error={!!errors.serviceId}
                                                >
                                                    <InputLabel>Select Service</InputLabel>
                                                    <Select
                                                        {...field}
                                                        label="Select Service"
                                                        disabled={services.length === 0}
                                                    >
                                                        {services.map((service) => (
                                                            <MenuItem
                                                                key={service.id}
                                                                value={service.id}
                                                            >
                                                                {service.name} - $
                                                                {service.price.toFixed(2)}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            )}
                                        />
                                        {errors.serviceId && (
                                            <Typography
                                                variant="caption"
                                                sx={{ color: "#d32f2f", mt: 1 }}
                                            >
                                                {errors.serviceId.message}
                                            </Typography>
                                        )}
                                    </Grid> */}

                                    {/* Service Charge (Read-only) */}
                                    <Grid item size={6}>
                                        <TextField
                                            label="Service Charge"
                                            value={merchantDetails.service_charge}
                                            fullWidth
                                            disabled
                                            variant="outlined"
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    backgroundColor: "#f9f9f9",
                                                },
                                            }}
                                        />
                                    </Grid>
                                    <Grid item size={6}>
                                        <TextField
                                            label="Communication Officer Name"
                                            value={merchantDetails.co_name}
                                            fullWidth
                                            disabled
                                            variant="outlined"
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    backgroundColor: "#f9f9f9",
                                                },
                                            }}
                                        />
                                    </Grid>
                                    <Grid item size={6}>
                                        <TextField
                                            label="Communication Officer Email"
                                            value={merchantDetails.co_email}
                                            fullWidth
                                            disabled
                                            variant="outlined"
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    backgroundColor: "#f9f9f9",
                                                },
                                            }}
                                        />
                                    </Grid>
                                    <Grid item size={6}>
                                        <TextField
                                            label="Communication Officer Mobile"
                                            value={merchantDetails.co_mobile}
                                            fullWidth
                                            disabled
                                            variant="outlined"
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    backgroundColor: "#f9f9f9",
                                                },
                                            }}
                                        />
                                    </Grid>
                                    <Grid item size={6}>
                                        <TextField
                                            label="Communication Officer Telephone"
                                            value={merchantDetails.co_telephone}
                                            fullWidth
                                            disabled
                                            variant="outlined"
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    backgroundColor: "#f9f9f9",
                                                },
                                            }}
                                        />
                                    </Grid>
                                    <Grid item size={6}>
                                        <TextField
                                            label="Communication Officer Extension"
                                            value={merchantDetails.co_extension}
                                            fullWidth
                                            disabled
                                            variant="outlined"
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    backgroundColor: "#f9f9f9",
                                                },
                                            }}
                                        />
                                    </Grid>
                                    <Grid item size={12}>
                                        <TextField
                                            label="Merchant Address"
                                            value={merchantDetails.address}
                                            fullWidth
                                            disabled
                                            variant="outlined"
                                            multiline
                                            rows={2}
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    backgroundColor: "#f9f9f9",
                                                },
                                            }}
                                        />
                                    </Grid>

                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Logistics & Scheduling Section */}
                    <Grid item size={12}>
                        <Card sx={{ borderLeft: "5px solid #00bcd4" }}>
                            <CardHeader
                                title="📅 Scheduling"
                                sx={{
                                    backgroundColor: "#f5f5f5",
                                    borderBottom: "2px solid #00bcd4",
                                }}
                            />
                            <CardContent>
                                <Grid container spacing={2}>
                                    {/* Requested Pick-up Time */}
                                    <Grid item size={6}>
                                        <Controller
                                            name="pickupDateTime"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    label="Requested Pick-up Time"
                                                    type="datetime-local"
                                                    fullWidth
                                                    InputLabelProps={{ shrink: true }}
                                                    error={!!errors.pickupDateTime}
                                                    helperText={errors.pickupDateTime?.message}
                                                />
                                            )}
                                        />
                                    </Grid>

                                    {/* Expected Drop-off Time */}
                                    <Grid item size={6}>
                                        <Controller
                                            name="dropoffDateTime"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    label="Expected Drop-off Time"
                                                    type="datetime-local"
                                                    fullWidth
                                                    InputLabelProps={{ shrink: true }}
                                                    error={!!errors.dropoffDateTime}
                                                    helperText={errors.dropoffDateTime?.message}
                                                />
                                            )}
                                        />
                                    </Grid>

                                    {/* Custom Pick-up Address */}
                                    <Grid item size={6}>
                                        <Controller
                                            name="pickupAddress"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    label="Enter Pick-up Address"
                                                    fullWidth
                                                    multiline
                                                    rows={2}
                                                    placeholder="Street address, city, zip..."
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid item size={6}>
                                        <Controller
                                            name="dropoffAddress"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    label="Enter Drop-off Address"
                                                    fullWidth
                                                    multiline
                                                    rows={2}
                                                    placeholder="Street address, city, zip..."
                                                />
                                            )}
                                        />
                                    </Grid>

                                    {/* Special Instructions */}
                                    <Grid item size={12}>
                                        <Controller
                                            name="specialInstructions"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    label="Special Instructions (Optional)"
                                                    placeholder="e.g., Gate code is 1234, Handle with care, Leave at door..."
                                                    fullWidth
                                                    multiline
                                                    rows={3}
                                                />
                                            )}
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Info Alert */}
                    <Grid item xs={12}>
                        <Alert
                            severity="info"
                            icon={<AlertCircle size={20} />}
                            sx={{
                                borderRadius: 1,
                                backgroundColor: "#e3f2fd",
                                color: "#1565c0",
                                border: "1px solid #90caf9",
                            }}
                        >
                            All information will be stored for accounting and tracking purposes.
                            Customers will receive a confirmation email with ticket details.
                        </Alert>
                    </Grid>

                    {/* Submit Buttons */}
                    <Grid item xs={12}>
                        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", flexWrap: "wrap" }}>
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    reset();
                                    setSelectedCardHolder(null);
                                    setSelectedMerchant(null);
                                    setCardHolderDetails({
                                        cardNumber: "",
                                        phoneNumber: "",
                                        email: "",
                                        cardType: "",
                                        address: "",
                                    });
                                    setMerchantDetails({ address: "", contactInfo: "" });
                                    setServices([]);
                                    setServiceCharge(0);
                                    setSelectedService(null);
                                }}
                                sx={{
                                    px: 3,
                                    textTransform: "none",
                                    fontWeight: 600,
                                    borderColor: "#ccc",
                                    color: "#333",
                                    "&:hover": {
                                        borderColor: "#999",
                                        backgroundColor: "#fafafa",
                                    }
                                }}
                            >
                                Clear Form
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={selectedCardHolder && cardHolderDetails.pick_limit === 0}
                                sx={{
                                    px: 4,
                                    textTransform: "none",
                                    fontWeight: 600,
                                    background: selectedCardHolder && cardHolderDetails.pick_limit === 0 ? "#ccc" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                    boxShadow: selectedCardHolder && cardHolderDetails.pick_limit === 0 ? "none" : "0 4px 12px rgba(102, 126, 234, 0.4)",
                                    "&:hover": {
                                        boxShadow: selectedCardHolder && cardHolderDetails.pick_limit === 0 ? "none" : "0 6px 16px rgba(102, 126, 234, 0.6)",
                                        background: selectedCardHolder && cardHolderDetails.pick_limit === 0 ? "#ccc" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                    },
                                }}
                            >
                                Create Service Ticket
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </form>
        </Box>
    );
}