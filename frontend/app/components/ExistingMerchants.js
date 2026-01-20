"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
// MUI Core Components
import {
    Button,
    CardContent,
    CardHeader,
    TextField,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Box,
    IconButton,
    InputAdornment,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Grid,
} from "@mui/material"

// MUI Icons
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"
import SearchIcon from "@mui/icons-material/Search"
import CloseIcon from "@mui/icons-material/Close"

// Lucide-react Icon (used in table)
import { useRouter } from "next/navigation"
import { ViewIcon } from "lucide-react"
import Link from "next/link"

// Zod schema duplicated/adapted for Edit Modal
const merchantFormSchema = z.object({
    name: z.string().min(2, "Name is required."),
    address: z.string().min(5, "Address is required."),
    mobile: z.string().min(10, "Mobile number is required."),
    email: z.string().email("Invalid email address."),
    password: z.string().min(6, "Password must be at least 6 characters."),
    account_number: z.string().optional(),
    store_details: z.string().optional(),
    account_name: z.string().optional(),
    branch_name: z.string().optional(),
    routing_number: z.string().optional(),
    payment_method: z.string().optional(),
    officer_name: z.string().optional(),
    officer_nickname: z.string().optional(),
    officer_mobile: z.string().optional(),
    officer_email: z.string().email("Invalid email.").optional().or(z.literal("")),
    officer_telephone: z.string().optional(),
    officer_extension: z.string().optional(),
})

export default function ExistingMerchants({ refreshTrigger }) {
    const [merchants, setMerchants] = useState([])
    const [editingMerchant, setEditingMerchant] = useState(null)
    const [deleteDialog, setDeleteDialog] = useState({ open: false, merchantId: null, merchantName: "" })
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        const fetchMerchants = async () => {
            try {
                // console.log("Fetching merchants from API...");
                const response = await fetch("http://localhost:5000/merchants")
                if (!response.ok) throw new Error("Failed to fetch merchants")
                const data = await response.json()
                setMerchants(data)
            } catch (err) {
                toast.error("Error fetching data", {
                    description: err.message,
                })
            }
        }
        fetchMerchants()
    }, [refreshTrigger]) // Refetch when triggered

    const handleEditMerchant = (merchant) => {
        setEditingMerchant(merchant)
    }

    const handleEditComplete = (updateData) => {
        const updatedMerchant = updateData.data || updateData;
        if (updatedMerchant) {
            setMerchants((prevMerchants) => prevMerchants.map((m) => (m.id === updatedMerchant.id ? updatedMerchant : m)))
        }
        setEditingMerchant(null)
    }

    const handleOpenDeleteDialog = (merchantId, merchantName) => {
        setDeleteDialog({ open: true, merchantId, merchantName })
    }

    const handleConfirmDelete = async () => {
        if (!deleteDialog.merchantId) return

        setIsDeleting(true)
        try {
            const response = await fetch(`https://api.reward.smartemi.info/merchants/${deleteDialog.merchantId}`, { method: "DELETE" })
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || "Failed to delete merchant")
            }
            setMerchants((prev) => prev.filter((m) => m.id !== deleteDialog.merchantId))
            toast.success("Success!", { description: "Merchant deleted successfully." })
            setDeleteDialog({ open: false, merchantId: null, merchantName: "" })
        } catch (err) {
            toast.error("Error", { description: err.message })
        } finally {
            setIsDeleting(false)
        }
    }

    const handleCancelDelete = () => {
        setDeleteDialog({ open: false, merchantId: null, merchantName: "" })
    }

    return (
        <>
            <MerchantsTable merchants={merchants} onEdit={handleEditMerchant} onDelete={handleOpenDeleteDialog} />
            <EditMerchantModal
                open={!!editingMerchant}
                merchant={editingMerchant}
                onClose={() => setEditingMerchant(null)}
                onEditComplete={handleEditComplete}
            />
            <DeleteConfirmationDialog
                open={deleteDialog.open}
                merchantName={deleteDialog.merchantName}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                isLoading={isDeleting}
            />
        </>
    )
}

