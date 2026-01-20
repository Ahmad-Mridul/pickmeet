"use client";

import { useState } from "react";
import MerchantForm from "@/app/components/MerchantForm";
import ExistingMerchants from "@/app/components/ExistingMerchants";
import Link from "next/link";
import { Storefront as StorefrontIcon } from '@mui/icons-material';
import { Container, Stack, Grid } from "@mui/material";

export default function Merchant() {
    const [refreshKey, setRefreshKey] = useState(0);

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    return (
        <Container sx={{ my: 4 }}>
            <Stack spacing={4}>
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <StorefrontIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: 30, color: '#333' }} />
                        <h1 className="text-3xl font-bold text-gray-800">Manage Merchants</h1>
                    </div>
                    <div>
                        <Link href="/pick-drop/all-merchants" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            View All Merchants
                        </Link>
                    </div>
                </div>
                <Grid container spacing={4}>
                    <Grid item xs={12} lg={4}>
                        <MerchantForm onMerchantAdded={handleRefresh} />
                    </Grid>
                    {/* <Grid item xs={12} lg={8}>
                        <ExistingMerchants refreshTrigger={refreshKey} />
                    </Grid> */}
                </Grid>
            </Stack>
        </Container>
    );
}