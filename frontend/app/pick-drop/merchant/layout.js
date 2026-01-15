export const metadata = {
    title: "Manage Merchants",
    description: "Merchants",
}
export default function MerchantLayout({ children }) {
    return (
        <div className="bg-white min-h-full">
            {children}
        </div>
    );
}