function MerchantsTable({ merchants, onEdit, onDelete }) {
    const [searchQuery, setSearchQuery] = useState("")
    const router = useRouter();
    const filteredMerchants = merchants.filter((merchant) => {
        const query = searchQuery.toLowerCase()
        return (
            merchant.id?.toString().toLowerCase().includes(query) ||
            (merchant.email || "").toLowerCase().includes(query) ||
            (merchant.mobile || "").toLowerCase().includes(query) ||
            (merchant.account_number || "").toLowerCase().includes(query)
        )
    })

    return (
        <div sx={{ borderRadius: 3, boxShadow: 6 }} className="p-5">
            {/* <CardHeader title={<Typography variant="h6" fontWeight="bold" sx={{ color: '#333' }}>Existing Merchants</Typography>} /> */}
            <div className="flex justify-between items-center p-5">
                <p className="text-lg font-semibold text-black">Existing Merchants</p>
                <Link href="/pick-drop/all-merchants/merchant" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Add New Merchant</Link>
            </div>
            <Box sx={{ px: 3, pb: 2 }}>
                <TextField
                    fullWidth
                    placeholder="Search by ID, email, mobile, or account..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                        sx: { borderRadius: 2, background: '#f5f5f5' }
                    }}
                />
            </Box>
            <CardContent sx={{ pt: 0 }}>
                <TableContainer component={Paper} sx={{ borderRadius: 2, overflowX: 'auto' }}>
                    <Table sx={{ minWidth: 800 }} aria-label="merchants table">
                        <TableHead sx={{ bgcolor: 'action.hover' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Mobile</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Account Number</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredMerchants.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">
                                        <Typography color="text.secondary" sx={{ py: 2 }}>
                                            {merchants.length === 0 ? "No merchants found." : "No merchants match your search criteria."}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredMerchants.map((merchant) => (
                                    <TableRow
                                        key={merchant.id}
                                        hover
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell>{merchant.id}</TableCell>
                                        <TableCell sx={{ fontWeight: "medium" }}>{merchant.name}</TableCell>
                                        <TableCell>{merchant.email}</TableCell>
                                        <TableCell>{merchant.mobile}</TableCell>
                                        <TableCell>{merchant.account_number}</TableCell>
                                        <TableCell align="center">
                                            <Stack direction="row" spacing={0.5} justifyContent="center">
                                                <IconButton
                                                    size="small"
                                                    aria-label="view"
                                                    onClick={() => router.push(`/pick-drop/all-merchants/merchant/${merchant.id}`)}
                                                    sx={{ color: 'primary.main' }}
                                                >
                                                    <ViewIcon size={18} />
                                                </IconButton>
                                                <IconButton size="small" onClick={() => onEdit(merchant)} aria-label="edit">
                                                    <EditIcon sx={{ fontSize: 18 }} />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => onDelete(merchant.id, merchant.name)}
                                                    aria-label="delete"
                                                    color="error"
                                                >
                                                    <DeleteIcon sx={{ fontSize: 18 }} />
                                                </IconButton>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>
        </div>
    )
}

function DeleteConfirmationDialog({ open, merchantName, onConfirm, onCancel, isLoading }) {
    return (
        <Dialog open={open} onClose={onCancel}>
            <DialogTitle>Delete Merchant?</DialogTitle>
            <DialogContent>
                <Typography>
                    Are you sure you want to delete <strong>{merchantName}</strong>? This action cannot be undone.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel} disabled={isLoading}>
                    Cancel
                </Button>
                <Button onClick={onConfirm} color="error" variant="contained" disabled={isLoading}>
                    {isLoading ? "Deleting..." : "Delete"}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

function EditMerchantModal({ open, merchant, onClose, onEditComplete }) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const editFormSchema = merchantFormSchema.extend({
        password: z.string().optional(),
        agreement_paper: z.any().optional(),
    });

    const form = useForm({
        resolver: zodResolver(editFormSchema),
        defaultValues: {
            name: "",
            address: "",
            mobile: "",
            email: "",
            account_number: "",
            store_details: "",
            password: "",
        },
    })

    useEffect(() => {
        if (merchant && open) {
            form.reset({
                name: merchant.name,
                address: merchant.address,
                mobile: merchant.mobile,
                email: merchant.email,
                account_number: merchant.account_number,
                store_details: merchant.store_details,
                password: "",
                agreement_paper: null,
            })
        }
    }, [merchant, open, form])

    async function onSubmit(values) {
        if (!merchant) return;
        setIsSubmitting(true);
        const formData = new FormData();
        Object.keys(values).forEach((key) => {
            if (key === "agreement_paper") return;
            if (key === "password" && !values[key]) return;
            formData.append(key, values[key]);
        });
        if (values.agreement_paper && values.agreement_paper.length > 0) {
            formData.append("agreement_paper", values.agreement_paper[0]);
        }

        try {
            const response = await fetch(`https://api.reward.smartemi.info/merchants/${merchant.id}`, {
                method: "PUT",
                body: formData,
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Failed to update merchant");
            onEditComplete(result.data || values);
            toast.success("Merchant updated successfully!");
            onClose();
        } catch (err) {
            toast.error("Update Error", { description: err.message });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h6" fontWeight="bold">Edit Merchant: {merchant?.name}</Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="name"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <TextField
                                        {...field}
                                        label="Merchant Name"
                                        fullWidth
                                        size="small"
                                        error={!!fieldState.error}
                                        helperText={fieldState.error?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="email"
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
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="mobile"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <TextField
                                        {...field}
                                        label="Mobile"
                                        fullWidth
                                        size="small"
                                        error={!!fieldState.error}
                                        helperText={fieldState.error?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="password"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <TextField
                                        {...field}
                                        type="password"
                                        label="New Password (Leave blank to keep existing)"
                                        fullWidth
                                        size="small"
                                        error={!!fieldState.error}
                                        helperText={fieldState.error?.message || "Only fill if you want to change the password."}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="address"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <TextField
                                        {...field}
                                        label="Address"
                                        fullWidth
                                        size="small"
                                        error={!!fieldState.error}
                                        helperText={fieldState.error?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="account_number"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <TextField
                                        {...field}
                                        label="Account Number"
                                        fullWidth
                                        size="small"
                                        error={!!fieldState.error}
                                        helperText={fieldState.error?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="store_details"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <TextField
                                        {...field}
                                        label="Store Details"
                                        fullWidth
                                        multiline
                                        rows={3}
                                        size="small"
                                        error={!!fieldState.error}
                                        helperText={fieldState.error?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Box>
                                <Typography variant="caption" display="block" sx={{ mb: 1, color: 'text.secondary' }}>
                                    Current Agreement PDF: {merchant?.agreementPdfUrl ? 'Uploaded' : 'None'}
                                </Typography>
                                <Controller
                                    name="agreement_paper"
                                    control={form.control}
                                    render={({ field }) => (
                                        <TextField
                                            type="file"
                                            fullWidth
                                            size="small"
                                            inputProps={{ accept: "application/pdf" }}
                                            onChange={(e) => field.onChange(e.target.files)}
                                            helperText="Upload new agreement paper (Optional, PDF only)"
                                        />
                                    )}
                                />
                            </Box>
                        </Grid>
                    </Grid>
                    <DialogActions sx={{ mt: 3, p: 0 }}>
                        <Button onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained" disabled={isSubmitting}>
                            {isSubmitting ? <CircularProgress size={20} color="inherit" /> : "Save Changes"}
                        </Button>
                    </DialogActions>
                </form>
            </DialogContent>
        </Dialog>
    )
}
