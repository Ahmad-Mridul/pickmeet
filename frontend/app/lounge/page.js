import { CreditCard, Store, Ticket } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "Meet & Greet",
    description: "Meet & Greet Service",
}

const Lounge = () => {
    const options = [
        {
            title: "View All Card Holders",
            description: "View All Card Holders.",
            icon: CreditCard,
            href: "/all-holders",
            color: "text-blue-600",
            bg: "bg-blue-50",
            hover: "hover:shadow-blue-200"
        },
        {
            title: "Add Card Holder",
            description: "Register a new card holder for Pick & Drop services.",
            icon: CreditCard,
            href: "/register-card-holder",
            color: "text-blue-600",
            bg: "bg-blue-50",
            hover: "hover:shadow-blue-200"
        },
        {
            title: "View All Merchants",
            description: "View All Merchants.",
            icon: CreditCard,
            href: "/all-merchants",
            color: "text-blue-600",
            bg: "bg-blue-50",
            hover: "hover:shadow-blue-200"
        },
        {
            title: "Add Merchant",
            description: "Onboard a new merchant partner to the platform.",
            icon: Store,
            href: "/register-merchant",
            color: "text-purple-600",
            bg: "bg-purple-50",
            hover: "hover:shadow-purple-200"
        },
        {
            title: "Create Service Ticket",
            description: "Raise a new support or service ticket.",
            icon: Ticket,
            href: "/lounge/all-service-tickets",
            color: "text-green-600",
            bg: "bg-green-50",
            hover: "hover:shadow-green-200"
        }
    ];

    return (
        <div className="p-8 min-h-full bg-gray-50">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Meet & Greet Services</h1>
            <p className="text-gray-500 mb-8">Select an action to proceed.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {options.map((option, index) => (
                    <Link
                        key={index}
                        href={option.href}
                        className={`bg-white p-8 rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl ${option.hover} group`}
                    >
                        <div className={`w-16 h-16 rounded-xl ${option.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                            <option.icon size={32} className={option.color} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">{option.title}</h2>
                        <p className="text-gray-500">{option.description}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Lounge;