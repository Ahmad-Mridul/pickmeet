"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
// MUI Core Components
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    Grid,
    TextField,
    Typography,
    Box,
    CircularProgress,
    Divider,
} from "@mui/material"

// MUI Icons
import StorefrontIcon from '@mui/icons-material/Storefront';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

import { usePathname } from "next/navigation"

// Zod schema remains the same
const merchantFormSchema = z.object({
    name: z.string().min(2, "Name is required."),
    address: z.string().min(5, "Address is required."),
    mobile: z.string().min(10, "Mobile number is required."),
    email: z.string().email("Invalid email address."),
    password: z.string().min(6, "Password must be at least 6 characters."),
    account_number: z.string().optional(),
    store_details: z.string().optional(),
    // New Fields (Optional but good to validate if provided)
    account_name: z.string().optional(),
    branch_name: z.string().optional(),
    routing_number: z.string().optional(),
    payment_method: z.string().optional(),
    // Communication Officer Fields
    officer_name: z.string().optional(),
    officer_nickname: z.string().optional(),
    officer_mobile: z.string().optional(),
    officer_email: z.string().email("Invalid email.").optional().or(z.literal("")),
    officer_telephone: z.string().optional(),
    officer_extension: z.string().optional(),
})

export default function MerchantForm({ onMerchantAdded }) {
    const pathname = usePathname();
    const isMerchantPage = pathname === '/pick-drop/merchant';
    const [agreementFile, setAgreementFile] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const form = useForm({
        resolver: zodResolver(merchantFormSchema),
        defaultValues: {
            name: "",
            address: "",
            mobile: "",
            email: "",
            password: "",
            account_number: "",
            store_details: "",
            account_name: "",
            branch_name: "",
            routing_number: "",
            payment_method: "",
            officer_name: "",
            officer_nickname: "",
            officer_mobile: "",
            officer_email: "",
            officer_telephone: "",
            officer_extension: "",
        },
    })

    async function onSubmit(values) {
        setIsSubmitting(true)
        const formData = new FormData()

        // Append Merchant Fields
        const merchantFields = [
            "name", "address", "mobile", "email", "password",
            "account_number", "store_details",
            "account_name", "branch_name", "routing_number", "payment_method"
        ];

        merchantFields.forEach((key) => {
            if (values[key] !== undefined && values[key] !== null) {
                formData.append(key, values[key])
            }
        })

        // Append Role
        formData.append("role", "merchant");

        // Map and Append Communication Officer Fields
        if (values.officer_name !== undefined) formData.append("co_name", values.officer_name);
        if (values.officer_nickname !== undefined) formData.append("co_nickname", values.officer_nickname);
        if (values.officer_mobile !== undefined) formData.append("co_mobile", values.officer_mobile);
        if (values.officer_email !== undefined) formData.append("co_email", values.officer_email);
        if (values.officer_telephone !== undefined) formData.append("co_telephone", values.officer_telephone);
        if (values.officer_extension !== undefined) formData.append("co_extension", values.officer_extension);

        if (agreementFile) {
            formData.append("agreement_url", agreementFile)
        }

        try {
            // Log FormData entries for debugging
            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }

            // 1. Register Merchant
            const response = await fetch("http://localhost:5000/register/merchant", {
                method: "POST",
                body: formData,
            })

            if (!response.ok) {
                const contentType = response.headers.get("content-type");
                let errorData;
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    errorData = await response.json();
                } else {
                    const text = await response.text();
                    errorData = { error: text || "Server returned " + response.status };
                }
                console.error("Registration Error:", errorData);
                throw new Error(errorData.error || errorData.message || JSON.stringify(errorData));
            }

            const merchantResult = await response.json()


            if (onMerchantAdded) {
                onMerchantAdded(merchantResult)
            }
            toast.success("Success!", {
                description: "Merchant and details saved successfully.",
            })
            form.reset()
            setAgreementFile(null)
        } catch (err) {
            toast.error("Error", {
                description: err.message,
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex items-center justify-center">
            <Card sx={{
                borderRadius: 3,
                boxShadow: 6,
                borderLeft: '4px solid #1976d2'
            }}>
                <CardHeader
                    avatar={<AddCircleOutlineIcon color="primary" />}
                    title={<Typography variant="h6" fontWeight="bold">Register New Merchant</Typography>}
                    subheader="Fill out all required details and upload the agreement document (optional)."
                />
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <Grid container spacing={2}>
                            {/* Section 1: Identity & Security */}
                            <Grid item size={12}>
                                <Typography variant="subtitle2" color="primary" fontWeight="bold" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.75rem', mt: 1 }}>
                                    Identity & Security
                                </Typography>
                                <Divider sx={{ my: 1 }} />
                            </Grid>

                            {/* Name */}
                            <Grid item size={6}>
                                <Controller
                                    name="name"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <TextField
                                            {...field}
                                            label="Merchant Name"
                                            fullWidth
                                            size="small"
                                            variant="outlined"
                                            error={!!fieldState.error}
                                            helperText={fieldState.error?.message}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                                        />
                                    )}
                                />
                            </Grid>

                            {/* Email */}
                            <Grid item size={6}>
                                <Controller
                                    name="email"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <TextField
                                            {...field}
                                            label="Email Address"
                                            fullWidth
                                            size="small"
                                            variant="outlined"
                                            error={!!fieldState.error}
                                            helperText={fieldState.error?.message}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                                        />
                                    )}
                                />
                            </Grid>

                            {/* Mobile */}
                            <Grid item size={6}>
                                <Controller
                                    name="mobile"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <TextField
                                            {...field}
                                            label="Mobile Number"
                                            fullWidth
                                            size="small"
                                            variant="outlined"
                                            error={!!fieldState.error}
                                            helperText={fieldState.error?.message}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                                        />
                                    )}
                                />
                            </Grid>

                            {/* Password */}
                            <Grid item size={6}>
                                <Controller
                                    name="password"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <TextField
                                            {...field}
                                            type="password"
                                            label="Password"
                                            fullWidth
                                            size="small"
                                            variant="outlined"
                                            error={!!fieldState.error}
                                            helperText={fieldState.error?.message}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                                        />
                                    )}
                                />
                            </Grid>

                            {/* Section 2: Business & Financial Information */}
                            <Grid item size={12}>
                                <Typography variant="subtitle2" color="primary" fontWeight="bold" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.75rem', mt: 2 }}>
                                    Business Address
                                </Typography>
                                <Divider sx={{ my: 1 }} />
                            </Grid>

                            {/* Address */}
                            <Grid item size={12}>
                                <Controller
                                    name="address"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <TextField
                                            {...field}
                                            placeholder="Head Office Address"
                                            fullWidth
                                            size="small"
                                            variant="outlined"
                                            error={!!fieldState.error}
                                            helperText={fieldState.error?.message}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                                        />
                                    )}
                                />
                            </Grid>



                            <Grid item size={12}>
                                <Typography variant="subtitle2" color="primary" fontWeight="bold" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.75rem', mt: 2 }}>
                                    Communication Officer
                                </Typography>
                                <Divider sx={{ my: 1 }} />
                            </Grid>

                            {/* Officer Name */}
                            <Grid item size={6}>
                                <Controller
                                    name="officer_name"
                                    control={form.control}
                                    render={({ field }) => (
                                        <TextField {...field} label="Officer Name" fullWidth size="small" />
                                    )}
                                />
                            </Grid>
                            {/* Officer Nickname */}
                            <Grid item size={6}>
                                <Controller
                                    name="officer_nickname"
                                    control={form.control}
                                    render={({ field }) => (
                                        <TextField {...field} label="Nickname" fullWidth size="small" />
                                    )}
                                />
                            </Grid>
                            {/* Officer Mobile */}
                            <Grid item size={6}>
                                <Controller
                                    name="officer_mobile"
                                    control={form.control}
                                    render={({ field }) => (
                                        <TextField {...field} label="Mobile" fullWidth size="small" />
                                    )}
                                />
                            </Grid>
                            {/* Officer Email */}
                            <Grid item size={6}>
                                <Controller
                                    name="officer_email"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <TextField
                                            {...field}
                                            label="Email"
                                            fullWidth
                                            size="small"
                                            error={!!fieldState.error}
                                            helperText={fieldState.error?.message}
                                        />
                                    )}
                                />
                            </Grid>
                            {/* Officer Telephone */}
                            <Grid item size={6}>
                                <Controller
                                    name="officer_telephone"
                                    control={form.control}
                                    render={({ field }) => (
                                        <TextField {...field} label="Telephone" fullWidth size="small" />
                                    )}
                                />
                            </Grid>
                            {/* Officer Extension */}
                            <Grid item size={6}>
                                <Controller
                                    name="officer_extension"
                                    control={form.control}
                                    render={({ field }) => (
                                        <TextField {...field} label="Extension" fullWidth size="small" />
                                    )}
                                />
                            </Grid>

                            {/* Payment Method - Hidden on Merchant Page */}
                            {!isMerchantPage && (
                                <>
                                    <Grid item size={12}>
                                        <Typography variant="subtitle2" color="primary" fontWeight="bold" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.75rem', mt: 2 }}>
                                            Payment Method
                                        </Typography>
                                        <Divider sx={{ my: 1 }} />
                                    </Grid>

                                    {/* Payment Method Dropdown */}
                                    <Grid item size={12}>
                                        <Controller
                                            name="payment_method"
                                            control={form.control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    select
                                                    label="Payment Method"
                                                    fullWidth
                                                    size="small"
                                                    SelectProps={{ native: true }}
                                                >
                                                    <option value=""></option>
                                                    <option value="Account Pay">Account Pay</option>
                                                    <option value="BFTN">BFTN</option>
                                                </TextField>
                                            )}
                                        />
                                    </Grid>
                                </>
                            )}


                            {/* Financial Information - Hidden on Merchant Page */}
                            <Grid item size={12}>
                                <Typography variant="subtitle2" color="primary" fontWeight="bold" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.75rem', mt: 2 }}>
                                    Financial Information
                                </Typography>
                                <Divider sx={{ my: 1 }} />
                            </Grid>

                            {/* Account Name */}
                            <Grid item size={6}>
                                <Controller
                                    name="account_name"
                                    control={form.control}
                                    render={({ field }) => (
                                        <TextField {...field} label="Account Name" fullWidth size="small" />
                                    )}
                                />
                            </Grid>
                            {/* Branch Name */}
                            <Grid item size={6}>
                                <Controller
                                    name="branch_name"
                                    control={form.control}
                                    render={({ field }) => (
                                        <TextField {...field} label="Branch Name" fullWidth size="small" />
                                    )}
                                />
                            </Grid>
                            {/* Routing Number */}
                            <Grid item size={6}>
                                <Controller
                                    name="routing_number"
                                    control={form.control}
                                    render={({ field }) => (
                                        <TextField {...field} label="Routing Number" fullWidth size="small" />
                                    )}
                                />
                            </Grid>


                            {/* Account Number */}
                            <Grid item size={6}>
                                <Controller
                                    name="account_number"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <TextField
                                            {...field}
                                            label="Bank Account Number"
                                            fullWidth
                                            size="small"
                                            variant="outlined"
                                            error={!!fieldState.error}
                                            helperText={fieldState.error?.message}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                                        />
                                    )}
                                />
                            </Grid>

                            {/* Section 3: Documentation */}
                            <Grid item size={12}>
                                <Typography variant="subtitle2" color="primary" fontWeight="bold" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.75rem', mt: 2 }}>
                                    Documentation
                                </Typography>
                                <Divider sx={{ my: 1 }} />
                            </Grid>

                            {/* Agreement Upload */}
                            <Grid item size={12}>
                                <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 2, bgcolor: '#fafafa' }}>
                                    <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                                        Upload Agreement PDF (Optional)
                                    </Typography>
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        onChange={(e) => setAgreementFile(e.target.files ? e.target.files[0] : null)}
                                        style={{ display: 'block', width: '100%', padding: '8px 0' }}
                                    />
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                        {agreementFile ? `Selected: ${agreementFile.name}` : "Max 10MB PDF file."}
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>

                        {/* Submit Button */}
                        <Grid container justifyContent="flex-end" sx={{ mt: 3 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={isSubmitting}
                                startIcon={
                                    isSubmitting ? (
                                        <CircularProgress size={20} color="inherit" />
                                    ) : (
                                        <StorefrontIcon />
                                    )
                                }
                                sx={{ borderRadius: 2, minWidth: 200 }}
                            >
                                {isSubmitting ? "Processing..." : "Save Merchant"}
                            </Button>
                        </Grid>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}